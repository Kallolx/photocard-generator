"use client";

import { PhotocardData, BackgroundOptions, CardFontStyles, VisibilitySettings } from "@/types";
import QRCode from "qrcode";
import { useEffect, useState, useRef } from "react";
import { getProxiedImageUrl } from "@/utils/imageProxy";
import { EyeOff, RotateCcw, Upload } from "lucide-react";

// Floating menu for element actions
function FloatingMenu({
  elementId,
  elementType,
  onHide,
  onClear,
  onUpload,
  position,
  isVisible,
}: {
  elementId: string;
  elementType: string;
  onHide: () => void;
  onClear: () => void;
  onUpload?: () => void;
  position: { x: number; y: number };
  isVisible: boolean;
}) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 p-1 flex gap-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onHide}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Hide"
      >
        <EyeOff className="w-4 h-4 text-gray-600" />
      </button>
      <button
        onClick={onClear}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Reset to Default"
      >
        <RotateCcw className="w-4 h-4 text-gray-600" />
      </button>
      {onUpload && (
        <button
          onClick={onUpload}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Upload New"
        >
          <Upload className="w-4 h-4 text-gray-600" />
        </button>
      )}
    </div>
  );
}

interface MagazineUrlCardProps {
  data: PhotocardData;
  isGenerating?: boolean;
  background?: BackgroundOptions;
  id?: string;
  fullSize?: boolean;
  frameBorderColor?: string;
  frameBorderThickness?: number;
  adBannerImage?: string | null;
  adBannerZoom?: number;
  adBannerPosition?: { x: number; y: number };
  fontStyles?: CardFontStyles;
  visibilitySettings?: VisibilitySettings;
  isLogoFavicon?: boolean;
  isDragMode?: boolean;
  onVisibilityChange?: (settings: any) => void;
  onLogoUpload?: (file: File) => void;
  onFaviconUpload?: (file: File) => void;
}

// Helper function to lighten a color by a percentage
function lightenColor(color: string, percent: number): string {
  let r = 0, g = 0, b = 0;
  
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } else if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g);
    if (match) {
      r = parseInt(match[0]);
      g = parseInt(match[1]);
      b = parseInt(match[2]);
    }
  }
  
  // Lighten by moving towards 255
  r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
  g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
  b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));
  
  return `rgb(${r}, ${g}, ${b})`;
}

// Helper function to check if a color is light or dark
function isLightColor(color: string): boolean {
  // Convert hex to RGB
  let r = 0, g = 0, b = 0;
  
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } else if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g);
    if (match) {
      r = parseInt(match[0]);
      g = parseInt(match[1]);
      b = parseInt(match[2]);
    }
  }
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

// Helper function to generate text shadow based on preset
function getTextShadow(preset: string, angle: number = 135, textColor: string = '#ffffff'): string {
  if (preset === "none" || !preset) return "none";
  
  // Convert angle to radians for calculating x and y offsets
  const angleRad = (angle * Math.PI) / 180;
  const distance = 2; // Base distance for shadows
  
  const offsetX = Math.cos(angleRad) * distance;
  const offsetY = Math.sin(angleRad) * distance;
  
  // Determine if text is light or dark to choose appropriate shadow/glow color
  const isLight = isLightColor(textColor);
  
  switch (preset) {
    case "soft":
      // Dark shadow for light text, light glow for dark text
      return isLight 
        ? `${offsetX}px ${offsetY}px 4px rgba(0, 0, 0, 0.4)`
        : `${offsetX}px ${offsetY}px 4px rgba(255, 255, 255, 0.4)`;
    case "hard":
      return isLight
        ? `${offsetX * 1.5}px ${offsetY * 1.5}px 0px rgba(0, 0, 0, 0.8)`
        : `${offsetX * 1.5}px ${offsetY * 1.5}px 0px rgba(255, 255, 255, 0.8)`;
    case "glow":
      // Glow effect - opposite color halo
      return isLight
        ? `0px 0px 8px rgba(0, 0, 0, 0.6), 0px 0px 16px rgba(0, 0, 0, 0.4)`
        : `0px 0px 8px rgba(255, 255, 255, 0.8), 0px 0px 16px rgba(255, 255, 255, 0.5)`;
    case "outline":
      return isLight
        ? `
        ${offsetX}px ${offsetY}px 0px rgba(0, 0, 0, 0.9),
        ${-offsetX}px ${-offsetY}px 0px rgba(0, 0, 0, 0.9),
        ${offsetY}px ${-offsetX}px 0px rgba(0, 0, 0, 0.9),
        ${-offsetY}px ${offsetX}px 0px rgba(0, 0, 0, 0.9)
      `.trim()
        : `
        ${offsetX}px ${offsetY}px 0px rgba(255, 255, 255, 0.9),
        ${-offsetX}px ${-offsetY}px 0px rgba(255, 255, 255, 0.9),
        ${offsetY}px ${-offsetX}px 0px rgba(255, 255, 255, 0.9),
        ${-offsetY}px ${offsetX}px 0px rgba(255, 255, 255, 0.9)
      `.trim();
    default:
      return "none";
  }
}

// Helper function to generate text stroke using text-shadow for better quality
function getTextStroke(width: number, color: string): string {
  if (!width || width === 0) return "none";
  
  // Create multiple shadows in a circle to form uniform stroke
  const shadows: string[] = [];
  const steps = 8; // Number of shadows to create circular stroke
  
  for (let i = 0; i < steps; i++) {
    const angle = (i * 2 * Math.PI) / steps;
    const offsetX = Math.cos(angle) * width;
    const offsetY = Math.sin(angle) * width;
    shadows.push(`${offsetX.toFixed(2)}px ${offsetY.toFixed(2)}px 0px ${color}`);
  }
  
  return shadows.join(", ");
}

export default function MagazineUrlCard({
  data,
  isGenerating,
  background,
  id = "photocard",
  fullSize = false,
  frameBorderColor = "#dc2626",
  frameBorderThickness = 5,
  adBannerImage = null,
  adBannerZoom = 100,
  adBannerPosition = { x: 0, y: 0 },
  fontStyles,
  visibilitySettings = {
    showWeek: true,
    showDate: true,
    showLogo: true,
    showQrCode: true,
    showTitle: true,
    showAdBanner: false, 
  },
  isLogoFavicon = false,
  isDragMode = false,
  onVisibilityChange,
  onLogoUpload,
  onFaviconUpload,
}: MagazineUrlCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [selectedElement, setSelectedElement] = useState<{ id: string; position: { x: number; y: number } } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Click outside handler to close floating menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectedElement) {
        setSelectedElement(null);
      }
    };

    if (selectedElement) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [selectedElement]);

  // Handle element click to show floating menu
  const handleElementClick = (elementId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setSelectedElement({
      id: elementId,
      position: {
        x: rect.left + rect.width + 5,
        y: rect.top,
      },
    });
  };

  // Hide selected element
  const handleHideElement = () => {
    if (!selectedElement || !onVisibilityChange) return;
    const elementId = selectedElement.id;
    
    const newSettings = { ...visibilitySettings };
    
    if (elementId === 'logo') {
      newSettings.showLogo = !newSettings.showLogo;
    } else if (elementId === 'favicon') {
      // For favicon, we can toggle logo visibility or handle separately
      // Since favicon is part of the magazine design, we'll just close the menu
      setSelectedElement(null);
      return;
    }
    
    onVisibilityChange(newSettings);
    setSelectedElement(null);
  };

  // Reset element to default (clear uploaded image)
  const handleClearElement = () => {
    if (!selectedElement) return;
    // This would reset the logo/favicon to default
    // Implementation depends on how the parent handles defaults
    setSelectedElement(null);
  };

  // Upload new asset for element
  const handleUploadElement = () => {
    if (!selectedElement) return;
    const elementId = selectedElement.id;
    
    if (elementId === 'logo' && onLogoUpload) {
      fileInputRef.current?.click();
    } else if (elementId === 'favicon' && onFaviconUpload) {
      faviconInputRef.current?.click();
    }
    setSelectedElement(null);
  };

  useEffect(() => {
    if (data.url) {
      QRCode.toDataURL(data.url, {
        width: 120,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      }).then(setQrCodeUrl);
    }
  }, [data.url]);

  const getBengaliDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return now.toLocaleDateString("bn-BD", options);
  };

  const getBengaliWeekday = () => {
    const days = [
      "রবিবার",
      "সোমবার",
      "মঙ্গলবার",
      "বুধবার",
      "বৃহস্পতিবার",
      "শুক্রবার",
      "শনিবার",
    ];
    return days[new Date().getDay()];
  };

  // Get main background color
  const getMainColor = () => {
    // Treat app default red as "no color" for magazine theme
    if (!background || (!background.color && !background.gradientFrom) || background.color === "#dc2626") return "#9ca3af"; // default gray
    if (background.type === "gradient" && background.gradientFrom)
      return background.gradientFrom;
    return background.color || "#9ca3af";
  };

  const getBackgroundStyle = () => {
    // Default: white left, gray right - if no background, no color/gradient set, or app default red
    if (!background || (!background.color && !background.gradientFrom) || background.color === "#dc2626") {
      return {
        backgroundImage: `linear-gradient(to right, #FFFFFF 0%, #FFFFFF 50%, #e9e9e9 50%, #e9e9e9 100%)`,
      };
    }
    
    const mainColor = getMainColor();
    const lightColor = lightenColor(mainColor, 60); // 60% lighter
    
    // Two-tone split background: left side lighter, right side main color
    return {
      backgroundImage: `linear-gradient(to right, ${lightColor} 0%, ${lightColor} 50%, ${mainColor} 50%, ${mainColor} 100%)`,
    };
  };

  const getPatternStyle = () => {
    if (!background?.pattern || background.pattern === "none") return {};

    const color = background.patternColor || "#000000";
    const opacity = background.patternOpacity || 0.1;

    let backgroundImage = "";

    switch (background.pattern) {
      case "dots":
        backgroundImage = `radial-gradient(${color} 1px, transparent 1px)`;
        return {
          backgroundImage,
          backgroundSize: "20px 20px",
          opacity,
        };
      case "lines":
        backgroundImage = `repeating-linear-gradient(45deg, ${color}, ${color} 1px, transparent 1px, transparent 10px)`;
        return {
          backgroundImage,
          opacity,
        };
      case "grid":
        backgroundImage = `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`;
        return {
          backgroundImage,
          backgroundSize: "20px 20px",
          opacity,
        };
      case "checks":
        backgroundImage = `repeating-linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%, ${color}), repeating-linear-gradient(45deg, ${color} 25%, #00000000 25%, #00000000 75%, ${color} 75%, ${color})`;
        return {
          backgroundImage,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 10px 10px",
          opacity,
        };
      case "curves":
        backgroundImage = `repeating-radial-gradient(circle at 0 0, transparent 0, ${color} 1px, transparent 2px, transparent 4px)`;
        return {
          backgroundImage,
          backgroundSize: "16px 16px",
          opacity,
        };
      case "abstract":
        backgroundImage = `radial-gradient(circle at 50% 50%, ${color} 2px, transparent 2.5px), radial-gradient(circle at 0% 0%, ${color} 2px, transparent 2.5px)`;
        return {
          backgroundImage,
          backgroundSize: "40px 40px",
          opacity,
        };
      case "custom":
        if (background.patternImage) {
          return {
            backgroundImage: `url(${background.patternImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity,
          };
        }
        return {};
      default:
        return {};
    }
  };

  return (
    <div
      id={id}
      className={
        fullSize
          ? "w-[448px] max-w-[448px] mx-auto overflow-hidden shadow-xl relative"
          : "w-full max-w-md mx-auto overflow-hidden shadow-xl relative"
      }
      style={getBackgroundStyle()}
    >
      {/* Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={getPatternStyle()}
      />

      {/* Vertical Box - Outside the image on the left */}
      <div 
        className="absolute left-10 top-0 z-20"
        style={{
          width: "40px",
          height: "97px",
          backgroundColor: frameBorderColor,
        }}
      />

      {/* Circle with Favicon - Near vertical box, half overlapping image */}
      <div className="absolute left-15 top-[70px] -translate-x-1/2 z-30">
        <div 
          className={`relative bg-white rounded-full border-2 shadow-lg flex items-center justify-center ${
            isDragMode 
              ? 'cursor-pointer ring-2 ring-blue-500 ring-opacity-50 hover:ring-blue-600 hover:ring-opacity-70 transition-all border-blue-500' 
              : 'border-gray-200'
          }`}
          style={{
            width: "45px",
            height: "45px",
          }}
          onClick={isDragMode ? (e) => handleElementClick('favicon', e) : undefined}
        >
          {data.favicon ? (
            <img
              src={getProxiedImageUrl(data.favicon)}
              alt="Favicon"
              className="w-10 h-10 object-cover rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-icon.png";
              }}
            />
          ) : (
            <svg
              className="w-4 h-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          )}
          
          {/* Visual indicator button when drag mode is on */}
          {isDragMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleElementClick('favicon', e);
              }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors z-10 text-[10px]"
            >
              ⋮
            </button>
          )}
        </div>
      </div>

      {/* Date & Week - Positioned beside decorative element */}
      {(visibilitySettings.showWeek || visibilitySettings.showDate) && (
        <div className="absolute left-22 top-14 z-20">
          <div className="flex flex-col justify-start">
            {visibilitySettings.showWeek && (
              <div
                className="text-black font-noto-bengali tracking-tight leading-tight"
                style={{
                  fontFamily: fontStyles?.week.fontFamily || "Noto Sans Bengali",
                  fontSize: fontStyles?.week.fontSize || "14px",
                  fontWeight: fontStyles?.week.fontWeight || "500",
                  color: fontStyles?.week.color || "#000000",
                }}
              >
                {getBengaliWeekday()}
              </div>
            )}
            {visibilitySettings.showDate && (
              <div
                className="text-black font-noto-bengali tracking-tight leading-tight -mt-0.5"
                style={{
                  fontFamily: fontStyles?.date?.fontFamily || "Noto Sans Bengali",
                  fontSize: fontStyles?.date?.fontSize || "14px",
                  fontWeight: fontStyles?.date?.fontWeight || "400",
                  color: fontStyles?.date?.color || "#000000",
                }}
              >
                {getBengaliDate()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 px-6 pt-8 pb-6">
        {/* Top Section: Logo on Right */}
        <div className="flex justify-end items-start mb-4 min-h-[48px]">
          {/* Right Side: Logo - Rectangle */}
          {visibilitySettings.showLogo && (
            <div 
              className={`flex items-center relative ${
                isDragMode 
                  ? 'cursor-pointer ring-2 ring-blue-500 ring-opacity-50 hover:ring-blue-600 hover:ring-opacity-70 transition-all rounded-lg p-1' 
                  : ''
              }`}
              onClick={isDragMode ? (e) => handleElementClick('logo', e) : undefined}
            >
              {data.logo ? (
                // When logo exists, show it directly without wrapper - larger size
                <img
                  src={getProxiedImageUrl(data.logo)}
                  alt="Site logo"
                  className="object-contain w-auto h-auto max-w-[160px] max-h-24"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder-icon.png";
                  }}
                />
              ) : (
                // When no logo (placeholder), show with wrapper
                <div
                  className={`bg-white border border-gray-200 p-2 min-w-[60px] min-h-[30px] shadow-lg flex items-center justify-center ${
                    isLogoFavicon ? "rounded-full" : "rounded-lg"
                  }`}
                >
                  <svg
                    className="w-6 h-6 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              
              {/* Visual indicator button when drag mode is on */}
              {isDragMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleElementClick('logo', e);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors z-10"
                  style={{ fontSize: '12px' }}
                >
                  ⋮
                </button>
              )}
            </div>
          )}
        </div>

        {/* Image - Inside card with rounded corners */}
        <div
          className="w-full h-[240px] aspect-video bg-white overflow-hidden relative rounded-3xl"
          style={{
            border: `${frameBorderThickness}px solid ${frameBorderColor}`,
          }}
        >
        {data.image ? (
          <img
            src={getProxiedImageUrl(data.image)}
            alt="Article image"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
            }}
          />
        ) : (
          <div className="w-full h-full bg-white flex flex-col items-center justify-center gap-2">
            <svg
              className="w-12 h-12 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-gray-400 text-sm font-inter">No Image</span>
          </div>
        )}
        </div>
      
        {/* Content below image */}
        <div className="pt-4 pb-2 relative">
        {/* Title */}
        {visibilitySettings.showTitle && (
          <h2
            className="text-black font-noto-bengali text-center leading-tight mb-3 px-2 py-1"
            style={{
              fontFamily: fontStyles?.headline.fontFamily || "Noto Sans Bengali",
              fontSize: fontStyles?.headline.fontSize || "24px",
              fontWeight: fontStyles?.headline.fontWeight || "700",
              color: fontStyles?.headline.color || "#000000",
              textAlign: fontStyles?.headline.textAlign || "center",
              letterSpacing: fontStyles?.headline.letterSpacing || "0px",
              textShadow: (() => {
                const textColor = fontStyles?.headline.color || "#000000";
                const shadow = getTextShadow(
                  fontStyles?.headline.textShadow?.preset || "none",
                  fontStyles?.headline.textShadow?.angle || 135,
                  textColor
                );
                const stroke = getTextStroke(
                  fontStyles?.headline.textStroke?.width || 0,
                  fontStyles?.headline.textStroke?.color || "#000000"
                );
                
                // Combine both effects
                if (shadow !== "none" && stroke !== "none") {
                  return `${stroke}, ${shadow}`;
                } else if (stroke !== "none") {
                  return stroke;
                } else {
                  return shadow;
                }
              })(),
            } as React.CSSProperties}
          >
            {data.title}
          </h2>
        )}

        {/* QR + CTA wrapper - visually shifted down without affecting layout */}
        <div className="relative">
          <div className="transform translate-y-2">
            {/* QR Code - Absolutely positioned (doesn't affect layout) */}
            {visibilitySettings.showQrCode && qrCodeUrl && (
              <div className="absolute bottom-0 left-0 bg-white p-1 rounded-lg z-10 transform translate-y-4">
                <img src={qrCodeUrl} alt="QR Code" className="w-10 h-10" />
              </div>
            )}

            {/* CTA - Perfectly centered with Decorative Balls on both sides */}
            <div className="flex items-center justify-center gap-1.5">
              {/* Left Decorative Balls - 3 balls with increasing sizes */}
              <div 
                className="rounded-full flex-shrink-0"
                style={{
                  width: "9px",
                  height: "9px",
                  backgroundColor: frameBorderColor,
                }}
              />
              <div 
                className="rounded-full flex-shrink-0"
                style={{
                  width: "11px",
                  height: "11px",
                  backgroundColor: frameBorderColor,
                }}
              />
              <div 
                className="rounded-full flex-shrink-0"
                style={{
                  width: "13px",
                  height: "13px",
                  backgroundColor: frameBorderColor,
                }}
              />

              {/* CTA Box */}
              <div 
                className="flex items-center justify-center rounded-sm px-2 py-0.5"
                style={{
                  backgroundColor: frameBorderColor,
                  height: "26px",
                }}
              >
                <p 
                  className="font-noto-bengali text-xs font-semibold whitespace-nowrap"
                  style={{
                    color: "#FFFFFF",
                  }}
                >
                  বিস্তারিত কমেন্টের লিংকে
                </p>
              </div>

              {/* Right Decorative Balls - 3 balls with decreasing sizes */}
              <div 
                className="rounded-full flex-shrink-0"
                style={{
                  width: "13px",
                  height: "13px",
                  backgroundColor: frameBorderColor,
                }}
              />
              <div 
                className="rounded-full flex-shrink-0"
                style={{
                  width: "11px",
                  height: "11px",
                  backgroundColor: frameBorderColor,
                }}
              />
              <div 
                className="rounded-full flex-shrink-0"
                style={{
                  width: "9px",
                  height: "9px",
                  backgroundColor: frameBorderColor,
                }}
              />
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Ad Banner - Full width at bottom */}
      {visibilitySettings?.showAdBanner && adBannerImage && (
        <div className="w-full relative z-10 overflow-hidden" style={{ height: "60px" }}>
          <img
            src={adBannerImage}
            alt="Advertisement"
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              transform: `translate(-50%, -50%) translate(${adBannerPosition?.x || 0}px, ${adBannerPosition?.y || 0}px) scale(${adBannerZoom / 100})`,
              transformOrigin: 'center center',
              maxWidth: 'none',
              maxHeight: 'none',
              width: 'auto',
              height: 'auto',
              minWidth: '100%',
              minHeight: '100%'
            }}
          />
        </div>
      )}
      {visibilitySettings?.showAdBanner && !adBannerImage && !isGenerating && (
        <div
          className="w-full bg-[#e8dcc8] border-2 border-dashed border-[#d4c4b0] flex items-center justify-center relative z-10"
          style={{ height: "80px" }}
        >
          <span className="text-[#5d4e37] text-xs font-inter">
            Ad Banner Area (80px height)
          </span>
        </div>
      )}

      {/* Floating Menu for selected element */}
      {selectedElement && isDragMode && (
        <FloatingMenu
          elementId={selectedElement.id}
          elementType={selectedElement.id}
          onHide={handleHideElement}
          onClear={handleClearElement}
          onUpload={(selectedElement.id === 'logo' || selectedElement.id === 'favicon') ? handleUploadElement : undefined}
          position={selectedElement.position}
          isVisible={true}
        />
      )}

      {/* Hidden file input for logo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onLogoUpload) {
            onLogoUpload(file);
          }
          e.target.value = '';
        }}
      />

      {/* Hidden file input for favicon upload */}
      <input
        ref={faviconInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onFaviconUpload) {
            onFaviconUpload(file);
          }
          e.target.value = '';
        }}
      />
    </div>
  );
}
