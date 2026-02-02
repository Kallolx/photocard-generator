"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { DotBackground } from "@/components/DotBackground";
import { Upload, X, Download, Loader2, ImageIcon } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function BackgroundRemoverPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onload = (e) => {
              setOriginalImage(e.target?.result as string);
              setProcessedImage(null);
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const handleRemoveBackground = () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // Simulate background removal with progress (backend logic will be added later)
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    setTimeout(() => {
      setProcessedImage(originalImage); // Placeholder
      setIsProcessing(false);
      setProcessingProgress(100);
    }, 2000);
  };

  // Add keyboard shortcut for paste (Ctrl+V)
  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        await handlePaste();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement("a");
      link.href = processedImage;
      link.download = "background-removed.png";
      link.click();
    }
  };

  const handleClear = () => {
    setOriginalImage(null);
    setProcessedImage(null);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] via-[#f5f0e8] to-[#faf8f5] font-inter">
        <Navbar />

        <main className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-lora font-bold text-[#2c2419] mb-4">
              Background Remover
            </h1>
            <p className="text-[#5d4e37] text-xl max-w-2xl mx-auto">
              Remove backgrounds from images instantly with precision
            </p>
          </div>

          {/* Main Content */}
          {!originalImage ? (
            /* Upload Area */
            <div className="max-w-3xl mx-auto">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#8b6834]/20 to-[#8b6834]/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-16 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#d4c4b0]/30">
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#8b6834]/20 rounded-full blur-2xl"></div>
                      <div className="relative w-24 h-24 bg-gradient-to-br from-[#8b6834] to-[#6d4f28] rounded-full flex items-center justify-center shadow-xl">
                        <Upload className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#2c2419] mb-2">
                        Drop your image here
                      </p>
                      <p className="text-[#5d4e37] mb-4">
                        or click to browse from your device
                      </p>
                      <p className="text-sm text-[#8b6834] font-medium">
                        PNG, JPG, WEBP • Up to 10MB
                      </p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4c4b0] to-transparent"></div>
                <span className="text-sm text-[#5d4e37] font-medium px-4 py-2 bg-white/50 rounded-full">OR</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4c4b0] to-transparent"></div>
              </div>

              <button
                onClick={handlePaste}
                className="w-full max-w-md mx-auto block py-4 px-6 bg-white text-[#2c2419] font-bold rounded-2xl hover:shadow-lg transition-all duration-300 border border-[#d4c4b0]/30"
              >
                📋 Paste from Clipboard
                <span className="block text-xs text-[#5d4e37] mt-1 font-normal">or press Ctrl+V</span>
              </button>
            </div>
          ) : (
            /* Image Processing Area */
            <div className="space-y-8">
              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={handleRemoveBackground}
                  disabled={isProcessing}
                  className="px-8 py-4 bg-gradient-to-r from-[#8b6834] to-[#6d4f28] text-white font-bold rounded-2xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "✨ Remove Background"
                  )}
                </button>

                {processedImage && (
                  <button
                    onClick={handleDownload}
                    className="px-8 py-4 bg-white text-[#2c2419] font-bold rounded-2xl hover:shadow-xl transition-all duration-300 shadow-lg border border-[#d4c4b0]/30"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Download
                    </span>
                  </button>
                )}

                <button
                  onClick={handleClear}
                  className="px-8 py-4 bg-white text-[#2c2419] font-bold rounded-2xl hover:shadow-xl transition-all duration-300 shadow-lg border border-[#d4c4b0]/30"
                >
                  <span className="flex items-center gap-2">
                    <X className="w-5 h-5" />
                    Clear
                  </span>
                </button>
              </div>

              {/* Image Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {/* Original */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-[#2c2419] font-lora flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#8b6834] rounded-full"></span>
                    Original
                  </h3>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#8b6834]/10 to-transparent rounded-3xl blur-xl"></div>
                    <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl aspect-[4/3] flex items-center justify-center p-6">
                      <img
                        src={originalImage}
                        alt="Original"
                        className="max-w-full max-h-full object-contain rounded-2xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Processed */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-[#2c2419] font-lora flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
                    Background Removed
                  </h3>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-3xl blur-xl"></div>
                    <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3] flex items-center justify-center p-6">
                      {/* Transparent Grid Pattern */}
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            "linear-gradient(45deg, #f5f0e8 25%, transparent 25%), linear-gradient(-45deg, #f5f0e8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f5f0e8 75%), linear-gradient(-45deg, transparent 75%, #f5f0e8 75%)",
                          backgroundSize: "20px 20px",
                          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                        }}
                      ></div>
                      {isProcessing ? (
                        <div className="relative z-10 flex flex-col items-center gap-4 w-full px-8">
                          <div className="relative">
                            <Loader2 className="w-12 h-12 text-[#8b6834] animate-spin" />
                          </div>
                          <div className="w-full max-w-xs">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm text-[#5d4e37] font-medium">
                                Processing...
                              </p>
                              <span className="text-sm font-bold text-[#8b6834]">
                                {processingProgress}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#8b6834] to-[#6d4f28] transition-all duration-300 rounded-full"
                                style={{ width: `${processingProgress}%` }}
                              ></div>
                            </div>
                          </div>
                          <p className="text-xs text-[#5d4e37]/70">
                            AI is analyzing and removing background
                          </p>
                        </div>
                      ) : processedImage ? (
                        <img
                          src={processedImage}
                          alt="Processed"
                          className="relative z-10 max-w-full max-h-full object-contain rounded-2xl"
                        />
                      ) : (
                        <div className="relative z-10 flex flex-col items-center gap-4 text-[#8b6834]/30">
                          <ImageIcon className="w-12 h-12" />
                          <p className="text-sm text-[#5d4e37]">
                            Processed image will appear here
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Badge */}
              {processedImage && (
                <div className="max-w-2xl mx-auto text-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
                    <span className="text-sm text-[#5d4e37]">
                      <span className="font-bold text-[#2c2419]">Preview Mode:</span> Full AI processing coming soon
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
