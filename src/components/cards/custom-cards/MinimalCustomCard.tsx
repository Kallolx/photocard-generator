"use client";

import { PhotocardData, BackgroundOptions, CardFontStyles, VisibilitySettings } from "@/types";
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

interface MinimalCustomCardProps {
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
  isDragMode?: boolean;
  elementLayout?: {
    topLeft: 'logo' | 'dateWeek' | 'cta';
    topRight: 'logo' | 'dateWeek' | 'cta';
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

export default function MinimalCustomCard({
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
  fontStyles,
  visibilitySettings = {
    showWeek: true,
    showDate: true,
    showLogo: true,
    showQrCode: false,
    showTitle: true,
  },
  isDragMode = false,
  elementLayout = {
    topLeft: 'dateWeek',
    topRight: 'logo',
  },
  onLayoutChange,
  onVisibilityChange,
  onLogoUpload,
  onFaviconUpload,
  onRestoreDefaults,
}: MinimalCustomCardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<{ id: string; position: { x: number; y: number } } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Get background style for container
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

  // Helper function to extract dominant color from background
  const getHighlightColor = () => {
    if (background.type === "gradient" && background.gradientFrom) {
      return background.gradientFrom;
    }
    return background.color;
  };

  // Generate pattern overlay based on background options
  const renderPattern = () => {
    if (!background.pattern || background.pattern === "none") return null;

    const patternColor = background.patternColor || "#ffffff";
    const patternOpacity = (background.patternOpacity ?? 10) / 100;

    // If custom pattern image is provided
    if (background.pattern === "custom" && background.patternImage) {
      return (
        <div
          className="absolute inset-0 z-[1]"
          style={{
            backgroundImage: `url(${background.patternImage})`,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
            opacity: patternOpacity,
          }}
        />
      );
    }

    // Predefined patterns
    const patterns: Record<string, string> = {
      dots: `radial-gradient(circle, ${patternColor} 1px, transparent 1px)`,
      lines: `repeating-linear-gradient(45deg, ${patternColor}, ${patternColor} 1px, transparent 1px, transparent 10px)`,
      grid: `linear-gradient(${patternColor} 1px, transparent 1px), linear-gradient(90deg, ${patternColor} 1px, transparent 1px)`,
      checks: `repeating-conic-gradient(${patternColor} 0% 25%, transparent 0% 50%)`,
      curves: `radial-gradient(circle at 20% 50%, transparent 20%, ${patternColor} 21%, transparent 22%)`,
      abstract: `conic-gradient(from 45deg at 10% 50%, ${patternColor} 0deg, transparent 60deg, transparent 300deg, ${patternColor} 360deg)`,
    };

    const patternStyle = patterns[background.pattern];
    if (!patternStyle) return null;

    let backgroundSize = "20px 20px";
    if (background.pattern === "grid") backgroundSize = "20px 20px, 20px 20px";
    if (background.pattern === "checks") backgroundSize = "40px 40px";
    if (background.pattern === "curves") backgroundSize = "60px 60px";
    if (background.pattern === "abstract") backgroundSize = "80px 80px";

    return (
      <div
        className="absolute inset-0 z-[1]"
        style={{
          backgroundImage: patternStyle,
          backgroundSize: backgroundSize,
          opacity: patternOpacity,
        }}
      />
    );
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id && onLayoutChange) {
      const newLayout = { ...elementLayout };
      
      let activeSlot: keyof typeof elementLayout | null = null;
      let overSlot: keyof typeof elementLayout | null = null;

      Object.entries(elementLayout).forEach(([slot, element]) => {
        if (element === active.id) activeSlot = slot as keyof typeof elementLayout;
        if (element === over.id) overSlot = slot as keyof typeof elementLayout;
      });

      if (activeSlot && overSlot) {
        newLayout[activeSlot] = elementLayout[overSlot];
        newLayout[overSlot] = elementLayout[activeSlot];
        onLayoutChange(newLayout);
      }
    }
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle element click - show floating menu
  const handleElementClick = (elementId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedElement({
      id: elementId,
      position: {
        x: rect.left + rect.width / 2 - 50,
        y: rect.bottom + 10,
      },
    });
  };

  // Hide element
  const handleHideElement = () => {
    if (!selectedElement || !onVisibilityChange) return;
    
    const elementId = selectedElement.id;
    const updates: Partial<VisibilitySettings> = {};
    
    if (elementId === 'dateWeek') {
      updates.showWeek = false;
      updates.showDate = false;
    } else if (elementId === 'logo') {
      updates.showLogo = false;
    }
    
    onVisibilityChange({ ...visibilitySettings, ...updates });
    setSelectedElement(null);
  };

  // Clear/reset element to default
  const handleClearElement = () => {
    if (!selectedElement) return;
    const elementId = selectedElement.id;
    
    if (elementId === 'logo' && onRestoreDefaults) {
      onRestoreDefaults();
    }
    
    setSelectedElement(null);
  };

  // Upload new asset for element
  const handleUploadElement = () => {
    if (!selectedElement) return;
    const elementId = selectedElement.id;
    
    // Allow upload for circular logo (favicon)
    if (elementId === 'logo' && onFaviconUpload) {
      faviconInputRef.current?.click();
    }
    setSelectedElement(null);
  };

  // Render element based on type
  const renderElement = (elementType: 'logo' | 'dateWeek' | 'cta') => {
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
      
      case 'logo':
        if (!visibilitySettings.showLogo) return null;
        return (
          <DraggableSwappable 
            id="logo" 
            disabled={!isDragMode} 
            isDragMode={isDragMode}
            onClick={(e) => handleElementClick('logo', e)}
          >
            <div className="w-12 h-12 bg-gray-100 shadow-lg rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              {(data.favicon || data.logo) ? (
                <img
                  src={getProxiedImageUrl(data.favicon || data.logo)}
                  alt="Logo"
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
      
      case 'logo':
        return (
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            {(data.favicon || data.logo) ? (
              <img
                src={getProxiedImageUrl(data.favicon || data.logo)}
                alt="Logo"
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
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
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
      {renderPattern()}

      {/* Floating Menu */}
      <FloatingMenu
        elementId={selectedElement?.id || ''}
        elementType={selectedElement?.id || ''}
        onHide={handleHideElement}
        onClear={handleClearElement}
        onUpload={selectedElement?.id === 'logo' ? handleUploadElement : undefined}
        position={selectedElement?.position || { x: 0, y: 0 }}
        isVisible={!!selectedElement}
      />

      {/* Top Section: Image with Overlay Content */}
      <div className="relative w-full h-[240px] overflow-hidden">
        {/* Hero Image or Placeholder */}
        {data.image ? (
          <img
            src={getProxiedImageUrl(data.image)}
            alt={data.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-image.png";
            }}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-white flex items-center justify-center">
            <svg
              className="w-24 h-24 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Gradient Overlay - Bottom half of image blends to background */}
        <div 
          className="absolute left-0 right-0 bottom-0 h-[140px] pointer-events-none z-[1]"
          style={{
            background: getImageBlendGradient()
          }}
        />

        {/* Overlay Content - Week/Date and Logo */}
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
        className="px-6 pt-6 pb-4 relative z-10 flex-1 flex flex-col"
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

        {/* CTA - Centered at Bottom */}
        <div className="flex justify-center items-end mt-auto">
          {renderElement('cta')}
        </div>
      </div>

      {/* Ad Banner - Full width at bottom, OUTSIDE the padding */}
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

    {/* Drag Overlay */}
    <DragOverlay>
      {renderDragOverlay()}
    </DragOverlay>
    </DndContext>
  );
}
