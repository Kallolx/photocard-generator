"use client";

import { PhotocardData, BackgroundOptions, CardFontStyles, VisibilitySettings } from "@/types";
import { useRef } from "react";
import { getProxiedImageUrl } from "@/utils/imageProxy";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ─── Fixed card palette — NOT user-customisable ───────────────────────────────
const CARD_HEADER_BG = "#f3eaeb"; // light blush top bar
const CARD_BODY_BG   = "#c70001"; // deep red — body + CTA merged
const DEFAULT_BORDER_COLOR     = "#dc2626";
const DEFAULT_BORDER_THICKNESS = 4;
// SVG frame path & percentage clip-path (derived from Vector 4.svg, viewBox 1008x576)
const SVG_PATH = "M865.5 8H8V460L115.5 567.5H999.5V133.5L865.5 8Z";
const CLIP_PATH = "polygon(85.87% 1.39%, 0.79% 1.39%, 0.79% 79.86%, 11.46% 98.52%, 99.16% 98.52%, 99.16% 23.18%)";
// ─────────────────────────────────────────────────────────────────────────────

// ── Text-shadow helpers (same as other cards) ─────────────────────────────────
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
      return light
        ? `${ox}px ${oy}px 4px rgba(0,0,0,0.4)`
        : `${ox}px ${oy}px 4px rgba(255,255,255,0.4)`;
    case "hard":
      return light
        ? `${ox * 1.5}px ${oy * 1.5}px 0px rgba(0,0,0,0.8)`
        : `${ox * 1.5}px ${oy * 1.5}px 0px rgba(255,255,255,0.8)`;
    case "glow":
      return light
        ? `0 0 8px rgba(0,0,0,0.6), 0 0 16px rgba(0,0,0,0.4)`
        : `0 0 8px rgba(255,255,255,0.8), 0 0 16px rgba(255,255,255,0.5)`;
    case "outline":
      return light
        ? `${ox}px ${oy}px 0 rgba(0,0,0,0.9),${-ox}px ${-oy}px 0 rgba(0,0,0,0.9),${oy}px ${-ox}px 0 rgba(0,0,0,0.9),${-oy}px ${ox}px 0 rgba(0,0,0,0.9)`
        : `${ox}px ${oy}px 0 rgba(255,255,255,0.9),${-ox}px ${-oy}px 0 rgba(255,255,255,0.9),${oy}px ${-ox}px 0 rgba(255,255,255,0.9),${-oy}px ${ox}px 0 rgba(255,255,255,0.9)`;
    default:
      return "none";
  }
}

function getTextStroke(width: number, color: string): string {
  if (!width) return "none";
  const steps = 8;
  return Array.from({ length: steps }, (_, i) => {
    const a = (i * 2 * Math.PI) / steps;
    return `${(Math.cos(a) * width).toFixed(2)}px ${(Math.sin(a) * width).toFixed(2)}px 0px ${color}`;
  }).join(", ");
}function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substr(0, 2), 16);
  const g = parseInt(h.substr(2, 2), 16);
  const b = parseInt(h.substr(4, 2), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}// ─────────────────────────────────────────────────────────────────────────────

interface DuoUrlCardProps {
  data: PhotocardData;
  isGenerating?: boolean;
  /** Accepted but intentionally ignored — bg is fixed for this card */
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
  /** Unused — no drag/drop in this card */
  isDragMode?: boolean;
  onLogoUpload?: (file: File) => void;
  onFaviconUpload?: (file: File) => void;
  onVisibilityChange?: (settings: any) => void;
  onRestoreDefaults?: () => void;
}

export default function DuoUrlCard({
  data,
  isGenerating,
  id = "photocard",
  fullSize = false,
  frameBorderColor = DEFAULT_BORDER_COLOR,
  frameBorderThickness = DEFAULT_BORDER_THICKNESS,
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
}: DuoUrlCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Date / weekday helpers ───────────────────────────────────────────────────
  const getCardDate = () => {
    const lang = fontStyles?.weekDateLanguage === "english" ? "en-US" : "bn-BD";
    return new Date().toLocaleDateString(lang, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getWeekday = () => {
    if (fontStyles?.weekDateLanguage === "english") {
      return new Date().toLocaleDateString("en-US", { weekday: "long" });
    }
    const days = ["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার"];
    return days[new Date().getDay()];
  };

  // Combined date+weekday label: "3 March, Sunday, 2026" or Bengali equivalent
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

  // ── Headline style (with text-shadow / stroke support) ──────────────────────
  const titleColor = fontStyles?.headline.color || "#FFFFFF";
  const titleShadow = (() => {
    const shadow = getTextShadow(
      fontStyles?.headline.textShadow?.preset || "none",
      fontStyles?.headline.textShadow?.angle || 135,
      titleColor,
    );
    const stroke = getTextStroke(
      fontStyles?.headline.textStroke?.width || 0,
      fontStyles?.headline.textStroke?.color || "#000000",
    );
    if (shadow !== "none" && stroke !== "none") return `${stroke}, ${shadow}`;
    if (stroke !== "none") return stroke;
    return shadow;
  })();

  // ── Border / thickness — only used for non-image elements; frame is locked white for this card
  // (borderColor / borderPx kept for potential future use but not applied to the SVG frame)
  const _borderColor = frameBorderColor || DEFAULT_BORDER_COLOR; // eslint-disable-line @typescript-eslint/no-unused-vars
  const _borderPx    = frameBorderThickness ?? DEFAULT_BORDER_THICKNESS; // eslint-disable-line @typescript-eslint/no-unused-vars

  // ── Body colour — user can pick from Background tab; #dc2626 is the app default (ignored) ─
  const duoBodyBg = (background?.color && background.color !== "#dc2626") ? background.color : CARD_BODY_BG;

  // ── Pattern — always p-duo preset, only opacity is user-controllable ──────────
  const hasPattern = true; // eslint-disable-line @typescript-eslint/no-unused-vars

  const getPatternStyle = (): React.CSSProperties => ({
    backgroundImage: "url(/patterns/p-duo.png)",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "top center",
    opacity: background?.patternOpacity ?? 0.35,
  });

  return (
    <div
      id={id}
      className={
        fullSize
          ? "w-[448px] max-w-[448px] mx-auto overflow-hidden shadow-xl"
          : "w-full min-w-[448px] max-w-md mx-auto overflow-hidden shadow-xl"
      }
    >
      {/* ── HEADER (#fee8ea blush, compact) ── */}
      <div
        className="px-5 pt-3 pb-2 flex justify-between items-center"
        style={{ backgroundColor: CARD_HEADER_BG }}
      >
        {/* Logo — left */}
        {visibilitySettings.showLogo && (
          <div className="flex items-center gap-1.5 min-w-0 max-w-[50%]">
            {data.logo && !isLogoFavicon ? (
              <img
                src={getProxiedImageUrl(data.logo)}
                alt="Logo"
                className="h-7 w-auto max-w-[90px] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded"
                style={{ backgroundColor: "#ffffff" }}
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8b1a1a"
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span
                  className="text-[12px] font-bold tracking-wider font-inter"
                  style={{ color: "#8b1a1a" }}
                >
                  LOGO
                </span>
              </div>
            )}
          </div>
        )}

        {/* Week & Date — combined single line, no separator */}
        {(visibilitySettings.showWeek || visibilitySettings.showDate) && (
          <div className="ml-auto pl-2 mt-2">
            <div
              className="leading-snug text-right"
              style={{
                fontFamily: fontStyles?.week.fontFamily || "Noto Serif Bengali",
                fontSize: fontStyles?.week.fontSize || "16px",
                fontWeight: fontStyles?.week.fontWeight || "600",
                color: fontStyles?.week.color || "#374151",
                letterSpacing: fontStyles?.week.letterSpacing || "0px",
              }}
            >
              {/* Show combined or individual based on which are toggled */}
              {visibilitySettings.showWeek && visibilitySettings.showDate
                ? getCombinedLabel()
                : visibilitySettings.showWeek
                  ? getWeekday()
                  : getCardDate()}
            </div>
          </div>
        )}
      </div>

      {/* ── IMAGE SECTION — blush-to-red split behind frame, SVG-shape frame locked white ── */}
      <div
        className="px-5 pb-0 pt-2"
        style={{
          background: `linear-gradient(to bottom, ${CARD_HEADER_BG} 50%, ${duoBodyBg} 50%)`,
        }}
      >
        {/* Outer wrapper: drop-shadow (works with clip-path via filter) */}
        <div
          style={{
            position: "relative",
            aspectRatio: "1008 / 576",
          }}
        >
          {/* Image clipped to the SVG polygon shape */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: CLIP_PATH,
              overflow: "hidden",
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
              <div
                className="w-full h-full flex flex-col items-center justify-center gap-2"
                style={{ backgroundColor: "#e5e7eb" }}
              >
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="#9ca3af"
                  viewBox="0 0 24 24"
                  style={{ opacity: 0.5 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm font-inter" style={{ color: "#9ca3af" }}>
                  No Image
                </span>
              </div>
            )}
          </div>

          {/* SVG frame overlay — white stroke, always locked, no fill */}
          <svg
            viewBox="0 0 1008 576"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            <path
              d={SVG_PATH}
              fill="none"
              stroke="white"
              strokeWidth="9"
            />
          </svg>
        </div>
      </div>

      {/* ── RED BODY — Title + CTA merged into one slab ── */}
      <div
        className="pt-4 pb-0"
        style={{ backgroundColor: duoBodyBg, position: "relative" }}
      >
        {/* Pattern overlay — locked to red section only */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ ...getPatternStyle(), zIndex: 0 }}
        />

        {visibilitySettings.showTitle && (
          <h2
            className="leading-tight text-center mb-4 px-5"
            style={
              {
                fontFamily: fontStyles?.headline.fontFamily || "Noto Serif Bengali",
                fontSize: fontStyles?.headline.fontSize || "28px",
                fontWeight: fontStyles?.headline.fontWeight || "700",
                color: fontStyles?.headline.color || "#FFFFFF",
                textAlign: fontStyles?.headline.textAlign || "center",
                letterSpacing: fontStyles?.headline.letterSpacing || "0px",
                textShadow: titleShadow !== "none" ? titleShadow : undefined,
              } as React.CSSProperties
            }
          >
            {data.title}
          </h2>
        )}

        {/* CTA band — semi-transparent so pattern beneath bleeds through */}
        <div
          className="w-full relative overflow-hidden flex items-center justify-center gap-1 py-2.5"
          style={{ backgroundColor: hexToRgba(duoBodyBg, 0.65) }}
        >
          {/* Gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, rgba(255,255,255,0.22) 0%, transparent 100%)",
            }}
          />

          {/* Left triple chevrons: outer two faint/thin, inner one bold */}
          <div className="flex items-center relative z-10">
            <ChevronLeft className="w-4 h-4 -mr-2" strokeWidth={2.5} style={{ color: "rgba(255,255,255,0.35)" }} />
            <ChevronLeft className="w-4 h-4 -mr-2" strokeWidth={3} style={{ color: "rgba(255,255,255,0.6)" }} />
            <ChevronLeft className="w-5 h-5" strokeWidth={4} style={{ color: "rgba(255,255,255,0.98)" }} />
          </div>

          {/* CTA text */}
          <p
            className="font-noto-bengali text-[13px] font-semibold select-none relative z-10 mx-0.5"
            style={{ color: "#FFFFFF" }}
          >
            বিস্তারিত কমেন্টের লিংকে
          </p>

          {/* Right triple chevrons: inner one bold, outer two faint/thin */}
          <div className="flex items-center relative z-10">
            <ChevronRight className="w-5 h-5 -mr-2" strokeWidth={4} style={{ color: "rgba(255,255,255,0.98)" }} />
            <ChevronRight className="w-4 h-4 -mr-2" strokeWidth={3} style={{ color: "rgba(255,255,255,0.6)" }} />
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} style={{ color: "rgba(255,255,255,0.35)" }} />
          </div>
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

