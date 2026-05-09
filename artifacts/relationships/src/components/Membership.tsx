import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, CreditCard, Sparkles, Crown, Star, GraduationCap, Shield, Lock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { createPesapalOrder, navigateToPesapal } from "@/lib/pesapal";
import { cn } from "@/lib/utils";

type Step = "tier" | "register" | "pay";

const KENYA_COUNTIES = [
  "Migori","Kisii","Homa Bay","Nyamira","Kisumu","Narok","Nakuru",
  "Nairobi","Kiambu","Mombasa","Machakos","Kajiado","Other",
];

type Tier = { id: "Member"|"Leader"|"Patron"; name: string; price: number; tagline: string; icon: typeof GraduationCap; perks: string[]; highlight?: boolean; badge?: string; };

const TIERS: Tier[] = [
  {
    id: "Member", name: "Member Registration", price: 200,
    tagline: "Every Kuria West student starts here",
    icon: GraduationCap,
    perks: [
      "Official KUWESA membership card",
      "Access to all events & meetups",
      "WhatsApp community access",
      "Welfare support eligibility",
      "Mentorship programme access",
    ],
  },
  {
    id: "Leader", name: "Leader", price: 500,
    tagline: "Step up and lead your ward or programme",
    icon: Star, highlight: true, badge: "Most Popular",
    perks: [
      "Everything in Member",
      "Recognition on leadership page",
      "Priority access to leadership training",
      "Vote on KUWESA programmes",
      "Leadership forum invitations",
    ],
  },
  {
    id: "Patron", name: "Patron", price: 2000,
    tagline: "For alumni, professionals & community sponsors",
    icon: Crown, badge: "Premium",
    perks: [
      "Everything in Leader",
      "KUWESA Patrons honour roll listing",
      "Direct sponsorship of welfare cases",
      "Annual patrons dinner invitation",
      "Special recognition at all events",
    ],
  },
];

export const Membership = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("tier");
  const [tier, setTier] = useState<Tier>(TIERS[0]);
  const [busy, setBusy] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName:"", phone:"", email:"", category:"",
    institution:"", course:"", yearOfStudy:"", studentNumber:"",
    county:"", subCounty:"", dob:"", gender:"",
    nokName:"", nokPhone:"", skills:"",
  });

  const update = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of ["fullName","phone","category","institution","county"] as const) {
      if (!form[f]) { toast({ title: "Missing details", description: `Please fill in ${f}.`, variant: "destructive" }); return; }
    }
    setBusy(true);
    try {
      const data = await api.post<{ id: string }>("/members", {
        fullName: form.fullName, phone: form.phone, email: form.email || null,
        category: form.category, institution: form.institution,
        course: form.course || null, yearOfStudy: form.yearOfStudy || null,
        studentNumber: form.studentNumber || null, county: form.county,
        subCounty: form.subCounty || null, dateOfBirth: form.dob || null,
        gender: form.gender || null, nextOfKinName: form.nokName || null,
        nextOfKinPhone: form.nokPhone || null, skills: form.skills || null, tier: tier.id,
      });
      setMemberId(data.id);
      toast({ title: "Registered ✓", description: `Now complete your KES ${tier.price.toLocaleString()} payment.` });
      setStep("pay");
    } catch (e: any) {
      toast({ title: "Registration failed", description: e?.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const handlePay = async () => {
    if (!memberId) return;
    setBusy(true);
    try {
      const order = await createPesapalOrder({
        purpose: "membership", memberId, amount: tier.price,
        payerName: form.fullName, payerPhone: form.phone, payerEmail: form.email,
        description: `KUWESA ${tier.name} – ${form.fullName}`,
      });
      navigateToPesapal(order.redirect_url);
    } catch (e: any) {
      setBusy(false);
      toast({ title: "Payment failed to start", description: e?.message, variant: "destructive" });
    }
  };

  return (
    <section id="membership" className="section-padding bg-gradient-soft relative overflow-hidden">
      <span className="section-number">05</span>
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-14 reveal">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">Join KUWESA</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance mb-4">
            Choose your <span className="text-primary">membership tier</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Strictly for <span className="font-semibold text-foreground">students from Kuria West Constituency</span>.
            Pay once, belong for life. Secure checkout via Pesapal — M-Pesa, card or bank.
          </p>
        </div>

        {/* ── TIER SELECTION ── */}
        {step === "tier" && (
          <div className="max-w-5xl mx-auto">
            {/* Price comparison row */}
            <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-3">
              {TIERS.map((t) => (
                <div key={t.id} className="text-center">
                  <div className={cn(
                    "text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1",
                    t.highlight ? "text-primary" : "text-muted-foreground"
                  )}>{t.name}</div>
                  <div className={cn(
                    "font-display font-extrabold text-xl sm:text-3xl",
                    t.highlight ? "text-primary" : "text-foreground"
                  )}>
                    KES {t.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 reveal">
              {TIERS.map((t, i) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setTier(t); setStep("register"); }}
                    className={cn(
                      "group relative text-left rounded-3xl border-2 transition-all duration-300 hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-primary",
                      t.highlight
                        ? "bg-gradient-hero text-white border-accent shadow-elegant scale-[1.03]"
                        : "bg-card border-border/50 hover:border-primary/50 shadow-card hover:shadow-elegant"
                    )}
                  >
                    {/* Badge */}
                    {t.badge && (
                      <span className={cn(
                        "absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-soft",
                        t.highlight ? "bg-accent text-primary-deep" : "bg-primary text-white"
                      )}>
                        {t.highlight && <Sparkles className="h-3 w-3" />}
                        {t.badge}
                      </span>
                    )}

                    <div className="p-6 sm:p-7">
                      {/* Icon + tier number */}
                      <div className="flex items-center justify-between mb-5">
                        <div className={cn(
                          "inline-flex h-12 w-12 rounded-2xl items-center justify-center shadow-soft",
                          t.highlight ? "bg-white/15 text-accent backdrop-blur-md" : "bg-gradient-primary text-white"
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className={cn(
                          "font-display font-black text-4xl opacity-10",
                          t.highlight ? "text-white" : "text-primary"
                        )}>
                          0{i + 1}
                        </span>
                      </div>

                      {/* Name & tagline */}
                      <h3 className={cn("font-display text-lg sm:text-xl font-bold mb-1", t.highlight ? "text-white" : "text-foreground")}>
                        {t.name}
                      </h3>
                      <p className={cn("text-xs sm:text-sm mb-5 leading-snug", t.highlight ? "text-white/75" : "text-muted-foreground")}>
                        {t.tagline}
                      </p>

                      {/* Price */}
                      <div className={cn("flex items-baseline gap-1 mb-6 pb-5 border-b", t.highlight ? "border-white/20" : "border-border/50")}>
                        <span className={cn("text-sm font-semibold", t.highlight ? "text-accent" : "text-muted-foreground")}>KES</span>
                        <span className={cn("font-display text-4xl sm:text-5xl font-extrabold leading-none", t.highlight ? "text-accent" : "text-primary")}>
                          {t.price.toLocaleString()}
                        </span>
                        <span className={cn("text-xs ml-1", t.highlight ? "text-white/60" : "text-muted-foreground")}>one-time</span>
                      </div>

                      {/* Perks */}
                      <ul className="space-y-2.5 mb-7">
                        {t.perks.map((p) => (
                          <li key={p} className={cn("flex items-start gap-2.5 text-sm", t.highlight ? "text-white/90" : "text-foreground/80")}>
                            <span className={cn("flex-shrink-0 mt-0.5 h-4 w-4 rounded-full flex items-center justify-center",
                              t.highlight ? "bg-accent/20" : "bg-primary/10"
                            )}>
                              <Check className={cn("h-2.5 w-2.5", t.highlight ? "text-accent" : "text-primary")} />
                            </span>
                            {p}
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <div className={cn(
                        "w-full text-center py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-smooth",
                        t.highlight
                          ? "bg-accent text-primary-deep group-hover:bg-accent/90"
                          : "bg-primary text-white group-hover:bg-primary-deep"
                      )}>
                        Join as {t.id} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Trust bar */}
            <div className="mt-8 flex flex-wrap justify-center items-center gap-4 text-xs text-muted-foreground reveal">
              <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> Secured by Pesapal</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> M-Pesa accepted</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Visa &amp; Mastercard</span>
              <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-primary" /> One-time payment</span>
            </div>
          </div>
        )}

        {/* ── REGISTER + PAY ── */}
        {step !== "tier" && (
          <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
            {/* Sidebar */}
            <aside className="lg:col-span-2 bg-gradient-hero rounded-3xl p-8 text-white shadow-elegant relative overflow-hidden h-fit">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-5">
                  <tier.icon className="h-3.5 w-3.5 text-accent" /> {tier.name}
                </div>
                <div className="text-white/60 text-xs uppercase tracking-wider">Your selected tier</div>
                <div className="font-display text-5xl font-extrabold mt-1 mb-1">
                  <span className="text-accent text-2xl align-top">KES </span>{tier.price.toLocaleString()}
                </div>
                <p className="text-white/70 text-xs mb-8">{tier.tagline}</p>

                <ol className="space-y-4 mb-8">
                  {[{ id:"register", label:"Fill in your details" },{ id:"pay", label:`Pay KES ${tier.price.toLocaleString()}` }].map((s, i) => {
                    const order = ["register","pay"];
                    const done = order.indexOf(s.id) < order.indexOf(step);
                    const active = s.id === step;
                    return (
                      <li key={s.id} className="flex items-center gap-3">
                        <div className={cn("flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold",
                          done ? "bg-accent text-primary-deep" : active ? "bg-white text-primary" : "bg-white/20 text-white/50"
                        )}>
                          {done ? <Check className="h-4 w-4" /> : i + 1}
                        </div>
                        <span className={cn("text-sm", active ? "font-semibold text-white" : done ? "text-white/70 line-through" : "text-white/50")}>{s.label}</span>
                      </li>
                    );
                  })}
                </ol>

                <button onClick={() => setStep("tier")} className="text-xs text-white/60 hover:text-accent transition-smooth underline-offset-4 hover:underline">
                  ← Change tier
                </button>
              </div>
            </aside>

            {/* Form / Pay panel */}
            <div className="lg:col-span-3 bg-card rounded-3xl p-6 sm:p-8 shadow-card border border-border/50">
              {step === "register" && (
                <form onSubmit={handleRegister} className="space-y-5 animate-fade-in">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground">Registration</h3>
                    <p className="text-muted-foreground text-sm mt-1">Fields marked * are required.</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input id="fullName" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input id="phone" type="tel" placeholder="07XX XXX XXX" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={form.category} onValueChange={(v) => update("category", v)}>
                        <SelectTrigger id="category"><SelectValue placeholder="Select your category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="University Student">University Student</SelectItem>
                          <SelectItem value="College/TVET Student">College/TVET Student</SelectItem>
                          <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                          <SelectItem value="Form Four Leaver">Form Four Leaver</SelectItem>
                          <SelectItem value="Alumni">Alumni</SelectItem>
                          <SelectItem value="Community Sponsor">Community Sponsor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-border/50">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Academic Info</p>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="institution">Institution *</Label>
                      <Input id="institution" placeholder="e.g. University of Nairobi" value={form.institution} onChange={(e) => update("institution", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course">Course</Label>
                      <Input id="course" placeholder="e.g. BSc Computer Science" value={form.course} onChange={(e) => update("course", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year of Study</Label>
                      <Select value={form.yearOfStudy} onValueChange={(v) => update("yearOfStudy", v)}>
                        <SelectTrigger id="year"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {["1","2","3","4","5","6","Graduated"].map((y) => (
                            <SelectItem key={y} value={y}>{y === "Graduated" ? y : `Year ${y}`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="studentNumber">Student / Admission Number</Label>
                      <Input id="studentNumber" value={form.studentNumber} onChange={(e) => update("studentNumber", e.target.value)} />
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-border/50">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Origin</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="county">County *</Label>
                      <Select value={form.county} onValueChange={(v) => update("county", v)}>
                        <SelectTrigger id="county"><SelectValue placeholder="Select county" /></SelectTrigger>
                        <SelectContent>
                          {KENYA_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subCounty">Sub-County / Ward</Label>
                      <Input id="subCounty" placeholder="e.g. Bukira East" value={form.subCounty} onChange={(e) => update("subCounty", e.target.value)} />
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-border/50">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Personal</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input id="dob" type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                        <SelectTrigger id="gender"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-border/50">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next of Kin</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nokName">Name</Label>
                      <Input id="nokName" value={form.nokName} onChange={(e) => update("nokName", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nokPhone">Phone</Label>
                      <Input id="nokPhone" type="tel" value={form.nokPhone} onChange={(e) => update("nokPhone", e.target.value)} />
                    </div>
                    <div className="space-y-2 sm:col-span-2 pt-2 border-t border-border/50">
                      <Label htmlFor="skills">Skills / Talents</Label>
                      <Textarea id="skills" rows={3} placeholder="e.g. Public speaking, music, programming…" value={form.skills} onChange={(e) => update("skills", e.target.value)} />
                    </div>
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full mt-2" disabled={busy}>
                    {busy ? "Registering..." : "Continue to Payment →"}
                  </Button>
                </form>
              )}

              {step === "pay" && (
                <div className="animate-fade-in space-y-6">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground">Complete Payment</h3>
                    <p className="text-muted-foreground text-sm mt-1">You're one step away from joining KUWESA.</p>
                  </div>

                  {/* Checkout card */}
                  <div className="rounded-2xl bg-gradient-to-br from-primary-deep via-primary to-primary-deep p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-white/60 text-[11px] uppercase tracking-widest">KUWESA · Secure Checkout</div>
                          <div className="font-display text-xl font-bold mt-0.5">{tier.name}</div>
                        </div>
                        <CreditCard className="h-6 w-6 text-accent opacity-80" />
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-white/50 text-xs mb-0.5">Total amount</div>
                          <div className="font-display text-4xl font-extrabold">
                            <span className="text-accent text-xl align-top mr-1">KES</span>{tier.price.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right text-xs text-white/60">
                          <div className="font-medium text-white">{form.fullName}</div>
                          <div>{form.phone}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/10">
                        {["M-PESA","Airtel Money","Visa","Mastercard","Bank"].map((m) => (
                          <span key={m} className="px-2 py-0.5 rounded bg-white/10 text-white/80 text-[10px] font-medium">{m}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary rounded-xl p-3">
                    <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                    Secured by Pesapal. We never see or store your PIN or card details.
                  </div>

                  <Button onClick={handlePay} variant="hero" size="lg" className="w-full" disabled={busy}>
                    <Lock className="h-4 w-4" />
                    {busy ? "Redirecting to Pesapal..." : `Pay KES ${tier.price.toLocaleString()} now`}
                  </Button>
                  <button onClick={() => setStep("register")} className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-smooth">
                    ← Edit my details
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
