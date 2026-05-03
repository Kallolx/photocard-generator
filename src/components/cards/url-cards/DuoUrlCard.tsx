"use client";

import { PhotocardData, BackgroundOptions, CardFontStyles, VisibilitySettings, FooterItem, WatermarkSettings } from "@/types";
import { darkenHexColor } from "@/lib/utils";
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
  footerItems?: FooterItem[];
  footerOpacity?: number;
  footerIconColor?: "white" | "colored";
  watermark?: WatermarkSettings;
  isLogoFavicon?: boolean;
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
  footerItems = [],
  footerOpacity = 100,
  footerIconColor = "colored",
  watermark,
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
}: DuoUrlCardProps) {

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

  // ── Body colour — user can pick from Background tab; #dc2626 is the app default (ignored) ─
  const duoBodyBg = (background?.color && background.color !== "#dc2626") ? background.color : CARD_BODY_BG;

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
          ? "relative w-[448px] max-w-[448px] mx-auto overflow-hidden shadow-xl"
          : "relative w-full min-w-[448px] max-w-md mx-auto overflow-hidden shadow-xl"
      }
    >
      <div className="relative overflow-hidden">
        {/* Brand Watermark */}
        {watermark?.text && watermark?.enabled !== false && (
          <div
            style={{
              position: "absolute",
              bottom: watermark.y ?? 0,
              left: `calc(50% + ${watermark.x ?? 0}px)`,
              transform: `translateX(-50%) rotate(${watermark.rotation ?? 0}deg)`,
              opacity: watermark.opacity ?? 0.30,
              zIndex: 0,
              pointerEvents: "none",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                fontFamily: /[\u0980-\u09FF]/.test(watermark.text) ? "Noto Serif Bengali" : "DM Sans",
                fontWeight: 800,
                letterSpacing: "-0.05em",
                fontSize: `${watermark.fontSize ?? 48}px`,
                textTransform: "uppercase",
                color: "#ffffff",
              }}
            >
              {watermark.text}
            </span>
          </div>
        )}

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

          {/* Week & Date */}
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
                {visibilitySettings.showWeek && visibilitySettings.showDate
                  ? getCombinedLabel()
                  : visibilitySettings.showWeek
                    ? getWeekday()
                    : getCardDate()}
              </div>
            </div>
          )}
        </div>

        {/* ── IMAGE SECTION ── */}
        <div
          className="px-5 pb-0 pt-2"
          style={{
            background: `linear-gradient(to bottom, ${CARD_HEADER_BG} 50%, ${duoBodyBg} 50%)`,
          }}
        >
          <div
            style={{
              position: "relative",
              aspectRatio: "1008 / 576",
            }}
          >
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

        {/* ── RED BODY ── */}
        <div
          className="pt-4 pb-0"
          style={{ backgroundColor: duoBodyBg, position: "relative" }}
        >
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

          <div
            className="w-full relative overflow-hidden flex items-center justify-center gap-1 py-2.5"
            style={{ backgroundColor: hexToRgba(duoBodyBg, 0.65) }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(to bottom, rgba(255,255,255,0.22) 0%, transparent 100%)",
              }}
            />

            <div className="flex items-center relative z-10">
              <ChevronLeft className="w-4 h-4 -mr-2" strokeWidth={2.5} style={{ color: "rgba(255,255,255,0.35)" }} />
              <ChevronLeft className="w-4 h-4 -mr-2" strokeWidth={3} style={{ color: "rgba(255,255,255,0.6)" }} />
              <ChevronLeft className="w-5 h-5" strokeWidth={4} style={{ color: "rgba(255,255,255,0.98)" }} />
            </div>

            <p
              className="font-noto-bengali text-[13px] font-semibold select-none relative z-10 mx-0.5"
              style={{ color: "#FFFFFF" }}
            >
              বিস্তারিত কমেন্টের লিংকে
            </p>

            <div className="flex items-center relative z-10">
              <ChevronRight className="w-5 h-5 -mr-2" strokeWidth={4} style={{ color: "rgba(255,255,255,0.98)" }} />
              <ChevronRight className="w-4 h-4 -mr-2" strokeWidth={3} style={{ color: "rgba(255,255,255,0.6)" }} />
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} style={{ color: "rgba(255,255,255,0.35)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      {visibilitySettings?.showFooter !== false && footerItems && footerItems.length > 0 && (
        <div
          className="w-full px-4 py-2 flex items-center justify-evenly"
          style={{ background: darkenHexColor((background?.type === "gradient" ? background?.gradientFrom : undefined) || background?.color || "#1a1410"), opacity: footerOpacity / 100 }}
        >
          {footerItems.map((item) => (
            <div key={item.id} className="flex items-center gap-1.5">
              {item.type !== "text" && (
                <span className="shrink-0">
                  {item.type === "facebook" && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#1877f2" : "#fff" }}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>}
                  {item.type === "instagram" && (footerIconColor === "colored" ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><defs><radialGradient id={`ig-f-${id}`} cx="30%" cy="107%" r="1.5"><stop offset="0%" stopColor="#ffd676" /><stop offset="10%" stopColor="#f9a12e" /><stop offset="50%" stopColor="#e1306c" /><stop offset="90%" stopColor="#833ab4" /></radialGradient></defs><rect width="24" height="24" rx="6" fill={`url(#ig-f-${id})`} /><rect x="6.5" y="6.5" width="11" height="11" rx="3" stroke="#fff" strokeWidth="1.5" /><circle cx="12" cy="12" r="2.8" stroke="#fff" strokeWidth="1.5" /><circle cx="16.3" cy="7.7" r="0.8" fill="#fff" /></svg> : <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#fff" }}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>)}
                  {item.type === "youtube" && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#ff0000" : "#fff" }}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>}
                  {item.type === "twitter" && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#1d9bf0" : "#fff" }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>}
                  {item.type === "tiktok" && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#EE1D52" : "#fff" }}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.58a8.27 8.27 0 0 0 4.84 1.55V6.67a4.85 4.85 0 0 1-1.07.02z" /></svg>}
                  {item.type === "website" && <svg className="w-3.5 h-3.5" fill="none" stroke={footerIconColor === "colored" ? "#8b6834" : "white"} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>}
                </span>
              )}
              <span style={{ color: fontStyles?.footer?.color || "#ffffff", fontSize: fontStyles?.footer?.fontSize || "12px", fontFamily: fontStyles?.footer?.fontFamily || "DM Sans", fontWeight: fontStyles?.footer?.fontWeight || "600" }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Ad Banner ── */}
      {visibilitySettings?.showAdBanner && adBannerImage && (
        <div className="w-full relative overflow-hidden" style={{ height: "40px" }}>
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
          style={{ height: "40px" }}
        >
          <span className="text-[#5d4e37] text-xs font-inter">Ad Banner Area (40px height)</span>
        </div>
      )}
    </div>
  );
}
