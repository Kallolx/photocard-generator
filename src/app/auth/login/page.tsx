"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);

      // The AuthContext will have the user with role, we need to get it
      // For now, we'll use a callback approach or refresh the page
      // Redirect will happen after state update
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
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
              Secure Access
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#2c2419] leading-[0.9] uppercase tracking-tighter">
              {t.auth.loginTitle}
            </h1>
          </div>

          {/* Right Side - Login Card */}
          <div className="bg-white border-4 border-[#2c2419] p-8 md:p-10 rounded-none shadow-[12px_12px_0px_0px_#8b6834] relative">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-[#f5e5d3] border-2 border-[#2c2419] p-4 rounded-none flex items-center gap-3">
                  <div className="w-2 h-full bg-[#8b6834] absolute left-0 top-0"></div>
                  <p className="text-[#8b6834] text-sm font-bold">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-xs font-black text-[#2c2419] uppercase tracking-widest"
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
                  className="w-full px-4 py-4 bg-[#faf8f5] border-2 border-[#2c2419] text-[#2c2419] rounded-none focus:bg-white focus:outline-none focus:ring-0 transition-colors font-bold"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-black text-[#2c2419] uppercase tracking-widest"
                >
                  {t.auth.passwordLabel}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-4 bg-[#faf8f5] border-2 border-[#2c2419] text-[#2c2419] rounded-none focus:bg-white focus:outline-none focus:ring-0 transition-colors font-bold pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b6834] hover:text-[#2c2419] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center group cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.remember}
                      onChange={(e) =>
                        setFormData({ ...formData, remember: e.target.checked })
                      }
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-[#2c2419] bg-white rounded-none peer-checked:bg-[#8b6834] transition-colors flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white hidden peer-checked:block"
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
                    </div>
                  </div>
                  <span className="ml-3 text-xs font-black uppercase tracking-wider text-[#5d4e37] group-hover:text-[#2c2419] transition-colors">
                    {t.auth.rememberMe}
                  </span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-black uppercase tracking-widest text-[#8b6834] hover:text-[#2c2419] transition-colors border-b-2 border-transparent hover:border-[#8b6834]"
                >
                  {t.auth.forgotPassword}
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#8b6834] text-white py-4 px-6 rounded-none font-black uppercase tracking-[0.2em] text-xs border-2 border-[#8b6834] hover:bg-[#2c2419] hover:border-[#2c2419] active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[4px_4px_0px_0px_#2c2419] hover:shadow-none"
              >
                {isLoading ? "Signing in..." : t.auth.signInButton}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 pt-8 border-t-2 border-[#f5f0e8] text-center">
              <p className="text-xs font-bold text-[#5d4e37] uppercase tracking-wider">
                {t.auth.noAccount}{" "}
                <Link
                  href="/auth/signup"
                  className="font-black text-[#8b6834] hover:text-[#2c2419] transition-colors"
                >
                  {t.auth.signUpLink}
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
