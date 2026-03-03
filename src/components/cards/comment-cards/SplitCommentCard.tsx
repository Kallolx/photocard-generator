"use client";

import {
  PhotocardData,
  CardFontStyles,
  CommentCardVisibilitySettings,
  BackgroundOptions,
} from "@/types";
import { getProxiedImageUrl } from "@/utils/imageProxy";

interface SplitCommentCardProps {
  data: PhotocardData;
  id?: string;
  fullSize?: boolean;
  fontStyles?: CardFontStyles;
  visibilitySettings?: Partial<CommentCardVisibilitySettings>;
  background?: BackgroundOptions;
}

// Fixed two-tone palette — not controlled by BackgroundOptions
const YELLOW = "#FCDB00";
const BLUE   = "#00A0F1";

export default function SplitCommentCard({
  data,
  id = "photocard",
  fontStyles,
  visibilitySettings,
  background,
}: SplitCommentCardProps) {

  // Comment text styles
  const commentFontSize   = fontStyles?.commentText?.fontSize   || "18px";
  const commentFontWeight = fontStyles?.commentText?.fontWeight || "700";
  const commentColor      = fontStyles?.commentText?.color      || "#111111";
  const commentFontFamily = fontStyles?.commentText?.fontFamily || "Hind Siliguri";

  // Person name styles
  const nameFontSize   = fontStyles?.personName?.fontSize   || "16px";
  const nameFontWeight = fontStyles?.personName?.fontWeight || "700";
  const nameColor      = fontStyles?.personName?.color      || "#1a1a1a";
  const nameFontFamily = fontStyles?.personName?.fontFamily || "Hind Siliguri";

  // Name-tag SVG — rendered at width=150, viewBox=344
  // foreignObject content is scaled down by 150/344, so font must be counter-scaled
  const nameSvgW = 150;
  const nameSvgH = Math.round(nameSvgW * (135 / 344)); // ≈ 59px
  const nameSvgScale = 344 / nameSvgW; // ≈ 2.293 — multiply font by this to get true px
  const nameScaledFontSize = `${parseFloat(nameFontSize) * nameSvgScale}px`;

  const dotOpacity = background?.patternOpacity ?? 0.08;

  return (
    <div
      id={id}
      className="relative overflow-hidden"
      style={{
        width: "448px",
        minWidth: "448px",
        maxWidth: "448px",
        height: "450px",
        backgroundColor: YELLOW,
      }}
    >
      {/* ── Two-tone angled background ── */}
      {/* Yellow fills the whole card as base */}
      {/* Blue wedge on the right via clip-path — gentle angle */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: BLUE,
          clipPath: "polygon(72% 0, 100% 0, 100% 100%, 62% 100%)",
        }}
      />

      {/* ── Black angled divider line along the split edge ── */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width="448"
        height="450"
        style={{ zIndex: 2 }}
        aria-hidden="true"
      >
        {/* Follows: 72% of 448 = 322.56 at top, 62% of 448 = 277.76 at bottom */}
        <line x1="323" y1="0" x2="278" y2="450" stroke="#000000" strokeWidth="3" />
      </svg>

      {/* ── Decorative dot pattern at 3 corners using dots.svg ── */}
      {/* Top-left */}
      <img
        src="/patterns/dots.svg"
        aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{
          zIndex: 1,
          opacity: dotOpacity,
          width: "160px",
          top: "-60px",
          left: "-60px",
        }}
      />
      {/* Top-right */}
      <img
        src="/patterns/dots.svg"
        aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{
          zIndex: 1,
          opacity: dotOpacity,
          width: "160px",
          top: "-60px",
          right: "-60px",
        }}
      />
      {/* Bottom-left */}
      <img
        src="/patterns/dots.svg"
        aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{
          zIndex: 1,
          opacity: dotOpacity,
          width: "160px",
          bottom: "-60px",
          left: "-60px",
        }}
      />

      {/* ── Person image — pushed further right ── */}
      <div
        className="absolute pointer-events-none z-10"
        style={{ bottom: 0, right: "-20px", width: "295px", height: "450px" }}
      >
        <img
          src={data.image ? getProxiedImageUrl(data.image) : "/images/person-placeholder.png"}
          alt={data.personName || "Person"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "bottom right",
            display: "block",
          }}
        />
      </div>

      {/* ── Content layer ── */}
      <div
        className="absolute inset-0 z-20 flex flex-col"
        style={{ paddingLeft: "28px", paddingRight: "8px", paddingTop: "40px", paddingBottom: 0 }}
      >
        {/* Logo — top right, white bg */}
        {visibilitySettings?.showLogo !== false && data.logo && (
          <div style={{ position: "absolute", top: "28px", right: "12px", zIndex: 30, backgroundColor: "#ffffff", padding: "5px 8px", borderRadius: "4px" }}>
            <img
              src={getProxiedImageUrl(data.logo)}
              alt="Logo"
              style={{ maxWidth: "90px", maxHeight: "28px", display: "block", objectFit: "contain" }}
            />
          </div>
        )}

        {/* Opening quote mark SVG removed — quotes are inline in text */}

        {/* Comment text */}
        <div style={{ maxWidth: "220px" }}>
          <p
            style={{
              fontFamily: commentFontFamily,
              fontSize: commentFontSize,
              fontWeight: commentFontWeight,
              color: commentColor,
              lineHeight: 1.5,
              letterSpacing: "-0.03em",
              wordBreak: "break-word",
              overflowWrap: "break-word",
              textAlign: "left",
            }}
          >
            {data.commentText && data.commentText.trim()
              ? data.commentText
              : "এইটি একটি নমুনা মন্তব্য, যা দেখায় ফ্যাটোকার্ড ব্যবহার করলে আপনার সোশ্যাল মিডিয়া পোস্ট, সংবাদ"}
          </p>
        </div>

        {/* Spacer */}
        <div style={{ flexGrow: 1, maxHeight: "40px" }} />

        {/* Person name inside the speech-bubble SVG — bottom-left */}
        <div style={{ flexShrink: 0, marginBottom: "0px", position: "relative" }}>
          {/* dots-2 underlayer — behind the name SVG, exact same size */}
          <img
            src="/patterns/dots-2.svg"
            aria-hidden="true"
            className="pointer-events-none select-none"
            style={{
              position: "absolute",
              top: -5,
              left: 0,
              width: `${nameSvgW}px`,
              height: `${nameSvgH}px`,
              objectFit: "cover",
              objectPosition: "left top",
              opacity: 0.45,
              zIndex: 0,
              transform: "rotate(-2deg) translateX(2px)",
              transformOrigin: "left center",
            }}
          />
          <svg
            width={nameSvgW}
            height={nameSvgH}
            viewBox="0 0 344 135"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block", overflow: "visible", position: "relative", zIndex: 1, filter: "drop-shadow(0px 3px 6px rgba(0,0,0,0.25))" }}
          >
            <path
              d="M340.078 2.59912L2.57812 13.5991L5.07812 92.0991H52.0781C47.5781 119.599 35.5781 125.599 29.5781 132.099C68.7781 115.699 84.2448 97.9325 87.0781 91.0991H324.578L340.078 2.59912Z"
              fill="white"
              stroke="black"
              strokeWidth="5"
            />
            {/* Text embedded directly inside SVG via foreignObject — guaranteed inside bounds */}
            <foreignObject x="14" y="14" width="316" height="72">
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: nameFontFamily,
                    fontSize: nameScaledFontSize,
                    fontWeight: nameFontWeight,
                    color: nameColor,
                    lineHeight: 1.2,
                    textAlign: "center",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    margin: 0,
                    padding: 0,
                  }}
                >
                  {data.personName && data.personName.trim()
                    ? data.personName
                    : "রবীন্দ্রনাথ ঠাকুর"}
                </p>
              </div>
            </foreignObject>
          </svg>
        </div>
      </div>
    </div>
  );
}
