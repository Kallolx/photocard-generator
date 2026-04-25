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
      // Create a deep clone of the element to avoid modifying the visible DOM
      const clone = photocardElement.cloneNode(true) as HTMLElement;
      
      // We need to position the clone off-screen but part of DOM for some styles/fonts to resolve correctly
      // or at least handle the image loading manually before passing to html-to-image
      // Actually, html-to-image handles cloning internally, but we need to ensure images are loaded.
      // A better approach for "stale image" issues is to manually fetch the images and replace src with base64
      // in the *original* or let html-to-image handle it with a filter.
      
      // Let's try the pre-fetch approach on the existing DOM for a moment, or use the 'filter' to force reload? 
      // No, let's manually fetch images and convert to DataURL for the library.
      
      const images = Array.from(photocardElement.querySelectorAll("img"));
      
      // Map of original src to Data URL
      const srcMap = new Map<string, string>();
      
      await Promise.all(
        images.map(async (img) => {
          const src = img.src;
          if (!src || src.startsWith("data:")) return;
          
          try {
            // Fetch with cache busting
            const fetchUrl = src + (src.includes("?") ? "&" : "?") + "t=" + Date.now();
            const response = await fetch(fetchUrl, { cache: "no-store" });
            const blob = await response.blob();
            return new Promise<void>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                if (typeof reader.result === "string") {
                  srcMap.set(src, reader.result);
                }
                resolve();
              };
              reader.readAsDataURL(blob);
            });
          } catch (err) {
            console.error("Failed to pre-fetch image:", src, err);
          }
        })
      );

      // Function to process the node and swap images
      const filter = (node: HTMLElement) => {
        if (node.tagName === "IMG") {
          const img = node as HTMLImageElement;
          if (srcMap.has(img.src)) {
            img.src = srcMap.get(img.src)!;
          }
        }
        return true;
      };

      // Since we can't easily hook into the library's internal clone process with a replacement map
      // without using the 'filter' which is for exclusion...
      // actually we can just modify our clone if we made one.
      
      // Alternative: Use the library's `imagePlaceholder` or pre-process the DOM.
      // Let's pre-process: swap srcs in the real DOM, capture, swap back?
      // Risky for flicker.
      
      // Better: Create a hidden container, put the clone there, swap srcs in clone, capture clone.
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      // Copy width/height to ensure layout is same
      container.style.width = photocardElement.offsetWidth + 'px';
      // container.style.height = photocardElement.offsetHeight + 'px'; // Height might be auto
      document.body.appendChild(container);
      
      container.appendChild(clone);
      
      // Remove ad banner placeholder if present (it should only show during editing, not in downloads)
      // Find divs that contain "Ad Banner Area" text - this is the placeholder
      const allDivs = Array.from(clone.querySelectorAll('div'));
      const adBannerPlaceholder = allDivs.find(div => 
        div.textContent?.includes('Ad Banner Area (40px height)')
      );
      if (adBannerPlaceholder) {
        adBannerPlaceholder.remove();
      }
      
      // Update images in clone
      const cloneImages = Array.from(clone.querySelectorAll("img"));
      cloneImages.forEach(img => {
        // Find by matching the original src (which we have in the map, BUT the clone has the same src so far)
        // Wait, the clone has the same src attributes.
        if (srcMap.has(img.src)) {
           img.src = srcMap.get(img.src)!;
        }
      });
      
      // Wait a tiny bit for the blob srcs to be recognized by layout engine
       await new Promise((resolve) => setTimeout(resolve, 100));

      let dataUrl;
      const options = {
        quality,
        pixelRatio: quality === 1.0 ? 3 : 2,
        backgroundColor: format === "jpg" ? "#ffffff" : undefined,
        // We are capturing the CLONE now
      };

      if (format === "jpg") {
        dataUrl = await toJpeg(clone, options);
      } else if (format === "svg") {
        dataUrl = await toSvg(clone, options);
      } else {
        dataUrl = await toPng(clone, options);
      }

      // Cleanup
      document.body.removeChild(container);

      const link = document.createElement("a");
      link.download = `photocard-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();

      setShowFormats(false);
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Failed to download image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const photocardElement = document.getElementById(targetId);
    if (!photocardElement) return;

    try {
      // Clone the element and remove placeholder
      const clone = photocardElement.cloneNode(true) as HTMLElement;
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = photocardElement.offsetWidth + 'px';
      document.body.appendChild(container);
      container.appendChild(clone);
      
      // Remove ad banner placeholder
      const allDivs = Array.from(clone.querySelectorAll('div'));
      const adBannerPlaceholder = allDivs.find(div => 
        div.textContent?.includes('Ad Banner Area (40px height)')
      );
      if (adBannerPlaceholder) {
        adBannerPlaceholder.remove();
      }
      
      // Wait a bit for layout
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      const dataUrl = await toPng(clone, {
        quality: 0.95,
        pixelRatio: 2,
      });
      
      // Cleanup
      document.body.removeChild(container);

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
