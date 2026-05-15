import { useRef, useState } from "react";
import { Check, ChevronRight, Loader2, Shield, Star, Crown } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  category: string;
  institution: string;
  county: string;
  course: string;
  yearOfStudy: string;
  gender: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  skills: string;
  tier: "Member" | "Leader" | "Patron";
}

const FEES = { Member: 200, Leader: 500, Patron: 2000 };

const WARDS = [
  "Isebania Ward",
  "Nyamosense/Komosoko Ward",
  "Tagare Ward",
  "Bukira Central/Ikerege Ward",
  "Makerero Ward",
  "Bukira East Ward",
  "Masaba Ward",
];

const TIER_ICONS = {
  Member: Shield,
  Leader: Star,
  Patron: Crown,
};

const TIER_DESC = {
  Member: "Student or community member",
  Leader: "Active campus leader",
  Patron: "Supporter & mentor",
};

const STEP_LABELS = ["Tier", "Details", "Academic", "Ward", "Confirm"];

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all";

export const Membership = () => {
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    fullName: "",
    phone: "",
    email: "",
    category: "Student",
    institution: "",
    county: "",
    course: "",
    yearOfStudy: "",
    gender: "",
    nextOfKinName: "",
    nextOfKinPhone: "",
    skills: "",
    tier: "Member",
  });

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Fixed validation — each step only checks fields visible on THAT step
  const validateStep = (): { ok: boolean; msg?: string } => {
    if (step === 1) {
      return form.tier ? { ok: true } : { ok: false, msg: "Please select a membership type" };
    }
    if (step === 2) {
      if (!form.fullName.trim()) return { ok: false, msg: "Full name is required" };
      if (!form.phone.trim()) return { ok: false, msg: "Phone number is required" };
      if (!form.institution.trim()) return { ok: false, msg: "Institution is required" };
      return { ok: true };
    }
    if (step === 3) {
      // Academic step — all optional
      return { ok: true };
    }
    if (step === 4) {
      if (!form.county) return { ok: false, msg: "Please select your ward" };
      return { ok: true };
    }
    return { ok: true };
  };

  const next = () => {
    const { ok, msg } = validateStep();
    if (!ok) {
      toast({ title: msg || "Please complete this section", variant: "destructive" });
      return;
    }
    setStep((prev) => (prev + 1) as Step);
    setTimeout(scrollToForm, 50);
  };

  const back = () => {
    setStep((prev) => (prev - 1) as Step);
    setTimeout(scrollToForm, 50);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const member = await api.post<any>("/members", form);
      if (!member?.id) throw new Error("Registration failed — no member ID returned");

      const fee = FEES[form.tier];
      const payment = await api.post<any>("/payments/create", {
        purpose: "membership",
        memberId: member.id,
        payerName: form.fullName,
        payerPhone: form.phone,
        payerEmail: form.email || null,
        amount: fee,
        description: `${form.tier} Registration - KUWESA`,
      });

      if (payment?.redirect_url) {
        window.location.href = payment.redirect_url;
      } else {
        throw new Error("Payment initialization failed — no redirect URL");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const fee = FEES[form.tier];

  return (
    <section id="membership" className="section-padding bg-white">
      <span className="section-number">06</span>
      <div className="container-custom">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 reveal">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-4">
            Membership
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Join <span className="text-primary">KUWESA</span>
          </h2>
          <p className="text-base text-muted-foreground">
            Become part of a vibrant community of empowered students across Kuria West
          </p>
        </div>

        {/* Already a member */}
        <div className="max-w-2xl mx-auto mb-8 bg-accent/10 border-2 border-accent/30 rounded-2xl p-5 text-center reveal">
          <p className="text-sm text-foreground/70 mb-1">Already registered?</p>
          <a
            href="/member/login"
            className="text-primary font-semibold hover:underline inline-flex items-center gap-1 text-sm"
          >
            Access your member dashboard <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        {/* Form Card */}
        <div ref={formRef} className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden reveal">
          {/* Progress Bar */}
          <div className="bg-gray-50 border-b border-gray-100 px-8 pt-6 pb-4">
            <div className="flex justify-between mb-3">
              {STEP_LABELS.map((label, i) => {
                const s = i + 1;
                return (
                  <div key={s} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        step > s
                          ? "bg-primary text-white"
                          : step === s
                          ? "bg-primary text-white ring-4 ring-primary/20"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {step > s ? <Check className="h-4 w-4" /> : s}
                    </div>
                    <span className={`text-[10px] font-medium hidden sm:block ${step >= s ? "text-primary" : "text-gray-400"}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-8">
            {/* Step 1: Tier */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Choose Membership Type</h3>
                  <p className="text-sm text-muted-foreground">Select the tier that best describes you</p>
                </div>
                <div className="grid gap-4">
                  {(["Member", "Leader", "Patron"] as const).map((tier) => {
                    const Icon = TIER_ICONS[tier];
                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, tier }))}
                        className={`w-full flex items-center gap-5 p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                          form.tier === tier
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-gray-200 hover:border-primary/40 hover:bg-gray-50"
                        }`}
                      >
                        <div className={`p-3 rounded-xl ${form.tier === tier ? "bg-primary text-white" : "bg-gray-100 text-gray-400"}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-foreground text-base">{tier}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{TIER_DESC[tier]}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-extrabold text-primary">KES {FEES[tier]}</div>
                          <div className="text-xs text-muted-foreground">one-time</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Your Information</h3>
                  <p className="text-sm text-muted-foreground">Fields marked * are required</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="e.g. John Mwangi Chacha"
                      value={form.fullName}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="e.g. 0712345678"
                      value={form.phone}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email Address <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. john@example.com"
                      value={form.email}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">School / Institution *</label>
                    <input
                      type="text"
                      name="institution"
                      placeholder="e.g. University of Nairobi"
                      value={form.institution}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
                    <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                      <option value="Student">Student</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Professional">Professional</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Academic */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Academic Details</h3>
                  <p className="text-sm text-muted-foreground">All optional — fill what applies to you</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Course / Programme</label>
                    <input
                      type="text"
                      name="course"
                      placeholder="e.g. Bachelor of Commerce"
                      value={form.course}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Year of Study</label>
                    <select name="yearOfStudy" value={form.yearOfStudy} onChange={handleChange} className={inputClass}>
                      <option value="">Select year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="5th Year+">5th Year+</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                      <option value="">Prefer not to say</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Next of Kin Name</label>
                    <input
                      type="text"
                      name="nextOfKinName"
                      placeholder="e.g. Mary Chacha"
                      value={form.nextOfKinName}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Next of Kin Phone</label>
                    <input
                      type="tel"
                      name="nextOfKinPhone"
                      placeholder="e.g. 0722000111"
                      value={form.nextOfKinPhone}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Ward */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Your Ward</h3>
                  <p className="text-sm text-muted-foreground">Select your home ward in Kuria West</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Ward *</label>
                    <select name="county" value={form.county} onChange={handleChange} className={inputClass}>
                      <option value="">Select your ward</option>
                      {WARDS.map((ward) => (
                        <option key={ward} value={ward}>{ward}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Skills & Talents <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <textarea
                      name="skills"
                      placeholder="e.g. Public speaking, coding, sports coaching..."
                      value={form.skills}
                      onChange={handleChange}
                      className={`${inputClass} resize-none`}
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Confirm */}
            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Confirm & Pay</h3>
                  <p className="text-sm text-muted-foreground">Review your details before proceeding to payment</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 space-y-3 text-sm border border-gray-100">
                  {[
                    { label: "Name", value: form.fullName },
                    { label: "Phone", value: form.phone },
                    { label: "Email", value: form.email || "—" },
                    { label: "Institution", value: form.institution },
                    { label: "Ward", value: form.county },
                    { label: "Membership", value: form.tier },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0 last:pb-0">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold text-foreground text-right max-w-[60%]">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 mt-1 border-t-2 border-primary/20">
                    <span className="font-bold text-foreground">Total to Pay</span>
                    <span className="text-2xl font-extrabold text-primary">KES {fee}</span>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground bg-green-50 rounded-lg p-3 border border-green-100">
                  🔒 Secure payment via <strong>Pesapal</strong> — supports M-Pesa, Airtel Money, Visa & Mastercard
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={back}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all font-semibold text-sm text-foreground disabled:opacity-40"
                >
                  ← Back
                </button>
              )}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={next}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 active:scale-[0.98] transition-all font-semibold text-sm shadow-md"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 active:scale-[0.98] transition-all font-bold text-sm shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    <>Pay KES {fee} & Register 🎉</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
