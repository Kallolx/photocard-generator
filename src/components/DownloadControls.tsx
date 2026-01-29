import { useState } from "react";
import { Download, Share2, ChevronDown, Lock } from "lucide-react";
import { toPng, toJpeg, toSvg } from "html-to-image";
import { useAuth } from "@/contexts/AuthContext";
import UpgradeModal from "./UpgradeModal";

interface DownloadControlsProps {
  isVisible: boolean;
  targetId?: string;
}

export default function DownloadControls({
  isVisible,
  targetId = "photocard",
}: DownloadControlsProps) {
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showFormats, setShowFormats] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");
  const [requiredPlan, setRequiredPlan] = useState<"Basic" | "Premium">(
    "Basic",
  );

  const downloadFormats = [
    {
      name: "PNG",
      extension: "png",
      quality: 0.95,
      tier: ["Free", "Basic", "Premium"],
    },
    { name: "JPG", extension: "jpg", quality: 0.9, tier: ["Basic", "Premium"] },
    {
      name: "PNG (High Quality)",
      extension: "png",
      quality: 1.0,
      tier: ["Basic", "Premium"],
    },
    { name: "SVG", extension: "svg", quality: 1.0, tier: ["Premium"] },
  ];

  const getFormatAccess = (tier: string[]) => {
    const userPlan = user?.plan || "Free";
    // Premium users have access to everything
    if (userPlan === "Premium") return true;
    // Basic users have access if tier includes Basic or Free
    if (userPlan === "Basic")
      return tier.includes("Basic") || tier.includes("Free");
    // Free users only have access if tier includes Free
    return tier.includes("Free");
  };

  const handleFormatClick = (format: (typeof downloadFormats)[0]) => {
    if (!getFormatAccess(format.tier)) {
      setUpgradeFeature(`${format.name} Download`);
      // Determine lowest required plan
      if (format.tier.includes("Basic")) {
        setRequiredPlan("Basic");
      } else {
        setRequiredPlan("Premium");
      }
      setShowUpgradeModal(true);
      setShowFormats(false);
      return;
    }
    handleDownload(format.extension, format.quality);
  };

  const handleDownload = async (format = "png", quality = 0.95) => {
    const photocardElement = document.getElementById(targetId);
    if (!photocardElement) return;

    setIsDownloading(true);
    try {
      // Wait for images to load
      const images = photocardElement.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true);
          });
        }),
      );

      // Add a small delay to ensure images are rendered
      await new Promise((resolve) => setTimeout(resolve, 300));

      let dataUrl;
      const options = {
        quality,
        pixelRatio: quality === 1.0 ? 3 : 2, // Higher pixel ratio for HQ
        backgroundColor: format === "jpg" ? "#ffffff" : undefined,
      };

      if (format === "jpg") {
        dataUrl = await toJpeg(photocardElement, options);
      } else if (format === "svg") {
        dataUrl = await toSvg(photocardElement, options);
      } else {
        dataUrl = await toPng(photocardElement, options);
      }

      const link = document.createElement("a");
      link.download = `photocard-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();

      setShowFormats(false);
    } catch (error) {
      console.error("Error downloading image:", error);

      // Provide more specific error messages
      let errorMessage = "Failed to download image. ";
      if (error instanceof Error) {
        if (error.message.includes("canvas")) {
          errorMessage += "Canvas rendering failed. Try again.";
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += "Please try again.";
      }

      alert(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const photocardElement = document.getElementById(targetId);
    if (!photocardElement) return;

    try {
      const dataUrl = await toPng(photocardElement, {
        quality: 0.95,
        pixelRatio: 2,
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      if (
        navigator.share &&
        navigator.canShare({
          files: [new File([blob], "photocard.png", { type: "image/png" })],
        })
      ) {
        await navigator.share({
          files: [new File([blob], "photocard.png", { type: "image/png" })],
          title: "Generated Photocard",
          text: "Check out this photocard I generated!",
        });
      } else {
        // Fallback to download if sharing is not supported
        handleDownload();
      }
    } catch (error) {
      console.error("Error sharing image:", error);
      alert("Failed to share image. Downloading instead.");
      handleDownload();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {/* Download Button with Format Options */}
        <div className="relative">
          <div className="flex">
            <button
              onClick={() => handleDownload()} // Default download (PNG)
              disabled={isDownloading}
              className="flex-1 bg-[#2c2419] text-[#faf8f5] py-2 px-3 text-sm font-medium font-inter hover:bg-[#8b6834] focus:ring-2 focus:ring-[#8b6834] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "Saving..." : "Download"}
            </button>
            <button
              onClick={() => setShowFormats(!showFormats)}
              className="bg-[#2c2419] text-[#faf8f5] py-2 px-2 hover:bg-[#8b6834] focus:ring-2 focus:ring-[#8b6834] focus:ring-offset-2 transition-colors border-l-2 border-[#5d4e37]"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Format Dropdown */}
          {showFormats && (
            <div className="absolute bottom-full mb-1 left-0 min-w-full w-max bg-[#faf8f5] border-2 border-[#d4c4b0] shadow-lg z-50 overflow-hidden">
              {downloadFormats.map((format, index) => {
                const isLocked = !getFormatAccess(format.tier);
                return (
                  <button
                    key={index}
                    onClick={() => handleFormatClick(format)}
                    disabled={isDownloading}
                    className={`w-full px-4 py-2.5 text-sm font-medium font-inter flex items-center justify-between gap-4 transition-colors whitespace-nowrap
                      ${
                        isLocked
                          ? "text-gray-400 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                          : "text-[#2c2419] hover:bg-[#e8dcc8]"
                      }
                    `}
                  >
                    <span>{format.name}</span>
                    {isLocked && (
                      <Lock className="w-3.5 h-3.5 text-[#8b6834]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={handleShare}
          className="bg-[#8b6834] text-[#faf8f5] py-2 px-3 text-sm font-medium font-inter hover:bg-[#6b4e25] focus:ring-2 focus:ring-[#8b6834] focus:ring-offset-2 transition-colors flex items-center justify-center gap-1"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
        requiredPlan={requiredPlan}
      />
    </div>
  );
}
