"use client";

import { getProxiedImageUrl } from "@/utils/imageProxy";
import { BackgroundOptions } from "@/types";
import { ImageIcon } from "lucide-react";
import { ThumbnailFontStyles, ThumbnailImageSlot, SplitStyle } from "./ClassicThumbnailCard";

interface FramedThumbnailCardProps {
  data: {
    title: string;
    images: ThumbnailImageSlot[];
    logo?: string;
  };
  id?: string;
  textBackground?: string;
  fontStyles?: ThumbnailFontStyles;
  pattern?: BackgroundOptions;
  logoBackground?: string;
  showLogoBackground?: boolean;
  splitStyle?: SplitStyle;
}

// ── helpers ──────────────────────────────────────────────
function isLightColor(color: string): boolean {
  let r = 0, g = 0, b = 0;
  if (color.startsWith("#")) {
    const h = color.replace("#", "");
    r = parseInt(h.substr(0, 2), 16);
    g = parseInt(h.substr(2, 2), 16);
    b = parseInt(h.substr(4, 2), 16);
  } else if (color.startsWith("rgb")) {
    const m = color.match(/\d+/g);
    if (m) { r = +m[0]; g = +m[1]; b = +m[2]; }
  }
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

function getTextShadow(preset: string, angle = 135, textColor = "#ffffff"): string {
  if (!preset || preset === "none") return "none";
  const rad = (angle * Math.PI) / 180;
  const d = 2;
  const ox = Math.cos(rad) * d;
  const oy = Math.sin(rad) * d;
  const isLight = isLightColor(textColor);
  switch (preset) {
    case "soft": return isLight ? `${ox}px ${oy}px 8px rgba(0,0,0,0.45)` : `${ox}px ${oy}px 8px rgba(255,255,255,0.45)`;
    case "hard": return isLight ? `${ox * 1.5}px ${oy * 1.5}px 0px rgba(0,0,0,0.85)` : `${ox * 1.5}px ${oy * 1.5}px 0px rgba(255,255,255,0.85)`;
    case "glow": return isLight ? `0 0 16px rgba(0,0,0,0.6), 0 0 32px rgba(0,0,0,0.35)` : `0 0 16px rgba(255,255,255,0.8), 0 0 32px rgba(255,255,255,0.5)`;
    case "outline": {
      const col = isLight ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)";
      return `${ox}px ${oy}px 0 ${col}, ${-ox}px ${-oy}px 0 ${col}, ${oy}px ${-ox}px 0 ${col}, ${-oy}px ${ox}px 0 ${col}`;
    }
    default: return "none";
  }
}

function getTextStroke(width: number, color: string): string {
  if (!width) return "none";
  const shadows: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * 2 * Math.PI) / 8;
    shadows.push(`${(Math.cos(a) * width).toFixed(2)}px ${(Math.sin(a) * width).toFixed(2)}px 0 ${color}`);
  }
  return shadows.join(", ");
}

function getPatternStyle(pattern?: BackgroundOptions): React.CSSProperties {
  if (!pattern?.pattern || pattern.pattern === "none") return {};
  const opacity = pattern.patternOpacity ?? 0.1;
  const base: React.CSSProperties = {
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    opacity,
  };
  if (pattern.pattern === "p1") return { ...base, backgroundImage: "url(/patterns/p1.png)" };
  if (pattern.pattern === "p2") return { ...base, backgroundImage: "url(/patterns/p2.png)" };
  if (pattern.pattern === "p-duo") return { ...base, backgroundImage: "url(/patterns/p-duo.png)" };
  if (pattern.pattern === "custom" && pattern.patternImage)
    return { ...base, backgroundImage: `url(${pattern.patternImage})` };
  return {};
}

const DEFAULT_FONT: ThumbnailFontStyles["headline"] = {
  fontFamily: "Noto Serif Bengali",
  fontSize: "108px",
  fontWeight: "800",
  color: "#FFFFFF",
  textAlign: "center",
  letterSpacing: "0px",
};

// ── Layout constants ──────────────────────────────────────
const CARD_W = 1920;
const CARD_H = 1080;
const GAP_TOP = 16;       // gap above the image frame
const GAP_SIDE = 16;      // gap on left & right of image frame
const IMG_H = 710;        // height of the framed image
const IMG_W = CARD_W - GAP_SIDE * 2;  // 1888
const TEXT_H = CARD_H - GAP_TOP - IMG_H; // remaining: 354
const SHINE_H = 56;       // height of shine SVG

const DEFAULT_SPLIT: SplitStyle = {
  mode: "border",
  borderWidth: 6,
  borderColor: "#000000",
  blendAmount: 20,
  blendColor: "#ffffff",
};

export default function FramedThumbnailCard({
  data,
  id = "thumbnail-card",
  textBackground = "#690007",
  fontStyles,
  pattern,
  logoBackground = "#ffffff",
  showLogoBackground = true,
  splitStyle,
}: FramedThumbnailCardProps) {
  const sp = { ...DEFAULT_SPLIT, ...splitStyle };
  const font = fontStyles?.headline ?? DEFAULT_FONT;

  const textShadow = (() => {
    const shadow = getTextShadow(font.textShadow?.preset ?? "none", font.textShadow?.angle ?? 135, font.color);
    const stroke = getTextStroke(font.textStroke?.width ?? 0, font.textStroke?.color ?? "#000000");
    if (shadow !== "none" && stroke !== "none") return `${stroke}, ${shadow}`;
    if (stroke !== "none") return stroke;
    return shadow;
  })();

  return (
    <div
      id={id}
      style={{
        width: CARD_W,
        height: CARD_H,
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        background: textBackground,
      }}
    >
      {/* Pattern overlay – only on the bottom text section */}
      <div
        style={{
          position: "absolute",
          top: GAP_TOP + IMG_H,
          left: 0,
          width: CARD_W,
          height: TEXT_H,
          pointerEvents: "none",
          zIndex: 0,
          ...getPatternStyle(pattern),
        }}
      />

      {/* ── Framed image ─────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: GAP_TOP,
          left: GAP_SIDE,
          width: IMG_W,
          height: IMG_H,
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", width: "100%", height: "100%", position: "relative" }}>
          {data.images.map((img, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                position: "relative",
                overflow: "hidden",
                borderRight:
                  idx < data.images.length - 1
                    ? sp.mode === "border"
                      ? `${sp.borderWidth}px solid ${sp.borderColor}`
                      : "none"
                    : "none",
              }}
            >
              {img.src ? (
                <img
                  src={getProxiedImageUrl(img.src)}
                  alt={`Image ${idx + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: `${img.position.x}% ${img.position.y}%`,
                    display: "block",
                  }}
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-image.jpg"; }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#ffffff",
                    gap: 20,
                  }}
                >
                  <ImageIcon style={{ width: data.images.length === 1 ? 100 : 60, height: data.images.length === 1 ? 100 : 60, color: "#c8c4be" }} strokeWidth={1} />
                  {data.images.length === 1 && (
                    <span style={{ color: "#b8b4ae", fontSize: 32, fontFamily: "sans-serif", fontWeight: 400, letterSpacing: 2 }}>
                      Upload your image here
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Blend mode seam gradients */}
          {sp.mode === "blend" && data.images.length > 1 &&
            Array.from({ length: data.images.length - 1 }, (_, i) => {
              const seamPct = ((i + 1) / data.images.length) * 100;
              const halfW = sp.blendAmount;
              return (
                <div
                  key={`seam-${i}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    height: "100%",
                    width: `${halfW * 2}%`,
                    left: `calc(${seamPct}% - ${halfW}%)`,
                    background: `linear-gradient(to right, transparent 0%, ${sp.blendColor} 50%, transparent 100%)`,
                    zIndex: 3,
                    pointerEvents: "none",
                  }}
                />
              );
            })
          }
        </div>

      </div>

      {/* Shine ellipse – fully below the image bottom edge */}
      <div
        style={{
          position: "absolute",
          top: GAP_TOP + IMG_H + 20,
          left: GAP_SIDE,
          width: IMG_W,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 4,
        }}
      >
        <svg
          width={IMG_W}
          height={SHINE_H}
          viewBox={`0 0 ${IMG_W} ${SHINE_H}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
        >
          <defs>
            <radialGradient id="shine-grad" cx="50%" cy="50%" rx="50%" ry="50%">
              <stop offset="0%"  stopColor="rgba(255,255,255,0.9)" />
              <stop offset="60%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>
          <ellipse
            cx={IMG_W / 2}
            cy="4"
            rx={IMG_W * 0.42}
            ry="3.5"
            fill="url(#shine-grad)"
          />
        </svg>
      </div>

      {/* ── Logo – top-right, flush with image top edge ─── */}
      {data.logo ? (
        <div
          style={{
            position: "absolute",
            top: GAP_TOP,
            right: GAP_SIDE + 60,
            zIndex: 3,
            background: showLogoBackground ? (logoBackground ?? textBackground) : "transparent",
            padding: showLogoBackground ? "14px 24px" : 0,
            boxShadow: showLogoBackground ? "0 4px 20px rgba(0,0,0,0.22)" : "none",
            borderRadius: "0 0 12px 12px",
          }}
        >
          <img
            src={getProxiedImageUrl(data.logo)}
            alt="Logo"
            style={{ maxHeight: 72, maxWidth: 240, objectFit: "contain", display: "block" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      ) : (
        /* Logo placeholder flush with image top */
        <div
          style={{
            position: "absolute",
            top: GAP_TOP,
            right: GAP_SIDE + 60,
            zIndex: 3,
            background: textBackground,
            padding: "14px 28px",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderRadius: "0 0 12px 12px",
          }}
        >
          <ImageIcon style={{ width: 38, height: 38, color: "#bbb8b2" }} strokeWidth={1} />
          <span style={{ color: "#bbb8b2", fontSize: 26, fontFamily: "sans-serif", fontWeight: 500 }}>Logo</span>
        </div>
      )}

      {/* ── Text area – sits below framed image ─────────── */}
      <div
        style={{
          position: "absolute",
          top: GAP_TOP + IMG_H,
          left: 0,
          width: CARD_W,
          height: TEXT_H,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 100px",
          boxSizing: "border-box",
          zIndex: 2,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: font.fontFamily,
            fontSize: font.fontSize,
            fontWeight: font.fontWeight,
            color: font.color,
            textAlign: "center",
            letterSpacing: font.letterSpacing,
            lineHeight: 1.25,
            textShadow: textShadow !== "none" ? textShadow : undefined,
            width: "100%",
          }}
        >
          {data.title || "এখানে আপনার শিরোনাম লিখুন"}
        </h1>
      </div>
    </div>
  );
}
