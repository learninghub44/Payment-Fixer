import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

const PaymentFailed = () => (
  <div className="min-h-screen bg-gradient-soft">
    <Navbar />
    <main className="container-custom px-4 sm:px-6 pt-32 pb-16">
      <div className="max-w-xl mx-auto bg-card rounded-3xl p-8 sm:p-10 shadow-elegant border border-border/50 text-center">
        <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Payment didn't go through</h1>
        <p className="text-muted-foreground mb-6">
          No money has been taken. You can try again or contact leadership for help.
        </p>
        <Link to="/#membership"><Button variant="hero" className="w-full mb-2">Try membership again</Button></Link>
        <Link to="/#welfare"><Button variant="outline" className="w-full mb-2">Back to welfare</Button></Link>
        <Link to="/"><Button variant="ghost" className="w-full">Home</Button></Link>
      </div>
    </main>
  </div>
);

export default PaymentFailed;
