import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, MessageCircle, AlertTriangle } from "lucide-react";
import { verifyPesapalStatus } from "@/lib/pesapal";
import { api } from "@/lib/api";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const merchantRef = params.get("ref") || params.get("OrderMerchantReference") || "";
  const orderTrackingId = params.get("OrderTrackingId") || "";
  const [status, setStatus] = useState<"checking" | "completed" | "pending" | "failed">("checking");
  const [purpose, setPurpose] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (!merchantRef) { setStatus("failed"); return; }
      try {
        if (orderTrackingId) {
          await verifyPesapalStatus(orderTrackingId, merchantRef).catch(() => null);
        }
        const data = await api.get<{ status: string; purpose: string }>(`/payments/status?ref=${encodeURIComponent(merchantRef)}`);
        setPurpose(data?.purpose || "");
        if (data?.status === "COMPLETED") setStatus("completed");
        else if (data?.status === "FAILED" || data?.status === "INVALID") setStatus("failed");
        else setStatus("pending");
      } catch {
        setStatus("failed");
      }
    })();
  }, [merchantRef, orderTrackingId]);

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <main className="container-custom px-4 sm:px-6 pt-32 pb-16">
        <div className="max-w-xl mx-auto bg-card rounded-3xl p-8 sm:p-10 shadow-elegant border border-border/50 text-center">
          {status === "checking" && (
            <>
              <Loader2 className="h-14 w-14 text-primary mx-auto mb-4 animate-spin" />
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">Verifying your payment…</h1>
              <p className="text-muted-foreground text-sm">This usually takes a few seconds.</p>
            </>
          )}
          {status === "completed" && (
            <>
              <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4 animate-scale-in" />
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Payment received!</h1>
              <p className="text-muted-foreground mb-6">
                {purpose === "membership"
                  ? "Welcome to KUWESA. Join our WhatsApp community to stay connected."
                  : "Thank you for your generous contribution. You're making a real difference."}
              </p>
              {purpose === "membership" && (
                <a href="https://chat.whatsapp.com/JqeTvzJsLVq7IYtp4o5NJe" target="_blank" rel="noopener noreferrer" className="block mb-3">
                  <Button variant="whatsapp" size="lg" className="w-full">
                    <MessageCircle className="h-5 w-5" />
                    Join WhatsApp Group
                  </Button>
                </a>
              )}
              <Link to="/"><Button variant="outline" className="w-full">Back to home</Button></Link>
            </>
          )}
          {status === "pending" && (
            <>
              <Loader2 className="h-14 w-14 text-accent mx-auto mb-4 animate-spin" />
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">Payment is processing</h1>
              <p className="text-muted-foreground mb-6">
                Pesapal hasn't confirmed your payment yet. This page will update automatically — or refresh in a minute.
              </p>
              <Button onClick={() => window.location.reload()} variant="hero" className="w-full mb-2">Refresh status</Button>
              <Link to="/"><Button variant="outline" className="w-full">Back to home</Button></Link>
            </>
          )}
          {status === "failed" && (
            <>
              <AlertTriangle className="h-14 w-14 text-destructive mx-auto mb-4" />
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">We couldn't verify your payment</h1>
              <p className="text-muted-foreground mb-6">
                If you were charged, contact KUWESA leadership and an admin will mark your payment manually.
              </p>
              <Link to="/payment/failed"><Button variant="hero" className="w-full mb-2">Try again</Button></Link>
              <Link to="/"><Button variant="outline" className="w-full">Back to home</Button></Link>
            </>
          )}
          {merchantRef && (
            <p className="mt-6 text-[11px] text-muted-foreground">Reference: <span className="font-mono">{merchantRef}</span></p>
          )}
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;
