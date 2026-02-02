"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { DotBackground } from "@/components/DotBackground";
import { Upload, X, Download, Plus, Trash2, Grid3x3, LayoutGrid } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

type Template = {
  id: string;
  name: string;
  icon: React.ReactNode;
  gridStyle: string;
  slots: number;
};

export default function CollagePage() {
  const [images, setImages] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templates: Template[] = [
    {
      id: "classic-2",
      name: "Classic 2x1",
      icon: <Grid3x3 className="w-5 h-5" />,
      gridStyle: "grid-cols-2 grid-rows-1",
      slots: 2,
    },
    {
      id: "classic-3",
      name: "Classic 3x1",
      icon: <Grid3x3 className="w-5 h-5" />,
      gridStyle: "grid-cols-3 grid-rows-1",
      slots: 3,
    },
    {
      id: "grid-4",
      name: "Grid 2x2",
      icon: <LayoutGrid className="w-5 h-5" />,
      gridStyle: "grid-cols-2 grid-rows-2",
      slots: 4,
    },
    {
      id: "grid-6",
      name: "Grid 3x2",
      icon: <LayoutGrid className="w-5 h-5" />,
      gridStyle: "grid-cols-3 grid-rows-2",
      slots: 6,
    },
    {
      id: "modern-3",
      name: "Modern Mix",
      icon: <LayoutGrid className="w-5 h-5" />,
      gridStyle: "grid-cols-2 grid-rows-2",
      slots: 3,
    },
    {
      id: "pinterest",
      name: "Pinterest Style",
      icon: <LayoutGrid className="w-5 h-5" />,
      gridStyle: "grid-cols-3",
      slots: 6,
    },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onload = (e) => {
              setImages((prev) => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setImages([]);
    setSelectedTemplate(null);
  };

  const handleDownload = () => {
    // Placeholder for download functionality
    console.log("Download collage");
  };

  const renderCollagePreview = () => {
    if (!selectedTemplate || images.length === 0) return null;

    const template = selectedTemplate;
    const availableImages = images.slice(0, template.slots);

    if (template.id === "modern-3") {
      // Modern Mix: 1 large + 2 small
      return (
        <div className="grid grid-cols-2 gap-2 aspect-[3/2]">
          <div className="row-span-2 border-2 border-[#d4c4b0] bg-[#f5f0e8] overflow-hidden">
            {availableImages[0] && (
              <img
                src={availableImages[0]}
                alt="Collage 1"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="border-2 border-[#d4c4b0] bg-[#f5f0e8] overflow-hidden">
            {availableImages[1] && (
              <img
                src={availableImages[1]}
                alt="Collage 2"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="border-2 border-[#d4c4b0] bg-[#f5f0e8] overflow-hidden">
            {availableImages[2] && (
              <img
                src={availableImages[2]}
                alt="Collage 3"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      );
    } else if (template.id === "pinterest") {
      // Pinterest Style: Masonry-like layout
      return (
        <div className="grid grid-cols-3 gap-2 auto-rows-[150px]">
          {availableImages.map((img, idx) => (
            <div
              key={idx}
              className={`border-2 border-[#d4c4b0] bg-[#f5f0e8] overflow-hidden ${
                idx === 0 || idx === 4 ? "row-span-2" : "row-span-1"
              }`}
            >
              <img
                src={img}
                alt={`Collage ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      );
    } else {
      // Regular grid
      return (
        <div className={`grid ${template.gridStyle} gap-2 aspect-video`}>
          {Array.from({ length: template.slots }).map((_, idx) => (
            <div
              key={idx}
              className="border-2 border-[#d4c4b0] bg-[#f5f0e8] overflow-hidden flex items-center justify-center"
            >
              {availableImages[idx] ? (
                <img
                  src={availableImages[idx]}
                  alt={`Collage ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Plus className="w-8 h-8 text-[#8b6834] opacity-30" />
              )}
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#faf8f5] font-inter">
        <Navbar />
        <DotBackground />

        <main className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-lora font-bold text-[#2c2419] mb-3">
              Collage Maker
            </h1>
            <p className="text-[#5d4e37] text-lg">
              Create beautiful photo collages with multiple templates
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Templates & Images */}
            <div className="lg:col-span-1 space-y-6">
              {/* Templates */}
              <div className="bg-white border-2 border-[#d4c4b0] shadow-sm p-5">
                <h2 className="text-lg font-lora font-bold text-[#2c2419] mb-4">
                  Choose Template
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-4 border-2 transition-all ${
                        selectedTemplate?.id === template.id
                          ? "border-[#8b6834] bg-[#8b6834] text-[#faf8f5]"
                          : "border-[#d4c4b0] text-[#2c2419] hover:border-[#8b6834] hover:bg-[#f5f0e8]"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {template.icon}
                        <span className="text-xs font-bold">{template.name}</span>
                        <span className="text-xs opacity-70">{template.slots} photos</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Images */}
              <div className="bg-white border-2 border-[#d4c4b0] shadow-sm p-5">
                <h2 className="text-lg font-lora font-bold text-[#2c2419] mb-4">
                  Your Images ({images.length})
                </h2>

                <div className="space-y-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-4 border-2 border-dashed border-[#d4c4b0] text-[#2c2419] font-bold hover:border-[#8b6834] hover:bg-[#f5f0e8] transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Images
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <button
                    onClick={handlePaste}
                    className="w-full py-3 px-4 border-2 border-[#d4c4b0] text-[#2c2419] font-bold hover:bg-[#f5f0e8] transition-colors"
                  >
                    Paste from Clipboard
                  </button>

                  {images.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="w-full py-2 px-4 border-2 border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors text-sm"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Image Thumbnails */}
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Upload ${idx + 1}`}
                          className="w-full aspect-square object-cover border-2 border-[#d4c4b0] rounded"
                        />
                        <button
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white border-2 border-[#d4c4b0] shadow-sm p-6 md:p-8 min-h-[600px]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-lora font-bold text-[#2c2419]">
                    Preview
                  </h2>
                  {selectedTemplate && images.length > 0 && (
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 py-2 px-4 bg-[#8b6834] text-[#faf8f5] font-bold hover:bg-[#6d4f28] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  )}
                </div>

                {!selectedTemplate ? (
                  <div className="flex flex-col items-center justify-center h-[500px] text-center">
                    <LayoutGrid className="w-16 h-16 text-[#8b6834] opacity-30 mb-4" />
                    <p className="text-lg font-bold text-[#2c2419] mb-2">
                      Select a Template
                    </p>
                    <p className="text-sm text-[#5d4e37]">
                      Choose a collage template from the left to get started
                    </p>
                  </div>
                ) : images.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[500px] text-center">
                    <Upload className="w-16 h-16 text-[#8b6834] opacity-30 mb-4" />
                    <p className="text-lg font-bold text-[#2c2419] mb-2">
                      Upload Images
                    </p>
                    <p className="text-sm text-[#5d4e37]">
                      Add images to create your collage
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {renderCollagePreview()}
                    <div className="bg-[#f5f0e8] border border-[#d4c4b0] p-4 rounded">
                      <p className="text-sm text-[#5d4e37]">
                        <span className="font-bold text-[#2c2419]">
                          {selectedTemplate.name}
                        </span>{" "}
                        - Using {Math.min(images.length, selectedTemplate.slots)} of{" "}
                        {selectedTemplate.slots} available slots
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
