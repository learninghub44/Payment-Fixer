import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, HandHeart, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { createPesapalOrder, navigateToPesapal } from "@/lib/pesapal";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

type Campaign = {
  id: string;
  title: string;
  description: string;
  beneficiary: string | null;
  goal_amount: number;
  raised_amount: number;
  status: string;
  cover_image_url: string | null;
  created_at: string;
};

const toRow = (obj: Record<string, any>): Campaign => ({
  id: obj.id,
  title: obj.title,
  description: obj.description,
  beneficiary: obj.beneficiary ?? obj.beneficiary,
  goal_amount: Number(obj.goalAmount ?? obj.goal_amount ?? 0),
  raised_amount: Number(obj.raisedAmount ?? obj.raised_amount ?? 0),
  status: obj.status,
  cover_image_url: obj.coverImageUrl ?? obj.cover_image_url ?? null,
  created_at: obj.createdAt ?? obj.created_at,
});

export const Welfare = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Campaign | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", amount: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<any[]>("/welfare");
        setCampaigns((data || []).map(toRow));
      } catch {
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const open = (c: Campaign) => {
    setActive(c);
    setForm({ name: "", phone: "", email: "", amount: "" });
  };

  const contribute = async () => {
    if (!active) return;
    const amt = Number(form.amount);
    if (!form.name || !form.phone || !amt || amt < 10) {
      toast({ title: "Check your details", description: "Name, phone and amount (min KES 10) are required.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const order = await createPesapalOrder({
        purpose: "welfare",
        campaignId: active.id,
        amount: amt,
        payerName: form.name,
        payerPhone: form.phone,
        payerEmail: form.email,
        description: `Welfare: ${active.title}`,
      });
      navigateToPesapal(order.redirect_url);
    } catch (e: any) {
      setBusy(false);
      toast({ title: "Payment failed to start", description: e?.message, variant: "destructive" });
    }
  };

  return (
    <section id="welfare" className="section-padding bg-secondary/30">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-xs font-semibold tracking-wider uppercase mb-4">
            Welfare
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance mb-4">
            Lend a hand to a <span className="text-primary">fellow student</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Welfare cases posted by leadership. Contribute any amount via Pesapal — every shilling goes directly to the cause.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : campaigns.length === 0 ? (
          <div className="max-w-xl mx-auto bg-card rounded-2xl p-10 text-center shadow-card border border-border/50">
            <HandHeart className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">No active welfare cases right now</h3>
            <p className="text-muted-foreground text-sm">Check back soon — leadership posts new cases as they arise.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c) => {
              const pct = c.goal_amount > 0 ? Math.min(100, Math.round((Number(c.raised_amount) / Number(c.goal_amount)) * 100)) : 0;
              return (
                <article key={c.id} className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden flex flex-col">
                  {c.cover_image_url && (
                    <img src={c.cover_image_url} alt={c.title} className="h-40 w-full object-cover" loading="lazy" />
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">{c.title}</h3>
                    {c.beneficiary && <div className="text-xs text-primary font-medium mb-2">For: {c.beneficiary}</div>}
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">{c.description}</p>

                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-foreground">KES {Number(c.raised_amount).toLocaleString()}</span>
                        <span className="text-muted-foreground">of KES {Number(c.goal_amount).toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="hero" className="w-full" onClick={() => open(c)}>
                          <Heart className="h-4 w-4" />
                          Contribute
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Contribute to {active?.title}</DialogTitle>
                          <DialogDescription>Pay any amount via Pesapal — M-Pesa, card or bank.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                          <div className="space-y-2">
                            <Label htmlFor="w-name">Your Name</Label>
                            <Input id="w-name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="w-phone">Phone</Label>
                            <Input id="w-phone" type="tel" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="w-email">Email (optional)</Label>
                            <Input id="w-email" type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="w-amount">Amount (KES)</Label>
                            <Input id="w-amount" type="number" min={10} value={form.amount} onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))} />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="hero" onClick={contribute} disabled={busy} className="w-full">
                            {busy ? "Redirecting..." : `Pay KES ${form.amount || "0"}`}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
