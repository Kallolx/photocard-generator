'use client';

import { useState } from 'react';
import { Download, Share2, ChevronDown } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';

interface DownloadControlsProps {
  isVisible: boolean;
  targetId?: string;
}

export default function DownloadControls({ isVisible, targetId = "photocard" }: DownloadControlsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showFormats, setShowFormats] = useState(false);

  const downloadFormats = [
    { name: 'PNG', extension: 'png', quality: 0.95 },
    { name: 'JPG', extension: 'jpg', quality: 0.9 },
    { name: 'PNG (High Quality)', extension: 'png', quality: 1.0 }
  ];

  const handleDownload = async (format = 'png', quality = 0.95) => {
    const photocardElement = document.getElementById(targetId);
    if (!photocardElement) return;

    setIsDownloading(true);
    try {
      // Wait for images to load
      const images = photocardElement.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true);
          });
        })
      );

      // Add a small delay to ensure images are rendered
      await new Promise(resolve => setTimeout(resolve, 300));

      let dataUrl;
      const options = {
        quality,
        pixelRatio: 2,
        backgroundColor: format === 'jpg' ? '#ffffff' : undefined,
      };

      if (format === 'jpg') {
        dataUrl = await toJpeg(photocardElement, options);
      } else {
        dataUrl = await toPng(photocardElement, options);
      }

      const link = document.createElement('a');
      link.download = `photocard-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();
      
      setShowFormats(false);
    } catch (error) {
      console.error('Error downloading image:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to download image. ';
      if (error instanceof Error) {
        if (error.message.includes('canvas')) {
          errorMessage += 'Canvas rendering failed. Try again.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const photocardElement = document.getElementById(targetId);
    if (!photocardElement) return;

    try {
      const dataUrl = await toPng(photocardElement, {
        quality: 0.95,
        pixelRatio: 2,
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      if (navigator.share && navigator.canShare({ files: [new File([blob], 'photocard.png', { type: 'image/png' })] })) {
        await navigator.share({
          files: [new File([blob], 'photocard.png', { type: 'image/png' })],
          title: 'Generated Photocard',
          text: 'Check out this photocard I generated!'
        });
      } else {
        // Fallback to download if sharing is not supported
        handleDownload();
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      alert('Failed to share image. Downloading instead.');
      handleDownload();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {/* Download Button with Format Options */}
        <div className="relative">
          <div className="flex">
            <button
              onClick={() => handleDownload()}
              disabled={isDownloading}
              className="flex-1 bg-[#2c2419] text-[#faf8f5] py-2 px-3 text-sm font-medium font-inter hover:bg-[#8b6834] focus:ring-2 focus:ring-[#8b6834] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1">
            
              <Download className="w-4 h-4" />
              {isDownloading ? 'Saving...' : 'PNG'}
            </button>
            <button
              onClick={() => setShowFormats(!showFormats)}
              className="bg-[#2c2419] text-[#faf8f5] py-2 px-2 hover:bg-[#8b6834] focus:ring-2 focus:ring-[#8b6834] focus:ring-offset-2 transition-colors border-l-2 border-[#5d4e37]">
            
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          
          {/* Format Dropdown */}
          {showFormats && (
            <div className="absolute bottom-full mb-1 left-0 right-0 bg-[#faf8f5] border-2 border-[#d4c4b0] shadow-lg z-50">
              {downloadFormats.map((format, index) => (
                <button
                  key={index}
                  onClick={() => handleDownload(format.extension, format.quality)}
                  disabled={isDownloading}
                  className="w-full px-3 py-2 text-sm font-medium font-inter text-[#2c2419] hover:bg-[#e8dcc8] disabled:opacity-50 transition-colors"
                >
                  {format.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleShare}
          className="bg-[#8b6834] text-[#faf8f5] py-2 px-3 text-sm font-medium font-inter hover:bg-[#6b4e25] focus:ring-2 focus:ring-[#8b6834] focus:ring-offset-2 transition-colors flex items-center justify-center gap-1">
        
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
}