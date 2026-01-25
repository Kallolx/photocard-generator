'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PhotocardPreview from '@/components/PhotocardPreview';
import DownloadControls from '@/components/DownloadControls';
import CustomizationPanel from '@/components/CustomizationPanel';
import { PhotocardData, BackgroundOptions } from '@/types';
import { Upload, Edit } from 'lucide-react';

export default function CustomPage() {
  const [logo, setLogo] = useState<string>('');
  const [newsImage, setNewsImage] = useState<string>('');
  const [title, setTitle] = useState('');
  const [background, setBackground] = useState<BackgroundOptions>({
    type: 'solid',
    color: '#dc2626'
  });
  const [frameBorderColor, setFrameBorderColor] = useState('#FFFFFF');
  const [frameBorderThickness, setFrameBorderThickness] = useState(5);
  const [socialMedia, setSocialMedia] = useState<Array<{platform: string, username: string}>>([
    { platform: '', username: '' },
    { platform: '', username: '' },
    { platform: '', username: '' }
  ]);
  const [leftPanelWidth, setLeftPanelWidth] = useState(33.333); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [adBannerImage, setAdBannerImage] = useState<string | null>(null);

  const handleFrameChange = (color: string, thickness: number) => {
    setFrameBorderColor(color);
    setFrameBorderThickness(thickness);
  };

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 60) {
      setLeftPanelWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewsImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create photocard data from custom inputs
  const photocardData: PhotocardData = {
    title: title || 'আপনার শিরোনাম এখানে লিখুন',
    image: newsImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=225&fit=crop&crop=center',
    logo: logo || 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png',
    favicon: '',
    siteName: 'Custom Card',
    url: '',
    weekName: new Date().toLocaleDateString('bn-BD', { weekday: 'long' }),
    date: new Date().toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content Layout */}
      <div className="flex flex-1 flex-col md:flex-row md:min-h-0 relative">
        {/* Left Sidebar */}
        <div 
          className="w-full bg-gray-100 p-4 md:p-6 md:overflow-y-auto"
          style={isDesktop ? { width: `${leftPanelWidth}%` } : undefined}
        >
          {/* Custom Input Section */}
          <div className="space-y-3">
            {/* Compact Uploads - Side by Side */}
            <div className="bg-gray-200 p-2 border border-gray-400">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Uploads</h3>
              <div className="grid grid-cols-2 gap-2">
                {/* Logo Upload */}
                <label className="flex flex-col items-center justify-center min-h-[56px] border border-dashed border-gray-400 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer p-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  {/* Icon + label (bigger) */}
                  <div className="flex items-center gap-2">
                    {logo ? (
                      <Edit className="w-4 h-4 text-slate-700" />
                    ) : (
                      <Upload className="w-4 h-4 text-slate-500" />
                    )}
                    <span className={`font-medium ${logo ? 'text-sm text-slate-900' : 'text-sm text-slate-600'}`}>
                      {logo ? 'Change Logo' : 'Upload Logo'}
                    </span>
                  </div>
                </label>

                {/* News Image Upload */}
                <label className="flex flex-col items-center justify-center min-h-[56px] border border-dashed border-gray-400 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer p-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  {/* Icon + label (bigger) */}
                  <div className="flex items-center gap-2">
                    {newsImage ? (
                      <Edit className="w-4 h-4 text-slate-700" />
                    ) : (
                      <Upload className="w-4 h-4 text-slate-500" />
                    )}
                    <span className={`font-medium ${newsImage ? 'text-sm text-slate-900' : 'text-sm text-slate-600'}`}>
                      {newsImage ? 'Change Image' : 'Upload Image'}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Title Input */}
            <div className="bg-gray-200 p-2 border border-gray-400">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Title</h3>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="আপনার শিরোনাম এখানে লিখুন..."
                className="w-full px-2 py-1.5 bg-gray-300 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[60px] resize-none font-noto-bengali text-md"
              />
            </div>

            {/* Social Media Links */}
            <div className="bg-gray-200 p-2 border border-gray-400">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Social Media (Max 3)</h3>
              <div className="space-y-3">
                {socialMedia.map((social, index) => (
                  <div key={index} className="space-y-3">
                    {/* Platform Icons Selection */}
                    <div className="flex gap-2 items-center">
                      {['facebook', 'twitter', 'instagram', 'youtube', 'linkedin', 'tiktok'].map((platform) => (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => {
                            const newSocial = [...socialMedia];
                            newSocial[index].platform = newSocial[index].platform === platform ? '' : platform;
                            setSocialMedia(newSocial);
                          }}
                          className={`p-2 w-10 h-10 flex items-center justify-center transition-all ${
                            social.platform === platform
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                        >
                          {platform === 'facebook' && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          )}
                          {platform === 'twitter' && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          )}
                          {platform === 'instagram' && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                            </svg>
                          )}
                          {platform === 'youtube' && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          )}
                          {platform === 'linkedin' && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          )}
                          {platform === 'tiktok' && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                    {/* Username Input */}
                    <input
                      type="text"
                      value={social.username}
                      onChange={(e) => {
                        const newSocial = [...socialMedia];
                        newSocial[index].username = e.target.value;
                        setSocialMedia(newSocial);
                      }}
                      placeholder={social.platform ? "Enter username" : "Select platform first"}
                      disabled={!social.platform}
                      className="w-full px-3 py-2 bg-gray-300 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 text-base rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customization Panel */}
          <div className="mt-6">
            <CustomizationPanel 
              background={background}
              onBackgroundChange={setBackground}
              frameBorderColor={frameBorderColor}
              frameBorderThickness={frameBorderThickness}
              onFrameChange={handleFrameChange}
              adBannerImage={adBannerImage}
              onAdBannerChange={setAdBannerImage}
            />
          </div>
        </div>

        {/* Resize Handle - Desktop only */}
        <div
          className="hidden md:block w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize active:bg-blue-600 transition-colors"
          onMouseDown={handleMouseDown}
          style={{
            cursor: isResizing ? 'col-resize' : 'col-resize',
            userSelect: 'none'
          }}
        />

        {/* Right Preview Area */}
        <div className="flex-1 bg-white md:overflow-y-auto md:min-h-0">
          <div className="flex items-start justify-center md:justify-start md:pl-12 p-4 md:pr-8 md:py-8">
            <div className="w-full flex justify-center">
              {!isDesktop ? (
                <>
                  {/* Mobile Thumbnail View */}
                  <div className="w-full max-w-sm space-y-4">
                    <div className="group cursor-pointer"
                      onClick={() => {
                        // Show the modal on mobile
                        const modal = document.getElementById('mobile-photocard-modal');
                        if (modal) modal.classList.remove('hidden');
                      }}
                    >
                      <div className="bg-white shadow-lg hover:shadow-xl border border-gray-100 overflow-hidden relative group-hover:border-blue-200 transition-all duration-300">
                        {/* Thumbnail header with gradient */}
                        <div className={`h-3 relative ${
                          background?.type === 'gradient' 
                            ? 'bg-gradient-to-r'
                            : 'bg-blue-500'
                        }`} style={background?.type === 'gradient' ? {
                          backgroundImage: `linear-gradient(90deg, ${background.gradientFrom || '#3b82f6'}, ${background.gradientTo || '#8b5cf6'})`
                        } : { backgroundColor: background?.color || '#3b82f6' }}></div>
                        
                        {/* Thumbnail content */}
                        <div className="p-4">
                          {/* Image */}
                          {photocardData.image && (
                            <div className="bg-gray-100 aspect-video mb-3 overflow-hidden">
                              <img
                                src={photocardData.image}
                                alt="Thumbnail"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Title */}
                          <h4 className="text-slate-800 font-noto-bengali text-sm font-medium mb-2 line-clamp-2 leading-tight">
                            {photocardData.title}
                          </h4>
                          
                          {/* Date */}
                          <p className="text-xs font-noto-bengali text-gray-500 mb-3">
                            {photocardData.date}
                          </p>
                          
                          {/* Tap to view */}
                          <div className="flex items-center justify-center py-2 bg-gray-50 group-hover:bg-blue-50 transition-colors duration-300">
                            <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 flex items-center gap-2 font-dm-sans">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Tap to view full card
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Download controls below thumbnail */}
                    <div className="flex justify-center">
                      <DownloadControls isVisible={true} targetId="photocard-custom" />
                    </div>
                  </div>

                  {/* Mobile Modal */}
                  <div 
                    id="mobile-photocard-modal"
                    className="hidden fixed inset-0 bg-black/80 z-50 overflow-y-auto"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        e.currentTarget.classList.add('hidden');
                      }
                    }}
                  >
                    <div className="min-h-screen flex items-center justify-center p-4">
                      <div className="relative">
                        {/* Close button */}
                        <button
                          onClick={() => {
                            const modal = document.getElementById('mobile-photocard-modal');
                            if (modal) modal.classList.add('hidden');
                          }}
                          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                        >
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        
                        <PhotocardPreview 
                          data={photocardData} 
                          background={background}
                          id="photocard-custom-modal"
                          frameBorderColor={frameBorderColor}
                          frameBorderThickness={frameBorderThickness}
                          hideFooter={true}
                          socialMedia={socialMedia.filter(s => s.platform && s.username)}
                          hideQuote={true}
                          adBannerImage={adBannerImage}
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Desktop Full View */
                <div className="flex flex-col items-center">
                  <div className="flex-shrink-0 mt-12">
                    <PhotocardPreview 
                      data={photocardData} 
                      background={background}
                      id="photocard-custom"
                      frameBorderColor={frameBorderColor}
                      frameBorderThickness={frameBorderThickness}
                      hideFooter={true}
                      socialMedia={socialMedia.filter(s => s.platform && s.username)}
                      hideQuote={true}
                      adBannerImage={adBannerImage}
                    />
                  </div>
                  
                  {/* Download controls */}
                  <div className="mt-6">
                    <DownloadControls isVisible={true} targetId="photocard-custom" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
