'use client';

import { useState } from 'react';
import { Link2, User, Grid3X3, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import UpgradeModal from './UpgradeModal';

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
  onDownloadAll?: () => void;
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
  adBannerImage,
  onAdBannerChange,
  onDownloadAll
}: UrlComponentProps) {
  const [url, setUrl] = useState('');
  const [urls, setUrls] = useState<string[]>(['']);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user, features } = useAuth();
  
  const handleSingleSubmit = () => {
    if (url.trim()) {
      onUrlSubmit(url.trim());
      setUrl('');
    }
  };

  const handleMultipleSubmit = () => {
    const validUrls = urls.filter(u => u.trim());
    if (validUrls.length > 0 && onMultipleUrlsSubmit) {
      onMultipleUrlsSubmit(validUrls);
      setUrls(['']);
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
      <div className="bg-[#f5f0e8] p-1 border-2 border-[#d4c4b0]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode('single')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-md font-medium font-inter transition-all duration-200 ${
              mode === 'single'
                ? 'bg-white text-[#2c2419] shadow-sm'
                : 'text-[#5d4e37] hover:text-[#8b6834] hover:bg-[#e8dcc8]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Single</span>
          </button>
          <button
            onClick={() => {
              if (user?.plan === 'Premium') {
                setMode('multiple');
              } else {
                setShowUpgradeModal(true);
              }
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-md font-medium font-inter transition-all duration-200 relative ${
              mode === 'multiple'
                ? 'bg-white text-[#2c2419] shadow-sm'
                : 'text-[#5d4e37] hover:text-[#8b6834] hover:bg-[#e8dcc8]'
            } ${
              user?.plan !== 'Premium' ? 'opacity-60' : ''
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>Batch</span>
            {user?.plan !== 'Premium' && (
              <Lock className="w-3 h-3 absolute top-2 right-2 text-[#8b6834]" />
            )}
          </button>
        </div>
      </div>

      {/* URL Input Section */}
      <div className="bg-[#f5f0e8] p-6 border-2 border-[#d4c4b0]">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-[#8b6834]">
            <Link2 className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base md:text-lg font-lora font-bold text-[#2c2419]">
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
                placeholder="Paste your article url"
                className="w-full px-4 py-3 bg-[#e8dcc8] border-2 border-[#d4c4b0] text-[#2c2419] placeholder-[#5d4e37] font-inter focus:outline-none focus:ring-2 focus:ring-[#8b6834]"
                disabled={isLoading}
              />
              
              <div className="flex items-center gap-3">
                {photocardData && (
                  <div className="flex-1 flex items-center gap-2 text-[#38A169] text-xs sm:text-sm font-medium font-inter">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Generated!
                  </div>
                )}

                <button
                  onClick={handleSingleSubmit}
                  disabled={!url.trim() || isLoading}
                  className="px-6 py-3 bg-[#8b6834] text-[#faf8f5] text-sm font-medium font-inter hover:bg-[#6b4e25] disabled:bg-[#a08d74] disabled:cursor-not-allowed transition-colors ml-auto"
                >
                  {isLoading ? 'Loading...' : 'Generate'}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200">
                <p className="text-red-700 text-sm font-inter">{error}</p>
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
                    className="flex-1 px-4 py-3 bg-[#e8dcc8] border-2 border-[#d4c4b0] text-[#2c2419] placeholder-[#5d4e37] font-inter focus:outline-none focus:ring-2 focus:ring-[#8b6834]"
                    disabled={isLoading}
                  />
                  {urls.length > 1 && (
                    <button
                      onClick={() => removeUrlField(index)}
                      className="px-3 py-3 bg-[#8b6834] text-[#faf8f5] hover:bg-[#6b4e25] transition-colors"
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
                  className="flex-1 px-4 py-3 bg-[#5d4e37] text-[#faf8f5] font-inter font-medium hover:bg-[#8b6834] transition-colors"
                  disabled={isLoading}
                >
                  + Add URL
                </button>
                <button
                  onClick={multiplePhotocards && multiplePhotocards.some(p => p.status === 'completed') ? onDownloadAll : handleMultipleSubmit}
                  disabled={isLoading || (!multiplePhotocards?.some(p => p.status === 'completed') && urls.filter(u => u.trim()).length === 0)}
                  className={`flex-1 px-6 py-3 font-medium font-inter transition-colors text-[#faf8f5]
                    ${isLoading ? 'bg-[#a08d74] cursor-not-allowed' :
                      multiplePhotocards && multiplePhotocards.some(p => p.status === 'completed')
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-[#8b6834] hover:bg-[#6b4e25] disabled:bg-[#a08d74] disabled:cursor-not-allowed'
                    }`}
                >
                  {isLoading ? 'Loading...' : 
                    multiplePhotocards && multiplePhotocards.some(p => p.status === 'completed') 
                      ? 'Download All' 
                      : 'Generate All'}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200">
                <p className="text-red-700 text-sm font-inter">{error}</p>
              </div>
            )}

            {multiplePhotocards && multiplePhotocards.length > 0 && (
              <div className="mt-4 space-y-2">
                {multiplePhotocards.map((photocard) => (
                  <div key={photocard.id} className="p-3 bg-[#e8dcc8] border border-[#d4c4b0]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-inter text-[#5d4e37] truncate flex-1">
                        {photocard.data.url || 'Processing...'}
                      </span>
                      <div className={`px-2 py-1 text-xs font-medium font-inter ${
                        photocard.status === 'completed' ? 'bg-[#d4edda] text-[#38A169]' :
                        photocard.status === 'loading' ? 'bg-[#8b6834] text-[#faf8f5]' :
                        photocard.status === 'error' ? 'bg-[#f5e5d3] text-[#8b6834]' :
                        'bg-[#f5f0e8] text-[#5d4e37]'
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

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Batch Processing"
        requiredPlan="Premium"
      />
    </div>
  );
}
