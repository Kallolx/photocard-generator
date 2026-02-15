import { useState } from "react";
import { Download, Share2, ChevronDown, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UpgradeModal from "./UpgradeModal";

interface VideoDownloadControlsProps {
  isVisible: boolean;
  targetId?: string;
}

export default function VideoDownloadControls({
  isVisible,
  targetId = "videocard",
}: VideoDownloadControlsProps) {
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showFormats, setShowFormats] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");
  const [requiredPlan, setRequiredPlan] = useState<"Basic" | "Premium">(
    "Basic",
  );
  const [progress, setProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState("Preparing video...");

  const downloadFormats = [
    {
      name: "MP4 Video",
      extension: "mp4",
      quality: "high",
      tier: ["Free", "Basic", "Premium"],
    },
    {
      name: "WebM Video",
      extension: "webm",
      quality: "high",
      tier: ["Free", "Basic", "Premium"],
    },
    { 
      name: "PNG Thumbnail", 
      extension: "png", 
      quality: "high", 
      tier: ["Basic", "Premium"] 
    },
  ];

  const getFormatAccess = (tier: string[]) => {
    const userPlan = user?.plan || "Free";
    if (userPlan === "Premium") return true;
    if (userPlan === "Basic")
      return tier.includes("Basic") || tier.includes("Free");
    return tier.includes("Free");
  };

  const handleFormatClick = (format: (typeof downloadFormats)[0]) => {
    if (!getFormatAccess(format.tier)) {
      setUpgradeFeature(`${format.name} Download`);
      if (format.tier.includes("Basic")) {
        setRequiredPlan("Basic");
      } else {
        setRequiredPlan("Premium");
      }
      setShowUpgradeModal(true);
      setShowFormats(false);
      return;
    }
    
    // Close the dropdown menu
    setShowFormats(false);
    
    if (format.extension === "mp4" || format.extension === "webm") {
      handleVideoDownload(format.quality as "standard" | "high", format.extension as "mp4" | "webm");
    } else {
      handleImageDownload();
    }
  };

  const handleVideoDownload = async (quality: "standard" | "high" = "standard", format: "mp4" | "webm" = "mp4") => {
    const videocardElement = document.getElementById(targetId);
    if (!videocardElement) {
      alert("Video card not found!");
      return;
    }

    setIsDownloading(true);
    setProgress(0);

    try {
      // Get all video elements
      const mainVideo = videocardElement.querySelector("video[controls]") as HTMLVideoElement;
      const bgVideo = videocardElement.querySelector("video:not([controls])") as HTMLVideoElement;
      
      if (!mainVideo) {
        alert("Please upload a video first!");
        setIsDownloading(false);
        return;
      }

      // Get video card dimensions
      const cardWidth = 280;
      const cardHeight = 497;

      // Create high-resolution canvas for recording (4x for ultra quality)
      const canvas = document.createElement("canvas");
      const scale = quality === "high" ? 4 : 3; // 3x or 4x resolution
      canvas.width = cardWidth * scale;
      canvas.height = cardHeight * scale;
      const ctx = canvas.getContext("2d", { 
        alpha: false,
        desynchronized: true,
        willReadFrequently: false
      });

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Setup Web Audio API for audio capture
      const audioContext = new AudioContext();
      const audioDestination = audioContext.createMediaStreamDestination();
      
      // Connect main video audio
      try {
        const mainAudioSource = audioContext.createMediaElementSource(mainVideo);
        mainAudioSource.connect(audioDestination);
        mainAudioSource.connect(audioContext.destination); // Also play through speakers
      } catch (e) {
        // If source already created, try to get existing audio
        console.warn("Audio source already exists or cannot be created:", e);
      }

      // Get canvas video stream
      const canvasStream = canvas.captureStream(60); // 60 FPS for smoother video
      
      // Add audio tracks from audio context
      const audioTracks = audioDestination.stream.getAudioTracks();
      audioTracks.forEach((track: MediaStreamTrack) => {
        canvasStream.addTrack(track);
      });

      // Much higher bitrate for quality (20-40 Mbps)
      const bitrate = quality === "high" ? 40000000 : 20000000;

      // Check supported mime types and set up MediaRecorder
      let mimeType = "";
      let fileExtension = format;
      
      if (format === "mp4") {
        // Try different MP4 codecs
        if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1.42E01E,mp4a.40.2")) {
          mimeType = "video/mp4;codecs=avc1.42E01E,mp4a.40.2";
        } else if (MediaRecorder.isTypeSupported("video/mp4")) {
          mimeType = "video/mp4";
        } else {
          // Fallback to WebM if MP4 not supported
          mimeType = "video/webm;codecs=vp9,opus";
          fileExtension = "webm";
        }
      } else {
        // WebM format with opus audio codec
        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
          mimeType = "video/webm;codecs=vp9,opus";
        } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
          mimeType = "video/webm;codecs=vp8,opus";
        } else if (MediaRecorder.isTypeSupported("video/webm")) {
          mimeType = "video/webm";
        }
      }

      const mediaRecorder = new MediaRecorder(canvasStream, {
        mimeType: mimeType,
        videoBitsPerSecond: bitrate,
        audioBitsPerSecond: 320000, // 320kbps high quality audio
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      // When recording is done
      mediaRecorder.onstop = async () => {
        setProcessingMessage("Finalizing video...");
        setProgress(95);
        
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `video-card-${Date.now()}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Cleanup audio context
        audioContext.close();
        
        setProgress(100);
        setTimeout(() => {
          setIsDownloading(false);
          setProgress(0);
          setProcessingMessage("Preparing video...");
        }, 500);
      };

      // Function to wrap text
      const wrapText = (text: string, maxWidth: number, fontSize: number, fontFamily: string) => {
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const width = ctx.measureText(currentLine + " " + word).width;
          if (width < maxWidth) {
            currentLine += " " + word;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        lines.push(currentLine);
        return lines;
      };

      // Rotate processing messages
      const messages = ["Preparing video...", "Processing frames...", "Encoding video..."];
      let messageIndex = 0;
      const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setProcessingMessage(messages[messageIndex]);
      }, 3000); // Change message every 3 seconds

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms

      // Reset and play videos
      mainVideo.currentTime = 0;
      if (bgVideo) bgVideo.currentTime = 0;

      // Store original loop state and disable it for recording
      const originalLoop = mainVideo.loop;
      const originalMuted = mainVideo.muted;
      mainVideo.loop = false;
      mainVideo.muted = false;
      if (bgVideo) bgVideo.muted = true;

      await mainVideo.play();
      if (bgVideo) await bgVideo.play();

      // Get all overlay elements from the video card container
      const topTextEl = videocardElement.querySelector("p:first-of-type") as HTMLElement;
      const bottomTextEl = videocardElement.querySelector("p:last-of-type") as HTMLElement;
      const logoElement = videocardElement.querySelector("img[alt='Logo']") as HTMLImageElement;
      const faviconElement = videocardElement.querySelector("img[alt='Favicon']") as HTMLImageElement;

      // Track if we've finished recording
      let isRecordingComplete = false;

      // Stop recording when video ends
      mainVideo.onended = () => {
        if (!isRecordingComplete) {
          isRecordingComplete = true;
          clearInterval(messageInterval);
          setProcessingMessage("Finishing up...");
          setProgress(90);
          mediaRecorder.stop();
          // Restore original states
          mainVideo.loop = originalLoop;
          mainVideo.muted = originalMuted;
          mainVideo.onended = null;
        }
      };

      // Recording loop
      const drawFrame = () => {
        // Clear canvas
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw background video or solid color
        if (bgVideo && bgVideo.readyState >= 2) {
          ctx.save();
          ctx.filter = videocardElement.getAttribute("data-blur") === "true" ? "blur(80px)" : "none";
          ctx.drawImage(bgVideo, 0, 0, canvas.width, canvas.height);
          ctx.restore();
        } else {
          // Draw solid background color
          const bgColor = videocardElement.getAttribute("data-bg-color") || "#000000";
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Get main video container dimensions and position
        const videoContainer = videocardElement.querySelector(".relative.w-full") as HTMLElement;
        
        // Calculate exact video dimensions as displayed
        let videoDisplayWidth = 0;
        let videoDisplayHeight = 0;
        let videoDisplayX = 0;
        let videoDisplayY = 0;

        if (mainVideo.readyState >= 2 && videoContainer) {
          const cardRect = videocardElement.getBoundingClientRect();
          
          // Get actual displayed video dimensions
          const videoRect = mainVideo.getBoundingClientRect();
          
          // Convert to canvas coordinates with scaling
          videoDisplayWidth = (videoRect.width / cardWidth) * canvas.width;
          videoDisplayHeight = (videoRect.height / cardHeight) * canvas.height;
          videoDisplayX = ((videoRect.left - cardRect.left) / cardWidth) * canvas.width;
          videoDisplayY = ((videoRect.top - cardRect.top) / cardHeight) * canvas.height;

          // Draw video frame border if needed
          const showVideoFrame = videocardElement.getAttribute("data-show-video-frame") === "true";
          if (showVideoFrame) {
            const frameThickness = parseInt(videocardElement.getAttribute("data-video-frame-thickness") || "8") * scale;
            const frameColor = videocardElement.getAttribute("data-video-frame-color") || "#FFFFFF";
            ctx.strokeStyle = frameColor;
            ctx.lineWidth = frameThickness;
            ctx.strokeRect(
              videoDisplayX - frameThickness / 2,
              videoDisplayY - frameThickness / 2,
              videoDisplayWidth + frameThickness,
              videoDisplayHeight + frameThickness
            );
          }

          // Draw main video
          ctx.drawImage(mainVideo, videoDisplayX, videoDisplayY, videoDisplayWidth, videoDisplayHeight);
        }

        // Draw top text with wrapping (centered)
        if (topTextEl && topTextEl.textContent) {
          const text = topTextEl.textContent;
          const rect = topTextEl.getBoundingClientRect();
          const cardRect = videocardElement.getBoundingClientRect();
          
          const y = ((rect.top - cardRect.top) / cardHeight) * canvas.height;
          const fontSize = parseInt(window.getComputedStyle(topTextEl).fontSize) * scale;
          const color = window.getComputedStyle(topTextEl).color;
          const fontFamily = window.getComputedStyle(topTextEl).fontFamily;
          const maxWidth = canvas.width * 0.9; // 90% of canvas width

          // Wrap text
          const lines = wrapText(text, maxWidth, fontSize, fontFamily);

          ctx.font = `bold ${fontSize}px ${fontFamily}`;
          ctx.fillStyle = color;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          
          // Add text shadow for better visibility
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
          ctx.shadowBlur = 30;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 6;
          
          // Draw each line
          lines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, y + (index * fontSize * 1.2));
          });
          ctx.shadowColor = "transparent";
        }

        // Draw bottom text with wrapping (centered with gap from video)
        if (bottomTextEl && bottomTextEl.textContent && bottomTextEl !== topTextEl) {
          const text = bottomTextEl.textContent;
          const rect = bottomTextEl.getBoundingClientRect();
          const cardRect = videocardElement.getBoundingClientRect();
          
          // Add gap from video (20px scaled)
          const gapFromVideo = 20 * scale;
          let y = ((rect.top - cardRect.top) / cardHeight) * canvas.height;
          
          // If text is below video, add extra gap
          if (videoDisplayY && y > videoDisplayY + videoDisplayHeight) {
            y += gapFromVideo;
          }
          
          const fontSize = parseInt(window.getComputedStyle(bottomTextEl).fontSize) * scale;
          const color = window.getComputedStyle(bottomTextEl).color;
          const fontFamily = window.getComputedStyle(bottomTextEl).fontFamily;
          const maxWidth = canvas.width * 0.9; // 90% of canvas width

          // Wrap text
          const lines = wrapText(text, maxWidth, fontSize, fontFamily);

          ctx.font = `bold ${fontSize}px ${fontFamily}`;
          ctx.fillStyle = color;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          
          // Add text shadow for better visibility
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
          ctx.shadowBlur = 30;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 6;
          
          // Draw each line
          lines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, y + (index * fontSize * 1.2));
          });
          ctx.shadowColor = "transparent";
        }

        // Draw favicon with background
        if (faviconElement && faviconElement.complete) {
          const faviconRect = faviconElement.getBoundingClientRect();
          const cardRect = videocardElement.getBoundingClientRect();
          
          // Get the parent container for the circular background
          const faviconContainer = faviconElement.closest("div");
          if (faviconContainer) {
            const containerRect = faviconContainer.getBoundingClientRect();
            
            const centerX = ((containerRect.left + containerRect.width / 2 - cardRect.left) / cardWidth) * canvas.width;
            const centerY = ((containerRect.top + containerRect.height / 2 - cardRect.top) / cardHeight) * canvas.height;
            const radius = ((containerRect.width / 2) / cardWidth) * canvas.width;

            // Draw circular background
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.lineWidth = 3 * scale;
            ctx.stroke();
            ctx.restore();

            // Draw favicon
            const faviconX = ((faviconRect.left - cardRect.left) / cardWidth) * canvas.width;
            const faviconY = ((faviconRect.top - cardRect.top) / cardHeight) * canvas.height;
            const faviconW = (faviconRect.width / cardWidth) * canvas.width;
            const faviconH = (faviconRect.height / cardHeight) * canvas.height;

            ctx.drawImage(faviconElement, faviconX, faviconY, faviconW, faviconH);
          }
        }

        // Draw logo with white background
        if (logoElement && logoElement.complete) {
          const logoRect = logoElement.getBoundingClientRect();
          const cardRect = videocardElement.getBoundingClientRect();
          
          // Get the parent container for the white background
          const logoContainer = logoElement.closest("div");
          if (logoContainer) {
            const containerRect = logoContainer.getBoundingClientRect();
            
            const bgX = ((containerRect.left - cardRect.left) / cardWidth) * canvas.width;
            const bgY = ((containerRect.top - cardRect.top) / cardHeight) * canvas.height;
            const bgW = (containerRect.width / cardWidth) * canvas.width;
            const bgH = (containerRect.height / cardHeight) * canvas.height;
            const borderRadius = 20 * scale; // rounded-l-lg scaled

            // Draw white rounded rectangle background
            ctx.save();
            ctx.fillStyle = "#FFFFFF";
            ctx.beginPath();
            ctx.moveTo(bgX + borderRadius, bgY);
            ctx.lineTo(bgX + bgW, bgY);
            ctx.lineTo(bgX + bgW, bgY + bgH);
            ctx.lineTo(bgX + borderRadius, bgY + bgH);
            ctx.arcTo(bgX, bgY + bgH, bgX, bgY + bgH - borderRadius, borderRadius);
            ctx.lineTo(bgX, bgY + borderRadius);
            ctx.arcTo(bgX, bgY, bgX + borderRadius, bgY, borderRadius);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }

          // Draw logo on top of background
          const logoX = ((logoRect.left - cardRect.left) / cardWidth) * canvas.width;
          const logoY = ((logoRect.top - cardRect.top) / cardHeight) * canvas.height;
          const logoW = (logoRect.width / cardWidth) * canvas.width;
          const logoH = (logoRect.height / cardHeight) * canvas.height;

          ctx.drawImage(logoElement, logoX, logoY, logoW, logoH);
        }

        // Draw card frame border if needed
        const showFrame = videocardElement.getAttribute("data-show-frame") === "true";
        if (showFrame) {
          const frameThickness = parseInt(videocardElement.getAttribute("data-frame-thickness") || "8") * scale;
          const frameColor = videocardElement.getAttribute("data-frame-color") || "#FFFFFF";
          ctx.strokeStyle = frameColor;
          ctx.lineWidth = frameThickness;
          ctx.strokeRect(frameThickness / 2, frameThickness / 2, canvas.width - frameThickness, canvas.height - frameThickness);
        }

        // Update progress smoothly (0-85% during recording)
        const currentProgress = (mainVideo.currentTime / mainVideo.duration) * 85;
        setProgress(Math.min(Math.round(currentProgress), 85));

        // Continue recording until video ends or recording is complete
        if (!isRecordingComplete && !mainVideo.paused && !mainVideo.ended) {
          requestAnimationFrame(drawFrame);
        }
      };

      // Start drawing frames
      drawFrame();

    } catch (error) {
      console.error("Error downloading video:", error);
      alert("Failed to download video. Please try again.");
      setIsDownloading(false);
      setProgress(0);
      setProcessingMessage("Preparing video...");
      
      // Restore video state in case of error
      const mainVideo = document.querySelector("video[controls]") as HTMLVideoElement;
      if (mainVideo) {
        mainVideo.loop = true;
        mainVideo.onended = null;
      }
    }
  };

  const handleImageDownload = async () => {
    const videocardElement = document.getElementById(targetId);
    if (!videocardElement) return;

    setIsDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(videocardElement, {
        quality: 1,
        pixelRatio: 3,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `video-card-thumbnail-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Failed to download image.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownload = () => {
    handleVideoDownload("high", "mp4");
  };

  const handleShare = async () => {
    try {
      const { toPng } = await import("html-to-image");
      const videocardElement = document.getElementById(targetId);
      if (!videocardElement) return;

      const dataUrl = await toPng(videocardElement, {
        quality: 0.95,
        pixelRatio: 2,
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();

      if (
        navigator.share &&
        navigator.canShare({
          files: [new File([blob], "video-card.png", { type: "image/png" })],
        })
      ) {
        await navigator.share({
          files: [new File([blob], "video-card.png", { type: "image/png" })],
          title: "Generated Video Card",
          text: "Check out this video card I generated!",
        });
      } else {
        handleImageDownload();
      }
    } catch (error) {
      console.error("Error sharing video card:", error);
      alert("Failed to share video card. Downloading instead.");
      handleImageDownload();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      {isDownloading && progress > 0 && (
        <div className="bg-[#faf8f5] border-2 border-[#8b6834] p-3 rounded">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-[#2c2419]">{processingMessage}</span>
            <span className="text-xs font-bold text-[#8b6834]">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-[#d4c4b0] rounded-full h-2">
            <div
              className="bg-[#8b6834] h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2">
        {/* Download Button with Format Options */}
        <div className="relative">
          <div className="flex">
            <button
              onClick={() => handleDownload()}
              disabled={isDownloading}
              className="flex-1 bg-[#2c2419] text-[#faf8f5] py-2 px-3 text-sm font-medium font-inter hover:bg-[#8b6834] focus:ring-2 focus:ring-[#8b6834] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "Processing..." : "Download"}
            </button>
            <button
              onClick={() => setShowFormats(!showFormats)}
              disabled={isDownloading}
              className="bg-[#2c2419] text-[#faf8f5] py-2 px-2 hover:bg-[#8b6834] focus:ring-2 focus:ring-[#8b6834] focus:ring-offset-2 transition-colors border-l-2 border-[#5d4e37] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Format Dropdown */}
          {showFormats && (
            <div className="absolute bottom-full mb-1 left-0 min-w-full w-max bg-[#faf8f5] border-2 border-[#d4c4b0] shadow-lg z-50 overflow-hidden">
              {downloadFormats.map((format, index) => {
                const isLocked = !getFormatAccess(format.tier);
                return (
                  <button
                    key={index}
                    onClick={() => handleFormatClick(format)}
                    disabled={isDownloading}
                    className={`w-full px-4 py-2.5 text-sm font-medium font-inter flex items-center justify-between gap-4 transition-colors whitespace-nowrap
                      ${
                        isLocked
                          ? "text-gray-400 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                          : "text-[#2c2419] hover:bg-[#e8dcc8]"
                      }
                    `}
                  >
                    <span>{format.name}</span>
                    {isLocked && (
                      <Lock className="w-3.5 h-3.5 text-[#8b6834]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={handleShare}
          disabled={isDownloading}
          className="bg-[#8b6834] text-[#faf8f5] py-2 px-3 text-sm font-medium font-inter hover:bg-[#6b4e25] focus:ring-2 focus:ring-[#8b6834] focus:ring-offset-2 transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
        requiredPlan={requiredPlan}
      />
    </div>
  );
}