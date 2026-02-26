"use client";

import { bn } from "@/locales/bn";
import { en } from "@/locales/en";
import { useState } from "react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import AboutSection from "@/components/landing/AboutSection";
import LandingFooter from "@/components/landing/LandingFooter";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LandingPage() {
  const { lang, setLang, t } = useLanguage();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <div
      className={`min-h-screen bg-[#faf8f5] ${lang === "bn" ? "font-noto-bengali" : ""}`}
    >
      <LandingNavbar lang={lang} setLang={setLang} t={t} />
      <HeroSection t={t} />
      <HowItWorksSection t={t} />
      <FeaturesSection t={t} />
      <PricingSection t={t} />
      <AboutSection t={t} />
      <LandingFooter t={t} />
    </div>
  );
}
