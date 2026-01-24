'use client';

import { BackgroundOptions } from '@/types';
import { Palette } from 'lucide-react';

interface CustomizationPanelProps {
  background: BackgroundOptions;
  onBackgroundChange: (background: BackgroundOptions) => void;
}

const SOLID_COLORS = [
  { color: '#dc2626', name: 'Red' },
  { color: '#2563eb', name: 'Blue' },  
  { color: '#16a34a', name: 'Green' },
  { color: '#9333ea', name: 'Purple' },
  { color: '#1f2937', name: 'Dark' },
  { color: '#f97316', name: 'Orange' },
  { color: '#0891b2', name: 'Cyan' },
  { color: '#be185d', name: 'Pink' }
];

const GRADIENTS = [
  { from: '#dc2626', to: '#f97316', name: 'Red Orange' },
  { from: '#2563eb', to: '#7c3aed', name: 'Blue Purple' },
  { from: '#16a34a', to: '#059669', name: 'Green Teal' },
  { from: '#9333ea', to: '#ec4899', name: 'Purple Pink' },
  { from: '#1f2937', to: '#4b5563', name: 'Dark Gray' },
  { from: '#f97316', to: '#eab308', name: 'Orange Yellow' },
  { from: '#0891b2', to: '#06b6d4', name: 'Cyan Blue' },
  { from: '#be185d', to: '#e11d48', name: 'Pink Red' }
];

export default function CustomizationPanel({ background, onBackgroundChange }: CustomizationPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold font-dm-sans text-gray-900 mb-4 flex items-center gap-2">
        <Palette className="w-4 h-4 text-red-600" />
        Background Style
      </h3>

      {/* Background Type Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onBackgroundChange({ type: 'solid', color: SOLID_COLORS[0].color })}
          className={`flex-1 px-3 py-2 rounded-md text-xs font-medium font-dm-sans transition-all ${
            background.type === 'solid'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Solid
        </button>
        <button
          onClick={() => onBackgroundChange({ 
            type: 'gradient', 
            color: '', 
            gradientFrom: GRADIENTS[0].from, 
            gradientTo: GRADIENTS[0].to 
          })}
          className={`flex-1 px-3 py-2 rounded-md text-xs font-medium font-dm-sans transition-all ${
            background.type === 'gradient'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Gradient
        </button>
      </div>

      {/* Solid Colors */}
      {background.type === 'solid' && (
        <div>
          <div className="grid grid-cols-4 gap-2">
            {SOLID_COLORS.map((item) => (
              <button
                key={item.color}
                onClick={() => onBackgroundChange({ type: 'solid', color: item.color })}
                className={`group relative h-12 rounded-lg transition-all ${
                  background.color === item.color
                    ? 'ring ring-black ring-offset-2'
                    : 'hover:scale-95'
                }`}
                style={{ backgroundColor: item.color }}
                title={item.name}
              >
                {background.color === item.color && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gradients */}
      {background.type === 'gradient' && (
        <div>
          <div className="grid grid-cols-2 gap-2">
            {GRADIENTS.map((grad, index) => (
              <button
                key={index}
                onClick={() => onBackgroundChange({ 
                  type: 'gradient', 
                  color: '', 
                  gradientFrom: grad.from, 
                  gradientTo: grad.to 
                })}
                className={`group relative h-12 rounded-lg transition-all ${
                  background.gradientFrom === grad.from && background.gradientTo === grad.to
                    ? 'ring ring-black ring-offset-2'
                    : 'hover:scale-95'
                }`}
                style={{
                  backgroundImage: `linear-gradient(135deg, ${grad.from}, ${grad.to})`
                }}
                title={grad.name}
              >
                {background.gradientFrom === grad.from && background.gradientTo === grad.to && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}