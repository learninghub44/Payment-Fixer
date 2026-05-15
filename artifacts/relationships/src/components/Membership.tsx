import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type FormStep = 1 | 2 | 3 | 4 | 5;

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  category: string;
  institution: string;
  county: string;
  course?: string;
  yearOfStudy?: string;
  studentNumber?: string;
  gender?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  skills?: string;
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

export const Membership = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<FormStep>(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    fullName: "",
    phone: "",
    email: "",
    category: "Student",
    institution: "",
    county: "",
    tier: "Member",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTierChange = (tier: "Member" | "Leader" | "Patron") => {
    setForm((prev) => ({ ...prev, tier }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 5) {
      setStep((prev) => (prev + 1) as FormStep);
      return;
    }

    // Validate required fields
    if (!form.fullName || !form.phone || !form.institution || !form.county) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Create member
      const member = await api.post<any>("/members", form);
      if (!member?.id) throw new Error("Failed to create member");

      // Create payment
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
        throw new Error("No payment link received");
      }
    } catch (error: any) {
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
    <section id="membership" className="section-padding bg-background">
      <span className="section-number">06</span>
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12 reveal">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
            Join KUWESA
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance mb-4">
            Association <span className="text-primary">Registration</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Join thousands of Kuria West students. Fill your details and complete payment to activate your account.
          </p>
        </div>

        {/* Member Login CTA */}
        <div className="max-w-2xl mx-auto mb-8 bg-accent/10 border-2 border-accent/30 rounded-2xl p-6 text-center reveal">
          <p className="text-sm text-foreground mb-2">Already a member?</p>
          <a href="/member/login" className="text-accent font-bold hover:underline">
            Login to your dashboard →
          </a>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-elegant p-8 border border-border/50 reveal">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex flex-col items-center gap-2">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step >= s
                        ? "bg-primary text-white"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {step > s ? <Check className="h-5 w-5" /> : s}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {["Fee", "Personal", "Academic", "Ward", "Confirm"][s - 1]}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Fee Selection */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-display text-xl font-bold text-foreground">Select Membership Type</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {(["Member", "Leader", "Patron"] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => handleTierChange(tier)}
                      className={`p-6 rounded-2xl border-2 transition-all text-center ${
                        form.tier === tier
                          ? "border-primary bg-primary/5"
                          : "border-border/50 hover:border-primary/50"
                      }`}
                    >
                      <div className="font-display text-2xl font-bold text-primary mb-2">
                        KES {FEES[tier]}
                      </div>
                      <div className="font-semibold text-foreground">{tier}</div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {tier === "Member" && "Full member benefits"}
                        {tier === "Leader" && "Leadership roles"}
                        {tier === "Patron" && "Patron benefits"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-display text-xl font-bold text-foreground">Personal Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name *"
                    value={form.fullName}
                    onChange={handleChange}
                    className="col-span-2 px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number *"
                    value={form.phone}
                    onChange={handleChange}
                    className="px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Academic Info */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-display text-xl font-bold text-foreground">Academic Information</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="institution"
                    placeholder="Institution/School *"
                    value={form.institution}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <input
                    type="text"
                    name="course"
                    placeholder="Course/Subject"
                    value={form.course}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    name="yearOfStudy"
                    placeholder="Year of Study"
                    value={form.yearOfStudy}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Ward Selection */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-display text-xl font-bold text-foreground">Area of Origin</h3>
                <select
                  name="county"
                  value={form.county}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select Your Ward *</option>
                  {WARDS.map((ward) => (
                    <option key={ward} value={ward}>
                      {ward}
                    </option>
                  ))}
                </select>
                <textarea
                  name="skills"
                  placeholder="Skills / Talents (optional)"
                  value={form.skills}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                />
              </div>
            )}

            {/* Step 5: Confirmation */}
            {step === 5 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-display text-xl font-bold text-foreground">Confirm Registration</h3>
                <div className="bg-secondary rounded-2xl p-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-semibold text-foreground">{form.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-semibold text-foreground">{form.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Institution:</span>
                    <span className="font-semibold text-foreground">{form.institution}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/50 pt-3">
                    <span className="text-muted-foreground">Fee:</span>
                    <span className="font-bold text-primary text-lg">KES {fee}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4 pt-6">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((prev) => (prev - 1) as FormStep)}
                  className="px-6 py-3 rounded-xl border border-border hover:bg-secondary transition-colors font-semibold"
                  disabled={loading}
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50"
                disabled={loading}
              >
                {step === 5 ? (loading ? "Processing..." : `Pay KES ${fee} & Register`) : "Continue"}
              </button>
            </div>
          </form>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center mt-6 pt-6 border-t border-border/50">
            ✓ Secure payment via Pesapal • ✓ Instant account activation • ✓ Access member dashboard
          </p>
        </div>
      </div>
    </section>
  );
};
