"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Copy, RefreshCw, Check, Menu } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardSidebar from "@/components/DashboardSidebar";
import UpgradeModal from "@/components/UpgradeModal";
import CompactCreditDisplay from "@/components/CompactCreditDisplay";
import { convertText, type ConversionMode } from "@/utils/banglaConverter";

export default function BanglaConverterPage() {
  const { user, logout } = useAuth();
  const isFreeUser = user?.plan === "Free";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [mode, setMode] = useState<ConversionMode>("english-to-bangla");
  const [copied, setCopied] = useState(false);

  // Auto-convert when input text or mode changes
  useEffect(() => {
    const performConversion = async () => {
      if (inputText.trim()) {
        try {
          const converted = await convertText(inputText, mode);
          setOutputText(converted);
        } catch (error) {
          console.error("Auto-conversion error:", error);
          setOutputText("রূপান্তরে ত্রুটি হয়েছে। দয়া করে আবার চেষ্টা করুন।");
        }
      } else {
        setOutputText("");
      }
    };

    performConversion();
  }, [inputText, mode]);

  const modes = [
    { id: "english-to-bangla", label: "English → Bangla", description: "Transliterate English to Bangla" },
    { id: "bijoy-to-unicode", label: "Bijoy → Unicode", description: "Convert Bijoy to Unicode" },
    { id: "unicode-to-bijoy", label: "Unicode → Bijoy", description: "Convert Unicode to Bijoy" },
  ];



  const handleCopy = async () => {
    if (outputText) {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
  };

  const handleSwap = () => {
    if (mode === "bijoy-to-unicode") {
      setMode("unicode-to-bijoy");
    } else if (mode === "unicode-to-bijoy") {
      setMode("bijoy-to-unicode");
    }
    // Swap input and output
    const temp = inputText;
    setInputText(outputText);
    setOutputText(temp);
  };

  return (
    <ProtectedRoute>
      <div className="h-screen bg-[#faf8f5] flex font-dm-sans selection:bg-[#8b6834] selection:text-white overflow-hidden">
        <DashboardSidebar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onUpgrade={(feature) => {
            setUpgradeFeature(feature);
            setShowUpgradeModal(true);
          }}
          user={user}
          logout={logout}
          isFreeUser={isFreeUser}
        />

        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          {/* Top Header */}
          <header className="flex-shrink-0 h-20 lg:h-24 px-4 sm:px-6 lg:px-10 flex items-center justify-between border-b border-[#d4c4b0] bg-white z-30">
            <div className="flex items-center gap-6 flex-1">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2.5 bg-[#f5f0e8] border border-[#d4c4b0] rounded-none text-[#5d4e37] hover:text-[#8b6834] transition-all"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden md:flex flex-col">
                <h2 className="text-xl font-black text-[#2c2419] tracking-tight uppercase">
                  Bangla Converter
                </h2>
              </div>
            </div>
            <CompactCreditDisplay />
          </header>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-8 font-inter">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-lora font-bold text-[#2c2419] mb-3">
              Bangla Text Converter
            </h1>
          </div>

          {/* Conversion Mode Selector */}
          <div className="bg-white border-2 border-[#d4c4b0] shadow-sm p-6 mb-6">
            <h2 className="text-lg font-lora font-bold text-[#2c2419] mb-4">
              Conversion Mode
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id as ConversionMode)}
                  className={`p-4 border-2 transition-all text-left ${
                    mode === m.id
                      ? "border-[#8b6834] bg-[#8b6834] text-[#faf8f5]"
                      : "border-[#d4c4b0] text-[#2c2419] hover:border-[#8b6834] hover:bg-[#f5f0e8]"
                  }`}
                >
                  <div className="font-bold mb-1">{m.label}</div>
                  <div className={`text-sm ${mode === m.id ? "opacity-90" : "opacity-70"}`}>
                    {m.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Converter */}
          <div className="bg-white border-2 border-[#d4c4b0] shadow-sm p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-start">
              {/* Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-[#2c2419] font-lora">
                    Input Text
                  </label>
                  <span className="text-xs text-[#5d4e37]">
                    {inputText.length} characters
                  </span>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    mode === "bijoy-to-unicode"
                      ? "আপনার Bijoy টেক্সট এখানে পেস্ট করুন..."
                      : mode === "unicode-to-bijoy"
                      ? "আপনার Unicode টেক্সট এখানে লিখুন..."
                      : "Type your English text here..."
                  }
                  className="text-xl w-full h-64 p-4 border-2 border-[#d4c4b0] focus:border-[#8b6834] focus:outline-none resize-none font-noto-bengali text-black placeholder:text-gray-400"
                />
              </div>

              {/* Middle Actions */}
              <div className="flex md:flex-col gap-3 items-center justify-center pt-8">
                <button
                  onClick={handleSwap}
                  className="p-3 border-2 border-[#d4c4b0] text-[#2c2419] hover:bg-[#f5f0e8] transition-colors rounded-full"
                  title="Swap Input & Output"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {/* Output */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-[#2c2419] font-lora">
                    Output Text
                  </label>
                  <span className="text-xs text-[#5d4e37]">
                    {outputText.length} characters
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    value={outputText}
                    readOnly
                    placeholder="Converted text will appear here..."
                    className="text-xl w-full h-64 p-4 border-2 border-[#d4c4b0] bg-[#f5f0e8] resize-none font-noto-bengali text-black placeholder:text-gray-400"
                  />
                  {outputText && (
                    <button
                      onClick={handleCopy}
                      className={`absolute top-3 right-3 p-2 border-2 transition-all ${
                        copied
                          ? "border-green-500 bg-green-50 text-green-600"
                          : "border-[#d4c4b0] bg-white text-[#2c2419] hover:bg-[#f5f0e8]"
                      }`}
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          </main>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
        requiredPlan="Premium"
      />
    </ProtectedRoute>
  );
}
