'use client';

import Link from 'next/link';

interface PricingSectionProps {
  t: any;
}

export default function PricingSection({ t }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-24 px-4 bg-[#f5f0e8] border-b-2 border-[#d4c4b0]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-lora font-bold text-[#2c2419] mb-4">
            {t.pricing.title}
          </h2>
          <p className="text-xl text-[#5d4e37] font-inter">
            {t.pricing.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="p-8 border-2 border-[#d4c4b0] bg-white hover:border-[#8b6834] transition-colors">
            <h3 className="text-2xl font-lora font-bold text-[#2c2419] mb-2">
              {t.pricing.free.name}
            </h3>
            <div className="mb-4">
              <span className="text-5xl font-lora font-bold text-[#8b6834]">৳{t.pricing.free.price}</span>
              <span className="text-[#5d4e37] ml-2 font-inter">/ {t.pricing.free.period}</span>
            </div>
            <p className="text-[#5d4e37] mb-8 h-12 font-inter">
              {t.pricing.free.description}
            </p>
            <ul className="space-y-4 mb-8">
              {t.pricing.free.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#8b6834] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#5d4e37] font-inter">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/url"
              className="block w-full text-center px-6 py-4 border-2 border-[#8b6834] text-[#8b6834] font-inter font-semibold hover:bg-[#f5f0e8] transition-all"
            >
              {t.pricing.free.cta}
            </Link>
          </div>

          {/* Basic Plan - Popular */}
          <div className="relative p-8 border-2 border-[#8b6834] bg-white">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-[#8b6834] text-[#faf8f5] text-sm font-inter font-bold uppercase tracking-wider">
              {t.pricing.basic.popular}
            </div>
            <h3 className="text-2xl font-lora font-bold text-[#2c2419] mb-2 mt-2">
              {t.pricing.basic.name}
            </h3>
            <div className="mb-4">
              <span className="text-5xl font-lora font-bold text-[#8b6834]">
                ৳{t.pricing.basic.price}
              </span>
              <span className="text-[#5d4e37] ml-2 font-inter">/ {t.pricing.basic.period}</span>
            </div>
            <p className="text-[#5d4e37] mb-8 h-12 font-inter">
              {t.pricing.basic.description}
            </p>
            <ul className="space-y-4 mb-8">
              {t.pricing.basic.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#8b6834] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#5d4e37] font-inter font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/url"
              className="block w-full text-center px-6 py-4 bg-[#8b6834] text-[#faf8f5] font-inter font-semibold border-2 border-[#6b4e25] hover:bg-[#6b4e25] transition-all"
            >
              {t.pricing.basic.cta}
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="p-8 border-2 border-[#d4c4b0] bg-white hover:border-[#8b6834] transition-colors">
            <h3 className="text-2xl font-lora font-bold text-[#2c2419] mb-2">
              {t.pricing.premium.name}
            </h3>
            <div className="mb-4">
              <span className="text-5xl font-lora font-bold text-[#8b6834]">৳{t.pricing.premium.price}</span>
              <span className="text-[#5d4e37] ml-2 font-inter">/ {t.pricing.premium.period}</span>
            </div>
            <p className="text-[#5d4e37] mb-8 h-12 font-inter">
              {t.pricing.premium.description}
            </p>
            <ul className="space-y-4 mb-8">
              {t.pricing.premium.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#8b6834] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#5d4e37] font-inter">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/url"
              className="block w-full text-center px-6 py-4 bg-[#8b6834] text-[#faf8f5] font-inter font-semibold border-2 border-[#6b4e25] hover:bg-[#6b4e25] transition-all"
            >
              {t.pricing.premium.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
