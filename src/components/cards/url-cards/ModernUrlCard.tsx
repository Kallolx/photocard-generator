"use client";

import { PhotocardData, BackgroundOptions } from "@/types";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { getProxiedImageUrl } from "@/utils/imageProxy";

interface ModernUrlCardProps {
  data: PhotocardData;
  isGenerating?: boolean;
  background?: BackgroundOptions;
  id?: string;
  fullSize?: boolean;
  frameBorderColor?: string;
  frameBorderThickness?: number;
  adBannerImage?: string | null;
}

export default function ModernUrlCard({
  data,
  isGenerating,
  background,
  id = "photocard",
  fullSize = false,
  frameBorderColor = "#FFFFFF",
  frameBorderThickness = 0,
  adBannerImage = null,
}: ModernUrlCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    if (data.url) {
      QRCode.toDataURL(data.url, {
        width: 120,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      }).then(setQrCodeUrl);
    }
  }, [data.url]);

  const getBengaliDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return now.toLocaleDateString("bn-BD", options);
  };

  const getBengaliWeekday = () => {
    const days = [
      "রবিবার",
      "সোমবার",
      "মঙ্গলবার",
      "বুধবার",
      "বৃহস্পতিবার",
      "শুক্রবার",
      "শনিবার",
    ];
    return days[new Date().getDay()];
  };

  const getBackgroundStyle = () => {
    if (!background) return { backgroundColor: "#8b6834" }; // default brown

    if (
      background.type === "gradient" &&
      background.gradientFrom &&
      background.gradientTo
    ) {
      return {
        backgroundImage: `linear-gradient(135deg, ${background.gradientFrom}, ${background.gradientTo})`,
      };
    }

    return { backgroundColor: background.color };
  };

  // Get the background color for highlighted text (used in CTA)
  const getHighlightColor = () => {
    if (!background) return "#8b6834";
    if (background.type === "gradient" && background.gradientFrom)
      return background.gradientFrom;
    return background.color;
  };

  const getPatternStyle = () => {
    if (!background?.pattern || background.pattern === "none") return {};

    const color = background.patternColor || "#000000";
    const opacity = background.patternOpacity || 0.1;

    let backgroundImage = "";

    switch (background.pattern) {
      case "dots":
        backgroundImage = `radial-gradient(${color} 1px, transparent 1px)`;
        return {
          backgroundImage,
          backgroundSize: "20px 20px",
          opacity,
        };
      case "lines":
        backgroundImage = `repeating-linear-gradient(45deg, ${color}, ${color} 1px, transparent 1px, transparent 10px)`;
        return {
          backgroundImage,
          opacity,
        };
      case "grid":
        backgroundImage = `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`;
        return {
          backgroundImage,
          backgroundSize: "20px 20px",
          opacity,
        };
      case "checks":
        backgroundImage = `repeating-linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%, ${color}), repeating-linear-gradient(45deg, ${color} 25%, #00000000 25%, #00000000 75%, ${color} 75%, ${color})`;
        return {
          backgroundImage,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 10px 10px",
          opacity,
        };
      case "curves":
        backgroundImage = `repeating-radial-gradient(circle at 0 0, transparent 0, ${color} 1px, transparent 2px, transparent 4px)`;
        return {
          backgroundImage,
          backgroundSize: "16px 16px",
          opacity,
        };
      case "abstract":
        backgroundImage = `radial-gradient(circle at 50% 50%, ${color} 2px, transparent 2.5px), radial-gradient(circle at 0% 0%, ${color} 2px, transparent 2.5px)`;
        return {
          backgroundImage,
          backgroundSize: "40px 40px",
          opacity,
        };
      case "custom":
        if (background.patternImage) {
          return {
            backgroundImage: `url(${background.patternImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity,
          };
        }
        return {};
      default:
        return {};
    }
  };

  return (
    <div
      id={id}
      className={
        fullSize
          ? "w-[448px] max-w-[448px] mx-auto overflow-hidden shadow-xl relative"
          : "w-full max-w-md mx-auto overflow-hidden shadow-xl relative"
      }
      style={getBackgroundStyle()}
    >
      {/* Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={getPatternStyle()}
      />

      {/* Image with overlay - Full width at top */}
      <div
        className="w-full h-[300px] aspect-video bg-white overflow-hidden relative"
        style={{
          border: `${frameBorderThickness}px solid ${frameBorderColor}`,
        }}
      >
        {data.image ? (
          <img
            src={getProxiedImageUrl(data.image)}
            alt="Article image"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">No image available</span>
          </div>
        )}

        {/* Overlay: Logo and Date on top of image */}
        <div className="absolute top-0 left-0 right-0 px-6 pt-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {data.logo && (
                <div className="bg-white rounded-lg border border-gray-200 p-2 min-w-[60px] min-h-[30px] shadow-lg">
                  <img
                    src={getProxiedImageUrl(data.logo)}
                    alt="Site logo"
                    className="object-contain w-auto h-auto max-w-[100px] max-h-8"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-icon.png";
                    }}
                  />
                </div>
              )}
            </div>
            <div
              className="text-white text-sm font-noto-bengali font-medium tracking-wide px-3 py-1 rounded shadow-lg"
              style={getBackgroundStyle()}
            >
              {getBengaliWeekday()} | {getBengaliDate()}
            </div>
          </div>
        </div>
      </div>

      {/* Content below image */}
      <div className="px-6 pt-4 pb-4 relative z-10">
        {/* Title */}
        <h2 className="text-white font-noto-bengali text-2xl text-center font-bold mb-3 leading-tight">
          {data.title}
        </h2>

        {/* QR Code and CTA */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center">
            {qrCodeUrl && (
              <div className="bg-white p-1 rounded-lg flex-shrink-0">
                <img src={qrCodeUrl} alt="QR Code" className="w-12 h-12" />
              </div>
            )}
          </div>

          {/* CTA box on the right */}
          <div className="ml-auto">
            <div className="bg-white border border-gray-300 py-.5 px-3 text-center max-w-[230px] rounded-sm">
              <p className="font-noto-bengali text-md font-bold text-gray-900">
                পুরো খবর দেখুন{" "}
                <span style={{ color: getHighlightColor() }}>
                  কমেন্টের লিংকে
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ad Banner - Full width at bottom */}
      {adBannerImage && (
        <div className="w-full" style={{ height: "60px" }}>
          <img
            src={adBannerImage}
            alt="Advertisement"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
