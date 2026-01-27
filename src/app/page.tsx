'use client';

import { bn } from '@/locales/bn';
import { en } from '@/locales/en';
import { useState } from 'react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroSection from '@/components/landing/HeroSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import PricingSection from '@/components/landing/PricingSection';
import AboutSection from '@/components/landing/AboutSection';
import LandingFooter from '@/components/landing/LandingFooter';

export default function LandingPage() {
  const [lang, setLang] = useState<'en' | 'bn'>('bn');
  const t = lang === 'bn' ? bn : en;

  return (
    <div className={`min-h-screen bg-[#faf8f5] ${lang === 'bn' ? 'font-noto-bengali' : ''}`}>
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

