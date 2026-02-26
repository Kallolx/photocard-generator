"use client";

import { Sparkles, Zap, ShieldCheck, Banknote, Users } from "lucide-react";

interface AboutSectionProps {
  t: any;
}

const icons = [
  <Zap key="1" className="w-8 h-8" />,
  <ShieldCheck key="2" className="w-8 h-8" />,
  <Banknote key="3" className="w-8 h-8" />,
  <Users key="4" className="w-8 h-8" />,
];

export default function AboutSection({ t }: AboutSectionProps) {
  return (
    <section
      id="about"
      className="py-32 bg-white px-4 border-b-2 border-[#d4c4b0]/40"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-none bg-[#f5f0e8] border-2 border-[#d4c4b0]/40 mb-6">
            <Sparkles className="w-4 h-4 text-[#8b6834]" />
            <span className="text-xs font-black text-[#8b6834] uppercase tracking-widest">
              About Us
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-[#2c2419] mb-6 uppercase tracking-tight">
            {t.about.title}
          </h2>
          <p className="text-lg text-[#5d4e37] max-w-2xl mx-auto font-medium">
            {t.about.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {t.about.reasons.map((reason: any, i: number) => (
            <div
              key={i}
              className="group relative bg-[#faf8f5] rounded-none p-10 border-2 border-[#d4c4b0]/40 hover:border-[#8b6834] transition-all duration-300"
            >
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-16 h-16 rounded-none bg-white border-4 border-[#2c2419] flex items-center justify-center mb-8 text-[#2c2419] group-hover:bg-[#8b6834] group-hover:text-white group-hover:border-[#8b6834] transition-all">
                  {icons[i]}
                </div>

                {/* Content */}
                <h3 className="text-xl font-black text-[#2c2419] mb-4 uppercase tracking-tight">
                  {reason.title}
                </h3>
                <p className="text-[#5d4e37] leading-relaxed text-sm font-medium">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-24 flex flex-wrap justify-center items-center gap-8">
          <div className="flex items-center gap-3 px-8 py-4 bg-[#f5f0e8] border-2 border-[#d4c4b0]/40 text-[10px] font-black uppercase tracking-[0.2em] text-[#8b6834]">
            <ShieldCheck className="w-4 h-4" strokeWidth={3} />
            Secure & Private
          </div>
          <div className="flex items-center gap-3 px-8 py-4 bg-[#f5f0e8] border-2 border-[#d4c4b0]/40 text-[10px] font-black uppercase tracking-[0.2em] text-[#8b6834]">
            <Zap className="w-4 h-4" strokeWidth={3} />
            Lightning Fast
          </div>
          <div className="flex items-center gap-3 px-8 py-4 bg-[#f5f0e8] border-2 border-[#d4c4b0]/40 text-[10px] font-black uppercase tracking-[0.2em] text-[#8b6834]">
            <Users className="w-4 h-4" strokeWidth={3} />
            10K+ Happy Users
          </div>
        </div>
      </div>
    </section>
  );
}
