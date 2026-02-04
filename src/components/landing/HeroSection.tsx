"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const CARD_GRADIENTS = [
  "from-blue-500 via-purple-500 to-indigo-500",
  "from-purple-500 via-pink-500 to-rose-500",
  "from-indigo-500 via-blue-500 to-cyan-500",
  "from-violet-500 via-purple-500 to-fuchsia-500"
];

interface HeroSectionProps {
  t: any;
}

export default function HeroSection({ t }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CARD_GRADIENTS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="relative pt-32 pb-20 px-4 bg-gradient-to-br from-slate-50 via-white to-purple-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 border border-purple-200 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
              </span>
              <span className="text-sm font-semibold text-purple-700 tracking-wide">
                AI-Powered Social Media Cards
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-gray-900">{t.hero.title}</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {t.hero.titleHighlight}
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/url"
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition-all text-center"
              >
                <span className="flex items-center justify-center gap-2">
                  {t.hero.ctaPrimary}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <button className="px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 text-lg font-semibold hover:border-purple-500 hover:bg-purple-50 transition-all">
                {t.hero.ctaSecondary}
              </button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Free Forever Plan</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">No Credit Card</span>
              </div>
            </div>
          </div>

          <div className="relative h-[500px] flex items-center justify-center">
            {CARD_GRADIENTS.map((gradient, index) => {
              const offset = (index - activeIndex + CARD_GRADIENTS.length) % CARD_GRADIENTS.length;
              if (offset > 2 && offset !== CARD_GRADIENTS.length - 1) return null;
              const isHidden = offset > 2;

              return (
                <div
                  key={index}
                  className={`absolute w-full max-w-md aspect-[4/5] rounded-3xl shadow-2xl transition-all duration-700 ease-in-out bg-gradient-to-br ${gradient}`}
                  style={{
                    zIndex: 30 - offset * 10,
                    transform: `translateY(-${offset > 2 ? 40 : offset * 20}px) translateX(${offset * 8}px) rotate(${offset * 2}deg)`,
                    opacity: isHidden ? 0 : 1,
                  }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center mb-4">
                      <span className="text-3xl font-bold">{index + 1}</span>
                    </div>
                    <div className="space-y-3 w-full">
                      <div className="h-4 bg-white/30 rounded-full w-3/4 mx-auto"></div>
                      <div className="h-4 bg-white/20 rounded-full w-1/2 mx-auto"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
