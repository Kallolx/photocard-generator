"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  X,
  Plus,
  Type,
  Move,
  Lock,
  Sparkles,
  Copy,
  ChevronRight,
  User,
  Briefcase, // Added Briefcase icon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AssetManagerModal from "@/components/AssetManagerModal"; // Added AssetManagerModal import
import { generateAIVariations } from "@/lib/ai-service";
import toast from "react-hot-toast";

interface EditingToolbarProps {
  onUpgradeClick?: () => void;
  currentLogo: string;
  currentImage: string;
  currentTitle: string;
  isDragMode?: boolean;
  isPersonOverlayMode?: boolean;
  onLogoChange: (logo: string, isFavicon: boolean) => void;
  onAssetsApply?: (logoUrl?: string, faviconUrl?: string) => void; // Added onAssetsApply
  onImageChange: (image: string) => void;
  onTitleChange: (title: string) => void;
  onDragModeToggle?: () => void;
  onPersonOverlayToggle?: () => void;
  // Optional visibility props for each tool
  showImageTool?: boolean;
  showLogoTool?: boolean;
  showTitleTool?: boolean;
  showDragTool?: boolean;
  showPersonOverlayTool?: boolean;
}

interface TitleVariation {
  id: number;
  text: string;
}

export default function EditingToolbar({
  onUpgradeClick,
  currentLogo,
  currentImage,
  currentTitle,
  isDragMode = false,
  isPersonOverlayMode = false,
  onLogoChange,
  onAssetsApply, // Added onAssetsApply
  onImageChange,
  onTitleChange,
  onDragModeToggle,
  onPersonOverlayToggle,
  // Default to showing all tools for backward compatibility
  showImageTool = true,
  showLogoTool = true,
  showTitleTool = true,
  showDragTool = true,
  showPersonOverlayTool = false, // Only show for comment cards
}: EditingToolbarProps) {
  const { user } = useAuth();
  const [showTitleEditor, setShowTitleEditor] = useState(false);
  const [editedTitle, setEditedTitle] = useState(currentTitle);
  const [titleVariations, setTitleVariations] = useState<TitleVariation[]>([]);
  const [socialSummary, setSocialSummary] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [showAssetManager, setShowAssetManager] = useState(false);
  const [hashtagLang, setHashtagLang] = useState<"en" | "bn">("bn");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  // Reset AI results when switching to a completely new headline (not from variations)
  useEffect(() => {
    const isFromVariations = titleVariations.some(
      (v) => v.text === currentTitle,
    );
    if (!isFromVariations && currentTitle !== editedTitle) {
      setTitleVariations([]);
      setSocialSummary("");
      setHashtags([]);
    }
  }, [currentTitle]);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const isFreeUser = user?.plan === "Free";
  const isPremiumUser = user?.plan === "Premium";

  // Real AI generation using Gemini
  const generateVariations = async () => {
    if (!currentTitle.trim()) {
      toast.error("Please enter a headline first");
      return;
    }

    setIsGenerating(true);
    try {
      const data = await generateAIVariations(
        currentTitle,
        hashtagLang === "bn" ? "Bengali" : "English",
      );

      setTitleVariations(
        data.headlines.map((text, index) => ({
          id: index + 1,
          text,
        })),
      );

      setSocialSummary(data.summary);
      setHashtags(data.hashtags);
      toast.success("AI variations generated!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to generate AI content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(type);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleToolClick = (callback: () => void) => {
    if (isFreeUser) {
      onUpgradeClick?.();
      return;
    }
    callback();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoChange(reader.result as string, false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTitleSave = () => {
    onTitleChange(editedTitle);
    setShowTitleEditor(false);
  };

  return (
    <>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#f5f0e8] border-2 border-[#d4c4b0] p-3 flex flex-col gap-3 z-40 shadow-lg">
        {/* Free User Lock Overlay */}
        {isFreeUser && (
          <div className="absolute inset-0 bg-[#2c2419]/80 backdrop-blur-sm flex items-center justify-center z-50 rounded">
            <div className="text-center p-4">
              <Lock className="w-8 h-8 text-[#faf8f5] mx-auto mb-2" />
              <p className="text-xs text-[#faf8f5] font-bold">Upgrade</p>
            </div>
          </div>
        )}

        {/* Main Image Upload */}
        {showImageTool && (
          <>
            <button
              onClick={() =>
                handleToolClick(() => imageInputRef.current?.click())
              }
              className="p-3 bg-[#e8dcc8] hover:bg-[#d4c4b0] border-2 border-[#d4c4b0] transition-colors group relative"
              title="Change Main Image"
            >
              <ImageIcon className="w-5 h-5 text-[#2c2419]" />
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#2c2419] text-[#faf8f5] px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Change Image
              </div>
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </>
        )}

        {/* Brand Kit (Logo / Favicon Upload) */}
        {showLogoTool && (
          <>
            <button
              onClick={() => handleToolClick(() => setShowAssetManager(true))}
              className="p-3 bg-[#e8dcc8] hover:bg-[#d4c4b0] border-2 border-[#d4c4b0] transition-colors group relative"
              title="Brand Kit"
            >
              <Upload className="w-5 h-5 text-[#2c2419]" />
              {/* Brand Kit New Badge */}
              <span className="absolute -top-1 -right-1 px-1 bg-gradient-to-br from-[#10b981] to-[#059669] text-white text-[7px] font-black rounded flex items-center justify-center shadow-md z-10 border border-white/40 group-hover:scale-110 transition-transform">
                NEW
              </span>
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#2c2419] text-[#faf8f5] px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Brand Kit
              </div>
            </button>
          </>
        )}

        {/* Title Editor */}
        {showTitleTool && (
          <button
            onClick={() =>
              handleToolClick(() => {
                setEditedTitle(currentTitle);
                setShowTitleEditor(true);
              })
            }
            className="p-3 bg-[#e8dcc8] hover:bg-[#d4c4b0] border-2 border-[#d4c4b0] transition-colors group relative"
            title="Edit Title"
          >
            <Type className="w-5 h-5 text-[#2c2419]" />
            {/* AI Modern Badge */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-md z-10 border border-white/40 group-hover:scale-110 transition-transform">
              AI
            </span>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#2c2419] text-[#faf8f5] px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Edit Title
            </div>
          </button>
        )}

        {/* Drag Mode Toggle */}
        {showDragTool && onDragModeToggle && (
          <button
            onClick={onDragModeToggle}
            className={`p-3 border-2 border-[#d4c4b0] transition-colors group relative ${
              isDragMode
                ? "bg-[#8b6834] hover:bg-[#2c2419]"
                : "bg-[#e8dcc8] hover:bg-[#d4c4b0]"
            }`}
            title="Drag Mode"
          >
            <Move
              className={`w-5 h-5 ${isDragMode ? "text-white" : "text-[#2c2419]"}`}
            />
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#2c2419] text-[#faf8f5] px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {isDragMode ? "Drag Mode ON" : "Drag Mode OFF"}
            </div>
          </button>
        )}

        {/* Person Overlay Toggle */}
        {showPersonOverlayTool && onPersonOverlayToggle && (
          <button
            onClick={onPersonOverlayToggle}
            className={`p-3 border-2 border-[#d4c4b0] transition-colors group relative ${
              isPersonOverlayMode
                ? "bg-[#8b6834] hover:bg-[#2c2419]"
                : "bg-[#e8dcc8] hover:bg-[#d4c4b0]"
            }`}
            title="Person Overlay"
          >
            <User
              className={`w-5 h-5 ${isPersonOverlayMode ? "text-white" : "text-[#2c2419]"}`}
            />
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#2c2419] text-[#faf8f5] px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {isPersonOverlayMode ? "Person Overlay ON" : "Add Person"}
            </div>
          </button>
        )}
      </div>

      {/* Title Editor Modal */}
      {showTitleEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#faf8f5] border-2 border-[#d4c4b0] max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-[#f5f0e8] border-b-2 border-[#d4c4b0] p-6">
              <h3 className="text-xl font-lora font-bold text-[#2c2419]">
                Edit Headline
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Title Editor */}
              <div>
                <label className="block text-sm font-bold text-[#2c2419] mb-2">
                  Current Headline
                </label>
                <textarea
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full h-24 p-3 border-2 border-[#d4c4b0] bg-white font-noto-bengali text-[#2c2419] resize-none focus:outline-none focus:border-[#8b6834] transition-colors"
                  placeholder="Enter your headline..."
                />
              </div>

              {/* AI Variations Section - Premium Only */}
              <div className="pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#8b6834]" />
                    <h4 className="text-base font-bold text-[#2c2419]">
                      AI Variations
                    </h4>
                    {!isPremiumUser && (
                      <span className="px-2 py-1 bg-[#8b6834] text-white text-[10px] font-bold rounded">
                        PREMIUM
                      </span>
                    )}
                  </div>

                  {isPremiumUser && (
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Language Selection */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-[#5d4e37] uppercase tracking-wider font-inter">
                          Hashtags:
                        </span>
                        <div className="flex bg-[#e8dcc8] p-0.5 border-2 border-[#d4c4b0] rounded-none overflow-hidden shadow-sm">
                          <button
                            onClick={() => setHashtagLang("bn")}
                            className={`px-3 py-1.5 text-[10px] font-black transition-all rounded-none ${
                              hashtagLang === "bn"
                                ? "bg-[#2c2419] text-white shadow-sm"
                                : "text-[#5d4e37] hover:bg-[#d4c4b0] hover:text-[#2c2419]"
                            }`}
                          >
                            BN
                          </button>
                          <button
                            onClick={() => setHashtagLang("en")}
                            className={`px-3 py-1.5 text-[10px] font-black transition-all rounded-none ${
                              hashtagLang === "en"
                                ? "bg-[#2c2419] text-white shadow-sm"
                                : "text-[#5d4e37] hover:bg-[#d4c4b0] hover:text-[#2c2419]"
                            }`}
                          >
                            EN
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={generateVariations}
                        disabled={
                          isGenerating ||
                          currentTitle.includes(
                            "এই একটি নমুনা শিরোনাম যা দেখায় ফটোকার্ড কেমন দেখাবে",
                          ) ||
                          !currentTitle.trim()
                        }
                        className={`flex-1 sm:flex-none px-6 py-2 bg-[#8b6834] text-white text-[11px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 rounded-none border-2 border-[#8b6834] shadow-md relative overflow-hidden ${
                          isGenerating
                            ? "cursor-not-allowed opacity-100"
                            : currentTitle.includes(
                                  "এই একটি নমুনা শিরোনাম যা দেখায় ফটোকার্ড কেমন দেখাবে",
                                ) || !currentTitle.trim()
                              ? "opacity-30 cursor-not-allowed"
                              : "hover:bg-[#2c2419] hover:border-[#2c2419] active:scale-95 group shadow-lg"
                        }`}
                      >
                        {isGenerating ? (
                          <>
                            <div className="relative w-4 h-4 mr-1">
                              <div className="absolute inset-0 border-2 border-white/20 rounded-full" />
                              <div className="absolute inset-0 border-2 border-t-white rounded-full animate-spin shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                            </div>
                            <span
                              className={
                                elapsedSeconds > 3
                                  ? "text-[12px] font-black transition-transform text-yellow-400"
                                  : ""
                              }
                            >
                              {elapsedSeconds > 3
                                ? `WAITING (${Math.max(0, 30 - (elapsedSeconds - 3))}S)...`
                                : "GENERATING..."}
                            </span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-yellow-400 group-hover:animate-pulse" />
                            <span>GENERATE</span>
                          </>
                        )}
                        {/* Subtle AI Glow Layer */}
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/20 to-violet-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                      </button>
                    </div>
                  )}
                </div>
                {!isPremiumUser ? (
                  <div className="bg-[#f5f0e8] border-2 border-[#d4c4b0] p-6 text-center">
                    <Lock className="w-12 h-12 text-[#8b6834] mx-auto mb-3" />
                    <p className="text-sm text-[#5d4e37] mb-2">
                      Unlock AI-powered title variations, social media
                      summaries, and hashtag suggestions
                    </p>
                    <p className="text-xs text-[#8b6834] font-bold">
                      Upgrade to Premium to access this feature
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Title Variations */}
                    {titleVariations.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs text-[#5d4e37] font-medium">
                          Alternative Headlines
                        </p>
                        {titleVariations.map((variation) => (
                          <div
                            key={variation.id}
                            className="bg-white border-2 border-[#d4c4b0] p-3 hover:border-[#8b6834] transition-colors group"
                          >
                            <div className="flex items-start gap-3">
                              <p className="flex-1 text-sm text-[#2c2419] font-noto-bengali">
                                {variation.text}
                              </p>
                              <div className="flex items-center min-w-[85px]">
                                <button
                                  onClick={() => setEditedTitle(variation.text)}
                                  className={`w-full px-3 py-2 text-[10px] font-black transition-all border-2 rounded-none ${
                                    editedTitle === variation.text
                                      ? "bg-[#2c2419] text-white border-[#2c2419] shadow-inner"
                                      : "bg-[#e8dcc8] text-[#2c2419] border-[#d4c4b0] hover:bg-[#8b6834] hover:text-white hover:border-[#8b6834]"
                                  }`}
                                >
                                  {editedTitle === variation.text
                                    ? "SELECTED"
                                    : "USE"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Social Summary */}
                    {socialSummary && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-[#5d4e37] font-medium">
                            Social Media Ready Summary
                          </p>
                          <button
                            onClick={() => handleCopy(socialSummary, "summary")}
                            className="flex items-center gap-1 text-xs text-[#8b6834] hover:text-[#2c2419] transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedItem === "summary" ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <div className="bg-white border-2 border-[#d4c4b0] p-3">
                          <p className="text-sm text-[#2c2419] font-noto-bengali leading-relaxed">
                            {socialSummary}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Hashtags */}
                    {hashtags.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-[#5d4e37] font-medium">
                            Relevant Hashtags
                          </p>
                          <button
                            onClick={() =>
                              handleCopy(hashtags.join(" "), "hashtags")
                            }
                            className="flex items-center gap-1 text-xs text-[#8b6834] hover:text-[#2c2419] transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedItem === "hashtags" ? "Copied!" : "Copy All"}
                          </button>
                        </div>
                        <div className="bg-white border-2 border-[#d4c4b0] p-3">
                          <div className="flex flex-wrap gap-2">
                            {hashtags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-[#f5f0e8] text-[#8b6834] text-xs font-bold border border-[#d4c4b0] hover:bg-[#8b6834] hover:text-white transition-colors cursor-pointer"
                                onClick={() =>
                                  handleCopy(tag, `hashtag-${index}`)
                                }
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-[#f5f0e8] border-t-2 border-[#d4c4b0] p-6">
              <div className="flex gap-3">
                <button
                  onClick={handleTitleSave}
                  className="flex-1 py-3 bg-[#8b6834] text-[#faf8f5] font-inter font-bold hover:bg-[#2c2419] transition-colors"
                >
                  Apply Changes
                </button>
                <button
                  onClick={() => setShowTitleEditor(false)}
                  className="flex-1 py-3 bg-[#d4c4b0] text-[#2c2419] font-inter font-bold hover:bg-[#e8dcc8] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Brand Kit Asset Manager Modal */}
      {showAssetManager && (
        <AssetManagerModal
          onClose={() => setShowAssetManager(false)}
          onApply={(logoUrl, faviconUrl) => {
            if (onAssetsApply) {
              onAssetsApply(logoUrl, faviconUrl);
            } else if (logoUrl) {
              // Backward compatibility
              onLogoChange(logoUrl, false);
            }
          }}
          currentLogoUrl={currentLogo}
          requiresFavicon={true}
        />
      )}
    </>
  );
}
