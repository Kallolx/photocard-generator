"use client";

import { useState } from "react";
import { BackgroundOptions } from "@/types";
import { Plus, Lock, RefreshCw, X, Upload } from "lucide-react";
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
  theme?: string;
  onThemeChange?: (theme: string) => void;
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
];

type Tab = "Background" | "Pattern" | "Theme" | "Fonts" | "Frame" | "Ad Banner";

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
  theme = "classic",
  onThemeChange,
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
  const [frameBorderColor, setFrameBorderColor] = useState(
    initialFrameBorderColor,
  );
  const [frameBorderThickness, setFrameBorderThickness] = useState(
    initialFrameBorderThickness,
  );

  const isFreeUser = user?.plan === "Free";

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
  ];

  const handleThemeChange = (themeId: string, isLocked: boolean) => {
    if (isLocked) {
      setUpgradeFeature("Modern Theme");
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
    "Frame",
    "Ad Banner",
  ];

  return (
    <div className="bg-[#f5f0e8] p-6 border-2 border-[#d4c4b0]">
      {/* Tab Navigation - Scrollable on small devices */}
      <div className="border-b-2 border-[#d4c4b0] mb-6 -mx-6 px-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-6 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                if (tab === "Fonts") {
                  handleFontsTabClick();
                } else {
                  setActiveTab(tab);
                }
              }}
              className={`pb-3 text-sm font-medium font-inter transition-colors relative whitespace-nowrap ${
                activeTab === tab
                  ? "text-[#2c2419]"
                  : "text-[#5d4e37] hover:text-[#8b6834]"
              }`}
            >
              <span className="flex items-center gap-1.5">
                {tab}
                {tab === "Fonts" && isFreeUser && <Lock className="w-3 h-3" />}
              </span>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8b6834]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-3">
        {/* Background Tab */}
        {activeTab === "Background" && (
          <>
            {/* Solid Colors Section */}
            <div>
              <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                Solid Colors{" "}
                <span className="text-xs text-[#5d4e37]">
                  ({SOLID_COLORS.length} colors)
                </span>
              </h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
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
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
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
              </div>
            </div>

            {/* Gradients Section */}
            <div>
              <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                Gradients{" "}
                <span className="text-xs text-[#5d4e37]">
                  ({GRADIENTS.length} colors)
                </span>
              </h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
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
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
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
              </div>
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
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px] z-10">
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
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
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

        {/* Fonts Tab - Placeholder */}
        {activeTab === "Fonts" && (
          <div className="space-y-4">
            {/* Week & Date Font */}
            <div>
              <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-2">
                Week & Date :
              </h3>
              <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] px-3 py-2 flex items-center justify-between">
                <div className="flex-1 text-left">
                  <span className="font-noto-bengali text-[#2c2419] text-lg">
                    আমার সোনার বাংলা
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedFontType("weekDate");
                    setShowFontModal(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-300 hover:bg-gray-200 rounded-md transition-colors text-slate-600 text-xs"
                >
                  <span>change</span>
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Headline Font */}
            <div>
              <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-2">
                Headline :
              </h3>
              <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] px-3 py-2 flex items-center justify-between">
                <div className="flex-1 text-left">
                  <span className="font-noto-bengali text-[#2c2419] text-lg">
                    আমার সোনার বাংলা
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedFontType("headline");
                    setShowFontModal(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-300 hover:bg-gray-200 rounded-md transition-colors text-slate-600 text-xs"
                >
                  <span>change</span>
                  <RefreshCw className="w-4 h-4" />
                </button>
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
