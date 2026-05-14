import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/kuwesa-logo.png";

export default function MemberLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      toast({ title: "Error", description: "Please enter your name and phone", variant: "destructive" });
      return;
    }

    setBusy(true);
    try {
      const result = await api.post<any>("/member/login", { fullName, phone });
      if (!result?.id) throw new Error("Login failed");
      
      toast({ title: "Welcome!", description: `Logged in as ${result.fullName}` });
      navigate("/member/dashboard");
    } catch (e: any) {
      toast({ title: "Login Failed", description: e?.message || "Member not found", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center px-4 pt-20 pb-8">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-elegant p-8 border border-border/50">
          {/* Header */}
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-primary shadow-elegant ring-4 ring-accent/50">
              <img src={logo} alt="KUWESA" className="h-full w-full object-cover" />
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-center text-foreground mb-2">
            Member Login
          </h1>
          <p className="text-center text-muted-foreground text-sm mb-8">
            Access your KUWESA account and dashboard
          </p>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-semibold text-foreground block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-semibold text-foreground block">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  id="phone"
                  type="tel"
                  placeholder="0701234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" variant="hero" size="lg" className="w-full mt-6" disabled={busy}>
              <ArrowRight className="h-4 w-4" />
              {busy ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border/50 space-y-4">
            <p className="text-xs text-center text-muted-foreground">
              Not a member yet?{" "}
              <a href="/#membership" className="text-primary hover:underline font-semibold">
                Register here
              </a>
            </p>
            <a href="/" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <Home className="h-4 w-4" /> Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
