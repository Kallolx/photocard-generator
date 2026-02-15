"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { DotBackground } from "@/components/DotBackground";
import { Upload, Image as ImageIcon, Video, Type, Palette, Plus, X, Lock } from "lucide-react";
import VideoReelCard from "@/components/cards/VideoReelCard";
import VideoDownloadControls from "@/components/VideoDownloadControls";

type Tab =  "Background" | "Branding" | "Theme" | "Text Content" | "Frame";

export default function VideoCardPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("Theme");
  
  // Theme state
  const [selectedTheme, setSelectedTheme] = useState(1);
  
  // Available themes
  const themes = [
    {
      id: 1,
      name: "Classic",
      thumbnail: "/themes/vid-1.png",
      locked: false,
    },
  ];
  
  // Video and media states
  const [videoFile, setVideoFile] = useState<string>("");
  const [logoFile, setLogoFile] = useState<string>("");
  const [faviconFile, setFaviconFile] = useState<string>("");
  
  // Text content
  const [topText, setTopText] = useState<string>("");
  const [bottomText, setBottomText] = useState<string>("");
  
  // Text styling
  const [topTextSize, setTopTextSize] = useState<number>(14);
  const [topTextColor, setTopTextColor] = useState<string>("#FFFFFF");
  const [bottomTextSize, setBottomTextSize] = useState<number>(14);
  const [bottomTextColor, setBottomTextColor] = useState<string>("#FFFFFF");
  
  // Background options
  const [backgroundType, setBackgroundType] = useState<"solid" | "video">("video");
  const [backgroundColor, setBackgroundColor] = useState<string>("#000000");
  const [backgroundVideoFile, setBackgroundVideoFile] = useState<string>("/backgrounds/vid1.mp4");
  const [bgBlur, setBgBlur] = useState<boolean>(false);
  
  // Frame options (Card Frame)
  const [showFrame, setShowFrame] = useState<boolean>(false);
  const [frameThickness, setFrameThickness] = useState<number>(4);
  const [frameColor, setFrameColor] = useState<string>("#FFFFFF");
  
  // Video Frame options (Main Video Frame)
  const [showVideoFrame, setShowVideoFrame] = useState<boolean>(false);
  const [videoFrameThickness, setVideoFrameThickness] = useState<number>(4);
  const [videoFrameColor, setVideoFrameColor] = useState<string>("#FFFFFF");
  
  // Visibility
  const [showLogo, setShowLogo] = useState(true);
  const [showFavicon, setShowFavicon] = useState(true);
  const [showTopText, setShowTopText] = useState(true);
  const [showBottomText, setShowBottomText] = useState(true);
  
  // Resize states
  const [leftPanelWidth, setLeftPanelWidth] = useState(33.333); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  
  // File input refs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const bgVideoInputRef = useRef<HTMLInputElement>(null);
  
  // Drag to scroll state for tabs
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const handleTabsMouseDown = (e: React.MouseEvent) => {
    if (!tabsScrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - tabsScrollRef.current.offsetLeft);
    setScrollLeft(tabsScrollRef.current.scrollLeft);
    tabsScrollRef.current.style.cursor = "grabbing";
  };

  const handleTabsMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tabsScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsScrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    tabsScrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTabsMouseUpOrLeave = () => {
    setIsDragging(false);
    if (tabsScrollRef.current) {
      tabsScrollRef.current.style.cursor = "grab";
    }
  };
  
  // Handle file uploads
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoFile(url);
    }
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoFile(url);
    }
  };
  
  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFaviconFile(url);
    }
  };
  
  const handleBgVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBackgroundVideoFile(url);
    }
  };
  
  // Resize handlers
  const handleResizeMouseDown = () => {
    setIsResizing(true);
  };

  const handleResizeMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 20 && newWidth < 60) {
        setLeftPanelWidth(newWidth);
      }
    },
    [isResizing],
  );

  const handleResizeMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleResizeMouseMove);
      window.addEventListener("mouseup", handleResizeMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleResizeMouseMove);
      window.removeEventListener("mouseup", handleResizeMouseUp);
    };
  }, [isResizing, handleResizeMouseMove, handleResizeMouseUp]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const bgColors = [
    { name: "Black", color: "#000000" },
    { name: "White", color: "#FFFFFF" },
    { name: "Blue", color: "#3B82F6" },
  ];
  
  const handleThemeChange = (themeId: number, isLocked: boolean) => {
    if (isLocked) return;
    setSelectedTheme(themeId);
  };
  
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [frameCustomColors, setFrameCustomColors] = useState<string[]>([]);
  const [videoFrameCustomColors, setVideoFrameCustomColors] = useState<string[]>([]);
  
  // Color picker modal states
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showFrameColorPicker, setShowFrameColorPicker] = useState(false);
  const [showVideoFrameColorPicker, setShowVideoFrameColorPicker] = useState(false);
  const [tempBgColor, setTempBgColor] = useState("#FF5733");
  const [tempFrameColor, setTempFrameColor] = useState("#FF5733");
  const [tempVideoFrameColor, setTempVideoFrameColor] = useState("#FF5733");
  const [editingBgColorIndex, setEditingBgColorIndex] = useState<number | null>(null);
  const [editingFrameColorIndex, setEditingFrameColorIndex] = useState<number | null>(null);
  const [editingVideoFrameColorIndex, setEditingVideoFrameColorIndex] = useState<number | null>(null);
  
  const tabs: Tab[] = ["Background", "Theme", "Branding", "Text Content", "Frame"];

  return (
    <div className="h-screen bg-white flex flex-col">
      <style>{`
        .dark-placeholder::placeholder {
          color: #1f2937 !important;
          opacity: 1 !important;
        }
      `}</style>
      <Navbar />
      
      {/* Main Content Layout */}
      <div className="flex flex-1 flex-col md:flex-row md:min-h-0 relative max-w-[1920px] mx-auto w-full">
        {/* Left Sidebar */}
        <div
          className="w-full bg-[#f5f0e8] p-4 md:p-6 flex flex-col md:min-h-0"
          style={isDesktop ? { width: `${leftPanelWidth}%` } : undefined}
        >
          <h2 className="text-xl font-bold font-lora text-[#2c2419] mb-6">
            Video Reel Card
          </h2>
          
          {/* Main Video Upload - Always Visible */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-[#2c2419] mb-2 block">
              Main Video
            </label>
            <button
              onClick={() => videoInputRef.current?.click()}
              className="w-full py-3 border-2 border-dashed border-[#8b6834] hover:border-[#5d4e37] flex flex-col items-center justify-center gap-2 transition-colors bg-[#faf8f5] hover:bg-[#e8dcc8]"
            >
              <Upload className="w-6 h-6 text-[#8b6834]" />
              <span className="text-sm font-medium text-[#5d4e37]">
                {videoFile ? "Change Video" : "Upload Video"}
              </span>
            </button>
            {videoFile && (
              <p className="text-xs text-[#8b6834] mt-2">✓ Video uploaded</p>
            )}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoUpload}
            />
          </div>
          
          {/* Tab Navigation */}
          <div className="relative mb-6 -mx-6">
            {/* Left fade indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#f5f0e8] to-transparent z-10 pointer-events-none" />

            {/* Right fade indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#f5f0e8] to-transparent z-10 pointer-events-none" />

            <div
              ref={tabsScrollRef}
              className="px-6 overflow-x-auto no-scrollbar scroll-smooth cursor-grab select-none"
              onMouseDown={handleTabsMouseDown}
              onMouseMove={handleTabsMouseMove}
              onMouseUp={handleTabsMouseUpOrLeave}
              onMouseLeave={handleTabsMouseUpOrLeave}
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
                      setActiveTab(tab);
                    }}
                    className={`px-4 py-3 text-sm font-medium font-inter transition-all relative whitespace-nowrap ${
                      activeTab === tab
                        ? "text-[#2c2419] bg-[#e8dcc8]"
                        : "text-[#5d4e37] hover:text-[#8b6834] hover:bg-[#faf8f5]"
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#8b6834]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Theme Tab */}
            {activeTab === "Theme" && (
              <div>
                <div className="grid grid-cols-2 gap-4">
                  {themes.map((theme) => (
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
            
            {/* Background Tab */}
            {activeTab === "Background" && (
              <div>
                {/* Background Type Selector */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setBackgroundType("solid")}
                    className={`flex-1 py-2 px-3 text-sm font-medium font-inter transition-all ${
                      backgroundType === "solid"
                        ? "bg-[#8b6834] text-[#faf8f5] shadow-md"
                        : "bg-[#faf8f5] text-[#5d4e37] border-2 border-[#d4c4b0] hover:border-[#8b6834]"
                    }`}
                  >
                    Solid Color
                  </button>
                  <button
                    onClick={() => setBackgroundType("video")}
                    className={`flex-1 py-2 px-3 text-sm font-medium font-inter transition-all ${
                      backgroundType === "video"
                        ? "bg-[#8b6834] text-[#faf8f5] shadow-md"
                        : "bg-[#faf8f5] text-[#5d4e37] border-2 border-[#d4c4b0] hover:border-[#8b6834]"
                    }`}
                  >
                    Video BG
                  </button>
                </div>
                
                {/* Solid Color Options */}
                {backgroundType === "solid" && (
                  <div>
                    <label className="text-xs font-medium text-[#5d4e37] mb-2 block">
                      Choose Background Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {bgColors.map((item) => (
                        <button
                          key={item.color}
                          onClick={() => setBackgroundColor(item.color)}
                          className={`relative w-14 h-14 flex-shrink-0 border-2 transition-all ${
                            backgroundColor === item.color
                              ? "border-[#8b6834] shadow-md"
                              : "border-[#d4c4b0] hover:scale-95"
                          }`}
                          style={{ backgroundColor: item.color }}
                          title={item.name}
                        >
                          {backgroundColor === item.color && (
                            <div className="absolute bottom-0 left-0 right-0 bg-[#8b6834] text-[#faf8f5] text-[10px] font-inter text-center py-0.5">
                              selected
                            </div>
                          )}
                        </button>
                      ))}
                      
                      {/* Custom Colors */}
                      {customColors.map((color, index) => (
                        <button
                          key={`custom-${color}`}
                          onClick={() => setBackgroundColor(color)}
                          className={`relative w-14 h-14 border-2 transition-all overflow-visible flex-shrink-0 group ${
                            backgroundColor === color
                              ? "border-[#8b6834] shadow-md"
                              : "border-[#d4c4b0] hover:scale-95"
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {backgroundColor === color && (
                            <div className="absolute bottom-0 left-0 right-0 bg-[#8b6834] text-[#faf8f5] text-[10px] font-inter text-center py-0.5">
                              selected
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingBgColorIndex(index);
                              setTempBgColor(color);
                              setShowBgColorPicker(true);
                            }}
                            className="absolute top-1 left-1 w-4 h-4 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-sm opacity-0 group-hover:opacity-100 z-10 text-[10px]"
                            title="Edit color"
                          >
                            ✎
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomColors((prev) => prev.filter((_, i) => i !== index));
                            }}
                            className="absolute top-1 right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm opacity-0 group-hover:opacity-100 z-10"
                            title="Remove color"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </button>
                      ))}
                      
                      {/* Add Custom Color Button */}
                      {customColors.length < 2 && (
                        <button
                          onClick={() => {
                            setTempBgColor("#FF5733");
                            setEditingBgColorIndex(null);
                            setShowBgColorPicker(true);
                          }}
                          className="relative w-14 h-14 flex-shrink-0 border-2 border-dashed border-[#8b6834] bg-[#faf8f5] hover:bg-[#e8dcc8] transition-all flex items-center justify-center"
                          title="Add custom color"
                        >
                          <Plus className="w-5 h-5 text-[#8b6834]" />
                        </button>
                      )}
                    </div>
                    
                    {/* Color Picker Modal for Background */}
                    {showBgColorPicker && (
                      <div className="mt-3 bg-[#faf8f5] border-2 border-[#8b6834] p-4 shadow-md rounded">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-[#2c2419] font-inter">
                            {editingBgColorIndex !== null ? 'Edit Custom Color' : 'Pick a custom color'}
                          </label>
                          <button
                            onClick={() => {
                              setShowBgColorPicker(false);
                              setEditingBgColorIndex(null);
                            }}
                            className="text-[#5d4e37] hover:text-[#2c2419]"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={tempBgColor}
                            onChange={(e) => setTempBgColor(e.target.value)}
                            className="h-12 w-20 border-2 border-[#d4c4b0] cursor-pointer shadow-sm"
                          />
                          <div className="flex-1 bg-white border-2 border-[#d4c4b0] px-4 py-3 flex items-center">
                            <input
                              type="text"
                              value={tempBgColor.toUpperCase()}
                              onChange={(e) => {
                                let value = e.target.value.toUpperCase();
                                if (!value.startsWith("#")) {
                                  value = "#" + value.replace(/[^0-9A-F]/g, "");
                                } else {
                                  value = "#" + value.slice(1).replace(/[^0-9A-F]/g, "");
                                }
                                value = value.slice(0, 7);
                                setTempBgColor(value);
                              }}
                              onBlur={(e) => {
                                const value = e.target.value;
                                if (value.length !== 7 || !/^#[0-9A-F]{6}$/i.test(value)) {
                                  setTempBgColor("#FF5733");
                                }
                              }}
                              placeholder="#FF5733"
                              className="w-full text-sm font-mono text-[#2c2419] font-semibold bg-transparent outline-none"
                              maxLength={7}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (tempBgColor.length === 7 && /^#[0-9A-F]{6}$/i.test(tempBgColor)) {
                              if (editingBgColorIndex !== null) {
                                // Edit existing color
                                setCustomColors((prev) =>
                                  prev.map((c, i) => (i === editingBgColorIndex ? tempBgColor : c))
                                );
                              } else if (customColors.length < 2 && !customColors.includes(tempBgColor)) {
                                // Add new color
                                setCustomColors((prev) => [...prev, tempBgColor]);
                              }
                              setBackgroundColor(tempBgColor);
                              setShowBgColorPicker(false);
                              setEditingBgColorIndex(null);
                            }
                          }}
                          className="w-full mt-3 py-2 bg-[#8b6834] text-[#faf8f5] font-inter font-semibold hover:bg-[#2c2419] transition-colors"
                        >
                          {editingBgColorIndex !== null ? 'Update Color' : 'Add Color'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Video Background Upload */}
                {backgroundType === "video" && (
                  <div>
                    <button
                      onClick={() => bgVideoInputRef.current?.click()}
                      className="w-full py-3 border-2 border-dashed border-[#8b6834] hover:border-[#5d4e37] flex flex-col items-center justify-center gap-2 transition-colors bg-[#faf8f5] hover:bg-[#e8dcc8]"
                    >
                      <Video className="w-5 h-5 text-[#8b6834]" />
                      <span className="text-sm font-medium text-[#5d4e37]">
                        {backgroundVideoFile !== "/backgrounds/vid1.mp4" ? "Change BG Video" : "Upload Custom BG Video"}
                      </span>
                    </button>
                    {backgroundVideoFile && backgroundVideoFile !== "/backgrounds/vid1.mp4" && (
                      <p className="text-xs text-[#8b6834] mt-2">✓ Custom BG Video uploaded</p>
                    )}
                    {backgroundVideoFile === "/backgrounds/vid1.mp4" && (
                      <p className="text-xs text-[#5d4e37] mt-2">Using default background video</p>
                    )}
                    
                    {/* Blur Toggle */}
                    {backgroundVideoFile && (
                      <div className="mt-4 flex items-center justify-between p-3 bg-[#faf8f5] border border-[#d4c4b0]">
                        <label className="text-xs font-medium text-[#5d4e37]">
                          Blur Background
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bgBlur}
                            onChange={(e) => setBgBlur(e.target.checked)}
                            className="w-4 h-4 text-[#8b6834] border-[#d4c4b0] rounded focus:ring-[#8b6834]"
                          />
                          <span className="text-xs text-[#5d4e37]">{bgBlur ? "On" : "Off"}</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}
                <input
                  ref={bgVideoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleBgVideoUpload}
                />
              </div>
            )}
            
            {/* Branding Tab */}
            {activeTab === "Branding" && (
              <div className="space-y-4">
                {/* Logo */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-[#5d4e37]">
                      Logo
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showLogo}
                        onChange={(e) => setShowLogo(e.target.checked)}
                        className="w-4 h-4 text-[#8b6834] border-[#d4c4b0] rounded focus:ring-[#8b6834]"
                      />
                      <span className="text-xs text-[#5d4e37]">Show</span>
                    </label>
                  </div>
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full py-2 border-2 border-dashed border-[#8b6834] hover:border-[#5d4e37] text-sm font-medium text-[#5d4e37] transition-colors bg-[#faf8f5] hover:bg-[#e8dcc8]"
                  >
                    {logoFile ? "✓ Change Logo" : "Upload Logo"}
                  </button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </div>
                
                {/* Favicon */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-[#5d4e37]">
                      Favicon / Icon
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showFavicon}
                        onChange={(e) => setShowFavicon(e.target.checked)}
                        className="w-4 h-4 text-[#8b6834] border-[#d4c4b0] rounded focus:ring-[#8b6834]"
                      />
                      <span className="text-xs text-[#5d4e37]">Show</span>
                    </label>
                  </div>
                  <button
                    onClick={() => faviconInputRef.current?.click()}
                    className="w-full py-2 border-2 border-dashed border-[#8b6834] hover:border-[#5d4e37] text-sm font-medium text-[#5d4e37] transition-colors bg-[#faf8f5] hover:bg-[#e8dcc8]"
                  >
                    {faviconFile ? "✓ Change Favicon" : "Upload Favicon"}
                  </button>
                  <input
                    ref={faviconInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFaviconUpload}
                  />
                </div>
              </div>
            )}
            
            {/* Text Content Tab */}
            {activeTab === "Text Content" && (
              <div className="space-y-6">
                {/* Top Text */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-[#2c2419]">
                      Top Text
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showTopText}
                        onChange={(e) => setShowTopText(e.target.checked)}
                        className="w-4 h-4 text-[#8b6834] border-[#d4c4b0] rounded focus:ring-[#8b6834]"
                      />
                      <span className="text-xs text-[#5d4e37]">Show</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={topText}
                    onChange={(e) => setTopText(e.target.value)}
                    placeholder="আপনার ব্র্যান্ডের নাম..."
                    className="w-full px-3 py-2 border-2 border-[#d4c4b0] bg-white text-sm focus:outline-none focus:border-[#8b6834] font-noto-bengali mb-3 dark-placeholder text-gray-900"
                  />
                  
                  {/* Font Size */}
                  <div className="mb-3">
                    <label className="text-xs font-medium text-[#5d4e37] block mb-2">
                      Font Size: {topTextSize}px
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={topTextSize}
                      onChange={(e) => setTopTextSize(Number(e.target.value))}
                      className="w-full h-2 bg-[#d4c4b0] rounded-lg appearance-none cursor-pointer accent-[#8b6834]"
                    />
                  </div>
                  
                  {/* Font Color */}
                  <div>
                    <label className="text-xs font-medium text-[#5d4e37] block mb-2">
                      Font Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={topTextColor}
                        onChange={(e) => setTopTextColor(e.target.value)}
                        className="w-12 h-10 border-2 border-[#d4c4b0] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={topTextColor}
                        onChange={(e) => setTopTextColor(e.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-[#d4c4b0] bg-white text-sm focus:outline-none focus:border-[#8b6834] font-mono text-gray-900"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Bottom Text */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-[#2c2419]">
                      Bottom Text
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showBottomText}
                        onChange={(e) => setShowBottomText(e.target.checked)}
                        className="w-4 h-4 text-[#8b6834] border-[#d4c4b0] rounded focus:ring-[#8b6834]"
                      />
                      <span className="text-xs text-[#5d4e37]">Show</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value)}
                    placeholder="এখনৈ দেখুন..."
                    className="w-full px-3 py-2 border-2 border-[#d4c4b0] bg-white text-sm focus:outline-none focus:border-[#8b6834] font-noto-bengali mb-3 dark-placeholder text-gray-900"
                  />
                  
                  {/* Font Size */}
                  <div className="mb-3">
                    <label className="text-xs font-medium text-[#5d4e37] block mb-2">
                      Font Size: {bottomTextSize}px
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={bottomTextSize}
                      onChange={(e) => setBottomTextSize(Number(e.target.value))}
                      className="w-full h-2 bg-[#d4c4b0] rounded-lg appearance-none cursor-pointer accent-[#8b6834]"
                    />
                  </div>
                  
                  {/* Font Color */}
                  <div>
                    <label className="text-xs font-medium text-[#5d4e37] block mb-2">
                      Font Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bottomTextColor}
                        onChange={(e) => setBottomTextColor(e.target.value)}
                        className="w-12 h-10 border-2 border-[#d4c4b0] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bottomTextColor}
                        onChange={(e) => setBottomTextColor(e.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-[#d4c4b0] bg-white text-sm focus:outline-none focus:border-[#8b6834] font-mono text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Frame Tab */}
            {activeTab === "Frame" && (
              <div className="space-y-8">
                {/* ===== CARD FRAME SECTION ===== */}
                <div className="border-b-2 border-[#d4c4b0] pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[#2c2419]">Card Frame</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showFrame}
                        onChange={(e) => setShowFrame(e.target.checked)}
                        className="w-4 h-4 text-[#8b6834] border-[#d4c4b0] rounded focus:ring-[#8b6834]"
                      />
                      <span className="text-xs text-[#5d4e37]">Enable Frame</span>
                    </label>
                  </div>
                  
                  {showFrame && (
                    <>
                      {/* Card Frame Thickness */}
                      <div className="mb-4">
                        <label className="text-xs font-medium text-[#5d4e37] block mb-2">
                          Frame Thickness: {frameThickness}px
                        </label>
                        <input
                          type="range"
                          min="2"
                          max="20"
                          value={frameThickness}
                          onChange={(e) => setFrameThickness(Number(e.target.value))}
                          className="w-full h-2 bg-[#d4c4b0] rounded-lg appearance-none cursor-pointer accent-[#8b6834]"
                        />
                      </div>
                      
                      {/* Card Frame Color */}
                      <div>
                        <label className="text-xs font-medium text-[#5d4e37] mb-2 block">
                          Frame Color
                        </label>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {bgColors.map((item) => (
                            <button
                              key={`card-frame-${item.color}`}
                              onClick={() => setFrameColor(item.color)}
                              className={`relative w-14 h-14 flex-shrink-0 border-2 transition-all ${
                                frameColor === item.color
                                  ? "border-[#8b6834] shadow-md"
                                  : "border-[#d4c4b0] hover:scale-95"
                              }`}
                              style={{ backgroundColor: item.color }}
                              title={item.name}
                            >
                              {frameColor === item.color && (
                                <div className="absolute bottom-0 left-0 right-0 bg-[#8b6834] text-[#faf8f5] text-[10px] font-inter text-center py-0.5">
                                  selected
                                </div>
                              )}
                            </button>
                          ))}
                          
                          {/* Custom Card Frame Colors */}
                          {frameCustomColors.map((color, index) => (
                            <button
                              key={`card-frame-custom-${color}`}
                              onClick={() => setFrameColor(color)}
                              className={`relative w-14 h-14 border-2 transition-all overflow-visible flex-shrink-0 group ${
                                frameColor === color
                                  ? "border-[#8b6834] shadow-md"
                                  : "border-[#d4c4b0] hover:scale-95"
                              }`}
                              style={{ backgroundColor: color }}
                            >
                              {frameColor === color && (
                                <div className="absolute bottom-0 left-0 right-0 bg-[#8b6834] text-[#faf8f5] text-[10px] font-inter text-center py-0.5">
                                  selected
                                </div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingFrameColorIndex(index);
                                  setTempFrameColor(color);
                                  setShowFrameColorPicker(true);
                                }}
                                className="absolute top-1 left-1 w-4 h-4 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-sm opacity-0 group-hover:opacity-100 z-10 text-[10px]"
                                title="Edit color"
                              >
                                ✎
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFrameCustomColors((prev) => prev.filter((_, i) => i !== index));
                                }}
                                className="absolute top-1 right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm opacity-0 group-hover:opacity-100 z-10"
                                title="Remove color"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </button>
                          ))}
                          
                          {/* Add Custom Card Frame Color Button */}
                          {frameCustomColors.length < 2 && (
                            <button
                              onClick={() => {
                                setTempFrameColor("#FF5733");
                                setEditingFrameColorIndex(null);
                                setShowFrameColorPicker(true);
                              }}
                              className="relative w-14 h-14 flex-shrink-0 border-2 border-dashed border-[#8b6834] bg-[#faf8f5] hover:bg-[#e8dcc8] transition-all flex items-center justify-center"
                              title="Add custom color"
                            >
                              <Plus className="w-5 h-5 text-[#8b6834]" />
                            </button>
                          )}
                        </div>
                        
                        {/* Color Picker Modal for Card Frame */}
                        {showFrameColorPicker && (
                          <div className="mt-3 bg-[#faf8f5] border-2 border-[#8b6834] p-4 shadow-md rounded">
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-sm font-medium text-[#2c2419] font-inter">
                                {editingFrameColorIndex !== null ? 'Edit Custom Color' : 'Pick a custom color'}
                              </label>
                              <button
                                onClick={() => {
                                  setShowFrameColorPicker(false);
                                  setEditingFrameColorIndex(null);
                                }}
                                className="text-[#5d4e37] hover:text-[#2c2419]"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex gap-3">
                              <input
                                type="color"
                                value={tempFrameColor}
                                onChange={(e) => setTempFrameColor(e.target.value)}
                                className="h-12 w-20 border-2 border-[#d4c4b0] cursor-pointer shadow-sm"
                              />
                              <div className="flex-1 bg-white border-2 border-[#d4c4b0] px-4 py-3 flex items-center">
                                <input
                                  type="text"
                                  value={tempFrameColor.toUpperCase()}
                                  onChange={(e) => {
                                    let value = e.target.value.toUpperCase();
                                    if (!value.startsWith("#")) {
                                      value = "#" + value.replace(/[^0-9A-F]/g, "");
                                    } else {
                                      value = "#" + value.slice(1).replace(/[^0-9A-F]/g, "");
                                    }
                                    value = value.slice(0, 7);
                                    setTempFrameColor(value);
                                  }}
                                  onBlur={(e) => {
                                    const value = e.target.value;
                                    if (value.length !== 7 || !/^#[0-9A-F]{6}$/i.test(value)) {
                                      setTempFrameColor("#FF5733");
                                    }
                                  }}
                                  placeholder="#FF5733"
                                  className="w-full text-sm font-mono text-[#2c2419] font-semibold bg-transparent outline-none"
                                  maxLength={7}
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (tempFrameColor.length === 7 && /^#[0-9A-F]{6}$/i.test(tempFrameColor)) {
                                  if (editingFrameColorIndex !== null) {
                                    // Edit existing color
                                    setFrameCustomColors((prev) =>
                                      prev.map((c, i) => (i === editingFrameColorIndex ? tempFrameColor : c))
                                    );
                                  } else if (frameCustomColors.length < 2 && !frameCustomColors.includes(tempFrameColor)) {
                                    // Add new color
                                    setFrameCustomColors((prev) => [...prev, tempFrameColor]);
                                  }
                                  setFrameColor(tempFrameColor);
                                  setShowFrameColorPicker(false);
                                  setEditingFrameColorIndex(null);
                                }
                              }}
                              className="w-full mt-3 py-2 bg-[#8b6834] text-[#faf8f5] font-inter font-semibold hover:bg-[#2c2419] transition-colors"
                            >
                              {editingFrameColorIndex !== null ? 'Update Color' : 'Add Color'}
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                {/* ===== VIDEO FRAME SECTION ===== */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[#2c2419]">Video Frame</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showVideoFrame}
                        onChange={(e) => setShowVideoFrame(e.target.checked)}
                        className="w-4 h-4 text-[#8b6834] border-[#d4c4b0] rounded focus:ring-[#8b6834]"
                      />
                      <span className="text-xs text-[#5d4e37]">Enable Frame</span>
                    </label>
                  </div>
                  
                  {showVideoFrame && (
                    <>
                      {/* Video Frame Thickness */}
                      <div className="mb-4">
                        <label className="text-xs font-medium text-[#5d4e37] block mb-2">
                          Frame Thickness: {videoFrameThickness}px
                        </label>
                        <input
                          type="range"
                          min="2"
                          max="20"
                          value={videoFrameThickness}
                          onChange={(e) => setVideoFrameThickness(Number(e.target.value))}
                          className="w-full h-2 bg-[#d4c4b0] rounded-lg appearance-none cursor-pointer accent-[#8b6834]"
                        />
                      </div>
                      
                      {/* Video Frame Color */}
                      <div>
                        <label className="text-xs font-medium text-[#5d4e37] mb-2 block">
                          Frame Color
                        </label>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {bgColors.map((item) => (
                            <button
                              key={`video-frame-${item.color}`}
                              onClick={() => setVideoFrameColor(item.color)}
                              className={`relative w-14 h-14 flex-shrink-0 border-2 transition-all ${
                                videoFrameColor === item.color
                                  ? "border-[#8b6834] shadow-md"
                                  : "border-[#d4c4b0] hover:scale-95"
                              }`}
                              style={{ backgroundColor: item.color }}
                              title={item.name}
                            >
                              {videoFrameColor === item.color && (
                                <div className="absolute bottom-0 left-0 right-0 bg-[#8b6834] text-[#faf8f5] text-[10px] font-inter text-center py-0.5">
                                  selected
                                </div>
                              )}
                            </button>
                          ))}
                          
                          {/* Custom Video Frame Colors */}
                          {videoFrameCustomColors.map((color, index) => (
                            <button
                              key={`video-frame-custom-${color}`}
                              onClick={() => setVideoFrameColor(color)}
                              className={`relative w-14 h-14 border-2 transition-all overflow-visible flex-shrink-0 group ${
                                videoFrameColor === color
                                  ? "border-[#8b6834] shadow-md"
                                  : "border-[#d4c4b0] hover:scale-95"
                              }`}
                              style={{ backgroundColor: color }}
                            >
                              {videoFrameColor === color && (
                                <div className="absolute bottom-0 left-0 right-0 bg-[#8b6834] text-[#faf8f5] text-[10px] font-inter text-center py-0.5">
                                  selected
                                </div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingVideoFrameColorIndex(index);
                                  setTempVideoFrameColor(color);
                                  setShowVideoFrameColorPicker(true);
                                }}
                                className="absolute top-1 left-1 w-4 h-4 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-sm opacity-0 group-hover:opacity-100 z-10 text-[10px]"
                                title="Edit color"
                              >
                                ✎
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setVideoFrameCustomColors((prev) => prev.filter((_, i) => i !== index));
                                }}
                                className="absolute top-1 right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm opacity-0 group-hover:opacity-100 z-10"
                                title="Remove color"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </button>
                          ))}
                          
                          {/* Add Custom Video Frame Color Button */}
                          {videoFrameCustomColors.length < 2 && (
                            <button
                              onClick={() => {
                                setTempVideoFrameColor("#FF5733");
                                setEditingVideoFrameColorIndex(null);
                                setShowVideoFrameColorPicker(true);
                              }}
                              className="relative w-14 h-14 flex-shrink-0 border-2 border-dashed border-[#8b6834] bg-[#faf8f5] hover:bg-[#e8dcc8] transition-all flex items-center justify-center"
                              title="Add custom color"
                            >
                              <Plus className="w-5 h-5 text-[#8b6834]" />
                            </button>
                          )}
                        </div>
                        
                        {/* Color Picker Modal for Video Frame */}
                        {showVideoFrameColorPicker && (
                          <div className="mt-3 bg-[#faf8f5] border-2 border-[#8b6834] p-4 shadow-md rounded">
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-sm font-medium text-[#2c2419] font-inter">
                                {editingVideoFrameColorIndex !== null ? 'Edit Custom Color' : 'Pick a custom color'}
                              </label>
                              <button
                                onClick={() => {
                                  setShowVideoFrameColorPicker(false);
                                  setEditingVideoFrameColorIndex(null);
                                }}
                                className="text-[#5d4e37] hover:text-[#2c2419]"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex gap-3">
                              <input
                                type="color"
                                value={tempVideoFrameColor}
                                onChange={(e) => setTempVideoFrameColor(e.target.value)}
                                className="h-12 w-20 border-2 border-[#d4c4b0] cursor-pointer shadow-sm"
                              />
                              <div className="flex-1 bg-white border-2 border-[#d4c4b0] px-4 py-3 flex items-center">
                                <input
                                  type="text"
                                  value={tempVideoFrameColor.toUpperCase()}
                                  onChange={(e) => {
                                    let value = e.target.value.toUpperCase();
                                    if (!value.startsWith("#")) {
                                      value = "#" + value.replace(/[^0-9A-F]/g, "");
                                    } else {
                                      value = "#" + value.slice(1).replace(/[^0-9A-F]/g, "");
                                    }
                                    value = value.slice(0, 7);
                                    setTempVideoFrameColor(value);
                                  }}
                                  onBlur={(e) => {
                                    const value = e.target.value;
                                    if (value.length !== 7 || !/^#[0-9A-F]{6}$/i.test(value)) {
                                      setTempVideoFrameColor("#FF5733");
                                    }
                                  }}
                                  placeholder="#FF5733"
                                  className="w-full text-sm font-mono text-[#2c2419] font-semibold bg-transparent outline-none"
                                  maxLength={7}
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (tempVideoFrameColor.length === 7 && /^#[0-9A-F]{6}$/i.test(tempVideoFrameColor)) {
                                  if (editingVideoFrameColorIndex !== null) {
                                    // Edit existing color
                                    setVideoFrameCustomColors((prev) =>
                                      prev.map((c, i) => (i === editingVideoFrameColorIndex ? tempVideoFrameColor : c))
                                    );
                                  } else if (videoFrameCustomColors.length < 2 && !videoFrameCustomColors.includes(tempVideoFrameColor)) {
                                    // Add new color
                                    setVideoFrameCustomColors((prev) => [...prev, tempVideoFrameColor]);
                                  }
                                  setVideoFrameColor(tempVideoFrameColor);
                                  setShowVideoFrameColorPicker(false);
                                  setEditingVideoFrameColorIndex(null);
                                }
                              }}
                              className="w-full mt-3 py-2 bg-[#8b6834] text-[#faf8f5] font-inter font-semibold hover:bg-[#2c2419] transition-colors"
                            >
                              {editingVideoFrameColorIndex !== null ? 'Update Color' : 'Add Color'}
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Resize Handle - Desktop only */}
        <div
          className="hidden md:block w-1 bg-[#d4c4b0] hover:bg-[#8b6834] cursor-col-resize active:bg-blue-600 transition-colors"
          onMouseDown={handleResizeMouseDown}
          style={{
            cursor: isResizing ? "col-resize" : "col-resize",
            userSelect: "none",
          }}
        />
        
        {/* Right Preview Area */}
        <DotBackground className="flex-1 bg-[#faf8f5] overflow-y-auto">
          <div className="min-h-full w-full flex flex-col items-center justify-start pt-20 pb-8 px-8 gap-8">
            {/* Video Card */}
            <div id="videocard" className="w-auto">
              <VideoReelCard
                videoUrl={videoFile}
                logoUrl={logoFile}
                faviconUrl={faviconFile}
                topText={topText}
                bottomText={bottomText}
                topTextSize={topTextSize}
                topTextColor={topTextColor}
                bottomTextSize={bottomTextSize}
                bottomTextColor={bottomTextColor}
                backgroundType={backgroundType}
                backgroundColor={backgroundColor}
                backgroundVideoUrl={backgroundVideoFile}
                bgBlur={bgBlur}
                showFrame={showFrame}
                frameThickness={frameThickness}
                frameColor={frameColor}
                showVideoFrame={showVideoFrame}
                videoFrameThickness={videoFrameThickness}
                videoFrameColor={videoFrameColor}
                showLogo={showLogo}
                showFavicon={showFavicon}
                showTopText={showTopText}
                showBottomText={showBottomText}
              />
            </div>
            
            {/* Download Controls */}
            <div className="w-auto">
              <VideoDownloadControls isVisible={true} targetId="videocard" />
            </div>
          </div>
        </DotBackground>
      </div>
    </div>
  );
}
