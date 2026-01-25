"use client";

import { PhotocardData, BackgroundOptions } from "@/types";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { getProxiedImageUrl } from "@/utils/imageProxy";

interface PhotocardPreviewProps {
  data: PhotocardData;
  isGenerating?: boolean;
  background?: BackgroundOptions;
  id?: string;
  fullSize?: boolean;
}

export default function PhotocardPreview({
  data,
  isGenerating,
  background,
  id = "photocard",
  fullSize = false,
}: PhotocardPreviewProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    if (data.url) {
      QRCode.toDataURL(data.url, {
        width: 120,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      }).then(setQrCodeUrl);
    }
  }, [data.url]);

  const getBengaliDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return now.toLocaleDateString("bn-BD", options);
  };

  const getBengaliWeekday = () => {
    const days = [
      "রবিবার",
      "সোমবার",
      "মঙ্গলবার",
      "বুধবার",
      "বৃহস্পতিবার",
      "শুক্রবার",
      "শনিবার",
    ];
    return days[new Date().getDay()];
  };

  const getBackgroundStyle = () => {
    if (!background) return { backgroundColor: '#dc2626' }; // default red
    
    if (background.type === 'gradient' && background.gradientFrom && background.gradientTo) {
      return {
        backgroundImage: `linear-gradient(135deg, ${background.gradientFrom}, ${background.gradientTo})`
      };
    }
    
    return { backgroundColor: background.color };
  };

  return (
    <div
      id={id}
      className={fullSize ? "w-[448px] max-w-[448px] mx-auto rounded-lg overflow-hidden shadow-xl relative" : "w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-xl relative"}
      style={getBackgroundStyle()}
    >
      <div className="p-6">
        {/* Header with logo and date */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {data.logo && (
              <div className="bg-white rounded-lg border border-gray-200 p-2 min-w-[60px] min-h-[30px]">
                <img
                  src={getProxiedImageUrl(data.logo)}
                  alt="Site logo"
                  className="object-contain w-auto h-auto max-w-[100px] max-h-8"
                  onLoad={() => {
                    console.log('Logo loaded successfully:', data.logo);
                  }}
                />
              </div>
            )}
          </div>
          <div className="text-white text-lg font-noto-bengali font-medium tracking-wide text-center">
            {getBengaliWeekday()} | {getBengaliDate()}
          </div>
        </div>

        {/* Main image */}
        <div className="bg-white border-5 border-white rounded-tl-[70px] rounded-tr-lg rounded-bl-lg rounded-br-[70px] overflow-hidden mb-4 aspect-video">
          {data.image ? (
            <img
              src={getProxiedImageUrl(data.image)}
              alt="Article image"
              className="w-full h-full object-cover "
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">No image available</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-white font-noto-bengali text-2xl text-center font-bold mb-4 leading-tight">
          {data.title}
        </h2>

        {/* QR Code and Website Info */}
        <div className="flex items-center gap-4 mt-2">
          {qrCodeUrl && (
            <div className="bg-white p-1 rounded-lg flex-shrink-0">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-16 h-16"
              />
            </div>
          )}
          <div className="text-white flex-1">
            <p className="font-noto-bengali text-sm font-medium mb-1">
              {data.siteName}
            </p>
            <p className="font-noto-bengali text-xs opacity-90">
              আরো বিস্তারিত জানতে স্ক্যান করুন
            </p>
          </div>
        </div>
      </div>

      {/* Big Quote Mark - Bottom Right */}
      <div className="absolute bottom-4 right-6 z-10">
        <svg 
          className="w-24 h-24 text-white/40 drop-shadow-lg" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
        </svg>
      </div>
    </div>
  );
}
