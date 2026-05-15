import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  course?: string;
  yearOfStudy?: string;
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
  const [step, setStep] = useState<Step>(1);
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
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTierSelect = (tier: "Member" | "Leader" | "Patron") => {
    setForm((prev) => ({ ...prev, tier }));
  };

  const validateStep = (): boolean => {
    if (step === 1) return !!form.tier;
    if (step === 2) return form.fullName && form.phone && form.institution && form.county;
    if (step === 3) return true;
    if (step === 4) return !!form.county;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep()) {
      toast({ title: "Please complete this section", variant: "destructive" });
      return;
    }

    if (step < 5) {
      setStep((prev) => (prev + 1) as Step);
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    try {
      // Register member
      const member = await api.post<any>("/members", form);
      if (!member?.id) throw new Error("Registration failed");

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
        throw new Error("Payment initialization failed");
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
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-4">
            Membership
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6">
            Join <span className="text-primary">KUWESA</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Become part of a vibrant community of empowered students across Kuria West
          </p>
        </div>

        {/* Already Registered */}
        <div className="max-w-2xl mx-auto mb-8 bg-accent/10 border-2 border-accent/30 rounded-xl p-6 text-center reveal">
          <p className="text-sm text-foreground mb-2">Already a member?</p>
          <a href="/member/login" className="text-accent font-semibold hover:underline flex items-center justify-center gap-1">
            Access your dashboard <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        {/* Registration Form */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8 reveal">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex flex-col items-center gap-2">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step >= s
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step > s ? <Check className="h-5 w-5" /> : s}
                  </div>
                </div>
              ))}
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Tier */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-display text-xl font-bold text-foreground">Select Membership Type</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {(["Member", "Leader", "Patron"] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => handleTierSelect(tier)}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        form.tier === tier
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-gray-200 hover:border-primary/50"
                      }`}
                    >
                      <div className="font-display text-3xl font-bold text-primary mb-2">
                        KES {FEES[tier]}
                      </div>
                      <div className="font-semibold text-foreground">{tier}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Personal */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-display text-xl font-bold text-foreground">Your Information</h3>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name *"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number *"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email (optional)"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  name="institution"
                  placeholder="School/Institution *"
                  value={form.institution}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            )}

            {/* Step 3: Academic */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-display text-xl font-bold text-foreground">Academic Details</h3>
                <input
                  type="text"
                  name="course"
                  placeholder="Course/Subject"
                  value={form.course}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  name="yearOfStudy"
                  placeholder="Year of Study"
                  value={form.yearOfStudy}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {/* Step 4: Ward */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-display text-xl font-bold text-foreground">Your Ward</h3>
                <select
                  name="county"
                  value={form.county}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
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
                  placeholder="Skills & Talents"
                  value={form.skills}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                />
              </div>
            )}

            {/* Step 5: Confirm */}
            {step === 5 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-display text-xl font-bold text-foreground">Confirm Registration</h3>
                <div className="bg-gray-50 rounded-lg p-6 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold text-foreground">{form.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold text-foreground">{form.phone}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-600">Institution:</span>
                    <span className="font-semibold text-foreground">{form.institution}</span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-lg text-primary">KES {fee}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4 pt-6">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((prev) => (prev - 1) as Step)}
                  className="px-6 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-semibold"
                  disabled={loading}
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {step === 5 ? (loading ? "Processing..." : `Pay KES ${fee} & Register`) : "Continue"}
                {step < 5 && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </form>

          <p className="text-xs text-center text-gray-500 mt-6 pt-6 border-t border-gray-200">
            Secure payment via Pesapal • Instant activation • Access member dashboard
          </p>
        </div>
      </div>
    </section>
  );
};
