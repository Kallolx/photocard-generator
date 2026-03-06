"use client";

import { DotBackground } from "@/components/DotBackground";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import ClassicCommentCard from "@/components/cards/comment-cards/ClassicCommentCard";
import GridCommentCard from "@/components/cards/comment-cards/GridCommentCard";
import SplitCommentCard from "@/components/cards/comment-cards/SplitCommentCard";
import CustomizationPanel from "@/components/CustomizationPanel";
import {
  PhotocardData,
  BackgroundOptions,
  CardFontStyles,
  CommentCardVisibilitySettings,
} from "@/types";
import { Upload, Edit, Sparkles, Loader2, RotateCcw, MoveHorizontal, MoveVertical, Maximize2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UpgradeModal from "@/components/UpgradeModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DownloadControls from "@/components/DownloadControls";

export default function CommentPage() {
  const [logo, setLogo] = useState<string>("");
  const [personImage, setPersonImage] = useState<string>("");
  const [commentText, setCommentText] = useState("");
  const [personName, setPersonName] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user } = useAuth();
  const [background, setBackground] = useState<BackgroundOptions>({
    type: "solid",
    color: "#dc2626",
  });
  const [leftPanelWidth, setLeftPanelWidth] = useState(33.333);
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [contentExpanded, setContentExpanded] = useState(true);
  const [imageAdjustExpanded, setImageAdjustExpanded] = useState(true);
  const [cardStyle, setCardStyle] = useState<"classic" | "grid" | "split">("classic");
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [imagePosition, setImagePosition] = useState<{ x: number; y: number; scale: number }>({ x: 0, y: 0, scale: 100 });
  const [visibilitySettings, setVisibilitySettings] = useState<CommentCardVisibilitySettings>({
    showLogo: true,
    showDate: false,
    showCommentText: true,
    showPersonName: true,
    showPersonRole: false,
    showImage: true,
    showSocialMedia: false,
    showAdBanner: false,
  });

  const [fontStyles, setFontStyles] = useState<CardFontStyles>({
    week: { fontFamily: "Noto Serif Bengali", fontSize: "14px", fontWeight: "500", color: "#FFFFFF", textAlign: "center", letterSpacing: "0px" },
    date: { fontFamily: "Noto Serif Bengali", fontSize: "14px", fontWeight: "500", color: "#FFFFFF", textAlign: "center", letterSpacing: "0px" },
    headline: { fontFamily: "Noto Serif Bengali", fontSize: "24px", fontWeight: "700", color: "#FFFFFF", textAlign: "center", letterSpacing: "0px", textShadow: { preset: "none", angle: 135 }, textStroke: { width: 0, color: "#000000" } },
    commentText: {
      fontFamily: "Noto Serif Bengali",
      fontSize: "30px",
      fontWeight: "600",
      color: "#1a1a1a",
      textAlign: "center",
      letterSpacing: "0px",
      textShadow: { preset: "none", angle: 135 },
      textStroke: { width: 0, color: "#000000" },
    },
    personName: {
      fontFamily: "Noto Serif Bengali",
      fontSize: "18px",
      fontWeight: "700",
      color: "#FFFFFF",
      textAlign: "left",
      letterSpacing: "0px",
      textShadow: { preset: "none", angle: 135 },
      textStroke: { width: 0, color: "#000000" },
    },
    personRole: { fontFamily: "Noto Serif Bengali", fontSize: "14px", fontWeight: "400", color: "#FFFFFF", textAlign: "left", letterSpacing: "0px", textShadow: { preset: "none", angle: 135 }, textStroke: { width: 0, color: "#000000" } },
    footer: { fontFamily: "Noto Serif Bengali", fontSize: "12px", fontWeight: "500", color: "#FFFFFF", textAlign: "center", letterSpacing: "0px" },
  });

  const cardData: PhotocardData = {
    title: "Quote Card",
    image: personImage,
    logo: logo,
    favicon: "",
    siteName: "Quote Card",
    url: "",
    weekName: "",
    date: "",
    commentText: commentText || "",
    personName: personName || "",
    personRole: "",
  };

  // Logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogo(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Person image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPersonImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // AI enhance person image
  const handleAiEnhance = async () => {
    if (!personImage) return;
    setIsAiEnhancing(true);
    setAiError("");
    try {
      const response = await fetch("/api/generate-person-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: personImage }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI generation failed");
      setPersonImage(data.imageBase64);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI generation failed");
    } finally {
      setIsAiEnhancing(false);
    }
  };

  // Panel resize handlers
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => setIsResizing(false), []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth >= 20 && newWidth <= 50) setLeftPanelWidth(newWidth);
      }
    },
    [isResizing],
  );

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => { setIsMounted(true); }, []);

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

  const renderCard = (cardId: string, isFullSize = false) =>
    cardStyle === "grid" ? (
      <GridCommentCard
        id={cardId}
        data={cardData}
        background={background}
        fullSize={isFullSize}
        fontStyles={fontStyles}
        visibilitySettings={visibilitySettings}
        imagePosition={imagePosition}
      />
    ) : cardStyle === "split" ? (
      <SplitCommentCard
        id={cardId}
        data={cardData}
        fullSize={isFullSize}
        fontStyles={fontStyles}
        visibilitySettings={visibilitySettings}
        imagePosition={imagePosition}
      />
    ) : (
      <ClassicCommentCard
        id={cardId}
        data={cardData}
        background={background}
        fullSize={isFullSize}
        fontStyles={fontStyles}
        visibilitySettings={visibilitySettings}
        imagePosition={imagePosition}
      />
    );

  return (
    <ProtectedRoute>
      <div className="h-screen bg-white flex flex-col">
        <Navbar />

        <div className="flex-1 flex flex-col md:flex-row md:min-h-0">
          {/* Free plan gate */}
          {user?.plan === "Free" && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white border-4 border-[#8b6834] p-8 max-w-md text-center shadow-2xl">
                <div className="mb-4 flex justify-center">
                  <div className="p-4 bg-[#f5f0e8] rounded-full">
                    <svg className="w-12 h-12 text-[#8b6834]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-lora font-bold text-[#2c2419] mb-3">Quote Cards Locked</h3>
                <p className="text-[#5d4e37] font-inter mb-6">
                  Quote cards are available for Basic and Premium users. Upgrade your plan to unlock this feature.
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

          {/* ── Left Sidebar ── */}
          <div
            className="w-full bg-[#f5f0e8] p-4 md:p-6 flex flex-col gap-3 md:min-h-0 md:overflow-y-auto"
            style={isDesktop ? { width: `${leftPanelWidth}%` } : undefined}
          >
            {/* Uploads */}
            <div className="bg-[#e8dcc8] p-3 border-2 border-[#d4c4b0]">
              <h3 className="text-sm font-lora font-bold text-[#2c2419] mb-2">Uploads</h3>
              <div className="grid grid-cols-2 gap-2">
                {/* Logo */}
                <label className="flex flex-col items-center justify-center min-h-[56px] border-2 border-dashed border-[#d4c4b0] bg-[#faf8f5] hover:bg-[#f5f0e8] transition-colors cursor-pointer p-2">
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  <div className="flex items-center gap-2">
                    {logo ? <Edit className="w-4 h-4 text-[#8b6834]" /> : <Upload className="w-4 h-4 text-[#5d4e37]" />}
                    <span className={`font-inter font-medium text-sm ${logo ? "text-[#2c2419]" : "text-[#5d4e37]"}`}>
                      {logo ? "Change Logo" : "Upload Logo"}
                    </span>
                  </div>
                </label>

                {/* Person image */}
                <div className="flex flex-col gap-1.5">
                <label className="flex flex-col items-center justify-center min-h-[56px] border-2 border-dashed border-[#d4c4b0] bg-[#faf8f5] hover:bg-[#f5f0e8] transition-colors cursor-pointer p-2">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <div className="flex items-center gap-2">
                    {personImage ? <Edit className="w-4 h-4 text-[#8b6834]" /> : <Upload className="w-4 h-4 text-[#5d4e37]" />}
                    <span className={`font-inter font-medium text-sm ${personImage ? "text-[#2c2419]" : "text-[#5d4e37]"}`}>
                      {personImage ? "Change Image" : "Upload Image"}
                    </span>
                  </div>
                </label>
                {personImage && (
                  <button
                    onClick={handleAiEnhance}
                    disabled={isAiEnhancing}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2 bg-[#8b6834] hover:bg-[#6b4e25] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-inter font-semibold transition-colors"
                  >
                    {isAiEnhancing ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enhancing...</>
                    ) : (
                      <><Sparkles className="w-3.5 h-3.5" /> AI Enhance</>  
                    )}
                  </button>
                )}
                {aiError && (
                  <p className="text-[10px] text-red-600 font-inter px-1">{aiError}</p>
                )}
                </div>
              </div>
              {/* Image position controls — only when image is uploaded */}
              {personImage && (
                <div className="mt-3 border-2 border-[#d4c4b0] bg-[#e8dcc8]">
                  {/* Header — matches Content section */}
                  <button
                    onClick={() => setImageAdjustExpanded(!imageAdjustExpanded)}
                    className="w-full flex items-center justify-between px-2 py-1 hover:bg-[#d4c4b0] transition-colors"
                  >
                    <h3 className="text-sm font-lora font-bold text-[#2c2419]">Image Adjust</h3>
                    <svg
                      className={`w-5 h-5 text-[#5d4e37] transition-transform ${imageAdjustExpanded ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {imageAdjustExpanded && (
                    <div className="px-2 pb-3 pt-1 space-y-4">
                      {/* Horizontal */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MoveHorizontal className="w-3.5 h-3.5 text-[#8b6834]" />
                            <span className="text-xs font-inter font-semibold text-[#5d4e37]">Horizontal</span>
                          </div>
                          <span className="text-xs font-inter font-bold text-[#2c2419] bg-[#faf8f5] border border-[#d4c4b0] px-2 py-0.5 min-w-[44px] text-center">
                            {imagePosition.x > 0 ? "+" : ""}{imagePosition.x}
                          </span>
                        </div>
                        <input
                          type="range" min="-150" max="150" value={imagePosition.x}
                          onChange={(e) => setImagePosition((p) => ({ ...p, x: Number(e.target.value) }))}
                          className="w-full h-1.5 appearance-none cursor-pointer"
                          style={{ background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${((imagePosition.x + 150) / 300) * 100}%, #d4c4b0 ${((imagePosition.x + 150) / 300) * 100}%, #d4c4b0 100%)` }}
                        />
                      </div>

                      {/* Vertical */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MoveVertical className="w-3.5 h-3.5 text-[#8b6834]" />
                            <span className="text-xs font-inter font-semibold text-[#5d4e37]">Vertical</span>
                          </div>
                          <span className="text-xs font-inter font-bold text-[#2c2419] bg-[#faf8f5] border border-[#d4c4b0] px-2 py-0.5 min-w-[44px] text-center">
                            {imagePosition.y > 0 ? "+" : ""}{imagePosition.y}
                          </span>
                        </div>
                        <input
                          type="range" min="-150" max="150" value={imagePosition.y}
                          onChange={(e) => setImagePosition((p) => ({ ...p, y: Number(e.target.value) }))}
                          className="w-full h-1.5 appearance-none cursor-pointer"
                          style={{ background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${((imagePosition.y + 150) / 300) * 100}%, #d4c4b0 ${((imagePosition.y + 150) / 300) * 100}%, #d4c4b0 100%)` }}
                        />
                      </div>

                      {/* Scale */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Maximize2 className="w-3.5 h-3.5 text-[#8b6834]" />
                            <span className="text-xs font-inter font-semibold text-[#5d4e37]">Scale</span>
                          </div>
                          <span className="text-xs font-inter font-bold text-[#2c2419] bg-[#faf8f5] border border-[#d4c4b0] px-2 py-0.5 min-w-[44px] text-center">
                            {imagePosition.scale}%
                          </span>
                        </div>
                        <input
                          type="range" min="30" max="200" value={imagePosition.scale}
                          onChange={(e) => setImagePosition((p) => ({ ...p, scale: Number(e.target.value) }))}
                          className="w-full h-1.5 appearance-none cursor-pointer"
                          style={{ background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${((imagePosition.scale - 30) / 170) * 100}%, #d4c4b0 ${((imagePosition.scale - 30) / 170) * 100}%, #d4c4b0 100%)` }}
                        />
                      </div>

                      {/* Reset */}
                      <button
                        onClick={() => setImagePosition({ x: 0, y: 0, scale: 100 })}
                        className="flex items-center gap-1.5 w-full justify-center py-1.5 border-2 border-dashed border-[#d4c4b0] text-xs font-inter font-semibold text-[#5d4e37] hover:border-[#8b6834] hover:text-[#8b6834] transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset Position
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="bg-[#e8dcc8] p-3 border-2 border-[#d4c4b0]">
              <button
                onClick={() => setContentExpanded(!contentExpanded)}
                className="w-full flex items-center justify-between mb-2 hover:bg-[#d4c4b0] px-2 py-1 transition-colors"
              >
                <h3 className="text-sm font-lora font-bold text-[#2c2419]">Content</h3>
                <svg
                  className={`w-5 h-5 text-[#5d4e37] transition-transform ${contentExpanded ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {contentExpanded && (
                <div className="space-y-3">
                  {/* Quote text */}
                  <div>
                    <label className="text-xs font-inter font-medium text-[#5d4e37] mb-1 block">Quote / Comment</label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="এখানে উক্তিটি লিখুন..."
                      className="w-full px-2 py-1.5 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] placeholder-[#5d4e37] focus:outline-none focus:ring-2 focus:ring-[#8b6834] min-h-[80px] resize-none font-noto-bengali text-sm"
                    />
                  </div>
                  {/* Person name */}
                  <div>
                    <label className="text-xs font-inter font-medium text-[#5d4e37] mb-1 block">Person Name</label>
                    <input
                      type="text"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      placeholder="নাম লিখুন..."
                      className="w-full px-2 py-1.5 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] placeholder-[#5d4e37] focus:outline-none focus:ring-2 focus:ring-[#8b6834] font-noto-bengali text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Customization Panel */}
            <div className="flex-shrink-0">
              <CustomizationPanel
                background={background}
                onBackgroundChange={setBackground}
                frameBorderColor="#FFFFFF"
                frameBorderThickness={0}
                onFrameChange={() => {}}
                adBannerImage={null}
                onAdBannerChange={() => {}}
                adBannerZoom={100}
                onAdBannerZoomChange={() => {}}
                adBannerPosition={{ x: 0, y: 0 }}
                onAdBannerPositionChange={() => {}}
                theme={cardStyle}
                onThemeChange={(t) => {
                  const next = t as "classic" | "grid" | "split";
                  setCardStyle(next);
                  if (next === "grid") {
                    setBackground((prev) =>
                      prev.color === "#dc2626" || !prev.color
                        ? { ...prev, type: "solid", color: "#ffffff" }
                        : prev
                    );
                    setFontStyles((prev) => ({
                      ...prev,
                      commentText: {
                        ...prev.commentText!,
                        color: prev.commentText?.color === "#1a1a1a" || prev.commentText?.color === "#ffffff"
                          ? "#111111"
                          : prev.commentText!.color,
                        textAlign: "left",
                      },
                      personName: {
                        ...prev.personName!,
                        color: prev.personName?.color === "#FFFFFF" ? "#444444" : prev.personName!.color,
                      },
                    }));
                  } else if (next === "split") {
                    setFontStyles((prev) => ({
                      ...prev,
                      commentText: {
                        ...prev.commentText!,
                        color: "#111111",
                        textAlign: "left",
                      },
                      personName: {
                        ...prev.personName!,
                        color: "#1a1a1a",
                      },
                    }));
                  } else {
                    setBackground((prev) =>
                      prev.color === "#ffffff"
                        ? { ...prev, type: "solid", color: "#dc2626" }
                        : prev
                    );
                    setFontStyles((prev) => ({
                      ...prev,
                      commentText: {
                        ...prev.commentText!,
                        color: prev.commentText?.color === "#111111" ? "#1a1a1a" : prev.commentText!.color,
                        textAlign: "center",
                      },
                      personName: {
                        ...prev.personName!,
                        color: prev.personName?.color === "#444444" ? "#FFFFFF" : prev.personName!.color,
                      },
                    }));
                  }
                }}
                fontStyles={fontStyles}
                onFontStylesChange={setFontStyles}
                visibilitySettings={visibilitySettings}
                onVisibilityChange={(s) => setVisibilitySettings(s as CommentCardVisibilitySettings)}
                cardType="comment"
                contentLanguage="bangla"
              />
            </div>
          </div>

          {/* Resizer */}
          {isDesktop && (
            <div
              onMouseDown={startResizing}
              className="w-1 bg-[#d4c4b0] cursor-col-resize hover:bg-[#8b6834] transition-colors hidden md:block"
            />
          )}

          {/* ── Right Preview ── */}
          <DotBackground className="flex-1 bg-[#faf8f5] md:overflow-y-auto md:min-h-0">
            <div className="flex items-start justify-center p-4 md:pl-12 md:pr-8 md:py-8 w-full h-full">
              <div className="w-full flex justify-center">
                <div className="flex flex-col items-center gap-6 mt-12">
                  {renderCard("photocard-comment", true)}
                  <DownloadControls
                    isVisible={!!(logo || personImage || commentText)}
                    targetId="photocard-comment"
                  />
                </div>
              </div>
            </div>
          </DotBackground>
        </div>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature="Quote Cards"
          requiredPlan="Basic"
        />
      </div>
    </ProtectedRoute>
  );
}
