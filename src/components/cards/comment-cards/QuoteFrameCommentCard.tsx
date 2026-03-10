"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  PhotocardData,
  BackgroundOptions,
  CardFontStyles,
  CommentCardVisibilitySettings,
} from "@/types";
import { getProxiedImageUrl } from "@/utils/imageProxy";

interface QuoteFrameCommentCardProps {
  data: PhotocardData;
  background?: BackgroundOptions;
  id?: string;
  fullSize?: boolean;
  fontStyles?: CardFontStyles;
  visibilitySettings?: Partial<CommentCardVisibilitySettings>;
  imagePosition?: { x: number; y: number; scale: number };
  cardBgColor?: string;
}

export default function QuoteFrameCommentCard({
  data,
  background,
  id = "photocard",
  fontStyles,
  visibilitySettings,
  imagePosition,
  cardBgColor = "#fcfcfc",
}: QuoteFrameCommentCardProps) {
  const isGradient =
    background?.type === "gradient" &&
    !!background.gradientFrom &&
    !!background.gradientTo;

  const accentColor = isGradient
    ? background!.gradientFrom!
    : background?.color || "#16a34a";

  const commentFontSize   = fontStyles?.commentText?.fontSize   || "10px";
  const commentFontWeight = fontStyles?.commentText?.fontWeight || "600";
  const commentColor      = fontStyles?.commentText?.color      || "#1a1a1a";
  const commentFontFamily = fontStyles?.commentText?.fontFamily || "Noto Serif Bengali";

  const nameFontSize   = fontStyles?.personName?.fontSize   || "18px";
  const nameFontWeight = fontStyles?.personName?.fontWeight || "700";
  const nameColor      = fontStyles?.personName?.color      || "#1a1a1a";
  const nameFontFamily = fontStyles?.personName?.fontFamily || "Noto Serif Bengali";

  // available vertical space inside the white box (TEXT_H - 28px vertical padding)
  const TEXT_PADDING_V = 28;

  const [displayFontSize, setDisplayFontSize] = useState(commentFontSize);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const p = textRef.current;
    if (!p) return;
    const maxH = parseInt(String(TEXT_H - TEXT_PADDING_V), 10);
    const baseSize = parseFloat(commentFontSize);
    // always start from the user-chosen size
    let size = baseSize;
    p.style.fontSize = `${size}px`;
    // shrink until content fits or we hit the minimum
    while (p.scrollHeight > maxH && size > 7) {
      size = Math.round((size - 0.5) * 10) / 10;
      p.style.fontSize = `${size}px`;
    }
    setDisplayFontSize(`${size}px`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.commentText, commentFontSize]);

  // ── Layout (448 × 448) ────────────────────────────────────────────────────
  const CARD_W = 448;
  const CARD_H = 448;

  // SVG shape natural viewBox: 299 × 549
  const FRAME_W   = 196;                        // rendered pixel width
  const SCALE     = FRAME_W / 299;              // ≈ 0.655
  const FRAME_H   = Math.round(549 * SCALE);    // ≈ 360 px
  const FRAME_L   = 8;
  const FRAME_T   = 44;                         // head overflow space (px above SVG)
  const FRAME_B   = FRAME_T + FRAME_H;          // ≈ 404

  // How far above the SVG origin (in SVG user units) to extend the clip path
  const OVERFLOW_U = Math.round(FRAME_T / SCALE); // ≈ 67 units

  const TEXT_L = FRAME_L + FRAME_W + 10;        // ≈ 214
  const TEXT_T = FRAME_T;
  const TEXT_W = CARD_W - TEXT_L - 10;          // ≈ 224
  const TEXT_H = 240;                            // text box height
  const NAME_Y = TEXT_T + TEXT_H + 20;          // directly below text box

  // Original SVG path from the design asset (verbatim)
  const FRAME_PATH =
    "M0 0H278.5V250.5H143.5C141.5 375.7 246.333 430.333 299 442C283.5 472.167 251 535.8 245 549C49.4405 496.6 0.183557 318.167 0 235.5V0Z";

  // Same path but top edge pushed up by OVERFLOW_U so the head is NOT clipped
  const CLIP_PATH =
    `M0 ${-OVERFLOW_U}H278.5V250.5H143.5` +
    `C141.5 375.7 246.333 430.333 299 442` +
    `C283.5 472.167 251 535.8 245 549` +
    `C49.4405 496.6 0.183557 318.167 0 235.5` +
    `V${-OVERFLOW_U}Z`;

  // Convert imagePosition from card-px to SVG user-units
  const ipX     = (imagePosition?.x     ?? 0) / SCALE;
  const ipY     = (imagePosition?.y     ?? 0) / SCALE;
  const ipScale = (imagePosition?.scale ?? 100) / 100;

  const personImageUrl = data.image
    ? getProxiedImageUrl(data.image)
    : "/images/person-placeholder.png";

  const clipId = `qfc-clip-${id}`;
  const gradId = `qfc-grad-${id}`;

  return (
    <div
      id={id}
      className="relative overflow-hidden"
      style={{
        width:     `${CARD_W}px`,
        minWidth:  `${CARD_W}px`,
        maxWidth:  `${CARD_W}px`,
        height:    `${CARD_H}px`,
        minHeight: `${CARD_H}px`,
        maxHeight: `${CARD_H}px`,
        overflow:  "hidden",
        backgroundColor: cardBgColor,
      }}
    >
      {/* Paper texture — always present, fixed opacity */}
      <img
        src="/patterns/paper.png"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{ objectFit: "cover", opacity: 0.30, zIndex: 1 }}
      />

      {/*
        ── SVG frame with clipped person image ──
        The SVG is placed at top:FRAME_T (not 0) so there is room above for
        the head to overflow. overflow:visible lets content at negative-y
        coordinates render above the SVG's position on the page.

        clipPath extends upward by OVERFLOW_U units (= FRAME_T card px) so
        the sides+bottom are clipped to the shape but the top is open.
      */}
      <svg
        viewBox="0 0 299 549"
        width={FRAME_W}
        height={FRAME_H}
        style={{
          position: "absolute",
          left:     `${FRAME_L}px`,
          top:      `${FRAME_T}px`,
          overflow: "visible",
          zIndex:   3,
        }}
      >
        <defs>
          {isGradient && (
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={background!.gradientFrom!} />
              <stop offset="100%" stopColor={background!.gradientTo!} />
            </linearGradient>
          )}
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path d={CLIP_PATH} />
          </clipPath>
        </defs>

        {/* Accent-colored shape fill */}
        <path
          d={FRAME_PATH}
          fill={isGradient ? `url(#${gradId})` : accentColor}
        />

        {/*
          Outer <g> applies the clip in fixed SVG space (clip never moves).
          Inner <g> applies the pan/zoom transform to the image only.
          This is the correct SVG pattern: clip stays anchored to the shape;
          image moves inside the boundary.
          Scale is applied around the horizontal center and bottom of the
          rectangle (149.5, 250) so the image scales within the frame naturally.
        */}
        <g clipPath={`url(#${clipId})`}>
          <g transform={`translate(${ipX} ${ipY}) translate(149.5,549) scale(${ipScale}) translate(-149.5,-549)`}>
            <image
              href={personImageUrl}
              x="0"
              y={-OVERFLOW_U}
              width="299"
              height={549 + OVERFLOW_U}
              preserveAspectRatio="xMidYMax slice"
            />
          </g>
        </g>
      </svg>

      {/* ── Text box wrapper — overflow:visible so quote icons bleed outside ── */}
      <div
        className="absolute"
        style={{
          left:     `${TEXT_L}px`,
          top:      `${TEXT_T}px`,
          width:    `${TEXT_W}px`,
          height:   `${TEXT_H}px`,
          zIndex:   4,
          overflow: "visible",
        }}
      >
        {/* White text card */}
        <div
          style={{
            position:        "absolute",
            inset:           0,
            backgroundColor: "rgba(255,255,255,0.90)",
            borderRadius:    "16px",
            boxShadow:       "0 2px 14px rgba(0,0,0,0.09)",
            overflow:        "hidden",
            padding:         "14px",
            boxSizing:       "border-box",
            display:         "flex",
            flexDirection:   "column",
            justifyContent:  "center",
          }}
        >
          {/* Comment text */}
          <p
            ref={textRef}
            style={{
              fontFamily:   commentFontFamily,
              fontSize:     displayFontSize,
              fontWeight:   commentFontWeight,
              color:        commentColor,
              lineHeight:   1.45,
              wordBreak:    "break-word",
              overflowWrap: "break-word",
              maxHeight:    `${TEXT_H - TEXT_PADDING_V}px`,
              overflow:     "hidden",
            }}
          >
            {data.commentText?.trim()
              ? data.commentText
              : "এই একটি নমুনা শিরোনাম যা দেখায় ফটোকার্ড কেমন দেখাবে"}
          </p>
        </div>

        {/* Opening quote — top-left corner, half outside */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 60 44"
          aria-hidden="true"
          style={{
            position:  "absolute",
            top:       0,
            left:      "14px",
            width:     "28px",
            height:    "20px",
            transform: "translateY(-50%)",
          }}
        >
          <path
            d="M0 44V28.6C0 19.4 2.3 12.2 6.9 6.9 11.5 1.7 17.9 0 26.1 0L27 4.4c-4.6.8-8.3 2.9-11.1 6.3-2.8 3.4-4.2 7.2-4.2 11.3v2h15v20H0zm33 0V28.6c0-9.2 2.3-16.4 6.9-21.7C44.5 1.7 50.9 0 59.1 0L60 4.4c-4.6.8-8.3 2.9-11.1 6.3-2.8 3.4-4.2 7.2-4.2 11.3v2h15v20H33z"
            fill={accentColor}
          />
        </svg>

        {/* Closing quote — bottom-right corner, half outside */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 60 44"
          aria-hidden="true"
          style={{
            position:  "absolute",
            bottom:    0,
            right:     "14px",
            width:     "28px",
            height:    "20px",
            transform: "translateY(50%) rotate(180deg)",
          }}
        >
          <path
            d="M0 44V28.6C0 19.4 2.3 12.2 6.9 6.9 11.5 1.7 17.9 0 26.1 0L27 4.4c-4.6.8-8.3 2.9-11.1 6.3-2.8 3.4-4.2 7.2-4.2 11.3v2h15v20H0zm33 0V28.6c0-9.2 2.3-16.4 6.9-21.7C44.5 1.7 50.9 0 59.1 0L60 4.4c-4.6.8-8.3 2.9-11.1 6.3-2.8 3.4-4.2 7.2-4.2 11.3v2h15v20H33z"
            fill={accentColor}
          />
        </svg>
      </div>

      {/* ── Person name ── */}
      {visibilitySettings?.showPersonName !== false && (
        <div
          className="absolute"
          style={{ top: `${NAME_Y}px`, left: `${TEXT_L}px`, right: "16px", zIndex: 4 }}
        >
          <p style={{ fontFamily: nameFontFamily, fontSize: nameFontSize, fontWeight: nameFontWeight, color: nameColor }}>
            — {data.personName || "ব্যক্তির নাম"}
          </p>
        </div>
      )}

      {/* ── Logo — bottom-right corner ── */}
      {visibilitySettings?.showLogo !== false && data.logo && (
        <div
          className="absolute flex items-center"
          style={{ bottom: "16px", right: "16px", zIndex: 5 }}
        >
          <img
            src={getProxiedImageUrl(data.logo)}
            alt="Logo"
            style={{ maxWidth: "110px", maxHeight: "32px", objectFit: "contain" }}
          />
        </div>
      )}
    </div>
  );
}

