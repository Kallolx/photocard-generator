"use client";

import {
  PhotocardData,
  BackgroundOptions,
  CardFontStyles,
  VisibilitySettings,
} from "@/types";
import QRCode from "qrcode";
import { useEffect, useState, useRef } from "react";
import { getProxiedImageUrl } from "@/utils/imageProxy";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
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

interface ClassicUrlCardProps {
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
  elementLayout?: {
    topLeft: "logo" | "dateWeek" | "qrCode" | "cta";
    topRight: "logo" | "dateWeek" | "qrCode" | "cta";
    bottomLeft: "logo" | "dateWeek" | "qrCode" | "cta";
    bottomRight: "logo" | "dateWeek" | "qrCode" | "cta";
  };
  onLayoutChange?: (layout: any) => void;
  onVisibilityChange?: (settings: any) => void;
  onLogoUpload?: (file: File) => void;
  onRestoreDefaults?: () => void;
}

// Helper function to darken a color
function darkenColor(color: string, percent: number = 20): string {
  // Handle hex colors
  if (color.startsWith("#")) {
    const num = parseInt(color.replace("#", ""), 16);
    const r = Math.max(0, Math.floor((num >> 16) * (1 - percent / 100)));
    const g = Math.max(
      0,
      Math.floor(((num >> 8) & 0x00ff) * (1 - percent / 100)),
    );
    const b = Math.max(0, Math.floor((num & 0x0000ff) * (1 - percent / 100)));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  }
  // For non-hex colors, use CSS filter approach
  return color;
}

// Helper function to check if a color is light or dark
function isLightColor(color: string): boolean {
  // Convert hex to RGB
  let r = 0,
    g = 0,
    b = 0;

  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } else if (color.startsWith("rgb")) {
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
function getTextShadow(
  preset: string,
  angle: number = 135,
  textColor: string = "#ffffff",
): string {
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
    shadows.push(
      `${offsetX.toFixed(2)}px ${offsetY.toFixed(2)}px 0px ${color}`,
    );
  }

  return shadows.join(", ");
}

export default function ClassicUrlCard({
  data,
  isGenerating,
  background,
  id = "photocard",
  fullSize = false,
  frameBorderColor = "#FFFFFF",
  frameBorderThickness = 0,
  adBannerImage = null,
  adBannerZoom = 100,
  adBannerPosition = { x: 0, y: 0 },
  fontStyles,
  visibilitySettings = {
    showWeek: true,
    showDate: true,
    showLogo: true,
    showQrCode: false,
    showTitle: true,
    showAdBanner: true,
  },
  isLogoFavicon = false,
  isDragMode = false,
  elementLayout = {
    topLeft: "logo",
    topRight: "dateWeek",
    bottomLeft: "qrCode",
    bottomRight: "cta",
  },
  onLayoutChange,
  onVisibilityChange,
  onLogoUpload,
  onRestoreDefaults,
}: ClassicUrlCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<{
    id: string;
    position: { x: number; y: number };
  } | null>(null);
  const [elementInstances, setElementInstances] = useState<Record<string, any>>(
    {},
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Determine which visibility setting to toggle
    const newSettings = { ...visibilitySettings };

    if (elementId === "logo") {
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
    const elementId = selectedElement.id;

    // Reset to default layout
    const defaultLayout = {
      topLeft: "logo" as const,
      topRight: "dateWeek" as const,
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

    // Only allow upload for logo
    if (elementId === "logo" && onLogoUpload) {
      fileInputRef.current?.click();
    }
    setSelectedElement(null);
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setSelectedElement(null); // Close menu when dragging
  };

  // Handle drag end - swap positions
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Create new layout by swapping
    const newLayout = { ...elementLayout };

    // Find where activeId and overId are in the layout
    let activeSlot: keyof typeof elementLayout | null = null;
    let overSlot: keyof typeof elementLayout | null = null;

    Object.entries(elementLayout).forEach(([slot, element]) => {
      if (element === activeId) activeSlot = slot as keyof typeof elementLayout;
      if (element === overId) overSlot = slot as keyof typeof elementLayout;
    });

    // Swap them
    if (activeSlot && overSlot) {
      newLayout[activeSlot] = elementLayout[overSlot];
      newLayout[overSlot] = elementLayout[activeSlot];

      if (onLayoutChange) {
        onLayoutChange(newLayout);
      }
    }
  };

  // Render the overlay content for dragged element
  const renderDragOverlay = () => {
    if (!activeId) return null;

    switch (activeId) {
      case "logo":
        return (
          <div className="bg-white border border-gray-200 p-2 min-w-[60px] min-h-[30px] flex items-center justify-center rounded-lg shadow-2xl">
            {data.logo ? (
              <img
                src={getProxiedImageUrl(data.logo)}
                alt="Site logo"
                className="object-contain w-auto h-auto max-w-[100px] max-h-8"
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
      case "dateWeek":
        return (
          <div
            className="text-white tracking-wide text-center shadow-2xl px-3 py-2 bg-black bg-opacity-50 rounded"
            style={{
              fontFamily: fontStyles?.week.fontFamily || "Noto Serif Bengali",
              fontSize: fontStyles?.week.fontSize || "18px",
              fontWeight: fontStyles?.week.fontWeight || "500",
            }}
          >
            {visibilitySettings.showWeek && getWeekday()}
            {visibilitySettings.showWeek &&
              visibilitySettings.showDate &&
              " | "}
            {visibilitySettings.showDate && getCardDate()}
          </div>
        );
      case "qrCode":
        return (
          <div className="bg-white p-1 rounded-sm flex-shrink-0 shadow-2xl">
            <img src={qrCodeUrl} alt="QR Code" className="w-12 h-12" />
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

  // Render element based on type
  // When the QR slot is hidden, the site name migrates to that left position
  const siteNameOnLeft =
    elementLayout.bottomLeft === "qrCode" &&
    !visibilitySettings.showQrCode &&
    !!(data.siteName || data.url);

  const renderElement = (
    elementType: "logo" | "dateWeek" | "qrCode" | "cta",
  ) => {
    switch (elementType) {
      case "logo":
        if (!visibilitySettings.showLogo) return null;
        return (
          <DraggableSwappable
            id="logo"
            disabled={!isDragMode}
            isDragMode={isDragMode}
            onClick={(e) => handleElementClick("logo", e)}
          >
            <div className="flex items-center">
              <div
                className={`bg-white border border-gray-200 p-2 min-w-[60px] min-h-[30px] flex items-center justify-center ${
                  isLogoFavicon ? "rounded-full" : "rounded-lg"
                }`}
              >
                {data.logo ? (
                  <img
                    src={getProxiedImageUrl(data.logo)}
                    alt="Site logo"
                    className="object-contain w-auto h-auto max-w-[100px] max-h-8"
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
            </div>
          </DraggableSwappable>
        );

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
            <div
 className="text-white tracking-wide text-center"
              style={{
                fontFamily: fontStyles?.week.fontFamily || "Noto Serif Bengali",
                fontSize: fontStyles?.week.fontSize || "18px",
                fontWeight: fontStyles?.week.fontWeight || "500",
                color: fontStyles?.week.color || "#FFFFFF",
              }}
            >
              {visibilitySettings.showWeek && getWeekday()}
              {visibilitySettings.showWeek &&
                visibilitySettings.showDate &&
                " | "}
              {visibilitySettings.showDate && getCardDate()}
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
            <div className="bg-white p-1 rounded-sm flex-shrink-0">
              <img src={qrCodeUrl} alt="QR Code" className="w-12 h-12" />
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

  const getCardDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const lang = fontStyles?.weekDateLanguage === "english" ? "en-US" : "bn-BD";
    return now.toLocaleDateString(lang, options);
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

  const getWeekday = () => {
    if (fontStyles?.weekDateLanguage === "english") {
      return new Date().toLocaleDateString("en-US", { weekday: "long" });
    }
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

  const getBackgroundStyle = () => {
    if (!background) return { backgroundColor: "#8b6834" }; // default brown

    if (
      background.type === "gradient" &&
      background.gradientFrom &&
      background.gradientTo
    ) {
      return {
        backgroundImage: `linear-gradient(135deg, ${background.gradientFrom}, ${background.gradientTo})`,
      };
    }

    return { backgroundColor: background.color };
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
        {/* Pattern Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={getPatternStyle()}
        />

        <div className="px-6 pt-5 pb-2 relative z-10">
          {/* Header - swappable positions for all elements */}
          <div className="flex justify-between items-center mb-3">
            {/* Top Left Slot */}
            {renderElement(elementLayout.topLeft)}

            {/* Top Right Slot */}
            {renderElement(elementLayout.topRight)}
          </div>

          {/* Main image */}
          <div
            className="bg-white rounded-tl-[70px] rounded-tr-lg rounded-bl-lg rounded-br-[70px] overflow-hidden mb-2 aspect-video"
            style={{
              border: `${frameBorderThickness}px solid ${frameBorderColor}`,
            }}
          >
            {data.image ? (
              <img
                src={getProxiedImageUrl(data.image)}
                alt="Article image"
                className="w-full h-full object-cover "
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
                <span className="text-gray-400 text-sm font-inter">
                  No Image
                </span>
              </div>
            )}
          </div>

          {/* Title */}
          {visibilitySettings.showTitle && (
            <h2
              className={`text-white text-center leading-tight px-2 py-0.5 ${!visibilitySettings.showQrCode ? "mb-8" : "mb-2"}`}
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

          {/* Bottom section - swappable positions for all elements */}
          <div className="flex items-center justify-between gap-4">
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

        {/* Ad Banner - Full width at bottom */}
        {visibilitySettings?.showAdBanner && adBannerImage && (
          <div
            className="w-full relative z-10 overflow-hidden"
            style={{ height: "60px" }}
          >
            <img
              src={adBannerImage}
              alt="Advertisement"
              className="absolute top-1/2 left-1/2 pointer-events-none"
              style={{
                transform: `translate(-50%, -50%) translate(${adBannerPosition.x}px, ${adBannerPosition.y}px) scale(${adBannerZoom / 100})`,
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
              style={{ height: "80px" }}
            >
              <span className="text-[#5d4e37] text-xs font-inter">
                Ad Banner Area (80px height)
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
            selectedElement.id === "logo" ? handleUploadElement : undefined
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
    </DndContext>
  );
}
