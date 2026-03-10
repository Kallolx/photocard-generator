"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    // Email Domain Validation
    const ALLOWED_DOMAINS = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "live.com",
      "icloud.com",
      "me.com",
      "protonmail.com",
      "zoho.com",
      "aol.com",
      "gmx.com",
      "mail.com",
      "yandex.com",
    ];

    const emailDomain = formData.email.split("@")[1];
    if (emailDomain && !ALLOWED_DOMAINS.includes(emailDomain)) {
      setError("Please use a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);

      // Redirect to main app after successful registration
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#faf8f5] flex flex-col relative overflow-hidden ${lang === "bn" ? "font-noto-bengali" : ""}`}
    >
      <LandingNavbar lang={lang} setLang={setLang} t={t} />

      <div className="flex-grow flex items-center justify-center px-4 py-8 md:py-24 relative z-10">
        <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-4 md:gap-12 lg:gap-24 items-center md:pt-12 pt-18 pb-12">
          {/* Left Side - Text */}
          <div className="text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8b6834]/10 border border-[#8b6834]/20 text-[#8b6834] text-[10px] font-black uppercase tracking-widest mb-2">
              Join the future
            </div>
            <h1 className="max-w-md mx-auto md:mx-0 text-4xl md:text-6xl lg:text-7xl font-black text-[#2c2419] leading-[0.9] uppercase tracking-tighter">
              {t.auth.signupTitle}
            </h1>
          </div>

          {/* Right Side - Signup Card */}
          <div className="bg-white border-4 border-[#2c2419] p-8 md:p-10 rounded-none shadow-[12px_12px_0px_0px_#8b6834] relative">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="bg-[#f5e5d3] border-2 border-[#2c2419] p-4 rounded-none flex items-center gap-3">
                  <div className="w-2 h-full bg-[#8b6834] absolute left-0 top-0"></div>
                  <p className="text-[#8b6834] text-sm font-bold">{error}</p>
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="block text-[10px] font-black text-[#2c2419] uppercase tracking-widest"
                >
                  {t.auth.nameLabel}
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#faf8f5] border-2 border-[#2c2419] text-[#2c2419] rounded-none focus:bg-white focus:outline-none focus:ring-0 transition-colors font-bold"
                  placeholder="John Doe"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-[10px] font-black text-[#2c2419] uppercase tracking-widest"
                >
                  {t.auth.emailLabel}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#faf8f5] border-2 border-[#2c2419] text-[#2c2419] rounded-none focus:bg-white focus:outline-none focus:ring-0 transition-colors font-bold"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-[10px] font-black text-[#2c2419] uppercase tracking-widest"
                >
                  {t.auth.passwordLabel}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#faf8f5] border-2 border-[#2c2419] text-[#2c2419] rounded-none focus:bg-white focus:outline-none focus:ring-0 transition-colors font-bold pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b6834] hover:text-[#2c2419] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-[10px] font-bold text-[#8b6834] uppercase tracking-tighter">
                  Minimum 8 characters
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="block text-[10px] font-black text-[#2c2419] uppercase tracking-widest"
                >
                  {t.auth.confirmPasswordLabel}
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-[#faf8f5] border-2 border-[#2c2419] text-[#2c2419] rounded-none focus:bg-white focus:outline-none focus:ring-0 transition-colors font-bold pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b6834] hover:text-[#2c2419] transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="pt-2">
                <label className="flex items-start cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        agreeToTerms: e.target.checked,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 border border-[#d4c4b0] flex-shrink-0 transition-all flex items-center justify-center
                      ${formData.agreeToTerms ? "bg-[#8b6834] border-[#8b6834]" : "bg-white"}`}
                  >
                    {formData.agreeToTerms && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={4}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="ml-3 text-[10px] font-bold text-[#5d4e37] uppercase tracking-tight leading-5">
                    Agree to{" "}
                    <Link
                      href="/terms"
                      className="text-[#8b6834] underline underline-offset-2 hover:text-[#2c2419]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms
                    </Link>{" "}
                    &{" "}
                    <Link
                      href="/privacy"
                      className="text-[#8b6834] underline underline-offset-2 hover:text-[#2c2419]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy
                    </Link>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#8b6834] text-white py-4 px-6 rounded-none font-black uppercase tracking-[0.2em] text-xs border-2 border-[#8b6834] hover:bg-[#2c2419] hover:border-[#2c2419] active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[4px_4px_0px_0px_#2c2419] hover:shadow-none mt-4"
              >
                {isLoading ? "Creating account..." : t.auth.createAccountButton}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#d4c4b0]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#8b6834]">or</span>
                <div className="flex-1 h-px bg-[#d4c4b0]" />
              </div>

              {/* Google Sign-Up */}
              <button
                type="button"
                onClick={() => {}}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white border-2 border-[#2c2419] text-[#2c2419] font-black text-xs uppercase tracking-[0.15em] hover:bg-[#faf8f5] transition-all shadow-[4px_4px_0px_0px_#d4c4b0] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
              >
                {/* Google coloured icon */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 pt-6 border-t-2 border-[#f5f0e8] text-center">
              <p className="text-xs font-bold text-[#5d4e37] uppercase tracking-wider">
                {t.auth.haveAccount}{" "}
                <Link
                  href="/auth/login"
                  className="font-black text-[#8b6834] hover:text-[#2c2419] transition-colors"
                >
                  {t.auth.signInLink}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <LandingFooter t={t} />
    </div>
  );
}
