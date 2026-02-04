"use client";

import { PhotocardData, BackgroundOptions, CardFontStyles, VisibilitySettings } from "@/types";
import { useEffect, useState, useRef } from "react";
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

interface VerticalCustomCardProps {
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
  isDragMode?: boolean;
  elementLayout?: {
    left: 'logo' | 'cta' | 'empty';
    right: 'logo' | 'cta' | 'empty';
    rightTop: 'logo' | 'cta' | 'empty';
    rightBottom: 'logo' | 'cta' | 'empty';
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

export default function VerticalCustomCard({
  data,
  isGenerating,
  background,
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
    showQrCode: false,
    showTitle: true,
  },
  isDragMode = false,
  elementLayout = {
    left: 'logo',
    right: 'cta',
    rightTop: 'empty',
    rightBottom: 'empty',
  },
  onLayoutChange,
  onVisibilityChange,
  onLogoUpload,
  onRestoreDefaults,
}: VerticalCustomCardProps) {
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
      rightBottom: 'empty' as const,
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

  // Render the overlay content for dragged element
  const renderDragOverlay = () => {
    if (!activeId) return null;
    
    switch (activeId) {
      case 'logo':
        return (
          <div className="w-12 h-12 bg-white rounded flex items-center justify-center p-1 shadow-lg">
            {data.logo && <img src={data.logo} alt="Logo" className="object-contain w-full h-full" />}
          </div>
        );
      case 'cta':
        return (
          <div className="bg-white py-2 px-4 text-center rounded-sm w-fit shadow-lg">
            <p className="font-noto-bengali text-sm font-bold" style={{ color: getHighlightColor() }}>
              বিস্তারিত কমেন্টে
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  // Render element based on type
  const renderElement = (elementType: 'logo' | 'cta' | 'empty', position?: 'left' | 'right' | 'rightTop' | 'rightBottom') => {
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
            <div className="w-12 h-12 bg-white rounded flex items-center justify-center p-1">
              {data.logo ? (
                <img
                  src={data.logo}
                  alt="Site logo"
                  className="object-contain w-full h-full"
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
            <div className="bg-white py-2 px-4 text-center rounded-sm w-fit">
              <p className="font-noto-bengali text-sm font-bold" style={{ color: getHighlightColor() }}>
                বিস্তারিত কমেন্টে
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
          : "w-full max-w-md mx-auto overflow-hidden shadow-xl relative"
      }
    >
      {/* Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={getPatternStyle()}
      />

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
            {renderElement(elementLayout.left, 'left')}
            
            {/* Date and Week Combined */}
            {(visibilitySettings.showDate || visibilitySettings.showWeek) && (
              <div 
                className="text-white font-noto-bengali mb-4"
                style={{
                  fontSize: fontStyles?.week.fontSize || "12px",
                  fontWeight: fontStyles?.week.fontWeight || "500",
                  color: fontStyles?.week.color || "#FFFFFF",
                }}
              >
                {visibilitySettings.showWeek && getBengaliWeekday()}
                {visibilitySettings.showWeek && visibilitySettings.showDate && " | "}
                {visibilitySettings.showDate && getBengaliDate()}
              </div>
            )}
          </div>
          
          {/* Middle Section - Title (Centered Vertically) */}
          <div className="flex-1 flex items-center">
            {visibilitySettings.showTitle && (
              <h2
                className="text-white font-noto-bengali leading-tight overflow-hidden max-w-[90%]"
                style={{
                  fontFamily: fontStyles?.headline.fontFamily || "Noto Sans Bengali",
                  fontSize: fontStyles?.headline.fontSize || "25px",
                  fontWeight: fontStyles?.headline.fontWeight || "700",
                  color: fontStyles?.headline.color || "#FFFFFF",
                  textAlign: "left",
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
          
          {/* Bottom Section - Draggable element */}
          <div className="flex-shrink-0">
            {renderElement(elementLayout.right, 'right')}
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
            <div className="absolute top-2 left-2 z-30 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              Drag to position • Scroll to zoom • Blue box = final crop
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
                      src={data.image}
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
                  src={data.image}
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
              <span className="text-gray-400 text-sm font-inter">Upload Image</span>
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

      {/* Ad Banner - Full width at bottom */}
      {adBannerImage ? (
        <div className="w-full relative z-10 overflow-hidden" style={{ height: "60px" }}>
          <img
            src={adBannerImage}
            alt="Advertisement"
            className="w-full h-full object-cover"
            style={{
              transform: `scale(${adBannerZoom / 100})`,
              transformOrigin: 'center',
            }}
          />
        </div>
      ) : (
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
