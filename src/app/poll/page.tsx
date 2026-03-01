"use client";

import { DotBackground } from "@/components/DotBackground";
import EditingToolbar from "@/components/EditingToolbar";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import ClassicPollCard from "@/components/cards/poll-cards/ClassicPollCard";
import CustomizationPanel from "@/components/CustomizationPanel";
import {
  PhotocardData,
  BackgroundOptions,
  CardFontStyles,
  PollCardVisibilitySettings,
  VisibilitySettings,
  CommentCardVisibilitySettings,
} from "@/types";
import { Upload, Edit, RotateCcw, ThumbsUp, ThumbsDown, MessageSquare, HelpCircle, Link2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UpgradeModal from "@/components/UpgradeModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DownloadControls from "@/components/DownloadControls";
import { isBengali } from "@/utils/fontUtils";

export default function PollPage() {
  const [logo, setLogo] = useState<string>("");
  const [newsImage, setNewsImage] = useState<string>("");
  const [title, setTitle] = useState("");
  const [pollTitle, setPollTitle] = useState("");
  const [pollCount, setPollCount] = useState<2 | 3>(2);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user, features } = useAuth();
  const [background, setBackground] = useState<BackgroundOptions>({
    type: "solid",
    color: "#dc2626",
  });
  const [frameBorderColor, setFrameBorderColor] = useState("#FFFFFF");
  const [frameBorderThickness, setFrameBorderThickness] = useState(0);
  const [socialMedia, setSocialMedia] = useState<
    Array<{ platform: string; username: string }>
  >([
    { platform: "", username: "" },
    { platform: "", username: "" },
    { platform: "", username: "" },
  ]);
  const [leftPanelWidth, setLeftPanelWidth] = useState(33.333);
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [adBannerImage, setAdBannerImage] = useState<string | null>(null);
  const [adBannerZoom, setAdBannerZoom] = useState<number>(100);
  const [adBannerPosition, setAdBannerPosition] = useState({ x: 0, y: 0 });
  const [imageZoom, setImageZoom] = useState<number>(100);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [theme, setTheme] = useState<string>("classic");
  const [socialMediaExpanded, setSocialMediaExpanded] = useState(false);
  const [contentExpanded, setContentExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDragMode, setIsDragMode] = useState(false);

  const [elementLayout, setElementLayout] = useState<{
    topLeft: "logo" | "dateWeek" | "socialMedia" | "website";
    topRight: "logo" | "dateWeek" | "socialMedia" | "website";
    bottomLeft: "logo" | "dateWeek" | "socialMedia" | "website";
    bottomRight: "logo" | "dateWeek" | "socialMedia" | "website";
  }>({
    topLeft: "logo",
    topRight: "dateWeek",
    bottomLeft: "socialMedia",
    bottomRight: "website",
  });

  const [ctaAlignment, setCtaAlignment] = useState<"left" | "center" | "right">(
    "center",
  );

  // Editing state
  const [currentLogo, setCurrentLogo] = useState<string>("");
  const [currentImage, setCurrentImage] = useState<string>("");
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const [isLogoFavicon, setIsLogoFavicon] = useState(false);

  // Font styles state
  const [fontStyles, setFontStyles] = useState<CardFontStyles>({
    week: {
      fontFamily: "Noto Serif Bengali",
      fontSize: "14px",
      fontWeight: "500",
      color: "#FFFFFF",
      textAlign: "center",
      letterSpacing: "0px",
    },
    date: {
      fontFamily: "Noto Serif Bengali",
      fontSize: "14px",
      fontWeight: "500",
      color: "#FFFFFF",
      textAlign: "center",
      letterSpacing: "0px",
    },
    headline: {
      fontFamily: "Noto Serif Bengali",
      fontSize: "24px",
      fontWeight: "700",
      color: "#FFFFFF",
      textAlign: "center",
      letterSpacing: "0px",
      textShadow: {
        preset: "none",
        angle: 135,
      },
      textStroke: {
        width: 0,
        color: "#000000",
      },
    },
    // Poll-specific fonts
    pollTitle: {
      fontFamily: "Noto Serif Bengali",
      fontSize: "28px",
      fontWeight: "700",
      color: "#FFFFFF",
      textAlign: "center",
      letterSpacing: "0px",
      textShadow: {
        preset: "soft",
        angle: 135,
      },
      textStroke: {
        width: 0,
        color: "#000000",
      },
    },
    pollOptions: {
      fontFamily: "Noto Serif Bengali",
      fontSize: "20px",
      fontWeight: "600",
      color: "#000000",
      textAlign: "center",
      letterSpacing: "0px",
      textShadow: {
        preset: "none",
        angle: 135,
      },
      textStroke: {
        width: 0,
        color: "#000000",
      },
    },
    footer: {
      fontFamily: "Noto Serif Bengali",
      fontSize: "12px",
      fontWeight: "500",
      color: "#FFFFFF",
      textAlign: "center",
      letterSpacing: "0px",
    },
  });

  // Visibility settings state
  const [visibilitySettings, setVisibilitySettings] =
    useState<PollCardVisibilitySettings>({
      showLogo: true,
      showWeek: true,
      showDate: true,
      showPollTitle: true,
      showPollOptions: true,
      showPollIcons: true,
      showImage: true,
      showSocialMedia: true,
      showAdBanner: true,
    });

  // Default poll options
  const [pollOptions, setPollOptions] = useState([
    { text: "হ্যাঁ", icon: "ThumbsUp" },
    { text: "না", icon: "ThumbsDown" },
    { text: "মন্তব্য নেই", icon: "MessageSquare" },
  ]);

  // Poll icon size state (12-28px, default 16px)
  const [pollIconSize, setPollIconSize] = useState(16);

  // URL functionality state
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [urlSuccess, setUrlSuccess] = useState(false);

  // Helper function to render Lucide icons
  const renderPollIcon = (iconName: string, className: string = "w-4 h-4") => {
    const iconComponents = {
      ThumbsUp: ThumbsUp,
      ThumbsDown: ThumbsDown,
      MessageSquare: MessageSquare,
      HelpCircle: HelpCircle,
    };
    
    const IconComponent = iconComponents[iconName as keyof typeof iconComponents];
    
    if (IconComponent) {
      return <IconComponent className={`${className} text-[#2c2419]`} />;
    }
    
    return null;
  };

  // Mock data for preview
  const mockData: PhotocardData = {
    title:
      title || "এই একটি নমুনা শিরোনাম যা দেখায় ফটোকার্ড কেমন দেখাবে",
    image: currentImage || "",
    logo: currentLogo || "",
    favicon: "https://www.google.com/favicon.ico",
    siteName: "Poll Card",
    url: "https://example.com",
    weekName: "শনিবার",
    date: "২৪ জানুয়ারি ২০২৬",
    pollTitle:
      pollTitle || "আপনার মতামত কি?",
    pollOptions: pollOptions.slice(0, pollCount),
  };

  // Update current data when main data changes
  useEffect(() => {
    setCurrentTitle(title || mockData.title);
    setCurrentImage(newsImage || mockData.image);
    setCurrentLogo(logo || mockData.logo);
  }, [title, newsImage, logo]);

  const handleFrameChange = (color: string, thickness: number) => {
    setFrameBorderColor(color);
    setFrameBorderThickness(thickness);
  };

  const handleVisibilityChange = (
    settings: PollCardVisibilitySettings | VisibilitySettings | CommentCardVisibilitySettings,
  ) => {
    if ("showPollTitle" in settings) {
      setVisibilitySettings(settings as PollCardVisibilitySettings);
    }
  };

  // Editing toolbar handlers
  const handleLogoChange = (logoUrl: string, isFavicon: boolean) => {
    setCurrentLogo(logoUrl);
    setIsLogoFavicon(isFavicon);
    setLogo(logoUrl);
  };

  const handleImageChange = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setNewsImage(imageUrl);
  };

  const handleTitleChange = (titleText: string) => {
    setCurrentTitle(titleText);
    setTitle(titleText);
  };

  // URL submission handler
  const handleUrlSubmit = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    setUrlError("");
    setUrlSuccess(false);

    try {
      const response = await fetch("/api/extract-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to extract URL data");
      }

      const data = await response.json();

      // Populate poll card with extracted data
      if (data.title) {
        setTitle(data.title);
        setCurrentTitle(data.title);
      }
      if (data.image) {
        setNewsImage(data.image);
        setCurrentImage(data.image);
      }
      if (data.logo) {
        setLogo(data.logo);
        setCurrentLogo(data.logo);
      }

      // Show success feedback
      setUrlSuccess(true);
      
      // Clear URL input and success message after delay
      setUrl("");
      setTimeout(() => setUrlSuccess(false), 3000);
    } catch (error) {
      console.error("Error extracting URL data:", error);
      setUrlError(error instanceof Error ? error.message : "Failed to extract URL data");
    } finally {
      setIsLoading(false);
    }
  };

  // Logo upload
  const handleLogoUploadInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCurrentLogo(result);
        setLogo(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Image upload
  const handleImageUploadInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCurrentImage(result);
        setNewsImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCurrentLogo(result);
      setLogo(result);
      setIsLogoFavicon(false);
    };
    reader.readAsDataURL(file);
  };

  // Person overlay handler
  // Restore all settings to defaults
  const handleRestoreDefaults = () => {
    setElementLayout({
      topLeft: "logo",
      topRight: "dateWeek",
      bottomLeft: "socialMedia",
      bottomRight: "website",
    });

    setVisibilitySettings({
      showLogo: true,
      showWeek: true,
      showDate: true,
      showPollTitle: true,
      showPollOptions: true,
      showPollIcons: true,
      showImage: true,
      showSocialMedia: true,
      showAdBanner: true,
    });

    setFontStyles({
      week: { fontFamily: "Noto Serif Bengali", fontSize: "14px", fontWeight: "500", color: "#FFFFFF", textAlign: "center", letterSpacing: "0px" },
      date: { fontFamily: "Noto Serif Bengali", fontSize: "14px", fontWeight: "500", color: "#FFFFFF", textAlign: "center", letterSpacing: "0px" },
      headline: { fontFamily: "Noto Serif Bengali", fontSize: "24px", fontWeight: "700", color: "#FFFFFF", textAlign: "center", letterSpacing: "0px", textShadow: { preset: "none", angle: 135 }, textStroke: { width: 0, color: "#000000" } },
      pollTitle: { fontFamily: "Noto Serif Bengali", fontSize: "28px", fontWeight: "700", color: "#FFFFFF", textAlign: "center", letterSpacing: "0px", textShadow: { preset: "soft", angle: 135 }, textStroke: { width: 0, color: "#000000" } },
      pollOptions: { fontFamily: "Noto Serif Bengali", fontSize: "20px", fontWeight: "600", color: "#000000", textAlign: "center", letterSpacing: "0px", textShadow: { preset: "none", angle: 135 }, textStroke: { width: 0, color: "#000000" } },
      footer: { fontFamily: "Noto Serif Bengali", fontSize: "12px", fontWeight: "500", color: "#FFFFFF", textAlign: "center", letterSpacing: "0px" },
    });

    setFrameBorderColor("#FFFFFF");
    setFrameBorderThickness(0);
    setAdBannerImage(null);
    setAdBannerZoom(100);
    setAdBannerPosition({ x: 0, y: 0 });
    setImageZoom(100);
    setImagePosition({ x: 0, y: 0 });
    setBackground({
      type: "solid",
      color: "#dc2626",
    });
  };

  // Render card
  const renderCard = (
    cardData: PhotocardData,
    cardId: string,
    isFullSize = false,
  ) => {
    const validSocialMedia = socialMedia.filter(
      (s) => s.platform && s.username,
    );
    const website =
      validSocialMedia.find((s) => s.platform === "website")?.username || "";
    const footerText =
      validSocialMedia.find((s) => s.platform === "text")?.username || "";
    const socialOnly = validSocialMedia.filter(
      (s) => s.platform !== "website" && s.platform !== "text",
    );

    return (
      <ClassicPollCard
        id={cardId}
        data={cardData}
        background={background}
        fullSize={isFullSize}
        frameBorderColor={frameBorderColor}
        frameBorderThickness={frameBorderThickness}
        socialMedia={socialOnly}
        adBannerImage={adBannerImage}
        adBannerZoom={adBannerZoom}
        adBannerPosition={adBannerPosition}
        imageZoom={imageZoom}
        imagePosition={imagePosition}
        website={website}
        footerText={footerText}
        fontStyles={fontStyles}
        visibilitySettings={visibilitySettings}
        isDragMode={isDragMode}
        pollIconSize={pollIconSize}
        elementLayout={elementLayout}
        onLayoutChange={setElementLayout}
        onVisibilityChange={setVisibilitySettings}
        onLogoUpload={handleLogoUpload}
        onRestoreDefaults={handleRestoreDefaults}
        onImagePositionChange={setImagePosition}
        onImageZoomChange={setImageZoom}
      />
    );
  };

  // Handle panel resizing
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth >= 20 && newWidth <= 50) {
          setLeftPanelWidth(newWidth);
        }
      }
    },
    [isResizing],
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  if (!isMounted) return null;

  const photocardData = mockData;

  return (
    <ProtectedRoute>
      <div className="h-screen bg-white flex flex-col">
        <Navbar />

        {/* Main Content - Split Panel Layout */}
        <div className="flex-1 flex flex-col md:flex-row md:min-h-0">
          {user?.plan === "Free" && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white border-4 border-[#8b6834] p-8 max-w-md text-center shadow-2xl">
                <div className="mb-4 flex justify-center">
                  <div className="p-4 bg-[#f5f0e8] rounded-full">
                    <svg
                      className="w-12 h-12 text-[#8b6834]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-lora font-bold text-[#2c2419] mb-3">
                  Poll Cards Locked
                </h3>
                <p className="text-[#5d4e37] font-inter mb-6">
                  Poll cards are available for Basic and Premium users.
                  Upgrade your plan to unlock this feature.
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="px-8 py-3 bg-[#8b6834] text-[#faf8f5] font-inter font-medium hover:bg-[#6b4e25] transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}

          {/* Left Sidebar */}
          <div
            className="w-full bg-[#f5f0e8] p-4 md:p-6 flex flex-col md:min-h-0 md:overflow-y-auto"
            style={isDesktop ? { width: `${leftPanelWidth}%` } : undefined}
          >
            {/* Poll Card Input Section */}
            <div className="space-y-3">
              {/* URL Input Section */}
              <div className="bg-[#e8dcc8] p-2 border-2 border-[#d4c4b0]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-[#8b6834] rounded">
                    <Link2 className="w-3 h-3 text-white" />
                  </div>
                  <h3 className="text-sm font-lora font-bold text-[#2c2419]">
                    Extract from URL
                  </h3>
                </div>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                    placeholder="Paste article URL to auto-fill content"
                    className="w-full px-3 py-2 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] placeholder-[#5d4e37] font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#8b6834]"
                    disabled={isLoading}
                  />
                  <div className="flex items-center justify-between">
                    {urlError && (
                      <p className="text-red-600 text-xs font-inter flex-1 mr-2">
                        {urlError}
                      </p>
                    )}
                    {urlSuccess && !urlError && (
                      <div className="flex items-center gap-1 text-green-600 text-xs font-inter flex-1 mr-2">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Content extracted successfully!
                      </div>
                    )}
                    <button
                      onClick={handleUrlSubmit}
                      disabled={!url.trim() || isLoading}
                      className="px-4 py-2 bg-[#8b6834] text-[#faf8f5] text-sm font-medium font-inter hover:bg-[#6b4e25] disabled:bg-[#a08d74] disabled:cursor-not-allowed transition-colors ml-auto"
                    >
                      {isLoading ? 'Loading...' : 'Extract'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Section - Collapsible */}
              <div className="bg-[#e8dcc8] p-2 border-2 border-[#d4c4b0]">
                <button
                  onClick={() => setContentExpanded(!contentExpanded)}
                  className="w-full mx-auto flex items-center justify-between mb-2 hover:bg-[#d4c4b0] px-2 py-1 transition-colors"
                >
                  <h3 className="text-sm font-lora font-bold text-[#2c2419]">
                    Content
                  </h3>
                  <svg
                    className={`w-5 h-5 text-[#5d4e37] transition-transform ${contentExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {contentExpanded && (
                  <div className="space-y-3">
                    {/* Uploads Section */}
                    <div>
                      <label className="text-xs font-inter font-medium text-[#5d4e37] mb-1 block">
                        Uploads
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {/* Logo Upload */}
                        <label className="flex flex-col items-center justify-center min-h-[56px] border-2 border-dashed border-[#d4c4b0] bg-[#faf8f5] hover:bg-[#f5f0e8] transition-colors cursor-pointer p-2">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoUploadInput}
                          />
                          <div className="flex items-center gap-2">
                            {logo ? (
                              <Edit className="w-4 h-4 text-[#8b6834]" />
                            ) : (
                              <Upload className="w-4 h-4 text-[#5d4e37]" />
                            )}
                            <span
                              className={`font-inter font-medium ${logo ? "text-xs text-[#2c2419]" : "text-xs text-[#5d4e37]"}`}
                            >
                              {logo ? "Change Logo" : "Upload Logo"}
                            </span>
                          </div>
                        </label>

                        {/* Image Upload */}
                        <label className="flex flex-col items-center justify-center min-h-[56px] border-2 border-dashed border-[#d4c4b0] bg-[#faf8f5] hover:bg-[#f5f0e8] transition-colors cursor-pointer p-2">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUploadInput}
                          />
                          <div className="flex items-center gap-2">
                            {newsImage ? (
                              <Edit className="w-4 h-4 text-[#8b6834]" />
                            ) : (
                              <Upload className="w-4 h-4 text-[#5d4e37]" />
                            )}
                            <span
                              className={`font-inter font-medium ${newsImage ? "text-xs text-[#2c2419]" : "text-xs text-[#5d4e37]"}`}
                            >
                              {newsImage ? "Change Image" : "Upload Image"}
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                    {/* Headline/Title */}
                    <div>
                      <label className="text-xs font-inter font-medium text-[#5d4e37] mb-1 block">
                        Headline
                      </label>
                      <textarea
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="শিরোনাম এখানে লিখুন..."
                        className="w-full px-2 py-1.5 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] placeholder-[#5d4e37] focus:outline-none focus:ring-2 focus:ring-[#8b6834] min-h-[60px] resize-none font-noto-bengali text-md"
                      />
                    </div>
                    {/* Poll Count Toggle */}
                    <div>
                      <label className="text-xs font-inter font-medium text-[#5d4e37] mb-1 block">
                        Poll Options
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPollCount(2)}
                          className={`flex-1 py-2 px-4 font-inter font-medium transition-colors ${
                            pollCount === 2
                              ? "bg-[#8b6834] text-[#faf8f5]"
                              : "bg-[#faf8f5] text-[#5d4e37] hover:bg-[#f5f0e8]"
                          }`}
                        >
                          2 Options
                        </button>
                        <button
                          onClick={() => setPollCount(3)}
                          className={`flex-1 py-2 px-4 font-inter font-medium transition-colors ${
                            pollCount === 3
                              ? "bg-[#8b6834] text-[#faf8f5]"
                              : "bg-[#faf8f5] text-[#5d4e37] hover:bg-[#f5f0e8]"
                          }`}
                        >
                          3 Options
                        </button>
                      </div>
                    </div>
                    
                    {/* Poll Options Customization */}
                    <div>
                      <label className="text-xs font-inter font-medium text-[#5d4e37] mb-1 block">
                        Customize Poll Options
                      </label>
                      <div className="space-y-2">
                        {pollOptions.slice(0, pollCount).map((option, index) => (
                          <div key={index} className="flex items-center gap-2 bg-[#faf8f5] border border-[#d4c4b0] p-2 rounded">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="flex items-center justify-center w-6 h-6">
                                {option.icon.startsWith('data:') ? (
                                  <img 
                                    src={option.icon} 
                                    alt="Poll icon" 
                                    className="w-4 h-4 object-contain"
                                  />
                                ) : (
                                  renderPollIcon(option.icon, "w-4 h-4")
                                )}
                              </div>
                              <input
                                type="text"
                                value={option.text}
                                onChange={(e) => {
                                  const newOptions = [...pollOptions];
                                  newOptions[index].text = e.target.value;
                                  setPollOptions(newOptions);
                                }}
                                className="flex-1 px-2 py-1 text-sm bg-transparent border-none outline-none font-noto-bengali text-[#2c2419]"
                                placeholder="Option text"
                              />
                            </div>
                            <button
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                      const newOptions = [...pollOptions];
                                      newOptions[index].icon = e.target?.result as string;
                                      setPollOptions(newOptions);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                };
                                input.click();
                              }}
                              className="flex items-center justify-center bg-[#8b6834] text-[#faf8f5] px-2 py-1 rounded hover:bg-[#6d5228] transition-colors"
                            >
                              <Upload className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                const newOptions = [...pollOptions];
                                const defaultOptions = [
                                  { text: "হ্যাঁ", icon: "ThumbsUp" },
                                  { text: "না", icon: "ThumbsDown" },
                                  { text: "মন্তব্য নেই", icon: "MessageSquare" },
                                ];
                                newOptions[index] = defaultOptions[index] || { text: "অপশন", icon: "HelpCircle" };
                                setPollOptions(newOptions);
                              }}
                              className="flex items-center justify-center bg-[#d4c4b0] text-[#2c2419] px-2 py-1 rounded hover:bg-[#c4b49f] transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Poll Icon Size Control */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-inter font-medium text-[#5d4e37]">
                          Icon Size
                        </label>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium text-[#2c2419]">{pollIconSize}px</span>
                          <button
                            onClick={() => setPollIconSize(16)}
                            title="Reset to default"
                            className="text-xs text-[#8b6834] hover:text-[#5d4e37] transition-colors"
                          >
                            ↻
                          </button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="28"
                        value={pollIconSize}
                        onChange={(e) => setPollIconSize(parseInt(e.target.value))}
                        className="w-full h-2 bg-[#d4c4b0] rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${((pollIconSize - 12) / (28 - 12)) * 100}%, #d4c4b0 ${((pollIconSize - 12) / (28 - 12)) * 100}%, #d4c4b0 100%)`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media Links - Collapsible */}
              <div className="bg-[#e8dcc8] p-2 border-2 border-[#d4c4b0]">
                <button
                  onClick={() => setSocialMediaExpanded(!socialMediaExpanded)}
                  className="w-full mx-auto flex items-center justify-between mb-2 hover:bg-[#d4c4b0] px-2 py-1 transition-colors"
                >
                  <h3 className="text-sm font-lora font-bold text-[#2c2419]">
                    Footer
                  </h3>
                  <svg
                    className={`w-5 h-5 text-[#5d4e37] transition-transform ${socialMediaExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {socialMediaExpanded && (
                  <div className="space-y-3">
                    {socialMedia.map((social, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex gap-2 items-center flex-wrap">
                          {[
                            "facebook",
                            "twitter",
                            "instagram",
                            "youtube",
                            "linkedin",
                            "tiktok",
                            "website",
                            "text",
                          ].map((platform) => (
                            <button
                              key={platform}
                              type="button"
                              onClick={() => {
                                const newSocial = [...socialMedia];
                                newSocial[index].platform =
                                  newSocial[index].platform === platform
                                    ? ""
                                    : platform;
                                setSocialMedia(newSocial);
                              }}
                              className={`p-2 w-10 h-10 flex items-center justify-center transition-all ${
                                social.platform === platform
                                  ? "bg-[#8b6834] text-[#faf8f5] shadow-md"
                                  : "bg-[#faf8f5] text-[#5d4e37] hover:bg-[#f5f0e8]"
                              }`}
                              title={
                                platform.charAt(0).toUpperCase() +
                                platform.slice(1)
                              }
                            >
                              {platform === "facebook" && (
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                              )}
                              {platform === "twitter" && (
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                              )}
                              {platform === "instagram" && (
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                </svg>
                              )}
                              {platform === "youtube" && (
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                              )}
                              {platform === "linkedin" && (
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                              )}
                              {platform === "tiktok" && (
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                                </svg>
                              )}
                              {platform === "website" && (
                                <svg
                                  className="w-4 h-4"
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
                              )}
                              {platform === "text" && (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                  />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                        {social.platform && (
                          <input
                            type="text"
                            value={social.username}
                            onChange={(e) => {
                              const newSocial = [...socialMedia];
                              newSocial[index].username = e.target.value;
                              setSocialMedia(newSocial);
                            }}
                            placeholder={
                              social.platform === "website"
                                ? "www.example.com"
                                : social.platform === "text"
                                  ? "Footer text..."
                                  : `@username`
                            }
                            className="w-full px-2 py-1 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] placeholder-[#5d4e37] text-sm focus:outline-none focus:ring-2 focus:ring-[#8b6834] font-noto-bengali"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Customization Panel */}
            <div className="mt-6 flex-shrink-0 md:h-auto">
              <CustomizationPanel
                background={background}
                onBackgroundChange={setBackground}
                frameBorderColor={frameBorderColor}
                frameBorderThickness={frameBorderThickness}
                onFrameChange={handleFrameChange}
                adBannerImage={adBannerImage}
                onAdBannerChange={setAdBannerImage}
                adBannerZoom={adBannerZoom}
                onAdBannerZoomChange={setAdBannerZoom}
                adBannerPosition={adBannerPosition}
                onAdBannerPositionChange={setAdBannerPosition}
                theme={theme}
                onThemeChange={setTheme}
                fontStyles={fontStyles}
                onFontStylesChange={setFontStyles}
                visibilitySettings={visibilitySettings}
                onVisibilityChange={handleVisibilityChange}
                cardType="poll"
                contentLanguage={pollTitle && !isBengali(pollTitle) ? "english" : "bangla"}
              />
            </div>
          </div>

          {/* Resizer - Desktop Only */}
          {isDesktop && (
            <div
              onMouseDown={startResizing}
              className="w-1 bg-[#d4c4b0] cursor-col-resize hover:bg-[#8b6834] transition-colors hidden md:block"
            />
          )}

          {/* Right Preview Area */}
          <DotBackground className="flex-1 bg-[#faf8f5] md:overflow-y-auto md:min-h-0">
            <div className="flex items-start justify-center md:justify-start md:pl-12 p-4 md:pr-8 md:py-8">
              <div className="w-full flex justify-center">
                {!isDesktop ? (
                  <div className="w-full max-w-sm space-y-4">
                    <div className="group cursor-pointer">
                      <div className="bg-[#faf8f5] shadow-lg hover:shadow-xl border-2 border-[#d4c4b0] overflow-hidden">
                        <div className="p-4">
                          <h4 className="text-[#2c2419] font-noto-bengali text-sm font-medium mb-2 line-clamp-2">
                            {title || "শিরোনাম"}
                          </h4>
                          {newsImage && (
                            <div className="mt-2 bg-[#f5f0e8] aspect-video">
                              <img
                                src={newsImage}
                                alt="Thumbnail"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <DownloadControls
                        isVisible={!!(logo || newsImage || title)}
                        targetId="photocard-poll"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <EditingToolbar
                      currentLogo={currentLogo || mockData.logo}
                      currentImage={currentImage || mockData.image}
                      currentTitle={currentTitle || mockData.title}
                      isDragMode={isDragMode}
                      onLogoChange={handleLogoChange}
                      onImageChange={handleImageChange}
                      onTitleChange={handleTitleChange}
                      onDragModeToggle={() => setIsDragMode(!isDragMode)}
                      showImageTool={false}
                      showLogoTool={false}
                      showTitleTool={false}
                      showDragTool={true}
                    />

                    <div className="flex flex-col items-center pt-16">
                      <div className="flex-shrink-0">
                        {renderCard(photocardData, "photocard-poll", true)}
                      </div>
                      <div className="mt-6">
                        <DownloadControls
                          isVisible={!!(logo || newsImage || title)}
                          targetId="photocard-poll"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DotBackground>
        </div>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature="Poll Cards"
          requiredPlan="Basic"
        />
      </div>
    </ProtectedRoute>
  );
}
