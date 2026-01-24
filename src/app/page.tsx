'use client';

import { useState, useEffect } from 'react';
import { Camera, Sparkles, Grid3X3, User } from 'lucide-react';
import UrlInput from '@/components/UrlInput';
import PhotocardPreview from '@/components/PhotocardPreview';
import DownloadControls from '@/components/DownloadControls';
import { UrlData, PhotocardData, BackgroundOptions, MultiplePhotocardData } from '@/types';
import CustomizationPanel from '@/components/CustomizationPanel';
import MultipleUrlInput from '@/components/MultipleUrlInput';

export default function Home() {
  const [mode, setMode] = useState<'single' | 'multiple'>('single');
  const [isLoading, setIsLoading] = useState(false);
  const [photocardData, setPhotocardData] = useState<PhotocardData | null>(null);
  const [multiplePhotocards, setMultiplePhotocards] = useState<MultiplePhotocardData[]>([]);
  const [error, setError] = useState('');
  const [selectedPhotocardIndex, setSelectedPhotocardIndex] = useState<number | null>(null);
  const [clearUrl, setClearUrl] = useState(false);
  const [background, setBackground] = useState<BackgroundOptions>({
    type: 'solid',
    color: '#dc2626'
  });

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
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setPhotocardData(null);
    setMultiplePhotocards([]);
    setError('');
    setClearUrl(true);
  };

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
    <div className="min-h-screen bg-gray-200">
      {/* Header/Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 bg-gradient-to-br from-red-500 via-pink-500 to-pink-600 rounded-xl shadow-md">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl text-black tracking-tighter font-bold font-dm-sans">
                  Photocard Generator
                </h1>
              </div>
            </div>

            {/* Right Side - Stats & Mode Selector */}
            <div className="flex items-center gap-6">              
              {/* Mode Selector */}
              <div className="flex items-center gap-1 bg-slate-100/80 backdrop-blur-sm rounded-xl p-1 shadow-inner">
                <button
                  onClick={() => setMode('single')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium font-dm-sans transition-all duration-200 ${
                    mode === 'single'
                      ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Single</span>
                </button>
                <button
                  onClick={() => setMode('multiple')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium font-dm-sans transition-all duration-200 ${
                    mode === 'multiple'
                      ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span>Bulk</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden">
            {/* Top Row - Logo & Brand */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="relative p-2 bg-gradient-to-br from-red-500 via-pink-500 to-pink-600 rounded-lg shadow-md">
                  <Camera className="w-5 h-5 text-white" />
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse"></div>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-bold font-dm-sans bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                    Photocard Generator
                  </h1>
                  <p className="text-xs text-slate-500 font-dm-sans">
                    Transform articles to photocards
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Row - Mode Selector */}
            <div className="pb-4">
              <div className="flex items-center gap-1 bg-slate-100/80 backdrop-blur-sm rounded-xl p-1 shadow-inner w-full max-w-xs mx-auto">
                <button
                  onClick={() => setMode('single')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium font-dm-sans transition-all duration-200 ${
                    mode === 'single'
                      ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Single</span>
                </button>
                <button
                  onClick={() => setMode('multiple')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium font-dm-sans transition-all duration-200 ${
                    mode === 'multiple'
                      ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span>Bulk</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* URL Input Card */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-800 font-dm-sans">
                  {mode === 'single' ? 'Article URL' : 'Multiple URLs'}
                </h2>
              </div>
              
              {mode === 'single' ? (
                <>
                  <UrlInput 
                    onUrlSubmit={handleUrlSubmit} 
                    isLoading={isLoading}
                    clearUrl={clearUrl}
                    onUrlCleared={handleUrlCleared}
                  />
                  
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  {photocardData && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-green-700 text-sm font-medium font-dm-sans flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Generated successfully!
                        </span>
                        <button
                          onClick={resetForm}
                          className="text-green-600 text-sm font-medium font-dm-sans hover:text-green-700 transition-colors"
                        >
                          New Card
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <MultipleUrlInput
                    onUrlsSubmit={handleMultipleUrlsSubmit}
                    isLoading={isLoading}
                    onDownloadAll={handleDownloadAll}
                    canDownloadAll={completedPhotocards.length > 0}
                  />
                  
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-700 text-sm font-dm-sans">{error}</p>
                    </div>
                  )}

                  {multiplePhotocards.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {multiplePhotocards.map((photocard) => (
                        <div key={photocard.id} className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 font-dm-sans truncate flex-1">
                              {photocard.data.url || 'Processing...'}
                            </span>
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              photocard.status === 'completed' ? 'bg-green-100 text-green-700' :
                              photocard.status === 'loading' ? 'bg-blue-100 text-blue-700' :
                              photocard.status === 'error' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {photocard.status === 'loading' ? 'Loading...' :
                               photocard.status === 'completed' ? 'Done' :
                               photocard.status === 'error' ? 'Error' : 'Pending'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Customization Panel */}
            <CustomizationPanel 
              background={background}
              onBackgroundChange={setBackground}
            />
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-8">
            <div>
              {/* Photocard Preview(s) */}
              {mode === 'single' ? (
                <>
                  {/* Desktop: Show full preview */}
                  <div className="hidden md:block">
                    <div className="flex justify-center mb-8">
                      <div className="flex-shrink-0">
                        <PhotocardPreview 
                          data={photocardData || mockData} 
                          isGenerating={isLoading}
                          background={background}
                          id="photocard-desktop"
                        />
                      </div>
                    </div>
                    
                    {/* Desktop download controls - only show when there's real data */}
                    {photocardData && (
                      <div className="flex justify-center">
                        <DownloadControls isVisible={true} targetId="photocard-desktop" />
                      </div>
                    )}
                  </div>
                  
                  {/* Mobile: Show thumbnail */}
                  <div className="md:hidden">
                    <div className="flex justify-center mb-4">
                      <div 
                        className="cursor-pointer group max-w-[200px]"
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
                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 overflow-hidden relative group-hover:border-blue-200 transition-all duration-300">
                          {/* Thumbnail header with gradient */}
                          <div className={`h-2 relative ${
                            background?.type === 'gradient' 
                              ? 'bg-gradient-to-r'
                              : 'bg-blue-500'
                          }`} style={background?.type === 'gradient' ? {
                            backgroundImage: `linear-gradient(90deg, ${background.gradientFrom || '#3b82f6'}, ${background.gradientTo || '#8b5cf6'})`
                          } : { backgroundColor: background?.color || '#3b82f6' }}></div>
                          
                          {/* Thumbnail content */}
                          <div className="p-3">
                            {/* Small image */}
                            {(photocardData?.image || mockData.image) && (
                              <div className="bg-gray-100 rounded-lg aspect-video mb-2 overflow-hidden">
                                <img
                                  src={(photocardData?.image || mockData.image)}
                                  alt="Thumbnail"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            {/* Small title */}
                            <h4 className="text-slate-800 font-dm-sans text-xs font-medium line-clamp-2 mb-1">
                              {(photocardData?.title || mockData.title)}
                            </h4>
                            
                            {/* Tap to view indicator */}
                            <p className="text-slate-500 text-xs font-dm-sans text-center mt-2 opacity-70">
                              Tap to view full card
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  {/* Thumbnail Gallery */}
                  {completedPhotocards.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-800 font-dm-sans">
                          Generated Photocards
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium font-dm-sans">
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
                              className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110"
                              title="Remove photocard"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            
                            {/* Thumbnail container - clickable for preview */}
                            <div
                              className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 overflow-hidden relative group-hover:border-blue-200 transition-all duration-300"
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
                                      <div className="w-8 h-8 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                      <span className="text-gray-400 text-sm font-dm-sans">No image</span>
                                    </div>
                                  </div>
                                )}                    
                              </div>
                              
                              {/* Enhanced content area */}
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
                                          className="w-4 h-4 rounded-sm flex-shrink-0"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                          }}
                                        />
                                      ) : null}
                                      <div className={`w-4 h-4 bg-gray-200 rounded-full flex-shrink-0 ${photocard.data.favicon ? 'hidden' : ''}`}></div>
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
                                <div className="flex items-center justify-center py-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-300">
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
                      <div className="flex-shrink-0">
                        <PhotocardPreview 
                          data={mockData} 
                          background={background}
                          id="photocard-empty-state"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      {/* Full-size Photocard Modal */}
      {selectedPhotocardIndex !== null && completedPhotocards[selectedPhotocardIndex] && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setSelectedPhotocardIndex(null)}
        >
          <div 
            className="relative w-full max-w-none mx-auto"
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/20 rounded-full p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedPhotocardIndex(prev => 
                    prev === null ? 0 : (prev < completedPhotocards.length - 1 ? prev + 1 : 0)
                  )}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/20 rounded-full p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Full-size photocard */}
            <PhotocardPreview 
              data={completedPhotocards[selectedPhotocardIndex].data} 
              background={background}
              id="photocard"
              fullSize={true}
            />

            {/* Download button for individual card */}
            <div className="mt-4 flex justify-center">
              <DownloadControls isVisible={true} />
            </div>
            
            {/* Card counter */}
            {completedPhotocards.length > 1 && (
              <div className="text-center mt-2">
                <span className="text-white text-sm font-dm-sans bg-black/20 px-3 py-1 rounded-full">
                  {selectedPhotocardIndex + 1} of {completedPhotocards.length}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

