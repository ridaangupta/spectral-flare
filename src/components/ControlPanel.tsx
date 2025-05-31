
import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { FlareConfig } from '../types/flare';

interface ControlPanelProps {
  config: FlareConfig;
  onChange: (config: FlareConfig) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ config, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const densityOptions = [
    { value: 'minimal', label: 'Minimal', count: '8-12' },
    { value: 'light', label: 'Light', count: '15-25' },
    { value: 'moderate', label: 'Moderate', count: '30-45' },
    { value: 'dense', label: 'Dense', count: '50-70' },
    { value: 'extreme', label: 'Extreme', count: '80-100' }
  ];

  const typeOptions = [
    { value: 'plasma', label: 'Plasma', desc: 'Smooth organic blobs' },
    { value: 'crystal', label: 'Crystal', desc: 'Sharp geometric forms' },
    { value: 'nebula', label: 'Nebula', desc: 'Wispy cloud effects' },
    { value: 'electric', label: 'Electric', desc: 'Crackling energy' },
    { value: 'liquid', label: 'Liquid', desc: 'Fluid mercury-like' }
  ];

  const colorOptions = [
    { value: 'aurora', label: 'Aurora', colors: ['#00D4FF', '#0099CC', '#6B46C1'] },
    { value: 'inferno', label: 'Inferno', colors: ['#FF4500', '#FF8C00', '#FFD700'] },
    { value: 'cosmic', label: 'Cosmic', colors: ['#8B5CF6', '#EC4899', '#3B82F6'] },
    { value: 'neon', label: 'Neon', colors: ['#FF1493', '#00FF7F', '#00FFFF'] },
    { value: 'monochrome', label: 'Monochrome', colors: ['#FFFFFF', '#D1D5DB', '#6B7280'] }
  ];

  const sensitivityOptions = [
    { value: 'subtle', label: 'Subtle' },
    { value: 'responsive', label: 'Responsive' },
    { value: 'dynamic', label: 'Dynamic' },
    { value: 'intense', label: 'Intense' },
    { value: 'chaotic', label: 'Chaotic' }
  ];

  const sizeOptions = [
    { value: 'micro', label: 'Micro', size: '20-40px' },
    { value: 'compact', label: 'Compact', size: '40-80px' },
    { value: 'standard', label: 'Standard', size: '80-120px' },
    { value: 'large', label: 'Large', size: '120-180px' },
    { value: 'massive', label: 'Massive', size: '180-300px' }
  ];

  const handleConfigChange = (key: keyof FlareConfig, value: string) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Toggle Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-full p-3 text-white hover:bg-white/10 transition-all duration-300"
        >
          {isExpanded ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
        </button>
      </div>

      {/* Control Panel */}
      <div className={`bg-black/30 backdrop-blur-md border-t border-white/20 transition-all duration-500 ${isExpanded ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* Density Control */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Density</h3>
              <div className="space-y-2">
                {densityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleConfigChange('density', option.value)}
                    className={`w-full text-left p-2 rounded transition-all duration-200 ${
                      config.density === option.value
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs opacity-60">{option.count} flares</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Type Control */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Type</h3>
              <div className="space-y-2">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleConfigChange('type', option.value)}
                    className={`w-full text-left p-2 rounded transition-all duration-200 ${
                      config.type === option.value
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs opacity-60">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Control */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Colors</h3>
              <div className="space-y-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleConfigChange('colorProfile', option.value)}
                    className={`w-full text-left p-2 rounded transition-all duration-200 ${
                      config.colorProfile === option.value
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="flex space-x-1 mt-1">
                      {option.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sensitivity Control */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Sensitivity</h3>
              <div className="space-y-2">
                {sensitivityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleConfigChange('sensitivity', option.value)}
                    className={`w-full text-left p-2 rounded transition-all duration-200 ${
                      config.sensitivity === option.value
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Control */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Size</h3>
              <div className="space-y-2">
                {sizeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleConfigChange('size', option.value)}
                    className={`w-full text-left p-2 rounded transition-all duration-200 ${
                      config.size === option.value
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs opacity-60">{option.size}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
