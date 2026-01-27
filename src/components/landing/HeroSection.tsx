'use client';

import Link from 'next/link';

interface HeroSectionProps {
  t: any;
}

export default function HeroSection({ t }: HeroSectionProps) {
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

          <div className="relative">
            <div className="bg-white border-2 border-[#d4c4b0] p-8">
              <div className="aspect-video bg-[#f5f0e8] border-2 border-[#d4c4b0] flex items-center justify-center">
                <svg className="w-32 h-32 text-[#c19a6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square bg-[#f5f0e8] border border-[#d4c4b0]"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
