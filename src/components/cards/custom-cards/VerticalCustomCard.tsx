"use client";

import {
  PhotocardData,
  BackgroundOptions,
  CardFontStyles,
  VisibilitySettings,
} from "@/types";
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

interface VerticalCustomCardProps {
  data: PhotocardData;
  isGenerating?: boolean;
  background?: BackgroundOptions;
  id?: string;
  fullSize?: boolean;
  frameBorderColor?: string;
  frameBorderThickness?: number;
  socialMedia?: Array<{ platform: string; username: string }>;
  adBannerImage?: string | null;
  adBannerZoom?: number;
  adBannerPosition?: { x: number; y: number };
  website?: string;
  footerText?: string;
  fontStyles?: CardFontStyles;
  visibilitySettings?: VisibilitySettings;
  isDragMode?: boolean;
  footerOverlay?: { enabled: boolean; opacity: number };
  elementLayout?: {
    left: "logo" | "cta" | "empty";
    right: "logo" | "cta" | "empty";
    rightTop: "logo" | "cta" | "empty";
    rightBottom: "logo" | "cta" | "empty";
    bottomLeft?: "socialMedia" | "website";
    bottomRight?: "socialMedia" | "website";
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
    shadows.push(
      `${offsetX.toFixed(2)}px ${offsetY.toFixed(2)}px 0px ${color}`,
    );
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
  socialMedia = [],
  adBannerImage = null,
  adBannerZoom = 100,
  adBannerPosition = { x: 0, y: 0 },
  website = "",
  footerText = "",
  fontStyles,
  visibilitySettings = {
    showWeek: true,
    showDate: true,
    showLogo: true,
    showQrCode: false,
    showTitle: true,
    showAdBanner: false,
  },
  isDragMode = false,
  footerOverlay,
  elementLayout = {
    left: "logo",
    right: "cta",
    rightTop: "empty",
    rightBottom: "empty",
    bottomLeft: "socialMedia",
    bottomRight: "website",
  },
  onLayoutChange,
  onVisibilityChange,
  onLogoUpload,
  onRestoreDefaults,
}: VerticalCustomCardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<{
    id: string;
    position: { x: number; y: number };
  } | null>(null);

  // Image positioning states
  const [imageSelected, setImageSelected] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageDragging, setImageDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter valid social media entries
  const validSocialMedia = socialMedia.filter(
    (social) => social.platform && social.username,
  );

  const getFooterBackgroundStyle = () => {
    if (!background) return { backgroundColor: "#6b4e25" }; // darker brown

    if (
      background.type === "gradient" &&
      background.gradientFrom &&
      background.gradientTo
    ) {
      // For gradients, darken both colors
      const darkerFrom = darkenColor(background.gradientFrom, 25);
      const darkerTo = darkenColor(background.gradientTo, 25);
      return {
        backgroundImage: `linear-gradient(135deg, ${darkerFrom}, ${darkerTo})`,
      };
    }

    // For solid colors, darken by 25%
    return { backgroundColor: darkenColor(background.color, 25) };
  };

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
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
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
    setDragStartPos({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });
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
      y: Math.max(minY, Math.min(maxY, newY)),
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
    setImageScale((prev) => Math.max(0.5, Math.min(3, prev + delta)));
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
          y: Math.max(minY, Math.min(maxY, newY)),
        });
      }
    };

    const handleGlobalMouseUp = () => {
      if (imageDragging) {
        setImageDragging(false);
      }
    };

    if (imageDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
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

    if (elementId === "logo") {
      newSettings.showLogo = !newSettings.showLogo;
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
      left: "logo" as const,
      right: "cta" as const,
      rightTop: "empty" as const,
      rightBottom: "empty" as const,
    };

    onLayoutChange(defaultLayout);
    setSelectedElement(null);
  };

  // Upload new asset for element
  const handleUploadElement = () => {
    if (!selectedElement) return;
    const elementId = selectedElement.id;

    if (elementId === "logo" && onLogoUpload) {
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
    if (overId.startsWith("empty-")) {
      targetSlot = overId.replace("empty-", "") as keyof typeof elementLayout;
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
      case "logo":
        return (
          <div className="w-12 h-12 bg-white rounded flex items-center justify-center p-1 shadow-lg">
            {data.logo && (
              <img
                src={data.logo}
                alt="Logo"
                className="object-contain w-full h-full"
              />
            )}
          </div>
        );
      case "cta":
        return (
          <div className="bg-white py-2 px-4 text-center rounded-sm w-fit shadow-lg">
            <p
              className="font-noto-bengali text-sm font-bold"
              style={{ color: getHighlightColor() }}
            >
              বিস্তারিত কমেন্টে
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  // Render element based on type
  const renderElement = (
    elementType: "logo" | "cta" | "empty" | "socialMedia" | "website",
    position?: "left" | "right" | "rightTop" | "rightBottom",
  ) => {
    // Determine if this element needs the left position styling (top margin and proper layout)
    const isLeftPosition =
      position === "left" || (!position && elementLayout.left === elementType);
    const leftPositionClasses = isLeftPosition
      ? "flex items-center justify-start mb-3 mt-3"
      : "";

    const wrapInLeftContainer = (content: React.ReactNode) => {
      if (isLeftPosition) {
        return <div className={leftPositionClasses}>{content}</div>;
      }
      return content;
    };

    switch (elementType) {
      case "logo":
        if (!visibilitySettings.showLogo) return null;
        return wrapInLeftContainer(
          <DraggableSwappable
            id="logo"
            disabled={!isDragMode}
            isDragMode={isDragMode}
            onClick={(e) => handleElementClick("logo", e)}
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
          </DraggableSwappable>,
        );

      case "empty":
        if (!isDragMode) return null;
        const DroppableSlot = ({
          children,
          id,
        }: {
          children: React.ReactNode;
          id: string;
        }) => {
          const { isOver, setNodeRef } = useDroppable({ id });
          return (
            <div
              ref={setNodeRef}
              className={`w-12 h-12 border-2 border-dashed rounded flex items-center justify-center transition-colors ${
                isOver
                  ? "border-blue-500 bg-blue-100/30"
                  : "border-blue-400 bg-blue-50/20"
              }`}
            >
              {children}
            </div>
          );
        };

        return wrapInLeftContainer(
          <DroppableSlot id={position ? `empty-${position}` : "empty"}>
            <svg
              className="w-4 h-4 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </DroppableSlot>,
        );

      case "cta":
        return wrapInLeftContainer(
          <DraggableSwappable
            id="cta"
            disabled={!isDragMode}
            isDragMode={isDragMode}
            onClick={(e) => handleElementClick("cta", e)}
          >
            <div className="bg-white py-1 px-3 text-center rounded-sm w-fit">
              <p className="font-noto-bengali text-xs font-bold text-gray-900">
                বিস্তারিত{" "}
                <span style={{ color: getHighlightColor() }}>কমেন্টে</span>
              </p>
            </div>
          </DraggableSwappable>,
        );

      case "socialMedia":
        if (validSocialMedia.length === 0) return null;
        return (
          <div className="flex items-center gap-4 flex-wrap relative z-10">
            {validSocialMedia.map((social, index) => (
              <div key={index} className="flex items-center gap-1.5">
                {social.platform === "facebook" && (
                  <svg
                    className="w-3.5 h-3.5"
                    style={{ color: fontStyles?.footer.color || "#FFFFFF" }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                )}
                {social.platform === "twitter" && (
                  <svg
                    className="w-3.5 h-3.5"
                    style={{ color: fontStyles?.footer.color || "#FFFFFF" }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                )}
                {social.platform === "instagram" && (
                  <svg
                    className="w-3.5 h-3.5"
                    style={{ color: fontStyles?.footer.color || "#FFFFFF" }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                )}
                {social.platform === "youtube" && (
                  <svg
                    className="w-3.5 h-3.5"
                    style={{ color: fontStyles?.footer.color || "#FFFFFF" }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                )}
                {social.platform === "linkedin" && (
                  <svg
                    className="w-3.5 h-3.5"
                    style={{ color: fontStyles?.footer.color || "#FFFFFF" }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                )}
                {social.platform === "tiktok" && (
                  <svg
                    className="w-3.5 h-3.5"
                    style={{ color: fontStyles?.footer.color || "#FFFFFF" }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                )}
                {social.platform === "whatsapp" && (
                  <svg
                    className="w-3.5 h-3.5"
                    style={{ color: fontStyles?.footer.color || "#FFFFFF" }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                )}
                <span
                  className="font-medium max-w-[100px] truncate font-noto-bengali"
                  style={{
                    color: fontStyles?.footer.color || "#FFFFFF",
                    fontSize: fontStyles?.footer.fontSize || "12px",
                  }}
                >
                  {social.username}
                </span>
              </div>
            ))}
          </div>
        );

      case "website":
        if (!website) return null;
        return (
          <div className="flex items-center gap-1.5 relative z-10">
            <svg
              className="w-3.5 h-3.5"
              style={{ color: fontStyles?.footer.color || "#FFFFFF" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            <span
              className="font-medium max-w-[150px] truncate font-noto-bengali"
              style={{
                color: fontStyles?.footer.color || "#FFFFFF",
                fontSize: fontStyles?.footer.fontSize || "12px",
              }}
            >
              {website}
            </span>
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
              {renderElement(elementLayout.left, "left")}

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
                  {visibilitySettings.showWeek &&
                    visibilitySettings.showDate &&
                    " | "}
                  {visibilitySettings.showDate && getBengaliDate()}
                </div>
              )}
            </div>

            {/* Middle Section - Title (Centered Vertically) */}
            <div className="flex-1 flex items-center">
              {visibilitySettings.showTitle && (
                <h2
                  className="text-white font-noto-bengali leading-tight overflow-hidden max-w-[90%] -mt-4"
                  style={
                    {
                      fontFamily:
                        fontStyles?.headline.fontFamily || "Noto Sans Bengali",
                      fontSize: fontStyles?.headline.fontSize || "25px",
                      fontWeight: fontStyles?.headline.fontWeight || "700",
                      color: fontStyles?.headline.color || "#FFFFFF",
                      textAlign: "left",
                      letterSpacing:
                        fontStyles?.headline.letterSpacing || "0px",
                      textShadow: (() => {
                        const textColor =
                          fontStyles?.headline.color || "#FFFFFF";
                        const shadow = getTextShadow(
                          fontStyles?.headline.textShadow?.preset || "none",
                          fontStyles?.headline.textShadow?.angle || 135,
                          textColor,
                        );
                        const stroke = getTextStroke(
                          fontStyles?.headline.textStroke?.width || 0,
                          fontStyles?.headline.textStroke?.color || "#000000",
                        );

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
            </div>

            {/* Bottom Section - Draggable element */}
            <div className="flex-shrink-0 mb-3">
              {renderElement(elementLayout.right, "right")}
            </div>
          </div>

          {/* Right Side - Image Only (55% width) */}
          <div
            className={`w-[55%] bg-white overflow-hidden relative cursor-pointer transition-all duration-200 ${
              imageSelected ? "ring-2 ring-blue-400 ring-offset-2" : ""
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
                      style={{ pointerEvents: imageDragging ? "none" : "auto" }}
                    >
                      <img
                        src={data.image}
                        alt="Full image for positioning"
                        className="absolute top-1/2 left-1/2 cursor-move shadow-2xl border-2 border-blue-300"
                        style={{
                          transform: `translate(-50%, -50%) translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                          transformOrigin: "center center",
                          maxWidth: "none",
                          maxHeight: "none",
                          width: "auto",
                          height: "auto",
                          minWidth: "100%",
                          minHeight: "100%",
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
                      imageSelected ? "opacity-0" : "cursor-pointer"
                    }`}
                    style={{
                      transform: `translate(-50%, -50%) translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                      transformOrigin: "center center",
                      maxWidth: "none",
                      maxHeight: "none",
                      width: "auto",
                      height: "auto",
                      minWidth: "100%",
                      minHeight: "100%",
                    }}
                    onMouseDown={
                      !imageSelected ? undefined : handleImageDragStart
                    }
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-image.jpg";
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
                <span className="text-gray-400 text-sm font-inter">
                  Upload Image
                </span>
              </div>
            )}

            {/* Right section draggable positions */}
            {/* Top right position */}
            <div className="absolute top-3 right-6 z-20">
              {renderElement(elementLayout.rightTop, "rightTop")}
            </div>

            {/* Bottom right position */}
            <div className="absolute bottom-3 right-6 z-20">
              {renderElement(elementLayout.rightBottom, "rightBottom")}
            </div>
          </div>
        </div>

        {/* Social Media Footer - swappable positions */}
        {(validSocialMedia.length > 0 || website || footerText) && (
          <div
            className="px-6 py-3 relative"
            style={getFooterBackgroundStyle()}
          >
            {footerOverlay?.enabled && (
              <div
                className="absolute inset-0 z-0 bg-black"
                style={{ opacity: footerOverlay.opacity }}
              />
            )}
            <div className="flex items-center justify-center gap-4 flex-wrap relative z-10">
              {/* Bottom Left Slot */}
              {elementLayout.bottomLeft &&
                renderElement(elementLayout.bottomLeft)}

              {/* Bottom Right Slot */}
              {elementLayout.bottomRight &&
                renderElement(elementLayout.bottomRight)}

              {/* Footer Text */}
              {footerText && (
                <div className="flex items-center relative z-10">
                  <span
                    className="font-medium font-noto-bengali"
                    style={{
                      color: fontStyles?.footer?.color || "#FFFFFF",
                      fontSize: fontStyles?.footer?.fontSize || "12px",
                    }}
                  >
                    {footerText}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

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
          <div style={{ cursor: "grabbing", opacity: 0.9 }}>
            {renderDragOverlay()}
          </div>
        ) : null}
      </DragOverlay>

      {/* Floating Menu */}
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
          e.target.value = "";
        }}
      />
    </DndContext>
  );
}
