
import React, { useMemo } from 'react';
import { FlareData, FlareConfig, CursorData } from '../types/flare';
import { getFlareColors, getFlareSize } from '../utils/flareUtils';

interface OptimizedFlareProps {
  data: FlareData;
  config: FlareConfig;
  cursor: CursorData;
  isVisible: boolean;
}

const OptimizedFlare: React.FC<OptimizedFlareProps> = ({ data, config, cursor, isVisible }) => {
  const colors = useMemo(() => getFlareColors(config.colorProfile), [config.colorProfile]);
  const baseSize = useMemo(() => getFlareSize(config.size), [config.size]);

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
    const secondaryColor = colors[(data.colorIndex + 1) % colors.length];
    
    return {
      position: 'absolute' as const,
      left: data.x - (baseSize * sizeMultiplier * data.scale) / 2,
      top: data.y - (baseSize * sizeMultiplier * data.scale) / 2,
      width: baseSize * sizeMultiplier * data.scale,
      height: baseSize * sizeMultiplier * data.scale,
      opacity: Math.min(1, data.intensity * intensityMultiplier),
      transform: `translate3d(0, 0, 0) rotate(${data.rotation}deg) scale(${1 + influence * 0.3})`,
      background: getFlareBackground(config.type, primaryColor, secondaryColor),
      filter: `blur(${Math.max(0, 2 - influence * 2)}px) brightness(${1 + influence * 0.5})`,
      borderRadius: getFlareShape(config.type),
      pointerEvents: 'none' as const,
      zIndex: Math.floor(data.intensity * 10),
      // GPU acceleration
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden' as const,
      perspective: 1000,
    };
  }, [data, config, cursor, colors, baseSize]);

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

  return (
    <div
      style={getFlareStyle}
      className="select-none"
    />
  );
};

export default React.memo(OptimizedFlare);
