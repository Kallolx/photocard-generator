"use client";

import {
  PhotocardData,
  BackgroundOptions,
  CardFontStyles,
  VisibilitySettings,
  FooterItem,
  WatermarkSettings,
} from "@/types";
import { darkenHexColor } from "@/lib/utils";
import { getProxiedImageUrl } from "@/utils/imageProxy";
import { Image as ImageIcon } from "lucide-react";

// ─── Text helpers ─────────────────────────────────────────────────────────────

function isLightColor(color: string): boolean {
  let r = 0, g = 0, b = 0;
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } else if (color.startsWith("rgb")) {
    const match = color.match(/\d+/g);
    if (match) { r = +match[0]; g = +match[1]; b = +match[2]; }
  }
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

function getTextShadow(preset: string, angle = 135, textColor = "#ffffff"): string {
  if (preset === "none" || !preset) return "none";
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad) * 2;
  const dy = Math.sin(rad) * 2;
  const light = isLightColor(textColor);
  switch (preset) {
    case "soft":  return light ? `${dx}px ${dy}px 4px rgba(0,0,0,0.4)` : `${dx}px ${dy}px 4px rgba(255,255,255,0.4)`;
    case "hard":  return light ? `${dx*1.5}px ${dy*1.5}px 0px rgba(0,0,0,0.8)` : `${dx*1.5}px ${dy*1.5}px 0px rgba(255,255,255,0.8)`;
    case "glow":  return light ? `0 0 8px rgba(0,0,0,0.6),0 0 16px rgba(0,0,0,0.4)` : `0 0 8px rgba(255,255,255,0.8),0 0 16px rgba(255,255,255,0.5)`;
    case "outline": return light
      ? `${dx}px ${dy}px 0 rgba(0,0,0,0.9),${-dx}px ${-dy}px 0 rgba(0,0,0,0.9),${dy}px ${-dx}px 0 rgba(0,0,0,0.9),${-dy}px ${dx}px 0 rgba(0,0,0,0.9)`
      : `${dx}px ${dy}px 0 rgba(255,255,255,0.9),${-dx}px ${-dy}px 0 rgba(255,255,255,0.9),${dy}px ${-dx}px 0 rgba(255,255,255,0.9),${-dy}px ${dx}px 0 rgba(255,255,255,0.9)`;
    default: return "none";
  }
}

function getTextStroke(width: number, color: string): string {
  if (!width) return "none";
  const steps = 8;
  return Array.from({ length: steps }, (_, i) => {
    const angle = (i * 2 * Math.PI) / steps;
    return `${(Math.cos(angle) * width).toFixed(2)}px ${(Math.sin(angle) * width).toFixed(2)}px 0px ${color}`;
  }).join(", ");
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BlendUrlCardProps {
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
  highlightIndices?: number[];
  highlightStyle?: "boxed" | "colored";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BlendUrlCard({
  data,
  isGenerating = false,
  background = { type: "solid", color: "#1a1a2e" },
  id = "photocard",
  fullSize = false,
  frameBorderColor = "#FFFFFF",
  frameBorderThickness = 0,
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
    showFooter: false,
  },
  isLogoFavicon = false,
  highlightIndices = [],
  highlightStyle = "colored",
}: BlendUrlCardProps) {

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const getAccentColor = (): string => {
    if (!background) return "#1a1a2e";
    if (background.type === "gradient" && background.gradientFrom) return background.gradientFrom;
    return background.color || "#1a1a2e";
  };

  const getWeekday = (): string => {
    if (fontStyles?.weekDateLanguage === "english")
      return new Date().toLocaleDateString("en-US", { weekday: "long" });
    const days = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
    return days[new Date().getDay()];
  };

  const getCardDate = (): string => {
    const lang = fontStyles?.weekDateLanguage === "english" ? "en-US" : "bn-BD";
    return new Date().toLocaleDateString(lang, { year: "numeric", month: "long", day: "numeric" });
  };

  const getSiteDomain = (): string => {
    try { return new URL(data.url).hostname.toLowerCase().replace("www.", ""); }
    catch { return data.siteName?.toLowerCase() || "example.com"; }
  };

  const headlineTextShadow = (() => {
    const c = fontStyles?.headline.color ?? "#111827";
    const sh = getTextShadow(fontStyles?.headline.textShadow?.preset ?? "none", fontStyles?.headline.textShadow?.angle ?? 135, c);
    const st = getTextStroke(fontStyles?.headline.textStroke?.width ?? 0, fontStyles?.headline.textStroke?.color ?? "#000000");
    if (sh !== "none" && st !== "none") return `${st}, ${sh}`;
    if (st !== "none") return st;
    return sh;
  })();

  const accentColor = getAccentColor();
  const safeHighlightBg = ["#fff", "#ffffff"].includes((accentColor || "").toLowerCase())
    ? "#dc2626"
    : accentColor;
  const footerBg = darkenHexColor(
    (background?.type === "gradient" ? background?.gradientFrom : undefined) || background?.color || "#1a1a2e",
  );

  const words = (data.title || "").trim().split(/\s+/).filter(Boolean);
  const highlighted = new Set(highlightIndices);
  const titleRuns: { text: string; highlighted: boolean }[] = [];

  let i = 0;
  while (i < words.length) {
    if (highlighted.has(i)) {
      const start = i;
      while (i + 1 < words.length && highlighted.has(i + 1)) i += 1;
      titleRuns.push({ text: words.slice(start, i + 1).join(" "), highlighted: true });
      i += 1;
      continue;
    }
    titleRuns.push({ text: words[i], highlighted: false });
    i += 1;
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      id={id}
      className={fullSize ? "w-[448px] max-w-[448px] mx-auto overflow-hidden shadow-xl" : "w-full min-w-[448px] max-w-[448px] mx-auto overflow-hidden shadow-xl"}
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* ── Inner wrapper ── */}
      <div className="relative overflow-hidden">

        {/* Brand watermark */}
        {watermark?.text && watermark?.enabled !== false && (
          <div
            style={{
              position: "absolute",
              bottom: watermark.y ?? 0,
              left: `calc(50% + ${watermark.x ?? 0}px)`,
              transform: `translateX(-50%) rotate(${watermark.rotation ?? 0}deg)`,
              opacity: watermark.opacity ?? 0.15,
              zIndex: 6,
              pointerEvents: "none",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{
              fontFamily: /[\u0980-\u09FF]/.test(watermark.text) ? "Noto Serif Bengali" : "DM Sans",
              fontWeight: 800,
              letterSpacing: "-0.05em",
              fontSize: `${watermark.fontSize ?? 48}px`,
              textTransform: "uppercase",
              color: "#111827",
            }}>
              {watermark.text}
            </span>
          </div>
        )}

        {/* ── Text zone (white, fades into image) ── */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            background: "linear-gradient(to bottom, #ffffff 0%, #ffffff 82%, rgba(255,255,255,0) 100%)",
            padding: "20px 20px 44px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            overflow: "hidden",
          }}
        >
          {/* Grid pattern overlay — right side, fades to transparent on the left */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: "70%",
              zIndex: 0,
              pointerEvents: "none",
              opacity: background?.patternOpacity ?? 0.18,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='${encodeURIComponent(background?.patternColor ?? accentColor)}' stroke-width='1'/%3E%3C/svg%3E")`,
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 60%)",
              maskImage: "linear-gradient(to right, transparent 0%, black 60%)",
            }}
          />
          {/* Logo */}
          {visibilitySettings.showLogo && (
            <div className="flex items-start" style={{ position: "relative", zIndex: 1, marginBottom: "6px" }}>
              {data.logo ? (
                <div className={`inline-flex items-center justify-center ${isLogoFavicon ? "rounded-full" : "rounded-md"}`}>
                  <img
                    src={getProxiedImageUrl(data.logo)}
                    alt="Logo"
                    style={{ maxHeight: "28px", maxWidth: "88px", objectFit: "contain", display: "block" }}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-sm px-3 py-1 shadow-sm flex items-center gap-1 justify-center">
                  <ImageIcon size={16} color="#6b7280" />
                  <span style={{ color: "#6b7280", fontSize: "13px", fontWeight: 700, fontFamily: "Inter, DM Sans, sans-serif", letterSpacing: "0.02em" }}>LOGO</span>
                </div>
              )}
            </div>
          )}

          {/* Headline with selectable highlight words (boxed or colored mode) */}
          {visibilitySettings.showTitle && (
            <h2
              style={{
                fontFamily: fontStyles?.headline.fontFamily ?? "Noto Serif Bengali",
                fontSize: fontStyles?.headline.fontSize ?? "30px",
                fontWeight: fontStyles?.headline.fontWeight ?? "700",
                textAlign: (fontStyles?.headline.textAlign as React.CSSProperties["textAlign"]) ?? "left",
                letterSpacing: fontStyles?.headline.letterSpacing ?? "0px",
                lineHeight: 1.18,
                textShadow: headlineTextShadow !== "none" ? headlineTextShadow : undefined,
                margin: 0,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                position: "relative",
                zIndex: 1,
                color: fontStyles?.headline.color ?? "#111827",
              } as React.CSSProperties}
            >
              {titleRuns.map((run, idx) => (
                <span
                  key={`${run.text}-${idx}`}
                  style={
                    run.highlighted
                      ? highlightStyle === "boxed"
                        ? {
                            display: "inline-block",
                            color: "#ffffff",
                            backgroundColor: safeHighlightBg,
                            padding: "0 5px 1px",
                            borderRadius: "2px",
                            lineHeight: 1.05,
                            verticalAlign: "baseline",
                            marginRight: "3px",
                          }
                        : {
                            color: accentColor,
                          }
                      : undefined
                  }
                >
                  {run.text}
                  {idx < titleRuns.length - 1 && (highlightStyle === "boxed" ? !run.highlighted : true)
                    ? " "
                    : ""}
                </span>
              ))}
            </h2>
          )}

          {/* Meta row: site name · weekday · date */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            {(data.siteName || data.url) && (
              <span style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: "10px",
                fontWeight: 700,
                color: accentColor,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}>
                {getSiteDomain()}
              </span>
            )}
            {(data.siteName || data.url) && (visibilitySettings.showWeek || visibilitySettings.showDate) && (
              <span style={{ color: "#9ca3af", fontSize: "10px" }}>·</span>
            )}
            {visibilitySettings.showWeek && (
              <span style={{
                fontFamily: fontStyles?.week.fontFamily ?? "Noto Serif Bengali",
                fontSize: "14px",
                fontWeight: 500,
                color: "#4b5563",
              }}>
                {getWeekday()}
              </span>
            )}
            {visibilitySettings.showWeek && visibilitySettings.showDate && (
              <span style={{ color: "#9ca3af", fontSize: "10px" }}>|</span>
            )}
            {visibilitySettings.showDate && (
              <span style={{
                fontFamily: fontStyles?.date.fontFamily ?? "Noto Serif Bengali",
                fontSize: "14px",
                fontWeight: 500,
                color: "#4b5563",
              }}>
                {getCardDate()}
              </span>
            )}
          </div>
        </div>

        {/* ── Image zone (slides up under the gradient fade) ── */}
        <div style={{ marginTop: "-44px", position: "relative", zIndex: 1 }}>
          {data.image ? (
            <img
              src={getProxiedImageUrl(data.image)}
              alt="Article"
              style={{
                width: "100%",
                height: "280px",
                objectFit: "cover",
                display: "block",
                border: frameBorderThickness > 0 ? `${frameBorderThickness}px solid ${frameBorderColor}` : "none",
              }}
              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-image.jpg"; }}
            />
          ) : (
            <div style={{ width: "100%", height: "280px", backgroundColor: "#f3f4f6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <svg style={{ width: "48px", height: "48px", color: "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span style={{ color: "#9ca3af", fontSize: "14px", fontFamily: "Inter, sans-serif" }}>No Image</span>
            </div>
          )}

          {/* Bottom overlay: favicon (left) + CTA (right) */}
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)",
            padding: "32px 12px 10px 12px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            zIndex: 2,
            pointerEvents: "none",
          }}>
            {/* Favicon — bottom-left */}
            <div style={{ display: "flex", alignItems: "center" }}>
              {data.favicon ? (
                <img
                  src={getProxiedImageUrl(data.favicon)}
                  alt="favicon"
                  style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "contain", display: "block", flexShrink: 0 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div style={{ width: "32px", height: "32px", borderRadius: "20px", backgroundColor: "#ffffff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ImageIcon size={16} color="#6b7280" />
                </div>
              )}
            </div>

            {/* CTA — bottom-right */}
            <span style={{
              fontFamily: "Noto Serif Bengali, DM Sans, sans-serif",
              fontSize: "9px",
              fontWeight: 700,
              color: "#ffffff",
              backgroundColor: accentColor,
              borderRadius: "4px",
              padding: "3px 8px",
              whiteSpace: "nowrap",
              letterSpacing: "0.01em",
              flexShrink: 0,
            }}>
              বিস্তারিত কমেন্টের লিংকে
            </span>
          </div>
        </div>

      </div>{/* ── end inner wrapper ── */}

      {/* ── Social footer bar ── */}
      {visibilitySettings?.showFooter !== false && footerItems.length > 0 && (
        <div
          className="w-full px-4 py-2 flex items-center justify-evenly"
          style={{ background: footerBg, opacity: footerOpacity / 100 }}
        >
          {footerItems.map((item) => (
            <div key={item.id} className="flex items-center gap-1.5">
              {item.type !== "text" && (
                <span className="shrink-0">
                  {item.type === "facebook" && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#1877f2" : "#fff" }}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>}
                  {item.type === "instagram" && (footerIconColor === "colored"
                    ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><defs><radialGradient id={`ig-b-${id}`} cx="30%" cy="107%" r="1.5"><stop offset="0%" stopColor="#ffd676" /><stop offset="10%" stopColor="#f9a12e" /><stop offset="50%" stopColor="#e1306c" /><stop offset="90%" stopColor="#833ab4" /></radialGradient></defs><rect width="24" height="24" rx="6" fill={`url(#ig-b-${id})`} /><rect x="6.5" y="6.5" width="11" height="11" rx="3" stroke="#fff" strokeWidth="1.5" /><circle cx="12" cy="12" r="2.8" stroke="#fff" strokeWidth="1.5" /><circle cx="16.3" cy="7.7" r="0.8" fill="#fff" /></svg>
                    : <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#fff" }}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                  )}
                  {item.type === "youtube" && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#ff0000" : "#fff" }}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>}
                  {item.type === "twitter" && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#1d9bf0" : "#fff" }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>}
                  {item.type === "tiktok" && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#EE1D52" : "#fff" }}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.58a8.27 8.27 0 0 0 4.84 1.55V6.67a4.85 4.85 0 0 1-1.07.02z" /></svg>}
                  {item.type === "website" && <svg className="w-3.5 h-3.5" fill="none" stroke={footerIconColor === "colored" ? "#8b6834" : "white"} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>}
                </span>
              )}
              <span style={{ color: fontStyles?.footer?.color ?? "#ffffff", fontSize: fontStyles?.footer?.fontSize ?? "12px", fontFamily: fontStyles?.footer?.fontFamily ?? "DM Sans", fontWeight: fontStyles?.footer?.fontWeight ?? "600" }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Ad banner ── */}
      {visibilitySettings?.showAdBanner && adBannerImage && (
        <div className="w-full relative z-10 overflow-hidden" style={{ height: "60px" }}>
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
        <div className="w-full bg-[#e8dcc8] border-2 border-dashed border-[#d4c4b0] flex items-center justify-center relative z-10" style={{ height: "80px" }}>
          <span className="text-[#5d4e37] text-xs font-inter">Ad Banner Area (80px height)</span>
        </div>
      )}
    </div>
  );
}
