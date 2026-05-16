import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import crypto from "crypto";

const router = Router();

// ✅ Correct Pesapal v3 LIVE endpoints
const PESAPAL_BASE = "https://pay.pesapal.com/v3";

function getFrontendBase() {
  return process.env.FRONTEND_URL || "https://kuriaweststudents.pages.dev";
}
function getBackendBase() {
  return process.env.RENDER_EXTERNAL_URL || process.env.APP_BASE_URL || "https://kuwesa-payment-api.onrender.com";
}

async function getPesapalToken(): Promise<string> {
  const key    = process.env.PESAPAL_CONSUMER_KEY;
  const secret = process.env.PESAPAL_CONSUMER_SECRET;
  if (!key || !secret) throw new Error("Pesapal keys not configured on server. Set PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET in Render environment variables.");

  const res = await fetch(`${PESAPAL_BASE}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ consumer_key: key, consumer_secret: secret }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Pesapal auth HTTP ${res.status}`);
  const data = await res.json();
  if (!data.token) throw new Error(`Pesapal auth failed: ${JSON.stringify(data)}`);
  console.log("[Pesapal] ✓ Token obtained");
  return data.token;
}

async function registerIPN(token: string): Promise<string> {
  try {
    const ipnUrl = `${getBackendBase()}/api/payments/ipn`;
    const res = await fetch(`${PESAPAL_BASE}/api/URLSetup/RegisterIPN`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ url: ipnUrl, ipn_notification_type: "GET" }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    console.log("[Pesapal] IPN registered:", data.ipn_id);
    return data.ipn_id || "";
  } catch (e: any) {
    console.error("[Pesapal] IPN registration failed:", e.message);
    return "";
  }
}

async function ensurePaymentsTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    purpose text NOT NULL DEFAULT 'membership',
    member_id uuid,
    campaign_id uuid,
    payer_name text NOT NULL DEFAULT '',
    payer_phone text NOT NULL DEFAULT '',
    payer_email text,
    amount numeric NOT NULL DEFAULT 0,
    currency text NOT NULL DEFAULT 'KES',
    merchant_reference text UNIQUE,
    pesapal_tracking_id text,
    pesapal_redirect_url text,
    status text NOT NULL DEFAULT 'PENDING',
    raw_callback jsonb,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
  )`);
}

// POST /api/payments/create
router.post("/create", async (req: Request, res: Response) => {
  try {
    await ensurePaymentsTable();
    const { purpose, memberId, campaignId, amount, payerName, payerPhone, payerEmail, description } = req.body;

    console.log("[Payments] Create:", { purpose, amount, payerName, payerPhone });

    if (!purpose || !amount || !payerName || !payerPhone) {
      return res.status(400).json({ error: "Missing required fields: purpose, amount, payerName, payerPhone" });
    }

    const merchantRef = crypto.randomUUID();
    const amountNum   = parseFloat(String(amount));

    // 1. Get token
    const token = await getPesapalToken();

    // 2. Register IPN
    const ipnId = await registerIPN(token);

    // 3. Save pending payment
    await pool.query(
      `INSERT INTO payments (purpose, member_id, campaign_id, payer_name, payer_phone, payer_email, amount, currency, merchant_reference, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'KES',$8,'PENDING')`,
      [purpose, memberId||null, campaignId||null, payerName, payerPhone, payerEmail||null, amountNum, merchantRef]
    );

    // 4. Submit to Pesapal
    const frontendBase = getFrontendBase();
    const orderRes = await fetch(`${PESAPAL_BASE}/api/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
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
      throw new Error(orderData.error?.message || orderData.message || "No redirect URL from Pesapal — check your Pesapal credentials and account status");
    }

    await pool.query(
      `UPDATE payments SET pesapal_tracking_id=$1, pesapal_redirect_url=$2 WHERE merchant_reference=$3`,
      [orderData.order_tracking_id||null, orderData.redirect_url, merchantRef]
    );

    return res.json({
      redirect_url: orderData.redirect_url,
      merchant_reference: merchantRef,
      order_tracking_id: orderData.order_tracking_id,
    });
  } catch (err: any) {
    console.error("[Payments] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/payments/status
router.get("/status", async (req: Request, res: Response) => {
  try {
    const ref = String(req.query.merchantReference || "");
    if (!ref) return res.status(400).json({ error: "merchantReference required" });
    const { rows } = await pool.query(`SELECT * FROM payments WHERE merchant_reference=$1`, [ref]);
    if (!rows.length) return res.status(404).json({ error: "Payment not found" });
    return res.json({ status: rows[0].status, payment: rows[0] });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// GET /api/payments/ipn — Pesapal webhook
router.get("/ipn", async (req: Request, res: Response) => {
  try {
    console.log("[IPN] Received:", req.query);
    const orderTrackingId = String(req.query.OrderTrackingId || "");
    const merchantRef     = String(req.query.OrderMerchantReference || "");
    if (!merchantRef) return res.status(200).json({ message: "ok" });

    let pesapalStatus = "COMPLETED";
    try {
      const token = await getPesapalToken();
      const vRes  = await fetch(`${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
        { headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000) });
      const v = await vRes.json();
      console.log("[IPN] Verify:", v);
      const desc = (v.payment_status_description || "").toLowerCase();
      if (desc === "completed") pesapalStatus = "COMPLETED";
      else if (desc === "failed" || desc === "invalid") pesapalStatus = "FAILED";
      else pesapalStatus = "PENDING";
    } catch { /* default COMPLETED */ }

    const { rows } = await pool.query(`SELECT * FROM payments WHERE merchant_reference=$1`, [merchantRef]);
    if (!rows.length) return res.status(200).json({ message: "ok" });
    const payment = rows[0];

    await pool.query(
      `UPDATE payments SET status=$1, pesapal_tracking_id=$2, raw_callback=$3, updated_at=now() WHERE merchant_reference=$4`,
      [pesapalStatus, orderTrackingId||payment.pesapal_tracking_id, JSON.stringify(req.query), merchantRef]
    );

    if (pesapalStatus === "COMPLETED") {
      if (payment.member_id)   await pool.query(`UPDATE members SET status='Paid' WHERE id=$1`, [payment.member_id]);
      if (payment.campaign_id) await pool.query(`UPDATE welfare_campaigns SET raised_amount=raised_amount+$1 WHERE id=$2`, [Number(payment.amount), payment.campaign_id]);
    }

    return res.status(200).json({ message: "ok", status: pesapalStatus });
  } catch (e: any) {
    console.error("[IPN] Error:", e.message);
    return res.status(200).json({ message: "ok" });
  }
});

// GET /api/payments — admin list
router.get("/", async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM payments ORDER BY created_at DESC`);
    return res.json(rows);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
