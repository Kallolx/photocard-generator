"use client";

import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Type, Move, Sparkles, Copy, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface EditingToolbarProps {
  onUpgradeClick?: () => void;
  currentLogo: string;
  currentImage: string;
  currentTitle: string;
  isDragMode?: boolean;
  onLogoChange: (logo: string, isFavicon: boolean) => void;
  onImageChange: (image: string) => void;
  onTitleChange: (title: string) => void;
  onDragModeToggle?: () => void;
  // Optional visibility props for each tool
  showImageTool?: boolean;
  showLogoTool?: boolean;
  showTitleTool?: boolean;
  showDragTool?: boolean;
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
  onLogoChange,
  onImageChange,
  onTitleChange,
  onDragModeToggle,
  // Default to showing all tools for backward compatibility
  showImageTool = true,
  showLogoTool = true,
  showTitleTool = true,
  showDragTool = true,
}: EditingToolbarProps) {
  const { user } = useAuth();
  const [showTitleEditor, setShowTitleEditor] = useState(false);
  const [editedTitle, setEditedTitle] = useState(currentTitle);
  const [titleVariations, setTitleVariations] = useState<TitleVariation[]>([]);
  const [socialSummary, setSocialSummary] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const isFreeUser = user?.plan === "Free";
  const isPremiumUser = user?.plan === "Premium";

  // Simulate AI generation (will be replaced with actual API call)
  const generateVariations = async () => {
    setIsGenerating(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Placeholder AI-generated content
    setTitleVariations([
      { id: 1, text: `${currentTitle} - Enhanced Version` },
      { id: 2, text: `Breaking: ${currentTitle.substring(0, 50)}...` },
      { id: 3, text: `${currentTitle.split(' ').slice(0, 8).join(' ')}...` },
    ]);
    
    setSocialSummary(
      `Check out this amazing story: ${currentTitle.substring(0, 80)}... Perfect for sharing with your audience! 🎯`
    );
    
    setHashtags([
      "#news",
      "#trending",
      "#breakingnews",
      "#socialmedia",
      "#viral",
      "#mustread",
      "#headline",
      "#story",
      "#share",
      "#engage",
    ]);
    
    setIsGenerating(false);
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
              onClick={() => handleToolClick(() => imageInputRef.current?.click())}
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

        {/* Logo Upload */}
        {showLogoTool && (
          <>
            <button
              onClick={() => handleToolClick(() => logoInputRef.current?.click())}
              className="p-3 bg-[#e8dcc8] hover:bg-[#d4c4b0] border-2 border-[#d4c4b0] transition-colors group relative"
              title="Change Logo"
            >
              <Upload className="w-5 h-5 text-[#2c2419]" />
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#2c2419] text-[#faf8f5] px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Upload Logo
              </div>
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </>
        )}

        {/* Title Editor */}
        {showTitleTool && (
          <button
            onClick={() =>
              handleToolClick(() => {
                setEditedTitle(currentTitle);
                setShowTitleEditor(true);
                setTitleVariations([]);
                setSocialSummary("");
                setHashtags([]);
              })
            }
            className="p-3 bg-[#e8dcc8] hover:bg-[#d4c4b0] border-2 border-[#d4c4b0] transition-colors group relative"
            title="Edit Title"
          >
            <Type className="w-5 h-5 text-[#2c2419]" />
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
            <Move className={`w-5 h-5 ${isDragMode ? "text-white" : "text-[#2c2419]"}`} />
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#2c2419] text-[#faf8f5] px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {isDragMode ? "Drag Mode ON" : "Drag Mode OFF"}
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#8b6834]" />
                    <h4 className="text-base font-bold text-[#2c2419]">
                      AI-Powered Variations
                    </h4>
                    {!isPremiumUser && (
                      <span className="px-2 py-1 bg-[#8b6834] text-white text-xs font-bold rounded">
                        PREMIUM
                      </span>
                    )}
                  </div>
                  
                  {isPremiumUser ? (
                    <button
                      onClick={generateVariations}
                      disabled={isGenerating}
                      className="px-4 py-2 bg-[#8b6834] text-white text-sm font-bold hover:bg-[#2c2419] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-pulse" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={onUpgradeClick}
                      className="px-4 py-2 bg-[#d4c4b0] text-[#2c2419] text-sm font-bold hover:bg-[#8b6834] hover:text-white transition-colors flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Upgrade
                    </button>
                  )}
                </div>

                {!isPremiumUser ? (
                  <div className="bg-[#f5f0e8] border-2 border-[#d4c4b0] p-6 text-center">
                    <Lock className="w-12 h-12 text-[#8b6834] mx-auto mb-3" />
                    <p className="text-sm text-[#5d4e37] mb-2">
                      Unlock AI-powered title variations, social media summaries, and hashtag suggestions
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
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditedTitle(variation.text)}
                                  className="px-3 py-1 bg-[#e8dcc8] hover:bg-[#8b6834] hover:text-white text-xs font-bold transition-colors"
                                >
                                  Use
                                </button>
                                <button
                                  onClick={() => handleCopy(variation.text, `variation-${variation.id}`)}
                                  className="p-1 hover:bg-[#e8dcc8] transition-colors"
                                  title="Copy"
                                >
                                  <Copy className="w-4 h-4 text-[#8b6834]" />
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
                          <p className="text-sm text-[#2c2419]">{socialSummary}</p>
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
                            onClick={() => handleCopy(hashtags.join(" "), "hashtags")}
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
                                onClick={() => handleCopy(tag, `hashtag-${index}`)}
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
    </>
  );
}
