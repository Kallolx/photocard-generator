"use client";

import Link from "next/link";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const { t, lang, setLang } = useLanguage();

  return (
    <div
      className={`min-h-screen bg-[#faf8f5] flex flex-col ${lang === "bn" ? "font-noto-bengali" : ""}`}
    >
      <LandingNavbar lang={lang} setLang={setLang} t={t} />

      <div className="flex-grow flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-lg mx-auto">
          {/* Error Code */}
          <h1 className="text-9xl font-lora font-bold text-[#8b6834] opacity-20 select-none">
            404
          </h1>

          {/* Message */}
          <div className="-mt-12 relative z-10">
            <h2 className="text-3xl md:text-4xl font-lora font-bold text-[#2c2419] mb-4">
              Page Not Found
            </h2>
            <p className="text-[#5d4e37] font-inter text-lg mb-8 leading-relaxed">
              We couldn't find the page you were looking for. It might have been
              removed, renamed, or doesn't exist.
            </p>

            {/* Action */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#8b6834] text-[#faf8f5] px-8 py-3 font-inter font-semibold hover:bg-[#6b4e25] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
