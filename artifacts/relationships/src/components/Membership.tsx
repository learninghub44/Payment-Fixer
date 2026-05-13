import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, CreditCard, Shield, Lock, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { createPesapalOrder, navigateToPesapal } from "@/lib/pesapal";

type Step = "register" | "pay";

const KENYA_COUNTIES = [
  "Migori","Kisii","Homa Bay","Nyamira","Kisumu","Narok","Nakuru",
  "Nairobi","Kiambu","Mombasa","Machakos","Kajiado","Other",
];

const FEE_OPTIONS = [
  { id: "Member",  label: "Member Registration", amount: 200,  desc: "For every Kuria West student" },
  { id: "Leader",  label: "Leader",               amount: 500,  desc: "For ward/programme leaders" },
  { id: "Patron",  label: "Patron",               amount: 2000, desc: "For alumni & community sponsors" },
];

export const Membership = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("register");
  const [busy, setBusy] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName:"", phone:"", email:"", category:"", tier:"Member",
    institution:"", course:"", yearOfStudy:"", studentNumber:"",
    county:"", subCounty:"", dob:"", gender:"",
    nokName:"", nokPhone:"", skills:"",
  });

  const update = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }));
  const selectedFee = FEE_OPTIONS.find((f) => f.id === form.tier) ?? FEE_OPTIONS[0];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of ["fullName","phone","category","institution","county","tier"] as const) {
      if (!form[f]) { toast({ title: "Missing details", description: `Please fill in all required fields.`, variant: "destructive" }); return; }
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
        nextOfKinPhone: form.nokPhone || null, skills: form.skills || null,
        tier: form.tier,
      });
      setMemberId(data.id);
      toast({ title: "Registered ✓", description: `Complete your KES ${selectedFee.amount.toLocaleString()} registration fee to activate your membership.` });
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
        purpose: "membership", memberId, amount: selectedFee.amount,
        payerName: form.fullName, payerPhone: form.phone, payerEmail: form.email,
        description: `KUWESA ${selectedFee.label} Registration – ${form.fullName}`,
      });
      navigateToPesapal(order.redirect_url);
    } catch (e: any) {
      setBusy(false);
      const errorMsg = e?.message || "Failed to start payment. Please try again.";
      toast({ title: "Payment error", description: errorMsg, variant: "destructive" });
      console.error("Payment initiation error:", e);
    }
  };

  return (
    <section id="membership" className="section-padding bg-gradient-soft relative overflow-hidden">
      <span className="section-number">05</span>
      <div className="container-custom">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 reveal">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">Join KUWESA</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance mb-4">
            Association <span className="text-primary">Registration</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Strictly for <span className="font-semibold text-foreground">students from Kuria West Constituency</span>.
            Fill in your details and pay your registration fee once to become a KUWESA member.
          </p>

          {/* Fee summary */}
          <div className="mt-8 inline-flex flex-wrap justify-center gap-3">
            {FEE_OPTIONS.map((f) => (
              <div key={f.id} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-card text-sm">
                <span className="font-semibold text-foreground">{f.label}</span>
                <span className="text-muted-foreground">—</span>
                <span className="font-bold text-primary">KES {f.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Registration form */}
          {step === "register" && (
            <div className="bg-card rounded-3xl shadow-card border border-border/50 overflow-hidden reveal">
              {/* Form header */}
              <div className="bg-gradient-hero px-8 py-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">Member Registration Form</h3>
                  <p className="text-white/70 text-sm">Fields marked * are required</p>
                </div>
              </div>

              <form onSubmit={handleRegister} className="p-6 sm:p-8 space-y-8">

                {/* Registration fee */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                  <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">1</span>
                    Registration Fee *
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {FEE_OPTIONS.map((f) => (
                      <label key={f.id}
                        className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          form.tier === f.id
                            ? "border-primary bg-primary/10 shadow-soft"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <input type="radio" name="tier" value={f.id} checked={form.tier === f.id}
                          onChange={() => update("tier", f.id)} className="sr-only" />
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-foreground text-sm">{f.label}</span>
                          {form.tier === f.id && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        <span className="font-display text-2xl font-extrabold text-primary">KES {f.amount.toLocaleString()}</span>
                        <span className="text-muted-foreground text-xs mt-1">{f.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Personal info */}
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">2</span>
                    Personal Information
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input id="fullName" placeholder="As on your ID/admission letter" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" type="tel" placeholder="07XX XXX XXX" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="Optional" value={form.email} onChange={(e) => update("email", e.target.value)} />
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
                  </div>
                </div>

                {/* Academic info */}
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">3</span>
                    Academic Information
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="category">Membership Category *</Label>
                      <Select value={form.category} onValueChange={(v) => update("category", v)}>
                        <SelectTrigger id="category"><SelectValue placeholder="Select your category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="University Student">University Student</SelectItem>
                          <SelectItem value="College/TVET Student">College/TVET Student</SelectItem>
                          <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                          <SelectItem value="Form Four Leaver">Form Four Leaver (Joining College)</SelectItem>
                          <SelectItem value="Alumni">Alumni</SelectItem>
                          <SelectItem value="Community Sponsor">Community Sponsor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="institution">Institution *</Label>
                      <Input id="institution" placeholder="e.g. University of Nairobi" value={form.institution} onChange={(e) => update("institution", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course">Course / Programme</Label>
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
                  </div>
                </div>

                {/* Origin */}
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">4</span>
                    Area of Origin
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4">
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
                      <Label htmlFor="subCounty">Ward (in Kuria West)</Label>
                      <Select value={form.subCounty} onValueChange={(v) => update("subCounty", v)}>
                        <SelectTrigger id="subCounty"><SelectValue placeholder="Select ward" /></SelectTrigger>
                        <SelectContent>
                          {["Isebania","Nyamosense/Komosoko","Tagare","Bukira Central/Ikerege","Makerero","Bukira East","Masaba"].map((w) => (
                            <SelectItem key={w} value={w}>{w}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Next of kin & skills */}
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">5</span>
                    Next of Kin &amp; Skills
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nokName">Next of Kin Name</Label>
                      <Input id="nokName" value={form.nokName} onChange={(e) => update("nokName", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nokPhone">Next of Kin Phone</Label>
                      <Input id="nokPhone" type="tel" value={form.nokPhone} onChange={(e) => update("nokPhone", e.target.value)} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="skills">Skills / Talents</Label>
                      <Textarea id="skills" rows={2} placeholder="e.g. Public speaking, music, programming, sports…" value={form.skills} onChange={(e) => update("skills", e.target.value)} />
                    </div>
                  </div>
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
                  {busy ? "Submitting..." : `Register & Proceed to Pay KES ${selectedFee.amount.toLocaleString()}`}
                </Button>
              </form>
            </div>
          )}

          {/* Payment step */}
          {step === "pay" && (
            <div className="bg-card rounded-3xl shadow-card border border-border/50 p-6 sm:p-8 space-y-6 animate-fade-in reveal">
              <div>
                <h3 className="font-display text-2xl font-bold text-foreground">Complete Registration Fee</h3>
                <p className="text-muted-foreground text-sm mt-1">You're one step away from becoming a KUWESA member.</p>
              </div>

              {/* Summary */}
              <div className="rounded-2xl bg-gradient-to-br from-primary-deep via-primary to-primary-deep p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="text-white/60 text-[11px] uppercase tracking-widest mb-3">KUWESA · Secure Checkout</div>
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <div className="text-white/60 text-xs">Registration Type</div>
                      <div className="font-display text-xl font-bold">{selectedFee.label}</div>
                    </div>
                    <CreditCard className="h-6 w-6 text-accent opacity-80" />
                  </div>
                  <div className="flex items-end justify-between pb-4 border-b border-white/15">
                    <div>
                      <div className="text-white/50 text-xs mb-0.5">Registration Fee</div>
                      <div className="font-display text-4xl font-extrabold">
                        <span className="text-accent text-xl align-top mr-1">KES</span>{selectedFee.amount.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right text-xs text-white/60">
                      <div className="font-medium text-white">{form.fullName}</div>
                      <div>{form.phone}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-4">
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
                {busy ? "Redirecting to Pesapal..." : `Pay KES ${selectedFee.amount.toLocaleString()} now`}
              </Button>
              <button onClick={() => setStep("register")} className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-smooth">
                ← Go back and edit my details
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
