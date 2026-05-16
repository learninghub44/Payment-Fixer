import { useState } from "react";
import { ChevronRight, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const WARDS = [
  "Nyamosense/Komosoko",
  "Butuburke/Masaba",
  "Iramba",
  "Matwere",
  "Chacha/Wanjala",
  "Magutu/Makongo",
  "Silibwet",
];

type RegistrationStep = 1 | 2 | 3 | 4 | 5;

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  category: string;
  institution: string;
  county: string;
  subCounty?: string;
  ward: string;
  tier: "Member" | "Leader" | "Patron";
}

interface ErrorResponse {
  error: string;
  message: string;
  field?: string;
  details?: Record<string, string>;
}

export const Membership = () => {
  const [step, setStep] = useState<RegistrationStep>(1);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phone: "",
    email: "",
    category: "Student",
    institution: "",
    county: "",
    subCounty: "",
    ward: "",
    tier: "Member",
  });

  const tierPrices = {
    Member: 200,
    Leader: 500,
    Patron: 2000,
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (currentStep: RegistrationStep): boolean => {
    const stepErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.tier) stepErrors.tier = "Please select a membership tier";
    } else if (currentStep === 2) {
      if (!formData.fullName.trim())
        stepErrors.fullName = "Full name is required";
      if (!formData.phone.trim()) stepErrors.phone = "Phone number is required";
      const phoneRegex = /^(\+254|0)[17][0-9]{8}$/;
      if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, "")))
        stepErrors.phone =
          "Invalid phone format (use +254 or 07/06 followed by 8 digits)";

      if (!formData.email.trim()) stepErrors.email = "Email is required";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email))
        stepErrors.email = "Invalid email format";
    } else if (currentStep === 3) {
      if (!formData.category) stepErrors.category = "Category is required";
      if (!formData.institution.trim())
        stepErrors.institution = "Institution is required";
    } else if (currentStep === 4) {
      if (!formData.county.trim()) stepErrors.county = "County is required";
      if (!formData.ward) stepErrors.ward = "Ward is required";
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 5) {
        setStep((step + 1) as RegistrationStep);
      }
    }
  };

  const handleRegister = async () => {
    if (!validateStep(step)) return;

    setLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const response = await api.post("/members", {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.toLowerCase().trim(),
        category: formData.category,
        institution: formData.institution.trim(),
        county: formData.county.trim(),
        tier: formData.tier,
      });

      setSuccessMessage(
        `✅ Registration successful! Redirecting to payment for KES ${tierPrices[formData.tier]}...`
      );

      // Simulate payment redirect (in real app, redirect to Pesapal)
      setTimeout(() => {
        window.location.href = "/payment/success";
      }, 2000);
    } catch (error: any) {
      console.error("Registration error:", error);

      const errorData: ErrorResponse = error.response?.data || {
        error: "Registration failed",
        message: "An unexpected error occurred. Please try again.",
      };

      if (errorData.field) {
        // Single field error (duplicate phone, email, etc.)
        setErrors({ [errorData.field]: errorData.message });
        // Jump to relevant step
        if (errorData.field === "phone" || errorData.field === "email") {
          setStep(2);
        }
      } else if (errorData.details) {
        // Multiple validation errors
        setErrors(errorData.details);
      } else {
        // General error
        setErrors({ general: errorData.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="membership"
      className="section-padding bg-gradient-to-b from-white to-secondary/20"
    >
      <span className="section-number">04</span>

      <div className="container-custom">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 reveal">
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-4">
              Membership
            </div>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Join <span className="text-primary">KUWESA</span> Today
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose your membership tier and start your journey with us
            </p>
          </div>

          {/* Registration Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`h-2 flex-1 rounded-full mx-1 transition-colors ${
                      s <= step ? "bg-primary" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Step {step} of 5
              </p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-800">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800">{errors.general}</p>
              </div>
            )}

            {/* Step 1: Tier Selection */}
            {step === 1 && (
              <div className="space-y-4 reveal">
                <h3 className="font-semibold text-lg text-foreground mb-4">
                  Select Your Membership Tier
                </h3>
                {(["Member", "Leader", "Patron"] as const).map((tier) => (
                  <label
                    key={tier}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.tier === tier
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tier"
                      value={tier}
                      checked={formData.tier === tier}
                      onChange={(e) => handleInputChange("tier", e.target.value)}
                      className="mb-2"
                    />
                    <div className="font-semibold text-foreground">
                      {tier} Membership
                    </div>
                    <div className="text-primary font-bold text-lg">
                      KES {tierPrices[tier]}
                    </div>
                  </label>
                ))}
                {errors.tier && (
                  <p className="text-red-600 text-sm flex gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.tier}
                  </p>
                )}
              </div>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <div className="space-y-4 reveal">
                <h3 className="font-semibold text-lg text-foreground mb-4">
                  Personal Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.fullName && (
                    <p className="text-red-600 text-sm mt-1 flex gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      handleInputChange("phone", e.target.value)
                    }
                    placeholder="+254 or 07/06"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1 flex gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      handleInputChange("email", e.target.value)
                    }
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1 flex gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Institution */}
            {step === 3 && (
              <div className="space-y-4 reveal">
                <h3 className="font-semibold text-lg text-foreground mb-4">
                  Institution & Category
                </h3>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Student">Student</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Professional">Professional</option>
                  </select>
                  {errors.category && (
                    <p className="text-red-600 text-sm mt-1 flex gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Institution *
                  </label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) =>
                      handleInputChange("institution", e.target.value)
                    }
                    placeholder="School/University name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.institution && (
                    <p className="text-red-600 text-sm mt-1 flex gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {errors.institution}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Location */}
            {step === 4 && (
              <div className="space-y-4 reveal">
                <h3 className="font-semibold text-lg text-foreground mb-4">
                  Location
                </h3>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    County *
                  </label>
                  <input
                    type="text"
                    value={formData.county}
                    onChange={(e) =>
                      handleInputChange("county", e.target.value)
                    }
                    placeholder="Your county"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.county && (
                    <p className="text-red-600 text-sm mt-1 flex gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {errors.county}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ward (Kuria West) *
                  </label>
                  <select
                    value={formData.ward}
                    onChange={(e) =>
                      handleInputChange("ward", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a ward</option>
                    {WARDS.map((ward) => (
                      <option key={ward} value={ward}>
                        {ward}
                      </option>
                    ))}
                  </select>
                  {errors.ward && (
                    <p className="text-red-600 text-sm mt-1 flex gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {errors.ward}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Review & Confirm */}
            {step === 5 && (
              <div className="space-y-4 reveal">
                <h3 className="font-semibold text-lg text-foreground mb-4">
                  Review Your Details
                </h3>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-semibold">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-semibold">{formData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-semibold text-sm">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Institution</span>
                    <span className="font-semibold">{formData.institution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ward</span>
                    <span className="font-semibold">{formData.ward}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <span className="text-muted-foreground">Membership</span>
                    <span className="font-semibold">{formData.tier}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2">
                    <span className="font-semibold">Total to Pay</span>
                    <span className="text-2xl font-bold text-primary">
                      KES {tierPrices[formData.tier]}
                    </span>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 flex gap-2">
                    🔒 <span>Secure payment via Pesapal — supports M-Pesa, Airtel Money, Visa & Mastercard</span>
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(Math.max(1, step - 1) as RegistrationStep)}
                disabled={step === 1}
                className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-lg font-semibold text-foreground hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ← Back
              </button>

              {step < 5 ? (
                <button
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Pay KES {tierPrices[formData.tier]} & Register 🎉</>
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
