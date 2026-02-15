"use client";

import { useRef, useEffect } from "react";
import { Image } from "lucide-react";

interface VideoReelCardProps {
  videoUrl?: string;
  logoUrl?: string;
  faviconUrl?: string;
  topText?: string;
  bottomText?: string;
  topTextSize?: number;
  topTextColor?: string;
  bottomTextSize?: number;
  bottomTextColor?: string;
  backgroundType?: "solid" | "video";
  backgroundColor?: string;
  backgroundVideoUrl?: string;
  bgBlur?: boolean;
  showFrame?: boolean;
  frameThickness?: number;
  frameColor?: string;
  showVideoFrame?: boolean;
  videoFrameThickness?: number;
  videoFrameColor?: string;
  showLogo?: boolean;
  showFavicon?: boolean;
  showTopText?: boolean;
  showBottomText?: boolean;
}

export default function VideoReelCard({
  videoUrl,
  logoUrl,
  faviconUrl,
  topText = "",
  bottomText = "",
  topTextSize = 14,
  topTextColor = "#FFFFFF",
  bottomTextSize = 14,
  bottomTextColor = "#FFFFFF",
  backgroundType = "solid",
  backgroundColor = "#000000",
  backgroundVideoUrl,
  bgBlur = false,
  showFrame = false,
  frameThickness = 4,
  frameColor = "#FFFFFF",
  showVideoFrame = false,
  videoFrameThickness = 4,
  videoFrameColor = "#FFFFFF",
  showLogo = true,
  showFavicon = true,
  showTopText = true,
  showBottomText = true,
}: VideoReelCardProps) {
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  
  // Use default Bangla text when inputs are empty
  const displayTopText = topText || "আপনার ব্র্যান্ডের নাম";
  const displayBottomText = bottomText || "এখনই দেখুন";

  // Auto-play videos when loaded
  useEffect(() => {
    if (mainVideoRef.current && videoUrl) {
      mainVideoRef.current.play().catch(() => {
        // Autoplay might be blocked
      });
    }
  }, [videoUrl]);

  useEffect(() => {
    if (bgVideoRef.current && backgroundVideoUrl) {
      bgVideoRef.current.play().catch(() => {
        // Autoplay might be blocked
      });
    }
  }, [backgroundVideoUrl]);

  return (
    <div
      className={`relative overflow-hidden shadow-2xl ${showFrame ? 'border-solid' : ''}`}
      style={{
        width: "280px",
        height: "497px",
        ...(showFrame && {
          borderWidth: `${frameThickness}px`,
          borderColor: frameColor,
        }),
      }}
      data-bg-color={backgroundColor}
      data-blur={bgBlur.toString()}
      data-show-frame={showFrame.toString()}
      data-frame-thickness={frameThickness.toString()}
      data-frame-color={frameColor}
      data-show-video-frame={showVideoFrame.toString()}
      data-video-frame-thickness={videoFrameThickness.toString()}
      data-video-frame-color={videoFrameColor}
    >
      {/* Background Layer */}
      {backgroundType === "solid" ? (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: backgroundColor }}
        />
      ) : (
        <div className="absolute inset-0 overflow-hidden">
          {backgroundVideoUrl ? (
            <video
              ref={bgVideoRef}
              src={backgroundVideoUrl}
              className={`absolute inset-0 w-full h-full object-cover ${bgBlur ? "blur-xl scale-110" : ""}`}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600" />
          )}
        </div>
      )}

      {/* Top Section - Logo & Favicon */}
      <div className="absolute top-1.5 left-2 pt-2 right-0 z-20 flex items-start">
        {/* Favicon on left with top margin */}
        {showFavicon && (
          <div className="flex-shrink-0 p-2">
            <div className="w-8 h-8 -mt-1 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
              {faviconUrl ? (
                <img
                  src={faviconUrl}
                  alt="Favicon"
                  className="w-7 h-7 object-contain"
                />
              ) : (
                <Image className="w-4 h-4 text-gray-400" strokeWidth={2} />
              )}
            </div>
          </div>
        )}

        {/* Logo on right with white background, rounded left corners - always stays right */}
        {showLogo && (
          <div className="flex-shrink-0 bg-white px-2 py-1.5 rounded-l-lg ml-auto">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-6 w-auto object-contain"
              />
            ) : (
              <div className="h-6 w-12 flex items-center justify-center">
                <Image className="w-5 h-5 text-gray-400" strokeWidth={2} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Center Section - Main Video */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative w-full max-h-[70%] flex flex-col items-center justify-center gap-2">
          {/* Top Text - Always visible */}
          {showTopText && displayTopText && (
            <p 
              className="font-noto-bengali font-bold drop-shadow-lg text-center px-4"
              style={{ 
                fontSize: `${topTextSize}px`,
                color: topTextColor
              }}
            >
              {displayTopText}
            </p>
          )}
          
          {/* Main Video or Upload Placeholder */}
          {videoUrl ? (
            <video
              ref={mainVideoRef}
              src={videoUrl}
              className={`max-w-full max-h-full object-contain ${showVideoFrame ? 'border-solid' : ''}`}
              style={{
                ...(showVideoFrame && {
                  borderWidth: `${videoFrameThickness}px`,
                  borderColor: videoFrameColor,
                }),
              }}
              controls
              loop
              playsInline
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-white/60 py-8">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm font-medium">Upload Video</p>
            </div>
          )}
          
          {/* Bottom Text - Always visible */}
          {showBottomText && displayBottomText && (
            <p 
              className="font-noto-bengali font-bold text-center drop-shadow-lg px-4"
              style={{ 
                fontSize: `${bottomTextSize}px`,
                color: bottomTextColor
              }}
            >
              {displayBottomText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
