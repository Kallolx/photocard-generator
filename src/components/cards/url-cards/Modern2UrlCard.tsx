"use client";

import { PhotocardData, BackgroundOptions, CardFontStyles, VisibilitySettings } from "@/types";
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
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
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
    transform: isOver && !isDragging ? 'scale(1.05)' : 'scale(1)',
    transition: 'all 0.2s ease',
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
      className={`relative ${isDragMode && !disabled ? 'ring-2 ring-blue-500 ring-opacity-50 rounded p-1' : ''} ${isOver && !isDragging ? 'ring-4 ring-green-500 ring-opacity-70' : ''}`}
    >
      <div {...listeners} {...attributes} style={{ cursor: disabled ? 'default' : 'move' }}>
        {children}
      </div>
      {isDragMode && !disabled && (
        <button
          onClick={handleClick}
          className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors z-10"
          style={{ fontSize: '12px' }}
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
  isLogoFavicon?: boolean;
  isDragMode?: boolean;
  elementLayout?: {
    topLeft: 'logo' | 'dateWeek' | 'qrCode' | 'cta' | 'favicon';
    topRight: 'logo' | 'dateWeek' | 'qrCode' | 'cta' | 'favicon';
    bottomLeft: 'logo' | 'dateWeek' | 'qrCode' | 'cta' | 'favicon';
    bottomRight: 'logo' | 'dateWeek' | 'qrCode' | 'cta' | 'favicon';
    center: 'logo' | 'dateWeek' | 'qrCode' | 'cta' | 'favicon';
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
  fontStyles,
  visibilitySettings = {
    showWeek: true,
    showDate: true,
    showLogo: true,
    showQrCode: true,
    showTitle: true,
  },
  isLogoFavicon = false,
  isDragMode = false,
  elementLayout = {
    topLeft: 'logo',
    topRight: 'dateWeek',
    bottomLeft: 'qrCode',
    bottomRight: 'cta',
    center: 'favicon',
  },
  onLayoutChange,
  onVisibilityChange,
  onLogoUpload,
  onFaviconUpload,
  onRestoreDefaults,
}: Modern2UrlCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [activeId, setActiveId] = useState<string | null>(null);
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
    
    if (elementId === 'logo') {
      newSettings.showLogo = !newSettings.showLogo;
    } else if (elementId === 'dateWeek') {
      newSettings.showWeek = !newSettings.showWeek;
      newSettings.showDate = !newSettings.showDate;
    } else if (elementId === 'qrCode') {
      newSettings.showQrCode = !newSettings.showQrCode;
    } else if (elementId === 'cta') {
      newSettings.showTitle = !newSettings.showTitle;
    } else if (elementId === 'favicon') {
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
      topLeft: 'logo' as const,
      topRight: 'dateWeek' as const,
      bottomLeft: 'qrCode' as const,
      bottomRight: 'cta' as const,
      center: 'favicon' as const,
    };
    
    onLayoutChange(defaultLayout);
    setSelectedElement(null);
  };

  // Upload new asset for element
  const handleUploadElement = () => {
    if (!selectedElement) return;
    const elementId = selectedElement.id;
    
    // Allow upload for logo
    if (elementId === 'logo' && onLogoUpload) {
      fileInputRef.current?.click();
    } else if (elementId === 'favicon' && onFaviconUpload) {
      faviconInputRef.current?.click();
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
        return background.patternImage
          ? {
              backgroundImage: `url(${background.patternImage})`,
              backgroundSize: "cover",
              backgroundRepeat: "repeat",
              opacity,
            }
          : {};
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

  const renderElement = (elementType: 'logo' | 'dateWeek' | 'qrCode' | 'cta' | 'favicon') => {
    switch (elementType) {
      case 'logo':
        if (!visibilitySettings.showLogo) return null;
        return (
          <DraggableSwappable 
            id="logo" 
            disabled={!isDragMode} 
            isDragMode={isDragMode}
            onClick={(e) => handleElementClick('logo', e)}
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
      
      case 'dateWeek':
        if (!visibilitySettings.showWeek && !visibilitySettings.showDate) return null;
        return (
          <DraggableSwappable 
            id="dateWeek" 
            disabled={!isDragMode} 
            isDragMode={isDragMode}
            onClick={(e) => handleElementClick('dateWeek', e)}
          >
            <div
              className="text-white font-noto-bengali tracking-wide px-3 py-1 rounded shadow-lg"
              style={{
                ...getBackgroundStyle(),
                fontFamily: fontStyles?.week.fontFamily || "Noto Sans Bengali",
                fontSize: fontStyles?.week.fontSize || "14px",
                fontWeight: fontStyles?.week.fontWeight || "500",
                color: fontStyles?.week.color || "#FFFFFF",
              }}
            >
              {visibilitySettings.showWeek && getBengaliWeekday()}
              {visibilitySettings.showWeek && visibilitySettings.showDate && " | "}
              {visibilitySettings.showDate && getBengaliDate()}
            </div>
          </DraggableSwappable>
        );
      
      case 'qrCode':
        if (!visibilitySettings.showQrCode || !qrCodeUrl) return null;
        return (
          <DraggableSwappable 
            id="qrCode" 
            disabled={!isDragMode} 
            isDragMode={isDragMode}
            onClick={(e) => handleElementClick('qrCode', e)}
          >
            <div className="bg-white p-1 rounded-lg flex-shrink-0">
              <img src={qrCodeUrl} alt="QR Code" className="w-12 h-12" />
            </div>
          </DraggableSwappable>
        );
      
      case 'cta':
        return (
          <DraggableSwappable 
            id="cta" 
            disabled={!isDragMode} 
            isDragMode={isDragMode}
            onClick={(e) => handleElementClick('cta', e)}
          >
            <div className="bg-white border border-gray-300 py-.5 px-3 text-center max-w-[230px] rounded-sm">
              <p className="font-noto-bengali text-md font-bold text-gray-900">
                বিস্তারিত{" "}
                <span style={{ color: getHighlightColor() }}>
                  কমেন্টের লিংকে
                </span>
              </p>
            </div>
          </DraggableSwappable>
        );
      
      case 'favicon':
        return (
          <DraggableSwappable 
            id="favicon" 
            disabled={!isDragMode} 
            isDragMode={isDragMode}
            onClick={(e) => handleElementClick('favicon', e)}
          >
            <div className="w-12 h-12 bg-gray-100 border-4 border-white rounded-full shadow-xl flex items-center justify-center overflow-hidden">
              {data.favicon ? (
                <img
                  src={getProxiedImageUrl(data.favicon)}
                  alt="Favicon"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-icon.png";
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
      case 'logo':
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
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
          </div>
        );
      case 'dateWeek':
        return (
          <div className="text-white font-noto-bengali tracking-wide px-3 py-1 rounded shadow-lg" style={{
            ...getBackgroundStyle(),
            fontFamily: fontStyles?.week.fontFamily || "Noto Sans Bengali",
            fontSize: fontStyles?.week.fontSize || "14px",
            fontWeight: fontStyles?.week.fontWeight || "500",
            color: fontStyles?.week.color || "#FFFFFF",
          }}>
            {visibilitySettings.showWeek && getBengaliWeekday()}
            {visibilitySettings.showWeek && visibilitySettings.showDate && " | "}
            {visibilitySettings.showDate && getBengaliDate()}
          </div>
        );
      case 'qrCode':
        return (
          <div className="bg-white p-1 rounded-lg flex-shrink-0">
            <img src={qrCodeUrl} alt="QR Code" className="w-12 h-12" />
          </div>
        );
      case 'cta':
        return (
          <div className="bg-white border border-gray-300 py-.5 px-3 text-center max-w-[230px] rounded-sm">
            <p className="font-noto-bengali text-md font-bold text-gray-900">
              বিস্তারিত <span style={{ color: getHighlightColor() }}>কমেন্টের লিংকে</span>
            </p>
          </div>
        );
      case 'favicon':
        return (
          <div className="w-12 h-12 bg-gray-100 border-4 border-white rounded-full shadow-xl flex items-center justify-center overflow-hidden">
            {data.favicon ? (
              <img
                src={getProxiedImageUrl(data.favicon)}
                alt="Favicon"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
              <span className="text-gray-400 text-sm font-inter">No Image</span>
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
      <div className="absolute left-1/2 transform -translate-x-1/2 z-50" style={{ top: '240px', marginTop: '16px' }}>
        {renderElement(elementLayout.center)}
      </div>

      {/* Content below image */}
      <div className="px-6 pt-2 pb-3 relative z-10">
        {/* Title */}
        {visibilitySettings.showTitle && (
          <h2
            className="text-white font-noto-bengali text-center leading-tight mb-4 px-2 py-1 mt-6"
            style={{
              fontFamily: fontStyles?.headline.fontFamily || "Noto Sans Bengali",
              fontSize: fontStyles?.headline.fontSize || "24px",
              fontWeight: fontStyles?.headline.fontWeight || "700",
              color: fontStyles?.headline.color || "#FFFFFF",
              textAlign: fontStyles?.headline.textAlign || "center",
              letterSpacing: fontStyles?.headline.letterSpacing || "0px",
            } as React.CSSProperties}
          >
            {data.title}
          </h2>
        )}

        {/* QR Code and CTA */}
        <div className="flex items-center justify-between gap-4">
          {/* Bottom Left Slot */}
          {renderElement(elementLayout.bottomLeft)}

          {/* Bottom Right Slot */}
          <div className="ml-auto">
            {renderElement(elementLayout.bottomRight)}
          </div>
        </div>
      </div>

      {/* Ad Banner - Full width at bottom - EXACT COPY */}
      {adBannerImage && (
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
      {!adBannerImage && !isGenerating && (
        <div
          className="w-full bg-[#e8dcc8] border-2 border-dashed border-[#d4c4b0] flex items-center justify-center relative z-10"
          style={{ height: "60px" }}
        >
          <span className="text-[#5d4e37] text-xs font-inter">
            Ad Banner Area (60px height)
          </span>
        </div>
      )}
    </div>
    
    {/* Drag Overlay - shows the element being dragged */}
    <DragOverlay dropAnimation={null}>
      {activeId ? (
        <div style={{ cursor: 'grabbing', opacity: 0.9 }}>
          {renderDragOverlay()}
        </div>
      ) : null}
    </DragOverlay>

    {/* Floating Menu for selected element */}
    {selectedElement && isDragMode && (
      <FloatingMenu
        elementId={selectedElement.id}
        elementType={selectedElement.id.replace(/\d+$/, '')}
        onHide={handleHideElement}
        onClear={handleClearElement}
        onUpload={(selectedElement.id === 'logo' || selectedElement.id === 'favicon') ? handleUploadElement : undefined}
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
        // Reset input value so the same file can be selected again
        e.target.value = '';
      }}
    />
  </DndContext>
  );
}