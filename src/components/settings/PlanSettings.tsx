"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Check, CreditCard, Download, FileText, Zap } from "lucide-react";
import UpgradeModal from "@/components/UpgradeModal";

export default function PlanSettings() {
  const { user } = useAuth();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState<"Basic" | "Premium">("Premium");

  const plans = [
    {
      id: "Basic",
      name: "Professional",
      price: 199,
      features: ["15 cards/day", "No watermark", "Standard Support"],
    },
    {
      id: "Premium",
      name: "Newsroom",
      price: 499,
      features: [
        "Unlimited cards",
        "Batch Processing",
        "Priority Support",
        "API Access",
      ],
    },
  ];

  // Logic to determine which upgrade options to show
  const availableUpgrades = plans.filter((p) => {
    if (user?.plan === "Premium") return false;
    if (user?.plan === "Basic" && p.id === "Basic") return false;
    return true;
  });

  const handleUpgradeClick = (planId: "Basic" | "Premium") => {
    setTargetPlan(planId);
    setUpgradeModalOpen(true);
  };

  // Mock billing history logic - using user's creation/plan date for a single entry
  // In a real app, this would fetch from a /billing/history endpoint
  const mockHistory = [
    {
      id: "inv_1",
      date: new Date().toLocaleDateString(),
      description: `Subscription - ${user?.plan} Plan`,
      amount:
        user?.plan === "Premium"
          ? "৳499.00"
          : user?.plan === "Basic"
            ? "৳199.00"
            : "৳0.00",
      status: "Paid",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Current Plan Section */}
      <div className="bg-white border border-[#d4c4b0]/40 p-6 md:p-8 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-lora font-bold text-[#2c2419] mb-1">
              Current Plan
            </h2>
            <p className="text-[#5d4e37] text-sm font-inter">
              You are currently on the{" "}
              <span className="font-bold">{user?.plan}</span> plan.
            </p>
          </div>
          <span className="bg-[#8b6834]/10 text-[#8b6834] text-xs font-bold px-3 py-1 uppercase tracking-wider">
            Active
          </span>
        </div>

        {/* Upgrade Options Grid */}
        {availableUpgrades.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {availableUpgrades.map((plan) => (
              <div
                key={plan.id}
                className="border border-[#d4c4b0] p-5 flex flex-col justify-between hover:border-[#8b6834] transition-colors bg-[#fdfaf5]"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-lora font-bold text-lg text-[#2c2419]">
                      {plan.name}
                    </h3>
                    <p className="font-inter font-bold text-[#8b6834]">
                      ৳{plan.price}
                      <span className="text-xs font-normal text-[#5d4e37]">
                        /mo
                      </span>
                    </p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feat, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-xs text-[#5d4e37] font-inter"
                      >
                        <Check className="w-3 h-3 text-[#8b6834]" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() =>
                    handleUpgradeClick(plan.id as "Basic" | "Premium")
                  }
                  className="w-full bg-[#2c2419] text-[#faf8f5] py-2 text-sm font-bold font-inter hover:bg-[#4a3e2f] transition-colors"
                >
                  Upgrade to {plan.id}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#f5f0e8] p-4 text-center border dashed border-[#d4c4b0]">
            <p className="text-[#8b6834] font-medium font-lora">
              You are on the highest tier plan. Enjoy your features!
            </p>
          </div>
        )}
      </div>

      {/* Billing History Section */}
      <div className="bg-white border border-[#d4c4b0]/40 p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-lora font-bold text-[#2c2419] mb-1">
          Billing History
        </h2>
        <p className="text-[#5d4e37] text-sm mb-6 font-inter">
          Download your previous invoices
        </p>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#d4c4b0]/40 text-xs text-[#5d4e37] uppercase font-bold font-inter tracking-wider">
                <th className="pb-3 pl-2">Date</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3 text-right pr-2">Invoice</th>
              </tr>
            </thead>
            <tbody className="text-sm font-inter text-[#2c2419]">
              {user?.plan !== "Free" ? (
                mockHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#d4c4b0]/10 last:border-0 hover:bg-[#faf8f5] transition-colors"
                  >
                    <td className="py-4 pl-2 font-medium">{item.date}</td>
                    <td className="py-4">{item.description}</td>
                    <td className="py-4">{item.amount}</td>
                    <td className="py-4 text-right pr-2">
                      <button className="inline-flex items-center gap-1.5 text-[#5d4e37] hover:text-[#8b6834] transition-colors font-medium text-xs border border-[#d4c4b0] px-3 py-1.5 hover:border-[#8b6834]">
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-[#5d4e37] italic"
                  >
                    No billing history found (Free Plan)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {user?.plan !== "Free" ? (
            mockHistory.map((item) => (
              <div
                key={item.id}
                className="border border-[#d4c4b0]/40 p-4 bg-[#fdfaf5]"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-[#5d4e37] font-bold uppercase tracking-wider mb-1">
                      Date
                    </span>
                    <span className="text-sm font-medium text-[#2c2419] font-inter">
                      {item.date}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-[#5d4e37] font-bold uppercase tracking-wider mb-1">
                      Amount
                    </span>
                    <span className="text-sm font-medium text-[#2c2419] font-inter">
                      {item.amount}
                    </span>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-xs text-[#5d4e37] font-bold uppercase tracking-wider block mb-1">
                    Description
                  </span>
                  <span className="text-sm text-[#2c2419] font-inter">
                    {item.description}
                  </span>
                </div>
                <button className="w-full flex justify-center items-center gap-1.5 text-[#5d4e37] hover:text-[#8b6834] transition-colors font-medium text-xs border border-[#d4c4b0] px-3 py-2 hover:border-[#8b6834] bg-white">
                  <Download className="w-3.5 h-3.5" />
                  Download Invoice
                </button>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-[#5d4e37] italic border border-[#d4c4b0]/40 bg-[#faf8f5] p-4">
              No billing history found (Free Plan)
            </div>
          )}
        </div>
      </div>

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        requiredPlan={targetPlan}
        feature="Advanced Features"
      />
    </div>
  );
}
