"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, X, Trash2, Image as ImageIcon, Briefcase } from "lucide-react";

interface SavedAsset {
  id: string;
  dataUrl: string;
  type: "logo" | "favicon";
  createdAt: number;
}

interface AssetManagerModalProps {
  onClose: () => void;
  onApply: (logoUrl?: string, faviconUrl?: string) => void;
  currentLogoUrl?: string | null;
  requiresFavicon?: boolean;
}

const STORAGE_KEY = "photocard_saved_assets";

export default function AssetManagerModal({
  onClose,
  onApply,
  currentLogoUrl,
  requiresFavicon = false,
}: AssetManagerModalProps) {
  const [activeTab, setActiveTab] = useState<"logo" | "favicon">("logo");
  const [assets, setAssets] = useState<SavedAsset[]>([]);
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);
  const [selectedFaviconId, setSelectedFaviconId] = useState<string | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load assets from localStorage on mount
  useEffect(() => {
    try {
      const storedAssets = localStorage.getItem(STORAGE_KEY);
      if (storedAssets) {
        setAssets(JSON.parse(storedAssets));
      }
    } catch (e) {
      console.error("Failed to load saved assets", e);
    }
  }, []);

  // Auto-select logic
  useEffect(() => {
    // If we have currentLogoUrl but no selectedLogoId, find the ID
    if (currentLogoUrl && !selectedLogoId && assets.length > 0) {
      const existing = assets.find(
        (a) => a.dataUrl === currentLogoUrl && a.type === "logo",
      );
      if (existing) setSelectedLogoId(existing.id);
    }

    const logos = assets
      .filter((a) => a.type === "logo")
      .sort((a, b) => b.createdAt - a.createdAt);
    const favicons = assets
      .filter((a) => a.type === "favicon")
      .sort((a, b) => b.createdAt - a.createdAt);

    const hasValidLogo = logos.some((l) => l.id === selectedLogoId);
    const hasValidFavicon = favicons.some((f) => f.id === selectedFaviconId);

    if (logos.length > 0 && !hasValidLogo) {
      setSelectedLogoId(logos[0].id);
    }
    if (favicons.length > 0 && !hasValidFavicon) {
      setSelectedFaviconId(favicons[0].id);
    }
  }, [assets, selectedLogoId, selectedFaviconId, currentLogoUrl]);

  // Save assets to localStorage whenever they change
  const saveAssets = (newAssets: SavedAsset[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAssets));
      setAssets(newAssets);
    } catch (e) {
      console.error("Failed to save assets to localStorage", e);
      alert(
        "Storage full! Please delete some old assets before uploading new ones.",
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(
        "File is too large. Please upload an image under 2MB to save space.",
      );
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newAsset: SavedAsset = {
        id: Math.random().toString(36).substring(2, 11),
        dataUrl,
        type: activeTab,
        createdAt: Date.now(),
      };
      saveAssets([...assets, newAsset]);

      if (activeTab === "logo") setSelectedLogoId(newAsset.id);
      else setSelectedFaviconId(newAsset.id);

      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedAssets = assets.filter((a) => a.id !== id);

    // Clear selection if deleted
    if (id === selectedLogoId) setSelectedLogoId(null);
    if (id === selectedFaviconId) setSelectedFaviconId(null);

    saveAssets(updatedAssets);
  };

  const filteredAssets = assets
    .filter((a) => a.type === activeTab)
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#faf8f5] w-full max-w-2xl border-2 border-[#d4c4b0] shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b-2 border-[#d4c4b0] flex justify-between items-center bg-[#f5f0e8]">
          <h2 className="text-xl font-bold font-inter text-[#2c2419] flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Brand Kit
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#e8dcc8] text-[#5d4e37] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-[#d4c4b0]">
          <button
            onClick={() => setActiveTab("logo")}
            className={`flex-1 py-3 text-sm font-bold font-inter transition-colors border-r-2 border-[#d4c4b0] ${
              activeTab === "logo"
                ? "bg-[#faf8f5] text-[#2c2419] border-b-2 border-b-transparent"
                : "bg-[#e8dcc8] text-[#5d4e37] hover:bg-[#d4c4b0]"
            }`}
          >
            Logos
          </button>
          {requiresFavicon && (
            <button
              onClick={() => setActiveTab("favicon")}
              className={`flex-1 py-3 text-sm font-bold font-inter transition-colors ${
                activeTab === "favicon"
                  ? "bg-[#faf8f5] text-[#2c2419] border-b-2 border-b-transparent"
                  : "bg-[#e8dcc8] text-[#5d4e37] hover:bg-[#d4c4b0]"
              }`}
            >
              Favicons
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#faf8f5]">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#5d4e37] font-inter">
              {activeTab === "logo" ? "Saved Logos" : "Saved Favicons"}
            </h3>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-[#e8dcc8] hover:bg-[#d4c4b0] text-[#2c2419] text-sm font-bold font-inter transition-colors border-2 border-[#d4c4b0]"
            >
              <Upload className="w-4 h-4" />
              Upload New
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredAssets.length === 0 ? (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-[#d4c4b0] bg-[#f5f0e8]">
                <ImageIcon className="w-12 h-12 mx-auto text-[#d4c4b0] mb-3" />
                <p className="text-[#5d4e37] font-medium font-inter">
                  No {activeTab}s saved yet
                </p>
                <p className="text-sm text-[#8b6834] mt-1 font-inter">
                  Upload one to keep it here forever
                </p>
              </div>
            ) : (
              filteredAssets.map((asset) => {
                const isSelected =
                  activeTab === "logo"
                    ? selectedLogoId === asset.id
                    : selectedFaviconId === asset.id;

                return (
                  <div
                    key={asset.id}
                    onClick={() => {
                      if (activeTab === "logo") setSelectedLogoId(asset.id);
                      else setSelectedFaviconId(asset.id);
                    }}
                    className={`relative aspect-square border-2 cursor-pointer group flex items-center justify-center p-4 transition-all bg-white ${
                      isSelected
                        ? "border-[#2c2419] ring-2 ring-[#2c2419] ring-offset-2"
                        : "border-[#d4c4b0] hover:border-[#8b6834]"
                    }`}
                  >
                    <img
                      src={asset.dataUrl}
                      alt="Saved asset"
                      className="max-w-full max-h-full object-contain"
                    />

                    {/* Delete button (shows on hover) */}
                    <button
                      onClick={(e) => handleDelete(asset.id, e)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {isSelected && (
                      <div className="absolute inset-x-0 bottom-0 bg-[#2c2419] text-[#faf8f5] text-[10px] font-bold text-center py-1 uppercase tracking-wider font-inter">
                        Selected
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t-2 border-[#d4c4b0] bg-[#f5f0e8] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-transparent text-[#2c2419] font-bold font-inter hover:bg-[#e8dcc8] border-2 border-transparent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const finalLogo = assets.find(
                (a) => a.id === selectedLogoId,
              )?.dataUrl;
              const finalFavicon = assets.find(
                (a) => a.id === selectedFaviconId,
              )?.dataUrl;
              onApply(finalLogo, finalFavicon);
              onClose();
            }}
            className="px-6 py-2 bg-[#2c2419] text-white font-bold font-inter hover:bg-[#4a3e2e] transition-colors border-2 border-[#2c2419]"
          >
            Apply to Card
          </button>
        </div>
      </div>
    </div>
  );
}
