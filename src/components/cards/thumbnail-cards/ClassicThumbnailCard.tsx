"use client";

import { getProxiedImageUrl } from "@/utils/imageProxy";
import { BackgroundOptions } from "@/types";
import { ImageIcon } from "lucide-react";

export interface ThumbnailFontStyles {
  headline: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    color: string;
    textAlign: "left" | "center" | "right";
    letterSpacing: string;
    textShadow?: { preset: "none" | "soft" | "hard" | "glow" | "outline"; angle?: number };
    textStroke?: { width: number; color: string };
  };
}

export interface ThumbnailImageSlot {
  src: string | null;
  position: { x: number; y: number };
}

export interface SplitStyle {
  mode: "border" | "blend";
  borderWidth: number;
  borderColor: string;
  blendAmount: number;  // half-width % of the gradient fade at each seam
  blendColor: string;   // midpoint color of the blend gradient
}

export interface ThumbnailCardData {
  title: string;
  images: ThumbnailImageSlot[];
  logo?: string;
}

interface ClassicThumbnailCardProps {
  data: ThumbnailCardData;
  id?: string;
  textBackground?: string;
  fontStyles?: ThumbnailFontStyles;
  pattern?: BackgroundOptions;
  logoBackground?: string;
  showLogoBackground?: boolean;
  splitStyle?: SplitStyle;
}

const DEFAULT_SPLIT: SplitStyle = {
  mode: "border",
  borderWidth: 6,
  borderColor: "#000000",
  blendAmount: 20,
  blendColor: "#ffffff",
};

// ---------- helpers (same as other cards) ----------
function getTextShadow(preset: string, angle = 135, textColor = "#ffffff"): string {
  if (!preset || preset === "none") return "none";
  const rad = (angle * Math.PI) / 180;
  const d = 2;
  const ox = Math.cos(rad) * d;
  const oy = Math.sin(rad) * d;
  const isLight = isLightColor(textColor);
  switch (preset) {
    case "soft":
      return isLight
        ? `${ox}px ${oy}px 8px rgba(0,0,0,0.45)`
        : `${ox}px ${oy}px 8px rgba(255,255,255,0.45)`;
    case "hard":
      return isLight
        ? `${ox * 1.5}px ${oy * 1.5}px 0px rgba(0,0,0,0.85)`
        : `${ox * 1.5}px ${oy * 1.5}px 0px rgba(255,255,255,0.85)`;
    case "glow":
      return isLight
        ? `0 0 16px rgba(0,0,0,0.6), 0 0 32px rgba(0,0,0,0.35)`
        : `0 0 16px rgba(255,255,255,0.8), 0 0 32px rgba(255,255,255,0.5)`;
    case "outline": {
      const col = isLight ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)";
      return `${ox}px ${oy}px 0 ${col}, ${-ox}px ${-oy}px 0 ${col}, ${oy}px ${-ox}px 0 ${col}, ${-oy}px ${ox}px 0 ${col}`;
    }
    default:
      return "none";
  }
}

function getTextStroke(width: number, color: string): string {
  if (!width) return "none";
  const shadows: string[] = [];
  const steps = 8;
  for (let i = 0; i < steps; i++) {
    const a = (i * 2 * Math.PI) / steps;
    shadows.push(`${(Math.cos(a) * width).toFixed(2)}px ${(Math.sin(a) * width).toFixed(2)}px 0 ${color}`);
  }
  return shadows.join(", ");
}

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

function getPatternStyle(pattern?: BackgroundOptions): React.CSSProperties {
  if (!pattern?.pattern || pattern.pattern === "none") return {};
  const opacity = pattern.patternOpacity ?? 0.3;
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
// ---------------------------------------------------

const DEFAULT_FONT: ThumbnailFontStyles["headline"] = {
  fontFamily: "Noto Serif Bengali",
  fontSize: "80px",
  fontWeight: "800",
  color: "#FFFFFF",
  textAlign: "center",
  letterSpacing: "0px",
};

export default function ClassicThumbnailCard({
  data,
  id = "thumbnail-card",
  textBackground = "#690007",
  fontStyles,
  pattern,
  logoBackground = "#ffffff",
  showLogoBackground = true,
  splitStyle,
}: ClassicThumbnailCardProps) {
  const sp = { ...DEFAULT_SPLIT, ...splitStyle };
  const font = fontStyles?.headline ?? DEFAULT_FONT;

  // Combine text shadow + stroke
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
      style={{ width: 1920, height: 1080, position: "relative", overflow: "hidden", flexShrink: 0 }}
    >
      {/* ── Top 2/3 – Image area ─────────────────────────────── */}
      <div style={{ width: "100%", height: 720, position: "relative", background: "#111", display: "flex" }}>
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
                  gap: 24,
                }}
              >
                <ImageIcon style={{ width: data.images.length === 1 ? 120 : 80, height: data.images.length === 1 ? 120 : 80, color: "#c0bdb8", opacity: 0.8 }} strokeWidth={1} />
                {data.images.length === 1 && (
                  <span style={{ color: "#b0aca6", fontSize: 36, fontFamily: "sans-serif", fontWeight: 400, letterSpacing: 2 }}>
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

        {/* Logo – top-right of image section */}
        {data.logo ? (
          <div
            style={{
              position: "absolute",
              top: 48,
              right: 64,
              zIndex: 2,
              background: showLogoBackground ? (logoBackground ?? "#ffffff") : "transparent",
              borderRadius: showLogoBackground ? 16 : 0,
              padding: showLogoBackground ? "16px 28px" : 0,
              boxShadow: showLogoBackground ? "0 4px 24px rgba(0,0,0,0.18)" : "none",
            }}
          >
            <img
              src={getProxiedImageUrl(data.logo)}
              alt="Logo"
              style={{ maxHeight: 80, maxWidth: 260, objectFit: "contain", display: "block" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        ) : (
          /* Logo placeholder badge */
          <div
            style={{
              position: "absolute",
              top: 48,
              right: 64,
              zIndex: 2,
              background: "rgba(255,255,255,0.85)",
              borderRadius: 14,
              padding: "14px 28px",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <ImageIcon style={{ width: 44, height: 44, color: "#bbb8b2" }} strokeWidth={1} />
            <span style={{ color: "#bbb8b2", fontSize: 28, fontFamily: "sans-serif", fontWeight: 500 }}>Logo</span>
          </div>
        )}
      </div>

      {/* ── Bottom 1/3 – Text area ───────────────────────────── */}
      <div
        style={{
          width: "100%",
          height: 360,
          position: "relative",
          background: textBackground,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 100px",
          boxSizing: "border-box",
        }}
      >
        {/* Pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            ...getPatternStyle(pattern),
          }}
        />

        {/* Title */}
        <h1
          style={{
            position: "relative",
            zIndex: 1,
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
