"use client";

import { useRef, useEffect } from "react";
import {
  PhotocardData,
  BackgroundOptions,
  CardFontStyles,
  VisibilitySettings,
} from "@/types";
import { getProxiedImageUrl } from "@/utils/imageProxy";

interface ClassicCommentCardProps {
  data: PhotocardData;
  background?: BackgroundOptions;
  id?: string;
  fullSize?: boolean;
  fontStyles?: CardFontStyles;
  visibilitySettings?: Partial<VisibilitySettings>;
  onLogoUpload?: (file: File) => void;
  imagePosition?: { x: number; y: number; scale: number };
}

function darkenColor(color: string, percent: number = 20): string {
  if (color.startsWith("#")) {
    const num = parseInt(color.replace("#", ""), 16);
    const r = Math.max(0, Math.floor((num >> 16) * (1 - percent / 100)));
    const g = Math.max(0, Math.floor(((num >> 8) & 0x00ff) * (1 - percent / 100)));
    const b = Math.max(0, Math.floor((num & 0x0000ff) * (1 - percent / 100)));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  }
  return color;
}

export default function ClassicCommentCard({
  data,
  background,
  id = "photocard",
  fullSize = false,
  fontStyles,
  visibilitySettings,
  imagePosition,
}: ClassicCommentCardProps) {

  const getBackgroundStyle = (): React.CSSProperties => {
    if (!background) return { backgroundColor: "#dc2626" };
    if (background.type === "gradient" && background.gradientFrom && background.gradientTo) {
      return { backgroundImage: `linear-gradient(135deg, ${background.gradientFrom}, ${background.gradientTo})` };
    }
    return { backgroundColor: background.color || "#dc2626" };
  };

  const getPatternStyle = (): React.CSSProperties => {
    if (!background?.pattern || background.pattern === "none") return {};
    const opacity = background.patternOpacity ?? 0.3;
    switch (background.pattern) {
      case "p1":
        return { backgroundImage: "url(/patterns/p1.png)", backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center", opacity };
      case "p2":
        return { backgroundImage: "url(/patterns/p2.png)", backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center", opacity };
      case "custom":
        if (background.patternImage) {
          return { backgroundImage: `url(${background.patternImage})`, backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center", opacity };
        }
        return {};
      default:
        return {};
    }
  };

  const bubbleFill = "#ffffff";

  const commentFontSize = fontStyles?.commentText?.fontSize || "22px";
  const commentFontWeight = fontStyles?.commentText?.fontWeight || "600";
  const commentColor = fontStyles?.commentText?.color || "#1a1a1a";
  const commentFontFamily = fontStyles?.commentText?.fontFamily || "Noto Serif Bengali";
  const commentTextAlign = (fontStyles?.commentText?.textAlign || "center") as React.CSSProperties["textAlign"];

  const nameFontSize = fontStyles?.personName?.fontSize || "18px";
  const nameFontWeight = fontStyles?.personName?.fontWeight || "700";
  const nameColor = fontStyles?.personName?.color || "#ffffff";
  const nameFontFamily = fontStyles?.personName?.fontFamily || "Noto Serif Bengali";

  const commentContainerRef = useRef<HTMLDivElement>(null);
  const commentTextRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const container = commentContainerRef.current;
    const el = commentTextRef.current;
    if (!container || !el) return;
    const base = parseFloat(commentFontSize);
    let size = base;
    el.style.fontSize = `${size}px`;
    while (el.scrollHeight > container.clientHeight && size > 10) {
      size -= 0.5;
      el.style.fontSize = `${size}px`;
    }
  }, [data.commentText, commentFontSize]);

  return (
    <div
      id={id}
      className="relative overflow-hidden"
      style={{
        width: "448px",
        minWidth: "448px",
        maxWidth: "448px",
        height: "450px",
        ...getBackgroundStyle(),
      }}
    >
      {/* Pattern Overlay */}
      {background?.pattern && background.pattern !== "none" && (
        <div className="absolute inset-0 pointer-events-none z-0" style={getPatternStyle()} />
      )}

      {/* Content */}
      <div className="relative flex flex-col h-full">

        {/* Chat bubble region */}
        <div className="px-5 pt-5 pb-0">
          <div className="relative">
            {/* SVG chat bubble shape */}
            <svg
              viewBox="0 0 1636 994"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full"
              style={{ display: "block" }}
            >
              <path
                d="M0 112.181C0 50.2253 50.2025 0 112.13 0H1523.87C1585.8 0 1636 50.2253 1636 112.181V711.708C1636 773.664 1585.8 823.889 1523.87 823.889H112.13C50.2025 823.889 0 773.664 0 711.708V112.181Z"
                fill={bubbleFill}
              />
              <path
                d="M494.476 994L245.4 822.969H421.867L494.476 994Z"
                fill={bubbleFill}
              />
            </svg>

            {/* Text overlay inside bubble body (bubble body = top 82.9% of SVG, pointer = bottom 17.1%) */}
            <div
              ref={commentContainerRef}
              className="absolute flex items-center justify-center overflow-hidden"
              style={{
                top: "5%",
                left: "7%",
                right: "7%",
                bottom: "21%",
                padding: "8px",
              }}
            >
              <p
                ref={commentTextRef}
                className="leading-snug"
                style={{
                  fontFamily: commentFontFamily,
                  fontSize: commentFontSize,
                  fontWeight: commentFontWeight,
                  color: commentColor,
                  textAlign: commentTextAlign,
                  lineHeight: 1.45,
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {data.commentText && data.commentText.trim()
                  ? `\u201C${data.commentText}\u201D`
                  : "\u201Cএই একটি নমুনা শিরোনাম যা দেখায় ফটোকার্ড কেমন দেখাবে\u201D"}
              </p>
            </div>
          </div>

          {/* Person name — below the bubble pointer, left-aligned */}
          <div style={{ paddingLeft: "80px", marginTop: "10px"}}>
            <p
              style={{
                fontFamily: nameFontFamily,
                fontSize: nameFontSize,
                fontWeight: nameFontWeight,
                color: nameColor,
              }}
            >
              {data.personName && data.personName.trim() ? data.personName : "রবীন্দ্রনাথ ঠাকুর"}
            </p>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom bar — logo flush to bottom-left edge */}
        <div className="relative" style={{ minHeight: "40px" }}>
          {/* Logo — touches left and bottom edges, no gap */}
          {visibilitySettings?.showLogo !== false && data.logo && (
          <div className="absolute bottom-0 left-0 z-10">
              <div
                className="flex items-center justify-center"
                style={{ backgroundColor: "#ffffff", padding: "8px 12px", minWidth: "80px", maxWidth: "140px", minHeight: "44px", borderTopRightRadius: "8px" }}
              >
                <img
                  src={getProxiedImageUrl(data.logo)}
                  alt="Logo"
                  className="object-contain"
                  style={{ maxWidth: "116px", maxHeight: "36px", display: "block" }}
                />
              </div>
          </div>
          )}
        </div>
      </div>

      {/* Person image — last in DOM, paints on top of the bubble */}
      <div
        className="absolute pointer-events-none"
        style={{ bottom: 0, right: 0, width: "260px", height: "400px", overflow: "hidden" }}
      >
        <img
          src={data.image ? getProxiedImageUrl(data.image) : "/images/person-placeholder.png"}
          alt={data.personName || "Person"}
          style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "bottom center", display: "block", transform: `translate(${imagePosition?.x ?? 0}px, ${imagePosition?.y ?? 0}px) scale(${(imagePosition?.scale ?? 100) / 100})`, transformOrigin: "bottom center" }}
        />
      </div>
    </div>
  );
}
