import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import crypto from "crypto";

const router = Router();

// ── M-Pesa Daraja config ────────────────────────────────────────────────────
// Set these in your environment (Render dashboard / .env):
//   MPESA_ENV               "sandbox" | "production"   (default: sandbox)
//   MPESA_CONSUMER_KEY
//   MPESA_CONSUMER_SECRET
//   MPESA_SHORTCODE         Paybill / till number (sandbox default: 174379)
//   MPESA_PASSKEY           Lipa Na M-Pesa Online passkey
//   APP_BASE_URL / RENDER_EXTERNAL_URL   public URL of this backend, used to
//                            build the callback URL Safaricom calls back on
const MPESA_BASE =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

function getBackendBase() {
  return process.env.RENDER_EXTERNAL_URL || process.env.APP_BASE_URL || "https://kuwesa-payment-api.onrender.com";
}

// Normalize a Kenyan phone number to the 2547XXXXXXXX format Daraja expects.
function normalizePhone(raw: string): string {
  const digits = String(raw).replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`;
  return digits;
}

async function getMpesaToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) {
    throw new Error("M-Pesa is not configured. Set MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in your environment.");
  }
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await fetch(`${MPESA_BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    method: "GET",
    headers: { Authorization: `Basic ${auth}` },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`M-Pesa auth HTTP ${res.status}`);
  const data = await res.json();
  if (!data.access_token) throw new Error(`M-Pesa auth failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

function buildPassword(shortcode: string, passkey: string, timestamp: string) {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

function timestampNow() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
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
    checkout_request_id text,
    merchant_request_id text,
    mpesa_receipt_number text,
    status text NOT NULL DEFAULT 'PENDING',
    raw_callback jsonb,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
  )`);
}

// POST /api/payments/create — initiates an M-Pesa STK Push (Lipa Na M-Pesa Online)
router.post("/create", async (req: Request, res: Response) => {
  try {
    await ensurePaymentsTable();
    const { purpose, memberId, campaignId, amount, payerName, payerPhone, payerEmail, description } = req.body;

    console.log("[Payments] Create:", { purpose, amount, payerName, payerPhone });

    if (!purpose || !amount || !payerName || !payerPhone) {
      return res.status(400).json({ error: "Missing required fields: purpose, amount, payerName, payerPhone" });
    }

    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    if (!shortcode || !passkey) {
      return res.status(503).json({ error: "M-Pesa is not configured yet. Set MPESA_SHORTCODE and MPESA_PASSKEY in your environment." });
    }

    const merchantRef = crypto.randomUUID();
    const amountNum = Math.round(parseFloat(String(amount)));
    const phone = normalizePhone(payerPhone);

    // 1. Save pending payment first so we have a row even if Daraja never calls back
    await pool.query(
      `INSERT INTO payments (purpose, member_id, campaign_id, payer_name, payer_phone, payer_email, amount, currency, merchant_reference, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'KES',$8,'PENDING')`,
      [purpose, memberId || null, campaignId || null, payerName, phone, payerEmail || null, amountNum, merchantRef]
    );

    // 2. Get an access token and trigger the STK push
    const token = await getMpesaToken();
    const timestamp = timestampNow();
    const password = buildPassword(shortcode, passkey, timestamp);

    const stkRes = await fetch(`${MPESA_BASE}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amountNum,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: `${getBackendBase()}/api/payments/callback`,
        AccountReference: merchantRef.slice(0, 12),
        TransactionDesc: description || purpose,
      }),
      signal: AbortSignal.timeout(20000),
    });

    const stkData = await stkRes.json();
    console.log("[Payments] STK push response:", stkData);

    if (stkData.ResponseCode !== "0") {
      throw new Error(stkData.errorMessage || stkData.ResponseDescription || "Failed to initiate M-Pesa STK push");
    }

    await pool.query(
      `UPDATE payments SET checkout_request_id=$1, merchant_request_id=$2 WHERE merchant_reference=$3`,
      [stkData.CheckoutRequestID || null, stkData.MerchantRequestID || null, merchantRef]
    );

    return res.json({
      merchant_reference: merchantRef,
      checkout_request_id: stkData.CheckoutRequestID,
      message: "STK push sent — enter your M-Pesa PIN on your phone to complete payment.",
    });
  } catch (err: any) {
    console.error("[Payments] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/payments/status — frontend polls this after triggering an STK push
router.get("/status", async (req: Request, res: Response) => {
  try {
    const ref = String(req.query.merchantReference || req.query.ref || "");
    if (!ref) return res.status(400).json({ error: "merchantReference required" });
    const { rows } = await pool.query(`SELECT * FROM payments WHERE merchant_reference=$1`, [ref]);
    if (!rows.length) return res.status(404).json({ error: "Payment not found" });
    return res.json({ status: rows[0].status, purpose: rows[0].purpose, payment: rows[0] });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// POST /api/payments/callback — Safaricom Daraja calls this once the customer
// enters their PIN (or cancels / times out). This is the ONLY place a payment
// is allowed to be marked COMPLETED — we never assume success.
router.post("/callback", async (req: Request, res: Response) => {
  // Always ack 200 so Safaricom doesn't retry, even if our own processing fails.
  res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });

  try {
    const body = req.body?.Body?.stkCallback;
    if (!body) { console.warn("[Callback] Unexpected payload shape"); return; }

    const checkoutRequestId = body.CheckoutRequestID;
    const resultCode = body.ResultCode;
    const resultDesc = body.ResultDesc;

    const { rows } = await pool.query(`SELECT * FROM payments WHERE checkout_request_id=$1`, [checkoutRequestId]);
    if (!rows.length) { console.warn("[Callback] No payment found for", checkoutRequestId); return; }
    const payment = rows[0];

    let status = "FAILED";
    let mpesaReceipt: string | null = null;

    if (resultCode === 0) {
      status = "COMPLETED";
      const items: any[] = body.CallbackMetadata?.Item || [];
      const find = (name: string) => items.find((i) => i.Name === name)?.Value;
      mpesaReceipt = find("MpesaReceiptNumber") || null;
    } else {
      // 1032 = user cancelled, 1037 = timeout, anything else = failure
      status = "FAILED";
    }

    await pool.query(
      `UPDATE payments SET status=$1, mpesa_receipt_number=$2, raw_callback=$3, updated_at=now() WHERE checkout_request_id=$4`,
      [status, mpesaReceipt, JSON.stringify(body), checkoutRequestId]
    );

    console.log(`[Callback] ${checkoutRequestId} -> ${status} (${resultDesc})`);

    if (status === "COMPLETED") {
      if (payment.member_id) await pool.query(`UPDATE members SET status='Paid' WHERE id=$1`, [payment.member_id]);
      if (payment.campaign_id)
        await pool.query(`UPDATE welfare_campaigns SET raised_amount=raised_amount+$1 WHERE id=$2`, [Number(payment.amount), payment.campaign_id]);
    }
  } catch (e: any) {
    console.error("[Callback] Error:", e.message);
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
