"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const CARD_COLORS = ["#8b6834", "#2c2419", "#d4c4b0", "#5d4e37"];

interface HeroSectionProps {
  t: any;
}

export default function HeroSection({ t }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CARD_COLORS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-32 pb-20 px-4 bg-[#faf8f5] border-b-2 border-[#d4c4b0]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-[#f5f0e8] border-2 border-[#d4c4b0] mb-6">
              <span className="text-sm font-inter font-semibold text-[#8b6834] uppercase tracking-wider">
                For Journalists & Publishers
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-lora font-bold mb-6 leading-tighter text-[#2c2419]">
              {t.hero.title}
              <br />
              <span className="text-[#8b6834]">{t.hero.titleHighlight}</span>
            </h1>

            <p className="text-xl text-[#5d4e37] mb-10 leading-relaxed font-inter">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/url"
                className="px-8 py-4 bg-[#8b6834] text-[#faf8f5] text-lg font-inter font-semibold border-2 border-[#6b4e25] hover:bg-[#6b4e25] transition-all text-center"
              >
                {t.hero.ctaPrimary}
              </Link>
              <button className="px-8 py-4 border-2 border-[#8b6834] text-[#8b6834] text-lg font-inter font-semibold hover:bg-[#f5f0e8] transition-all">
                {t.hero.ctaSecondary}
              </button>
            </div>
          </div>

          <div className="relative h-[400px] flex items-center justify-center">
            {CARD_COLORS.map((color, index) => {
              const offset =
                (index - activeIndex + CARD_COLORS.length) % CARD_COLORS.length;
              if (offset > 2) {
                // Keep the last item just hidden behind the stack so it can transition in
                if (offset !== CARD_COLORS.length - 1) return null;
              }

              // Custom transition logic for the stack effect
              const isHidden = offset > 2;

              return (
                <div
                  key={index}
                  className="absolute w-full max-w-sm aspect-square border-2 border-[#d4c4b0] shadow-xl transition-all duration-700 ease-in-out"
                  style={{
                    backgroundColor: color,
                    zIndex: 30 - offset * 10,
                    transform: `scale(${1 - (offset > 2 ? 0.15 : offset * 0.05)}) translateY(-${offset > 2 ? 40 : offset * 20}px)`,
                    opacity: isHidden ? 0 : 1,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white/50 text-6xl font-lora font-bold opacity-20">
                      {index + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
