import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/auth/login", { email: creds.email.trim(), password: creds.password });
      toast({ title: "Welcome back, Admin" });
      navigate("/admin/dashboard");
    } catch (err: any) {
      toast({ title: "Login failed", description: err?.message || "Invalid credentials", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-accent/30 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary-glow/40 rounded-full blur-3xl" />
      <Navbar />
      <main className="relative flex items-center justify-center px-4 pt-32 pb-16">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md bg-card/95 backdrop-blur-xl rounded-3xl shadow-elegant p-8 border border-accent/30 animate-scale-in"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/40 blur-xl rounded-full" />
              <div className="relative h-16 w-16 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-glow ring-4 ring-accent/40">
                <Lock className="h-8 w-8" />
              </div>
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-center text-foreground mb-2">
            KUWESA Admin
          </h1>
          <p className="text-center text-muted-foreground text-sm mb-6">
            Sign in to manage members, payments &amp; campaigns.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" value={creds.email} onChange={(e) => setCreds((s) => ({ ...s, email: e.target.value }))} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p">Password</Label>
              <Input id="p" type="password" autoComplete="current-password" value={creds.password} onChange={(e) => setCreds((s) => ({ ...s, password: e.target.value }))} placeholder="••••••••" />
            </div>
          </div>

          <Button type="submit" variant="gold" size="lg" className="w-full mt-6" disabled={busy}>
            {busy ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground mt-4">
            Authorised KUWESA administrators only.
          </p>
        </form>
      </main>
    </div>
  );
};

export default AdminLogin;
