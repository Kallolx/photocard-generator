"use client";

import {
  ChevronRight,
  Sparkles,
  Zap,
  Edit3,
  Globe,
  Share2,
} from "lucide-react";
import Link from "next/link";

interface HowItWorksProps {
  t: any;
}

export default function HowItWorksSection({ t }: HowItWorksProps) {
  const steps = [
    {
      number: "01",
      title: t.howItWorks.step1.title,
      description: t.howItWorks.step1.description,
      icon: <Globe className="w-8 h-8" />,
    },
    {
      number: "02",
      title: t.howItWorks.step2.title,
      description: t.howItWorks.step2.description,
      icon: <Zap className="w-8 h-8" />,
    },
    {
      number: "03",
      title: t.howItWorks.step3.title,
      description: t.howItWorks.step3.description,
      icon: <Edit3 className="w-8 h-8" />,
    },
    {
      number: "04",
      title: t.howItWorks.step4.title,
      description: t.howItWorks.step4.description,
      icon: <Share2 className="w-8 h-8" />,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-32 bg-white relative overflow-hidden border-b-2 border-[#d4c4b0]/40"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-none bg-[#f5f0e8] border-2 border-[#d4c4b0]/40 mb-6">
            <Sparkles className="w-4 h-4 text-[#8b6834]" />
            <span className="text-xs font-black text-[#8b6834] uppercase tracking-widest">
              Simple Process
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-[#2c2419] mb-6 uppercase tracking-tight">
            {t.howItWorks.title}
          </h2>
          <p className="text-lg text-[#5d4e37] max-w-2xl mx-auto font-medium">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="relative bg-[#faf8f5] rounded-none p-10 h-full border-2 border-[#d4c4b0]/40 transition-all duration-300 group-hover:border-[#8b6834] group-hover:bg-white flex flex-col items-center lg:items-start text-center lg:text-left">
                {/* Number badge */}
                <div className="absolute -top-6 left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-[-24px] w-12 h-12 rounded-none bg-[#2c2419] text-white flex items-center justify-center font-black text-sm border-2 border-[#2c2419] group-hover:bg-[#8b6834] group-hover:border-[#8b6834] transition-colors">
                  {step.number}
                </div>

                {/* Icon Container */}
                <div className="w-20 h-20 rounded-none bg-white border-4 border-[#2c2419] flex items-center justify-center text-[#2c2419] mb-8 group-hover:bg-[#8b6834] group-hover:text-white group-hover:border-[#8b6834] transition-all">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-black text-[#2c2419] mb-4 uppercase tracking-tight">
                  {step.title}
                </h3>
                <p className="text-[#5d4e37] leading-relaxed text-sm font-medium">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-4 px-12 py-5 rounded-none bg-[#2c2419] text-white text-xs font-black uppercase tracking-[0.2em] border-2 border-[#2c2419] hover:bg-[#8b6834] hover:border-[#8b6834] transition-all text-center"
          >
            <span>Start Creating Now</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
