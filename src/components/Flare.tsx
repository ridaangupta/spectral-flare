
import React, { useEffect, useRef } from 'react';
import { FlareData, FlareConfig, CursorData } from '../types/flare';
import { getFlareColors, getFlareSize } from '../utils/flareUtils';

interface FlareProps {
  data: FlareData;
  config: FlareConfig;
  cursor: CursorData;
}

const Flare: React.FC<FlareProps> = ({ data, config, cursor }) => {
  const flareRef = useRef<HTMLDivElement>(null);
  const colors = getFlareColors(config.colorProfile);
  const baseSize = getFlareSize(config.size);

  const getFlareStyle = () => {
    const distance = Math.sqrt(
      Math.pow(cursor.x - data.x, 2) + Math.pow(cursor.y - data.y, 2)
    );
    
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
      transform: `rotate(${data.rotation}deg) scale(${1 + influence * 0.3})`,
      transition: 'transform 0.1s ease-out, opacity 0.2s ease-out',
      background: getFlareBackground(config.type, primaryColor, secondaryColor, influence),
      filter: `blur(${Math.max(0, 2 - influence * 2)}px) brightness(${1 + influence * 0.5})`,
      borderRadius: getFlareShape(config.type),
      animation: `flareFloat ${3 + data.id % 3}s ease-in-out infinite`,
      animationDelay: `${(data.id % 10) * 0.2}s`,
      pointerEvents: 'none' as const,
      zIndex: Math.floor(data.intensity * 10)
    };
  };

  const getFlareBackground = (type: string, primary: string, secondary: string, influence: number) => {
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
      case 'plasma':
        return '50%';
      case 'crystal':
        return '20%';
      case 'nebula':
        return '60%';
      case 'electric':
        return '30%';
      case 'liquid':
        return '40%';
      default:
        return '50%';
    }
  };

  return (
    <div
      ref={flareRef}
      style={getFlareStyle()}
      className="select-none"
    />
  );
};

export default Flare;
