"use client";

import { PhotocardData, BackgroundOptions } from "@/types";
import { useEffect, useState } from "react";
import { getProxiedImageUrl } from "@/utils/imageProxy";

interface ClassicCustomCardProps {
  data: PhotocardData;
  isGenerating?: boolean;
  background?: BackgroundOptions;
  id?: string;
  fullSize?: boolean;
  frameBorderColor?: string;
  frameBorderThickness?: number;
  socialMedia?: Array<{platform: string, username: string}>;
  adBannerImage?: string | null;
  website?: string;
  footerText?: string;
}

// Helper function to darken a color
function darkenColor(color: string, percent: number = 20): string {
  // Handle hex colors
  if (color.startsWith('#')) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.floor((num >> 16) * (1 - percent / 100)));
    const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - percent / 100)));
    const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - percent / 100)));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
  // For non-hex colors, use CSS filter approach
  return color;
}

export default function ClassicCustomCard({
  data,
  isGenerating,
  background,
  id = "photocard",
  fullSize = false,
  frameBorderColor = '#FFFFFF',
  frameBorderThickness = 0,
  socialMedia = [],
  adBannerImage = null,
  website = '',
  footerText = '',
}: ClassicCustomCardProps) {
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
    if (!background) return { backgroundColor: '#8b6834' }; // default brown
    
    if (background.type === 'gradient' && background.gradientFrom && background.gradientTo) {
      return {
        backgroundImage: `linear-gradient(135deg, ${background.gradientFrom}, ${background.gradientTo})`
      };
    }
    
    return { backgroundColor: background.color };
  };

  const getFooterBackgroundStyle = () => {
    if (!background) return { backgroundColor: '#6b4e25' }; // darker brown
    
    if (background.type === 'gradient' && background.gradientFrom && background.gradientTo) {
      // For gradients, darken both colors
      const darkerFrom = darkenColor(background.gradientFrom, 25);
      const darkerTo = darkenColor(background.gradientTo, 25);
      return {
        backgroundImage: `linear-gradient(135deg, ${darkerFrom}, ${darkerTo})`
      };
    }
    
    // For solid colors, darken by 25%
    return { backgroundColor: darkenColor(background.color, 25) };
  };

  // Get the background color for the colored text
  const getHighlightColor = () => {
    if (!background) return '#8b6834'; // default brown
    
    if (background.type === 'gradient' && background.gradientFrom) {
      return background.gradientFrom;
    }
    
    return background.color;
  };

  // Filter out empty social media entries
  const validSocialMedia = socialMedia.filter(social => social.platform && social.username);

  return (
    <div
      id={id}
      className={fullSize ? "w-[448px] max-w-[448px] mx-auto overflow-hidden shadow-xl relative" : "w-full max-w-md mx-auto  overflow-hidden shadow-xl relative"}
      style={getBackgroundStyle()}
    >
      <div className="px-6 pt-6 pb-2">
        {/* Header with logo and date */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {data.logo && (
              <div className="bg-white rounded-lg border border-gray-200 p-2 min-w-[60px] min-h-[30px]">
                <img
                  src={data.logo}
                  alt="Site logo"
                  className="object-contain w-auto h-auto max-w-[100px] max-h-8"
                />
              </div>
            )}
          </div>
          <div className="text-white text-lg font-noto-bengali font-medium tracking-wide text-center">
            {getBengaliWeekday()} | {getBengaliDate()}
          </div>
        </div>

        {/* Main image */}
        <div 
          className="bg-white rounded-tl-[70px] rounded-tr-lg rounded-bl-lg rounded-br-[70px] overflow-hidden mb-4 aspect-video"
          style={{
            border: `${frameBorderThickness}px solid ${frameBorderColor}`
          }}
        >
          {data.image ? (
            <img
              src={data.image}
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
        <h2 className="text-white font-noto-bengali text-2xl text-center font-bold mb-2 leading-tight">
          {data.title}
        </h2>

        {/* Call to Action Text */}
        <div className="flex justify-center pb-2">
          <div className="bg-white border border-gray-300 py-.5 px-3 text-center max-w-[230px] rounded-sm">
              <p className="font-noto-bengali text-md font-bold text-gray-900">
                পুরো খবর দেখুন{' '}
                <span style={{ color: getHighlightColor() }}>কমেন্টের লিংকে</span>
              </p>
            </div>
        </div>
      </div>

      {/* Social Media Footer - Show if there are valid social media entries, website, or footerText */}
      {(validSocialMedia.length > 0 || website || footerText) && (
        <div className="px-6 py-3" style={getFooterBackgroundStyle()}>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {validSocialMedia.map((social, index) => (
              <div key={index} className="flex items-center gap-1.5">
                {/* Social Media Icon */}
                {social.platform === 'facebook' && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )}
                {social.platform === 'twitter' && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                )}
                {social.platform === 'instagram' && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                )}
                {social.platform === 'youtube' && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                )}
                {social.platform === 'linkedin' && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                )}
                {social.platform === 'tiktok' && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                )}
                {/* Username */}
                <span className="text-white text-xs font-medium">{social.username}</span>
              </div>
            ))}

            {/* Website */}
            {website && (
              <div className="flex items-center gap-1.5">
                {/* Globe Icon */}
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                {/* Website URL */}
                <span className="text-white text-xs font-medium">{website}</span>
              </div>
            )}

            {/* Footer Text */}
            {footerText && (
              <div className="flex items-center">
                <span className="text-white text-xs font-medium">{footerText}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ad Banner - Full width at bottom */}
      {adBannerImage && (
        <div className="w-full" style={{ height: '60px' }}>
          <img
            src={adBannerImage}
            alt="Advertisement"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
