"use client";

import { Check, X, Sparkles, Star } from "lucide-react";

interface PlanUpgradeSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: "Basic" | "Premium";
}

export default function PlanUpgradeSuccessModal({
  isOpen,
  onClose,
  plan,
}: PlanUpgradeSuccessModalProps) {
  if (!isOpen) return null;

  const features = {
    Basic: [
      "30 cards per day",
      "10+ template styles",
      "Advanced customization",
      "High quality export",
      "No watermark",
      "Priority support",
    ],
    Premium: [
      "Unlimited cards",
      "All templates + updates",
      "Full brand customization",
      "Team collaboration",
      "API access",
      "Analytics dashboard",
      "Dedicated support",
    ],
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[#8b6834]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative p-6 text-center">
          {/* Header */}
          <div className="flex flex-col items-center mb-4">
            <div className="w-12 h-12 bg-[#8b6834] flex items-center justify-center shadow-md mb-3">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#2c2419] font-inter uppercase tracking-wide">
              Plan Upgraded
            </h2>
            <p className="text-[#5d4e37] text-sm mt-1">
              You are now on{" "}
              <span className="font-bold text-[#8b6834]">{plan} Plan</span>
            </p>
          </div>

          <div className="bg-[#faf8f5] p-4 border border-[#e8dcc8] mb-6 text-left">
            <h3 className="text-xs font-bold text-[#2c2419] mb-3 flex items-center gap-2 uppercase tracking-tight">
              <Star className="w-3 h-3 text-[#8b6834] fill-[#8b6834]" />
              Unlocked Features
            </h3>
            <ul className="space-y-2">
              {(features[plan] || features.Basic).map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="mt-0.5 min-w-3 min-h-3 bg-[#38A169] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-xs text-[#5d4e37] font-medium leading-tight">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-[#8b6834] hover:bg-[#74552b] text-white text-sm font-bold uppercase tracking-wider transition-all"
          >
            Start Creating
          </button>
        </div>
      </div>
    </div>
  );
}
