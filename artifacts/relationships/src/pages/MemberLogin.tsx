import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/kuwesa-logo.png";

export default function MemberLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast({ title: "Error", description: "Please enter your phone number", variant: "destructive" });
      return;
    }

    setBusy(true);
    try {
      await api.post("/member/login", { phone });
      toast({ title: "Success", description: "Logged in successfully!" });
      navigate("/member/dashboard");
    } catch (e: any) {
      toast({ title: "Login failed", description: e?.message || "Member not found", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 pt-20">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-elegant p-8 border border-border/50">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-primary shadow-elegant ring-4 ring-accent/50">
              <img src={logo} alt="KUWESA" className="h-full w-full object-cover" />
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-center text-foreground mb-2">
            Member Portal
          </h1>
          <p className="text-center text-muted-foreground text-sm mb-8">
            Sign in with your phone number to access your dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-semibold text-foreground">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  id="phone"
                  type="tel"
                  placeholder="07XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
              <LogIn className="h-4 w-4" />
              {busy ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-6">
            Not registered yet?{" "}
            <a href="/#membership" className="text-primary hover:underline font-medium">
              Join KUWESA
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
