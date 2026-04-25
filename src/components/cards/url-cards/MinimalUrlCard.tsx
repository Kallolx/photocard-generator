"use client";

import {
  PhotocardData,
  BackgroundOptions,
  CardFontStyles,
  VisibilitySettings,
  FooterItem,
  WatermarkSettings,
} from "@/types";
import { darkenHexColor } from "@/lib/utils";
import QRCode from "qrcode";
import { useEffect, useState, useRef } from "react";
import { getProxiedImageUrl } from "@/utils/imageProxy";
import { EyeOff, RotateCcw, Upload } from "lucide-react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";

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

// Draggable element that can be swapped with click handler
function DraggableSwappable({
  id,
  disabled,
  children,
  isDragMode,
  onClick,
}: {
  id: string;
  disabled: boolean;
  children: React.ReactNode;
  isDragMode: boolean;
  onClick?: (e: any) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
    disabled,
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id,
    disabled,
  });

  // Combine both refs
  const setRefs = (element: HTMLElement | null) => {
    setDragRef(element);
    setDropRef(element);
  };

  const style = {
    opacity: isDragging ? 0.3 : 1,
    transform: isOver && !isDragging ? "scale(1.05)" : "scale(1)",
    transition: "all 0.2s ease",
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragMode && onClick) {
      e.preventDefault();
      e.stopPropagation();
      onClick(e);
    }
  };

  return (
    <div
      ref={setRefs}
      style={style}
      className={`relative ${isDragMode && !disabled ? "ring-2 ring-blue-500 ring-opacity-50 rounded p-1" : ""} ${isOver && !isDragging ? "ring-4 ring-green-500 ring-opacity-70" : ""}`}
    >
      <div
        {...listeners}
        {...attributes}
        style={{ cursor: disabled ? "default" : "move" }}
      >
        {children}
      </div>
      {isDragMode && !disabled && (
        <button
          onClick={handleClick}
          className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors z-10"
          style={{ fontSize: "12px" }}
        >
          ⋮
        </button>
      )}
    </div>
  );
}

interface MinimalUrlCardProps {
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
  footerItems?: FooterItem[];
  footerOpacity?: number;
  footerIconColor?: "white" | "colored";
  watermark?: WatermarkSettings;
  isLogoFavicon?: boolean;
  isDragMode?: boolean;
  elementLayout?: {
    topLeft: "favicon" | "dateWeek" | "qrCode" | "cta";
    topRight: "favicon" | "dateWeek" | "qrCode" | "cta";
    bottomLeft: "favicon" | "dateWeek" | "qrCode" | "cta";
    bottomRight: "favicon" | "dateWeek" | "qrCode" | "cta";
  };
  onLayoutChange?: (layout: any) => void;
  onVisibilityChange?: (settings: any) => void;
  onLogoUpload?: (file: File) => void;
  onFaviconUpload?: (file: File) => void;
  onRestoreDefaults?: () => void;
}

// Helper function to get text shadow based on preset
function getTextShadow(
  preset: string,
  angle: number,
  textColor: string,
): string {
  if (preset === "none") return "none";

  const angleRad = (angle * Math.PI) / 180;
  const offsetX = Math.cos(angleRad);
  const offsetY = Math.sin(angleRad);

  switch (preset) {
    case "soft":
      return `${offsetX * 2}px ${offsetY * 2}px 4px rgba(0, 0, 0, 0.3)`;
    case "hard":
      return `${offsetX * 3}px ${offsetY * 3}px 0px rgba(0, 0, 0, 0.8)`;
    case "glow":
      return `0 0 10px ${textColor}, 0 0 20px ${textColor}, 0 0 30px ${textColor}`;
    case "outline":
      return `-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000`;
    default:
      return "none";
  }
}

// Helper function to generate text stroke using text-shadow
function getTextStroke(width: number, color: string): string {
  if (!width || width === 0) return "none";

  const shadows: string[] = [];
  const steps = 8;

  for (let i = 0; i < steps; i++) {
    const angle = (i * 2 * Math.PI) / steps;
    const offsetX = Math.cos(angle) * width;
    const offsetY = Math.sin(angle) * width;
    shadows.push(
      `${offsetX.toFixed(2)}px ${offsetY.toFixed(2)}px 0px ${color}`,
    );
  }

  return shadows.join(", ");
}

export default function MinimalUrlCard({
  data,
  isGenerating = false,
  background = { type: "solid", color: "#2c2419" },
  id = "photocard",
  fullSize = false,
  frameBorderColor = "#FFFFFF",
  frameBorderThickness = 0,
  adBannerImage = null,
  adBannerZoom = 100,
  adBannerPosition = { x: 0, y: 0 },
  footerItems = [],
  footerOpacity = 100,
  footerIconColor = "colored",
  watermark,
  fontStyles,
  visibilitySettings = {
    showWeek: true,
    showDate: true,
    showLogo: true,
    showQrCode: false,
    showTitle: true,
    showAdBanner: false,
  },
  isLogoFavicon = false,
  isDragMode = false,
  elementLayout = {
    topLeft: "dateWeek",
    topRight: "favicon",
    bottomLeft: "qrCode",
    bottomRight: "cta",
  },
  onLayoutChange,
  onVisibilityChange,
  onLogoUpload,
  onFaviconUpload,
  onRestoreDefaults,
}: MinimalUrlCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<{
    id: string;
    position: { x: number; y: number };
  } | null>(null);
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
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [selectedElement]);

  // Handle element click to show floating menu
  const handleElementClick = (elementId: string, event: any) => {
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

    if (elementId === "favicon") {
      newSettings.showLogo = !newSettings.showLogo;
    } else if (elementId === "dateWeek") {
      newSettings.showWeek = !newSettings.showWeek;
      newSettings.showDate = !newSettings.showDate;
    } else if (elementId === "qrCode") {
      newSettings.showQrCode = !newSettings.showQrCode;
    } else if (elementId === "cta") {
      newSettings.showTitle = !newSettings.showTitle;
    }

    onVisibilityChange(newSettings);
    setSelectedElement(null);
  };

  // Reset element to default position
  const handleClearElement = () => {
    if (!selectedElement || !onLayoutChange) return;

    const defaultLayout = {
      topLeft: "dateWeek" as const,
      topRight: "favicon" as const,
      bottomLeft: "qrCode" as const,
      bottomRight: "cta" as const,
    };

    onLayoutChange(defaultLayout);
    setSelectedElement(null);
  };

  // Upload new asset for element
  const handleUploadElement = () => {
    if (!selectedElement) return;
    const elementId = selectedElement.id;

    // Allow upload for favicon
    if (elementId === "favicon" && onFaviconUpload) {
      faviconInputRef.current?.click();
    }
    setSelectedElement(null);
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setSelectedElement(null);
  };

  // Handle drag end - swap positions
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const newLayout = { ...elementLayout };

    let activeSlot: keyof typeof elementLayout | null = null;
    let overSlot: keyof typeof elementLayout | null = null;

    Object.entries(elementLayout).forEach(([slot, element]) => {
      if (element === activeId) activeSlot = slot as keyof typeof elementLayout;
      if (element === overId) overSlot = slot as keyof typeof elementLayout;
    });

    if (activeSlot && overSlot) {
      newLayout[activeSlot] = elementLayout[overSlot];
      newLayout[overSlot] = elementLayout[activeSlot];

      if (onLayoutChange) {
        onLayoutChange(newLayout);
      }
    }
  };

  // Get the background color for highlighted text (used in CTA)
  const getHighlightColor = () => {
    if (!background) return "#8b6834";
    if (background.type === "gradient" && background.gradientFrom)
      return background.gradientFrom;
    return background.color;
  };

  // Extract domain from URL for site name
  const getSiteDomain = () => {
    try {
      const url = new URL(data.url);
      return url.hostname.toLowerCase().replace("www.", "");
    } catch {
      return data.siteName?.toLowerCase() || "example.com";
    }
  };

  // Generate QR Code
  useEffect(() => {
    if (data.url) {
      QRCode.toDataURL(data.url, {
        width: 200,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      }).then(setQrCodeUrl);
    }
  }, [data.url]);

  // Background styling
  const getBackgroundStyle = () => {
    if (background.type === "gradient") {
      return {
        background: `linear-gradient(135deg, ${background.gradientFrom || background.color}, ${background.gradientTo || background.color})`,
      };
    }
    return {
      background: background.color,
    };
  };

  // Get gradient for image blend - converts background color to rgba
  const getImageBlendGradient = () => {
    const baseColor =
      background.type === "gradient"
        ? background.gradientFrom || background.color
        : background.color;

    // Convert hex to RGB
    const hex = baseColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `linear-gradient(to bottom, rgba(${r}, ${g}, ${b}, 0) 0%, rgba(${r}, ${g}, ${b}, 1) 100%)`;
  };

  // Pattern overlay styling
  const getPatternStyle = () => {
    if (!background?.pattern || background.pattern === "none") return {};

    const opacity = background.patternOpacity || 0.3;
    const scale = background.patternScale || 1.0;

    switch (background.pattern) {
      case "p1":
        return {
          backgroundImage: "url(/patterns/p1.png)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          opacity,
        };
      case "p2":
        return {
          backgroundImage: "url(/patterns/p2.png)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          opacity,
        };
      case "custom":
        if (background.patternImage) {
          return {
            backgroundImage: `url(${background.patternImage})`,
            backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            opacity,
          };
        }
        return {};
      default:
        return {};
    }
  };

  const getCardDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    const lang = fontStyles?.weekDateLanguage === "english" ? "en-US" : "bn-BD";
    return now.toLocaleDateString(lang, options);
  };

  const getWeekday = () => {
    if (fontStyles?.weekDateLanguage === "english") {
      return new Date().toLocaleDateString("en-US", { weekday: "long" });
    }
    const days = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
    return days[new Date().getDay()];
  };

  // Render element based on type
  const siteNameOnLeft =
    elementLayout.bottomLeft === "qrCode" &&
    !visibilitySettings.showQrCode &&
    !!(data.siteName || data.url);

  const renderElement = (
    elementType: "favicon" | "dateWeek" | "qrCode" | "cta",
  ) => {
    switch (elementType) {
      case "dateWeek":
        if (!visibilitySettings.showWeek && !visibilitySettings.showDate)
          return null;
        return (
          <DraggableSwappable
            id="dateWeek"
            disabled={!isDragMode}
            isDragMode={isDragMode}
            onClick={(e) => handleElementClick("dateWeek", e)}
          >
            <div className="inline-flex items-center z-[2] relative">
              <div
                className="relative px-4 py-1 backdrop-blur-sm"
                style={{
                  background: "rgba(0, 0, 0, 0.4)",
                }}
              >
                {/* Top border with gap */}
                <div
                  className="absolute left-0 right-2 h-[2px] bg-white"
                  style={{
                    top: "-4px",
                    borderRadius: "2px",
                  }}
                />

                {/* Bottom border with gap */}
                <div
                  className="absolute left-0 right-2 h-[2px] bg-white"
                  style={{
                    bottom: "-4px",
                    borderRadius: "2px",
                  }}
                />

                {/* Week and Date - Single Row */}
                <div
                  className="font-bold text-left whitespace-nowrap"
                  style={{
                    fontFamily:
                      fontStyles?.week.fontFamily || "Noto Serif Bengali",
                    fontSize: fontStyles?.week.fontSize || "14px",
                    fontWeight: fontStyles?.week.fontWeight || "700",
                    color: fontStyles?.week.color || "#FFFFFF",
                    letterSpacing: fontStyles?.week.letterSpacing || "0px",
                  }}
                >
                  {visibilitySettings.showWeek && getWeekday()}
                  {visibilitySettings.showWeek &&
                    visibilitySettings.showDate &&
                    " | "}
                  {visibilitySettings.showDate && getCardDate()}
                </div>
              </div>
            </div>
          </DraggableSwappable>
        );

      case "favicon":
        if (!visibilitySettings.showLogo) return null;
        return (
          <DraggableSwappable
            id="favicon"
            disabled={!isDragMode}
            isDragMode={isDragMode}
            onClick={(e) => handleElementClick("favicon", e)}
          >
            <div className="w-12 h-12 bg-gray-100 shadow-lg rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              {data.favicon || data.logo ? (
                <img
                  src={getProxiedImageUrl(data.favicon || data.logo)}
                  alt="Favicon"
                  className="w-full h-full object-contain border-2 border-white rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder-logo.png";
                  }}
                />
              ) : (
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
              )}
            </div>
          </DraggableSwappable>
        );

      case "qrCode":
        if (!visibilitySettings.showQrCode || !qrCodeUrl) return null;
        return (
          <DraggableSwappable
            id="qrCode"
            disabled={!isDragMode}
            isDragMode={isDragMode}
            onClick={(e) => handleElementClick("qrCode", e)}
          >
            <div className="w-14 h-14 bg-white rounded-lg p-1 flex-shrink-0">
              <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
            </div>
          </DraggableSwappable>
        );

      case "cta":
        return (
          <DraggableSwappable
            id="cta"
            disabled={!isDragMode}
            isDragMode={isDragMode}
            onClick={(e) => handleElementClick("cta", e)}
          >
            <div className="flex flex-col items-end gap-1">
              {!siteNameOnLeft && (data.siteName || data.url) && (
                <p className="text-white/90 text-[9px] font-medium tracking-wide">
                  {getSiteDomain()}
                </p>
              )}
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                <p className="font-noto-bengali text-xs font-bold text-white">
                  বিস্তারিত কমেন্টের লিংকে
                </p>
              </div>
            </div>
          </DraggableSwappable>
        );

      default:
        return null;
    }
  };

  const renderDragOverlay = () => {
    if (!activeId) return null;

    switch (activeId) {
      case "dateWeek":
        return (
          <div className="inline-flex items-center z-[2] relative">
            <div
              className="relative px-4 py-1 backdrop-blur-sm"
              style={{
                background: "rgba(0, 0, 0, 0.4)",
              }}
            >
              <div
                className="absolute left-0 right-2 h-[2px] bg-white"
                style={{
                  top: "-4px",
                  borderRadius: "2px",
                }}
              />
              <div
                className="absolute left-0 right-2 h-[2px] bg-white"
                style={{
                  bottom: "-4px",
                  borderRadius: "2px",
                }}
              />
              <div
                className="font-bold text-left whitespace-nowrap"
                style={{
                  fontFamily:
                    fontStyles?.week.fontFamily || "Noto Serif Bengali",
                  fontSize: fontStyles?.week.fontSize || "14px",
                  fontWeight: fontStyles?.week.fontWeight || "700",
                  color: fontStyles?.week.color || "#FFFFFF",
                  letterSpacing: fontStyles?.week.letterSpacing || "0px",
                }}
              >
                {visibilitySettings.showWeek && getWeekday()}
                {visibilitySettings.showWeek &&
                  visibilitySettings.showDate &&
                  " | "}
                {visibilitySettings.showDate && getCardDate()}
              </div>
            </div>
          </div>
        );

      case "favicon":
        return (
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            {data.favicon || data.logo ? (
              <img
                src={getProxiedImageUrl(data.favicon || data.logo)}
                alt="Favicon"
                className="w-full h-full object-contain border-2 border-white rounded-full"
              />
            ) : (
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
            )}
          </div>
        );

      case "qrCode":
        return (
          <div className="w-14 h-14 bg-white rounded-lg p-1 flex-shrink-0">
            <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
          </div>
        );

      case "cta":
        return (
          <div className="flex flex-col items-start gap-1">
            {(data.siteName || data.url) && (
              <p className="text-white/90 text-[9px] font-medium tracking-wide">
                {getSiteDomain()}
              </p>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
              <p className="font-noto-bengali text-xs font-bold text-white">
                বিস্তারিত কমেন্টের লিংকে
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        id={id}
        className={
          fullSize
            ? "w-[448px] max-w-[448px] mx-auto overflow-hidden shadow-xl relative"
            : "w-full max-w-md mx-auto overflow-hidden shadow-xl relative"
        }
        style={getBackgroundStyle()}
      >
        <div className="relative overflow-hidden">
        {/* Pattern Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={getPatternStyle()}
        />

        {/* Brand Watermark */}
        {watermark?.text && watermark?.enabled !== false && (
          <div
            style={{
              position: "absolute",
              bottom: watermark.y ?? 0,
              left: `calc(50% + ${watermark.x ?? 0}px)`,
              transform: `translateX(-50%) rotate(${watermark.rotation ?? 0}deg)`,
              opacity: watermark.opacity ?? 0.30,
              zIndex: 0,
              pointerEvents: "none",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                fontFamily: /[\u0980-\u09FF]/.test(watermark.text) ? "Noto Serif Bengali" : "DM Sans",
                fontWeight: 800,
                letterSpacing: "-0.05em",
                fontSize: `${watermark.fontSize ?? 48}px`,
                textTransform: "uppercase",
                color: "#ffffff",
              }}
            >
              {watermark.text}
            </span>
          </div>
        )}

        {/* Top Image Section - Full width, no padding */}
        <div className="relative w-full h-[240px] overflow-hidden">
          {/* Main Image */}
          <div
            className="w-full h-full"
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
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-gray-400 text-sm font-inter">
                  No Image
                </span>
              </div>
            )}
          </div>

          {/* Gradient Overlay - Bottom half of image blends to background */}
          <div
            className="absolute left-0 right-0 bottom-0 h-[140px] pointer-events-none z-[1]"
            style={{
              background: getImageBlendGradient(),
            }}
          />

          {/* Overlay Content - Week/Date and Favicon */}
          <div className="absolute inset-0 flex justify-between items-start pt-6 pr-4 z-[2]">
            {/* Top Left Slot */}
            {renderElement(elementLayout.topLeft)}

            {/* Top Right Slot */}
            {renderElement(elementLayout.topRight)}
          </div>
        </div>

        {/* Logo Section with Complex Shape - Overlapping image and text sections */}
        {visibilitySettings.showLogo && (
          <div className="relative -mt-10 z-20 flex justify-center">
            <div className="relative w-[240px] h-[54px]">
              {/* Complex SVG Shape Background */}
              <svg
                viewBox="0 0 449 100"
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
                style={{
                  filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))",
                }}
              >
                {/* Main parallelogram */}
                <path d="M448 15H48.186L0 83H403.721L448 15Z" fill="#FFFFFF" />
                {/* Top accent */}
                <path
                  d="M35.2299 0L0 49H15.6578L43.0588 10.3158H234.866L244 0H35.2299Z"
                  fill="#FFFFFF"
                />
                {/* Bottom accent */}
                <path
                  d="M413.914 100L449 50H433.406L406.118 89.4737H215.096L206 100H413.914Z"
                  fill="#FFFFFF"
                />
              </svg>

              {/* Logo Image or Placeholder - Centered */}
              <div className="absolute inset-0 flex items-center justify-center p-3">
                {data.logo ? (
                  <img
                    src={getProxiedImageUrl(data.logo)}
                    alt="Logo"
                    className="max-w-[120px] max-h-[40px] object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-logo.png";
                    }}
                  />
                ) : (
                  <svg
                    className="w-5 h-5 text-gray-300"
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
              </div>
            </div>
          </div>
        )}

        {/* Bottom Content Section with Fade Effect */}
        <div
          className="px-6 pt-6 pb-4 relative z-10"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, ${background.type === "gradient" ? background.gradientFrom || background.color : background.color} 20%, ${background.type === "gradient" ? background.gradientTo || background.color : background.color} 100%)`,
          }}
        >
          {/* Title */}
          {visibilitySettings.showTitle && (
            <h2
              className="text-white text-center leading-tight mb-4 px-2 py-1"
              style={
                {
                  fontFamily:
                    fontStyles?.headline.fontFamily || "Noto Serif Bengali",
                  fontSize: fontStyles?.headline.fontSize || "24px",
                  fontWeight: fontStyles?.headline.fontWeight || "700",
                  color: fontStyles?.headline.color || "#FFFFFF",
                  textAlign: fontStyles?.headline.textAlign || "center",
                  letterSpacing: fontStyles?.headline.letterSpacing || "0px",
                  textShadow: (() => {
                    const textColor = fontStyles?.headline.color || "#FFFFFF";
                    const shadow = getTextShadow(
                      fontStyles?.headline.textShadow?.preset || "none",
                      fontStyles?.headline.textShadow?.angle || 135,
                      textColor,
                    );
                    const stroke = getTextStroke(
                      fontStyles?.headline.textStroke?.width || 0,
                      fontStyles?.headline.textStroke?.color || "#000000",
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
                } as React.CSSProperties
              }
            >
              {data.title}
            </h2>
          )}

          {/* Footer Row - QR Code and CTA */}
          <div className="flex justify-between items-end mt-0 gap-3">
            {/* Bottom Left Slot */}
            {siteNameOnLeft ? (
              <div className="flex items-center gap-1 text-white/90">
                <p className="font-dm-sans text-[9px] font-medium tracking-wide">
                  {getSiteDomain()}
                </p>
              </div>
            ) : (
              renderElement(elementLayout.bottomLeft)
            )}

            {/* Bottom Right Slot */}
            <div className="ml-auto">
              {renderElement(elementLayout.bottomRight)}
            </div>
          </div>
        </div>
        </div>

        {/* Footer bar – social/website/text items above ad banner */}
        {visibilitySettings?.showFooter !== false && footerItems && footerItems.length > 0 && (
          <div
            className="w-full px-4 py-2 flex items-center justify-evenly"
            style={{ background: darkenHexColor((background?.type === "gradient" ? background?.gradientFrom : undefined) || background?.color || "#1a1410"), opacity: footerOpacity / 100 }}
          >
            {footerItems.map((item) => (
              <div key={item.id} className="flex items-center gap-1.5">
                {item.type !== "text" && (
                  <span className="shrink-0">
                    {item.type === "facebook" && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#1877f2" : "#fff" }}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>}
                    {item.type === "instagram" && (footerIconColor === "colored" ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><defs><radialGradient id={`ig-f-${id}`} cx="30%" cy="107%" r="1.5"><stop offset="0%" stopColor="#ffd676" /><stop offset="10%" stopColor="#f9a12e" /><stop offset="50%" stopColor="#e1306c" /><stop offset="90%" stopColor="#833ab4" /></radialGradient></defs><rect width="24" height="24" rx="6" fill={`url(#ig-f-${id})`} /><rect x="6.5" y="6.5" width="11" height="11" rx="3" stroke="#fff" strokeWidth="1.5" /><circle cx="12" cy="12" r="2.8" stroke="#fff" strokeWidth="1.5" /><circle cx="16.3" cy="7.7" r="0.8" fill="#fff" /></svg> : <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#fff" }}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>)}
                    {item.type === "youtube" && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#ff0000" : "#fff" }}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>}
                    {item.type === "twitter" && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#1d9bf0" : "#fff" }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>}
                    {item.type === "tiktok" && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#EE1D52" : "#fff" }}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.58a8.27 8.27 0 0 0 4.84 1.55V6.67a4.85 4.85 0 0 1-1.07.02z" /></svg>}
                    {item.type === "website" && <svg className="w-3.5 h-3.5" fill="none" stroke={footerIconColor === "colored" ? "#8b6834" : "white"} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>}
                  </span>
                )}
                <span style={{ color: fontStyles?.footer?.color || "#ffffff", fontSize: fontStyles?.footer?.fontSize || "12px", fontFamily: fontStyles?.footer?.fontFamily || "DM Sans", fontWeight: fontStyles?.footer?.fontWeight || "600" }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Ad Banner - Full width at bottom, OUTSIDE the padding */}
        {visibilitySettings?.showAdBanner && adBannerImage && (
          <div
            className="w-full relative z-10 overflow-hidden"
            style={{ height: "40px" }}
          >
            <img
              src={adBannerImage}
              alt="Advertisement"
              className="absolute top-1/2 left-1/2 pointer-events-none"
              style={{
                transform: `translate(-50%, -50%) translate(${adBannerPosition?.x || 0}px, ${adBannerPosition?.y || 0}px) scale(${adBannerZoom / 100})`,
                transformOrigin: "center center",
                maxWidth: "none",
                maxHeight: "none",
                width: "auto",
                height: "auto",
                minWidth: "100%",
                minHeight: "100%",
              }}
            />
          </div>
        )}
        {visibilitySettings?.showAdBanner &&
          !adBannerImage &&
          !isGenerating && (
            <div
              className="w-full bg-[#e8dcc8] border-2 border-dashed border-[#d4c4b0] flex items-center justify-center relative z-10"
              style={{ height: "40px" }}
            >
              <span className="text-[#5d4e37] text-xs font-inter">
                Ad Banner Area (40px height)
              </span>
            </div>
          )}
      </div>

      {/* Drag Overlay - shows the element being dragged */}
      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <div style={{ cursor: "grabbing", opacity: 0.9 }}>
            {renderDragOverlay()}
          </div>
        ) : null}
      </DragOverlay>

      {/* Floating Menu for selected element */}
      {selectedElement && isDragMode && (
        <FloatingMenu
          elementId={selectedElement.id}
          elementType={selectedElement.id.replace(/\d+$/, "")}
          onHide={handleHideElement}
          onClear={handleClearElement}
          onUpload={
            selectedElement.id === "favicon" ? handleUploadElement : undefined
          }
          position={selectedElement.position}
          isVisible={true}
        />
      )}

      {/* Restore Defaults Button - shown when drag mode is active */}
      {isDragMode && onRestoreDefaults && (
        <div className="w-full flex justify-center mt-4">
          <button
            onClick={onRestoreDefaults}
            className="bg-[#2c2419] text-[#faf8f5] py-2 px-4 text-sm font-medium font-inter hover:bg-[#8b6834] focus:ring-2 focus:ring-[#8b6834] focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restore Defaults
          </button>
        </div>
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
          // Reset input value so the same file can be selected again
          e.target.value = "";
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
          // Reset input value so the same file can be selected again
          e.target.value = "";
        }}
      />
    </DndContext>
  );
}
