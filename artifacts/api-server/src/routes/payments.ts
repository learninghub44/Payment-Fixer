import { Router, Request, Response } from "express";
import { db } from "../db.js";
import { payments } from "../shared/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

// Pesapal credentials
const CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY || "";
const CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET || "";
const PESAPAL_ENV = process.env.PESAPAL_ENV || "sandbox";
const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:10000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const PESAPAL_API = {
  sandbox: {
    auth: "https://pesapalapi.azurewebsites.net/api/Auth/RequestToken",
    order: "https://pesapalapi.azurewebsites.net/api/Transactions/InitiatePayment",
    status: "https://pesapalapi.azurewebsites.net/api/Transactions/GetTransactionStatus",
  },
  live: {
    auth: "https://api.pesapal.com/api/Auth/RequestToken",
    order: "https://api.pesapal.com/api/Transactions/InitiatePayment",
    status: "https://api.pesapal.com/api/Transactions/GetTransactionStatus",
  },
};

const pesapalAPI = PESAPAL_API[PESAPAL_ENV as keyof typeof PESAPAL_API];

function generateMerchantReference(): string {
  return `KUWESA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function getPesapalToken(): Promise<string> {
  try {
    const response = await fetch(pesapalAPI.auth, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
      }),
    });

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Pesapal token error:", error);
    throw new Error("Failed to authenticate with Pesapal");
  }
}

// Create payment
router.post("/create", async (req: Request, res: Response) => {
  try {
    const {
      memberId,
      amount,
      purpose,
      payerName,
      payerPhone,
      payerEmail,
      currency = "KES",
    } = req.body;

    if (!amount || !payerName || !payerPhone || !payerEmail) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "amount, payerName, payerPhone, and payerEmail are required",
      });
    }

    const merchantReference = generateMerchantReference();
    const token = await getPesapalToken();
    const orderDescription = purpose || `KUWESA Membership Payment - ${amount} ${currency}`;
    const callbackUrl = `${APP_BASE_URL}/api/payments/ipn`;
    const redirectUrl = `${FRONTEND_URL}/payment/callback`;

    const pesapalResponse = await fetch(pesapalAPI.order, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
        merchant_reference: merchantReference,
        amount: String(amount),
        currency: currency,
        description: orderDescription,
        callback_url: callbackUrl,
        redirect_url: redirectUrl,
        first_name: payerName.split(" ")[0],
        last_name: payerName.split(" ").slice(1).join(" "),
        email: payerEmail,
        phone_number: payerPhone,
      }),
    });

    const pesapalData = await pesapalResponse.json();

    if (!pesapalResponse.ok) {
      console.error("Pesapal error:", pesapalData);
      return res.status(400).json({
        error: "Payment initiation failed",
        message: pesapalData.message || "Failed to create payment order",
      });
    }

    // Save payment record
    const paymentRecord = await db
      .insert(payments)
      .values({
        purpose: purpose || orderDescription,
        memberId: memberId || null,
        payerName,
        payerPhone,
        payerEmail,
        amount: String(amount),
        currency,
        merchantReference,
        pesapalTrackingId: pesapalData.order_tracking_id || "",
        pesapalRedirectUrl: pesapalData.redirect_url || "",
        status: "Pending",
      })
      .returning();

    res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      redirect_url: pesapalData.redirect_url || redirectUrl,
      pesapal_url: pesapalData.redirect_url || redirectUrl,
      merchant_reference: merchantReference,
      order_tracking_id: pesapalData.order_tracking_id,
      payment: paymentRecord[0],
    });
  } catch (error: any) {
    console.error("Payment creation error:", error);
    res.status(500).json({
      error: "Payment initiation failed",
      message: error.message || "An error occurred while creating the payment",
    });
  }
});

// IPN Webhook handler
router.post("/ipn", async (req: Request, res: Response) => {
  try {
    const { order_tracking_id, status, merchant_reference } = req.body;

    if (!order_tracking_id) {
      return res.status(400).json({ error: "Missing order_tracking_id" });
    }

    // Ensure merchant_reference is a string
    const ref = Array.isArray(merchant_reference)
      ? merchant_reference[0]
      : merchant_reference;

    await db
      .update(payments)
      .set({
        status: status || "Completed",
        pesapalTrackingId: order_tracking_id,
        rawCallback: JSON.stringify(req.body),
      })
      .where(eq(payments.merchantReference, ref));

    res.status(200).json({ success: true, message: "IPN received" });
  } catch (error) {
    console.error("IPN error:", error);
    res.status(500).json({ error: "IPN processing failed" });
  }
});

// Get payment status
router.get("/status/:merchantReference", async (req: Request, res: Response) => {
  try {
    const { merchantReference } = req.params;
    
    // Handle if merchantReference is an array
    const ref = Array.isArray(merchantReference)
      ? merchantReference[0]
      : merchantReference;

    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.merchantReference, ref))
      .limit(1);

    if (payment.length === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({
      status: payment[0].status,
      merchant_reference: payment[0].merchantReference,
      amount: payment[0].amount,
      currency: payment[0].currency,
    });
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({ error: "Failed to check payment status" });
  }
});

export default router;
