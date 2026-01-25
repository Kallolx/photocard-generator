'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import UrlComponent from '@/components/UrlComponent';
import PhotocardPreview from '@/components/PhotocardPreview';
import DownloadControls from '@/components/DownloadControls';
import { PhotocardData, BackgroundOptions, MultiplePhotocardData, UrlData } from '@/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [photocardData, setPhotocardData] = useState<PhotocardData | null>(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [background, setBackground] = useState<BackgroundOptions>({
    type: 'solid',
    color: '#dc2626'
  });
  const [frameBorderColor, setFrameBorderColor] = useState('#FFFFFF');
  const [frameBorderThickness, setFrameBorderThickness] = useState(2);
  const [mode, setMode] = useState<'single' | 'multiple'>('single');
  const [clearUrl, setClearUrl] = useState(false);
  const [multiplePhotocards, setMultiplePhotocards] = useState<MultiplePhotocardData[]>([]);
  const [selectedPhotocardIndex, setSelectedPhotocardIndex] = useState<number | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(33.333); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [adBannerImage, setAdBannerImage] = useState<string | null>(null);

  // Mock data for preview
  const mockData: PhotocardData = {
    title: 'এই একটি নমুনা শিরোনাম যা দেখায় ফটোকার্ড কেমন দেখাবে',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=225&fit=crop&crop=center',
    logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png',
    favicon: 'https://www.google.com/favicon.ico',
    siteName: 'Example News',
    url: 'https://example.com',
    weekName: 'শনিবার',
    date: '২৪ জানুয়ারি ২০২৬'
  };

  const handleUrlSubmit = async (url: string) => {
    setIsLoading(true);
    setError('');
    setPhotocardData(null);

    try {
      const response = await fetch('/api/extract-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract URL data');
      }

      const data: UrlData = await response.json();
      
      // Create photocard data with current date/time
      const now = new Date();
      const weekdays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
      
      const photocardData: PhotocardData = {
        ...data,
        weekName: weekdays[now.getDay()],
        date: now.toLocaleDateString('bn-BD', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };

      setPhotocardData(photocardData);
      setUrl(''); // Auto-clear URL after successful generation
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleUrlCleared = () => {
    setClearUrl(false);
  };

  const handleMultipleUrlsSubmit = async (urls: string[]) => {
    setIsLoading(true);
    setError('');
    setMultiplePhotocards([]);

    // Initialize photocard data with pending status
    const initialData: MultiplePhotocardData[] = urls.map((url, index) => ({
      id: `photocard-${index}`,
      data: {
        title: '',
        image: '',
        logo: '',
        favicon: '',
        siteName: '',
        url,
        weekName: '',
        date: ''
      },
      status: 'pending'
    }));

    setMultiplePhotocards(initialData);

    // Process each URL
    for (let i = 0; i < urls.length; i++) {
      try {
        // Update status to loading
        setMultiplePhotocards(prev => 
          prev.map(item => 
            item.id === `photocard-${i}` 
              ? { ...item, status: 'loading' as const }
              : item
          )
        );

        const response = await fetch('/api/extract-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: urls[i] }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to extract URL data');
        }

        const data: UrlData = await response.json();
        
        // Create photocard data with current date/time
        const now = new Date();
        const weekdays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
        
        const photocardData: PhotocardData = {
          ...data,
          weekName: weekdays[now.getDay()],
          date: now.toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        };

        // Update with completed data
        setMultiplePhotocards(prev => 
          prev.map(item => 
            item.id === `photocard-${i}` 
              ? { ...item, data: photocardData, status: 'completed' as const }
              : item
          )
        );

      } catch (err) {
        console.error('Error processing URL:', urls[i], err);
        setMultiplePhotocards(prev => 
          prev.map(item => 
            item.id === `photocard-${i}` 
              ? { 
                  ...item, 
                  status: 'error' as const, 
                  error: err instanceof Error ? err.message : 'An unexpected error occurred'
                }
              : item
          )
        );
      }
    }

    setIsLoading(false);
  };

  const handleDownloadAll = async () => {
    // This will be implemented with a zip library
    console.log('Download all photocards as ZIP');
    alert('ZIP download functionality will be implemented next!');
  };

  const completedPhotocards = multiplePhotocards.filter(p => p.status === 'completed');

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotocardIndex === null) return;
      
      if (e.key === 'Escape') {
        setSelectedPhotocardIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setSelectedPhotocardIndex(prev => 
          prev === null ? 0 : (prev > 0 ? prev - 1 : completedPhotocards.length - 1)
        );
      } else if (e.key === 'ArrowRight') {
        setSelectedPhotocardIndex(prev => 
          prev === null ? 0 : (prev < completedPhotocards.length - 1 ? prev + 1 : 0)
        );
      }
    };

    if (selectedPhotocardIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedPhotocardIndex, completedPhotocards.length]);

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content Layout */}
      <div className="flex flex-1 flex-col md:flex-row md:min-h-0 relative max-w-[1920px] mx-auto w-full">
        {/* Left Sidebar */}
        <div 
          className="w-full bg-gray-100 p-4 md:p-6 md:overflow-y-auto"
          style={isDesktop ? { width: `${leftPanelWidth}%` } : undefined}
        >
          <UrlComponent 
            mode={mode}
            setMode={setMode}
            onUrlSubmit={handleUrlSubmit} 
            isLoading={isLoading}
            error={error}
            photocardData={photocardData}
            background={background}
            onBackgroundChange={setBackground}
            onMultipleUrlsSubmit={handleMultipleUrlsSubmit}
            multiplePhotocards={multiplePhotocards}
            frameBorderColor={frameBorderColor}
            frameBorderThickness={frameBorderThickness}
            onFrameChange={handleFrameChange}
            adBannerImage={adBannerImage}
            onAdBannerChange={setAdBannerImage}
          />
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

        {/* Right Preview Area - Responsive */}
        <div className="flex-1 bg-white md:overflow-y-auto md:min-h-0">
          <div className="flex items-start justify-center md:justify-start md:pl-12 p-4 md:pr-8 md:py-8">
            {/* Photocard Preview(s) */}
            {mode === 'single' ? (
              <>
                {/* Desktop: Show full preview */}
                <div className="hidden md:block w-full flex justify-center">
                  <div className="flex flex-col items-center">
                    <div className="flex-shrink-0 mt-12">
                      <PhotocardPreview 
                        data={photocardData || mockData} 
                        isGenerating={isLoading}
                        background={background}
                        id="photocard-desktop"
                        frameBorderColor={frameBorderColor}
                        frameBorderThickness={frameBorderThickness}
                        adBannerImage={adBannerImage}
                      />
                    </div>
                    
                    {/* Download controls - only show when there's real data */}
                    {photocardData && (
                      <div className="mt-6">
                        <DownloadControls isVisible={true} targetId="photocard-desktop" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Mobile: Show thumbnail with locked aspect ratio */}
                <div className="md:hidden w-full flex justify-center py-4">
                  <div className="w-80 max-w-sm mx-auto">
                    <div 
                      className="cursor-pointer group"
                      onClick={() => {
                        // Add to completedPhotocards for modal viewing
                        const tempPhotocard = {
                          id: 'single-preview',
                          data: photocardData || mockData,
                          status: 'completed' as const
                        };
                        
                        // Update multiplePhotocards to include the single card
                        setMultiplePhotocards([tempPhotocard]);
                        setSelectedPhotocardIndex(0);
                      }}
                    >
                      <div className="bg-white shadow-lg hover:shadow-xl border border-gray-100 overflow-hidden relative group-hover:border-blue-200 transition-all duration-300">
                        {/* Thumbnail header with gradient - locked height */}
                        <div className={`h-3 relative ${
                          background?.type === 'gradient' 
                            ? 'bg-gradient-to-r'
                            : 'bg-blue-500'
                        }`} style={background?.type === 'gradient' ? {
                          backgroundImage: `linear-gradient(90deg, ${background.gradientFrom || '#3b82f6'}, ${background.gradientTo || '#8b5cf6'})`
                        } : { backgroundColor: background?.color || '#3b82f6' }}></div>
                        
                        {/* Thumbnail content - locked aspect ratio */}
                        <div className="p-4">
                          {/* Image with fixed aspect ratio */}
                          {(photocardData?.image || mockData.image) && (
                            <div className="bg-gray-100 aspect-video mb-3 overflow-hidden">
                              <img
                                src={(photocardData?.image || mockData.image)}
                                alt="Thumbnail"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Title with controlled line height */}
                          <h4 className="text-slate-800 font-dm-sans text-sm font-medium mb-2 line-clamp-2 leading-tight">
                            {(photocardData?.title || mockData.title)}
                          </h4>
                          
                          {/* Site info */}
                          {(photocardData?.siteName || mockData.siteName) && (
                            <div className="flex items-center gap-2 mb-2">
                              {(photocardData?.favicon || mockData.favicon) ? (
                                <img
                                  src={(photocardData?.favicon || mockData.favicon)}
                                  alt="Site favicon"
                                  className="w-4 h-4 flex-shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-4 h-4 bg-gray-200 flex-shrink-0"></div>
                              )}
                              <p className="text-xs text-gray-600 truncate font-medium font-dm-sans">
                                {(photocardData?.siteName || mockData.siteName)}
                              </p>
                            </div>
                          )}
                          
                          {/* Date */}
                          <p className="text-xs font-noto-bengali text-gray-500 mb-3">
                            {(photocardData?.date || mockData.date)}
                          </p>
                          
                          {/* Tap to view indicator */}
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
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6 w-full">
                {/* Thumbnail Gallery */}
                {completedPhotocards.length > 0 ? (
                  <div className="pb-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg md:text-xl font-bold text-slate-800 font-dm-sans">
                        Generated Photocards
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 text-blue-700 px-3 py-1 text-xs md:text-sm font-medium font-dm-sans">
                          {completedPhotocards.length} {completedPhotocards.length === 1 ? 'card' : 'cards'}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`grid gap-6 mb-8 ${
                      completedPhotocards.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                      completedPhotocards.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto' :
                      completedPhotocards.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                      'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                    }`}>
                      {completedPhotocards.map((photocard, index) => (
                        <div
                          key={photocard.id}
                          className="group cursor-pointer relative"
                        >
                          {/* Remove button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMultiplePhotocards(prev => prev.filter(p => p.id !== photocard.id));
                            }}
                            className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110"
                            title="Remove photocard"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          
                          {/* Thumbnail container - clickable for preview */}
                          <div
                            className="bg-white shadow-lg hover:shadow-xl border border-gray-100 overflow-hidden relative group-hover:border-blue-200 transition-all duration-300"
                            onClick={() => setSelectedPhotocardIndex(index)}
                          >
                            {/* Enhanced header with gradient */}
                            <div className={`h-3 relative ${
                              background?.type === 'gradient' 
                                ? `bg-gradient-to-r ${background.gradientTo || 'from-red-500 to-pink-600'}`
                                : `bg-[${background?.color || '#dc2626'}]`
                            }`}>
                              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            
                            {/* Thumbnail image with better aspect ratio */}
                            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden relative">
                              {photocard.data.image ? (
                                <img
                                  src={photocard.data.image}
                                  alt="Article thumbnail"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="w-8 h-8 mx-auto mb-2 bg-gray-300 flex items-center justify-center">
                                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                    <span className="text-gray-400 text-sm font-dm-sans">No image</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Content section */}
                            <div className="p-4">
                              <div className="mb-3">
                                <h4 className={`font-semibold font-noto-bengali text-gray-800 leading-snug mb-2 ${
                                  completedPhotocards.length <= 2 ? 'text-base' : 'text-sm'
                                } ${
                                  completedPhotocards.length <= 2 ? 'line-clamp-3' : 'line-clamp-2'
                                }`} style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: completedPhotocards.length <= 2 ? 3 : 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}>
                                  {photocard.data.title}
                                </h4>
                                
                                {photocard.data.siteName && (
                                  <div className="flex items-center gap-2 mb-2">
                                    {photocard.data.favicon ? (
                                      <img
                                        src={photocard.data.favicon}
                                        alt="Site favicon"
                                        className="w-4 h-4 flex-shrink-0"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                        }}
                                      />
                                    ) : null}
                                    <div className={`w-4 h-4 bg-gray-200 flex-shrink-0 ${photocard.data.favicon ? 'hidden' : ''}`}></div>
                                    <p className="text-sm text-gray-600 truncate font-medium font-dm-sans">
                                      {photocard.data.siteName}
                                    </p>
                                  </div>
                                )}
                                
                                <p className="text-sm font-noto-bengali text-gray-500 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {photocard.data.date}
                                </p>
                              </div>
                              
                              {/* Click to view indicator */}
                              <div className="flex items-center justify-center py-2 bg-gray-50 group-hover:bg-blue-50 transition-colors duration-300">
                                <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 flex items-center gap-2 font-dm-sans">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Click to preview
                                </span>
                              </div>
                            </div>
                            
                            {/* Enhanced hover effect */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    {!isDesktop ? (
                      <div className="w-full max-w-sm">
                        <div className="group cursor-pointer"
                          onClick={() => {
                            const modal = document.getElementById('empty-state-modal');
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
                              {mockData.image && (
                                <div className="bg-gray-100 aspect-video mb-3 overflow-hidden">
                                  <img
                                    src={mockData.image}
                                    alt="Thumbnail"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              
                              {/* Title */}
                              <h4 className="text-slate-800 font-noto-bengali text-sm font-medium mb-2 line-clamp-2 leading-tight">
                                {mockData.title}
                              </h4>
                              
                              {/* Site info */}
                              {mockData.siteName && (
                                <div className="flex items-center gap-2 mb-2">
                                  {mockData.favicon && (
                                    <img
                                      src={mockData.favicon}
                                      alt="Site favicon"
                                      className="w-4 h-4 flex-shrink-0"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  )}
                                  <p className="text-xs text-gray-600 truncate font-medium font-dm-sans">
                                    {mockData.siteName}
                                  </p>
                                </div>
                              )}
                              
                              {/* Date */}
                              <p className="text-xs font-noto-bengali text-gray-500 mb-3">
                                {mockData.date}
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

                        {/* Empty state mobile modal */}
                        <div 
                          id="empty-state-modal"
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
                                  const modal = document.getElementById('empty-state-modal');
                                  if (modal) modal.classList.add('hidden');
                                }}
                                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                              >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              
                              <PhotocardPreview 
                                data={mockData} 
                                background={background}
                                id="photocard-empty-state-modal"
                                frameBorderColor={frameBorderColor}
                                frameBorderThickness={frameBorderThickness}
                                adBannerImage={adBannerImage}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-shrink-0 mt-12">
                        <PhotocardPreview 
                          data={mockData} 
                          background={background}
                          id="photocard-empty-state"
                          frameBorderColor={frameBorderColor}
                          frameBorderThickness={frameBorderThickness}
                          adBannerImage={adBannerImage}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-size Photocard Modal */}
      {selectedPhotocardIndex !== null && completedPhotocards[selectedPhotocardIndex] && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 overflow-y-auto"
          onClick={() => setSelectedPhotocardIndex(null)}
        >
          <div className="min-h-screen flex items-center justify-center p-4">
            <div 
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedPhotocardIndex(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Navigation buttons */}
              {completedPhotocards.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedPhotocardIndex(prev => 
                      prev === null ? 0 : (prev > 0 ? prev - 1 : completedPhotocards.length - 1)
                    )}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/20 p-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedPhotocardIndex(prev => 
                      prev === null ? 0 : (prev < completedPhotocards.length - 1 ? prev + 1 : 0)
                    )}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/20 p-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Full-size photocard */}
              <div className="mt-12">
                <PhotocardPreview 
                  data={completedPhotocards[selectedPhotocardIndex].data} 
                  background={background}
                  id="photocard"
                  fullSize={true}
                  frameBorderColor={frameBorderColor}
                  frameBorderThickness={frameBorderThickness}
                  adBannerImage={adBannerImage}
                />
              </div>

              {/* Download button for individual card */}
              <div className="mt-4 flex justify-center">
                <DownloadControls isVisible={true} />
              </div>
              
              {/* Card counter */}
              {completedPhotocards.length > 1 && (
                <div className="text-center mt-2">
                  <span className="text-white text-sm font-dm-sans bg-black/20 px-3 py-1">
                    {selectedPhotocardIndex + 1} of {completedPhotocards.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

