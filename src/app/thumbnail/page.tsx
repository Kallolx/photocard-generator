"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { DotBackground } from "@/components/DotBackground";
import DownloadControls from "@/components/DownloadControls";
import ThumbnailCustomizationPanel, {
  ThumbnailPanelState,
} from "@/components/ThumbnailCustomizationPanel";
import ClassicThumbnailCard, {
  ThumbnailFontStyles,
} from "@/components/cards/thumbnail-cards/ClassicThumbnailCard";
import FramedThumbnailCard from "@/components/cards/thumbnail-cards/FramedThumbnailCard";
import { BackgroundOptions } from "@/types";

const CARD_W = 1920;
const CARD_H = 1080;

const DEFAULT_FONT_STYLES: ThumbnailFontStyles = {
  headline: {
    fontFamily: "Noto Serif Bengali",
    fontSize: "108px",
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: "0px",
    textShadow: { preset: "none", angle: 135 },
  },
};

const DEFAULT_PATTERN: BackgroundOptions = {
  type: "solid",
  color: "#690007",
  pattern: "p-duo",
  patternOpacity: 0.1,
  patternScale: 1.0,
};

const INITIAL_STATE: ThumbnailPanelState = {
  theme: "classic",
  images: [{ src: null, position: { x: 50, y: 50 } }],
  logo: null,
  logoBackground: "#ffffff",
  showLogoBackground: true,
  title: "এই একটি নমুনা শিরোনাম যা দেখায় থাম্বনেইল কেমন দেখাবে",
  textBackground: "#690007",
  fontStyles: DEFAULT_FONT_STYLES,
  pattern: DEFAULT_PATTERN,
  splitStyle: { mode: "border", borderWidth: 6, borderColor: "#690007", blendAmount: 20, blendColor: "#690007" },
};

export default function ThumbnailPage() {
  const [panelState, setPanelState] = useState<ThumbnailPanelState>(INITIAL_STATE);
  const [leftPanelWidth, setLeftPanelWidth] = useState(30); // %
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // Scale for preview
  const previewAreaRef = useRef<HTMLDivElement>(null);
  const [cardScale, setCardScale] = useState(0.35);

  // Compute scale based on available width (mobile: width-only; desktop: fit both)
  const updateScale = useCallback(() => {
    if (!previewAreaRef.current) return;
    const isMobile = window.innerWidth < 768;
    const hPad = isMobile ? 32 : 64;
    const availW = previewAreaRef.current.clientWidth - hPad;
    if (availW <= 0) return;
    const scaleW = availW / CARD_W;
    if (isMobile) {
      setCardScale(Math.min(scaleW, 0.45));
    } else {
      const availH = previewAreaRef.current.clientHeight - 120;
      if (availH <= 0) return;
      const scaleH = availH / CARD_H;
      setCardScale(Math.min(scaleW, scaleH, 0.45));
    }
  }, []);

  useEffect(() => {
    const obs = new ResizeObserver(updateScale);
    if (previewAreaRef.current) obs.observe(previewAreaRef.current);
    updateScale();
    return () => obs.disconnect();
  }, [updateScale]);

  // Resize handle
  const handleMouseDown = () => setIsResizing(true);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 20 && newWidth < 55) setLeftPanelWidth(newWidth);
    },
    [isResizing]
  );

  const handleMouseUp = useCallback(() => setIsResizing(false), []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scaledW = Math.round(CARD_W * cardScale);
  const scaledH = Math.round(CARD_H * cardScale);

  return (
    <ProtectedRoute>
      <div className="h-screen bg-white flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Main layout */}
        <div className="flex flex-1 flex-col md:flex-row md:min-h-0 max-w-[1920px] mx-auto w-full">
          {/* Left Sidebar */}
          <div
            className="w-full bg-[#f5f0e8] flex flex-col overflow-y-auto md:overflow-hidden md:min-h-0 max-h-[45vh] md:max-h-none"
            style={isDesktop ? { width: `${leftPanelWidth}%` } : undefined}
          >
            {/* Page title */}
            <div className="mb-4 shrink-0 px-4 pt-4 md:px-5 md:pt-5">
              <h1 className="text-sm font-bold text-[#3d2f1f] font-dm-sans">
                YouTube Thumbnail
              </h1>
              <p className="text-[11px] text-[#8b7055] mt-0.5">
                1920 × 1080 · Classic
              </p>
            </div>

            {/* Panel */}
            <div className="flex-1 md:min-h-0 md:overflow-hidden px-4 pb-4 md:px-5 md:pb-5">
              <ThumbnailCustomizationPanel
                state={panelState}
                onChange={setPanelState}
              />
            </div>
          </div>

          {/* Resize handle */}
          <div
            className="hidden md:block w-1 bg-[#d4c4b0] hover:bg-[#8b6834] cursor-col-resize active:bg-blue-600 transition-colors"
            onMouseDown={handleMouseDown}
            style={{ userSelect: "none" }}
          />

          {/* Right preview area */}
          <div
            ref={previewAreaRef}
            className="flex-1 min-h-[55vw] md:min-h-0 md:overflow-hidden relative"
          >
          <DotBackground className="w-full h-full bg-[#faf8f5] md:overflow-y-auto md:min-h-0 relative">
            <div className="flex flex-col items-center justify-start p-6 md:p-10 w-full h-full">
              {/* Scaled card wrapper */}
              <div
                style={{
                  width: scaledW,
                  height: scaledH,
                  overflow: "hidden",
                  flexShrink: 0,
                  boxShadow:
                    "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
                }}
              >
                <div
                  id="thumbnail-card"
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    transform: `scale(${cardScale})`,
                    transformOrigin: "top left",
                  }}
                >
                  {panelState.theme === "framed" ? (
                    <FramedThumbnailCard
                      id="thumbnail-card-inner"
                      data={{
                        title: panelState.title,
                        images: panelState.images,
                        logo: panelState.logo ?? undefined,
                      }}
                      textBackground={panelState.textBackground}
                      fontStyles={panelState.fontStyles}
                      pattern={panelState.pattern}
                      logoBackground={panelState.logoBackground}
                      showLogoBackground={panelState.showLogoBackground}
                      splitStyle={panelState.splitStyle}
                    />
                  ) : (
                    <ClassicThumbnailCard
                      id="thumbnail-card-inner"
                      data={{
                        title: panelState.title,
                        images: panelState.images,
                        logo: panelState.logo ?? undefined,
                      }}
                      textBackground={panelState.textBackground}
                      fontStyles={panelState.fontStyles}
                      pattern={panelState.pattern}
                      logoBackground={panelState.logoBackground}
                      showLogoBackground={panelState.showLogoBackground}
                      splitStyle={panelState.splitStyle}
                    />
                  )}
                </div>
              </div>

              {/* Download controls */}
              <div className="mt-6">
                <DownloadControls
                  isVisible={true}
                  targetId="thumbnail-card-inner"
                />
              </div>
            </div>
          </DotBackground>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
