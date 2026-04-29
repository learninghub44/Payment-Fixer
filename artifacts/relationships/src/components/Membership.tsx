import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Check, CreditCard, Sparkles, Crown, Star, GraduationCap, Shield, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { createPesapalOrder, navigateToPesapal } from "@/lib/pesapal";
import { cn } from "@/lib/utils";

type Step = "tier" | "register" | "pay";

const KENYA_COUNTIES = [
  "Migori", "Kisii", "Homa Bay", "Nyamira", "Kisumu", "Narok", "Nakuru",
  "Nairobi", "Kiambu", "Mombasa", "Machakos", "Kajiado", "Other",
];

type Tier = {
  id: "Member" | "Leader" | "Patron";
  name: string;
  price: number;
  tagline: string;
  icon: typeof GraduationCap;
  perks: string[];
  highlight?: boolean;
};

const TIERS: Tier[] = [
  {
    id: "Member",
    name: "Student Member",
    price: 200,
    tagline: "For every Kuria West student",
    icon: GraduationCap,
    perks: [
      "Lifetime KUWESA membership",
      "Access to all events & meetups",
      "WhatsApp community access",
      "Welfare support eligibility",
    ],
  },
  {
    id: "Leader",
    name: "Leader",
    price: 500,
    tagline: "Step up to lead a ward or program",
    icon: Star,
    highlight: true,
    perks: [
      "Everything in Student Member",
      "Recognition on the leadership page",
      "Priority access to leadership training",
      "Vote on KUWESA programs",
    ],
  },
  {
    id: "Patron",
    name: "Patron",
    price: 2000,
    tagline: "For alumni & community sponsors",
    icon: Crown,
    perks: [
      "Everything in Leader",
      "Listed on KUWESA Patrons honour roll",
      "Direct sponsorship of welfare cases",
      "Annual patrons dinner invitation",
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
    fullName: "", phone: "", email: "", category: "",
    institution: "", course: "", yearOfStudy: "", studentNumber: "",
    county: "", subCounty: "",
    dob: "", gender: "",
    nokName: "", nokPhone: "",
    skills: "",
  });

  const update = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const pickTier = (t: Tier) => {
    setTier(t);
    setStep("register");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = ["fullName", "phone", "category", "institution", "county"] as const;
    for (const f of required) {
      if (!form[f]) {
        toast({ title: "Missing details", description: `Please fill in ${f}.`, variant: "destructive" });
        return;
      }
    }
    setBusy(true);
    try {
      const data = await api.post<{ id: string }>("/members", {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || null,
        category: form.category,
        institution: form.institution,
        course: form.course || null,
        yearOfStudy: form.yearOfStudy || null,
        studentNumber: form.studentNumber || null,
        county: form.county,
        subCounty: form.subCounty || null,
        dateOfBirth: form.dob || null,
        gender: form.gender || null,
        nextOfKinName: form.nokName || null,
        nextOfKinPhone: form.nokPhone || null,
        skills: form.skills || null,
        tier: tier.id,
      });
      setMemberId(data.id);
      toast({
        title: "Registered",
        description: `Now complete the KES ${tier.price.toLocaleString()} ${tier.name} payment.`,
      });
      setStep("pay");
    } catch (e: any) {
      toast({ title: "Registration failed", description: e?.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handlePay = async () => {
    if (!memberId) return;
    setBusy(true);
    try {
      const order = await createPesapalOrder({
        purpose: "membership",
        memberId,
        amount: tier.price,
        payerName: form.fullName,
        payerPhone: form.phone,
        payerEmail: form.email,
        description: `KUWESA ${tier.name} – ${form.fullName}`,
      });
      navigateToPesapal(order.redirect_url);
    } catch (e: any) {
      setBusy(false);
      toast({ title: "Payment failed to start", description: e?.message, variant: "destructive" });
    }
  };

  return (
    <section id="membership" className="section-padding bg-background">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
            Membership
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance mb-4">
            Choose your <span className="text-primary">KUWESA</span> tier
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Strictly for <span className="font-semibold text-foreground">students from Kuria West</span>.
            Pay once, belong for life. Secure checkout via Pesapal — M-Pesa, card or bank.
          </p>
        </div>

        {/* TIER STEP */}
        {step === "tier" && (
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto animate-fade-in">
            {TIERS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => pickTier(t)}
                  className={cn(
                    "group text-left relative rounded-3xl p-7 border-2 transition-smooth hover:-translate-y-1",
                    t.highlight
                      ? "bg-gradient-hero text-white border-accent shadow-elegant"
                      : "bg-card border-border/50 hover:border-primary/40 shadow-card hover:shadow-elegant"
                  )}
                >
                  {t.highlight && (
                    <span className="absolute -top-3 right-6 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent text-accent-foreground text-[11px] font-bold uppercase tracking-wider shadow-soft">
                      <Sparkles className="h-3 w-3" /> Most Popular
                    </span>
                  )}
                  <div
                    className={cn(
                      "inline-flex h-12 w-12 rounded-2xl items-center justify-center mb-4 shadow-soft",
                      t.highlight
                        ? "bg-white/15 text-accent backdrop-blur-md"
                        : "bg-gradient-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3
                    className={cn(
                      "font-display text-xl font-bold mb-1",
                      t.highlight ? "text-white" : "text-foreground"
                    )}
                  >
                    {t.name}
                  </h3>
                  <p
                    className={cn(
                      "text-sm mb-4",
                      t.highlight ? "text-white/80" : "text-muted-foreground"
                    )}
                  >
                    {t.tagline}
                  </p>
                  <div className="flex items-baseline gap-1 mb-5">
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        t.highlight ? "text-accent" : "text-muted-foreground"
                      )}
                    >
                      KES
                    </span>
                    <span
                      className={cn(
                        "font-display text-4xl font-extrabold",
                        t.highlight ? "text-accent" : "text-primary"
                      )}
                    >
                      {t.price.toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        "text-xs",
                        t.highlight ? "text-white/70" : "text-muted-foreground"
                      )}
                    >
                      / one-time
                    </span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {t.perks.map((p) => (
                      <li
                        key={p}
                        className={cn(
                          "flex items-start gap-2 text-sm",
                          t.highlight ? "text-white/90" : "text-foreground/80"
                        )}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4 flex-shrink-0 mt-0.5",
                            t.highlight ? "text-accent" : "text-primary"
                          )}
                        />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <div
                    className={cn(
                      "w-full text-center py-2.5 rounded-xl font-semibold text-sm transition-smooth",
                      t.highlight
                        ? "bg-accent text-accent-foreground group-hover:bg-accent/90"
                        : "bg-primary text-primary-foreground group-hover:bg-primary-deep"
                    )}
                  >
                    Choose {t.name} →
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* REGISTER + PAY */}
        {step !== "tier" && (
          <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
            {/* SIDEBAR */}
            <aside className="lg:col-span-2 bg-gradient-hero rounded-3xl p-8 text-white shadow-elegant relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-4">
                  <tier.icon className="h-3.5 w-3.5 text-accent" /> {tier.name}
                </div>
                <h3 className="font-display text-2xl font-bold mb-2">Your journey</h3>
                <p className="text-white/80 text-sm mb-8">
                  Two quick steps. Switch tier anytime before paying.
                </p>
                <ol className="space-y-4">
                  {[
                    { id: "register", label: "Fill in your student details" },
                    { id: "pay", label: `Pay KES ${tier.price.toLocaleString()} via Pesapal` },
                  ].map((s, i) => {
                    const order = ["register", "pay"];
                    const cur = order.indexOf(step);
                    const idx = order.indexOf(s.id);
                    const done = idx < cur;
                    const active = idx === cur;
                    return (
                      <li key={s.id} className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            done
                              ? "bg-accent text-accent-foreground"
                              : active
                              ? "bg-white text-primary"
                              : "bg-white/20 text-white/70"
                          }`}
                        >
                          {done ? <Check className="h-4 w-4" /> : i + 1}
                        </div>
                        <span className={`pt-1 text-sm ${active ? "font-semibold" : "text-white/80"}`}>
                          {s.label}
                        </span>
                      </li>
                    );
                  })}
                </ol>
                <div className="mt-10 pt-6 border-t border-white/20">
                  <div className="text-white/70 text-xs uppercase tracking-wider">
                    {tier.name} fee
                  </div>
                  <div className="font-display text-4xl font-bold mt-1">
                    KES <span className="text-accent">{tier.price.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => setStep("tier")}
                    className="mt-4 text-xs text-white/70 hover:text-accent underline-offset-4 hover:underline"
                  >
                    ← Change tier
                  </button>
                </div>
              </div>
            </aside>

            <div className="lg:col-span-3 bg-card rounded-3xl p-6 sm:p-8 shadow-card border border-border/50">
              {step === "register" && (
                <form onSubmit={handleRegister} className="space-y-5 animate-fade-in">
                  <h3 className="font-display text-2xl font-bold text-foreground mb-1">Registration</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Tell us about yourself. Fields marked * are required.
                  </p>

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
                      <Label htmlFor="category">Membership Category *</Label>
                      <Select value={form.category} onValueChange={(v) => update("category", v)}>
                        <SelectTrigger id="category"><SelectValue placeholder="Select your category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="University Student">University Student</SelectItem>
                          <SelectItem value="College/TVET Student">College/TVET Student</SelectItem>
                          <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                          <SelectItem value="Form Four Leaver (Joining College)">Form Four Leaver (Joining College)</SelectItem>
                          <SelectItem value="Alumni">Alumni</SelectItem>
                          <SelectItem value="Community Sponsor">Community Sponsor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 sm:col-span-2 pt-2 border-t border-border/50">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Academic info</h4>
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
                          {["1", "2", "3", "4", "5", "6", "Graduated"].map((y) => (
                            <SelectItem key={y} value={y}>{y === "Graduated" ? y : `Year ${y}`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="studentNumber">Student / Admission Number</Label>
                      <Input id="studentNumber" value={form.studentNumber} onChange={(e) => update("studentNumber", e.target.value)} />
                    </div>

                    <div className="space-y-2 sm:col-span-2 pt-2 border-t border-border/50">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Origin</h4>
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

                    <div className="space-y-2 sm:col-span-2 pt-2 border-t border-border/50">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Personal</h4>
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

                    <div className="space-y-2 sm:col-span-2 pt-2 border-t border-border/50">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next of Kin</h4>
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
                      <Textarea id="skills" rows={3} placeholder="e.g. Public speaking, web development, music…" value={form.skills} onChange={(e) => update("skills", e.target.value)} />
                    </div>
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full mt-2" disabled={busy}>
                    {busy ? "Registering..." : "Continue to Payment"}
                  </Button>
                </form>
              )}

              {step === "pay" && (
                <div className="animate-fade-in">
                  {/* Modern checkout card */}
                  <div className="rounded-3xl bg-gradient-to-br from-primary-deep via-primary to-primary p-7 text-white relative overflow-hidden mb-6">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-accent/30 rounded-full blur-3xl" />
                    <div className="relative flex items-start justify-between mb-6">
                      <div>
                        <div className="text-white/70 text-[11px] uppercase tracking-[0.2em] mb-1">
                          KUWESA · Secure Checkout
                        </div>
                        <div className="font-display text-2xl font-bold">{tier.name}</div>
                      </div>
                      <CreditCard className="h-7 w-7 text-accent" />
                    </div>
                    <div className="flex items-end justify-between mb-6">
                      <div>
                        <div className="text-white/60 text-xs">Total</div>
                        <div className="font-display text-5xl font-extrabold leading-none">
                          <span className="text-accent text-2xl align-top">KES </span>
                          {tier.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right text-xs text-white/70">
                        <div>{form.fullName}</div>
                        <div>{form.phone}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/80">
                      <span className="px-2 py-1 rounded-md bg-white/10 backdrop-blur-md">M-PESA</span>
                      <span className="px-2 py-1 rounded-md bg-white/10 backdrop-blur-md">Visa</span>
                      <span className="px-2 py-1 rounded-md bg-white/10 backdrop-blur-md">Mastercard</span>
                      <span className="px-2 py-1 rounded-md bg-white/10 backdrop-blur-md">Airtel Money</span>
                      <span className="px-2 py-1 rounded-md bg-white/10 backdrop-blur-md">Bank</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-5">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>
                      Secured by Pesapal. We never see or store your card / M-Pesa PIN.
                    </span>
                  </div>

                  <Button onClick={handlePay} variant="hero" size="lg" className="w-full" disabled={busy}>
                    <Lock className="h-4 w-4" />
                    {busy ? "Redirecting to Pesapal..." : `Pay KES ${tier.price.toLocaleString()} now`}
                  </Button>
                  <button
                    onClick={() => setStep("register")}
                    className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-primary transition-smooth"
                  >
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
