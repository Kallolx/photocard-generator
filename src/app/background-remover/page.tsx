"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, X, Download, Loader2, ImageIcon, Menu } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardSidebar from "@/components/DashboardSidebar";
import UpgradeModal from "@/components/UpgradeModal";
import CompactCreditDisplay from "@/components/CompactCreditDisplay";

export default function BackgroundRemoverPage() {
  const { user, logout } = useAuth();
  const isFreeUser = user?.plan === "Free";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressRef = useRef(0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setProcessedImage(null);
        setProcessingProgress(0);
        setProcessingStatus("");
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
              setProcessingProgress(0);
              setProcessingStatus("");
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
      // No image found in clipboard
      alert("No image found in clipboard. Please copy an image first.");
    } catch (err) {
      console.error("Failed to read clipboard:", err);
      alert("Failed to access clipboard. Please upload an image instead.");
    }
  };

  const handleRemoveBackground = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    lastProgressRef.current = 0;
    setProcessingStatus("Initializing...");

    // Fallback progress simulation for smooth UI updates
    let simulatedProgress = 0;
    progressIntervalRef.current = setInterval(() => {
      simulatedProgress += 1;
      // Cap simulated progress at 85% to show final progress from actual processing
      if (simulatedProgress <= 85) {
        if (simulatedProgress > lastProgressRef.current) {
          lastProgressRef.current = simulatedProgress;
          setProcessingProgress(simulatedProgress);

          if (simulatedProgress < 20) {
            setProcessingStatus("Initializing...");
          } else if (simulatedProgress < 50) {
            setProcessingStatus("Loading resources...");
          } else if (simulatedProgress < 70) {
            setProcessingStatus("Processing image...");
          } else {
            setProcessingStatus("Removing background...");
          }
        }
      }
    }, 150);

    try {
      // Dynamically import the background removal library
      const { removeBackground: removeBg } =
        await import("@imgly/background-removal");

      // Convert data URL to blob
      const response = await fetch(originalImage);
      const blob = await response.blob();

      // Remove background with progress tracking
      const removedBgBlob = await removeBg(blob, {
        model: "isnet",
        output: {
          format: "image/png",
          quality: 0.9,
        },
        progress: (key: string, current: number, total: number) => {
          const progress = Math.round((current / total) * 100);
          // Only update if real progress is higher than simulated
          if (progress > lastProgressRef.current) {
            lastProgressRef.current = progress;
            setProcessingProgress(progress);
            setProcessingStatus(`Processing: ${progress}%`);
          }
        },
      });

      // Clear the interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setProcessingStatus("Finalizing...");
      setProcessingProgress(95);

      // Convert blob back to data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProcessedImage(result);
        setIsProcessing(false);
        setProcessingProgress(100);
        setProcessingStatus("");
      };
      reader.readAsDataURL(removedBgBlob);
    } catch (error) {
      // Clear the interval on error
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      console.error("Background removal failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(
        `Failed to remove background: ${errorMessage}\n\nPlease try again with a different image.`,
      );
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingStatus("");
    }
  };

  // Add keyboard shortcut for paste (Ctrl+V)
  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        await handlePaste();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      // Cleanup interval on unmount
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
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
    // Clear progress interval if running
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    setOriginalImage(null);
    setProcessedImage(null);
    setProcessingProgress(0);
    setProcessingStatus("");
    lastProgressRef.current = 0;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
                  Background Remover
                </h2>
              </div>
            </div>
            <CompactCreditDisplay />
          </header>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-8 font-inter">
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
                <span className="text-sm text-[#5d4e37] font-medium px-4 py-2 bg-white/50 rounded-full">
                  OR
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4c4b0] to-transparent"></div>
              </div>

              <button
                onClick={handlePaste}
                className="w-full max-w-md mx-auto block py-4 px-6 bg-white text-[#2c2419] font-bold rounded-2xl hover:shadow-lg transition-all duration-300 border border-[#d4c4b0]/30"
              >
                📋 Paste from Clipboard
                <span className="block text-xs text-[#5d4e37] mt-1 font-normal">
                  or press Ctrl+V
                </span>
              </button>
            </div>
          ) : (
            /* Image Processing Area */
            <div className="space-y-8">
              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-white text-[#2c2419] font-bold rounded-2xl hover:shadow-xl transition-all duration-300 shadow-lg border border-[#d4c4b0]/30"
                >
                  <span className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload New
                  </span>
                </button>

                <button
                  onClick={handleRemoveBackground}
                  disabled={isProcessing}
                  className="px-8 py-4 bg-gradient-to-r from-[#8b6834] to-[#6d4f28] text-white font-bold rounded-2xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin rounded-full" />
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
                    <span
                      className={`w-2 h-2 rounded-full ${isProcessing ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`}
                    ></span>
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
                          backgroundPosition:
                            "0 0, 0 10px, 10px -10px, -10px 0px",
                        }}
                      ></div>
                      {isProcessing ? (
                        <div className="relative z-10 flex flex-col items-center gap-4 w-full px-8">
                          <div className="relative">
                            <Loader2 className="w-12 h-12 text-[#8b6834] animate-spin rounded-full" />
                          </div>
                          <div className="w-full max-w-xs">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm text-[#5d4e37] font-medium">
                                {processingStatus || "Processing..."}
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
                            {processingStatus.includes("Initializing") ||
                            processingStatus.includes("Loading")
                              ? "This may take 10-20 seconds on first use"
                              : "Processing and removing background"}
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
              {processedImage && !isProcessing && (
                <div className="max-w-2xl mx-auto text-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 border border-green-200 backdrop-blur-sm rounded-full shadow-lg">
                    <span className="text-green-600 text-2xl">✓</span>
                    <span className="text-sm text-green-800">
                      <span className="font-bold">
                        Background removed successfully!
                      </span>{" "}
                      Download your image above
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
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
