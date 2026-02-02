"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { DotBackground } from "@/components/DotBackground";
import { ArrowRight, Copy, RefreshCw, FileText, Check } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

type ConversionMode = "bijoy-to-unicode" | "unicode-to-bijoy" | "english-to-bangla";

export default function BanglaConverterPage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [mode, setMode] = useState<ConversionMode>("bijoy-to-unicode");
  const [copied, setCopied] = useState(false);

  const modes = [
    { id: "bijoy-to-unicode", label: "Bijoy → Unicode", description: "Convert Bijoy to Unicode" },
    { id: "unicode-to-bijoy", label: "Unicode → Bijoy", description: "Convert Unicode to Bijoy" },
    { id: "english-to-bangla", label: "English → Bangla", description: "Transliterate English to Bangla" },
  ];

  const handleConvert = () => {
    // Placeholder conversion logic (backend will be added later)
    if (mode === "bijoy-to-unicode") {
      setOutputText("আপনার টেক্সট এখানে রূপান্তরিত হবে");
    } else if (mode === "unicode-to-bijoy") {
      setOutputText("Avcbvi †UKó GLv‡b iƒcvšÍwiZ n‡e");
    } else {
      setOutputText("apnar text ekhane rupantorito hobe");
    }
  };

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
      <div className="min-h-screen bg-[#faf8f5] font-inter">
        <Navbar />
        <DotBackground />

        <main className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-lora font-bold text-[#2c2419] mb-3">
              Bangla Text Converter
            </h1>
            <p className="text-[#5d4e37] text-lg">
              Convert between Bijoy, Unicode, and English transliteration
            </p>
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
                      ? "Avcbvi Bijoy †UKó GLv‡b wjLyb..."
                      : mode === "unicode-to-bijoy"
                      ? "আপনার Unicode টেক্সট এখানে লিখুন..."
                      : "Type your English text here..."
                  }
                  className="w-full h-64 p-4 border-2 border-[#d4c4b0] focus:border-[#8b6834] focus:outline-none resize-none font-noto-bengali"
                />
              </div>

              {/* Middle Actions */}
              <div className="flex md:flex-col gap-3 items-center justify-center pt-8">
                <button
                  onClick={handleConvert}
                  disabled={!inputText}
                  className="p-3 bg-[#8b6834] text-[#faf8f5] hover:bg-[#6d4f28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
                  title="Convert"
                >
                  <ArrowRight className="w-6 h-6 md:rotate-90" />
                </button>
                {mode !== "english-to-bangla" && (
                  <button
                    onClick={handleSwap}
                    className="p-3 border-2 border-[#d4c4b0] text-[#2c2419] hover:bg-[#f5f0e8] transition-colors rounded-full"
                    title="Swap"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                )}
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
                    className="w-full h-64 p-4 border-2 border-[#d4c4b0] bg-[#f5f0e8] resize-none font-noto-bengali"
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

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t-2 border-[#d4c4b0]">
              <button
                onClick={handleConvert}
                disabled={!inputText}
                className="flex-1 min-w-[200px] py-3 px-6 bg-[#8b6834] text-[#faf8f5] font-bold hover:bg-[#6d4f28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Convert Text
              </button>
              <button
                onClick={handleCopy}
                disabled={!outputText}
                className="flex items-center gap-2 py-3 px-6 border-2 border-[#8b6834] text-[#8b6834] font-bold hover:bg-[#8b6834] hover:text-[#faf8f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleClear}
                className="flex items-center gap-2 py-3 px-6 border-2 border-[#d4c4b0] text-[#2c2419] font-bold hover:bg-[#f5f0e8] transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Clear
              </button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
