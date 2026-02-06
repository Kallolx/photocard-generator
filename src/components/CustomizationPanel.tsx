"use client";

import { useState, useRef } from "react";
import { BackgroundOptions, CardFontStyles, VisibilitySettings } from "@/types";
import { Plus, Lock, RefreshCw, X, Upload, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UpgradeModal from "./UpgradeModal";

interface CustomizationPanelProps {
  background: BackgroundOptions;
  onBackgroundChange: (background: BackgroundOptions) => void;
  frameBorderColor?: string;
  frameBorderThickness?: number;
  onFrameChange?: (color: string, thickness: number) => void;
  adBannerImage?: string | null;
  onAdBannerChange?: (image: string | null) => void;
  adBannerZoom?: number;
  onAdBannerZoomChange?: (zoom: number) => void;
  theme?: string;
  onThemeChange?: (theme: string) => void;
  fontStyles?: CardFontStyles;
  onFontStylesChange?: (fontStyles: CardFontStyles) => void;
  visibilitySettings?: VisibilitySettings;
  onVisibilityChange?: (visibilitySettings: VisibilitySettings) => void;
}

const SOLID_COLORS = [
  { color: "#E53E3E", name: "Soft Red" },
  { color: "#D53F8C", name: "Muted Pink" },
  { color: "#DD6B20", name: "Warm Orange" },
  { color: "#975A16", name: "Earth Brown" },
  { color: "#38A169", name: "Calm Green" },
];

const GRADIENTS = [
  { from: "#C53030", to: "#FC8181", name: "Soft Red Glow" },
  { from: "#B83280", to: "#F687B3", name: "Rose Pink" },
  { from: "#C05621", to: "#F6AD55", name: "Warm Sunset" },
  { from: "#2B6CB0", to: "#63B3ED", name: "Calm Blue Sky" },
  { from: "#2F855A", to: "#68D391", name: "Fresh Green" },
];

const FRAME_COLORS = [
  { color: "#FFFFFF", name: "Pure White" },
  { color: "#F1F5F9", name: "Soft Gray" },
  { color: "#CBD5E1", name: "Cool Gray" },
  { color: "#22C55E", name: "Soft Green" },
  { color: "#3B82F6", name: "Clean Blue" },
];

const THEMES = [
  {
    id: "classic",
    name: "Classic",
    locked: false,
    thumbnail: "/themes/cus-1.png",
  },
  {
    id: "modern",
    name: "Modern",
    locked: false,
    thumbnail: "/themes/cus-2.png",
  },
  {
    id: "vertical",
    name: "Vertical",
    locked: false,
    thumbnail: "/themes/cus-3.png",
  },
];

type Tab = "Background" | "Pattern" | "Theme" | "Fonts" | "Visibility" | "Frame" | "Ad Banner";

const PATTERNS = [
  { id: "none", name: "None" },
  { id: "dots", name: "Dots" },
  { id: "abstract", name: "Abstract" },
  { id: "lines", name: "Lines" },
  { id: "grid", name: "Grid" },
  { id: "checks", name: "Checks" },
  { id: "curves", name: "Curves" },
  { id: "custom", name: "Upload" },
];

export default function CustomizationPanel({
  background,
  onBackgroundChange,
  frameBorderColor: initialFrameBorderColor = "#FFFFFF",
  frameBorderThickness: initialFrameBorderThickness = 2,
  onFrameChange,
  adBannerImage,
  onAdBannerChange,
  adBannerZoom = 100,
  onAdBannerZoomChange,
  theme = "classic",
  onThemeChange,
  fontStyles,
  onFontStylesChange,
  visibilitySettings,
  onVisibilityChange,
}: CustomizationPanelProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Background");
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [showFontModal, setShowFontModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");
  const [selectedFontType, setSelectedFontType] = useState<
    "weekDate" | "headline" | null
  >(null);
  
  // Custom colors state
  const [customSolidColors, setCustomSolidColors] = useState<string[]>([]);
  const [customGradients, setCustomGradients] = useState<Array<{ from: string; to: string }>>([]);
  const [showSolidColorPicker, setShowSolidColorPicker] = useState(false);
  const [showGradientColorPicker, setShowGradientColorPicker] = useState(false);
  const [tempSolidColor, setTempSolidColor] = useState("#000000");
  const [tempGradientFrom, setTempGradientFrom] = useState("#000000");
  const [tempGradientTo, setTempGradientTo] = useState("#FFFFFF");
  
  // Drag to scroll state
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tabsScrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - tabsScrollRef.current.offsetLeft);
    setScrollLeft(tabsScrollRef.current.scrollLeft);
    tabsScrollRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tabsScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsScrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    tabsScrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    if (tabsScrollRef.current) {
      tabsScrollRef.current.style.cursor = 'grab';
    }
  };
  const [frameBorderColor, setFrameBorderColor] = useState(
    initialFrameBorderColor,
  );
  const [frameBorderThickness, setFrameBorderThickness] = useState(
    initialFrameBorderThickness,
  );

  const isFreeUser = !user?.plan || user?.plan === "Free";

  const gettingLockedCheck = (isLocked: boolean) => {
    return isLocked ? "" : "";
  };

  const THEMES_WITH_LOCK = [
    {
      id: "classic",
      name: "Classic",
      locked: false,
      thumbnail: "/themes/cus-1.png",
    },
    {
      id: "modern",
      name: "Modern",
      locked: isFreeUser, // Lock Modern theme for Free users
      thumbnail: "/themes/cus-2.png",
    },
    {
      id: "modern2",
      name: "Modern 2",
      locked: isFreeUser, // Lock Modern 2 theme for Free users
      thumbnail: "/themes/cus-4.png",
    },
    {
      id: "vertical",
      name: "Vertical",
      locked: isFreeUser, // Lock Vertical theme for Free users
      thumbnail: "/themes/cus-3.png",
    },
  ];

  const handleThemeChange = (themeId: string, isLocked: boolean) => {
    if (isLocked) {
      const featureName = themeId === "modern" ? "Modern Theme" 
        : themeId === "modern2" ? "Modern 2 Theme"
        : themeId === "vertical" ? "Vertical Theme" 
        : "Premium Theme";
      setUpgradeFeature(featureName);
      setShowUpgradeModal(true);
      return;
    }
    setSelectedTheme(themeId);
    onThemeChange?.(themeId);
  };

  const handleFontsTabClick = () => {
    if (isFreeUser) {
      setUpgradeFeature("Font Customization");
      setShowUpgradeModal(true);
      return;
    }
    setActiveTab("Fonts");
  };

  const handleVisibilityTabClick = () => {
    if (isFreeUser) {
      setUpgradeFeature("Visibility Controls");
      setShowUpgradeModal(true);
      return;
    }
    setActiveTab("Visibility");
  };

  const handleFrameColorChange = (color: string) => {
    setFrameBorderColor(color);
    onFrameChange?.(color, frameBorderThickness);
  };

  const handleFrameThicknessChange = (thickness: number) => {
    setFrameBorderThickness(thickness);
    onFrameChange?.(frameBorderColor, thickness);
  };

  const tabs: Tab[] = [
    "Background",
    "Pattern",
    "Theme",
    "Fonts",
    "Visibility",
    "Frame",
    "Ad Banner",
  ];

  return (
    <div className="bg-[#f5f0e8] p-6 border-2 border-[#d4c4b0] flex flex-col h-full md:min-h-0">
      {/* Tab Navigation - Modern Scrollable with fade indicators */}
      <div className="relative mb-6 -mx-6 flex-shrink-0">
        {/* Left fade indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#f5f0e8] to-transparent z-10 pointer-events-none" />
        
        {/* Right fade indicator */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#f5f0e8] to-transparent z-10 pointer-events-none" />
        
        <div 
          ref={tabsScrollRef}
          className="px-6 overflow-x-auto no-scrollbar scroll-smooth cursor-grab select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          <div className="flex gap-1 min-w-max border-b-2 border-[#d4c4b0]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={(e) => {
                  // Only trigger click if not dragging
                  if (isDragging) {
                    e.preventDefault();
                    return;
                  }
                  if (tab === "Fonts") {
                    handleFontsTabClick();
                  } else if (tab === "Visibility") {
                    handleVisibilityTabClick();
                  } else {
                    setActiveTab(tab);
                  }
                }}
                className={`px-4 py-3 text-sm font-medium font-inter transition-all relative whitespace-nowrap ${
                  activeTab === tab
                    ? "text-[#2c2419] bg-[#e8dcc8]"
                    : "text-[#5d4e37] hover:text-[#8b6834] hover:bg-[#faf8f5]"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {tab}
                  {tab === "Fonts" && isFreeUser && <Lock className="w-3 h-3" />}
                  {tab === "Visibility" && isFreeUser && <Lock className="w-3 h-3" />}
                </span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#8b6834]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto space-y-3 md:min-h-0 no-scrollbar">
        {/* Background Tab */}
        {activeTab === "Background" && (
          <>
            {/* Solid Colors Section */}
            <div>
              <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                Solid Colors{" "}
                <span className="text-xs text-[#5d4e37]">
                  ({SOLID_COLORS.length + customSolidColors.length} colors)
                </span>
              </h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {/* Preset Colors */}
                {SOLID_COLORS.map((item, index) => {
                  const isLocked = isFreeUser && index > 0;
                  return (
                    <button
                      key={item.color}
                      onClick={() => {
                        if (isLocked) {
                          setUpgradeFeature("Premium Colors");
                          setShowUpgradeModal(true);
                          return;
                        }
                        onBackgroundChange({
                          type: "solid",
                          color: item.color,
                        });
                      }}
                      className={`relative w-14 h-14 flex-shrink-0 border-2 transition-all overflow-hidden ${
                        background.type === "solid" &&
                        background.color === item.color
                          ? "border-[#8b6834] shadow-md"
                          : "border-[#d4c4b0] hover:scale-95"
                      } ${gettingLockedCheck(isLocked)}`}
                      style={{ backgroundColor: item.color }}
                      title={item.name}
                    >
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-white drop-shadow-md" />
                        </div>
                      )}
                      {background.type === "solid" &&
                        background.color === item.color && (
                          <div className="absolute bottom-0 left-0 right-0 bg-[#8b6834] text-[#faf8f5] text-[10px] font-inter text-center py-0.5">
                            selected
                          </div>
                        )}
                    </button>
                  );
                })}
                
                {/* Custom Colors */}
                {customSolidColors.map((color, index) => (
                  <button
                    key={`custom-${color}`}
                    onClick={() => {
                      onBackgroundChange({
                        type: "solid",
                        color: color,
                      });
                    }}
                    className={`relative w-14 h-14 border-2 transition-all overflow-visible flex-shrink-0 group ${
                      background.type === "solid" &&
                      background.color === color
                        ? "border-[#8b6834] shadow-md"
                        : "border-[#d4c4b0] hover:scale-95"
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {background.type === "solid" &&
                      background.color === color && (
                        <div className="absolute bottom-0 left-0 right-0 bg-[#8b6834] text-[#faf8f5] text-[10px] font-inter text-center py-0.5">
                          selected
                        </div>
                      )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomSolidColors(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="absolute top-1 right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm opacity-0 group-hover:opacity-100 z-10"
                      title="Remove color"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </button>
                ))}
                
                {/* Add Custom Color Button */}
                {customSolidColors.length < 2 && (
                  <button
                    onClick={() => {
                      if (isFreeUser) {
                        setUpgradeFeature("Custom Colors");
                        setShowUpgradeModal(true);
                        return;
                      }
                      setShowSolidColorPicker(!showSolidColorPicker);
                    }}
                    className={`relative w-14 h-14 flex-shrink-0 border-2 border-dashed transition-all overflow-hidden flex items-center justify-center ${
                      isFreeUser 
                        ? "border-[#d4c4b0] bg-[#faf8f5]" 
                        : "border-[#8b6834] bg-[#faf8f5] hover:bg-[#e8dcc8]"
                    }`}
                    title={isFreeUser ? "Upgrade to add custom colors" : "Add custom color"}
                  >
                    {isFreeUser ? (
                      <Lock className="w-5 h-5 text-[#5d4e37]" />
                    ) : (
                      <Plus className="w-5 h-5 text-[#8b6834]" />
                    )}
                  </button>
                )}
              </div>
              
              {/* Color Picker Modal for Solid */}
              {showSolidColorPicker && (
                <div className="mt-3 bg-[#faf8f5] border-2 border-[#8b6834] p-4 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-[#2c2419] font-inter">
                      Pick a custom color
                    </label>
                    <button
                      onClick={() => setShowSolidColorPicker(false)}
                      className="text-[#5d4e37] hover:text-[#2c2419]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={tempSolidColor}
                      onChange={(e) => setTempSolidColor(e.target.value)}
                      className="h-12 w-20 border-2 border-[#d4c4b0] cursor-pointer shadow-sm"
                    />
                    <div className="flex-1 bg-white border-2 border-[#d4c4b0] px-4 py-3 flex items-center">
                      <input
                        type="text"
                        value={tempSolidColor.toUpperCase()}
                        onChange={(e) => {
                          let value = e.target.value.toUpperCase();
                          // Always start with #
                          if (!value.startsWith('#')) {
                            value = '#' + value.replace(/[^0-9A-F]/g, '');
                          } else {
                            value = '#' + value.slice(1).replace(/[^0-9A-F]/g, '');
                          }
                          value = value.slice(0, 7);
                          setTempSolidColor(value);
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value.length !== 7 || !/^#[0-9A-F]{6}$/i.test(value)) {
                            setTempSolidColor('#000000');
                          }
                        }}
                        placeholder="#000000"
                        className="w-full text-sm font-mono text-[#2c2419] font-semibold bg-transparent outline-none"
                        maxLength={7}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (tempSolidColor.length === 7 && !customSolidColors.includes(tempSolidColor)) {
                        setCustomSolidColors(prev => [...prev, tempSolidColor]);
                        onBackgroundChange({
                          type: "solid",
                          color: tempSolidColor,
                        });
                        setShowSolidColorPicker(false);
                        setTempSolidColor("#000000");
                      }
                    }}
                    className="w-full mt-3 py-2 bg-[#8b6834] text-[#faf8f5] font-inter font-semibold hover:bg-[#2c2419] transition-colors"
                    disabled={tempSolidColor.length !== 7}
                  >
                    Add Color
                  </button>
                </div>
              )}
            </div>

            {/* Gradients Section */}
            <div>
              <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                Gradients{" "}
                <span className="text-xs text-[#5d4e37]">
                  ({GRADIENTS.length + customGradients.length} colors)
                </span>
              </h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {/* Preset Gradients */}
                {GRADIENTS.map((grad, index) => {
                  const isLocked = isFreeUser;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (isLocked) {
                          setUpgradeFeature("Gradients");
                          setShowUpgradeModal(true);
                          return;
                        }
                        onBackgroundChange({
                          type: "gradient",
                          color: "",
                          gradientFrom: grad.from,
                          gradientTo: grad.to,
                        });
                      }}
                      className={`relative w-14 h-14 flex-shrink-0 border-2 transition-all overflow-hidden ${
                        background.type === "gradient" &&
                        background.gradientFrom === grad.from &&
                        background.gradientTo === grad.to
                          ? "border-[#8b6834] shadow-md"
                          : "border-[#d4c4b0] hover:scale-95"
                      } ${gettingLockedCheck(isLocked)}`}
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                      }}
                      title={grad.name}
                    >
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-white drop-shadow-md" />
                        </div>
                      )}
                      {background.type === "gradient" &&
                        background.gradientFrom === grad.from &&
                        background.gradientTo === grad.to && (
                          <div className="absolute bottom-0 left-0 right-0 bg-[#2c2419]/70 text-[#faf8f5] text-[10px] font-inter text-center py-1">
                            selected
                          </div>
                        )}
                    </button>
                  );
                })}
                
                {/* Custom Gradients */}
                {customGradients.map((grad, index) => (
                  <button
                    key={`custom-grad-${index}`}
                    onClick={() => {
                      onBackgroundChange({
                        type: "gradient",
                        color: "",
                        gradientFrom: grad.from,
                        gradientTo: grad.to,
                      });
                    }}
                    className={`relative w-14 h-14 border-2 transition-all overflow-visible flex-shrink-0 group ${
                      background.type === "gradient" &&
                      background.gradientFrom === grad.from &&
                      background.gradientTo === grad.to
                        ? "border-[#8b6834] shadow-md"
                        : "border-[#d4c4b0] hover:scale-95"
                    }`}
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                    }}
                  >
                    {background.type === "gradient" &&
                      background.gradientFrom === grad.from &&
                      background.gradientTo === grad.to && (
                        <div className="absolute bottom-0 left-0 right-0 bg-[#2c2419]/70 text-[#faf8f5] text-[10px] font-inter text-center py-1">
                          selected
                        </div>
                      )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomGradients(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="absolute top-1 right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm opacity-0 group-hover:opacity-100 z-10"
                      title="Remove gradient"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </button>
                ))}
                
                {/* Add Custom Gradient Button */}
                {customGradients.length < 2 && (
                  <button
                    onClick={() => {
                      if (isFreeUser) {
                        setUpgradeFeature("Custom Gradients");
                        setShowUpgradeModal(true);
                        return;
                      }
                      setShowGradientColorPicker(!showGradientColorPicker);
                    }}
                    className={`relative w-14 h-14 flex-shrink-0 border-2 border-dashed transition-all overflow-hidden flex items-center justify-center ${
                      isFreeUser 
                        ? "border-[#d4c4b0] bg-[#faf8f5]" 
                        : "border-[#8b6834] bg-[#faf8f5] hover:bg-[#e8dcc8]"
                    }`}
                    title={isFreeUser ? "Upgrade to add custom gradients" : "Add custom gradient"}
                  >
                    {isFreeUser ? (
                      <Lock className="w-5 h-5 text-[#5d4e37]" />
                    ) : (
                      <Plus className="w-5 h-5 text-[#8b6834]" />
                    )}
                  </button>
                )}
              </div>
              
              {/* Gradient Picker Modal */}
              {showGradientColorPicker && (
                <div className="mt-3 bg-[#faf8f5] border-2 border-[#8b6834] p-4 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-[#2c2419] font-inter">
                      Create custom gradient
                    </label>
                    <button
                      onClick={() => setShowGradientColorPicker(false)}
                      className="text-[#5d4e37] hover:text-[#2c2419]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* From Color */}
                  <div className="mb-3">
                    <label className="text-xs font-medium text-[#5d4e37] mb-1 block">
                      From Color
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={tempGradientFrom}
                        onChange={(e) => setTempGradientFrom(e.target.value)}
                        className="h-10 w-16 border-2 border-[#d4c4b0] cursor-pointer"
                      />
                      <div className="flex-1 bg-white border-2 border-[#d4c4b0] px-3 py-2 flex items-center">
                        <input
                          type="text"
                          value={tempGradientFrom.toUpperCase()}
                          onChange={(e) => {
                            let value = e.target.value.toUpperCase();
                            if (!value.startsWith('#')) {
                              value = '#' + value.replace(/[^0-9A-F]/g, '');
                            } else {
                              value = '#' + value.slice(1).replace(/[^0-9A-F]/g, '');
                            }
                            value = value.slice(0, 7);
                            setTempGradientFrom(value);
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value.length !== 7 || !/^#[0-9A-F]{6}$/i.test(value)) {
                              setTempGradientFrom('#000000');
                            }
                          }}
                          placeholder="#000000"
                          className="w-full text-sm font-mono text-[#2c2419] bg-transparent outline-none"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* To Color */}
                  <div className="mb-3">
                    <label className="text-xs font-medium text-[#5d4e37] mb-1 block">
                      To Color
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={tempGradientTo}
                        onChange={(e) => setTempGradientTo(e.target.value)}
                        className="h-10 w-16 border-2 border-[#d4c4b0] cursor-pointer"
                      />
                      <div className="flex-1 bg-white border-2 border-[#d4c4b0] px-3 py-2 flex items-center">
                        <input
                          type="text"
                          value={tempGradientTo.toUpperCase()}
                          onChange={(e) => {
                            let value = e.target.value.toUpperCase();
                            if (!value.startsWith('#')) {
                              value = '#' + value.replace(/[^0-9A-F]/g, '');
                            } else {
                              value = '#' + value.slice(1).replace(/[^0-9A-F]/g, '');
                            }
                            value = value.slice(0, 7);
                            setTempGradientTo(value);
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value.length !== 7 || !/^#[0-9A-F]{6}$/i.test(value)) {
                              setTempGradientTo('#FFFFFF');
                            }
                          }}
                          placeholder="#FFFFFF"
                          className="w-full text-sm font-mono text-[#2c2419] bg-transparent outline-none"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview */}
                  <div className="mb-3">
                    <label className="text-xs font-medium text-[#5d4e37] mb-1 block">
                      Preview
                    </label>
                    <div 
                      className="w-full h-16 border-2 border-[#d4c4b0]"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${tempGradientFrom}, ${tempGradientTo})`,
                      }}
                    />
                  </div>
                  
                  <button
                    onClick={() => {
                      if (tempGradientFrom.length === 7 && tempGradientTo.length === 7) {
                        const newGrad = { from: tempGradientFrom, to: tempGradientTo };
                        const exists = customGradients.some(g => g.from === newGrad.from && g.to === newGrad.to);
                        if (!exists) {
                          setCustomGradients(prev => [...prev, newGrad]);
                          onBackgroundChange({
                            type: "gradient",
                            color: "",
                            gradientFrom: tempGradientFrom,
                            gradientTo: tempGradientTo,
                          });
                          setShowGradientColorPicker(false);
                          setTempGradientFrom("#000000");
                          setTempGradientTo("#FFFFFF");
                        }
                      }
                    }}
                    className="w-full py-2 bg-[#8b6834] text-[#faf8f5] font-inter font-semibold hover:bg-[#2c2419] transition-colors"
                    disabled={tempGradientFrom.length !== 7 || tempGradientTo.length !== 7}
                  >
                    Add Gradient
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Pattern Tab */}
        {activeTab === "Pattern" && (
          <div className="space-y-6">
            {/* Pattern Selection */}
            <div>
              <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                Select Pattern
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {PATTERNS.map((pattern) => {
                  const isLocked =
                    isFreeUser &&
                    ["lines", "grid", "checks", "curves", "custom"].includes(
                      pattern.id,
                    );
                  const isActive = background.pattern === pattern.id;

                  return (
                    <button
                      key={pattern.id}
                      onClick={() => {
                        if (isLocked) {
                          setUpgradeFeature("Premium Patterns");
                          setShowUpgradeModal(true);
                          return;
                        }
                        onBackgroundChange({
                          ...background,
                          pattern: pattern.id,
                        });
                      }}
                      className={`aspect-square flex flex-col items-center justify-center p-2 border-2 transition-all overflow-hidden relative ${
                        isActive
                          ? "border-[#8b6834] bg-[#e8dcc8]"
                          : "border-[#d4c4b0] bg-[#faf8f5] hover:border-[#8b6834]"
                      } ${gettingLockedCheck(isLocked)}`}
                    >
                      {/* Visual Preview */}
                      <div className="w-full h-full mb-1 border border-black/5 overflow-hidden bg-white/50 relative">
                        {pattern.id === "none" && (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                            None
                          </div>
                        )}
                        {pattern.id === "custom" && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Upload className="w-4 h-4 text-[#5d4e37]" />
                          </div>
                        )}

                        {/* CSS Previews for Patterns */}
                        {pattern.id === "dots" && (
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage:
                                "radial-gradient(#8b6834 1px, transparent 1px)",
                              backgroundSize: "8px 8px",
                            }}
                          />
                        )}
                        {pattern.id === "lines" && (
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage:
                                "repeating-linear-gradient(45deg, #8b6834, #8b6834 1px, transparent 1px, transparent 6px)",
                            }}
                          />
                        )}
                        {pattern.id === "grid" && (
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage:
                                "linear-gradient(#8b6834 1px, transparent 1px), linear-gradient(90deg, #8b6834 1px, transparent 1px)",
                              backgroundSize: "8px 8px",
                            }}
                          />
                        )}
                        {pattern.id === "checks" && (
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage:
                                "repeating-linear-gradient(45deg, #8b6834 25%, transparent 25%, transparent 75%, #8b6834 75%, #8b6834), repeating-linear-gradient(45deg, #8b6834 25%, transparent 25%, transparent 75%, #8b6834 75%, #8b6834)",
                              backgroundSize: "10px 10px",
                              backgroundPosition: "0 0, 5px 5px",
                              opacity: 0.5,
                            }}
                          />
                        )}
                        {pattern.id === "curves" && (
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage:
                                "repeating-radial-gradient(circle at 0 0, transparent 0, #8b6834 1px, transparent 2px, transparent 4px)",
                              backgroundSize: "16px 16px",
                              opacity: 0.6,
                            }}
                          />
                        )}
                        {pattern.id === "abstract" && (
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage:
                                "radial-gradient(circle at 50% 50%, #8b6834 2px, transparent 2.5px), radial-gradient(circle at 0% 0%, #8b6834 2px, transparent 2.5px)",
                              backgroundSize: "16px 16px",
                              opacity: 0.6,
                            }}
                          />
                        )}

                        {/* Lock Overlay for restricted patterns */}
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                            <Lock className="w-5 h-5 text-white drop-shadow-md" />
                          </div>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-medium leading-tight ${isActive ? "text-[#2c2419]" : "text-[#5d4e37]"}`}
                      >
                        {pattern.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom File Upload Input */}
            {background.pattern === "custom" && (
              <div className="bg-[#e8dcc8] p-4 border border-[#d4c4b0]">
                <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-2">
                  Upload Pattern Image
                </h3>
                <label className="block border-2 border-dashed border-[#8b6834]/50 bg-[#faf8f5] hover:bg-white transition-colors cursor-pointer p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          onBackgroundChange({
                            ...background,
                            patternImage: reader.result as string,
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Upload className="w-5 h-5 mx-auto mb-2 text-[#8b6834]" />
                  <p className="text-xs text-[#5d4e37] font-medium">
                    Click to upload image
                  </p>
                  <p className="text-[10px] text-[#5d4e37]/70 mt-1">
                    Supports PNG, JPG (will be used as overlay)
                  </p>
                </label>
                {background.patternImage && (
                  <div className="mt-2 text-xs text-green-700 flex items-center gap-1 font-medium">
                    <div className="w-2 h-2 bg-green-500" /> Image loaded
                    successfully
                  </div>
                )}
              </div>
            )}

            {/* Pattern Color & Opacity - Only show if pattern is selected and NOT custom/none */}
            {background.pattern && background.pattern !== "none" && (
              <>
                {/* Pattern Color - Hidden for Custom */}
                {background.pattern !== "custom" && (
                  <div>
                    <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                      Pattern Color
                    </h3>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                      <button
                        onClick={() =>
                          onBackgroundChange({
                            ...background,
                            patternColor: "#FFFFFF",
                          })
                        }
                        className={`w-10 h-10 flex-shrink-0 border-2 ${background.patternColor === "#FFFFFF" ? "border-black" : "border-[#d4c4b0]"}`}
                        style={{ backgroundColor: "#FFFFFF" }}
                        title="White"
                      />
                      <button
                        onClick={() =>
                          onBackgroundChange({
                            ...background,
                            patternColor: "#000000",
                          })
                        }
                        className={`w-10 h-10 flex-shrink-0 border-2 ${background.patternColor === "#000000" ? "border-black" : "border-[#d4c4b0]"}`}
                        style={{ backgroundColor: "#000000" }}
                        title="Black"
                      />
                      {SOLID_COLORS.map((item) => (
                        <button
                          key={item.color}
                          onClick={() =>
                            onBackgroundChange({
                              ...background,
                              patternColor: item.color,
                            })
                          }
                          className={`w-10 h-10 flex-shrink-0 border-2 transition-all ${
                            background.patternColor === item.color
                              ? "border-black"
                              : "border-[#d4c4b0]"
                          }`}
                          style={{ backgroundColor: item.color }}
                          title={item.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Opacity Slider - Available for Custom too */}
                <div>
                  <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                    Opacity
                  </h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0.05"
                      max="0.8"
                      step="0.05"
                      value={background.patternOpacity || 0.1}
                      onChange={(e) =>
                        onBackgroundChange({
                          ...background,
                          patternOpacity: parseFloat(e.target.value),
                        })
                      }
                      className="flex-1 h-1 bg-[#e8dcc8] appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${(((background.patternOpacity || 0.1) - 0.05) / 0.75) * 100}%, #e8dcc8 ${(((background.patternOpacity || 0.1) - 0.05) / 0.75) * 100}%, #e8dcc8 100%)`,
                      }}
                    />
                    <div className="w-12 text-right text-md font-medium font-inter text-[#2c2419]">
                      {Math.round((background.patternOpacity || 0.1) * 100)}%
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Theme Tab */}
        {activeTab === "Theme" && (
          <div>
            <div className="grid grid-cols-2 gap-4">
              {THEMES_WITH_LOCK.map((theme) => (
                <div key={theme.id} className="flex flex-col">
                  <button
                    onClick={() => handleThemeChange(theme.id, theme.locked)}
                    className={`w-full transition-all duration-200 border-2 overflow-hidden ${
                      selectedTheme === theme.id && !theme.locked
                        ? "border-[#8b6834] shadow-lg shadow-[#8b6834]/30"
                        : "border-[#d4c4b0] hover:border-[#8b6834] hover:shadow-md"
                    } ${theme.locked ? "opacity-80 cursor-pointer" : "cursor-pointer"}`}
                  >
                    <div className="relative w-full h-36 bg-[#f5f0e8]">
                      <img
                        src={theme.thumbnail}
                        alt={theme.name}
                        className="w-full h-full object-contain"
                      />

                      {theme.locked && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Lock className="w-8 h-8 text-white drop-shadow-lg" />
                        </div>
                      )}

                      {/* Selected indicator at bottom inside the image area */}
                      {selectedTheme === theme.id && !theme.locked && (
                        <div className="absolute bottom-0 left-0 right-0 w-full bg-[#8b6834] py-0.5 text-center">
                          <span className="text-[#faf8f5] text-sm font-inter font-semibold">
                            Selected
                          </span>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Theme Name outside box below */}
                  <div className="mt-2 text-center text-sm font-medium font-inter text-[#2c2419]">
                    {theme.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fonts Tab */}
        {activeTab === "Fonts" && fontStyles && onFontStylesChange && (
          <div className="space-y-5">
            {/* Week & Date Font Settings - Combined */}
            <div>
              {/* Header */}
              <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-8">
                Week & Date
              </h3>
              
              {/* Content */}
              <div className="space-y-4">
                {/* Font Size */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-[#2c2419] font-inter">
                      Font Size
                    </label>
                    <span className="text-sm font-bold text-[#8b6834] bg-[#e8dcc8] px-3 py-1 border border-[#d4c4b0]">
                      {fontStyles.week.fontSize}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="32"
                    value={parseInt(fontStyles.week.fontSize)}
                    onChange={(e) =>
                      onFontStylesChange({
                        ...fontStyles,
                        week: {
                          ...fontStyles.week,
                          fontSize: `${e.target.value}px`,
                        },
                        date: {
                          ...fontStyles.date,
                          fontSize: `${e.target.value}px`,
                        },
                      })
                    }
                    className="w-full h-1 bg-[#e8dcc8] appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${((parseInt(fontStyles.week.fontSize) - 12) / 20) * 100}%, #e8dcc8 ${((parseInt(fontStyles.week.fontSize) - 12) / 20) * 100}%, #e8dcc8 100%)`
                    }}
                  />
                </div>

                {/* Font Weight */}
                <div>
                  <label className="text-sm font-medium text-[#2c2419] mb-2 block font-inter">
                    Font Weight
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["400", "500", "600", "700"].map((weight) => (
                      <button
                        key={weight}
                        onClick={() =>
                          onFontStylesChange({
                            ...fontStyles,
                            week: { ...fontStyles.week, fontWeight: weight },
                            date: { ...fontStyles.date, fontWeight: weight },
                          })
                        }
                        className={`py-2.5 text-xs font-semibold border-2 transition-all duration-200 ${
                          fontStyles.week.fontWeight === weight
                            ? "border-[#8b6834] bg-[#8b6834] text-[#faf8f5]"
                            : "border-[#d4c4b0] bg-white text-[#2c2419] hover:border-[#8b6834] hover:bg-[#faf8f5]"
                        }`}
                      >
                        {weight === "400"
                          ? "Normal"
                          : weight === "500"
                            ? "Medium"
                            : weight === "600"
                              ? "Semi"
                              : "Bold"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="text-sm font-medium text-[#2c2419] mb-2 block font-inter">
                    Text Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={fontStyles.week.color}
                      onChange={(e) =>
                        onFontStylesChange({
                          ...fontStyles,
                          week: { ...fontStyles.week, color: e.target.value },
                          date: { ...fontStyles.date, color: e.target.value },
                        })
                      }
                      className="h-12 w-20 border-2 border-[#d4c4b0] cursor-pointer shadow-sm"
                    />
                    <div className="flex-1 bg-white border-2 border-[#d4c4b0] px-4 py-3 flex items-center">
                      <input
                        type="text"
                        value={fontStyles.week.color.toUpperCase()}
                        onChange={(e) => {
                          let value = e.target.value.toUpperCase();
                          // Always start with #
                          if (!value.startsWith('#')) {
                            value = '#' + value.replace(/[^0-9A-F]/g, '');
                          } else {
                            // Remove # temporarily, filter invalid chars, then add # back
                            value = '#' + value.slice(1).replace(/[^0-9A-F]/g, '');
                          }
                          // Limit to 7 characters (#XXXXXX)
                          value = value.slice(0, 7);
                          
                          if (value.length === 7) {
                            onFontStylesChange({
                              ...fontStyles,
                              week: { ...fontStyles.week, color: value },
                              date: { ...fontStyles.date, color: value },
                            });
                          }
                        }}
                        onBlur={(e) => {
                          // On blur, ensure we have a valid hex or revert
                          const value = e.target.value;
                          if (value.length !== 7 || !/^#[0-9A-F]{6}$/i.test(value)) {
                            // Revert to current valid color if invalid
                            e.target.value = fontStyles.week.color.toUpperCase();
                          }
                        }}
                        placeholder="#000000"
                        className="w-full text-sm font-mono text-[#2c2419] font-semibold bg-transparent outline-none"
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Headline Font Settings */}
            <div>
              {/* Header */}
              <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3 pt-4 border-t-2 border-[#d4c4b0]">
                Headline
              </h3>
              
              {/* Content */}
              <div className="space-y-4">
                {/* Font Size */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-[#2c2419] font-inter">
                      Font Size
                    </label>
                    <span className="text-sm font-bold text-[#8b6834] bg-[#e8dcc8] px-3 py-1 border border-[#d4c4b0]">
                      {fontStyles.headline.fontSize}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="48"
                    value={parseInt(fontStyles.headline.fontSize)}
                    onChange={(e) =>
                      onFontStylesChange({
                        ...fontStyles,
                        headline: {
                          ...fontStyles.headline,
                          fontSize: `${e.target.value}px`,
                        },
                      })
                    }
                    className="w-full h-1 bg-[#e8dcc8] appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${((parseInt(fontStyles.headline.fontSize) - 16) / 32) * 100}%, #e8dcc8 ${((parseInt(fontStyles.headline.fontSize) - 16) / 32) * 100}%, #e8dcc8 100%)`
                    }}
                  />
                </div>

                {/* Font Weight */}
                <div>
                  <label className="text-sm font-medium text-[#2c2419] mb-2 block font-inter">
                    Font Weight
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {["400", "500", "600", "700", "800"].map((weight) => (
                      <button
                        key={weight}
                        onClick={() =>
                          onFontStylesChange({
                            ...fontStyles,
                            headline: {
                              ...fontStyles.headline,
                              fontWeight: weight,
                            },
                          })
                        }
                        className={`py-2.5 text-xs font-semibold border-2 transition-all duration-200 ${
                          fontStyles.headline.fontWeight === weight
                            ? "border-[#8b6834] bg-[#8b6834] text-[#faf8f5]"
                            : "border-[#d4c4b0] bg-white text-[#2c2419] hover:border-[#8b6834] hover:bg-[#faf8f5]"
                        }`}
                        style={{ fontWeight: weight }}
                      >
                        {weight === "400"
                          ? "Light"
                          : weight === "500"
                            ? "Medium"
                            : weight === "600"
                              ? "Semi"
                              : weight === "700"
                                ? "Bold"
                                : "XBold"}
                      </button>
                    ))}\n                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="text-sm font-medium text-[#2c2419] mb-2 block font-inter">
                    Text Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={fontStyles.headline.color}
                      onChange={(e) =>
                        onFontStylesChange({
                          ...fontStyles,
                          headline: {
                            ...fontStyles.headline,
                            color: e.target.value,
                          },
                        })
                      }
                      className="h-12 w-20 border-2 border-[#d4c4b0] cursor-pointer shadow-sm"
                    />
                    <div className="flex-1 bg-white border-2 border-[#d4c4b0] px-4 py-3 flex items-center">
                      <input
                        type="text"
                        value={fontStyles.headline.color.toUpperCase()}
                        onChange={(e) => {
                          let value = e.target.value.toUpperCase();
                          // Always start with #
                          if (!value.startsWith('#')) {
                            value = '#' + value.replace(/[^0-9A-F]/g, '');
                          } else {
                            // Remove # temporarily, filter invalid chars, then add # back
                            value = '#' + value.slice(1).replace(/[^0-9A-F]/g, '');
                          }
                          // Limit to 7 characters (#XXXXXX)
                          value = value.slice(0, 7);
                          
                          if (value.length === 7) {
                            onFontStylesChange({
                              ...fontStyles,
                              headline: {
                                ...fontStyles.headline,
                                color: value,
                              },
                            });
                          }
                        }}
                        onBlur={(e) => {
                          // On blur, ensure we have a valid hex or revert
                          const value = e.target.value;
                          if (value.length !== 7 || !/^#[0-9A-F]{6}$/i.test(value)) {
                            // Revert to current valid color if invalid
                            e.target.value = fontStyles.headline.color.toUpperCase();
                          }
                        }}
                        placeholder="#000000"
                        className="w-full text-sm font-mono text-[#2c2419] font-semibold bg-transparent outline-none"
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>

                {/* Text Align */}
                <div>
                  <label className="text-sm font-medium text-[#2c2419] mb-2 flex items-center gap-1.5 font-inter">
                    <svg className="w-3.5 h-3.5 text-[#8b6834]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                    </svg>
                    Text Alignment
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["left", "center", "right"] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() =>
                          onFontStylesChange({
                            ...fontStyles,
                            headline: {
                              ...fontStyles.headline,
                              textAlign: align,
                            },
                          })
                        }
                        className={`py-2.5 text-xs font-semibold border-2 transition-all duration-200 capitalize flex items-center justify-center gap-1 ${
                          fontStyles.headline.textAlign === align
                            ? "border-[#8b6834] bg-[#8b6834] text-[#faf8f5]"
                            : "border-[#d4c4b0] bg-white text-[#2c2419] hover:border-[#8b6834] hover:bg-[#faf8f5]"
                        }`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {align === "left" && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" />
                          )}
                          {align === "center" && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M5 18h14" />
                          )}
                          {align === "right" && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h14" />
                          )}
                        </svg>
                        {align}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Shadow */}
                <div>
                  <label className="text-sm font-medium text-[#2c2419] mb-2 block font-inter">
                    Text Shadow
                  </label>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {(["none", "soft", "hard", "glow", "outline"] as const).map((preset) => (
                      <button
                        key={preset}
                        onClick={() =>
                          onFontStylesChange({
                            ...fontStyles,
                            headline: {
                              ...fontStyles.headline,
                              textShadow: {
                                preset,
                                angle: fontStyles.headline.textShadow?.angle || 135,
                              },
                            },
                          })
                        }
                        className={`py-2.5 text-xs font-semibold border-2 transition-all duration-200 capitalize ${
                          (fontStyles.headline.textShadow?.preset || "none") === preset
                            ? "border-[#8b6834] bg-[#8b6834] text-[#faf8f5]"
                            : "border-[#d4c4b0] bg-white text-[#2c2419] hover:border-[#8b6834] hover:bg-[#faf8f5]"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  
                  {/* Shadow Angle - Only show if not "none" */}
                  {fontStyles.headline.textShadow?.preset && fontStyles.headline.textShadow.preset !== "none" && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-[#2c2419] font-inter">
                          Shadow Angle
                        </label>
                        <span className="text-xs font-bold text-[#8b6834] bg-[#e8dcc8] px-2 py-0.5 border border-[#d4c4b0]">
                          {fontStyles.headline.textShadow?.angle || 135}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="15"
                        value={fontStyles.headline.textShadow?.angle || 135}
                        onChange={(e) =>
                          onFontStylesChange({
                            ...fontStyles,
                            headline: {
                              ...fontStyles.headline,
                              textShadow: {
                                preset: fontStyles.headline.textShadow?.preset || "soft",
                                angle: parseInt(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full h-1 bg-[#e8dcc8] appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${((fontStyles.headline.textShadow?.angle || 135) / 360) * 100}%, #e8dcc8 ${((fontStyles.headline.textShadow?.angle || 135) / 360) * 100}%, #e8dcc8 100%)`
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Text Stroke */}
                <div>
                  <label className="text-sm font-medium text-[#2c2419] mb-2 block font-inter">
                    Text Stroke
                  </label>
                  
                  {/* Stroke Width */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-[#2c2419] font-inter">
                        Stroke Width
                      </label>
                      <span className="text-xs font-bold text-[#8b6834] bg-[#e8dcc8] px-2 py-0.5 border border-[#d4c4b0]">
                        {fontStyles.headline.textStroke?.width || 0}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={fontStyles.headline.textStroke?.width || 0}
                      onChange={(e) =>
                        onFontStylesChange({
                          ...fontStyles,
                          headline: {
                            ...fontStyles.headline,
                            textStroke: {
                              width: parseFloat(e.target.value),
                              color: fontStyles.headline.textStroke?.color || "#000000",
                            },
                          },
                        })
                      }
                      className="w-full h-1 bg-[#e8dcc8] appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${((fontStyles.headline.textStroke?.width || 0) / 5) * 100}%, #e8dcc8 ${((fontStyles.headline.textStroke?.width || 0) / 5) * 100}%, #e8dcc8 100%)`
                      }}
                    />
                  </div>
                  
                  {/* Stroke Color - Only show if width > 0 */}
                  {(fontStyles.headline.textStroke?.width || 0) > 0 && (
                    <div>
                      <label className="text-xs font-medium text-[#2c2419] mb-1 block font-inter">
                        Stroke Color
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={fontStyles.headline.textStroke?.color || "#000000"}
                          onChange={(e) =>
                            onFontStylesChange({
                              ...fontStyles,
                              headline: {
                                ...fontStyles.headline,
                                textStroke: {
                                  width: fontStyles.headline.textStroke?.width || 0,
                                  color: e.target.value,
                                },
                              },
                            })
                          }
                          className="h-10 w-16 border-2 border-[#d4c4b0] cursor-pointer shadow-sm"
                        />
                        <div className="flex-1 bg-white border-2 border-[#d4c4b0] px-3 py-2 flex items-center">
                          <input
                            type="text"
                            value={(fontStyles.headline.textStroke?.color || "#000000").toUpperCase()}
                            onChange={(e) => {
                              let value = e.target.value.toUpperCase();
                              if (!value.startsWith('#')) {
                                value = '#' + value.replace(/[^0-9A-F]/g, '');
                              } else {
                                value = '#' + value.slice(1).replace(/[^0-9A-F]/g, '');
                              }
                              value = value.slice(0, 7);
                              
                              if (value.length === 7) {
                                onFontStylesChange({
                                  ...fontStyles,
                                  headline: {
                                    ...fontStyles.headline,
                                    textStroke: {
                                      width: fontStyles.headline.textStroke?.width || 0,
                                      color: value,
                                    },
                                  },
                                });
                              }
                            }}
                            placeholder="#000000"
                            className="w-full text-sm font-mono text-[#2c2419] bg-transparent outline-none"
                            maxLength={7}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Font Selection Modal (Placeholder) */}
            {showFontModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-[#faf8f5] border-2 border-[#d4c4b0] p-6 max-w-md w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-lora font-bold text-[#2c2419]">
                      Select Font -{" "}
                      {selectedFontType === "weekDate"
                        ? "Week & Date"
                        : "Headline"}
                    </h3>
                    <button
                      onClick={() => setShowFontModal(false)}
                      className="text-[#5d4e37] hover:text-[#2c2419]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {/* Font options would go here */}
                    <button
                      onClick={() => {
                        // placeholder: apply font selection for Week/Headline in future
                        setShowFontModal(false);
                      }}
                      className="w-full p-3 bg-[#f5f0e8] hover:bg-[#e8dcc8] transition-colors flex items-center justify-between"
                    >
                      <div className="flex-1 text-left">
                        <span className="font-noto-bengali text-[#2c2419] block">
                          আমার সোনার বাংলা
                        </span>
                      </div>
                      <div className="ml-4 text-sm font-inter text-[#5d4e37]">
                        Noto Serif Bengali
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowFontModal(false);
                      }}
                      className="w-full p-3 bg-[#f5f0e8] hover:bg-[#e8dcc8] transition-colors flex items-center justify-between"
                    >
                      <div className="flex-1 text-left">
                        <span className="font-dm-sans text-[#2c2419] block">
                          আমার সোনার বাংলা
                        </span>
                      </div>
                      <div className="ml-4 text-sm font-inter text-[#5d4e37]">
                        DM Sans
                      </div>
                    </button>

                    <div className="w-full p-3 bg-[#f5f0e8] transition-colors flex items-center justify-between opacity-50 cursor-not-allowed">
                      <div className="flex-1 text-left">
                        <span className="text-base font-inter text-[#5d4e37] block">
                          Font preview
                        </span>
                      </div>
                      <div className="ml-4 text-sm font-inter text-[#5d4e37]">
                        More fonts coming soon...
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFontModal(false)}
                    className="w-full mt-4 px-4 py-2 bg-[#2c2419] text-[#faf8f5] font-inter font-medium hover:bg-[#8b6834] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Visibility Tab */}
        {activeTab === "Visibility" && visibilitySettings && onVisibilityChange && (
          <div className="space-y-3">
            <p className="text-sm text-[#5d4e37] font-inter mb-4">
              Toggle elements visibility on your card
            </p>

            {/* Week Toggle */}
            <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {visibilitySettings.showWeek ? (
                  <Eye className="w-5 h-5 text-[#8b6834]" />
                ) : (
                  <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                )}
                <span className="text-sm font-medium font-inter text-[#2c2419]">
                  Week
                </span>
              </div>
              <button
                onClick={() =>
                  onVisibilityChange({
                    ...visibilitySettings,
                    showWeek: !visibilitySettings.showWeek,
                  })
                }
                className={`relative w-14 h-7 transition-colors border-2 ${
                  visibilitySettings.showWeek
                    ? "bg-[#8b6834] border-[#8b6834]"
                    : "bg-[#d4c4b0] border-[#d4c4b0]"
                }`}
              >
                <div
                  className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                    visibilitySettings.showWeek
                      ? "right-0.5"
                      : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Date Toggle */}
            <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {visibilitySettings.showDate ? (
                  <Eye className="w-5 h-5 text-[#8b6834]" />
                ) : (
                  <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                )}
                <span className="text-sm font-medium font-inter text-[#2c2419]">
                  Date
                </span>
              </div>
              <button
                onClick={() =>
                  onVisibilityChange({
                    ...visibilitySettings,
                    showDate: !visibilitySettings.showDate,
                  })
                }
                className={`relative w-14 h-7 transition-colors border-2 ${
                  visibilitySettings.showDate
                    ? "bg-[#8b6834] border-[#8b6834]"
                    : "bg-[#d4c4b0] border-[#d4c4b0]"
                }`}
              >
                <div
                  className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                    visibilitySettings.showDate
                      ? "right-0.5"
                      : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Logo Toggle */}
            <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {visibilitySettings.showLogo ? (
                  <Eye className="w-5 h-5 text-[#8b6834]" />
                ) : (
                  <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                )}
                <span className="text-sm font-medium font-inter text-[#2c2419]">
                  Logo
                </span>
              </div>
              <button
                onClick={() =>
                  onVisibilityChange({
                    ...visibilitySettings,
                    showLogo: !visibilitySettings.showLogo,
                  })
                }
                className={`relative w-14 h-7 transition-colors border-2 ${
                  visibilitySettings.showLogo
                    ? "bg-[#8b6834] border-[#8b6834]"
                    : "bg-[#d4c4b0] border-[#d4c4b0]"
                }`}
              >
                <div
                  className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                    visibilitySettings.showLogo
                      ? "right-0.5"
                      : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* QR Code Toggle */}
            <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {visibilitySettings.showQrCode ? (
                  <Eye className="w-5 h-5 text-[#8b6834]" />
                ) : (
                  <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                )}
                <span className="text-sm font-medium font-inter text-[#2c2419]">
                  QR Code
                </span>
              </div>
              <button
                onClick={() =>
                  onVisibilityChange({
                    ...visibilitySettings,
                    showQrCode: !visibilitySettings.showQrCode,
                  })
                }
                className={`relative w-14 h-7 transition-colors border-2 ${
                  visibilitySettings.showQrCode
                    ? "bg-[#8b6834] border-[#8b6834]"
                    : "bg-[#d4c4b0] border-[#d4c4b0]"
                }`}
              >
                <div
                  className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                    visibilitySettings.showQrCode
                      ? "right-0.5"
                      : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Title Toggle */}
            <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {visibilitySettings.showTitle ? (
                  <Eye className="w-5 h-5 text-[#8b6834]" />
                ) : (
                  <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                )}
                <span className="text-sm font-medium font-inter text-[#2c2419]">
                  Title
                </span>
              </div>
              <button
                onClick={() =>
                  onVisibilityChange({
                    ...visibilitySettings,
                    showTitle: !visibilitySettings.showTitle,
                  })
                }
                className={`relative w-14 h-7 transition-colors border-2 ${
                  visibilitySettings.showTitle
                    ? "bg-[#8b6834] border-[#8b6834]"
                    : "bg-[#d4c4b0] border-[#d4c4b0]"
                }`}
              >
                <div
                  className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                    visibilitySettings.showTitle
                      ? "right-0.5"
                      : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Frame Tab */}
        {activeTab === "Frame" && (
          <div className="space-y-4">
            {/* Border Color */}
            <div>
              <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                Border Color{" "}
                <span className="text-xs text-[#5d4e37]">
                  ({FRAME_COLORS.length} colors)
                </span>
              </h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {FRAME_COLORS.map((item) => (
                  <button
                    key={item.color}
                    onClick={() => handleFrameColorChange(item.color)}
                    className={`relative w-14 h-14 flex-shrink-0 border-2 transition-all overflow-hidden ${
                      frameBorderColor === item.color
                        ? "border-[#8b6834] shadow-md"
                        : "border-[#d4c4b0] hover:scale-95"
                    }`}
                    style={{ backgroundColor: item.color }}
                    title={item.name}
                  >
                    {frameBorderColor === item.color && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#8b6834] text-[#faf8f5] text-[10px] font-inter text-center py-0.5">
                        selected
                      </div>
                    )}
                  </button>
                ))}
                <button
                  className="w-14 h-14 flex-shrink-0 border-2 border-[#d4c4b0] bg-[#e8dcc8] hover:bg-[#d4c4b0] transition-colors flex items-center justify-center"
                  title="Add custom color"
                >
                  <Plus className="w-5 h-5 text-[#5d4e37]" />
                </button>
              </div>
            </div>

            {/* Border Thickness */}
            <div>
              <h3 className="text-sm font-medium text-slate-900 mb-3">
                Border Thickness
              </h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={frameBorderThickness}
                  onChange={(e) =>
                    handleFrameThicknessChange(Number(e.target.value))
                  }
                  className="flex-1 h-1 bg-[#e8dcc8] appearance-none cursor-pointer\"
                  style={{
                    background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${frameBorderThickness * 10}%, #e8dcc8 ${frameBorderThickness * 10}%, #e8dcc8 100%)`,
                  }}
                />
                <div className="w-8 text-right text-md font-medium font-inter text-[#2c2419]">
                  {frameBorderThickness}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ad Banner Tab */}
        {activeTab === "Ad Banner" && (
          <div className="space-y-4">
            {/* Upload Section */}
            {!adBannerImage ? (
              <div>
                <label className="block border-2 border-dashed border-gray-400 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          onAdBannerChange?.(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Upload className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                  <p className="text-sm text-slate-600">upload ad banner</p>
                </label>
              </div>
            ) : null}

            {/* Preview Section */}
            {adBannerImage && (
              <>
                <div>
                  <h3 className="text-xs font-medium text-slate-700 mb-3">
                    Ad banner Preview
                  </h3>
                  <div className="bg-gray-300 p-4">
                    <img
                      src={adBannerImage}
                      alt="Ad Banner Preview"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
                
                {/* Zoom Control */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-slate-700">
                      Image Zoom
                    </label>
                    <span className="text-xs font-bold text-[#8b6834] bg-[#e8dcc8] px-3 py-1 border border-[#d4c4b0]">
                      {adBannerZoom}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="5"
                    value={adBannerZoom}
                    onChange={(e) => onAdBannerZoomChange?.(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#e8dcc8] appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${((adBannerZoom - 50) / 150) * 100}%, #e8dcc8 ${((adBannerZoom - 50) / 150) * 100}%, #e8dcc8 100%)`,
                    }}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => onAdBannerChange?.(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 transition-colors text-slate-700 text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Change</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
        requiredPlan="Basic"
      />
    </div>

  );
}
