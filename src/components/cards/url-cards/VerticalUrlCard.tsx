"use client";

import { PhotocardData, BackgroundOptions, CardFontStyles, VisibilitySettings, FooterItem, WatermarkSettings } from "@/types";
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

interface VerticalUrlCardProps {
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
    left: 'logo' | 'cta' | 'qrCode' | 'empty';
    right: 'logo' | 'cta' | 'qrCode' | 'empty';
    rightTop: 'logo' | 'cta' | 'qrCode' | 'empty';
    rightBottom: 'logo' | 'cta' | 'qrCode' | 'empty';
  };
  onLayoutChange?: (layout: any) => void;
  onVisibilityChange?: (settings: any) => void;
  onLogoUpload?: (file: File) => void;
  onRestoreDefaults?: () => void;
}

// Helper function to check if a color is light or dark
function isLightColor(color: string): boolean {
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
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

// Helper function to generate text shadow based on preset
function getTextShadow(preset: string, angle: number = 135, textColor: string = '#ffffff'): string {
  if (preset === "none" || !preset) return "none";
  
  const angleRad = (angle * Math.PI) / 180;
  const distance = 2;
  
  const offsetX = Math.cos(angleRad) * distance;
  const offsetY = Math.sin(angleRad) * distance;
  
  const isLight = isLightColor(textColor);
  
  switch (preset) {
    case "soft":
      return isLight 
        ? `${offsetX}px ${offsetY}px 4px rgba(0, 0, 0, 0.4)`
        : `${offsetX}px ${offsetY}px 4px rgba(255, 255, 255, 0.4)`;
    case "hard":
      return isLight
        ? `${offsetX * 1.5}px ${offsetY * 1.5}px 0px rgba(0, 0, 0, 0.8)`
        : `${offsetX * 1.5}px ${offsetY * 1.5}px 0px rgba(255, 255, 255, 0.8)`;
    case "glow":
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

// Helper function to generate text stroke
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

export default function VerticalUrlCard({
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
    showQrCode: true,
    showTitle: true,
    showAdBanner:false, 
  },
  isLogoFavicon = false,
  isDragMode = false,
  elementLayout = {
    left: 'logo',
    right: 'cta',
    rightTop: 'empty',
    rightBottom: 'qrCode',
  },
  onLayoutChange,
  onVisibilityChange,
  onLogoUpload,
  onRestoreDefaults,
}: VerticalUrlCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<{ id: string; position: { x: number; y: number } } | null>(null);
  
  // Image positioning states
  const [imageSelected, setImageSelected] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageDragging, setImageDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Click outside handler to close floating menu and deselect image
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectedElement) {
        setSelectedElement(null);
      }
      if (imageSelected) {
        setImageSelected(false);
      }
    };

    if (selectedElement || imageSelected) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [selectedElement, imageSelected]);

  // Handle image selection
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageSelected(!imageSelected);
    setSelectedElement(null); // Clear other element selections
  };

  // Handle image drag start
  const handleImageDragStart = (e: React.MouseEvent) => {
    if (!imageSelected) return;
    e.preventDefault();
    setImageDragging(true);
    setDragStartPos({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
  };

  // Handle image drag
  const handleImageDrag = (e: React.MouseEvent) => {
    if (!imageDragging) return;
    e.preventDefault();
    const newX = e.clientX - dragStartPos.x;
    const newY = e.clientY - dragStartPos.y;
    
    // Expanded drag bounds for better positioning control
    const maxX = 200;
    const maxY = 200;
    const minX = -200;
    const minY = -200;
    
    setImagePosition({
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY))
    });
  };

  // Handle image drag end
  const handleImageDragEnd = () => {
    setImageDragging(false);
  };

  // Handle image wheel for scaling
  const handleImageWheel = (e: React.WheelEvent) => {
    if (!imageSelected) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setImageScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  // Reset image position and scale
  const resetImagePosition = () => {
    setImagePosition({ x: 0, y: 0 });
    setImageScale(1);
  };

  // Global mouse event handlers
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (imageDragging) {
        const newX = e.clientX - dragStartPos.x;
        const newY = e.clientY - dragStartPos.y;
        const maxX = 200;
        const maxY = 200;
        const minX = -200;
        const minY = -200;
        setImagePosition({
          x: Math.max(minX, Math.min(maxX, newX)),
          y: Math.max(minY, Math.min(maxY, newY))
        });
      }
    };

    const handleGlobalMouseUp = () => {
      if (imageDragging) {
        setImageDragging(false);
      }
    };

    if (imageDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [imageDragging, dragStartPos]);

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
    
    if (elementId === 'logo') {
      newSettings.showLogo = !newSettings.showLogo;
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
      left: 'logo' as const,
      right: 'cta' as const,
      rightTop: 'empty' as const,
      rightBottom: 'qrCode' as const,
    };
    
    onLayoutChange(defaultLayout);
    setSelectedElement(null);
  };

  // Upload new asset for element
  const handleUploadElement = () => {
    if (!selectedElement) return;
    const elementId = selectedElement.id;
    
    if (elementId === 'logo' && onLogoUpload) {
      fileInputRef.current?.click();
    }
    setSelectedElement(null);
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setSelectedElement(null);
  };

  // Handle drag end - swap positions or move to empty slots
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    
    if (!over || active.id === over.id) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    const newLayout = { ...elementLayout };
    
    let activeSlot: keyof typeof elementLayout | null = null;
    let targetSlot: keyof typeof elementLayout | null = null;
    
    // Find active element slot
    Object.entries(elementLayout).forEach(([slot, element]) => {
      if (element === activeId) activeSlot = slot as keyof typeof elementLayout;
    });
    
    if (!activeSlot) return;
    
    // Handle dropping on empty slots (extract position from empty-{position} format)
    if (overId.startsWith('empty-')) {
      targetSlot = overId.replace('empty-', '') as keyof typeof elementLayout;
    } else {
      // Handle dropping on other draggable elements - find their slot
      Object.entries(elementLayout).forEach(([slot, element]) => {
        if (element === overId) targetSlot = slot as keyof typeof elementLayout;
      });
    }
    
    if (targetSlot && targetSlot !== activeSlot) {
      // Swap the elements
      const targetElement = newLayout[targetSlot];
      (newLayout as any)[targetSlot] = activeId;
      (newLayout as any)[activeSlot] = targetElement;
      
      if (onLayoutChange) {
        onLayoutChange(newLayout);
      }
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
    if (!background) return { backgroundColor: "#8b6834" };

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

  const getHighlightColor = () => {
    if (!background) return "#8b6834";
    if (background.type === "gradient" && background.gradientFrom)
      return background.gradientFrom;
    return background.color;
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

  // Render the overlay content for dragged element
  const renderDragOverlay = () => {
    if (!activeId) return null;
    
    switch (activeId) {
      case 'logo':
        return (
          <div className="bg-white border border-gray-200 p-2 min-w-[60px] min-h-[30px] shadow-lg flex items-center justify-center rounded-lg">
            {data.logo && <img src={getProxiedImageUrl(data.logo)} alt="Logo" className="object-contain w-auto h-auto max-w-[100px] max-h-8" />}
          </div>
        );
      case 'qrCode':
        return qrCodeUrl ? (
          <div className="bg-white p-1 rounded flex-shrink-0 shadow-lg">
            <img src={qrCodeUrl} alt="QR Code" className="w-12 h-12" />
          </div>
        ) : null;
      case 'cta':
        return (
          <div className="bg-white py-0.5 px-3 text-center rounded-sm max-w-[200px] shadow-lg">
            <p className="font-noto-bengali text-xs font-bold" style={{ color: getHighlightColor() }}>
              বিস্তারিত কমেন্টে
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  // Render element based on type
  const renderElement = (elementType: 'logo' | 'cta' | 'qrCode' | 'empty', position?: 'left' | 'right' | 'rightTop' | 'rightBottom') => {
    // Determine if this element needs the left position styling (top margin and proper layout)
    const isLeftPosition = position === 'left' || (!position && elementLayout.left === elementType);
    const leftPositionClasses = isLeftPosition ? "flex items-center justify-start mb-3 mt-3" : "";
    
    const wrapInLeftContainer = (content: React.ReactNode) => {
      if (isLeftPosition) {
        return <div className={leftPositionClasses}>{content}</div>;
      }
      return content;
    };

    switch (elementType) {
      case 'logo':
        if (!visibilitySettings.showLogo) return null;
        return wrapInLeftContainer(
          <DraggableSwappable 
            id="logo" 
            disabled={!isDragMode} 
            isDragMode={isDragMode}
            onClick={(e) => handleElementClick('logo', e)}
          >
            <div className="bg-white border border-gray-200 p-2 min-w-[60px] min-h-[30px] shadow-lg flex items-center justify-center rounded-lg">
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
          </DraggableSwappable>
        );
      
      case 'qrCode':
        if (!visibilitySettings.showQrCode || !qrCodeUrl) return null;
        return wrapInLeftContainer(
          <DraggableSwappable 
            id="qrCode" 
            disabled={!isDragMode} 
            isDragMode={isDragMode}
            onClick={(e) => handleElementClick('qrCode', e)}
          >
            <div className="bg-white p-1 rounded flex-shrink-0 w-fit">
              <img src={qrCodeUrl} alt="QR Code" className="w-12 h-12" />
            </div>
          </DraggableSwappable>
        );
      
      case 'empty':
        if (!isDragMode) return null;
        const DroppableSlot = ({ children, id }: { children: React.ReactNode; id: string }) => {
          const { isOver, setNodeRef } = useDroppable({ id });
          return (
            <div 
              ref={setNodeRef}
              className={`w-12 h-12 border-2 border-dashed rounded flex items-center justify-center transition-colors ${
                isOver 
                  ? 'border-blue-500 bg-blue-100/30' 
                  : 'border-blue-400 bg-blue-50/20'
              }`}
            >
              {children}
            </div>
          );
        };
        
        return wrapInLeftContainer(
          <DroppableSlot id={position ? `empty-${position}` : 'empty'}>
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </DroppableSlot>
        );
      
      case 'cta':
        return wrapInLeftContainer(
          <DraggableSwappable 
            id="cta" 
            disabled={!isDragMode} 
            isDragMode={isDragMode}
            onClick={(e) => handleElementClick('cta', e)}
          >
            <div className="bg-white py-1 px-3 text-center rounded-sm w-fit">
              <p className="font-noto-bengali text-xs font-bold text-gray-900">
                বিস্তারিত{" "}
                <span style={{ color: getHighlightColor() }}>
                  কমেন্টে
                </span>
              </p>
            </div>
          </DraggableSwappable>
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
          : "w-full max-w-md mx-auto min-w-[448px] overflow-hidden shadow-xl relative"
      }
    >
      <div className="relative overflow-hidden">

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

      {/* Main Content - Horizontal Layout */}
      <div className="flex h-[420px] relative">
        {/* Left Side - Content with background (45% width) */}
        <div 
          className="w-[45%] flex flex-col px-6 py-3 relative z-20"
          style={getBackgroundStyle()}
        >
          {/* Pattern Overlay for left section only */}
          <div
            className="absolute inset-0 pointer-events-none z-[-1]"
            style={getPatternStyle()}
          />
          {/* Top Section - Logo and Date */}
          <div className="flex-shrink-0">
            {/* Draggable element at top */}
            {renderElement(elementLayout.left)}
            
            {/* Date and Week Combined */}
            {(visibilitySettings.showDate || visibilitySettings.showWeek) && (
              <div 
 className="text-white mb-4"
                style={{
                  fontFamily: fontStyles?.week.fontFamily || "Noto Serif Bengali",
                  fontSize: fontStyles?.week.fontSize || "12px",
                  fontWeight: fontStyles?.week.fontWeight || "500",
                  color: fontStyles?.week.color || "#FFFFFF",
                }}
              >
                {visibilitySettings.showWeek && getWeekday()}
                {visibilitySettings.showWeek && visibilitySettings.showDate && " | "}
                {visibilitySettings.showDate && getCardDate()}
              </div>
            )}
          </div>
          
          {/* Middle Section - Title (Centered Vertically) */}
          <div className="flex-1 flex items-center">
            {visibilitySettings.showTitle && (
              <h2
 className="text-white leading-tight overflow-hidden max-w-[90%] -mt-4"
                style={{
                  fontFamily: fontStyles?.headline.fontFamily || "Noto Serif Bengali",
                  fontSize: fontStyles?.headline.fontSize || "25px",
                  fontWeight: fontStyles?.headline.fontWeight || "700",
                  color: fontStyles?.headline.color || "#FFFFFF",
                  textAlign: "left",
                  letterSpacing: fontStyles?.headline.letterSpacing || "0px",
                  display: "-webkit-box",
                  WebkitLineClamp: 6,
                  WebkitBoxOrient: "vertical",
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
        </div>
        
        {/* Bottom Section - CTA */}
        <div className="flex-shrink-0 mb-3">
          {/* Draggable element at bottom left */}
          {renderElement(elementLayout.right)}
        </div>
      </div>

      {/* Right Side - Image Only (55% width) */}
      <div 
        className={`w-[55%] bg-white overflow-hidden relative cursor-pointer transition-all duration-200 ${
          imageSelected ? 'ring-2 ring-blue-400 ring-offset-2' : ''
        }`}
        style={{
          border: `${frameBorderThickness}px solid ${frameBorderColor}`,
        }}
        onClick={handleImageClick}
      >
        {/* Image positioning instructions */}
        {imageSelected && data.image && (
          <div className="absolute top-2 left-2 z-30 bg-white bg-opacity-90 text-gray-700 text-xs px-2 py-1 rounded shadow-lg">
            
          </div>
        )}
        
        {/* Reset button */}
        {imageSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              resetImagePosition();
            }}
            className="absolute top-2 right-2 z-30 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-1 rounded shadow transition-all"
            title="Reset position and zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {data.image ? (
          <div 
            className="w-full h-full relative overflow-hidden"
            onWheel={handleImageWheel}
          >
            {/* Full image overlay for positioning - only visible when selected */}
            {(imageDragging || imageSelected) && (
              <>
                {/* Crop boundary overlay */}
                <div className="absolute inset-0 border-2 border-dashed border-blue-400 z-60 pointer-events-none">
                  <div className="absolute -top-1 -left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-tl rounded-br shadow-lg">
                    Final Crop Area
                  </div>
                </div>
                
                <div 
                  className="absolute inset-0 z-50 overflow-visible"
                  style={{ pointerEvents: imageDragging ? 'none' : 'auto' }}
                >
                  <img
                    src={getProxiedImageUrl(data.image)}
                    alt="Full image for positioning"
                    className="absolute top-1/2 left-1/2 cursor-move shadow-2xl border-2 border-blue-300"
                    style={{
                      transform: `translate(-50%, -50%) translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                      transformOrigin: 'center center',
                      maxWidth: 'none',
                      maxHeight: 'none',
                      width: 'auto',
                      height: 'auto',
                      minWidth: '100%',
                      minHeight: '100%'
                    }}
                    onMouseDown={handleImageDragStart}
                    onMouseMove={handleImageDrag}
                    onMouseUp={handleImageDragEnd}
                    draggable={false}
                  />
                </div>
              </>
            )}
            
            {/* Normal positioned image - uses same positioning as overlay but cropped to container */}
            <div className="w-full h-full relative overflow-hidden">
              <img
                src={getProxiedImageUrl(data.image)}
                alt="Article image"
                className={`absolute top-1/2 left-1/2 transition-all duration-200 ${
                  imageSelected ? 'opacity-0' : 'cursor-pointer'
                }`}
                style={{
                  transform: `translate(-50%, -50%) translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                  transformOrigin: 'center center',
                  maxWidth: 'none',
                  maxHeight: 'none',
                  width: 'auto',
                  height: 'auto',
                  minWidth: '100%',
                  minHeight: '100%'
                }}
                onMouseDown={!imageSelected ? undefined : handleImageDragStart}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
                }}
                draggable={false}
              />
            </div>
          </div>
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

          {/* Right section draggable positions */}
          {/* Top right position */}
          <div className="absolute top-3 right-6 z-20">
            {renderElement(elementLayout.rightTop, 'rightTop')}
          </div>
          
          {/* Bottom right position */}
          <div className="absolute bottom-3 right-6 z-20">
            {renderElement(elementLayout.rightBottom, 'rightBottom')}
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
      </div>
      
      {/* Drag Overlay */}
      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <div style={{ cursor: 'grabbing', opacity: 0.9 }}>
            {renderDragOverlay()}
          </div>
        ) : null}
      </DragOverlay>

      {/* Floating Menu */}
      {selectedElement && isDragMode && (
        <FloatingMenu
          elementId={selectedElement.id}
          elementType={selectedElement.id.replace(/\d+$/, '')}
          onHide={handleHideElement}
          onClear={handleClearElement}
          onUpload={selectedElement.id === 'logo' ? handleUploadElement : undefined}
          position={selectedElement.position}
          isVisible={true}
        />
      )}

      {/* Restore Defaults Button */}
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

      {/* Hidden file input */}
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
    </DndContext>
  );
}
