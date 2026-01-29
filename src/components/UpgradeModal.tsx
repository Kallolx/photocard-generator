"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Lock, Check } from "lucide-react";
import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useState,
} from "react";
import WhatsAppModal from "./WhatsAppModal";
import { useLanguage } from "@/contexts/LanguageContext";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  requiredPlan: "Basic" | "Premium";
}

export default function UpgradeModal({
  isOpen,
  onClose,
  feature,
  requiredPlan,
}: UpgradeModalProps) {
  const { user, refreshProfile } = useAuth();
  const { t, lang } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<"Basic" | "Premium">(
    requiredPlan,
  );
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  if (!isOpen) return null;

  const handleUpgradeClick = () => {
    setShowWhatsApp(true);
  };

  const allPlans = [
    {
      id: "Basic",
      name: t.pricing.basic.name,
      price: t.pricing.basic.price,
      period: t.pricing.basic.period,
      features: t.pricing.basic.features,
    },
    {
      id: "Premium",
      name: t.pricing.premium.name,
      price: t.pricing.premium.price,
      period: t.pricing.premium.period,
      features: t.pricing.premium.features,
    },
  ];

  // If Premium is required, only show Premium plan
  const plans =
    requiredPlan === "Premium"
      ? allPlans.filter((p) => p.id === "Premium")
      : allPlans.filter((p) => user?.plan !== p.id);

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border-2 border-[#d4c4b0] max-w-lg w-full p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-lora font-bold text-[#2c2419]">
              Upgrade Your Plan
            </h3>
            <p className="text-xs text-[#5d4e37] font-inter mt-1">
              Unlock {feature} • Current: {user?.plan}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#5d4e37] hover:text-[#2c2419] text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Plans Grid */}
        <div
          className={`grid ${plans.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : "grid-cols-2"} gap-3 mb-6`}
        >
          {plans.map((plan) => {
            const isCurrentPlan = user?.plan === plan.id;
            const isSelected = selectedPlan === plan.id;

            return (
              <button
                key={plan.id}
                onClick={() =>
                  !isCurrentPlan &&
                  setSelectedPlan(plan.id as "Basic" | "Premium")
                }
                disabled={isCurrentPlan}
                className={`p-4 border-2 text-left transition-all ${
                  isCurrentPlan
                    ? "border-[#d4c4b0] bg-[#f5f0e8] opacity-60 cursor-not-allowed"
                    : isSelected
                      ? "border-[#8b6834] bg-[#f5f0e8] shadow-md"
                      : "border-[#d4c4b0] hover:border-[#8b6834]"
                }`}
              >
                {/* Plan Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-lora font-bold text-[#2c2419]">
                      {plan.name}
                    </h4>
                    <div className="flex items-baseline mt-1">
                      <span className="text-2xl font-lora font-bold text-[#8b6834]">
                        ৳{plan.price}
                      </span>
                      <span className="text-xs text-[#5d4e37] font-inter ml-1">
                        /{plan.period}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-[#8b6834] bg-[#8b6834]"
                        : "border-[#d4c4b0]"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="inline-block px-2 py-0.5 bg-[#8b6834] text-white text-[10px] font-inter font-semibold mb-2">
                    CURRENT
                  </div>
                )}

                {/* Features */}
                <ul className="space-y-1">
                  {plan.features.map((feat: string, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-center gap-1.5 text-xs text-[#5d4e37] font-inter"
                    >
                      <svg
                        className="w-3 h-3 text-[#8b6834] flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleUpgradeClick}
            disabled={user?.plan === selectedPlan}
            className="w-full py-3 bg-[#8b6834] text-[#faf8f5] font-inter font-semibold hover:bg-[#6b4e25] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upgrade to {selectedPlan}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-[#5d4e37] font-inter text-sm hover:text-[#2c2419] transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>

      <WhatsAppModal
        isOpen={showWhatsApp}
        onClose={() => {
          setShowWhatsApp(false);
          onClose(); // Close both or just one? User likely wants to close main modal too if they went to WhatsApp
        }}
        planName={
          selectedPlan === "Basic"
            ? t.pricing.basic.name
            : t.pricing.premium.name
        }
        price={`${selectedPlan === "Basic" ? t.pricing.basic.price : t.pricing.premium.price} BDT`}
      />
    </div>
  );
}
