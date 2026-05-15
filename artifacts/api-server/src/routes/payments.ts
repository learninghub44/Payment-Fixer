import { Router, Request, Response } from "express";
import { db } from "../db.js";
import { payments, members } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

function getAppBase(req: Request) {
  return process.env.FRONTEND_URL || process.env.APP_BASE_URL || "https://kuriaweststudents.pages.dev";
}

async function registerIPN(req: Request): Promise<string> {
  try {
    const base = process.env.APP_BASE_URL || "https://kuwesa-payment-api.onrender.com";
    const ipnUrl = `${base}/api/payments/ipn`;
    
    const res = await fetch("https://api.pesapal.com/api/URLSetup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: ipnUrl,
        ipn_notification_type: "GET",
      }),
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json();
    return data.ipn_id || "default-ipn";
  } catch (e) {
    console.error("IPN registration error:", e);
    return "default-ipn";
  }
}

router.post("/create", async (req: Request, res: Response) => {
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

    console.log("Payment request:", { purpose, amount, payerName, payerPhone });

    if (!purpose || !amount || !payerName || !payerPhone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!process.env.PESAPAL_CONSUMER_KEY || !process.env.PESAPAL_CONSUMER_SECRET) {
      return res.status(500).json({ error: "Pesapal keys not configured" });
    }

    const merchantRef = crypto.randomUUID();
    const ipnId = await registerIPN(req);

    // Create payment record
    await db.insert(payments).values({
      purpose,
      memberId: memberId || null,
      campaignId: campaignId || null,
      payerName,
      payerPhone,
      payerEmail: payerEmail || null,
      amount: parseFloat(amount),
      currency: "KES",
      merchantReference: merchantRef,
      status: "PENDING",
    });

    // Pesapal OAuth
    const authRes = await fetch("https://pesapalapi.azurewebsites.net/api/Auth/RequestToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consumer_key: process.env.PESAPAL_CONSUMER_KEY,
        consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
      }),
      signal: AbortSignal.timeout(8000),
    });

    const authData = await authRes.json();
    if (!authData.token) throw new Error("Failed to get auth token");

    // Submit order
    const frontendBase = getAppBase(req);
    const orderRes = await fetch("https://pesapalapi.azurewebsites.net/api/WebsitePaymentSubmission/ProcessPayment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authData.token}`,
      },
      body: JSON.stringify({
        invoice_number: merchantRef,
        amount: Number(amount),
        currency: "KES",
        description: description || purpose,
        callback_url: `${frontendBase}/payment/success?ref=${merchantRef}`,
        cancellation_url: `${frontendBase}/payment/failed?ref=${merchantRef}`,
        notification_id: ipnId,
        billing_address: {
          email_address: payerEmail || "noemail@kuwesa.local",
          phone_number: payerPhone,
          first_name: payerName.split(" ")[0],
          last_name: payerName.split(" ")[1] || "User",
        },
      }),
      signal: AbortSignal.timeout(8000),
    });

    const orderData = await orderRes.json();
    console.log("Pesapal response:", orderData);

    if (!orderData.redirect_url) {
      throw new Error(orderData.error || "No redirect URL from Pesapal");
    }

    // Update payment with redirect URL
    await db
      .update(payments)
      .set({ pesapalRedirectUrl: orderData.redirect_url })
      .where(eq(payments.merchantReference, merchantRef));

    return res.json({
      redirect_url: orderData.redirect_url,
      merchant_reference: merchantRef,
    });
  } catch (error: any) {
    console.error("Payment creation error:", error.message);
    return res.status(500).json({ error: error?.message || "Payment failed" });
  }
});

router.get("/status", async (req: Request, res: Response) => {
  try {
    const ref = String(req.query.merchantReference || "");
    if (!ref) return res.status(400).json({ error: "Reference required" });

    const rows = await db.select().from(payments).where(eq(payments.merchantReference, ref));
    if (rows.length === 0) return res.status(404).json({ error: "Payment not found" });

    return res.json({ status: rows[0].status });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

router.get("/ipn", async (req: Request, res: Response) => {
  try {
    console.log("IPN webhook received:", req.query);
    const ref = String(req.query.OrderMerchantReference || "");
    if (!ref) return res.status(400).json({ error: "No reference" });

    // Update payment status
    await db
      .update(payments)
      .set({ status: "COMPLETED" })
      .where(eq(payments.merchantReference, ref));

    return res.json({ success: true });
  } catch (e: any) {
    console.error("IPN error:", e);
    return res.status(500).json({ error: e?.message });
  }
});

export default router;
