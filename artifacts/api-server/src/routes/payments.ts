import { Router, Request, Response } from "express";
import { db } from "../db.js";
import { payments, members, welfareCampaigns } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

const PESAPAL_BASE = "https://pay.pesapal.com/v3";

function getFrontendBase(req: Request) {
  return (
    process.env.FRONTEND_URL ||
    process.env.APP_BASE_URL ||
    "https://kuriaweststudents.pages.dev"
  );
}

function getBackendBase() {
  return (
    process.env.RENDER_EXTERNAL_URL ||
    process.env.APP_BASE_URL ||
    "https://kuwesa-payment-api.onrender.com"
  );
}

async function getPesapalToken(): Promise<string> {
  const res = await fetch(`${PESAPAL_BASE}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
    }),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  if (!data.token) throw new Error(`Pesapal auth failed: ${JSON.stringify(data)}`);
  return data.token;
}

async function registerIPN(token: string): Promise<string> {
  try {
    const ipnUrl = `${getBackendBase()}/api/payments/ipn`;
    const res = await fetch(`${PESAPAL_BASE}/api/URLSetup/RegisterIPN`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url: ipnUrl, ipn_notification_type: "GET" }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    console.log("[IPN] Registration response:", data);
    return data.ipn_id || "";
  } catch (e) {
    console.error("[IPN] Registration error:", e);
    return "";
  }
}

router.post("/create", async (req: Request, res: Response) => {
  try {
    const { purpose, memberId, campaignId, amount, payerName, payerPhone, payerEmail, description } = req.body;

    console.log("[Payments] Create:", { purpose, amount, payerName, payerPhone });

    if (!purpose || !amount || !payerName || !payerPhone) {
      return res.status(400).json({ error: "Missing required fields: purpose, amount, payerName, payerPhone" });
    }
    if (!process.env.PESAPAL_CONSUMER_KEY || !process.env.PESAPAL_CONSUMER_SECRET) {
      return res.status(500).json({ error: "Pesapal keys not configured on server" });
    }

    const merchantRef = crypto.randomUUID();
    const amountNum = parseFloat(String(amount));

    const token = await getPesapalToken();
    const ipnId = await registerIPN(token);

    await db.insert(payments).values({
      purpose,
      memberId: memberId || null,
      campaignId: campaignId || null,
      payerName,
      payerPhone,
      payerEmail: payerEmail || null,
      amount: String(amountNum),
      currency: "KES",
      merchantReference: merchantRef,
      status: "PENDING",
    });

    const frontendBase = getFrontendBase(req);
    const orderRes = await fetch(`${PESAPAL_BASE}/api/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: merchantRef,
        currency: "KES",
        amount: amountNum,
        description: description || purpose,
        callback_url: `${frontendBase}/payment/success?ref=${merchantRef}`,
        cancellation_url: `${frontendBase}/payment/failed?ref=${merchantRef}`,
        notification_id: ipnId,
        billing_address: {
          email_address: payerEmail || "noemail@kuwesa.local",
          phone_number: payerPhone,
          first_name: payerName.split(" ")[0] || "Student",
          last_name: payerName.split(" ").slice(1).join(" ") || "KUWESA",
        },
      }),
      signal: AbortSignal.timeout(20000),
    });

    const orderData = await orderRes.json();
    console.log("[Payments] Pesapal response:", orderData);

    if (!orderData.redirect_url) {
      throw new Error(orderData.error?.message || orderData.message || "No redirect URL from Pesapal");
    }

    await db
      .update(payments)
      .set({ pesapalTrackingId: orderData.order_tracking_id || null, pesapalRedirectUrl: orderData.redirect_url })
      .where(eq(payments.merchantReference, merchantRef));

    return res.json({
      redirect_url: orderData.redirect_url,
      merchant_reference: merchantRef,
      order_tracking_id: orderData.order_tracking_id,
    });
  } catch (error: any) {
    console.error("[Payments] Error:", error.message);
    return res.status(500).json({ error: error?.message || "Payment initiation failed" });
  }
});

router.get("/status", async (req: Request, res: Response) => {
  try {
    const ref = String(req.query.merchantReference || "");
    if (!ref) return res.status(400).json({ error: "merchantReference required" });
    const rows = await db.select().from(payments).where(eq(payments.merchantReference, ref));
    if (rows.length === 0) return res.status(404).json({ error: "Payment not found" });
    return res.json({ status: rows[0].status, payment: rows[0] });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

router.get("/ipn", async (req: Request, res: Response) => {
  try {
    console.log("[IPN] Received:", req.query);
    const orderTrackingId = String(req.query.OrderTrackingId || "");
    const merchantRef = String(req.query.OrderMerchantReference || "");

    if (!merchantRef) return res.status(200).json({ message: "ok" });

    let pesapalStatus = "COMPLETED";
    try {
      const token = await getPesapalToken();
      const verifyRes = await fetch(
        `${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
        {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(10000),
        }
      );
      const verifyData = await verifyRes.json();
      console.log("[IPN] Verify:", verifyData);
      const desc = (verifyData.payment_status_description || "").toLowerCase();
      if (desc === "completed") pesapalStatus = "COMPLETED";
      else if (desc === "failed" || desc === "invalid") pesapalStatus = "FAILED";
      else pesapalStatus = "PENDING";
    } catch (err) {
      console.error("[IPN] Verify error:", err);
    }

    const rows = await db.select().from(payments).where(eq(payments.merchantReference, merchantRef));
    if (rows.length === 0) return res.status(200).json({ message: "ok" });

    const payment = rows[0];
    await db
      .update(payments)
      .set({ status: pesapalStatus, pesapalTrackingId: orderTrackingId || payment.pesapalTrackingId, rawCallback: req.query as any })
      .where(eq(payments.merchantReference, merchantRef));

    if (pesapalStatus === "COMPLETED") {
      if (payment.memberId) {
        await db.update(members).set({ status: "Paid" }).where(eq(members.id, payment.memberId));
        console.log("[IPN] ✓ Member marked Paid:", payment.memberId);
      }
      if (payment.campaignId) {
        const camps = await db.select().from(welfareCampaigns).where(eq(welfareCampaigns.id, payment.campaignId));
        if (camps.length > 0) {
          const newAmount = Number(camps[0].raisedAmount || 0) + Number(payment.amount || 0);
          await db.update(welfareCampaigns).set({ raisedAmount: String(newAmount) }).where(eq(welfareCampaigns.id, payment.campaignId));
          console.log("[IPN] ✓ Welfare campaign updated:", payment.campaignId);
        }
      }
    }

    return res.status(200).json({ message: "ok", status: pesapalStatus });
  } catch (e: any) {
    console.error("[IPN] Error:", e.message);
    return res.status(200).json({ message: "ok" });
  }
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(payments);
    return res.json(rows);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

export default router;
