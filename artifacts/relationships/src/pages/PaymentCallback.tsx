import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader, CheckCircle, AlertCircle } from "lucide-react";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("Processing your payment...");

  useEffect(() => {
    const processingPayment = async () => {
      try {
        const orderTrackingId = searchParams.get("order_tracking_id");
        const pesapalReference = searchParams.get("pesapal_reference");
        const merchantReference = searchParams.get("merchant_reference");

        if (!orderTrackingId) {
          setStatus("failed");
          setMessage(
            "Payment reference not found. Please try again or contact support."
          );
          setTimeout(() => navigate("/"), 3000);
          return;
        }

        // Check payment status
        const response = await fetch(
          `/api/payments/status/${merchantReference || pesapalReference || orderTrackingId}`
        );
        const data = await response.json();

        if (data.status === "Completed" || data.status === "completed") {
          setStatus("success");
          setMessage(
            "✅ Payment successful! Your registration is complete. Redirecting to dashboard..."
          );
          setTimeout(() => navigate("/member/login"), 2000);
        } else if (
          data.status === "Pending" ||
          data.status === "pending"
        ) {
          setStatus("loading");
          setMessage("Payment is being processed. Please wait...");
          setTimeout(() => processingPayment(), 3000);
        } else {
          setStatus("failed");
          setMessage(
            "Payment verification pending. Please contact KUWESA support with your transaction ID."
          );
          setTimeout(() => navigate("/"), 3000);
        }
      } catch (error) {
        console.error("Payment callback error:", error);
        setStatus("failed");
        setMessage(
          "Unable to verify payment. Please contact KUWESA support."
        );
      }
    };

    processingPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-6">
        {status === "loading" && (
          <>
            <div className="flex justify-center">
              <Loader className="h-12 w-12 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Processing Payment
            </h1>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-600">
              Payment Successful!
            </h1>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-red-600">
              Payment Error
            </h1>
          </>
        )}

        <p className="text-lg text-muted-foreground">{message}</p>

        {status === "failed" && (
          <div className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">
              If you were charged but payment wasn't confirmed, contact KUWESA:
            </p>
            <a
              href="https://chat.whatsapp.com/C4cyTi8UBAKBor5Yyl4JSw"
              className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all"
            >
              Contact KUWESA
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
