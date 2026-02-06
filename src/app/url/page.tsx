"use client";

import { DotBackground } from "@/components/DotBackground";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import UrlComponent from "@/components/UrlComponent";
import ModernUrlCard from "@/components/cards/url-cards/ModernUrlCard";
import Modern2UrlCard from "@/components/cards/url-cards/Modern2UrlCard";
import VerticalUrlCard from "@/components/cards/url-cards/VerticalUrlCard";
import MinimalUrlCard from "@/components/cards/url-cards/MinimalUrlCard";
import CustomizationPanel from "@/components/CustomizationPanel";
import {
  PhotocardData,
  BackgroundOptions,  
  MultiplePhotocardData,
  UrlData,
  CardFontStyles,
  VisibilitySettings,
} from "@/types";
import { cardAPI } from "@/lib/api";
import UpgradeModal from "@/components/UpgradeModal";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ClassicUrlCard from "@/components/cards/url-cards/ClassicUrlCard";
import DownloadControls from "@/components/DownloadControls";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { createRoot } from "react-dom/client"; // For off-screen rendering
import EditingToolbar from "@/components/EditingToolbar";

export default function Home() {
  const { user, canGenerateCard, refreshCredits } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");
  const [requiredPlan, setRequiredPlan] = useState<"Basic" | "Premium">(
    "Basic",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [photocardData, setPhotocardData] = useState<PhotocardData | null>(
    null,
  );
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [background, setBackground] = useState<BackgroundOptions>({
    type: "solid",
    color: "#dc2626",
  });
  const [frameBorderColor, setFrameBorderColor] = useState("#FFFFFF");
  const [frameBorderThickness, setFrameBorderThickness] = useState(0);
  const [mode, setMode] = useState<"single" | "multiple">("single");
  const [clearUrl, setClearUrl] = useState(false);
  const [multiplePhotocards, setMultiplePhotocards] = useState<
    MultiplePhotocardData[]
  >([]);
  const [selectedPhotocardIndex, setSelectedPhotocardIndex] = useState<
    number | null
  >(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(33.333); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [adBannerImage, setAdBannerImage] = useState<string | null>(null);
  const [adBannerZoom, setAdBannerZoom] = useState<number>(100);
  const [theme, setTheme] = useState<string>("classic");
  const [isDragMode, setIsDragMode] = useState(false);
  const [elementLayout, setElementLayout] = useState<{
    topLeft: 'logo' | 'dateWeek' | 'qrCode' | 'cta';
    topRight: 'logo' | 'dateWeek' | 'qrCode' | 'cta';
    bottomLeft: 'logo' | 'dateWeek' | 'qrCode' | 'cta';
    bottomRight: 'logo' | 'dateWeek' | 'qrCode' | 'cta';
  }>({
    topLeft: 'logo',
    topRight: 'dateWeek',
    bottomLeft: 'qrCode',
    bottomRight: 'cta',
  });

  // Vertical theme layout (4-slot system: left content + right positions)
  const [verticalElementLayout, setVerticalElementLayout] = useState<{
    left: 'logo' | 'cta' | 'qrCode' | 'empty';
    right: 'logo' | 'cta' | 'qrCode' | 'empty';
    rightTop: 'logo' | 'cta' | 'qrCode' | 'empty';
    rightBottom: 'logo' | 'cta' | 'qrCode' | 'empty';
  }>({
    left: 'logo',
    right: 'cta',
    rightTop: 'empty',
    rightBottom: 'qrCode',
  });

  // Modern2 theme layout (5-slot system: includes center favicon)
  const [modern2ElementLayout, setModern2ElementLayout] = useState<{
    topLeft: 'logo' | 'dateWeek' | 'qrCode' | 'cta' | 'favicon';
    topRight: 'logo' | 'dateWeek' | 'qrCode' | 'cta' | 'favicon';
    bottomLeft: 'logo' | 'dateWeek' | 'qrCode' | 'cta' | 'favicon';
    bottomRight: 'logo' | 'dateWeek' | 'qrCode' | 'cta' | 'favicon';
    center: 'logo' | 'dateWeek' | 'qrCode' | 'cta' | 'favicon';
  }>({
    topLeft: 'logo',
    topRight: 'dateWeek',
    bottomLeft: 'qrCode',
    bottomRight: 'cta',
    center: 'favicon',
  });

  // Minimal theme layout (4-slot system: dateWeek, favicon, qrCode, cta)
  const [minimalElementLayout, setMinimalElementLayout] = useState<{
    topLeft: 'favicon' | 'dateWeek' | 'qrCode' | 'cta';
    topRight: 'favicon' | 'dateWeek' | 'qrCode' | 'cta';
    bottomLeft: 'favicon' | 'dateWeek' | 'qrCode' | 'cta';
    bottomRight: 'favicon' | 'dateWeek' | 'qrCode' | 'cta';
  }>({
    topLeft: 'dateWeek',
    topRight: 'favicon',
    bottomLeft: 'qrCode',
    bottomRight: 'cta',
  });

  // Font styles state
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
    },
  });

  // Visibility settings state
  const [visibilitySettings, setVisibilitySettings] =
    useState<VisibilitySettings>({
      showWeek: true,
      showDate: true,
      showLogo: true,
      showQrCode: true,
      showTitle: true,
    });

  // Editing state
  const [currentLogo, setCurrentLogo] = useState<string>("");
  const [currentFavicon, setCurrentFavicon] = useState<string>("");
  const [currentImage, setCurrentImage] = useState<string>("");
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const [isLogoFavicon, setIsLogoFavicon] = useState(false);

  // Mock data for preview
  const mockData: PhotocardData = {
    title: currentTitle || "এই একটি নমুনা শিরোনাম যা দেখায় ফটোকার্ড কেমন দেখাবে",
    image: currentImage || "",
    logo: currentLogo || "",
    favicon: currentFavicon || "",
    siteName: "Example News",
    url: "https://example.com",
    weekName: "শনিবার",
    date: "২৪ জানুয়ারি ২০২৬",
  };

  // Update current data when photocard data changes
  useEffect(() => {
    if (photocardData) {
      setCurrentTitle(photocardData.title);
      setCurrentImage(photocardData.image);
      setCurrentLogo(photocardData.logo);
    } else {
      setCurrentTitle(mockData.title);
      setCurrentImage(mockData.image);
      setCurrentLogo(mockData.logo);
    }
  }, [photocardData]);

  // Update font styles when theme changes
  useEffect(() => {
    if (theme === "vertical") {
      // Set specific defaults for vertical theme
      setFontStyles(prev => ({
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
      }));
    } else {
      // Reset to default for other themes
      setFontStyles(prev => ({
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
      }));
    }
  }, [theme]);

  const handleUrlSubmit = async (url: string) => {
    // Check if user can generate cards
    if (!canGenerateCard()) {
      setUpgradeFeature("Daily Generation Limit");
      setRequiredPlan(user?.plan === "Free" ? "Basic" : "Premium");
      setShowUpgradeModal(true);
      return;
    }

    setIsLoading(true);
    setError("");
    setPhotocardData(null);

    try {
      const response = await fetch("/api/extract-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to extract URL data");
      }

      const data: UrlData = await response.json();

      // Create photocard data with current date/time
      const now = new Date();
      const weekdays = [
        "রবিবার",
        "সোমবার",
        "মঙ্গলবার",
        "বুধবার",
        "বৃহস্পতিবার",
        "শুক্রবার",
        "শনিবার",
      ];

      const photocardData: PhotocardData = {
        ...data,
        weekName: weekdays[now.getDay()],
        date: now.toLocaleDateString("bn-BD", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };

      setPhotocardData(photocardData);

      // Record card generation in backend (non-blocking)
      try {
        await cardAPI.generate({
          card_type: "url",
          source_url: url,
          theme: theme,
        });

        // Refresh credits to update UI
        await refreshCredits();
      } catch (creditError: any) {
        // Silently fail - card is already generated, this is just for tracking
        console.warn("Could not record card generation:", creditError);
        
        // Still try to refresh credits even if recording failed
        try {
          await refreshCredits();
        } catch (refreshError) {
          console.warn("Could not refresh credits:", refreshError);
        }
      }

      setUrl(""); // Auto-clear URL after successful generation
    } catch (err) {
      console.error("Error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFrameChange = (color: string, thickness: number) => {
    setFrameBorderColor(color);
    setFrameBorderThickness(thickness);
  };

  // Editing toolbar handlers
  const handleLogoChange = (logo: string, isFavicon: boolean) => {
    setCurrentLogo(logo);
    setIsLogoFavicon(isFavicon);
  };

  const handleImageChange = (image: string) => {
    setCurrentImage(image);
  };

  const handleTitleChange = (title: string) => {
    setCurrentTitle(title);
  };

  // Logo upload from drag menu
  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCurrentLogo(result);
      setIsLogoFavicon(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCurrentFavicon(result);
    };
    reader.readAsDataURL(file);
  };

  // Restore all settings to defaults
  const handleRestoreDefaults = () => {
    // Reset element layout for regular themes
    setElementLayout({
      topLeft: 'logo',
      topRight: 'dateWeek',
      bottomLeft: 'qrCode',
      bottomRight: 'cta',
    });
    
    // Reset modern2 element layout
    setModern2ElementLayout({
      topLeft: 'logo',
      topRight: 'dateWeek',
      bottomLeft: 'qrCode',
      bottomRight: 'cta',
      center: 'favicon',
    });
    
    // Reset vertical element layout
    setVerticalElementLayout({
      left: 'logo',
      right: 'cta',
      rightTop: 'empty',
      rightBottom: 'qrCode',
    });
    
    // Reset minimal element layout
    setMinimalElementLayout({
      topLeft: 'dateWeek',
      topRight: 'favicon',
      bottomLeft: 'qrCode',
      bottomRight: 'cta',
    });
    
    // Reset visibility settings
    setVisibilitySettings({
      showWeek: true,
      showDate: true,
      showLogo: true,
      showQrCode: true,
      showTitle: true,
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
        },
      });
    }
    
    // Reset frame border
    setFrameBorderColor("#FFFFFF");
    setFrameBorderThickness(0);
    
    // Reset ad banner
    setAdBannerImage(null);
    setAdBannerZoom(100);
    
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
    useOverrides = true,
  ) => {
    const baseCardData = useOverrides
      ? {
          ...cardData,
          title: currentTitle || cardData.title,
          image: currentImage || cardData.image,
          logo: currentLogo || cardData.logo,
          favicon: currentFavicon || cardData.favicon,
        }
      : cardData;

    const commonProps = {
      data: baseCardData,
      isGenerating: isLoading,
      background,
      id: cardId,
      fullSize: isFullSize,
      frameBorderColor,
      frameBorderThickness,
      adBannerImage,
      adBannerZoom,
      fontStyles,
      visibilitySettings,
      isLogoFavicon,
      isDragMode,
      onVisibilityChange: setVisibilitySettings,
      onLogoUpload: handleLogoUpload,
      onFaviconUpload: handleFaviconUpload,
      onRestoreDefaults: handleRestoreDefaults,
    };

    return (
      <div key={cardData.title + cardData.url + Date.now()}>
        {theme === "vertical" ? (
          <VerticalUrlCard
            {...commonProps}
            elementLayout={verticalElementLayout}
            onLayoutChange={setVerticalElementLayout}
          />
        ) : theme === "modern" ? (
          <ModernUrlCard
            {...commonProps}
            elementLayout={elementLayout}
            onLayoutChange={setElementLayout}
          />
        ) : theme === "modern2" ? (
          <Modern2UrlCard
            {...commonProps}
            elementLayout={modern2ElementLayout}
            onLayoutChange={setModern2ElementLayout}
          />
        ) : theme === "minimal" ? (
          <MinimalUrlCard
            {...commonProps}
            elementLayout={minimalElementLayout}
            onLayoutChange={setMinimalElementLayout}
          />
        ) : (
          <ClassicUrlCard
            {...commonProps}
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

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;

    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 60) {
      setLeftPanelWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // No localStorage for URL cards as per requirement




  const handleUrlCleared = () => {
    setClearUrl(false);
  };

  const handleMultipleUrlsSubmit = async (urls: string[]) => {
    // Check if user can generate cards
    if (!canGenerateCard()) {
      setUpgradeFeature("Daily Generation Limit");
      setRequiredPlan(user?.plan === "Free" ? "Basic" : "Premium");
      setShowUpgradeModal(true);
      return;
    }

    setIsLoading(true);
    setError("");
    setMultiplePhotocards([]);

    // Initialize photocard data with pending status
    const initialData: MultiplePhotocardData[] = urls.map((url, index) => ({
      id: `photocard-${index}`,
      data: {
        title: "",
        image: "",
        logo: "",
        favicon: "",
        siteName: "",
        url,
        weekName: "",
        date: "",
      },
      status: "pending",
    }));

    setMultiplePhotocards(initialData);

    let successfulGenerations = 0;

    // Process each URL
    for (let i = 0; i < urls.length; i++) {
      try {
        // Update status to loading
        setMultiplePhotocards((prev) =>
          prev.map((item) =>
            item.id === `photocard-${i}`
              ? { ...item, status: "loading" as const }
              : item,
          ),
        );

        const response = await fetch("/api/extract-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: urls[i] }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to extract URL data");
        }

        const data: UrlData = await response.json();

        // Create photocard data with current date/time
        const now = new Date();
        const weekdays = [
          "রবিবার",
          "সোমবার",
          "মঙ্গলবার",
          "বুধবার",
          "বৃহস্পতিবার",
          "শুক্রবার",
          "শনিবার",
        ];

        const photocardData: PhotocardData = {
          ...data,
          weekName: weekdays[now.getDay()],
          date: now.toLocaleDateString("bn-BD", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        };

        // Update with completed data
        setMultiplePhotocards((prev) =>
          prev.map((item) =>
            item.id === `photocard-${i}`
              ? { ...item, data: photocardData, status: "completed" as const }
              : item,
          ),
        );

        successfulGenerations++;
      } catch (err) {
        console.error("Error processing URL:", urls[i], err);
        setMultiplePhotocards((prev) =>
          prev.map((item) =>
            item.id === `photocard-${i}`
              ? {
                  ...item,
                  status: "error" as const,
                  error:
                    err instanceof Error
                      ? err.message
                      : "An unexpected error occurred",
                }
              : item,
          ),
        );
      }
    }

    // Record batch generation in backend
    if (successfulGenerations > 0) {
      try {
        await cardAPI.generate({
          card_type: "url",
          source_url: urls[0], // Store first URL as representative
          theme: theme,
          is_batch: true,
          batch_count: successfulGenerations,
        });

        // Refresh credits to update UI
        await refreshCredits();
      } catch (creditError) {
        // Silently fail - cards are already generated
        console.warn("Could not record batch generation:", creditError);
        
        // Still try to refresh credits
        try {
          await refreshCredits();
        } catch (refreshError) {
          console.warn("Could not refresh credits:", refreshError);
        }
      }
    }

    setIsLoading(false);
  };

  const handleDownloadAll = async () => {
    if (completedPhotocards.length === 0) return;
    setIsLoading(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder("photocards");
      
      // Create a hidden container for rendering
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.top = "-9999px";
      container.style.left = "-9999px";
      container.style.width = "1000px"; // Fixed ample width
      document.body.appendChild(container);

      // Process each card
      for (let i = 0; i < completedPhotocards.length; i++) {
        const item = completedPhotocards[i];
        
        // 1. Render card into the hidden container
        const cardWrapper = document.createElement("div");
        cardWrapper.style.display = "inline-block";
        container.appendChild(cardWrapper);
        
        const root = createRoot(cardWrapper);
        
        // Wrap in a promise to wait for render
        await new Promise<void>((resolve) => {
           // Render the appropriate component based on theme
           if (theme === "vertical") {
             root.render(
               <VerticalUrlCard 
                 data={item.data}
                 isGenerating={true}
                 background={background}
                 id={`temp-card-${i}`}
                 fullSize={true}
                 frameBorderColor={frameBorderColor}
                 frameBorderThickness={frameBorderThickness}
                 adBannerImage={adBannerImage}
                 adBannerZoom={adBannerZoom}
                 fontStyles={fontStyles}
                 visibilitySettings={visibilitySettings}
                 isLogoFavicon={isLogoFavicon}
                 isDragMode={false}
                 elementLayout={verticalElementLayout}
               />
             );
           } else if (theme === "modern") {
             root.render(
               <ModernUrlCard 
                 data={item.data}
                 isGenerating={true}
                 background={background}
                 id={`temp-card-${i}`}
                 fullSize={true}
                 frameBorderColor={frameBorderColor}
                 frameBorderThickness={frameBorderThickness}
                 adBannerImage={adBannerImage}
                 adBannerZoom={adBannerZoom}
                 fontStyles={fontStyles}
                 visibilitySettings={visibilitySettings}
                 isLogoFavicon={isLogoFavicon}
                 isDragMode={false}
                 elementLayout={elementLayout}
               />
             );
           } else if (theme === "minimal") {
             root.render(
               <MinimalUrlCard 
                 data={item.data}
                 isGenerating={true}
                 background={background}
                 id={`temp-card-${i}`}
                 fullSize={true}
                 frameBorderColor={frameBorderColor}
                 frameBorderThickness={frameBorderThickness}
                 adBannerImage={adBannerImage}
                 adBannerZoom={adBannerZoom}
                 fontStyles={fontStyles}
                 visibilitySettings={visibilitySettings}
               />
             );
           } else {
             root.render(
               <ClassicUrlCard 
                 data={item.data}
                 isGenerating={true}
                 background={background}
                 id={`temp-card-${i}`}
                 fullSize={true}
                 frameBorderColor={frameBorderColor}
                 frameBorderThickness={frameBorderThickness}
                 adBannerImage={adBannerImage}
                 adBannerZoom={adBannerZoom}
                 fontStyles={fontStyles}
                 visibilitySettings={visibilitySettings}
                 isLogoFavicon={isLogoFavicon}
                 isDragMode={false}
                 elementLayout={elementLayout}
               />
             );
           }
           
           // Give it a moment to mount
           setTimeout(resolve, 100);
        });

        const element = cardWrapper.firstElementChild as HTMLElement;
        if (!element) {
           root.unmount();
           continue;
        }

        // 2. Pre-fetch images to blobs (Reuse the robust logic)
        const images = Array.from(element.querySelectorAll("img"));
        const srcMap = new Map<string, string>();

        await Promise.all(
          images.map(async (img) => {
            const src = img.src;
            if (!src || src.startsWith("data:")) return;
            try {
              const fetchUrl = src + (src.includes("?") ? "&" : "?") + "t=" + Date.now();
              const response = await fetch(fetchUrl, { cache: "no-store" });
              const blob = await response.blob();
              return new Promise<void>((resolveInner) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  if (typeof reader.result === "string") {
                     img.src = reader.result; // Swap directly in the off-screen DOM
                  }
                  resolveInner();
                };
                reader.readAsDataURL(blob);
              });
            } catch (err) {
               // Log but continue
              console.error("Failed to pre-fetch image for zip:", src, err);
            }
          })
        );
        
        // Small delay for layout update after src swap
        await new Promise(r => setTimeout(r, 100));

        // 3. Generate PNG
        const dataUrl = await toPng(element, {
           quality: 0.95,
            pixelRatio: 2,
            cacheBust: true,
            skipAutoScale: true
        });

        // 4. Add to ZIP
        const base64Data = dataUrl.replace(/^data:image\/(png|jpg);base64,/, "");
        const fileName = `photocard-${i + 1}-${Date.now()}.png`;
        folder?.file(fileName, base64Data, { base64: true });

        // Cleanup
        root.unmount();
        container.removeChild(cardWrapper);
      }

      // Cleanup container
      document.body.removeChild(container);

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `photocards-batch-${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);

    } catch (err) {
      console.error("Error creating ZIP:", err);
      alert("Failed to generate ZIP file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const completedPhotocards = multiplePhotocards.filter(
    (p) => p.status === "completed",
  );

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotocardIndex === null) return;

      if (e.key === "Escape") {
        setSelectedPhotocardIndex(null);
      } else if (e.key === "ArrowLeft") {
        setSelectedPhotocardIndex((prev) =>
          prev === null
            ? 0
            : prev > 0
              ? prev - 1
              : completedPhotocards.length - 1,
        );
      } else if (e.key === "ArrowRight") {
        setSelectedPhotocardIndex((prev) =>
          prev === null
            ? 0
            : prev < completedPhotocards.length - 1
              ? prev + 1
              : 0,
        );
      }
    };

    if (selectedPhotocardIndex !== null) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedPhotocardIndex, completedPhotocards.length]);

  return (
    <ProtectedRoute>
      <div className="h-screen bg-white flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Main Content Layout */}
        <div className="flex flex-1 flex-col md:flex-row md:min-h-0 relative max-w-[1920px] mx-auto w-full">
          {/* Left Sidebar */}
          <div
            className="w-full bg-[#f5f0e8] p-4 md:p-6 flex flex-col md:min-h-0"
            style={isDesktop ? { width: `${leftPanelWidth}%` } : undefined}
          >
            <UrlComponent
              mode={mode}
              setMode={setMode}
              onUrlSubmit={handleUrlSubmit}
              isLoading={isLoading}
              error={error}
              photocardData={photocardData}
              background={background}
              onBackgroundChange={setBackground}
              onMultipleUrlsSubmit={handleMultipleUrlsSubmit}
              multiplePhotocards={multiplePhotocards}
              frameBorderColor={frameBorderColor}
              frameBorderThickness={frameBorderThickness}
              onFrameChange={handleFrameChange}
              adBannerImage={adBannerImage}
              onAdBannerChange={setAdBannerImage}
              onDownloadAll={handleDownloadAll}
            />

            {/* Customization Panel */}
            <div className="mt-6 flex-1 md:min-h-0 md:overflow-hidden">
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
                theme={theme}
                onThemeChange={setTheme}
                fontStyles={fontStyles}
                onFontStylesChange={setFontStyles}
                visibilitySettings={visibilitySettings}
                onVisibilityChange={setVisibilitySettings}
              />
            </div>
          </div>

          {/* Resize Handle - Desktop only */}
          <div
            className="hidden md:block w-1 bg-[#d4c4b0] hover:bg-[#8b6834] cursor-col-resize active:bg-blue-600 transition-colors"
            onMouseDown={handleMouseDown}
            style={{
              cursor: isResizing ? "col-resize" : "col-resize",
              userSelect: "none",
            }}
          />

          {/* Right Preview Area - Responsive */}
          <DotBackground className="flex-1 bg-[#faf8f5] md:overflow-y-auto md:min-h-0 relative">
            {/* Editing Toolbar - Show only when card is generated or in preview */}
            {(photocardData || mode === "single") && (
              <EditingToolbar
                currentLogo={currentLogo || mockData.logo}
                currentImage={currentImage || mockData.image}
                currentTitle={currentTitle || mockData.title}
                isDragMode={isDragMode}
                onLogoChange={handleLogoChange}
                onImageChange={handleImageChange}
                onTitleChange={handleTitleChange}
                onDragModeToggle={() => setIsDragMode(!isDragMode)}
              />
            )}
            <div className="flex items-start justify-center md:justify-start md:pl-12 p-4 md:pr-8 md:py-8 w-full h-full">
              {/* Photocard Preview(s) */}
              {mode === "single" ? (
                <>
                  {/* Desktop: Show full preview */}
                  <div className="hidden md:block w-full flex justify-center">
                    <div className="flex flex-col items-center">
                      <div className="flex-shrink-0 mt-12">
                        {renderCard(
                          photocardData || mockData,
                          "photocard-desktop",
                        )}
                      </div>

                      {/* Download controls - only show when there's real data */}
                      {photocardData && (
                        <div className="mt-6">
                          <DownloadControls
                            isVisible={true}
                            targetId="photocard-desktop"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile: Show thumbnail with locked aspect ratio */}
                  <div className="md:hidden w-full flex justify-center py-4">
                    <div className="w-80 max-w-sm mx-auto">
                      <div
                        className="cursor-pointer group"
                        onClick={() => {
                          // Add to completedPhotocards for modal viewing
                          const tempPhotocard = {
                            id: "single-preview",
                            data: photocardData || mockData,
                            status: "completed" as const,
                          };

                          // Update multiplePhotocards to include the single card
                          setMultiplePhotocards([tempPhotocard]);
                          setSelectedPhotocardIndex(0);
                        }}
                      >
                        <div className="bg-white shadow-lg hover:shadow-xl border border-gray-100 overflow-hidden relative group-hover:border-blue-200 transition-all duration-300">
                          {/* Thumbnail header with gradient - locked height */}
                          <div
                            className={`h-3 relative ${
                              background?.type === "gradient"
                                ? "bg-gradient-to-r"
                                : "bg-blue-500"
                            }`}
                            style={
                              background?.type === "gradient"
                                ? {
                                    backgroundImage: `linear-gradient(90deg, ${background.gradientFrom || "#3b82f6"}, ${background.gradientTo || "#8b5cf6"})`,
                                  }
                                : {
                                    backgroundColor:
                                      background?.color || "#3b82f6",
                                  }
                            }
                          ></div>

                          {/* Thumbnail content - locked aspect ratio */}
                          <div className="p-4">
                            {/* Image with fixed aspect ratio */}
                            {(photocardData?.image || mockData.image) && (
                              <div className="bg-gray-100 aspect-video mb-3 overflow-hidden">
                                <img
                                  src={photocardData?.image || mockData.image}
                                  alt="Thumbnail"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            {/* Title with controlled line height */}
                            <h4 className="text-slate-800 font-dm-sans text-sm font-medium mb-2 line-clamp-2 leading-tight">
                              {photocardData?.title || mockData.title}
                            </h4>

                            {/* Site info */}
                            {(photocardData?.siteName || mockData.siteName) && (
                              <div className="flex items-center gap-2 mb-2">
                                {photocardData?.favicon || mockData.favicon ? (
                                  <img
                                    src={
                                      photocardData?.favicon || mockData.favicon
                                    }
                                    alt="Site favicon"
                                    className="w-4 h-4 flex-shrink-0"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="w-4 h-4 bg-gray-200 flex-shrink-0"></div>
                                )}
                                <p className="text-xs text-gray-600 truncate font-medium font-dm-sans">
                                  {photocardData?.siteName || mockData.siteName}
                                </p>
                              </div>
                            )}

                            {/* Date */}
                            <p className="text-xs font-noto-bengali text-gray-500 mb-3">
                              {photocardData?.date || mockData.date}
                            </p>

                            {/* Tap to view indicator */}
                            <div className="flex items-center justify-center py-2 bg-gray-50 group-hover:bg-blue-50 transition-colors duration-300">
                              <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 flex items-center gap-2 font-dm-sans">
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
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6 w-full">
                  {/* Thumbnail Gallery */}
                  {completedPhotocards.length > 0 ? (
                    <div className="pb-4">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg md:text-xl font-bold text-slate-800 font-dm-sans">
                          Generated Photocards
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 text-blue-700 px-3 py-1 text-xs md:text-sm font-medium font-dm-sans">
                            {completedPhotocards.length}{" "}
                            {completedPhotocards.length === 1
                              ? "card"
                              : "cards"}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`grid gap-6 mb-8 ${
                          completedPhotocards.length === 1
                            ? "grid-cols-1 max-w-md mx-auto"
                            : completedPhotocards.length === 2
                              ? "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto"
                              : completedPhotocards.length === 3
                                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                                : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                        }`}
                      >
                        {completedPhotocards.map((photocard, index) => (
                          <div
                            key={photocard.id}
                            className="group cursor-pointer relative"
                          >
                            {/* Remove button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMultiplePhotocards((prev) =>
                                  prev.filter((p) => p.id !== photocard.id),
                                );
                              }}
                              className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110"
                              title="Remove photocard"
                            >
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>

                            {/* Thumbnail container - clickable for preview */}
                            <div
                              className="bg-white shadow-lg hover:shadow-xl border border-gray-100 overflow-hidden relative group-hover:border-blue-200 transition-all duration-300"
                              onClick={() => setSelectedPhotocardIndex(index)}
                            >
                              {/* Enhanced header with gradient */}
                              <div
                                className={`h-3 relative ${
                                  background?.type === "gradient"
                                    ? `bg-gradient-to-r ${background.gradientTo || "from-red-500 to-pink-600"}`
                                    : `bg-[${background?.color || "#dc2626"}]`
                                }`}
                              >
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </div>

                              {/* Thumbnail image with better aspect ratio */}
                              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden relative">
                                {photocard.data.image ? (
                                  <img
                                    src={photocard.data.image}
                                    alt="Article thumbnail"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center">
                                    <div className="text-center">
                                      <div className="w-8 h-8 mx-auto mb-2 bg-gray-300 flex items-center justify-center">
                                        <svg
                                          className="w-4 h-4 text-gray-500"
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
                                      </div>
                                      <span className="text-gray-400 text-sm font-dm-sans">
                                        No image
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Content section */}
                              <div className="p-4">
                                <div className="mb-3">
                                  <h4
                                    className={`font-semibold font-noto-bengali text-gray-800 leading-snug mb-2 ${
                                      completedPhotocards.length <= 2
                                        ? "text-base"
                                        : "text-sm"
                                    } ${
                                      completedPhotocards.length <= 2
                                        ? "line-clamp-3"
                                        : "line-clamp-2"
                                    }`}
                                    style={{
                                      display: "-webkit-box",
                                      WebkitLineClamp:
                                        completedPhotocards.length <= 2 ? 3 : 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {photocard.data.title}
                                  </h4>

                                  {photocard.data.siteName && (
                                    <div className="flex items-center gap-2 mb-2">
                                      {photocard.data.favicon ? (
                                        <img
                                          src={photocard.data.favicon}
                                          alt="Site favicon"
                                          className="w-4 h-4 flex-shrink-0"
                                          onError={(e) => {
                                            e.currentTarget.style.display =
                                              "none";
                                            e.currentTarget.nextElementSibling?.classList.remove(
                                              "hidden",
                                            );
                                          }}
                                        />
                                      ) : null}
                                      <div
                                        className={`w-4 h-4 bg-gray-200 flex-shrink-0 ${photocard.data.favicon ? "hidden" : ""}`}
                                      ></div>
                                      <p className="text-sm text-gray-600 truncate font-medium font-dm-sans">
                                        {photocard.data.siteName}
                                      </p>
                                    </div>
                                  )}

                                  <p className="text-sm font-noto-bengali text-gray-500 flex items-center gap-1">
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
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    {photocard.data.date}
                                  </p>
                                </div>

                                {/* Click to view indicator */}
                                <div className="flex items-center justify-center py-2 bg-gray-50 group-hover:bg-blue-50 transition-colors duration-300">
                                  <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 flex items-center gap-2 font-dm-sans">
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
                                    Click to preview
                                  </span>
                                </div>
                              </div>

                              {/* Enhanced hover effect */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      {!isDesktop ? (
                        <div className="w-full max-w-sm">
                          <div
                            className="group cursor-pointer"
                            onClick={() => {
                              const modal =
                                document.getElementById("empty-state-modal");
                              if (modal) modal.classList.remove("hidden");
                            }}
                          >
                            <div className="bg-white shadow-lg hover:shadow-xl border border-gray-100 overflow-hidden relative group-hover:border-blue-200 transition-all duration-300">
                              {/* Thumbnail header with gradient */}
                              <div
                                className={`h-3 relative ${
                                  background?.type === "gradient"
                                    ? "bg-gradient-to-r"
                                    : "bg-blue-500"
                                }`}
                                style={
                                  background?.type === "gradient"
                                    ? {
                                        backgroundImage: `linear-gradient(90deg, ${background.gradientFrom || "#3b82f6"}, ${background.gradientTo || "#8b5cf6"})`,
                                      }
                                    : {
                                        backgroundColor:
                                          background?.color || "#3b82f6",
                                      }
                                }
                              ></div>

                              {/* Thumbnail content */}
                              <div className="p-4">
                                {/* Image */}
                                {mockData.image && (
                                  <div className="bg-gray-100 aspect-video mb-3 overflow-hidden">
                                    <img
                                      src={mockData.image}
                                      alt="Thumbnail"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}

                                {/* Title */}
                                <h4 className="text-slate-800 font-noto-bengali text-sm font-medium mb-2 line-clamp-2 leading-tight">
                                  {mockData.title}
                                </h4>

                                {/* Site info */}
                                {mockData.siteName && (
                                  <div className="flex items-center gap-2 mb-2">
                                    {mockData.favicon && (
                                      <img
                                        src={mockData.favicon}
                                        alt="Site favicon"
                                        className="w-4 h-4 flex-shrink-0"
                                        onError={(e) => {
                                          e.currentTarget.style.display =
                                            "none";
                                        }}
                                      />
                                    )}
                                    <p className="text-xs text-gray-600 truncate font-medium font-dm-sans">
                                      {mockData.siteName}
                                    </p>
                                  </div>
                                )}

                                {/* Date */}
                                <p className="text-xs font-noto-bengali text-gray-500 mb-3">
                                  {mockData.date}
                                </p>

                                {/* Tap to view */}
                                <div className="flex items-center justify-center py-2 bg-gray-50 group-hover:bg-blue-50 transition-colors duration-300">
                                  <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 flex items-center gap-2 font-dm-sans">
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

                          {/* Empty state mobile modal */}
                          <div
                            id="empty-state-modal"
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
                                    const modal =
                                      document.getElementById(
                                        "empty-state-modal",
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
                                  mockData,
                                  "photocard-empty-state-modal",
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-shrink-0 mt-12">
                          {renderCard(mockData, "photocard-empty-state")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </DotBackground>
        </div>

        {/* Full-size Photocard Modal */}
        {selectedPhotocardIndex !== null &&
          completedPhotocards[selectedPhotocardIndex] && (
            <div
              className="fixed inset-0 bg-black/80 z-50 overflow-y-auto"
              onClick={() => setSelectedPhotocardIndex(null)}
            >
              <div className="min-h-screen flex items-center justify-center p-4">
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedPhotocardIndex(null)}
                    className="absolute -top-2 -right-2 text-white hover:text-gray-300 transition-colors z-10 bg-black/40 rounded-full p-1 hover:bg-black/60"
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

                  {/* Navigation buttons */}
                  {completedPhotocards.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setSelectedPhotocardIndex((prev) =>
                            prev === null
                              ? 0
                              : prev > 0
                                ? prev - 1
                                : completedPhotocards.length - 1,
                          )
                        }
                        className="absolute -left-12 md:-left-16 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/40 hover:bg-black/60 p-3 rounded-full"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          setSelectedPhotocardIndex((prev) =>
                            prev === null
                              ? 0
                              : prev < completedPhotocards.length - 1
                                ? prev + 1
                                : 0,
                          )
                        }
                        className="absolute -right-12 md:-right-16 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/40 hover:bg-black/60 p-3 rounded-full"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Full-size photocard */}
                  <div className="mt-12">
                    {renderCard(
                      completedPhotocards[selectedPhotocardIndex].data,
                      "photocard",
                      true,
                      false,
                    )}
                  </div>

                  {/* Download button for individual card */}
                  <div className="mt-4 flex justify-center">
                    <DownloadControls isVisible={true} />
                  </div>

                  {/* Card counter */}
                  {completedPhotocards.length > 1 && (
                    <div className="text-center mt-2">
                      <span className="text-white text-sm font-dm-sans bg-black/20 px-3 py-1">
                        {selectedPhotocardIndex + 1} of{" "}
                        {completedPhotocards.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature={upgradeFeature}
          requiredPlan={requiredPlan}
        />
      </div>
    </ProtectedRoute>
  );
}
