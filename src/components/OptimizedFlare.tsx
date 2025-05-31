
import React, { useMemo } from 'react';
import { FlareData, FlareConfig, CursorData } from '../types/flare';
import { getFlareColors, getSortModeColors, getFlareSize } from '../utils/flareUtils';

interface OptimizedFlareProps {
  data: FlareData;
  config: FlareConfig;
  cursor: CursorData;
  isVisible: boolean;
}

const OptimizedFlare: React.FC<OptimizedFlareProps> = ({ data, config, cursor, isVisible }) => {
  const colors = useMemo(() => {
    return config.sortMode ? getSortModeColors(config.colorProfile) : getFlareColors(config.colorProfile);
  }, [config.colorProfile, config.sortMode]);
  
  const baseSize = useMemo(() => getFlareSize(config.size), [config.size]);

  // Define helper functions before using them
  const getFlareBackground = (type: string, primary: string, secondary: string) => {
    switch (type) {
      case 'plasma':
        return `radial-gradient(circle, ${primary} 0%, ${secondary} 40%, transparent 70%)`;
      case 'crystal':
        return `conic-gradient(${primary}, ${secondary}, ${primary})`;
      case 'nebula':
        return `radial-gradient(ellipse, ${primary} 0%, ${secondary} 30%, transparent 60%)`;
      case 'electric':
        return `radial-gradient(circle, ${primary} 0%, ${secondary} 20%, transparent 50%)`;
      case 'liquid':
        return `radial-gradient(circle, ${primary} 20%, ${secondary} 60%, transparent 80%)`;
      default:
        return `radial-gradient(circle, ${primary} 0%, ${secondary} 50%, transparent 70%)`;
    }
  };

  const getFlareShape = (type: string) => {
    switch (type) {
      case 'plasma': return '50%';
      case 'crystal': return '20%';
      case 'nebula': return '60%';
      case 'electric': return '30%';
      case 'liquid': return '40%';
      default: return '50%';
    }
  };

  // Viewport culling - don't render if not visible
  if (!isVisible) {
    return null;
  }

  const getFlareStyle = useMemo(() => {
    // Use squared distance for performance
    const dx = cursor.x - data.x;
    const dy = cursor.y - data.y;
    const distanceSquared = dx * dx + dy * dy;
    const distance = Math.sqrt(distanceSquared);
    
    const influence = Math.max(0, 1 - distance / 300);
    const intensityMultiplier = 1 + influence * data.sensitivity;
    const sizeMultiplier = 1 + influence * 0.5;
    
    const primaryColor = colors[data.colorIndex % colors.length];
    const secondaryColor = config.sortMode ? primaryColor : colors[(data.colorIndex + 1) % colors.length];
    
    // In sort mode, use fixed intensity without pulsing
    const finalIntensity = config.sortMode 
      ? Math.min(1, data.intensity * intensityMultiplier)
      : Math.min(1, data.intensity * intensityMultiplier);
    
    // Reduced blur for cleaner edges, especially for plasma and nebula types
    const getBlurAmount = (type: string, influence: number) => {
      switch (type) {
        case 'plasma':
          return Math.max(0, 0.5 - influence * 0.5); // Reduced from 2
        case 'nebula':
          return Math.max(0, 0.8 - influence * 0.8); // Reduced from 2
        case 'electric':
          return Math.max(0, 1 - influence * 1);
        case 'liquid':
          return Math.max(0, 1.2 - influence * 1.2);
        case 'crystal':
          return 0; // No blur for crystal
        default:
          return Math.max(0, 1 - influence * 1);
      }
    };
    
    return {
      position: 'absolute' as const,
      left: data.x - (baseSize * sizeMultiplier * data.scale) / 2,
      top: data.y - (baseSize * sizeMultiplier * data.scale) / 2,
      width: baseSize * sizeMultiplier * data.scale,
      height: baseSize * sizeMultiplier * data.scale,
      opacity: finalIntensity,
      transform: `translate3d(0, 0, 0) rotate(${data.rotation}deg) scale(${1 + influence * 0.3})`,
      background: getFlareBackground(config.type, primaryColor, secondaryColor),
      filter: `blur(${getBlurAmount(config.type, influence)}px) brightness(${1 + influence * 0.5})`,
      borderRadius: getFlareShape(config.type),
      pointerEvents: 'none' as const,
      zIndex: Math.floor(data.intensity * 10),
      // GPU acceleration
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden' as const,
      perspective: 1000,
    };
  }, [data, config, cursor, colors, baseSize]);

  return (
    <div
      style={getFlareStyle}
      className="select-none"
    />
  );
};

export default React.memo(OptimizedFlare);
