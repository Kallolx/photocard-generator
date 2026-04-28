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

interface Modern2UrlCardProps {
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
    topLeft: "logo" | "dateWeek" | "qrCode" | "cta" | "favicon";
    topRight: "logo" | "dateWeek" | "qrCode" | "cta" | "favicon";
    bottomLeft: "logo" | "dateWeek" | "qrCode" | "cta" | "favicon";
    bottomRight: "logo" | "dateWeek" | "qrCode" | "cta" | "favicon";
    center: "logo" | "dateWeek" | "qrCode" | "cta" | "favicon";
  };
  onLayoutChange?: (layout: any) => void;
  onVisibilityChange?: (settings: any) => void;
  onLogoUpload?: (file: File) => void;
  onFaviconUpload?: (file: File) => void;
  onRestoreDefaults?: () => void;
}

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

export default function Modern2UrlCard({
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
    topLeft: "logo",
    topRight: "dateWeek",
    bottomLeft: "qrCode",
    bottomRight: "cta",
    center: "favicon",
  },
  onLayoutChange,
  onVisibilityChange,
  onLogoUpload,
  onFaviconUpload,
  onRestoreDefaults,
}: Modern2UrlCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<{
    id: string;
    position: { x: number; y: number };
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

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
    } else if (elementId === "favicon") {
      // Favicon doesn't have a visibility setting - just close menu
      setSelectedElement(null);
      return;
    }

    onVisibilityChange(newSettings);
    setSelectedElement(null);
  };

  // Reset element to default position
  const handleClearElement = () => {
    if (!selectedElement || !onLayoutChange) return;

    // Reset to default layout
    const defaultLayout = {
      topLeft: "logo" as const,
      topRight: "dateWeek" as const,
      bottomLeft: "qrCode" as const,
      bottomRight: "cta" as const,
      center: "favicon" as const,
    };

    onLayoutChange(defaultLayout);
    setSelectedElement(null);
  };

  // Upload new asset for element
  const handleUploadElement = () => {
    if (!selectedElement) return;
    const elementId = selectedElement.id;

    // Allow upload for logo
    if (elementId === "logo" && onLogoUpload) {
      fileInputRef.current?.click();
    } else if (elementId === "favicon" && onFaviconUpload) {
      faviconInputRef.current?.click();
    }
    setSelectedElement(null);
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

  // Generate QR code whenever the URL changes
  useEffect(() => {
    if (data.url) {
      QRCode.toDataURL(data.url, {
        errorCorrectionLevel: "M",
        type: "image/png",
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        width: 200,
      }).then(setQrCodeUrl);
    }
  }, [data.url]);

  // EXACT COPY of background functions from ModernUrlCard
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

  // Get the background color for highlighted text (used in CTA)
  const getHighlightColor = () => {
    if (!background) return "#8b6834";
    if (background.type === "gradient" && background.gradientFrom)
      return background.gradientFrom;
    return background.color;
  };

  const siteNameOnLeft =
    elementLayout.bottomLeft === "qrCode" &&
    !visibilitySettings.showQrCode &&
    !!(data.siteName || data.url);

  const renderElement = (
    elementType: "logo" | "dateWeek" | "qrCode" | "cta" | "favicon",
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
                className={`bg-white border border-gray-200 p-2 min-w-[60px] min-h-[30px] shadow-lg flex items-center justify-center ${
                  isLogoFavicon ? "rounded-full" : "rounded-lg"
                }`}
              >
                {data.logo ? (
                  <img
                    src={getProxiedImageUrl(data.logo)}
                    alt="Site logo"
                    className="object-contain w-auto h-auto max-w-[100px] max-h-8"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-icon.png";
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
              className="text-white tracking-wide px-3 py-1 rounded shadow-lg"
              style={{
                ...getBackgroundStyle(),
                fontFamily: fontStyles?.week.fontFamily || "Noto Serif Bengali",
                fontSize: fontStyles?.week.fontSize || "14px",
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
            <div className="bg-white p-1 rounded-lg flex-shrink-0">
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

      case "favicon":
        return (
          <DraggableSwappable
            id="favicon"
            disabled={!isDragMode}
            isDragMode={isDragMode}
            onClick={(e) => handleElementClick("favicon", e)}
          >
            <div className="w-12 h-12 bg-gray-100 border-4 border-white rounded-full shadow-xl flex items-center justify-center overflow-hidden">
              {data.favicon ? (
                <img
                  src={getProxiedImageUrl(data.favicon)}
                  alt="Favicon"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder-icon.png";
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

      default:
        return null;
    }
  };

  const renderDragOverlay = () => {
    if (!activeId) return null;

    switch (activeId) {
      case "logo":
        return (
          <div className="flex items-center">
            <div
              className={`bg-white border border-gray-200 p-2 min-w-[60px] min-h-[30px] shadow-lg flex items-center justify-center ${
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
        );
      case "dateWeek":
        return (
          <div
            className="text-white tracking-wide px-3 py-1 rounded shadow-lg"
            style={{
              ...getBackgroundStyle(),
              fontFamily: fontStyles?.week.fontFamily || "Noto Serif Bengali",
              fontSize: fontStyles?.week.fontSize || "14px",
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
        );
      case "qrCode":
        return (
          <div className="bg-white p-1 rounded-lg flex-shrink-0">
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
      case "favicon":
        return (
          <div className="w-12 h-12 bg-gray-100 border-4 border-white rounded-full shadow-xl flex items-center justify-center overflow-hidden">
            {data.favicon ? (
              <img
                src={getProxiedImageUrl(data.favicon)}
                alt="Favicon"
                className="w-full h-full object-cover"
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
                opacity: watermark.opacity ?? 0.3,
                zIndex: 0,
                pointerEvents: "none",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  fontFamily: /[\u0980-\u09FF]/.test(watermark.text)
                    ? "Noto Serif Bengali"
                    : "DM Sans",
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

          {/* Image with overlay - Full width at top */}
          <div
            className="w-full h-[280px] aspect-video bg-white overflow-hidden relative"
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
                <span className="text-gray-400 text-sm font-inter">
                  No Image
                </span>
              </div>
            )}

            {/* Overlay: Logo and Date on top of image */}
            <div className="absolute top-0 left-0 right-0 px-6 pt-4">
              <div className="flex justify-between items-center">
                {/* Top Left Slot */}
                {renderElement(elementLayout.topLeft)}

                {/* Top Right Slot */}
                {renderElement(elementLayout.topRight)}
              </div>
            </div>
          </div>

          {/* Center Circle positioned outside image container for full visibility */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2 z-50"
            style={{ top: "240px", marginTop: "16px" }}
          >
            {renderElement(elementLayout.center)}
          </div>

          {/* Content below image */}
          <div className="px-6 pt-2 pb-3 relative z-10">
            {/* Title */}
            {visibilitySettings.showTitle && (
              <h2
                className="text-white text-center leading-tight mb-4 px-2 py-1 mt-6"
                style={
                  {
                    fontFamily:
                      fontStyles?.headline.fontFamily || "Noto Serif Bengali",
                    fontSize: fontStyles?.headline.fontSize || "24px",
                    fontWeight: fontStyles?.headline.fontWeight || "700",
                    color: fontStyles?.headline.color || "#FFFFFF",
                    textAlign: fontStyles?.headline.textAlign || "center",
                    letterSpacing: fontStyles?.headline.letterSpacing || "0px",
                  } as React.CSSProperties
                }
              >
                {data.title}
              </h2>
            )}

            {/* QR Code and CTA */}
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
        </div>

        {/* Footer bar – social/website/text items above ad banner */}
        {visibilitySettings?.showFooter !== false &&
          footerItems &&
          footerItems.length > 0 && (
            <div
              className="w-full px-4 py-2 flex items-center justify-evenly"
              style={{
                background: darkenHexColor(
                  (background?.type === "gradient"
                    ? background?.gradientFrom
                    : undefined) ||
                    background?.color ||
                    "#1a1410",
                ),
                opacity: footerOpacity / 100,
              }}
            >
              {footerItems.map((item) => (
                <div key={item.id} className="flex items-center gap-1.5">
                  {item.type !== "text" && (
                    <span className="shrink-0">
                      {item.type === "facebook" && (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          style={{
                            color:
                              footerIconColor === "colored"
                                ? "#1877f2"
                                : "#fff",
                          }}
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      )}
                      {item.type === "instagram" &&
                        (footerIconColor === "colored" ? (
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <defs>
                              <radialGradient
                                id={`ig-f-${id}`}
                                cx="30%"
                                cy="107%"
                                r="1.5"
                              >
                                <stop offset="0%" stopColor="#ffd676" />
                                <stop offset="10%" stopColor="#f9a12e" />
                                <stop offset="50%" stopColor="#e1306c" />
                                <stop offset="90%" stopColor="#833ab4" />
                              </radialGradient>
                            </defs>
                            <rect
                              width="24"
                              height="24"
                              rx="6"
                              fill={`url(#ig-f-${id})`}
                            />
                            <rect
                              x="6.5"
                              y="6.5"
                              width="11"
                              height="11"
                              rx="3"
                              stroke="#fff"
                              strokeWidth="1.5"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="2.8"
                              stroke="#fff"
                              strokeWidth="1.5"
                            />
                            <circle cx="16.3" cy="7.7" r="0.8" fill="#fff" />
                          </svg>
                        ) : (
                          <svg
                            className="w-3.5 h-3.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            style={{ color: "#fff" }}
                          >
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        ))}
                      {item.type === "youtube" && (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          style={{
                            color:
                              footerIconColor === "colored"
                                ? "#ff0000"
                                : "#fff",
                          }}
                        >
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      )}
                      {item.type === "twitter" && (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          style={{
                            color:
                              footerIconColor === "colored"
                                ? "#1d9bf0"
                                : "#fff",
                          }}
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      )}
                      {item.type === "tiktok" && (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          style={{
                            color:
                              footerIconColor === "colored"
                                ? "#EE1D52"
                                : "#fff",
                          }}
                        >
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.58a8.27 8.27 0 0 0 4.84 1.55V6.67a4.85 4.85 0 0 1-1.07.02z" />
                        </svg>
                      )}
                      {item.type === "website" && (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke={
                            footerIconColor === "colored" ? "#8b6834" : "white"
                          }
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                          />
                        </svg>
                      )}
                    </span>
                  )}
                  <span
                    style={{
                      color: fontStyles?.footer?.color || "#ffffff",
                      fontSize: fontStyles?.footer?.fontSize || "12px",
                      fontFamily: fontStyles?.footer?.fontFamily || "DM Sans",
                      fontWeight: fontStyles?.footer?.fontWeight || "600",
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}

        {/* Ad Banner - Full width at bottom - EXACT COPY */}
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
            selectedElement.id === "logo" || selectedElement.id === "favicon"
              ? handleUploadElement
              : undefined
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
