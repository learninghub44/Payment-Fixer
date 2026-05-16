import { useRef, useState } from "react";
import { Check, ChevronRight, Loader2, Shield, Star, Crown, LogIn } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  fullName: string; phone: string; email: string;
  category: string; institution: string; county: string;
  course: string; yearOfStudy: string; gender: string;
  nextOfKinName: string; nextOfKinPhone: string; skills: string;
  tier: "Member" | "Leader" | "Patron";
}

const FEES = { Member: 200, Leader: 500, Patron: 2000 };
const WARDS = ["Isebania Ward","Nyamosense/Komosoko Ward","Tagare Ward","Bukira Central/Ikerege Ward","Makerero Ward","Bukira East Ward","Masaba Ward"];
const TIER_ICONS = { Member: Shield, Leader: Star, Patron: Crown };
const TIER_DESC  = { Member: "Student or community member", Leader: "Active campus leader", Patron: "Supporter & mentor" };
const STEPS = ["Tier","Details","Academic","Ward","Confirm"];

const cls = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all";

export const Membership = () => {
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [form, setForm] = useState<FormData>({
    fullName:"", phone:"", email:"", category:"Student", institution:"",
    county:"", course:"", yearOfStudy:"", gender:"", nextOfKinName:"",
    nextOfKinPhone:"", skills:"", tier:"Member",
  });

  const scroll = () => setTimeout(() => formRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 50);

  const set = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const validate = (): { ok: boolean; msg?: string } => {
    if (step === 1) return form.tier ? { ok:true } : { ok:false, msg:"Please select a membership type" };
    if (step === 2) {
      if (!form.fullName.trim()) return { ok:false, msg:"Full name is required" };
      if (!form.phone.trim())    return { ok:false, msg:"Phone number is required" };
      if (!form.institution.trim()) return { ok:false, msg:"Institution is required" };
    }
    if (step === 4 && !form.county) return { ok:false, msg:"Please select your ward" };
    return { ok: true };
  };

  const next = () => {
    const { ok, msg } = validate();
    if (!ok) { toast({ title: msg, variant:"destructive" }); return; }
    setStep(p => (p + 1) as Step); scroll();
  };
  const back = () => { setStep(p => (p - 1) as Step); scroll(); };

  const submit = async () => {
    setLoading(true);
    setAlreadyExists(false);
    try {
      // Wake up Render server
      try { await api.get("/healthz"); } catch {}

      // Create member
      const member = await api.post<any>("/members", form);
      if (!member?.id) throw new Error("Registration failed — no member ID");

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
        throw new Error("No payment URL received from Pesapal");
      }
    } catch (err: any) {
      const msg: string = err?.message || "Please try again";
      const isDuplicate = msg.includes("duplicate") || msg.includes("already") ||
                          msg.includes("unique") || msg.includes("23505") ||
                          msg.toLowerCase().includes("phone") || msg.toLowerCase().includes("exists");
      const isSleep = msg.includes("502") || msg.includes("503") || msg.includes("fetch");

      if (isDuplicate) {
        setAlreadyExists(true);
      } else {
        toast({
          title: isSleep ? "Server is starting up…" : "Registration Failed",
          description: isSleep
            ? "The server was sleeping. Please wait 30 seconds and try again."
            : msg,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fee = FEES[form.tier];

  return (
    <section id="membership" className="py-16 md:py-24 bg-white">
      <div className="max-w-2xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold tracking-widest uppercase mb-3">
            Membership
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-3">
            Join <span className="text-green-600">KUWESA</span>
          </h2>
          <p className="text-gray-500 text-sm">Become part of a united community of Kuria West students</p>
        </div>

        {/* Already a member banner */}
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-800">Already a member?</p>
            <p className="text-xs text-gray-500">Access your dashboard and membership status</p>
          </div>
          <a href="/member/login" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors whitespace-nowrap">
            <LogIn className="h-3.5 w-3.5" /> Login
          </a>
        </div>

        {/* Duplicate account notice */}
        {alreadyExists && (
          <div className="mb-6 p-5 rounded-xl bg-amber-50 border-2 border-amber-200">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <LogIn className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-amber-800 text-sm mb-1">Account already exists!</p>
                <p className="text-amber-700 text-xs mb-3">
                  A member with this phone number is already registered. If you need to complete your payment, please login to your member dashboard.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a href="/member/login"
                    className="px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors text-center">
                    Login to My Account
                  </a>
                  <button onClick={() => { setAlreadyExists(false); setForm(p => ({ ...p, phone:"", email:"" })); setStep(2); }}
                    className="px-4 py-2 rounded-lg border border-amber-300 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors">
                    Use Different Phone Number
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div ref={formRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Progress */}
          <div className="bg-gray-50 border-b border-gray-100 px-6 pt-5 pb-4">
            <div className="flex justify-between mb-3">
              {STEPS.map((label, i) => {
                const s = i + 1;
                return (
                  <div key={s} className="flex flex-col items-center gap-1">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step > s ? "bg-green-600 text-white" : step === s ? "bg-green-600 text-white ring-4 ring-green-100" : "bg-gray-200 text-gray-400"
                    }`}>
                      {step > s ? <Check className="h-4 w-4" /> : s}
                    </div>
                    <span className={`text-[10px] font-medium hidden sm:block ${step >= s ? "text-green-600" : "text-gray-400"}`}>{label}</span>
                  </div>
                );
              })}
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 rounded-full transition-all duration-500" style={{ width:`${((step-1)/4)*100}%` }} />
            </div>
          </div>

          <div className="p-6">
            {/* Step 1 — Tier */}
            {step === 1 && (
              <div className="space-y-4">
                <div><h3 className="text-lg font-bold text-gray-900 mb-1">Choose Membership Type</h3>
                <p className="text-xs text-gray-500">Select the tier that describes you</p></div>
                <div className="space-y-3">
                  {(["Member","Leader","Patron"] as const).map((tier) => {
                    const Icon = TIER_ICONS[tier];
                    return (
                      <button key={tier} type="button" onClick={() => setForm(p => ({ ...p, tier }))}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                          form.tier === tier ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-200"
                        }`}>
                        <div className={`p-2.5 rounded-xl ${form.tier === tier ? "bg-green-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 text-sm">{tier}</div>
                          <div className="text-xs text-gray-500">{TIER_DESC[tier]}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-green-600">KES {FEES[tier]}</div>
                          <div className="text-[10px] text-gray-400">one-time</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2 — Personal */}
            {step === 2 && (
              <div className="space-y-4">
                <div><h3 className="text-lg font-bold text-gray-900 mb-1">Your Information</h3>
                <p className="text-xs text-gray-500">Fields marked * are required</p></div>
                <div className="space-y-3">
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name *</label>
                  <input type="text" name="fullName" placeholder="e.g. John Mwangi Chacha" value={form.fullName} onChange={set} className={cls} /></div>
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number *</label>
                  <input type="tel" name="phone" placeholder="e.g. 0712345678" value={form.phone} onChange={set} className={cls} /></div>
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Email <span className="font-normal text-gray-400">(optional)</span></label>
                  <input type="email" name="email" placeholder="e.g. john@example.com" value={form.email} onChange={set} className={cls} /></div>
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">School / Institution *</label>
                  <input type="text" name="institution" placeholder="e.g. University of Nairobi" value={form.institution} onChange={set} className={cls} /></div>
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
                  <select name="category" value={form.category} onChange={set} className={cls}>
                    <option value="Student">Student</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Professional">Professional</option>
                    <option value="Other">Other</option>
                  </select></div>
                </div>
              </div>
            )}

            {/* Step 3 — Academic */}
            {step === 3 && (
              <div className="space-y-4">
                <div><h3 className="text-lg font-bold text-gray-900 mb-1">Academic Details</h3>
                <p className="text-xs text-gray-500">All optional</p></div>
                <div className="space-y-3">
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Course / Programme</label>
                  <input type="text" name="course" placeholder="e.g. Bachelor of Commerce" value={form.course} onChange={set} className={cls} /></div>
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Year of Study</label>
                  <select name="yearOfStudy" value={form.yearOfStudy} onChange={set} className={cls}>
                    <option value="">Select year</option>
                    {["1st Year","2nd Year","3rd Year","4th Year","5th Year+","Graduate"].map(y => <option key={y} value={y}>{y}</option>)}
                  </select></div>
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Gender</label>
                  <select name="gender" value={form.gender} onChange={set} className={cls}>
                    <option value="">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select></div>
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Next of Kin Name</label>
                  <input type="text" name="nextOfKinName" placeholder="e.g. Mary Chacha" value={form.nextOfKinName} onChange={set} className={cls} /></div>
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Next of Kin Phone</label>
                  <input type="tel" name="nextOfKinPhone" placeholder="e.g. 0722000111" value={form.nextOfKinPhone} onChange={set} className={cls} /></div>
                </div>
              </div>
            )}

            {/* Step 4 — Ward */}
            {step === 4 && (
              <div className="space-y-4">
                <div><h3 className="text-lg font-bold text-gray-900 mb-1">Your Ward</h3>
                <p className="text-xs text-gray-500">Select your home ward in Kuria West</p></div>
                <div className="space-y-3">
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Ward *</label>
                  <select name="county" value={form.county} onChange={set} className={cls}>
                    <option value="">Select your ward</option>
                    {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select></div>
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Skills & Talents <span className="font-normal text-gray-400">(optional)</span></label>
                  <textarea name="skills" placeholder="e.g. Public speaking, coding, sports coaching…" value={form.skills} onChange={set} className={`${cls} resize-none`} rows={3} /></div>
                </div>
              </div>
            )}

            {/* Step 5 — Confirm */}
            {step === 5 && (
              <div className="space-y-4">
                <div><h3 className="text-lg font-bold text-gray-900 mb-1">Review Your Details</h3>
                <p className="text-xs text-gray-500">Confirm before proceeding to payment</p></div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm">
                  {[
                    ["Name", form.fullName], ["Phone", form.phone],
                    ["Email", form.email||"—"], ["Institution", form.institution],
                    ["Ward", form.county||"—"], ["Membership", form.tier],
                  ].map(([l,v]) => (
                    <div key={l} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-500">{l}</span>
                      <span className="font-semibold text-gray-900 text-right max-w-[55%]">{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 mt-1 border-t-2 border-green-200">
                    <span className="font-bold text-gray-900">Total to Pay</span>
                    <span className="text-2xl font-black text-green-600">KES {fee}</span>
                  </div>
                </div>
                <p className="text-xs text-center text-gray-500 bg-green-50 rounded-lg p-3 border border-green-100">
                  🔒 Secure payment via <strong>Pesapal</strong> — M-Pesa, Airtel Money, Visa & Mastercard
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button type="button" onClick={back} disabled={loading}
                  className="px-5 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 font-semibold text-sm text-gray-700 transition-all disabled:opacity-40">
                  ← Back
                </button>
              )}
              {step < 5 ? (
                <button type="button" onClick={next}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-all shadow-md">
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button type="button" onClick={submit} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-all shadow-md disabled:opacity-50">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : <>Pay KES {fee} & Register 🎉</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
