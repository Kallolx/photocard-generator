"use client";

import { useEffect, useRef } from "react";
import { IslamicCardVisibilitySettings, IslamicCardFontStyles, FooterItem } from "@/types";
import { getProxiedImageUrl } from "@/utils/imageProxy";
import { Image as ImageIcon } from "lucide-react";

// ─── Props ────────────────────────────────────────────────────────────────────
interface SplitIslamicCardProps {
  logo?: string;
  narrator?: string;
  hadisText?: string;
  source?: string;
  id?: string;
  fullSize?: boolean;
  fontStyles?: IslamicCardFontStyles;
  visibilitySettings?: IslamicCardVisibilitySettings;
  footerItems?: FooterItem[];
  footerOpacity?: number;
  footerIconColor?: "white" | "colored";
  isLogoFavicon?: boolean;
  isGenerating?: boolean;
}

// ─── Default font styles ──────────────────────────────────────────────────────
const DEFAULT_FONTS: IslamicCardFontStyles = {
  narrator: {
    fontFamily: "Noto Serif Bengali",
    fontSize: "13px",
    fontWeight: "600",
    color: "#c9a84c",
    textAlign: "left",
    letterSpacing: "0.03em",
  },
  hadisText: {
    fontFamily: "Noto Serif Bengali",
    fontSize: "16px",
    fontWeight: "700",
    color: "#f0ebe0",
    textAlign: "left",
    letterSpacing: "0px",
  },
  source: {
    fontFamily: "Noto Serif Bengali",
    fontSize: "12px",
    fontWeight: "500",
    color: "#c9a84c",
    textAlign: "left",
    letterSpacing: "0.04em",
  },
  footer: {
    fontFamily: "Noto Serif Bengali",
    fontSize: "12px",
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: "0px",
  },
};

const GOLD = "#c9a84c";
const HIGHLIGHT = "#eb8924";

// Wrap words in *asterisks* to colour them orange. E.g. "অতি *গুরুত্বপূর্ণ* হাদিস"
function parseHadis(text: string): React.ReactNode[] {
  return text.split(/([*][^*]+[*])/g).map((part, i) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <span key={i} style={{ color: HIGHLIGHT }}>
          {part.slice(1, -1)}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SplitIslamicCard({
  logo = "",
  narrator = "রাসুলুল্লাহ ﷺ বলেছেন:",
  hadisText = "",
  source = "",
  id = "photocard",
  fullSize = false,
  fontStyles,
  visibilitySettings = {
    showLogo: true,
    showNarrator: true,
    showSource: true,
    showFooter: false,
  },
  footerItems = [],
  footerOpacity = 100,
  footerIconColor = "white",
  isLogoFavicon = false,
}: SplitIslamicCardProps) {
  const fs = fontStyles ?? DEFAULT_FONTS;
  const vis = visibilitySettings;

  const displayHadis =
    hadisText || "এখানে হাদিসের মূল পাঠ্য লিখুন। আপনার পছন্দের হাদিস এখানে যোগ করুন।";
  const displayNarrator = narrator || "রাসুলুল্লাহ ﷺ বলেছেন:";
  const displaySource = source || "সহীহ বুখারী";

  const contentRef = useRef<HTMLDivElement>(null);
  const hadisRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const contentEl = contentRef.current;
    const hadisEl = hadisRef.current;
    if (!contentEl || !hadisEl) return;
    const baseFontSize = parseInt(fs.hadisText.fontSize);
    hadisEl.style.fontSize = `${baseFontSize}px`;
    let size = baseFontSize;
    while (contentEl.scrollHeight > contentEl.clientHeight && size > 10) {
      size -= 0.5;
      hadisEl.style.fontSize = `${size}px`;
    }
  }, [displayHadis, fs.hadisText.fontSize, vis.showLogo, vis.showNarrator, vis.showSource, vis.showFooter]);

  return (
    <div
      id={id}
      className={fullSize ? "w-[448px] max-w-[448px] mx-auto shadow-2xl" : "w-full min-w-[448px] max-w-[448px] mx-auto shadow-2xl"}
      style={{
        backgroundImage: "url('/islamic/2.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "Noto Serif Bengali, sans-serif",
        position: "relative",
        overflow: "hidden",
        height: "448px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Gradient overlay — solid dark on left, fades to transparent at ~55% */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.88) 30%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.10) 62%, transparent 70%)",
          zIndex: 0,
        }}
      />

      {/* Text content — left half */}
      <div
        ref={contentRef}
        style={{
          flex: 1,
          position: "relative",
          zIndex: 1,
          width: "58%",
          padding: "28px 12px 14px 24px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        {vis.showLogo && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px" }}>
            {logo ? (
              <div
                style={{
                  backgroundColor: "rgba(0,0,0,0.35)",
                  border: `1px solid ${GOLD}66`,
                  borderRadius: isLogoFavicon ? "50%" : "6px",
                  padding: "6px 14px",
                  display: "inline-flex",
                  alignItems: "center",
                  backdropFilter: "blur(4px)",
                }}
              >
                <img
                  src={getProxiedImageUrl(logo)}
                  alt="Logo"
                  style={{ maxHeight: "30px", maxWidth: "100px", objectFit: "contain", display: "block" }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: "rgba(0,0,0,0.3)",
                  border: `1px solid ${GOLD}50`,
                  borderRadius: "6px",
                  padding: "6px 14px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backdropFilter: "blur(4px)",
                }}
              >
                <ImageIcon size={14} color={GOLD} />
                <span style={{ color: GOLD, fontSize: "11px", fontWeight: 600, fontFamily: "DM Sans, sans-serif", letterSpacing: "0.06em" }}>LOGO</span>
              </div>
            )}
          </div>
        )}

        {/* Spacer — small top gap, pushes block toward upper area */}
        <div style={{ flex: 0.40 }} />

        {/* Narrator — gradient box, width */}
        {vis.showNarrator && (
          <div
            style={{
              alignSelf: "stretch",
              marginLeft: "-24px",
              marginRight: "32px",
              marginBottom: "12px",
              background: "linear-gradient(to right, #eb8924 0%, #d4721a 40%, #1a0800 75%, #000000 100%)",
              padding: "4px 16px 2px 30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p
              style={{
                fontFamily: fs.narrator.fontFamily,
                fontSize: fs.narrator.fontSize,
                fontWeight: fs.narrator.fontWeight,
                color: "#ffffff",
                letterSpacing: fs.narrator.letterSpacing,
                margin: "0",
                lineHeight: 1.6,
                textAlign: "center",
                width: "100%",
              }}
            >
              {displayNarrator}
            </p>
          </div>
        )}

        {/* Hadis text — center aligned, *word* = orange highlight */}
        <p
          ref={hadisRef}
          style={{
            fontFamily: fs.hadisText.fontFamily,
            fontSize: fs.hadisText.fontSize,
            fontWeight: fs.hadisText.fontWeight,
            color: fs.hadisText.color,
            textAlign: "center",
            letterSpacing: fs.hadisText.letterSpacing,
            margin: "0 0 10px 0",
            lineHeight: 1.5,
            width: "100%",
          }}
        >
          {parseHadis(displayHadis)}
        </p>

        {/* Source — orange pill, directly under hadis */}
        {vis.showSource && (
          <p
            style={{
              fontFamily: fs.source.fontFamily,
              fontSize: "13px",
              fontWeight: "700",
              color: "#ffffff",
              textAlign: "center",
              letterSpacing: fs.source.letterSpacing,
              margin: "0",
              lineHeight: 1.4,
              backgroundColor: "#eb8924",
              padding: "3px 14px",
              borderRadius: "3px",
              display: "inline-block",
              alignSelf: "center",
            }}
          >
            {displaySource}
          </p>
        )}

        {/* Spacer — absorbs remaining space below */}
        <div style={{ flex: 1 }} />
      </div>

      {/* Social footer — absolutely positioned so it never pushes content up */}
      {vis.showFooter && footerItems.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            backgroundColor: "rgba(0,0,0,0.55)",
            borderTop: `1px solid ${GOLD}40`,
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-evenly",
            opacity: footerOpacity / 100,
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {footerItems.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              {item.type !== "text" && (
                <span style={{ flexShrink: 0, display: "flex" }}>
                  {item.type === "facebook" && (
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#1877f2" : "#fff" }}>
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                  {item.type === "instagram" && (
                    footerIconColor === "colored" ? (
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                        <defs><radialGradient id={`ig-sp-${id}`} cx="30%" cy="107%" r="1.5"><stop offset="0%" stopColor="#ffd676" /><stop offset="10%" stopColor="#f9a12e" /><stop offset="50%" stopColor="#e1306c" /><stop offset="90%" stopColor="#833ab4" /></radialGradient></defs>
                        <rect width="24" height="24" rx="6" fill={`url(#ig-sp-${id})`} />
                        <rect x="6.5" y="6.5" width="11" height="11" rx="3" stroke="#fff" strokeWidth="1.5" />
                        <circle cx="12" cy="12" r="2.8" stroke="#fff" strokeWidth="1.5" />
                        <circle cx="16.3" cy="7.7" r="0.8" fill="#fff" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#fff" }}>
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                      </svg>
                    )
                  )}
                  {item.type === "youtube" && (
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#ff0000" : "#fff" }}>
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  )}
                  {item.type === "twitter" && (
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#1d9bf0" : "#fff" }}>
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  )}
                  {item.type === "tiktok" && (
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#EE1D52" : "#fff" }}>
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.58a8.27 8.27 0 0 0 4.84 1.55V6.67a4.85 4.85 0 0 1-1.07.02z" />
                    </svg>
                  )}
                  {item.type === "website" && (
                    <svg width="14" height="14" fill="none" stroke={footerIconColor === "colored" ? GOLD : "white"} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  )}
                </span>
              )}
              <span
                style={{
                  color: fs.footer.color,
                  fontSize: fs.footer.fontSize,
                  fontFamily: fs.footer.fontFamily,
                  fontWeight: fs.footer.fontWeight,
                  letterSpacing: fs.footer.letterSpacing,
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
