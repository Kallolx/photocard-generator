"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  PhotocardData,
  BackgroundOptions,
  CardFontStyles,
  CommentCardVisibilitySettings,
} from "@/types";
import { getProxiedImageUrl } from "@/utils/imageProxy";

interface PortraitCommentCardProps {
  data: PhotocardData;
  background?: BackgroundOptions;
  id?: string;
  fullSize?: boolean;
  fontStyles?: CardFontStyles;
  visibilitySettings?: Partial<CommentCardVisibilitySettings>;
  imagePosition?: { x: number; y: number; scale: number };
  highlightIndices?: number[] | null;
  showHighlight?: boolean;
  cardBgColor?: string;
}

export default function PortraitCommentCard({
  data,
  background,
  id = "photocard",
  fontStyles,
  visibilitySettings,
  imagePosition,
  highlightIndices,
  showHighlight = true,
  cardBgColor = "#2e0000",
}: PortraitCommentCardProps) {
  // Derive accent color (used for left panel + quote marks)
  const accentColor =
    background?.type === "gradient" && background.gradientFrom
      ? background.gradientFrom
      : background?.color || "#dc2626";

  const getLeftPanelStyle = (): React.CSSProperties => {
    if (background?.type === "gradient" && background.gradientFrom && background.gradientTo) {
      return {
        background: `linear-gradient(180deg, ${background.gradientFrom}, ${background.gradientTo})`,
      };
    }
    return { backgroundColor: accentColor };
  };

  // Comment text styles
  const commentFontSize   = fontStyles?.commentText?.fontSize   || "20px";
  const commentFontWeight = fontStyles?.commentText?.fontWeight || "600";
  const commentColor      = fontStyles?.commentText?.color      || "#1a1a1a";
  const commentFontFamily = fontStyles?.commentText?.fontFamily || "Noto Serif Bengali";

  // Person name styles
  const nameFontSize   = fontStyles?.personName?.fontSize   || "16px";
  const nameFontWeight = fontStyles?.personName?.fontWeight || "700";
  const nameColor      = fontStyles?.personName?.color      || "#ffffff";
  const nameFontFamily = fontStyles?.personName?.fontFamily || "Noto Serif Bengali";

  const TEXT_MAX_H = 240;
  const [displayFontSize, setDisplayFontSize] = useState(commentFontSize);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const p = textRef.current;
    if (!p) return;
    let size = parseFloat(commentFontSize);
    p.style.fontSize = `${size}px`;
    while (p.scrollHeight > TEXT_MAX_H && size > 7) {
      size = Math.round((size - 0.5) * 10) / 10;
      p.style.fontSize = `${size}px`;
    }
    setDisplayFontSize(`${size}px`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.commentText, commentFontSize]);

  const CARD_W = 448;
  const CARD_H = 448;
  // Red panel: starts with a gap from left edge, narrower strip
  const LEFT_GAP = 40;   // white space before red panel
  const RED_W    = 104;  // width of red accent column
  // Person image: wider than red panel, extends past it
  const IMG_W    = 250;  // image container width (overlaps into right area)
  // Right content: starts after most of the image
  const RIGHT_X  = 200;  // where text content begins

  return (
    <div
      id={id}
      className="relative overflow-hidden"
      style={{
        width: `${CARD_W}px`,
        minWidth: `${CARD_W}px`,
        maxWidth: `${CARD_W}px`,
        height: `${CARD_H}px`,
        backgroundColor: cardBgColor,
      }}
    >
      {/* ── lines.svg fixed pattern — always on, opacity from Pattern tab ── */}
      <img
        src="/patterns/lines.svg"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{ objectFit: "cover", opacity: background?.patternOpacity ?? 0.4, zIndex: 2 }}
      />

      {/* ── Red accent column — with left gap, narrower ── */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{ left: `${LEFT_GAP}px`, width: `${RED_W}px`, ...getLeftPanelStyle(), zIndex: 1 }}
      >
        {/* Pattern overlay */}
        {background?.pattern && background.pattern !== "none" && (() => {
          const opacity = background.patternOpacity ?? 0.3;
          let bgImage = "";
          if (background.pattern === "p1") bgImage = "url(/patterns/p1.png)";
          else if (background.pattern === "p2") bgImage = "url(/patterns/p2.png)";
          else if (background.pattern === "custom" && background.patternImage) bgImage = `url(${background.patternImage})`;
          return bgImage ? (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: bgImage, backgroundSize: "cover", backgroundPosition: "center", opacity }}
            />
          ) : null;
        })()}
      </div>

      {/* ── Person image — top layer, bleeds freely into text area ── */}
      <div
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{ width: `${IMG_W}px`, height: `${CARD_H}px`, zIndex: 10 }}
      >
        <img
          src={
            data.image
              ? getProxiedImageUrl(data.image)
              : "/images/person-placeholder.png"
          }
          alt={data.personName || "Person"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "bottom center",
            display: "block",
            transform: `translate(${imagePosition?.x ?? 0}px, ${imagePosition?.y ?? 0}px) scale(${(imagePosition?.scale ?? 100) / 100})`,
            transformOrigin: "bottom center",
          }}
        />
      </div>

      {/* ── Right text area — below image layer ── */}
      <div
        className="absolute top-0 bottom-0 right-0 flex flex-col justify-start"
        style={{ left: `${RIGHT_X}px`, padding: "40px 16px 18px 12px", zIndex: 3 }}
      >
        {/* Logo — bottom right */}
        {visibilitySettings?.showLogo !== false && data.logo && (
          <div
            className="absolute flex items-center justify-center"
            style={{
              bottom: "12px",
              right: "12px",
              backgroundColor: "#f5f5f5",
              padding: "4px 8px",
              borderRadius: "4px",
              zIndex: 10,
              maxWidth: "96px",
            }}
          >
            <img
              src={getProxiedImageUrl(data.logo)}
              alt="Logo"
              style={{ maxWidth: "84px", maxHeight: "26px", display: "block", objectFit: "contain" }}
            />
          </div>
        )}

        {/* Opening quote mark */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 60 44"
          style={{ width: "40px", height: "30px", flexShrink: 0, marginBottom: "6px", alignSelf: "flex-start" }}
          aria-hidden="true"
        >
          <path
            d="M0 44V28.6C0 19.4 2.3 12.2 6.9 6.9 11.5 1.7 17.9 0 26.1 0L27 4.4c-4.6.8-8.3 2.9-11.1 6.3-2.8 3.4-4.2 7.2-4.2 11.3v2h15v20H0zm33 0V28.6c0-9.2 2.3-16.4 6.9-21.7C44.5 1.7 50.9 0 59.1 0L60 4.4c-4.6.8-8.3 2.9-11.1 6.3-2.8 3.4-4.2 7.2-4.2 11.3v2h15v20H33z"
            fill={accentColor}
          />
        </svg>

        {/* Comment text */}
        <div
          style={{ overflow: "hidden", maxHeight: "240px", flexShrink: 0 }}
        >
          <p
            ref={textRef}
            style={{
              fontFamily: commentFontFamily,
              fontSize: displayFontSize,
              fontWeight: commentFontWeight,
              color: commentColor,
              lineHeight: 1.3,
              wordBreak: "break-word",
              overflowWrap: "break-word",
              textAlign: "left",
              maxHeight: `${TEXT_MAX_H}px`,
              overflow: "hidden",
            }}
          >
            {(() => {
              const text = data.commentText && data.commentText.trim()
                ? data.commentText
                : "এই একটি নমুনা শিরোনাম যা দেখায় ফটোকার্ড কেমন দেখাবে";
              const words = text.split(" ");
              if (!showHighlight || !highlightIndices || highlightIndices.length === 0) {
                return <>{text}</>;
              }
              const highlighted = new Set(highlightIndices);
              return words.map((word, i) =>
                highlighted.has(i) ? (
                  <React.Fragment key={i}>
                    <span
                      style={{
                        backgroundColor: accentColor,
                        color: "#ffffff",
                        padding: "1px 6px",
                        display: "inline-block",
                        lineHeight: 1.4,
                        marginBottom: "2px",
                      }}
                    >
                      {word}
                    </span>
                    {" "}
                  </React.Fragment>
                ) : (
                  <span key={i}>{word}{i < words.length - 1 ? " " : ""}</span>
                )
              );
            })()}
          </p>
        </div>

        {/* Closing quote — sibling block, tight to text */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 60 44"
          aria-hidden="true"
          style={{ width: "34px", height: "25px", flexShrink: 0, marginTop: "5px", transform: "rotate(180deg)", alignSelf: "flex-start" }}
        >
          <path
            d="M0 44V28.6C0 19.4 2.3 12.2 6.9 6.9 11.5 1.7 17.9 0 26.1 0L27 4.4c-4.6.8-8.3 2.9-11.1 6.3-2.8 3.4-4.2 7.2-4.2 11.3v2h15v20H0zm33 0V28.6c0-9.2 2.3-16.4 6.9-21.7C44.5 1.7 50.9 0 59.1 0L60 4.4c-4.6.8-8.3 2.9-11.1 6.3-2.8 3.4-4.2 7.2-4.2 11.3v2h15v20H33z"
            fill={accentColor}
          />
        </svg>

        {/* Person name — no horizontal rule */}
        {visibilitySettings?.showPersonName !== false && (
          <p
            style={{
              fontFamily: nameFontFamily,
              fontSize: nameFontSize,
              fontWeight: nameFontWeight,
              color: nameColor,
              lineHeight: 1.3,
              marginTop: "20px",
              flexShrink: 0,
            }}
          >
            {data.personName && data.personName.trim()
              ? `— ${data.personName}`
              : "— ব্যক্তির নাম"}
          </p>
        )}
      </div>
    </div>
  );
}
