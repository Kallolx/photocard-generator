"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import WhatsAppModal from "../WhatsAppModal";

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
    <section id="pricing" className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 mb-4">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-green-700">Simple & Transparent Pricing</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {t.pricing.title}
          </h2>
          <p className="text-xl text-gray-600">
            {t.pricing.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="relative bg-white rounded-3xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t.pricing.free.name}
              </h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                  ৳{t.pricing.free.price}
                </span>
                <span className="text-gray-500">/ {t.pricing.free.period}</span>
              </div>
              <p className="text-gray-600">
                {t.pricing.free.description}
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {t.pricing.free.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleFreePlan}
              className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all"
            >
              {t.pricing.free.cta}
            </button>
          </div>

          {/* Basic Plan - Popular */}
          <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 shadow-2xl transform lg:-translate-y-4">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="px-6 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg">
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  {t.pricing.basic.popular}
                </span>
              </div>
            </div>

            <div className="mb-8 mt-4">
              <h3 className="text-2xl font-bold text-white mb-2">
                {t.pricing.basic.name}
              </h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold text-white">
                  ৳{t.pricing.basic.price}
                </span>
                <span className="text-blue-100">/ {t.pricing.basic.period}</span>
              </div>
              <p className="text-blue-100">
                {t.pricing.basic.description}
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {t.pricing.basic.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(t.pricing.basic.name, `৳${t.pricing.basic.price}`)}
              className="w-full px-6 py-4 rounded-xl bg-white text-purple-600 font-bold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
            >
              {t.pricing.basic.cta}
            </button>
          </div>

          {/* Premium Plan */}
          <div className="relative bg-white rounded-3xl p-8 border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t.pricing.premium.name}
              </h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  ৳{t.pricing.premium.price}
                </span>
                <span className="text-gray-500">/ {t.pricing.premium.period}</span>
              </div>
              <p className="text-gray-600">
                {t.pricing.premium.description}
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {t.pricing.premium.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(t.pricing.premium.name, `৳${t.pricing.premium.price}`)}
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:shadow-xl transition-all"
            >
              {t.pricing.premium.cta}
            </button>
          </div>
        </div>

        {/* Money-back guarantee */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-700 font-semibold">Cancel anytime • No hidden fees • Secure payment</span>
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
