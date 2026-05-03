"use client";

import {
  PhotocardData,
  BackgroundOptions,
  CardFontStyles,
  VisibilitySettings,
  FooterItem,
  WatermarkSettings,
  BaseUrlCardProps,
} from "@/types";
import { darkenHexColor } from "@/lib/utils";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { getProxiedImageUrl } from "@/utils/imageProxy";

export default function ClassicUrlCard({
  data,
  isGenerating,
  background,
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
  },
  isLogoFavicon = false,
  elementLayout = {
    topLeft: "logo",
    topRight: "dateWeek",
    bottomLeft: "qrCode",
    bottomRight: "cta",
  },
}: BaseUrlCardProps) {
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

  const getCardDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const lang = fontStyles?.weekDateLanguage === "english" ? "en-US" : "bn-BD";
    return now.toLocaleDateString(lang, options);
  };

  const getWeekday = () => {
    if (fontStyles?.weekDateLanguage === "english") {
      return new Date().toLocaleDateString("en-US", { weekday: "long" });
    }
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
    if (!background) return { backgroundColor: "#8b6834" };

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

  const getSiteDomain = () => {
    try {
      const url = new URL(data.url);
      return url.hostname.toLowerCase().replace("www.", "");
    } catch {
      return data.siteName?.toLowerCase() || "example.com";
    }
  };

  const getPatternStyle = () => {
    if (!background?.pattern || background.pattern === "none") return {};

    const opacity = background.patternOpacity || 0.3;

    switch (background.pattern) {
      case "p1":
        return {
          backgroundImage: "url(/patterns/p1.png)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          opacity,
        };
      case "p2":
        return {
          backgroundImage: "url(/patterns/p2.png)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          opacity,
        };
      case "custom":
        if (background.patternImage) {
          return {
            backgroundImage: `url(${background.patternImage})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            opacity,
          };
        }
        return {};
      default:
        return {};
    }
  };

  const isLightColor = (color: string): boolean => {
    let r = 0, g = 0, b = 0;
    if (color.startsWith("#")) {
      const hex = color.replace("#", "");
      r = parseInt(hex.substr(0, 2), 16);
      g = parseInt(hex.substr(2, 2), 16);
      b = parseInt(hex.substr(4, 2), 16);
    } else if (color.startsWith("rgb")) {
      const match = color.match(/\d+/g);
      if (match) {
        r = parseInt(match[0]);
        g = parseInt(match[1]);
        b = parseInt(match[2]);
      }
    }
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  const getTextShadow = (preset: string, angle: number = 135, textColor: string = "#ffffff"): string => {
    if (preset === "none" || !preset) return "none";
    const angleRad = (angle * Math.PI) / 180;
    const distance = 2;
    const offsetX = Math.cos(angleRad) * distance;
    const offsetY = Math.sin(angleRad) * distance;
    const isLight = isLightColor(textColor);

    switch (preset) {
      case "soft":
        return isLight ? `${offsetX}px ${offsetY}px 4px rgba(0, 0, 0, 0.4)` : `${offsetX}px ${offsetY}px 4px rgba(255, 255, 255, 0.4)`;
      case "hard":
        return isLight ? `${offsetX * 1.5}px ${offsetY * 1.5}px 0px rgba(0, 0, 0, 0.8)` : `${offsetX * 1.5}px ${offsetY * 1.5}px 0px rgba(255, 255, 255, 0.8)`;
      case "glow":
        return isLight ? `0px 0px 8px rgba(0, 0, 0, 0.6), 0px 0px 16px rgba(0, 0, 0, 0.4)` : `0px 0px 8px rgba(255, 255, 255, 0.8), 0px 0px 16px rgba(255, 255, 255, 0.5)`;
      case "outline":
        return isLight ? `${offsetX}px ${offsetY}px 0px rgba(0, 0, 0, 0.9), ${-offsetX}px ${-offsetY}px 0px rgba(0, 0, 0, 0.9), ${offsetY}px ${-offsetX}px 0px rgba(0, 0, 0, 0.9), ${-offsetY}px ${offsetX}px 0px rgba(0, 0, 0, 0.9)` : `${offsetX}px ${offsetY}px 0px rgba(255, 255, 255, 0.9), ${-offsetX}px ${-offsetY}px 0px rgba(255, 255, 255, 0.9), ${offsetY}px ${-offsetX}px 0px rgba(255, 255, 255, 0.9), ${-offsetY}px ${offsetX}px 0px rgba(255, 255, 255, 0.9)`;
      default: return "none";
    }
  };

  const getTextStroke = (width: number, color: string): string => {
    if (!width || width === 0) return "none";
    const shadows: string[] = [];
    const steps = 8;
    for (let i = 0; i < steps; i++) {
      const angle = (i * 2 * Math.PI) / steps;
      const offsetX = Math.cos(angle) * width;
      const offsetY = Math.sin(angle) * width;
      shadows.push(`${offsetX.toFixed(2)}px ${offsetY.toFixed(2)}px 0px ${color}`);
    }
    return shadows.join(", ");
  };

  const siteNameOnLeft = elementLayout.bottomLeft === "qrCode" && !visibilitySettings.showQrCode && !!(data.siteName || data.url);

  const renderElement = (elementType: "logo" | "dateWeek" | "qrCode" | "cta") => {
    switch (elementType) {
      case "logo":
        if (!visibilitySettings.showLogo) return null;
        return (
          <div className="flex items-center">
            <div className={`bg-white border border-gray-200 p-2 min-w-[60px] min-h-[30px] flex items-center justify-center ${isLogoFavicon ? "rounded-full" : "rounded-lg"}`}>
              {data.logo ? (
                <img src={getProxiedImageUrl(data.logo)} alt="Site logo" className="object-contain w-auto h-auto max-w-[100px] max-h-8" />
              ) : (
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
          </div>
        );
      case "dateWeek":
        if (!visibilitySettings.showWeek && !visibilitySettings.showDate) return null;
        return (
          <div className="text-white tracking-wide text-center" style={{
            fontFamily: fontStyles?.week?.fontFamily || "Noto Serif Bengali",
            fontSize: fontStyles?.week?.fontSize || "18px",
            fontWeight: fontStyles?.week?.fontWeight || "500",
            color: fontStyles?.week?.color || "#FFFFFF",
          }}>
            {visibilitySettings.showWeek && getWeekday()}
            {visibilitySettings.showWeek && visibilitySettings.showDate && " | "}
            {visibilitySettings.showDate && getCardDate()}
          </div>
        );
      case "qrCode":
        if (!visibilitySettings.showQrCode || !qrCodeUrl) return null;
        return (
          <div className="bg-white p-1 rounded-sm flex-shrink-0">
            <img src={qrCodeUrl} alt="QR Code" className="w-12 h-12" />
          </div>
        );
      case "cta":
        return (
          <div className="flex flex-col items-end gap-1">
            {!siteNameOnLeft && (data.siteName || data.url) && (
              <p className="text-white/90 text-[9px] font-medium tracking-wide">{getSiteDomain()}</p>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
              <p className="font-noto-bengali text-xs font-bold text-white">বিস্তারিত কমেন্টের লিংকে</p>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div id={id} className={fullSize ? "w-[448px] max-w-[448px] mx-auto overflow-hidden shadow-xl relative" : "w-full max-w-md mx-auto overflow-hidden shadow-xl relative"} style={getBackgroundStyle()}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0" style={getPatternStyle()} />
        {watermark?.text && watermark?.enabled !== false && (
          <div style={{
            position: "absolute",
            bottom: watermark.y ?? 0,
            left: `calc(50% + ${watermark.x ?? 0}px)`,
            transform: `translateX(-50%) rotate(${watermark.rotation ?? 0}deg)`,
            opacity: watermark.opacity ?? 0.3,
            zIndex: 0,
            pointerEvents: "none",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}>
            <span style={{
              fontFamily: /[\u0980-\u09FF]/.test(watermark.text) ? "Noto Serif Bengali" : "DM Sans",
              fontWeight: 800,
              letterSpacing: "-0.05em",
              fontSize: `${watermark.fontSize ?? 48}px`,
              textTransform: "uppercase",
              color: "#ffffff",
            }}>{watermark.text}</span>
          </div>
        )}

        <div className="px-6 pt-5 pb-2 relative z-10">
          <div className="flex justify-between items-center mb-3">
            {renderElement(elementLayout.topLeft)}
            {renderElement(elementLayout.topRight)}
          </div>

          <div className="bg-white rounded-tl-[70px] rounded-tr-lg rounded-bl-lg rounded-br-[70px] overflow-hidden mb-4 aspect-video" style={{ border: `${frameBorderThickness}px solid ${frameBorderColor}` }}>
            {data.image ? (
              <img src={getProxiedImageUrl(data.image)} alt="Article image" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-image.jpg"; }} />
            ) : (
              <div className="w-full h-full bg-white flex flex-col items-center justify-center gap-2">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-400 text-sm font-inter">No Image</span>
              </div>
            )}
          </div>

          {visibilitySettings.showTitle && (
            <h2 className={`text-white text-center leading-tight px-2 py-0.5 mb-2`} style={{
              fontFamily: fontStyles?.headline?.fontFamily || "Noto Serif Bengali",
              fontSize: fontStyles?.headline?.fontSize || "24px",
              fontWeight: fontStyles?.headline?.fontWeight || "700",
              color: fontStyles?.headline?.color || "#FFFFFF",
              textAlign: fontStyles?.headline?.textAlign || "center",
              letterSpacing: fontStyles?.headline?.letterSpacing || "0px",
              textShadow: (() => {
                const textColor = fontStyles?.headline?.color || "#FFFFFF";
                const shadow = getTextShadow(fontStyles?.headline?.textShadow?.preset || "none", fontStyles?.headline?.textShadow?.angle || 135, textColor);
                const stroke = getTextStroke(fontStyles?.headline?.textStroke?.width || 0, fontStyles?.headline?.textStroke?.color || "#000000");
                return shadow !== "none" && stroke !== "none" ? `${stroke}, ${shadow}` : stroke !== "none" ? stroke : shadow;
              })(),
            } as React.CSSProperties}>{data.title}</h2>
          )}

          <div className="flex items-center justify-between gap-4">
            {siteNameOnLeft ? (
              <div className="flex items-center gap-1 text-white/90">
                <p className="font-dm-sans text-[9px] font-medium tracking-wide">{getSiteDomain()}</p>
              </div>
            ) : (
              renderElement(elementLayout.bottomLeft)
            )}
            <div className="ml-auto">{renderElement(elementLayout.bottomRight)}</div>
          </div>
        </div>
      </div>

      {visibilitySettings?.showFooter !== false && footerItems && footerItems.length > 0 && (
        <div className="w-full px-4 py-2 flex items-center justify-evenly" style={{
          background: darkenHexColor((background?.type === "gradient" ? background?.gradientFrom : undefined) || background?.color || "#1a1410"),
          opacity: (footerOpacity || 100) / 100,
        }}>
          {footerItems.map((item) => (
            <div key={item.id} className="flex items-center gap-1.5">
              {item.type !== "text" && (
                <span className="shrink-0">
                  {item.type === "facebook" && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#1877f2" : "#fff" }}>
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                  {item.type === "instagram" && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#fff" }}>
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  )}
                  {item.type === "youtube" && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#ff0000" : "#fff" }}>
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  )}
                  {item.type === "twitter" && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#1d9bf0" : "#fff" }}>
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  )}
                  {item.type === "tiktok" && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#EE1D52" : "#fff" }}>
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.58a8.27 8.27 0 0 0 4.84 1.55V6.67a4.85 4.85 0 0 1-1.07.02z" />
                    </svg>
                  )}
                  {item.type === "website" && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke={footerIconColor === "colored" ? "#8b6834" : "white"} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  )}
                </span>
              )}
              <span style={{
                color: fontStyles?.footer?.color || "#ffffff",
                fontSize: fontStyles?.footer?.fontSize || "12px",
                fontFamily: fontStyles?.footer?.fontFamily || "DM Sans",
                fontWeight: fontStyles?.footer?.fontWeight || "600",
              }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {visibilitySettings?.showAdBanner && adBannerImage && (
        <div className="w-full relative z-10 overflow-hidden" style={{ height: "40px" }}>
          <img src={adBannerImage} alt="Advertisement" className="absolute top-1/2 left-1/2 pointer-events-none" style={{ transform: `translate(-50%, -50%) translate(${adBannerPosition.x}px, ${adBannerPosition.y}px) scale(${adBannerZoom / 100})`, transformOrigin: "center center", maxWidth: "none", maxHeight: "none", width: "auto", height: "auto", minWidth: "100%", minHeight: "100%" }} />
        </div>
      )}
      {visibilitySettings?.showAdBanner && !adBannerImage && !isGenerating && (
        <div className="w-full bg-[#e8dcc8] border-2 border-dashed border-[#d4c4b0] flex items-center justify-center relative z-10" style={{ height: "40px" }}>
          <span className="text-[#5d4e37] text-xs font-inter">Ad Banner Area (40px height)</span>
        </div>
      )}
    </div>
  );
}
