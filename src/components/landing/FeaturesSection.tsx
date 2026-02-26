"use client";

import { Sparkles, Globe, Layers, Zap, Share2, Image } from "lucide-react";

interface FeaturesSectionProps {
  t: any;
}

const features = [
  {
    icon: <Globe className="w-8 h-8" />,
    key: "newsroom",
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    key: "aiPower",
  },
  {
    icon: <Image className="w-8 h-8" />,
    key: "branding",
  },
  {
    icon: <Share2 className="w-8 h-8" />,
    key: "automation",
  },
  {
    icon: <Layers className="w-8 h-8" />,
    key: "themes",
  },
  {
    icon: <Zap className="w-8 h-8" />,
    key: "api",
  },
];

export default function FeaturesSection({ t }: FeaturesSectionProps) {
  return (
    <section
      id="features"
      className="py-32 bg-[#faf8f5] px-6 lg:px-12 border-b-2 border-[#d4c4b0]/40"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-none bg-white border-2 border-[#d4c4b0]/40 mb-6">
            <Sparkles className="w-4 h-4 text-[#8b6834]" />
            <span className="text-xs font-black text-[#8b6834] uppercase tracking-widest">
              Why Choose Us
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-[#2c2419] mb-6 uppercase tracking-tight">
            {t.features.title}
          </h2>
          <p className="text-lg text-[#5d4e37] max-w-2xl mx-auto font-medium">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-10 bg-white rounded-none border-2 border-[#d4c4b0]/40 transition-all duration-300 hover:border-[#8b6834] overflow-hidden flex flex-col items-center lg:items-start text-center lg:text-left"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-none bg-[#f5f0e8] border-2 border-[#d4c4b0]/40 flex items-center justify-center mb-8 text-[#2c2419] group-hover:bg-[#8b6834] group-hover:text-white group-hover:border-[#8b6834] transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-[#2c2419] mb-4 uppercase tracking-tight">
                  {t.features[feature.key].title}
                </h3>
                <p className="text-[#5d4e37] leading-relaxed text-sm font-medium">
                  {t.features[feature.key].description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-32 grid grid-cols-2 lg:grid-cols-4 gap-0 border-2 border-[#d4c4b0]/40 bg-white">
          <div className="p-10 text-center border-r-2 border-b-2 lg:border-b-0 border-[#d4c4b0]/40 group hover:bg-[#faf8f5] transition-colors">
            <div className="text-5xl font-black text-[#8b6834] mb-3 tracking-tighter group-hover:scale-110 transition-transform">
              12+
            </div>
            <div className="text-[#2c2419] font-black uppercase text-[10px] tracking-[0.2em]">
              Card Types
            </div>
          </div>
          <div className="p-10 text-center border-b-2 lg:border-r-2 lg:border-b-0 border-[#d4c4b0]/40 group hover:bg-[#faf8f5] transition-colors">
            <div className="text-5xl font-black text-[#2c2419] mb-3 tracking-tighter group-hover:scale-110 transition-transform">
              10K+
            </div>
            <div className="text-[#2c2419] font-black uppercase text-[10px] tracking-[0.2em]">
              Happy Users
            </div>
          </div>
          <div className="p-10 text-center border-r-2 border-[#d4c4b0]/40 group hover:bg-[#faf8f5] transition-colors">
            <div className="text-5xl font-black text-[#8b6834] mb-3 tracking-tighter group-hover:scale-110 transition-transform">
              50K+
            </div>
            <div className="text-[#2c2419] font-black uppercase text-[10px] tracking-[0.2em]">
              Cards Created
            </div>
          </div>
          <div className="p-10 text-center group hover:bg-[#faf8f5] transition-colors">
            <div className="text-5xl font-black text-[#2c2419] mb-3 tracking-tighter group-hover:scale-110 transition-transform">
              99%
            </div>
            <div className="text-[#2c2419] font-black uppercase text-[10px] tracking-[0.2em]">
              Satisfaction
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
