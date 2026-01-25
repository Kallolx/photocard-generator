'use client';

import { useState } from 'react';
import { Link2, User, Grid3X3 } from 'lucide-react';
import CustomizationPanel from '@/components/CustomizationPanel';

interface UrlComponentProps {
  mode: 'single' | 'multiple';
  setMode: (mode: 'single' | 'multiple') => void;
  onUrlSubmit: (url: string) => void;
  isLoading: boolean;
  error: string;
  photocardData: any;
  background: any;
  onBackgroundChange: (bg: any) => void;
  onMultipleUrlsSubmit?: (urls: string[]) => void;
  multiplePhotocards?: any[];
  frameBorderColor?: string;
  frameBorderThickness?: number;
  onFrameChange?: (color: string, thickness: number) => void;
  adBannerImage?: string | null;
  onAdBannerChange?: (image: string | null) => void;
}

export default function UrlComponent({
  mode,
  setMode,
  onUrlSubmit,
  isLoading,
  error,
  photocardData,
  background,
  onBackgroundChange,
  onMultipleUrlsSubmit,
  multiplePhotocards,
  frameBorderColor,
  frameBorderThickness,
  onFrameChange,
  adBannerImage,
  onAdBannerChange
}: UrlComponentProps) {
  const [url, setUrl] = useState('');
  const [urls, setUrls] = useState<string[]>(['']);
  
  const handleSingleSubmit = () => {
    if (url.trim()) {
      onUrlSubmit(url.trim());
      setUrl(''); // Auto-clear URL after submission
    }
  };

  const handleMultipleSubmit = () => {
    const validUrls = urls.filter(u => u.trim());
    if (validUrls.length > 0 && onMultipleUrlsSubmit) {
      onMultipleUrlsSubmit(validUrls);
      setUrls(['']); // Auto-clear URLs after submission
    }
  };

  const addUrlField = () => {
    setUrls([...urls, '']);
  };

  const removeUrlField = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  return (
    <div className="space-y-3">
      {/* Mode Selector */}
      <div className="bg-gray-200 p-1 border border-gray-400">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode('single')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-md font-medium transition-all duration-200 ${
              mode === 'single'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-800 hover:bg-gray-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Single</span>
          </button>
          <button
            onClick={() => setMode('multiple')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-md font-medium transition-all duration-200 ${
              mode === 'multiple'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-800 hover:bg-gray-100'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>Batch</span>
          </button>
        </div>
      </div>

      {/* URL Input Section */}
      <div className="bg-gray-200 p-6 border border-gray-400">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-600">
            <Link2 className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base md:text-lg font-semibold text-slate-800">
            {mode === 'single' ? 'Article URL' : 'Multiple URLs'}
          </h2>
        </div>
        
        {mode === 'single' ? (
          <>
            <div className="space-y-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full px-4 py-3 bg-gray-300 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              
              {/* Button and Success Message Row */}
              <div className="flex items-center gap-3">
                {/* Success Message - Left Side */}
                {photocardData && (
                  <div className="flex-1 flex items-center gap-2 text-green-700 text-xs sm:text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Generated!
                  </div>
                )}

                {/* Generate Button - Right Side (always aligned right) */}
                <button
                  onClick={handleSingleSubmit}
                  disabled={!url.trim() || isLoading}
                  className="px-6 py-3 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors ml-auto"
                >
                  {isLoading ? 'Loading...' : 'Generate'}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="space-y-3">
              {urls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateUrl(index, e.target.value)}
                    placeholder={`URL ${index + 1}`}
                    className="flex-1 px-4 py-3 bg-gray-300 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  {urls.length > 1 && (
                    <button
                      onClick={() => removeUrlField(index)}
                      className="px-3 py-3 bg-red-500 text-white hover:bg-red-600 transition-colors"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              
              <div className="flex gap-3">
                <button
                  onClick={addUrlField}
                  className="flex-1 px-4 py-3 bg-gray-500 text-white hover:bg-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  + Add URL
                </button>
                <button
                  onClick={handleMultipleSubmit}
                  disabled={urls.filter(u => u.trim()).length === 0 || isLoading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Loading...' : 'Generate All'}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {multiplePhotocards && multiplePhotocards.length > 0 && (
              <div className="mt-4 space-y-2">
                {multiplePhotocards.map((photocard) => (
                  <div key={photocard.id} className="p-3 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 truncate flex-1">
                        {photocard.data.url || 'Processing...'}
                      </span>
                      <div className={`px-2 py-1 text-xs font-medium ${
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
        onBackgroundChange={onBackgroundChange}
        frameBorderColor={frameBorderColor}
        frameBorderThickness={frameBorderThickness}
        onFrameChange={onFrameChange}
        adBannerImage={adBannerImage}
        onAdBannerChange={onAdBannerChange}
      />
    </div>
  );
}