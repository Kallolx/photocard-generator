'use client';

import { useState } from 'react';
import { BackgroundOptions } from '@/types';
import { Plus, Lock, RefreshCw, X, Upload } from 'lucide-react';

interface CustomizationPanelProps {
  background: BackgroundOptions;
  onBackgroundChange: (background: BackgroundOptions) => void;
  frameBorderColor?: string;
  frameBorderThickness?: number;
  onFrameChange?: (color: string, thickness: number) => void;
  adBannerImage?: string | null;
  onAdBannerChange?: (image: string | null) => void;
}

const SOLID_COLORS = [
  { color: '#E53E3E', name: 'Soft Red' },
  { color: '#D53F8C', name: 'Muted Pink' },
  { color: '#DD6B20', name: 'Warm Orange' },
  { color: '#975A16', name: 'Earth Brown' },
  { color: '#7e7e7f', name: 'Light Gray' },
  { color: '#38A169', name: 'Calm Green' },
  { color: '#3182CE', name: 'Sky Blue' },
  { color: '#805AD5', name: 'Soft Purple' },
  { color: '#319795', name: 'Teal' },
  { color: '#2D3748', name: 'Dark Slate' }
];

const GRADIENTS = [
  { from: '#C53030', to: '#FC8181', name: 'Soft Red Glow' },
  { from: '#B83280', to: '#F687B3', name: 'Rose Pink' },
  { from: '#C05621', to: '#F6AD55', name: 'Warm Sunset' },
  { from: '#2B6CB0', to: '#63B3ED', name: 'Calm Blue Sky' },
  { from: '#2F855A', to: '#68D391', name: 'Fresh Green' },
  { from: '#553C9A', to: '#B794F4', name: 'Lavender Dream' },
  { from: '#285E61', to: '#81E6D9', name: 'Aqua Mint' },
  { from: '#1A202C', to: '#4A5568', name: 'Midnight Slate' },
  { from: '#4A5568', to: '#CBD5E0', name: 'Soft Graphite' },
  { from: '#744210', to: '#FBD38D', name: 'Golden Sand' }
];


const FRAME_COLORS = [
  { color: '#FFFFFF', name: 'Pure White' },
  { color: '#F1F5F9', name: 'Soft Gray' },
  { color: '#CBD5E1', name: 'Cool Gray' },
  { color: '#22C55E', name: 'Soft Green' },
  { color: '#3B82F6', name: 'Clean Blue' },
  { color: '#9333EA', name: 'Royal Purple' },
  { color: '#EF4444', name: 'Soft Red' },
  { color: '#F59E0B', name: 'Warm Amber' },
  { color: '#0F172A', name: 'Deep Slate' },
  { color: '#000000', name: 'Pure Black' }
];


const THEMES = [
  { id: 'classic', name: 'Classic', locked: false },
  { id: 'split', name: 'Split', locked: true },
  { id: 'horizontal', name: 'Horizontal', locked: true },
  { id: 'minimal', name: 'Minimal', locked: true },
  { id: 'modern', name: 'Modern', locked: true },
  { id: 'vintage', name: 'Vintage', locked: true },
  { id: 'bold', name: 'Bold', locked: true },
  { id: 'elegant', name: 'Elegant', locked: true },
  { id: 'creative', name: 'Creative', locked: true }
];

type Tab = 'Background' | 'Theme' | 'Fonts' | 'Frame' | 'Ad Banner';

export default function CustomizationPanel({ 
  background, 
  onBackgroundChange,
  frameBorderColor: initialFrameBorderColor = '#FFFFFF',
  frameBorderThickness: initialFrameBorderThickness = 2,
  onFrameChange,
  adBannerImage,
  onAdBannerChange
}: CustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Background');
  const [selectedTheme, setSelectedTheme] = useState('classic');
  const [showFontModal, setShowFontModal] = useState(false);
  const [selectedFontType, setSelectedFontType] = useState<'weekDate' | 'headline' | null>(null);
  const [frameBorderColor, setFrameBorderColor] = useState(initialFrameBorderColor);
  const [frameBorderThickness, setFrameBorderThickness] = useState(initialFrameBorderThickness);

  const handleFrameColorChange = (color: string) => {
    setFrameBorderColor(color);
    onFrameChange?.(color, frameBorderThickness);
  };

  const handleFrameThicknessChange = (thickness: number) => {
    setFrameBorderThickness(thickness);
    onFrameChange?.(frameBorderColor, thickness);
  };

  const tabs: Tab[] = ['Background', 'Theme', 'Fonts', 'Frame', 'Ad Banner'];

  return (
    <div className="bg-gray-200 p-6 border border-gray-400">
      {/* Tab Navigation - Scrollable on small devices */}
      <div className="border-b border-gray-300 mb-6 -mx-6 px-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-6 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab
                  ? 'text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-3">
        {/* Background Tab */}
        {activeTab === 'Background' && (
          <>
            {/* Solid Colors Section */}
            <div>
              <h3 className="text-sm font-medium text-slate-900 mb-3">
                Solid Colors <span className="text-xs text-slate-600">({SOLID_COLORS.length} colors)</span>
              </h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {SOLID_COLORS.map((item) => (
                  <button
                    key={item.color}
                    onClick={() => onBackgroundChange({ type: 'solid', color: item.color })}
                    className={`relative w-14 h-14 flex-shrink-0 border-2 transition-all overflow-hidden ${
                      background.type === 'solid' && background.color === item.color
                        ? 'border-white'
                        : 'border-gray-400 hover:scale-95'
                    }`}
                    style={{ backgroundColor: item.color }}
                    title={item.name}
                  >
                    {background.type === 'solid' && background.color === item.color && (
                      <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-[10px] text-center py-0.5">
                        selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Gradients Section */}
            <div>
              <h3 className="text-sm font-medium text-slate-900 mb-3">
                Gradients <span className="text-xs text-slate-600">({GRADIENTS.length} colors)</span>
                </h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {GRADIENTS.map((grad, index) => (
                  <button
                    key={index}
                    onClick={() => onBackgroundChange({ 
                      type: 'gradient', 
                      color: '', 
                      gradientFrom: grad.from, 
                      gradientTo: grad.to 
                    })}
                    className={`relative w-14 h-14 flex-shrink-0 border-2 transition-all overflow-hidden ${
                      background.type === 'gradient' && 
                      background.gradientFrom === grad.from && 
                      background.gradientTo === grad.to
                        ? 'border-white'
                        : 'border-gray-400 hover:scale-95'
                    }`}
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${grad.from}, ${grad.to})`
                    }}
                    title={grad.name}
                  >
                    {background.type === 'gradient' && 
                     background.gradientFrom === grad.from && 
                     background.gradientTo === grad.to && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/35 text-white text-[10px] text-center py-1">
                        selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Theme Tab */}
        {activeTab === 'Theme' && (
          <div>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => !theme.locked && setSelectedTheme(theme.id)}
                  disabled={theme.locked}
                  className={`relative h-24 transition-all ${
                    selectedTheme === theme.id && !theme.locked
                      ? 'ring-2 ring-red-500 ring-offset-2'
                      : ''
                  } ${
                    theme.locked 
                      ? 'bg-gray-300 cursor-not-allowed opacity-60' 
                      : 'bg-gray-400 hover:bg-gray-500'
                  }`}
                >
                  {/* Theme Preview Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {theme.locked && (
                      <Lock className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  
                  {/* Theme Name */}
                  <div className={`absolute bottom-2 left-2 text-xs font-medium ${
                    selectedTheme === theme.id && !theme.locked
                      ? 'bg-red-500 text-white px-2 py-0.5 rounded'
                      : 'text-slate-700'
                  }`}>
                    {theme.name}
                  </div>
                  
                  {/* Selected Indicator */}
                  {selectedTheme === theme.id && !theme.locked && (
                    <div className="absolute bottom-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded">
                      selected
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fonts Tab - Placeholder */}
        {activeTab === 'Fonts' && (
          <div className="space-y-4">
            {/* Week & Date Font */}
            <div>
              <h3 className="text-sm font-medium text-slate-900 mb-2">Week & Date :</h3>
              <div className="bg-gray-300 px-3 py-2 flex items-center justify-between">
                <div className="flex-1 text-left">
                  <span className="font-noto-bengali text-gray-700 text-lg">আমার সোনার বাংলা</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedFontType('weekDate');
                    setShowFontModal(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-300 hover:bg-gray-200 rounded-md transition-colors text-slate-600 text-xs"
                >
                  <span>change</span>
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Headline Font */}
            <div>
              <h3 className="text-sm font-medium text-slate-900 mb-2">Headline :</h3>
              <div className="bg-gray-300 px-3 py-2 flex items-center justify-between">
                <div className="flex-1 text-left">
                  <span className="font-noto-bengali text-gray-700 text-lg">আমার সোনার বাংলা</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedFontType('headline');
                    setShowFontModal(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-300 hover:bg-gray-200 rounded-md transition-colors text-slate-600 text-xs"
                >
                  <span>change</span>
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Font Selection Modal (Placeholder) */}
            {showFontModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 tracking-tighter">
                      Select Font - {selectedFontType === 'weekDate' ? 'Week & Date' : 'Headline'}
                    </h3>
                    <button
                      onClick={() => setShowFontModal(false)}
                      className="text-slate-500 hover:text-slate-900"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {/* Font options would go here */}
                      <button
                        onClick={() => {
                          // placeholder: apply font selection for Week/Headline in future
                          setShowFontModal(false);
                        }}
                        className="w-full p-3 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-between"
                      >
                        <div className="flex-1 text-left">
                          <span className="font-noto-bengali text-gray-600 block">আমার সোনার বাংলা</span>
                        </div>
                        <div className="ml-4 text-sm text-slate-600">Noto Serif Bengali</div>
                      </button>

                      <button
                        onClick={() => {
                          setShowFontModal(false);
                        }}
                        className="w-full p-3 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-between"
                      >
                        <div className="flex-1 text-left">
                          <span className="font-dm-sans text-gray-600 block">আমার সোনার বাংলা</span>
                        </div>
                        <div className="ml-4 text-sm text-slate-600">DM Sans</div>
                      </button>

                      <div className="w-full p-3 bg-gray-100 transition-colors flex items-center justify-between opacity-50 cursor-not-allowed">
                        <div className="flex-1 text-left">
                          <span className="text-base text-slate-600 block">Font preview</span>
                        </div>
                        <div className="ml-4 text-sm text-slate-600">More fonts coming soon...</div>
                      </div>
                  </div>
                  <button
                    onClick={() => setShowFontModal(false)}
                    className="w-full mt-4 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Frame Tab */}
        {activeTab === 'Frame' && (
          <div className="space-y-4">
            {/* Border Color */}
            <div>
              <h3 className="text-sm font-medium text-slate-900 mb-3">
                Border Color <span className="text-xs text-slate-600">({FRAME_COLORS.length} colors)</span>
              </h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {FRAME_COLORS.map((item) => (
                  <button
                    key={item.color}
                    onClick={() => handleFrameColorChange(item.color)}
                    className={`relative w-14 h-14 flex-shrink-0 border-2 transition-all overflow-hidden ${
                      frameBorderColor === item.color
                        ? 'border-white'
                        : 'border-gray-400 hover:scale-95'
                    }`}
                    style={{ backgroundColor: item.color }}
                    title={item.name}
                  >
                    {frameBorderColor === item.color && (
                      <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-[10px] text-center py-0.5">
                        selected
                      </div>
                    )}
                  </button>
                ))}
                <button
                  className="w-14 h-14 flex-shrink-0 border-2 border-gray-400 bg-gray-300 hover:bg-gray-400 transition-colors flex items-center justify-center"
                  title="Add custom color"
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Border Thickness */}
            <div>
              <h3 className="text-sm font-medium text-slate-900 mb-3">Border Thickness</h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={frameBorderThickness}
                  onChange={(e) => handleFrameThicknessChange(Number(e.target.value))}
                  className="flex-1 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #94a3b8 0%, #94a3b8 ${frameBorderThickness * 10}%, #d1d5db ${frameBorderThickness * 10}%, #d1d5db 100%)`
                  }}
                />
                <div className="w-8 text-right text-md font-medium text-slate-700">
                  {frameBorderThickness}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ad Banner Tab */}
        {activeTab === 'Ad Banner' && (
          <div className="space-y-4">
            {/* Upload Section */}
            {!adBannerImage ? (
              <div>
                <label className="block border-2 border-dashed border-gray-400 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          onAdBannerChange?.(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Upload className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                  <p className="text-sm text-slate-600">upload ad banner</p>
                </label>
              </div>
            ) : null}

            {/* Preview Section */}
            {adBannerImage && (
              <>
                <div>
                  <h3 className="text-xs font-medium text-slate-700 mb-3">Ad banner Preview</h3>
                  <div className="bg-gray-300 p-4">
                    <img
                      src={adBannerImage}
                      alt="Ad Banner Preview"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => onAdBannerChange?.(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 transition-colors text-slate-700 text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Change</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}