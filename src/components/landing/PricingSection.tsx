"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import WhatsAppModal from "../WhatsAppModal";
import { Check, Sparkles } from "lucide-react";

interface PricingSectionProps {
  t: any;
}

export default function PricingSection({ t }: PricingSectionProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    price: string;
  } | null>(null);

  const handleFreePlan = () => {
    router.push("/auth/signup");
  };

  const handleUpgrade = (planName: string, price: string) => {
    setSelectedPlan({ name: planName, price });
    setIsModalOpen(true);
  };

  return (
    <section
      id="pricing"
      className="py-32 px-4 bg-white border-b-2 border-[#d4c4b0]/40"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-none bg-[#f5f0e8] border-2 border-[#d4c4b0]/40 mb-6">
            <Sparkles className="w-4 h-4 text-[#8b6834]" />
            <span className="text-xs font-black text-[#8b6834] uppercase tracking-widest">
              Pricing Plans
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-[#2c2419] mb-6 uppercase tracking-tight">
            {t.pricing.title}
          </h2>
          <p className="text-lg text-[#5d4e37] max-w-2xl mx-auto font-medium">
            {t.pricing.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 max-w-6xl mx-auto border-2 border-[#d4c4b0]/40">
          {/* Free Plan */}
          <div className="relative bg-white p-12 border-b-2 lg:border-b-0 lg:border-r-2 border-[#d4c4b0]/40 flex flex-col">
            <div className="mb-10">
              <h3 className="text-sm font-black text-[#8b6834] uppercase tracking-[0.2em] mb-4">
                {t.pricing.free.name}
              </h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-6xl font-black text-[#2c2419] tracking-tighter">
                  ৳{t.pricing.free.price}
                </span>
                <span className="text-[#b49e82] text-xs font-black uppercase tracking-widest">
                  / {t.pricing.free.period}
                </span>
              </div>
              <p className="text-[#5d4e37] text-sm font-medium leading-relaxed">
                {t.pricing.free.description}
              </p>
            </div>

            <ul className="space-y-4 mb-12 flex-grow">
              {t.pricing.free.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <Check
                    className="w-5 h-5 text-[#8b6834] mt-0.5"
                    strokeWidth={3}
                  />
                  <span className="text-[#2c2419] text-sm font-bold">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleFreePlan}
              className="w-full px-8 py-5 rounded-none border-2 border-[#d4c4b0] text-[#2c2419] text-xs font-black uppercase tracking-[0.2em] hover:bg-[#faf8f5] hover:border-[#8b6834] transition-all"
            >
              {t.pricing.free.cta}
            </button>
          </div>

          {/* Basic Plan - Popular */}
          <div className="relative bg-[#2c2419] p-12 border-b-2 lg:border-b-0 lg:border-r-2 border-[#2c2419] flex flex-col z-10">
            <div className="absolute top-0 right-0 bg-[#8b6834] px-4 py-2 text-[10px] font-black text-white uppercase tracking-[0.2em] rounded-none">
              {t.pricing.basic.popular}
            </div>

            <div className="mb-10 mt-4">
              <h3 className="text-sm font-black text-[#8b6834] uppercase tracking-[0.2em] mb-4">
                {t.pricing.basic.name}
              </h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-6xl font-black text-white tracking-tighter">
                  ৳{t.pricing.basic.price}
                </span>
                <span className="text-[#b49e82] text-xs font-black uppercase tracking-widest">
                  / {t.pricing.basic.period}
                </span>
              </div>
              <p className="text-[#d4c4b0] text-sm font-medium leading-relaxed">
                {t.pricing.basic.description}
              </p>
            </div>

            <ul className="space-y-4 mb-12 flex-grow">
              {t.pricing.basic.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <Check
                    className="w-5 h-5 text-[#8b6834] mt-0.5"
                    strokeWidth={3}
                  />
                  <span className="text-white font-bold text-sm">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() =>
                handleUpgrade(t.pricing.basic.name, `৳${t.pricing.basic.price}`)
              }
              className="w-full px-8 py-5 rounded-none bg-[#8b6834] text-white text-xs font-black uppercase tracking-[0.2em] border-2 border-[#8b6834] hover:bg-white hover:text-[#8b6834] transition-all"
            >
              {t.pricing.basic.cta}
            </button>
          </div>

          {/* Premium Plan */}
          <div className="relative bg-white p-12 flex flex-col">
            <div className="mb-10">
              <h3 className="text-sm font-black text-[#8b6834] uppercase tracking-[0.2em] mb-4">
                {t.pricing.premium.name}
              </h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-6xl font-black text-[#2c2419] tracking-tighter">
                  ৳{t.pricing.premium.price}
                </span>
                <span className="text-[#b49e82] text-xs font-black uppercase tracking-widest">
                  / {t.pricing.premium.period}
                </span>
              </div>
              <p className="text-[#5d4e37] text-sm font-medium leading-relaxed">
                {t.pricing.premium.description}
              </p>
            </div>

            <ul className="space-y-4 mb-12 flex-grow">
              {t.pricing.premium.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <Check
                    className="w-5 h-5 text-[#8b6834] mt-0.5"
                    strokeWidth={3}
                  />
                  <span className="text-[#2c2419] text-sm font-bold">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() =>
                handleUpgrade(
                  t.pricing.premium.name,
                  `৳${t.pricing.premium.price}`,
                )
              }
              className="w-full px-8 py-5 rounded-none bg-[#2c2419] text-white text-xs font-black uppercase tracking-[0.2em] border-2 border-[#2c2419] hover:bg-[#8b6834] hover:border-[#8b6834] transition-all"
            >
              {t.pricing.premium.cta}
            </button>
          </div>
        </div>

        {/* Info badges */}
        <div className="mt-20 flex flex-wrap justify-center gap-6">
          <div className="px-6 py-3 bg-[#f5f0e8] border-2 border-[#d4c4b0]/40 text-[10px] font-black uppercase tracking-[0.2em] text-[#8b6834]">
            Cancel anytime
          </div>
          <div className="px-6 py-3 bg-[#f5f0e8] border-2 border-[#d4c4b0]/40 text-[10px] font-black uppercase tracking-[0.2em] text-[#8b6834]">
            No hidden fees
          </div>
          <div className="px-6 py-3 bg-[#f5f0e8] border-2 border-[#d4c4b0]/40 text-[10px] font-black uppercase tracking-[0.2em] text-[#8b6834]">
            Secure payment
          </div>
        </div>
      </div>

      <WhatsAppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planName={selectedPlan?.name || ""}
        price={selectedPlan?.price || ""}
      />
    </section>
  );
}
