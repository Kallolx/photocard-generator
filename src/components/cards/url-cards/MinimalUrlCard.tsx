"use client";

import { PhotocardData, BackgroundOptions, CardFontStyles, VisibilitySettings } from "@/types";
import QRCode from "qrcode";
import { useEffect, useState, useRef } from "react";
import { getProxiedImageUrl } from "@/utils/imageProxy";
import { Globe, EyeOff, RotateCcw, Upload } from "lucide-react";
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
  fontStyles?: CardFontStyles;
  visibilitySettings?: VisibilitySettings;
  isLogoFavicon?: boolean;
  isDragMode?: boolean;
  elementLayout?: {
    topLeft: 'favicon' | 'dateWeek' | 'qrCode' | 'cta';
    topRight: 'favicon' | 'dateWeek' | 'qrCode' | 'cta';
    bottomLeft: 'favicon' | 'dateWeek' | 'qrCode' | 'cta';
    bottomRight: 'favicon' | 'dateWeek' | 'qrCode' | 'cta';
  };
  onLayoutChange?: (layout: any) => void;
  onVisibilityChange?: (settings: any) => void;
  onLogoUpload?: (file: File) => void;
  onFaviconUpload?: (file: File) => void;
  onRestoreDefaults?: () => void;
}

// Helper function to get text shadow based on preset
function getTextShadow(preset: string, angle: number, textColor: string): string {
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
    shadows.push(`${offsetX.toFixed(2)}px ${offsetY.toFixed(2)}px 0px ${color}`);
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
    topLeft: 'dateWeek',
    topRight: 'favicon',
    bottomLeft: 'qrCode',
    bottomRight: 'cta',
  },
  onLayoutChange,
  onVisibilityChange,
  onLogoUpload,
  onFaviconUpload,
  onRestoreDefaults,
}: MinimalUrlCardProps) {
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
    
    const newSettings = { ...visibilitySettings };
    
    if (elementId === 'favicon') {
      newSettings.showLogo = !newSettings.showLogo;
    } else if (elementId === 'dateWeek') {
      newSettings.showWeek = !newSettings.showWeek;
      newSettings.showDate = !newSettings.showDate;
    } else if (elementId === 'qrCode') {
      newSettings.showQrCode = !newSettings.showQrCode;
    } else if (elementId === 'cta') {
      newSettings.showTitle = !newSettings.showTitle;
    }
    
    onVisibilityChange(newSettings);
    setSelectedElement(null);
  };

  // Reset element to default position
  const handleClearElement = () => {
    if (!selectedElement || !onLayoutChange) return;
    
    const defaultLayout = {
      topLeft: 'dateWeek' as const,
      topRight: 'favicon' as const,
      bottomLeft: 'qrCode' as const,
      bottomRight: 'cta' as const,
    };
    
    onLayoutChange(defaultLayout);
    setSelectedElement(null);
  };

  // Upload new asset for element
  const handleUploadElement = () => {
    if (!selectedElement) return;
    const elementId = selectedElement.id;
    
    // Allow upload for favicon
    if (elementId === 'favicon' && onFaviconUpload) {
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
      return url.hostname.toLowerCase().replace('www.', '');
    } catch {
      return data.siteName?.toLowerCase() || 'example.com';
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
    const baseColor = background.type === 'gradient' 
      ? (background.gradientFrom || background.color)
      : background.color;
    
    // Convert hex to RGB
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `linear-gradient(to bottom, rgba(${r}, ${g}, ${b}, 0) 0%, rgba(${r}, ${g}, ${b}, 1) 100%)`;
  };

  // Pattern overlay styling
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

  // Render element based on type
  const renderElement = (elementType: 'favicon' | 'dateWeek' | 'qrCode' | 'cta') => {
    switch (elementType) {
      case 'dateWeek':
        if (!visibilitySettings.showWeek && !visibilitySettings.showDate) return null;
        return (
          <DraggableSwappable 
            id="dateWeek" 
            disabled={!isDragMode} 
            isDragMode={isDragMode}
            onClick={(e) => handleElementClick('dateWeek', e)}
          >
            <div className="inline-flex items-center z-[2] relative">
              <div 
                className="relative px-4 py-1 backdrop-blur-sm"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                }}
              >
                {/* Top border with gap */}
                <div 
                  className="absolute left-0 right-2 h-[2px] bg-white"
                  style={{
                    top: '-4px',
                    borderRadius: '2px',
                  }}
                />
                
                {/* Bottom border with gap */}
                <div 
                  className="absolute left-0 right-2 h-[2px] bg-white"
                  style={{
                    bottom: '-4px',
                    borderRadius: '2px',
                  }}
                />

                {/* Week and Date - Single Row */}
                <div
                  className="font-noto-bengali font-bold text-left whitespace-nowrap"
                  style={{
                    fontFamily: fontStyles?.week.fontFamily || "Noto Sans Bengali",
                    fontSize: fontStyles?.week.fontSize || "14px",
                    fontWeight: fontStyles?.week.fontWeight || "700",
                    color: fontStyles?.week.color || "#FFFFFF",
                    letterSpacing: fontStyles?.week.letterSpacing || "0px",
                  }}
                >
                  {visibilitySettings.showWeek && data.weekName}
                  {visibilitySettings.showWeek && visibilitySettings.showDate && " | "}
                  {visibilitySettings.showDate && data.date}
                </div>
              </div>
            </div>
          </DraggableSwappable>
        );
      
      case 'favicon':
        if (!visibilitySettings.showLogo) return null;
        return (
          <DraggableSwappable 
            id="favicon" 
            disabled={!isDragMode} 
            isDragMode={isDragMode}
            onClick={(e) => handleElementClick('favicon', e)}
          >
            <div className="w-12 h-12 bg-gray-100 shadow-lg rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              {(data.favicon || data.logo) ? (
                <img
                  src={getProxiedImageUrl(data.favicon || data.logo)}
                  alt="Favicon"
                  className="w-full h-full object-contain border-2 border-white rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-logo.png";
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
      
      case 'qrCode':
        if (!visibilitySettings.showQrCode || !qrCodeUrl) return null;
        return (
          <DraggableSwappable 
            id="qrCode" 
            disabled={!isDragMode} 
            isDragMode={isDragMode}
            onClick={(e) => handleElementClick('qrCode', e)}
          >
            <div className="w-14 h-14 bg-white rounded-lg p-1 flex-shrink-0">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-full h-full"
              />
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
            <div className="bg-white border border-gray-300 py-0.5 px-3 text-center max-w-[230px] rounded-sm">
              <p className="font-noto-bengali text-md font-bold text-gray-900">
                বিস্তারিত{" "}
                <span style={{ color: getHighlightColor() }}>
                  কমেন্টের লিংকে
                </span>
              </p>
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
      case 'dateWeek':
        return (
          <div className="inline-flex items-center z-[2] relative">
            <div 
              className="relative px-4 py-1 backdrop-blur-sm"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
              }}
            >
              <div 
                className="absolute left-0 right-2 h-[2px] bg-white"
                style={{
                  top: '-4px',
                  borderRadius: '2px',
                }}
              />
              <div 
                className="absolute left-0 right-2 h-[2px] bg-white"
                style={{
                  bottom: '-4px',
                  borderRadius: '2px',
                }}
              />
              <div
                className="font-noto-bengali font-bold text-left whitespace-nowrap"
                style={{
                  fontFamily: fontStyles?.week.fontFamily || "Noto Sans Bengali",
                  fontSize: fontStyles?.week.fontSize || "14px",
                  fontWeight: fontStyles?.week.fontWeight || "700",
                  color: fontStyles?.week.color || "#FFFFFF",
                  letterSpacing: fontStyles?.week.letterSpacing || "0px",
                }}
              >
                {visibilitySettings.showWeek && data.weekName}
                {visibilitySettings.showWeek && visibilitySettings.showDate && " | "}
                {visibilitySettings.showDate && data.date}
              </div>
            </div>
          </div>
        );
      
      case 'favicon':
        return (
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            {(data.favicon || data.logo) ? (
              <img
                src={getProxiedImageUrl(data.favicon || data.logo)}
                alt="Favicon"
                className="w-full h-full object-contain border-2 border-white rounded-full"
              />
            ) : (
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
        );
      
      case 'qrCode':
        return (
          <div className="w-14 h-14 bg-white rounded-lg p-1 flex-shrink-0">
            <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
          </div>
        );
      
      case 'cta':
        return (
          <div className="bg-white border border-gray-300 py-0.5 px-3 text-center max-w-[230px] rounded-sm">
            <p className="font-noto-bengali text-md font-bold text-gray-900">
              বিস্তারিত{" "}
              <span style={{ color: getHighlightColor() }}>
                কমেন্টের লিংকে
              </span>
            </p>
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
              <span className="text-gray-400 text-sm font-inter">No Image</span>
            </div>
          )}
        </div>

        {/* Gradient Overlay - Bottom half of image blends to background */}
        <div 
          className="absolute left-0 right-0 bottom-0 h-[140px] pointer-events-none z-[1]"
          style={{
            background: getImageBlendGradient()
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
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
              }}
            >
              {/* Main parallelogram */}
              <path 
                d="M448 15H48.186L0 83H403.721L448 15Z" 
                fill="#FFFFFF"
              />
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
                    (e.target as HTMLImageElement).src = "/placeholder-logo.png";
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
          background: `linear-gradient(to bottom, transparent 0%, ${background.type === 'gradient' ? background.gradientFrom || background.color : background.color} 20%, ${background.type === 'gradient' ? background.gradientTo || background.color : background.color} 100%)`
        }}
      >

        {/* Title */}
        {visibilitySettings.showTitle && (
          <h2
            className="text-white font-noto-bengali text-center leading-tight mb-4 px-2 py-1"
            style={{
              fontFamily: fontStyles?.headline.fontFamily || "Noto Sans Bengali",
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

        {/* Footer Row - QR Code and Site Info */}
        <div className="flex justify-between items-end mt-0 gap-3">
          {/* Bottom Left Slot */}
          {renderElement(elementLayout.bottomLeft)}

          {/* Site Info - Right */}
          <div className="flex-1 flex flex-col items-end gap-2">
            {/* Site Name with Globe Icon */}
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4 text-white opacity-80" />
              <span className="text-white text-sm font-inter opacity-90">
                {getSiteDomain()}
              </span>
            </div>

            {/* Bottom Right Slot */}
            {renderElement(elementLayout.bottomRight)}
          </div>
        </div>
      </div>

      {/* Ad Banner - Full width at bottom, OUTSIDE the padding */}
      {adBannerImage && (
        <div className="w-full relative z-10 overflow-hidden" style={{ height: "60px" }}>
          <img
            src={adBannerImage}
            alt="Advertisement"
            className="w-full h-full object-cover"
            style={{
              transform: `scale(${adBannerZoom / 100})`,
              transformOrigin: "center",
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
        onUpload={selectedElement.id === 'favicon' ? handleUploadElement : undefined}
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
