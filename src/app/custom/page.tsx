"use client";

import { DotBackground } from "@/components/DotBackground";
import EditingToolbar from "@/components/EditingToolbar";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import ClassicCustomCard from "@/components/cards/custom-cards/ClassicCustomCard";
import ModernCustomCard from "@/components/cards/custom-cards/ModernCustomCard";
import Modern2CustomCard from "@/components/cards/custom-cards/Modern2CustomCard";
import VerticalCustomCard from "@/components/cards/custom-cards/VerticalCustomCard";
import MinimalCustomCard from "@/components/cards/custom-cards/MinimalCustomCard";
import dynamic from "next/dynamic";
import DownloadControls from "@/components/DownloadControls";
import CustomizationPanel from "@/components/CustomizationPanel";
import CreditDisplay from "@/components/CreditDisplay";
import {
  PhotocardData,
  BackgroundOptions,
  CardFontStyles,
  VisibilitySettings,
} from "@/types";
import { Upload, Edit, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UpgradeModal from "@/components/UpgradeModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function CustomPage() {
  const [logo, setLogo] = useState<string>("");
  const [favicon, setFavicon] = useState<string>("");
  const [newsImage, setNewsImage] = useState<string>("");
  const [title, setTitle] = useState("");
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
  const [leftPanelWidth, setLeftPanelWidth] = useState(33.333); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [adBannerImage, setAdBannerImage] = useState<string | null>(null);
  const [adBannerZoom, setAdBannerZoom] = useState<number>(100);
  const [adBannerPosition, setAdBannerPosition] = useState({ x: 0, y: 0 });
  const [theme, setTheme] = useState<string>("classic");
  const [socialMediaExpanded, setSocialMediaExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDragMode, setIsDragMode] = useState(false);
  const [elementLayout, setElementLayout] = useState<{
    topLeft: "logo" | "dateWeek" | "socialMedia" | "website" | "cta";
    topRight: "logo" | "dateWeek" | "socialMedia" | "website" | "cta";
    bottomLeft: "logo" | "dateWeek" | "socialMedia" | "website" | "cta";
    bottomRight: "logo" | "dateWeek" | "socialMedia" | "website" | "cta";
  }>({
    topLeft: "logo",
    topRight: "dateWeek",
    bottomLeft: "socialMedia",
    bottomRight: "website",
  });

  // Modern2 layout with center position for favicon
  const [modern2ElementLayout, setModern2ElementLayout] = useState<{
    topLeft: "logo" | "dateWeek" | "socialMedia" | "website" | "favicon";
    topRight: "logo" | "dateWeek" | "socialMedia" | "website" | "favicon";
    bottomLeft: "logo" | "dateWeek" | "socialMedia" | "website" | "favicon";
    bottomRight: "logo" | "dateWeek" | "socialMedia" | "website" | "favicon";
    center: "logo" | "dateWeek" | "socialMedia" | "website" | "favicon";
  }>({
    topLeft: "logo",
    topRight: "dateWeek",
    bottomLeft: "socialMedia",
    bottomRight: "website",
    center: "favicon",
  });

  // Vertical theme layout (4-slot system: left content + right positions)
  const [verticalElementLayout, setVerticalElementLayout] = useState<{
    left: "logo" | "cta" | "empty";
    right: "logo" | "cta" | "empty";
    rightTop: "logo" | "cta" | "empty";
    rightBottom: "logo" | "cta" | "empty";
    bottomLeft?: "socialMedia" | "website";
    bottomRight?: "socialMedia" | "website";
  }>({
    left: "logo",
    right: "cta",
    rightTop: "empty",
    rightBottom: "empty",
    bottomLeft: "socialMedia",
    bottomRight: "website",
  });

  // Minimal theme layout (2-slot system: top positions only)
  const [minimalElementLayout, setMinimalElementLayout] = useState<{
    topLeft: "logo" | "dateWeek" | "cta";
    topRight: "logo" | "dateWeek" | "cta";
    bottomLeft?: "socialMedia" | "website";
    bottomRight?: "socialMedia" | "website";
  }>({
    topLeft: "dateWeek",
    topRight: "logo",
    bottomLeft: "socialMedia",
    bottomRight: "website",
  });

  const [ctaAlignment, setCtaAlignment] = useState<"left" | "center" | "right">(
    "center",
  );

  // Editing state - same as URL page
  const [currentLogo, setCurrentLogo] = useState<string>("");
  const [currentImage, setCurrentImage] = useState<string>("");
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const [isLogoFavicon, setIsLogoFavicon] = useState(false);

  // Font styles state - same as URL page
  const [fontStyles, setFontStyles] = useState<CardFontStyles>({
    week: {
      fontFamily: "Noto Sans Bengali",
      fontSize: "18px",
      fontWeight: "500",
      color: "#FFFFFF",
      textAlign: "center",
      letterSpacing: "0px",
    },
    date: {
      fontFamily: "Noto Sans Bengali",
      fontSize: "18px",
      fontWeight: "500",
      color: "#FFFFFF",
      textAlign: "center",
      letterSpacing: "0px",
    },
    headline: {
      fontFamily: "Noto Sans Bengali",
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
    footer: {
      fontFamily: "Noto Sans Bengali",
      fontSize: "12px", // Default size
      fontWeight: "500",
      color: "#FFFFFF",
      textAlign: "left",
      letterSpacing: "0px",
    },
  });

  // Visibility settings state - same as URL page
  const [visibilitySettings, setVisibilitySettings] =
    useState<VisibilitySettings>({
      showWeek: true,
      showDate: true,
      showLogo: true,
      showQrCode: false, // Not used in custom cards
      showTitle: true,
      showAdBanner: true,
    });

  // Mock data for preview - same as URL page
  const mockData: PhotocardData = {
    title:
      currentTitle || "এই একটি নমুনা শিরোনাম যা দেখায় ফটোকার্ড কেমন দেখাবে",
    image: currentImage || "",
    logo: currentLogo || "",
    favicon: "https://www.google.com/favicon.ico",
    siteName: "Custom Card",
    url: "https://example.com",
    weekName: "শনিবার",
    date: "২৪ জানুয়ারি ২০২৬",
  };

  // Update current data when main data changes
  useEffect(() => {
    setCurrentTitle(title || mockData.title);
    setCurrentImage(newsImage || mockData.image);
    setCurrentLogo(logo || mockData.logo);
  }, [title, newsImage, logo]);

  // Update font styles when theme changes
  useEffect(() => {
    if (theme === "vertical") {
      // Set specific defaults for vertical theme
      setFontStyles((prev) => ({
        ...prev,
        week: {
          ...prev.week,
          fontSize: "12px",
        },
        date: {
          ...prev.date,
          fontSize: "12px",
        },
        headline: {
          ...prev.headline,
          fontSize: "25px",
        },
        footer: {
          ...prev.footer,
          fontSize: "12px",
        },
      }));
    } else {
      // Reset to default for other themes
      setFontStyles((prev) => ({
        ...prev,
        week: {
          ...prev.week,
          fontSize: "18px",
        },
        date: {
          ...prev.date,
          fontSize: "18px",
        },
        headline: {
          ...prev.headline,
          fontSize: "24px",
        },
        footer: {
          ...prev.footer,
          fontSize: "12px",
        },
      }));
    }
  }, [theme]);

  const handleFrameChange = (color: string, thickness: number) => {
    setFrameBorderColor(color);
    setFrameBorderThickness(thickness);
  };

  // Editing toolbar handlers - same as URL page
  const handleLogoChange = (logoUrl: string, isFavicon: boolean) => {
    setCurrentLogo(logoUrl);
    setIsLogoFavicon(isFavicon);
    setLogo(logoUrl); // Also update main logo state
  };

  const handleImageChange = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setNewsImage(imageUrl); // Also update main image state
  };

  const handleTitleChange = (titleText: string) => {
    setCurrentTitle(titleText);
    setTitle(titleText); // Also update main title state
  };

  // Logo upload from drag menu
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

  // Favicon upload from drag menu
  const handleFaviconUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFavicon(result);
    };
    reader.readAsDataURL(file);
  };

  // Restore all settings to defaults
  const handleRestoreDefaults = () => {
    // Reset element layout
    setElementLayout({
      topLeft: "logo",
      topRight: "dateWeek",
      bottomLeft: "socialMedia",
      bottomRight: "cta",
    });

    // Reset vertical element layout
    setVerticalElementLayout({
      left: "logo",
      right: "cta",
      rightTop: "empty",
      rightBottom: "empty",
    });

    // Reset minimal element layout
    setMinimalElementLayout({
      topLeft: "dateWeek",
      topRight: "logo",
    });

    setCtaAlignment("center");

    // Reset visibility settings
    setVisibilitySettings({
      showWeek: true,
      showDate: true,
      showLogo: true,
      showQrCode: false,
      showTitle: true,
      showAdBanner: true,
    });

    // Reset font styles based on current theme
    if (theme === "vertical") {
      setFontStyles({
        week: {
          fontFamily: "Noto Sans Bengali",
          fontSize: "12px",
          fontWeight: "500",
          color: "#FFFFFF",
          textAlign: "center",
          letterSpacing: "0px",
        },
        date: {
          fontFamily: "Noto Sans Bengali",
          fontSize: "12px",
          fontWeight: "500",
          color: "#FFFFFF",
          textAlign: "center",
          letterSpacing: "0px",
        },
        headline: {
          fontFamily: "Noto Sans Bengali",
          fontSize: "25px",
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
        footer: {
          fontFamily: "Noto Sans Bengali",
          fontSize: "12px",
          fontWeight: "500",
          color: "#FFFFFF",
          textAlign: "left",
          letterSpacing: "0px",
        },
      });
    } else {
      setFontStyles({
        week: {
          fontFamily: "Noto Sans Bengali",
          fontSize: "18px",
          fontWeight: "500",
          color: "#FFFFFF",
          textAlign: "center",
          letterSpacing: "0px",
        },
        date: {
          fontFamily: "Noto Sans Bengali",
          fontSize: "18px",
          fontWeight: "500",
          color: "#FFFFFF",
          textAlign: "center",
          letterSpacing: "0px",
        },
        headline: {
          fontFamily: "Noto Sans Bengali",
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
        footer: {
          fontFamily: "Noto Sans Bengali",
          fontSize: "12px",
          fontWeight: "500",
          color: "#FFFFFF",
          textAlign: "left",
          letterSpacing: "0px",
        },
      });
    }

    // Reset frame border
    setFrameBorderColor("#FFFFFF");
    setFrameBorderThickness(0);

    // Reset ad banner
    setAdBannerImage(null);
    setAdBannerZoom(100);
    setAdBannerPosition({ x: 0, y: 0 });

    // Reset background to default
    setBackground({
      type: "solid",
      color: "#dc2626",
    });
  };

  // Render the appropriate card based on theme
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

    const baseProps = {
      data: {
        ...cardData,
        title: currentTitle || cardData.title,
        image: currentImage || cardData.image,
        logo: currentLogo || cardData.logo,
      },
      background,
      id: cardId,
      fullSize: isFullSize,
      frameBorderColor,
      frameBorderThickness,
      socialMedia: socialOnly,
      adBannerImage,
      adBannerZoom,
      adBannerPosition,
      website,
      footerText,
      fontStyles,
      visibilitySettings,
      isLogoFavicon,
      isDragMode,
      ctaAlignment,
      onVisibilityChange: setVisibilitySettings,
      onLogoUpload: handleLogoUpload,
      onFaviconUpload: handleFaviconUpload,
      onRestoreDefaults: handleRestoreDefaults,
    };

    return (
      <div key={cardData.title + cardData.url + Date.now()}>
        {theme === "vertical" ? (
          <VerticalCustomCard
            {...baseProps}
            elementLayout={verticalElementLayout}
            onLayoutChange={setVerticalElementLayout}
          />
        ) : theme === "modern2" ? (
          <Modern2CustomCard
            {...baseProps}
            elementLayout={modern2ElementLayout}
            onLayoutChange={setModern2ElementLayout}
          />
        ) : theme === "minimal" ? (
          <MinimalCustomCard
            {...baseProps}
            elementLayout={minimalElementLayout}
            onLayoutChange={setMinimalElementLayout}
          />
        ) : theme === "modern" ? (
          <ModernCustomCard
            {...baseProps}
            elementLayout={elementLayout}
            onLayoutChange={setElementLayout}
          />
        ) : (
          <ClassicCustomCard
            {...baseProps}
            elementLayout={elementLayout}
            onLayoutChange={setElementLayout}
          />
        )}
      </div>
    );
  };

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 20 && newWidth < 60) {
        setLeftPanelWidth(newWidth);
      }
    },
    [isResizing],
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fix hydration error
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const STORAGE_KEY = "photocard-app-custom-state-v2";

  // Clear everything when leaving the page
  useEffect(() => {
    return () => {
      // Cleanup: Remove localStorage data when component unmounts (user navigates away)
      localStorage.removeItem(STORAGE_KEY);
    };
  }, []);

  // Load state from local storage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.logo) setLogo(parsed.logo);
        if (parsed.newsImage) setNewsImage(parsed.newsImage);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.background) setBackground(parsed.background);
        if (parsed.frameBorderColor)
          setFrameBorderColor(parsed.frameBorderColor);
        if (parsed.frameBorderThickness !== undefined)
          setFrameBorderThickness(parsed.frameBorderThickness);
        if (parsed.socialMedia) setSocialMedia(parsed.socialMedia);
        if (parsed.adBannerImage) setAdBannerImage(parsed.adBannerImage);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.visibilitySettings)
          setVisibilitySettings(parsed.visibilitySettings);
        if (parsed.fontStyles) setFontStyles(parsed.fontStyles);
        if (parsed.currentLogo) setCurrentLogo(parsed.currentLogo);
        if (parsed.currentImage) setCurrentImage(parsed.currentImage);
        if (parsed.currentTitle) setCurrentTitle(parsed.currentTitle);
        if (parsed.elementLayout) setElementLayout(parsed.elementLayout);
        if (parsed.verticalElementLayout)
          setVerticalElementLayout(parsed.verticalElementLayout);
        if (parsed.minimalElementLayout)
          setMinimalElementLayout(parsed.minimalElementLayout);
        if (parsed.ctaAlignment) setCtaAlignment(parsed.ctaAlignment);
      }
    } catch (error) {
      console.error("Failed to load custom state from local storage:", error);
    }
  }, []);

  // Save state to local storage with debounce
  useEffect(() => {
    const saveState = setTimeout(() => {
      try {
        const stateToSave = {
          logo,
          newsImage,
          title,
          background,
          frameBorderColor,
          frameBorderThickness,
          socialMedia,
          adBannerImage,
          theme,
          visibilitySettings,
          fontStyles,
          currentLogo,
          currentImage,
          currentTitle,
          elementLayout,
          verticalElementLayout,
          minimalElementLayout,
          ctaAlignment,
          timestamp: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.error("Failed to save custom state to local storage:", error);
        // If quota exceeded, try to save without heavy items (images)
        if (
          error instanceof DOMException &&
          error.name === "QuotaExceededError"
        ) {
          try {
            // Create fallback state without large images
            const fallbackState = {
              // Exclude logo, newsImage, adBannerImage which are likely base64 strings
              title,
              background,
              frameBorderColor,
              frameBorderThickness,
              socialMedia,
              theme,
              visibilitySettings,
              fontStyles,
              timestamp: Date.now(),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackState));
          } catch (e) {
            console.error(
              "Failed to save custom state even after reducing size:",
              e,
            );
          }
        }
      }
    }, 1000);

    return () => clearTimeout(saveState);
  }, [
    logo,
    newsImage,
    title,
    background,
    frameBorderColor,
    frameBorderThickness,
    socialMedia,
    adBannerImage,
    theme,
    visibilitySettings,
    fontStyles,
    currentLogo,
    currentImage,
    currentTitle,
    elementLayout,
    verticalElementLayout,
    minimalElementLayout,
    ctaAlignment,
  ]);

  const handleLogoUploadInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUploadInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewsImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create photocard data from custom inputs or use mock data
  const photocardData: PhotocardData = {
    title: title || mockData.title,
    image: newsImage || mockData.image,
    logo: logo || mockData.logo,
    favicon: favicon,
    siteName: "Custom Card",
    url: "",
    weekName: new Date().toLocaleDateString("bn-BD", { weekday: "long" }),
    date: new Date().toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };

  if (!isMounted) {
    return (
      <ProtectedRoute>
        <div className="h-screen bg-[#faf8f5] flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-[#5d4e37] font-inter">Loading...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="h-screen bg-[#faf8f5] flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Main Content Layout */}
        <div className="flex flex-1 flex-col md:flex-row md:min-h-0 relative">
          {/* Lock Overlay for Free/Basic Users */}
          {!features?.customCards &&
            user?.plan !== "Basic" &&
            user?.plan !== "Premium" && (
              <div className="fixed inset-0 z-40 bg-[#2c2419]/80 backdrop-blur-md flex items-center justify-center">
                <div className="bg-[#faf8f5] p-8 border-4 border-[#8b6834] max-w-md mx-4 text-center">
                  <div className="w-16 h-16 bg-[#8b6834] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-[#faf8f5]" />
                  </div>
                  <h3 className="text-2xl font-lora font-bold text-[#2c2419] mb-3">
                    Custom Cards Locked
                  </h3>
                  <p className="text-[#5d4e37] font-inter mb-6">
                    Custom cards are available for Basic and Premium users.
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
            {/* Custom Input Section */}
            <div className="space-y-3">
              {/* Compact Uploads - Side by Side */}
              <div className="bg-[#e8dcc8] p-2 border-2 border-[#d4c4b0]">
                <h3 className="text-sm font-lora font-bold text-[#2c2419] mb-2">
                  Uploads
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {/* Logo Upload */}
                  <label className="flex flex-col items-center justify-center min-h-[56px] border-2 border-dashed border-[#d4c4b0] bg-[#faf8f5] hover:bg-[#f5f0e8] transition-colors cursor-pointer p-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUploadInput}
                    />
                    {/* Icon + label (bigger) */}
                    <div className="flex items-center gap-2">
                      {logo ? (
                        <Edit className="w-4 h-4 text-[#8b6834]" />
                      ) : (
                        <Upload className="w-4 h-4 text-[#5d4e37]" />
                      )}
                      <span
                        className={`font-inter font-medium ${logo ? "text-sm text-[#2c2419]" : "text-sm text-[#5d4e37]"}`}
                      >
                        {logo ? "Change Logo" : "Upload Logo"}
                      </span>
                    </div>
                  </label>

                  {/* News Image Upload */}
                  <label className="flex flex-col items-center justify-center min-h-[56px] border-2 border-dashed border-[#d4c4b0] bg-[#faf8f5] hover:bg-[#f5f0e8] transition-colors cursor-pointer p-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUploadInput}
                    />
                    {/* Icon + label (bigger) */}
                    <div className="flex items-center gap-2">
                      {newsImage ? (
                        <Edit className="w-4 h-4 text-[#8b6834]" />
                      ) : (
                        <Upload className="w-4 h-4 text-[#5d4e37]" />
                      )}
                      <span
                        className={`font-inter font-medium ${newsImage ? "text-sm text-[#2c2419]" : "text-sm text-[#5d4e37]"}`}
                      >
                        {newsImage ? "Change Image" : "Upload Image"}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Title Input */}
              <div className="bg-[#e8dcc8] p-2 border-2 border-[#d4c4b0]">
                <h3 className="text-sm font-lora font-bold text-[#2c2419] mb-2">
                  Title
                </h3>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="আপনার শিরোনাম এখানে লিখুন..."
                  className="w-full px-2 py-1.5 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] placeholder-[#5d4e37] focus:outline-none focus:ring-2 focus:ring-[#8b6834] min-h-[60px] resize-none font-noto-bengali text-md"
                />
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
                        {/* Platform Icons Selection */}
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
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
                visibilitySettings={visibilitySettings}
                onVisibilityChange={(newSettings) =>
                  setVisibilitySettings(newSettings as VisibilitySettings)
                }
                fontStyles={fontStyles}
                onFontStylesChange={setFontStyles}
              />
            </div>
          </div>

          {/* Resize Handle - Desktop only */}
          <div
            className="hidden md:block w-1 bg-[#d4c4b0] hover:bg-[#8b6834] cursor-col-resize active:bg-[#6b4e25] transition-colors"
            onMouseDown={handleMouseDown}
            style={{
              cursor: isResizing ? "col-resize" : "col-resize",
              userSelect: "none",
            }}
          />

          {/* Right Preview Area */}
          <DotBackground className="flex-1 bg-[#faf8f5] md:overflow-y-auto md:min-h-0">
            <div className="flex items-start justify-center md:justify-start md:pl-12 p-4 md:pr-8 md:py-8">
              <div className="w-full flex justify-center">
                {!isDesktop ? (
                  <>
                    {/* Mobile Thumbnail View */}
                    <div className="w-full max-w-sm space-y-4">
                      <div
                        className="group cursor-pointer"
                        onClick={() => {
                          // Show the modal on mobile
                          const modal = document.getElementById(
                            "mobile-photocard-modal",
                          );
                          if (modal) modal.classList.remove("hidden");
                        }}
                      >
                        <div className="bg-[#faf8f5] shadow-lg hover:shadow-xl border-2 border-[#d4c4b0] overflow-hidden relative group-hover:border-[#8b6834] transition-all duration-300">
                          {/* Thumbnail header with gradient */}
                          <div
                            className={`h-3 relative ${
                              background?.type === "gradient"
                                ? "bg-gradient-to-r"
                                : "bg-[#8b6834]"
                            }`}
                            style={
                              background?.type === "gradient"
                                ? {
                                    backgroundImage: `linear-gradient(90deg, ${background.gradientFrom || "#8b6834"}, ${background.gradientTo || "#c19a6b"})`,
                                  }
                                : {
                                    backgroundColor:
                                      background?.color || "#8b6834",
                                  }
                            }
                          ></div>

                          {/* Thumbnail content */}
                          <div className="p-4">
                            {/* Image */}
                            {photocardData.image && (
                              <div className="bg-[#f5f0e8] aspect-video mb-3 overflow-hidden">
                                <img
                                  src={photocardData.image}
                                  alt="Thumbnail"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            {/* Title */}
                            <h4 className="text-[#2c2419] font-noto-bengali text-sm font-medium mb-2 line-clamp-2 leading-tight">
                              {photocardData.title}
                            </h4>

                            {/* Date */}
                            <p className="text-xs font-noto-bengali text-[#5d4e37] mb-3">
                              {photocardData.date}
                            </p>

                            {/* Tap to view */}
                            <div className="flex items-center justify-center py-2 bg-[#f5f0e8] group-hover:bg-[#e8dcc8] transition-colors duration-300">
                              <span className="text-xs font-medium text-[#5d4e37] group-hover:text-[#8b6834] flex items-center gap-2 font-inter">
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                Tap to view full card
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Download controls below thumbnail */}
                      <div className="flex justify-center">
                        <DownloadControls
                          isVisible={!!(logo || newsImage || title)}
                          targetId="photocard-custom"
                        />
                      </div>
                    </div>

                    {/* Mobile Modal */}
                    <div
                      id="mobile-photocard-modal"
                      className="hidden fixed inset-0 bg-black/80 z-50 overflow-y-auto"
                      onClick={(e) => {
                        if (e.target === e.currentTarget) {
                          e.currentTarget.classList.add("hidden");
                        }
                      }}
                    >
                      <div className="min-h-screen flex items-center justify-center p-4">
                        <div className="relative">
                          {/* Close button */}
                          <button
                            onClick={() => {
                              const modal = document.getElementById(
                                "mobile-photocard-modal",
                              );
                              if (modal) modal.classList.add("hidden");
                            }}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                          >
                            <svg
                              className="w-8 h-8"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>

                          {renderCard(
                            photocardData,
                            "photocard-custom-modal",
                            true,
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Desktop Full View */
                  <div className="relative w-full h-full">
                    {/* Editing Toolbar - Same as URL page */}
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
                        {renderCard(photocardData, "photocard-custom", true)}
                      </div>

                      {/* Download controls */}
                      <div className="mt-6">
                        <DownloadControls
                          isVisible={!!(logo || newsImage || title)}
                          targetId="photocard-custom"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DotBackground>
        </div>

        {/* Upgrade Modal */}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature="Custom Cards"
          requiredPlan="Basic"
        />
      </div>
    </ProtectedRoute>
  );
}
