"use client";

import {
  PhotocardData,
  BackgroundOptions,
  CardFontStyles,
  VisibilitySettings,
} from "@/types";
import { getProxiedImageUrl } from "@/utils/imageProxy";

interface GridCommentCardProps {
  data: PhotocardData;
  background?: BackgroundOptions;
  id?: string;
  fullSize?: boolean;
  fontStyles?: CardFontStyles;
  visibilitySettings?: Partial<VisibilitySettings>;
  onLogoUpload?: (file: File) => void;
}

export default function GridCommentCard({
  data,
  background,
  id = "photocard",
  fontStyles,
  visibilitySettings,
}: GridCommentCardProps) {
  // Background: default white, but respect solid/gradient overrides
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!background) return { backgroundColor: "#ffffff" };
    if (
      background.type === "gradient" &&
      background.gradientFrom &&
      background.gradientTo
    ) {
      return {
        backgroundImage: `linear-gradient(135deg, ${background.gradientFrom}, ${background.gradientTo})`,
      };
    }
    return { backgroundColor: background.color || "#ffffff" };
  };

  // Comment text styles
  const commentFontSize = fontStyles?.commentText?.fontSize || "20px";
  const commentFontWeight = fontStyles?.commentText?.fontWeight || "700";
  const commentColor = fontStyles?.commentText?.color || "#111111";
  const commentFontFamily =
    fontStyles?.commentText?.fontFamily || "Noto Serif Bengali";

  // Person name styles
  const nameFontSize = fontStyles?.personName?.fontSize || "15px";
  const nameFontWeight = fontStyles?.personName?.fontWeight || "700";
  const nameColor = fontStyles?.personName?.color || "#444444";
  const nameFontFamily =
    fontStyles?.personName?.fontFamily || "Noto Serif Bengali";

  // Accent color derived from background (for quote marks + name rule)
  const accentColor =
    background?.type === "gradient"
      ? background.gradientFrom || "#2563eb"
      : background?.color && background.color !== "#ffffff"
        ? background.color
        : "#2563eb";

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
      {/* Fixed grid pattern — opacity controlled via background.patternOpacity */}
      <svg
        className="absolute inset-0 pointer-events-none z-0"
        width="448"
        height="450"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: background?.patternOpacity ?? 0.2 }}
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="grid"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 28 0 L 0 0 0 28"
              fill="none"
              stroke="#000000"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>
        <rect width="448" height="450" fill="url(#grid)" />
      </svg>

      {/* Accent stripe on the left edge */}
      <div
        className="absolute left-0 top-0 bottom-0 z-0"
        style={{ width: "5px", backgroundColor: accentColor }}
      />

      {/* Content layer */}
      <div className="relative z-10 flex flex-col h-full pl-10 pr-7 pb-8">
        {/* Quote SVG + comment text block */}
        <div
          className="flex-1 flex flex-col justify-start"
          style={{ maxWidth: "62%" }}
        >
          {/* Large decorative quote marks */}
          <svg
            fill="#6200ff"
            width="80px"
            height="80px"
            viewBox="0 0 40 20"
            opacity="0.15"
            version="1.1"
            style={{ marginBottom: "10px", flexShrink: 0 }}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>quote</title>
            <path d="M9.563 8.469l-0.813-1.25c-5.625 3.781-8.75 8.375-8.75 12.156 0 3.656 2.688 5.375 4.969 5.375 2.875 0 4.906-2.438 4.906-5 0-2.156-1.375-4-3.219-4.688-0.531-0.188-1.031-0.344-1.031-1.25 0-1.156 0.844-2.875 3.938-5.344zM21.969 8.469l-0.813-1.25c-5.563 3.781-8.75 8.375-8.75 12.156 0 3.656 2.75 5.375 5.031 5.375 2.906 0 4.969-2.438 4.969-5 0-2.156-1.406-4-3.313-4.688-0.531-0.188-1-0.344-1-1.25 0-1.156 0.875-2.875 3.875-5.344z"></path>
          </svg>

          {/* Comment text */}
          <p
            style={{
              fontFamily: commentFontFamily,
              fontSize: commentFontSize,
              fontWeight: commentFontWeight,
              color: commentColor,
              lineHeight: 1.5,
              wordBreak: "break-word",
              overflowWrap: "break-word",
              textAlign: "left",
            }}
          >
            <span style={{ color: accentColor, fontWeight: 800 }}>“</span>
            {data.commentText && data.commentText.trim()
              ? data.commentText
              : "এই একটি নমুনা মন্তব্য যা দেখায় ফটোকার্ড কেমন দেখাবে"}
            <span style={{ color: accentColor, fontWeight: 800 }}>”</span>
          </p>

          {/* Divider + person name */}
          <div
            style={{
              marginTop: "16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "2px",
                backgroundColor: accentColor,
                flexShrink: 0,
                borderRadius: "2px",
              }}
            />
            <p
              style={{
                fontFamily: nameFontFamily,
                fontSize: nameFontSize,
                fontWeight: nameFontWeight,
                color: nameColor,
                lineHeight: 1.2,
                wordBreak: "break-word",
              }}
            >
              {data.personName && data.personName.trim()
                ? data.personName
                : "রবীন্দ্রনাথ ঠাকুর"}
            </p>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom bar — logo flush to bottom-left edge */}
        <div className="relative" style={{ minHeight: "60px" }}>
          {visibilitySettings?.showLogo !== false && data.logo && (
            <div className="absolute bottom-0 left-0 z-10">
              <div
                style={{
                  padding: "6px 10px",
                  minWidth: "70px",
                  maxWidth: "130px",
                  minHeight: "38px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={getProxiedImageUrl(data.logo)}
                  alt="Logo"
                  style={{
                    maxWidth: "106px",
                    maxHeight: "30px",
                    display: "block",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Person image — bottom right */}
      <div
        className="absolute pointer-events-none"
        style={{ bottom: 0, right: 0, width: "240px", height: "420px" }}
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
          }}
        />
      </div>
    </div>
  );
}
