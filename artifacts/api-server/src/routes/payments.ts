import { Router, Request, Response } from "express";
import { db } from "../db.js";
import { payments, members, welfareCampaigns } from "../shared/schema.js";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const pesapalBaseUrl = (env: string) =>
  env === "live" ? "https://pay.pesapal.com/v3" : "https://cybqa.pesapal.com/pesapalv3";

async function getPesapalToken() {
  const env = process.env.PESAPAL_ENV || "live";
  const r = await fetch(`${pesapalBaseUrl(env)}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
    }),
    signal: AbortSignal.timeout(8000),
  });
  const j = (await r.json()) as any;
  if (!j.token) throw new Error(`Pesapal auth failed: ${JSON.stringify(j)}`);
  return j.token as string;
}

function getAppBase(req: Request) {
  return (
    process.env.APP_BASE_URL ||
    `https://${(process.env.REPLIT_DOMAINS || "").split(",")[0]?.trim() || req.get("host")}`
  );
}

let cachedIpnId: string | null = null;

async function resolveIpnId(req: Request): Promise<string> {
  const fromEnv = (process.env.PESAPAL_IPN_ID || "").trim();
  if (UUID_RE.test(fromEnv)) return fromEnv;
  if (cachedIpnId && UUID_RE.test(cachedIpnId)) return cachedIpnId;

  const env = process.env.PESAPAL_ENV || "live";
  const token = await getPesapalToken();
  const ipnUrl = `${getAppBase(req)}/api/payments/ipn`;

  // Look for an existing IPN matching our URL.
  try {
    const list = (await fetch(`${pesapalBaseUrl(env)}/api/URLSetup/GetIpnList`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    }).then((r) => r.json())) as any;
    if (Array.isArray(list)) {
      const match = list.find(
        (x: any) => typeof x?.url === "string" && x.url === ipnUrl && x?.ipn_id
      );
      if (match?.ipn_id) {
        cachedIpnId = match.ipn_id;
        return match.ipn_id;
      }
      const anyActive = list.find(
        (x: any) =>
          x?.ipn_id &&
          typeof x.url === "string" &&
          x.url.includes("/api/payments/ipn") &&
          x.ipn_status === 1
      );
      if (anyActive?.ipn_id) {
        cachedIpnId = anyActive.ipn_id;
        return anyActive.ipn_id;
      }
    }
  } catch {
    // fall through to register
  }

  // Register a fresh IPN for this domain.
  const reg = (await fetch(`${pesapalBaseUrl(env)}/api/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ url: ipnUrl, ipn_notification_type: "GET" }),
    signal: AbortSignal.timeout(8000),
  }).then((r) => r.json())) as any;

  if (!reg?.ipn_id) {
    throw new Error(`Could not register IPN with Pesapal: ${JSON.stringify(reg)}`);
  }
  cachedIpnId = reg.ipn_id;
  return reg.ipn_id;
}

router.post("/create", async (req: Request, res: Response) => {
  let merchantRef: string | null = null;
  try {
    const {
      purpose,
      memberId,
      campaignId,
      amount,
      payerName,
      payerPhone,
      payerEmail,
      description,
    } = req.body;

    // Validation
    if (!purpose || !amount || !payerName || !payerPhone) {
      return res.status(400).json({ error: "Missing required fields: purpose, amount, payerName, payerPhone" });
    }
    
    if (typeof amount !== "number" || amount < 1 || amount > 10000000) {
      return res.status(400).json({ error: "Invalid amount. Must be between 1 and 10,000,000 KES." });
    }

    if (!process.env.PESAPAL_CONSUMER_KEY || !process.env.PESAPAL_CONSUMER_SECRET) {
      console.error("Pesapal credentials missing");
      return res.status(500).json({
        error: "Payment service is not configured. Please contact admin.",
      });
    }

    const env = process.env.PESAPAL_ENV || "live";
    const appBase = getAppBase(req);
    merchantRef = crypto.randomUUID();

    // Get IPN ID with error handling
    let ipnId: string;
    try {
      ipnId = await resolveIpnId(req);
    } catch (ipnErr: any) {
      console.error("IPN registration error:", ipnErr?.message);
      return res.status(500).json({ error: "Failed to setup payment webhook. Please try again." });
    }

    // Create payment record
    try {
      await db
        .insert(payments)
        .values({
          purpose,
          memberId: memberId || null,
          campaignId: campaignId || null,
          payerName,
          payerPhone,
          payerEmail: payerEmail || null,
          amount: String(amount),
          currency: "KES",
          merchantReference: merchantRef,
          status: "PENDING",
        })
        .returning();
    } catch (dbErr: any) {
      console.error("Database error creating payment:", dbErr?.message);
      return res.status(500).json({ error: "Failed to create payment record. Please try again." });
    }

    // Get Pesapal token
    let token: string;
    try {
      token = await getPesapalToken();
    } catch (tokenErr: any) {
      console.error("Pesapal token error:", tokenErr?.message);
      // Mark payment as failed
      await db
        .update(payments)
        .set({ status: "FAILED", rawCallback: { error: "Token acquisition failed" } })
        .where(eq(payments.merchantReference, merchantRef))
        .catch(console.error);
      return res.status(503).json({ error: "Payment service unavailable. Please try again in a moment." });
    }

    // Submit order to Pesapal
    let orderRes: any;
    try {
      orderRes = await fetch(`${pesapalBaseUrl(env)}/api/Transactions/SubmitOrderRequest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: merchantRef,
          currency: "KES",
          amount: Number(amount),
          description:
            description ||
            (purpose === "membership" ? "KUWESA Membership Fee" : "KUWESA Welfare Contribution"),
          callback_url: `${appBase}/payment/success?ref=${merchantRef}`,
          cancellation_url: `${appBase}/payment/cancelled?ref=${merchantRef}`,
          notification_id: ipnId,
          billing_address: {
            email_address: payerEmail || undefined,
            phone_number: payerPhone,
            first_name: payerName.split(" ")[0] || payerName,
            last_name: payerName.split(" ").slice(1).join(" ") || "-",
          },
        }),
        signal: AbortSignal.timeout(12000),
      });
    } catch (fetchErr: any) {
      console.error("Pesapal order submission error:", fetchErr?.message);
      // Mark payment as failed
      await db
        .update(payments)
        .set({ status: "FAILED", rawCallback: { error: fetchErr?.message } })
        .where(eq(payments.merchantReference, merchantRef))
        .catch(console.error);
      return res.status(503).json({ error: "Payment gateway error. Please try again." });
    }

    // Parse response
    let orderJson: any;
    try {
      orderJson = await orderRes.json();
    } catch (parseErr: any) {
      console.error("Pesapal response parse error:", parseErr?.message);
      // Mark payment as failed
      await db
        .update(payments)
        .set({ status: "FAILED", rawCallback: { error: "Response parsing failed" } })
        .where(eq(payments.merchantReference, merchantRef))
        .catch(console.error);
      return res.status(502).json({ error: "Payment gateway communication error. Please try again." });
    }

    // Check for redirect URL
    if (!orderJson?.redirect_url) {
      console.error("No redirect URL from Pesapal:", orderJson);
      // Mark payment as failed
      await db
        .update(payments)
        .set({ status: "FAILED", rawCallback: orderJson })
        .where(eq(payments.merchantReference, merchantRef))
        .catch(console.error);
      
      // Return appropriate error based on Pesapal response
      const pesapalError = orderJson?.error_description || orderJson?.error || "Unknown error";
      return res.status(400).json({ error: `Payment request rejected: ${pesapalError}` });
    }

    // Update with tracking ID
    try {
      await db
        .update(payments)
        .set({
          pesapalTrackingId: orderJson.order_tracking_id,
          pesapalRedirectUrl: orderJson.redirect_url,
        })
        .where(eq(payments.merchantReference, merchantRef));
    } catch (updateErr: any) {
      console.error("Error updating payment tracking:", updateErr?.message);
      // Continue anyway - redirect URL is what matters
    }

    return res.json({
      redirect_url: orderJson.redirect_url,
      merchant_reference: merchantRef,
      order_tracking_id: orderJson.order_tracking_id,
    });
  } catch (e: any) {
    console.error("Unhandled payment creation error:", e?.message || String(e));
    if (merchantRef) {
      await db
        .update(payments)
        .set({ status: "FAILED", rawCallback: { error: e?.message || String(e) } })
        .where(eq(payments.merchantReference, merchantRef))
        .catch(console.error);
    }
    // Always return JSON with proper error message
    return res.status(500).json({ error: "Payment initiation failed. Please try again later." });
  }
});

router.get("/ipn", async (req: Request, res: Response) => {
  try {
    const orderTrackingId = String(
      req.query.OrderTrackingId || req.query.orderTrackingId || ""
    );
    const merchantReference = String(
      req.query.OrderMerchantReference || req.query.merchantReference || ""
    );

    if (!orderTrackingId || !merchantReference) {
      return res
        .status(400)
        .json({ error: "Missing OrderTrackingId or OrderMerchantReference" });
    }

    const result = await processStatus(orderTrackingId, merchantReference);
    return res.json({
      orderNotificationType: "IPNCHANGE",
      orderTrackingId,
      orderMerchantReference: merchantReference,
      status: 200,
      paymentStatus: result.status,
    });
  } catch (e: any) {
    console.error("IPN error:", e?.message);
    return res.status(500).json({ error: "Failed to process payment status" });
  }
});

async function processStatus(orderTrackingId: string, merchantReference: string) {
  const env = process.env.PESAPAL_ENV || "live";
  const token = await getPesapalToken();
  const r = await fetch(
    `${pesapalBaseUrl(env)}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, signal: AbortSignal.timeout(8000) }
  );
  const statusData = (await r.json()) as any;

  let newStatus = "PENDING";
  if (statusData.status_code === 1 || statusData.payment_status_description === "Completed")
    newStatus = "COMPLETED";
  else if (statusData.status_code === 2) newStatus = "FAILED";
  else if (statusData.status_code === 0) newStatus = "INVALID";
  else if (statusData.status_code === 3) newStatus = "REVERSED";
  else if (statusData.status_code === 4 || statusData.payment_status_description === "Cancelled") newStatus = "CANCELLED";

  const [payment] = await db
    .update(payments)
    .set({
      status: newStatus,
      pesapalTrackingId: orderTrackingId,
      rawCallback: statusData,
      updatedAt: new Date(),
    })
    .where(eq(payments.merchantReference, merchantReference))
    .returning();

  if (newStatus === "COMPLETED" && payment) {
    if (payment.purpose === "membership" && payment.memberId) {
      await db
        .update(members)
        .set({ status: "Paid" })
        .where(eq(members.id, payment.memberId));
    }
    if (payment.purpose === "welfare" && payment.campaignId) {
      const [camp] = await db
        .select({ raisedAmount: welfareCampaigns.raisedAmount })
        .from(welfareCampaigns)
        .where(eq(welfareCampaigns.id, payment.campaignId));
      const current = Number(camp?.raisedAmount || 0);
      await db
        .update(welfareCampaigns)
        .set({ raisedAmount: String(current + Number(payment.amount)) })
        .where(eq(welfareCampaigns.id, payment.campaignId));
    }
  }

  return { status: newStatus, payment };
}

router.get("/status", async (req: Request, res: Response) => {
  try {
    const { ref } = req.query;
    if (!ref) return res.status(400).json({ error: "ref query parameter required" });
    
    const [row] = await db
      .select({ status: payments.status, purpose: payments.purpose })
      .from(payments)
      .where(eq(payments.merchantReference, String(ref)));
    
    if (!row) return res.status(404).json({ error: "Payment not found" });
    return res.json(row);
  } catch (e: any) {
    console.error("Status check error:", e?.message);
    return res.status(500).json({ error: "Failed to check payment status" });
  }
});

router.get("/", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(payments).orderBy(desc(payments.createdAt)).limit(200);
    return res.json(rows);
  } catch (e: any) {
    console.error("Payment list error:", e?.message);
    return res.status(500).json({ error: "Failed to fetch payments" });
  }
});

export default router;
