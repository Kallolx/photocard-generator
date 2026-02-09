"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface PersonOverlayProps {
  cardWidth: number;
  cardHeight: number;
  onImageChange?: (imageData: string | null, position: { x: number; y: number }, scale: number) => void;
  initialImage?: string | null;
  initialPosition?: { x: number; y: number };
  initialScale?: number;
  isEnabled?: boolean;
  controlsPosition?: "right" | "bottom";
}

export default function PersonOverlay({
  cardWidth,
  cardHeight,
  onImageChange,
  initialImage = null,
  initialPosition = { x: 0, y: 0 },
  initialScale = 1,
  isEnabled = false,
  controlsPosition = "right",
}: PersonOverlayProps) {
  const [personImage, setPersonImage] = useState<string | null>(initialImage);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState(initialPosition);
  const [scale, setScale] = useState(initialScale);
  const [shadow, setShadow] = useState({ enabled: false, blur: 20, opacity: 0.5, offsetY: 10 });
  const [glow, setGlow] = useState({ enabled: false, blur: 10, color: "#ffffff", opacity: 0.6 });
  const [outline, setOutline] = useState({ enabled: false, width: 2, color: "#ffffff", opacity: 0.8 });
  const [controlsPos, setControlsPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressRef = useRef(0);

  // Update controls position
  useEffect(() => {
    if (!personImage || isProcessing) return;
    
    const updatePosition = () => {
      if (containerRef.current) {
        // Get the card container (parent of person overlay)
        const cardElement = containerRef.current.closest('[id]'); // Find element with id (the card)
        if (cardElement) {
          const rect = cardElement.getBoundingClientRect();
          setControlsPos({
            top: rect.top, // Align with card top
            left: rect.right + 8, // Position to the right of card
          });
        }
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [personImage, isProcessing]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target?.result as string;
      await removeBackground(imageData);
    };
    reader.readAsDataURL(file);
  };

  // Remove background using @imgly/background-removal
  const removeBackground = async (imageData: string) => {
    setIsProcessing(true);
    setError(null);
    lastProgressRef.current = 0;
    setProcessingStatus("Initializing...");

    // Fallback progress simulation for smooth UI updates
    let simulatedProgress = 0;
    progressIntervalRef.current = setInterval(() => {
      simulatedProgress += 1;
      // Cap at 85% to allow real progress to show final stages
      if (simulatedProgress <= 85) {
        if (simulatedProgress > lastProgressRef.current) {
          lastProgressRef.current = simulatedProgress;
          
          if (simulatedProgress < 20) {
            setProcessingStatus("Initializing...");
          } else if (simulatedProgress < 50) {
            setProcessingStatus("Loading resources...");
          } else if (simulatedProgress < 70) {
            setProcessingStatus("Processing image...");
          } else {
            setProcessingStatus(`Processing: ${simulatedProgress}%`);
          }
        }
      }
    }, 150);

    try {
      const { removeBackground: removeBg } = await import("@imgly/background-removal");
      
      const response = await fetch(imageData);
      const blob = await response.blob();

      const removedBgBlob = await removeBg(blob, {
        model: "isnet",
        output: {
          format: "image/png",
          quality: 0.9,
        },
        progress: (key: string, current: number, total: number) => {
          const progress = Math.round((current / total) * 100);
          // Only update if real progress is higher
          if (progress > lastProgressRef.current) {
            lastProgressRef.current = progress;
            setProcessingStatus(`Processing: ${progress}%`);
          }
        },
      });

      // Clear the interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setProcessingStatus("Finalizing...");
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPersonImage(result);
        if (onImageChange) {
          onImageChange(result, position, scale);
        }
        setIsProcessing(false);
        setProcessingStatus("");
      };
      reader.readAsDataURL(removedBgBlob);
    } catch (error) {
      // Clear the interval on error
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      console.error("Background removal failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Failed: ${errorMessage}`);
      
      setTimeout(() => {
        setPersonImage(imageData);
        if (onImageChange) {
          onImageChange(imageData, position, scale);
        }
        setIsProcessing(false);
        setProcessingStatus("");
      }, 2000);
    }
  };

  // Remove person image
  const handleRemoveImage = () => {
    setPersonImage(null);
    setPosition(initialPosition);
    setScale(1);
    // Clear the file input so same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageChange) {
      onImageChange(null, initialPosition, 1);
    }
  };

  // Handle scale adjustment
  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
    if (onImageChange && personImage) {
      onImageChange(personImage, position, newScale);
    }
  };

  if (!isEnabled) return null;

  return (
    <>
      {/* Image and upload button - stays inside card */}
      <div ref={containerRef} className="person-overlay-content pointer-events-auto">
        {/* Upload button */}
        {!personImage && !isProcessing && (
          <div className="absolute top-2 right-2 z-50 pointer-events-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#8b6834] hover:bg-[#6b4e25] text-white p-2 rounded-lg shadow-lg transition-all flex items-center gap-2"
              title="Upload Person Image"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">Add Person</span>
            </button>
          </div>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg pointer-events-auto">
            <div className="bg-white p-6 rounded-lg shadow-2xl flex flex-col items-center gap-3 max-w-md">
              <Loader2 className="w-8 h-8 text-[#8b6834] animate-spin" />
              <p className="text-sm font-medium text-[#2c2419]">Removing background...</p>
              <p className="text-xs text-[#5d4e37] text-center">{processingStatus || "Processing..."}</p>
              {error && (
                <p className="text-xs text-red-600 text-center mt-2">{error}</p>
              )}
            </div>
          </div>
        )}

        {/* Person image with drag */}
        {personImage && !isProcessing && (
          <div
            className="absolute z-40 cursor-move select-none pointer-events-auto"
            style={{
              left: "50%",
              bottom: "0",
              transform: `translate(-50%, 0) translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: "center bottom",
              maxHeight: `${cardHeight}px`,
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startY = e.clientY;
              const startPosX = position.x;
              const startPosY = position.y;

              const handleMouseMove = (moveEvent: MouseEvent) => {
                const deltaX = moveEvent.clientX - startX;
                const deltaY = moveEvent.clientY - startY;
                
                // NO BOUNDARIES - free movement anywhere in card
                const newPos = {
                  x: startPosX + deltaX,
                  y: startPosY + deltaY,
                };
                setPosition(newPos);
                if (onImageChange && personImage) {
                  onImageChange(personImage, newPos, scale);
                }
              };

            const handleMouseUp = () => {
              document.removeEventListener("mousemove", handleMouseMove);
              document.removeEventListener("mouseup", handleMouseUp);
            };

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
          }}
          onWheel={(e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const newScale = Math.max(0.1, Math.min(2.0, scale + delta));
            setScale(newScale);
            if (onImageChange && personImage) {
              onImageChange(personImage, position, newScale);
            }
          }}
        >
          <img
            src={personImage}
            alt="Person cutout"
            className="max-w-none select-none pointer-events-none"
            style={{
              maxHeight: `${cardHeight * 0.9}px`,
              width: "auto",
              height: "auto",
              filter: [
                shadow.enabled ? `drop-shadow(0px ${shadow.offsetY}px ${shadow.blur}px rgba(0, 0, 0, ${shadow.opacity}))` : '',
                glow.enabled ? `drop-shadow(0 0 ${glow.blur}px ${glow.color}${Math.round(glow.opacity * 255).toString(16).padStart(2, '0')})` : '',
                outline.enabled ? (() => {
                  const color = `${outline.color}${Math.round(outline.opacity * 255).toString(16).padStart(2, '0')}`;
                  const w = outline.width;
                  // Create outline using multiple drop-shadows in 8 directions
                  return [
                    `drop-shadow(${w}px 0 0 ${color})`,
                    `drop-shadow(-${w}px 0 0 ${color})`,
                    `drop-shadow(0 ${w}px 0 ${color})`,
                    `drop-shadow(0 -${w}px 0 ${color})`,
                    `drop-shadow(${w * 0.707}px ${w * 0.707}px 0 ${color})`,
                    `drop-shadow(-${w * 0.707}px ${w * 0.707}px 0 ${color})`,
                    `drop-shadow(${w * 0.707}px -${w * 0.707}px 0 ${color})`,
                    `drop-shadow(-${w * 0.707}px -${w * 0.707}px 0 ${color})`
                  ].join(' ');
                })() : ''
              ].filter(Boolean).join(' ') || 'none',
            }}
            draggable={false}
          />
        </div>
      )}
      </div>

      {/* Control panel - All in ONE box */}
      {personImage && !isProcessing && (
        <div 
          className="fixed z-[9999] pointer-events-auto"
          style={{
            top: `${controlsPos.top}px`,
            left: `${controlsPos.left}px`,
          }}
        >
          <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-md p-2 shadow-md w-32">
            {/* Buttons - Side by side */}
            <div className="flex gap-1 mb-2">
              <button
                onClick={handleRemoveImage}
                className="bg-red-500 hover:bg-red-600 text-white p-1 rounded text-[10px] flex-1 flex items-center justify-center"
                title="Remove"
              >
                <X className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded text-[10px] flex-1 flex items-center justify-center"
                title="Upload New"
              >
                <Upload className="w-2.5 h-2.5" />
              </button>
            </div>
            
            {/* Divider */}
            <div className="border-t border-gray-200 mb-2"></div>

            {/* Size control */}
            <div className="mb-2">
              <div className="text-[10px] font-medium text-gray-700 mb-1">Size</div>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={scale}
                onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-[9px] text-gray-500 text-center mt-0.5">
                {Math.round(scale * 100)}%
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-2"></div>

            {/* Shadow control */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-gray-700">Shadow</span>
                <input
                  type="checkbox"
                  checked={shadow.enabled}
                  onChange={(e) => setShadow({ ...shadow, enabled: e.target.checked })}
                  className="w-3 h-3 rounded"
                />
              </div>
              {shadow.enabled && (
                <div className="space-y-1">
                  <div>
                    <div className="text-[9px] text-gray-500 mb-0.5">Blur</div>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="1"
                      value={shadow.blur}
                      onChange={(e) => setShadow({ ...shadow, blur: parseInt(e.target.value) })}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 mb-0.5">Opacity</div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={shadow.opacity}
                      onChange={(e) => setShadow({ ...shadow, opacity: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 mb-0.5">Offset</div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={shadow.offsetY}
                      onChange={(e) => setShadow({ ...shadow, offsetY: parseInt(e.target.value) })}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-2"></div>

            {/* Glow control */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-gray-700">Glow</span>
                <input
                  type="checkbox"
                  checked={glow.enabled}
                  onChange={(e) => setGlow({ ...glow, enabled: e.target.checked })}
                  className="w-3 h-3 rounded"
                />
              </div>
              {glow.enabled && (
                <div className="space-y-1">
                  <div>
                    <div className="text-[9px] text-gray-500 mb-0.5">Blur</div>
                    <input
                      type="range"
                      min="5"
                      max="20"
                      step="1"
                      value={glow.blur}
                      onChange={(e) => setGlow({ ...glow, blur: parseInt(e.target.value) })}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 mb-0.5">Color</div>
                    <input
                      type="color"
                      value={glow.color}
                      onChange={(e) => setGlow({ ...glow, color: e.target.value })}
                      className="w-full h-4 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 mb-0.5">Opacity</div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={glow.opacity}
                      onChange={(e) => setGlow({ ...glow, opacity: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-2"></div>

            {/* Outline control */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-gray-700">Outline</span>
                <input
                  type="checkbox"
                  checked={outline.enabled}
                  onChange={(e) => setOutline({ ...outline, enabled: e.target.checked })}
                  className="w-3 h-3 rounded"
                />
              </div>
              {outline.enabled && (
                <div className="space-y-1">
                  <div>
                    <div className="text-[9px] text-gray-500 mb-0.5">Width</div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={outline.width}
                      onChange={(e) => setOutline({ ...outline, width: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 mb-0.5">Color</div>
                    <input
                      type="color"
                      value={outline.color}
                      onChange={(e) => setOutline({ ...outline, color: e.target.value })}
                      className="w-full h-4 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 mb-0.5">Opacity</div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={outline.opacity}
                      onChange={(e) => setOutline({ ...outline, opacity: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-2"></div>
            <button
              onClick={() => {
                const newPos = { x: 0, y: 0 };
                setPosition(newPos);
                if (onImageChange && personImage) {
                  onImageChange(personImage, newPos, scale);
                }
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-[10px] transition-all w-full"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </>
  );
}
