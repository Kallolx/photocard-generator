"use client";

import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPage() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      className={`min-h-screen bg-[#faf8f5] flex flex-col ${
        lang === "bn" ? "font-noto-bengali" : "font-inter"
      }`}
    >
      <LandingNavbar lang={lang} setLang={setLang} t={t} />

      <main className="flex-grow container mx-auto px-4 py-32 max-w-4xl">
        <div className="bg-white p-8 md:p-12 border-2 border-[#d4c4b0] shadow-sm">
          <h1 className="text-3xl md:text-4xl font-lora font-bold text-[#2c2419] mb-4 text-center">
            {t.privacy.title}
          </h1>
          <p className="text-[#8b6834] mb-12 text-center font-medium">
            {t.privacy.lastUpdated}
          </p>

          <div className="space-y-8 text-[#5d4e37] leading-relaxed">
            {t.privacy.sections.map((section: any, idx: number) => (
              <div key={idx}>
                <h2 className="text-xl font-bold mb-3 text-[#2c2419] font-lora">
                  {section.heading}
                </h2>
                <p>{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <LandingFooter t={t} />
    </div>
  );
}
