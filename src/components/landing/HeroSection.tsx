"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Sparkles, ChevronRight, PlayCircle, X, Play } from "lucide-react";

interface HeroSectionProps {
  t: any;
}

export default function HeroSection({ t }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="home"
      className="relative pt-32 pb-20 px-6 lg:px-12 bg-[#faf8f5] overflow-hidden border-b-2 border-[#d4c4b0]/40"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left relative">
            {/* Pulsing Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-none bg-[#f5f0e8] border-2 border-[#8b6834]/20 mb-8 group transition-all hover:border-[#8b6834]/40">
              <div className="relative">
                <Sparkles className="w-4 h-4 text-[#8b6834]" />
              </div>
              <span className="text-xs font-black text-[#8b6834] uppercase tracking-[0.2em]">
                {t.hero.badge || "AI-Powered Social Media Cards"}
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-6xl font-black mb-4 leading-[1.05] uppercase tracking-tighter text-[#2c2419]">
              <span className="block mb-2">{t.hero.title}</span>
              <span className="inline-block px-4 py-1 bg-[#8b6834] text-[#faf8f5] transform -rotate-1 skew-x-[-4deg] whitespace-nowrap animate-hero-slide-in">
                {t.hero.titleHighlight}
              </span>
            </h1>

            <p className="text-xl text-[#5d4e37] mb-10 leading-relaxed tracking-tight font-bold max-w-2xl mx-auto lg:mx-0 border-l-4 border-[#8b6834]/20 lg:pl-6 pl-0">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start w-full sm:w-auto">
              <Link
                href="/dashboard"
                className="group px-8 py-4 rounded-none bg-[#8b6834] text-white text-xs font-black uppercase tracking-[0.2em] border-2 border-[#8b6834] hover:bg-[#2c2419] hover:border-[#2c2419] transition-all text-center flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_#2c2419] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                {t.hero.ctaPrimary}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => setShowVideo(true)}
                className="group px-8 py-4 rounded-none border-2 border-[#2c2419] text-[#2c2419] text-xs font-black uppercase tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_#8b6834] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                <PlayCircle className="w-5 h-5 text-[#8b6834]" />
                {t.hero.ctaSecondary}
              </button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-10 text-[10px] font-black uppercase tracking-widest text-[#b49e82]">
              <div className="flex items-center gap-3 border-b-2 border-transparent hover:border-[#8b6834]/20 pb-1 transition-all">
                <div className="w-6 h-6 rounded-none bg-[#f5f0e8] border border-[#d4c4b0]/40 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-[#8b6834]" />
                </div>
                <span>Free Forever Plan</span>
              </div>
              <div className="flex items-center gap-3 border-b-2 border-transparent hover:border-[#8b6834]/20 pb-1 transition-all">
                <div className="w-6 h-6 rounded-none bg-[#f5f0e8] border border-[#d4c4b0]/40 flex items-center justify-center">
                  <Play className="w-3 h-3 text-[#8b6834] fill-[#8b6834]" />
                </div>
                <span>No Credit Card</span>
              </div>
            </div>
          </div>

          <div className="relative h-[600px] hidden lg:flex items-center justify-center">
            {[0, 1, 2, 3].map((index) => {
              const offset = (index - activeIndex + 4) % 4;
              if (offset > 2 && offset !== 3) return null;

              return (
                <div
                  key={index}
                  className={`absolute w-full max-w-sm aspect-[4/5] bg-white border-4 border-[#2c2419] rounded-none transition-all duration-700 ease-in-out p-1`}
                  style={{
                    zIndex: 30 - offset * 10,
                    transform: `translateY(-${offset * 25}px) translateX(${offset * 15}px) rotate(${offset * 1}deg)`,
                    opacity: offset > 2 ? 0 : 1,
                  }}
                >
                  <div className="w-full h-full border-2 border-[#d4c4b0]/40 bg-white flex flex-col p-6">
                    <div className="h-48 bg-[#f5f0e8] border-2 border-[#d4c4b0]/20 mb-6 relative overflow-hidden">
                      <div className="absolute top-4 left-4 bg-[#8b6834] px-3 py-1 text-[8px] font-black text-white uppercase tracking-widest rounded-none">
                        Template {index + 1}
                      </div>
                    </div>

                    <div className="space-y-4 flex-1">
                      <div className="h-6 bg-[#2c2419] rounded-none w-full"></div>
                      <div className="h-6 bg-[#2c2419] rounded-none w-4/5"></div>
                      <div className="h-4 bg-[#d4c4b0]/40 rounded-none w-full mt-4"></div>
                      <div className="h-4 bg-[#d4c4b0]/40 rounded-none w-3/4"></div>
                    </div>

                    <div className="mt-auto pt-6 border-t-2 border-[#d4c4b0]/20 flex items-center justify-between">
                      <div className="w-10 h-10 bg-[#8b6834] rounded-none flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="h-4 bg-[#2c2419] rounded-none w-24"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#2c2419]/90 backdrop-blur-sm"
            onClick={() => setShowVideo(false)}
          ></div>
          <div className="relative w-full max-w-4xl bg-[#faf8f5] border-8 border-[#2c2419] rounded-none shadow-[20px_20px_0px_0px_#8b6834] animate-in zoom-in-95 duration-300 overflow-hidden">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-[#2c2419] text-[#faf8f5] flex items-center justify-center hover:bg-[#8b6834] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="aspect-video w-full bg-black">
              <iframe
                src="https://www.youtube.com/embed/JQx1hi48Z8Q?autoplay=1&controls=1"
                title="Product Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            <div className="p-6 bg-[#2c2419] flex items-center justify-between">
              <span className="text-white font-black uppercase text-xs tracking-widest flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-[#8b6834]" />
                Socialcard Product Demo
              </span>
              <span className="text-[#8b6834] font-bold text-[10px] uppercase tracking-widest">
                Watch how we transform news instantly
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
