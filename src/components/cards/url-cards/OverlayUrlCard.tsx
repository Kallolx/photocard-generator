"use client";

import { PhotocardData, BackgroundOptions, CardFontStyles, VisibilitySettings } from "@/types";
import { useRef } from "react";
import { getProxiedImageUrl } from "@/utils/imageProxy";


// ─── Text-shadow helpers ──────────────────────────────────────────────────────
function isLightColor(color: string): boolean {
  let r = 0, g = 0, b = 0;
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  }
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

function getTextShadow(preset: string, angle = 135, textColor = "#ffffff"): string {
  if (!preset || preset === "none") return "none";
  const rad = (angle * Math.PI) / 180;
  const d = 2;
  const ox = Math.cos(rad) * d;
  const oy = Math.sin(rad) * d;
  const light = isLightColor(textColor);
  switch (preset) {
    case "soft":
      return light ? `${ox}px ${oy}px 4px rgba(0,0,0,0.4)` : `${ox}px ${oy}px 4px rgba(255,255,255,0.4)`;
    case "hard":
      return light ? `${ox * 1.5}px ${oy * 1.5}px 0px rgba(0,0,0,0.8)` : `${ox * 1.5}px ${oy * 1.5}px 0px rgba(255,255,255,0.8)`;
    case "glow":
      return light ? `0 0 8px rgba(0,0,0,0.6), 0 0 16px rgba(0,0,0,0.4)` : `0 0 8px rgba(255,255,255,0.8), 0 0 16px rgba(255,255,255,0.5)`;
    case "outline":
      return light
        ? `${ox}px ${oy}px 0 rgba(0,0,0,0.9),${-ox}px ${-oy}px 0 rgba(0,0,0,0.9),${oy}px ${-ox}px 0 rgba(0,0,0,0.9),${-oy}px ${ox}px 0 rgba(0,0,0,0.9)`
        : `${ox}px ${oy}px 0 rgba(255,255,255,0.9),${-ox}px ${-oy}px 0 rgba(255,255,255,0.9),${oy}px ${-ox}px 0 rgba(255,255,255,0.9),${-oy}px ${ox}px 0 rgba(255,255,255,0.9)`;
    default: return "none";
  }
}

function getTextStroke(width: number, color: string): string {
  if (!width) return "none";
  const steps = 8;
  return Array.from({ length: steps }, (_, i) => {
    const a = (i * 2 * Math.PI) / steps;
    return `${(Math.cos(a) * width).toFixed(2)}px ${(Math.sin(a) * width).toFixed(2)}px 0px ${color}`;
  }).join(", ");
}
// ─────────────────────────────────────────────────────────────────────────────

interface OverlayUrlCardProps {
  data: PhotocardData;
  isGenerating?: boolean;
  background?: BackgroundOptions;
  id?: string;
  fullSize?: boolean;
  frameBorderColor?: string;
  frameBorderThickness?: number;
  adBannerImage?: string | null;
  adBannerZoom?: number;
  adBannerPosition?: { x: number; y: number };
  fontStyles?: CardFontStyles;
  visibilitySettings?: VisibilitySettings;
  isLogoFavicon?: boolean;
  isDragMode?: boolean;
  onLogoUpload?: (file: File) => void;
  onFaviconUpload?: (file: File) => void;
  onVisibilityChange?: (settings: any) => void;
  onRestoreDefaults?: () => void;
}

export default function OverlayUrlCard({
  data,
  isGenerating,
  id = "photocard",
  fullSize = false,
  frameBorderColor = "#dc2626",
  adBannerImage = null,
  adBannerZoom = 100,
  adBannerPosition = { x: 0, y: 0 },
  fontStyles,
  visibilitySettings = {
    showWeek: true,
    showDate: true,
    showLogo: true,
    showQrCode: false,
    showTitle: true,
    showAdBanner: true,
  },
  isLogoFavicon = false,
  background,
  onLogoUpload,
}: OverlayUrlCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Date / weekday helpers ──────────────────────────────────────────────────
  const getCardDate = () => {
    const lang = fontStyles?.weekDateLanguage === "english" ? "en-US" : "bn-BD";
    return new Date().toLocaleDateString(lang, { year: "numeric", month: "long", day: "numeric" });
  };

  const getWeekday = () => {
    if (fontStyles?.weekDateLanguage === "english") {
      return new Date().toLocaleDateString("en-US", { weekday: "long" });
    }
    const days = ["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার"];
    return days[new Date().getDay()];
  };

  // Combined label: "3 March, Sunday, 2026" — same pattern as DuoUrlCard
  const getCombinedLabel = () => {
    const isEn = fontStyles?.weekDateLanguage === "english";
    const lang = isEn ? "en-US" : "bn-BD";
    const now = new Date();
    const dayMonth = now.toLocaleDateString(lang, { day: "numeric", month: "long" });
    const year = now.toLocaleDateString(lang, { year: "numeric" });
    const weekday = isEn
      ? now.toLocaleDateString("en-US", { weekday: "long" })
      : ["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার"][now.getDay()];
    return `${dayMonth}, ${weekday}, ${year}`;
  };

  // ── Headline style ──────────────────────────────────────────────────────────
  const titleColor = fontStyles?.headline?.color || "#FFFFFF";
  const titleShadow = (() => {
    const shadow = getTextShadow(
      fontStyles?.headline?.textShadow?.preset || "none",
      fontStyles?.headline?.textShadow?.angle || 135,
      titleColor,
    );
    const stroke = getTextStroke(
      fontStyles?.headline?.textStroke?.width || 0,
      fontStyles?.headline?.textStroke?.color || "#000000",
    );
    if (shadow !== "none" && stroke !== "none") return `${stroke}, ${shadow}`;
    if (stroke !== "none") return stroke;
    return shadow;
  })();

  return (
    <div
      id={id}
      className={
        fullSize
          ? "w-[448px] max-w-[448px] mx-auto overflow-hidden shadow-xl"
          : "w-full max-w-xl min-w-[448px] mx-auto overflow-hidden shadow-xl"
      }
      style={{ backgroundColor: background?.color || "#E53E3E" }}
    >
      {/* ── Outer card padding ── */}
      <div className="px-4 pt-4 pb-0">

        {/* ── Image box — full width, rounded corners ── */}
        <div className="relative w-full overflow-hidden rounded-2xl" style={{ height: "380px" }}>

          {/* Background image or placeholder */}
          {data.image ? (
            <img
              src={getProxiedImageUrl(data.image)}
              alt="Article image"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
              }}
            />
          ) : (
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-2" style={{ backgroundColor: "#e5e7eb" }}>
              <svg className="w-14 h-14" fill="none" stroke="#9ca3af" viewBox="0 0 24 24" style={{ opacity: 0.5 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-inter" style={{ color: "#9ca3af" }}>No Image</span>
            </div>
          )}

          {/* ── CTA — centered box at top of image, no rounded corners ── */}
          <div className="absolute top-3 left-0 right-0 z-10 flex justify-center">
            <div
              className="flex items-center rounded-sm gap-2 px-2 py-1"
              style={{ backgroundColor: background?.color || "#E53E3E" }}
            >
              {/* Left arrow chevron */}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <path d="M15 18l-6-6 6-6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span
                className="text-[14px] font-semibold font-noto-bengali whitespace-nowrap"
                style={{ color: "#ffffff" }}
              >
                বিস্তারিত কমেন্টে
              </span>
              {/* Right arrow chevron */}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <path d="M9 18l6-6-6-6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* ── Dark gradient overlay at bottom — readable but not blocking image ── */}
          <div
            className="absolute inset-0 z-[5]"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.52) 35%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.0) 80%)",
            }}
          />

          {/* ── Headline — sits on the gradient ── */}
          {visibilitySettings.showTitle && (
            <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-4 pt-6">
              <h2
                className="leading-tight"
                style={
                  {
                    fontFamily: fontStyles?.headline?.fontFamily || "Noto Serif Bengali",
                    fontSize: fontStyles?.headline?.fontSize || "32px",
                    fontWeight: fontStyles?.headline?.fontWeight || "700",
                    color: "#FFFFFF",
                    textAlign: fontStyles?.headline?.textAlign || "center",
                    letterSpacing: fontStyles?.headline?.letterSpacing || "0px",
                    textShadow: titleShadow !== "none" ? titleShadow : "0 1px 6px rgba(0,0,0,0.6)",
                  } as React.CSSProperties
                }
              >
                &ldquo;{data.title}&rdquo;
              </h2>
            </div>
          )}
        </div>

        {/* ── Footer row — logo left, week/date right ── */}
        <div className="flex items-center justify-between px-1 py-3 mt-1" style={{ backgroundColor: background?.color || "#E53E3E" }}>

          {/* Logo — left */}
          {visibilitySettings.showLogo && (
            <div className="flex items-center min-w-0 max-w-[48%]">
              {data.logo && !isLogoFavicon ? (
                <img
                  src={getProxiedImageUrl(data.logo)}
                  alt="Logo"
                  className="h-8 w-auto max-w-[110px] object-contain"
                  style={{ filter: "brightness(0) invert(1)" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded"
                  style={{ backgroundColor: "#f3f4f6" }}
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span className="text-[11px] font-bold tracking-wider font-inter" style={{ color: "#9ca3af" }}>LOGO</span>
                </div>
              )}
            </div>
          )}

          {/* Week & Date — side by side combined label, right-aligned */}
          {(visibilitySettings.showWeek || visibilitySettings.showDate) && (
            <div className="ml-auto text-right">
              <span
                style={{
                  fontFamily: fontStyles?.week?.fontFamily || "Noto Serif Bengali",
                  fontSize: fontStyles?.week?.fontSize || "20px",
                  fontWeight: fontStyles?.week?.fontWeight || "600",
                  color: fontStyles?.week?.color || "#ffffff",
                  letterSpacing: fontStyles?.week?.letterSpacing || "0px",
                }}
              >
                {visibilitySettings.showWeek && visibilitySettings.showDate
                  ? getCombinedLabel()
                  : visibilitySettings.showWeek
                    ? getWeekday()
                    : getCardDate()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Ad Banner (optional, bottom) ── */}
      {visibilitySettings?.showAdBanner && adBannerImage && (
        <div className="w-full relative overflow-hidden" style={{ height: "60px" }}>
          <img
            src={adBannerImage}
            alt="Advertisement"
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              transform: `translate(-50%, -50%) translate(${adBannerPosition.x}px, ${adBannerPosition.y}px) scale(${adBannerZoom / 100})`,
              transformOrigin: "center center",
              maxWidth: "none",
              maxHeight: "none",
              width: "auto",
              height: "auto",
              minWidth: "100%",
              minHeight: "100%",
            }}
          />
        </div>
      )}
      {visibilitySettings?.showAdBanner && !adBannerImage && !isGenerating && (
        <div
          className="w-full bg-[#e8dcc8] border-2 border-dashed border-[#d4c4b0] flex items-center justify-center"
          style={{ height: "80px" }}
        >
          <span className="text-[#5d4e37] text-xs font-inter">Ad Banner Area (80px height)</span>
        </div>
      )}

      {/* Hidden file input for logo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onLogoUpload) onLogoUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
