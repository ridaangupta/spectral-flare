
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
      default:
        return `radial-gradient(circle, ${primary} 0%, ${secondary} 50%, transparent 70%)`;
    }
  };

  const getFlareShape = (type: string) => {
    switch (type) {
      case 'plasma': return '50%';
      case 'crystal': return '20%';
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
          return Math.max(0, 0.5 - influence * 0.5);
        case 'crystal':
          return 0; // No blur for crystal
        case 'nebula':
          return 0; // No blur for spiky star effect
        case 'electric':
          return Math.max(0, 0.3 - influence * 0.3); // Minimal blur for comet tail
        case 'liquid':
          return Math.max(0, 0.8 - influence * 0.8);
        default:
          return Math.max(0, 1 - influence * 1);
      }
    };

    // For standard flare types (plasma, crystal)
    if (config.type === 'plasma' || config.type === 'crystal') {
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
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden' as const,
        perspective: 1000,
      };
    }

    // Base positioning for special effects
    return {
      position: 'absolute' as const,
      left: data.x,
      top: data.y,
      opacity: finalIntensity,
      transform: `translate3d(-50%, -50%, 0) scale(${1 + influence * 0.3})`,
      pointerEvents: 'none' as const,
      zIndex: Math.floor(data.intensity * 10),
      willChange: 'transform, opacity',
    };
  }, [data, config, cursor, colors, baseSize]);

  // Render spiky star effect for nebula type
  if (config.type === 'nebula') {
    const primaryColor = colors[data.colorIndex % colors.length];
    const spikeCount = 12;
    const spikeLength = baseSize * data.scale * 0.8;
    const innerRadius = baseSize * data.scale * 0.15;
    
    return (
      <div style={getFlareStyle}>
        {/* Central bright core */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: innerRadius,
            height: innerRadius,
            background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
            borderRadius: '50%',
            filter: 'brightness(1.5)',
          }}
        />
        
        {/* Radiating spikes */}
        {Array.from({ length: spikeCount }).map((_, i) => {
          const angle = (360 / spikeCount) * i + data.rotation;
          const spikeWidth = 2 + Math.sin(data.pulsePhase + i) * 1;
          const dynamicLength = spikeLength * (0.7 + Math.sin(data.pulsePhase * 2 + i * 0.5) * 0.3);
          
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: spikeWidth,
                height: dynamicLength,
                background: `linear-gradient(to bottom, ${primaryColor} 0%, transparent 100%)`,
                transformOrigin: 'center top',
                transform: `translate(-50%, -${innerRadius/2}px) rotate(${angle}deg)`,
                filter: 'blur(0.5px)',
              }}
            />
          );
        })}
      </div>
    );
  }

  // Render comet effect for electric type
  if (config.type === 'electric') {
    const primaryColor = colors[data.colorIndex % colors.length];
    const secondaryColor = config.sortMode ? primaryColor : colors[(data.colorIndex + 1) % colors.length];
    const headSize = baseSize * data.scale * 0.3;
    const tailLength = baseSize * data.scale * 1.5;
    const tailWidth = headSize * 0.8;
    
    return (
      <div style={getFlareStyle}>
        {/* Comet head */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: headSize,
            height: headSize,
            background: `radial-gradient(circle, ${primaryColor} 0%, ${secondaryColor} 60%, transparent 100%)`,
            borderRadius: '50%',
            filter: 'brightness(1.3)',
          }}
        />
        
        {/* Comet tail */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: tailWidth,
            height: tailLength,
            background: `linear-gradient(to bottom, ${primaryColor}80 0%, ${secondaryColor}40 50%, transparent 100%)`,
            transformOrigin: 'center top',
            transform: `translate(-50%, -${headSize/2}px) rotate(${data.rotation + 180}deg)`,
            borderRadius: '50% 50% 0 0',
            filter: 'blur(1px)',
          }}
        />
        
        {/* Additional tail wisp for more firework-like effect */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: tailWidth * 0.5,
            height: tailLength * 1.3,
            background: `linear-gradient(to bottom, ${secondaryColor}60 0%, transparent 70%)`,
            transformOrigin: 'center top',
            transform: `translate(-50%, -${headSize/2}px) rotate(${data.rotation + 185}deg)`,
            borderRadius: '50% 50% 0 0',
            filter: 'blur(2px)',
          }}
        />
      </div>
    );
  }

  // Render pulsing ring effect for liquid type
  if (config.type === 'liquid') {
    const primaryColor = colors[data.colorIndex % colors.length];
    const secondaryColor = config.sortMode ? primaryColor : colors[(data.colorIndex + 1) % colors.length];
    const coreSize = baseSize * data.scale * 0.4;
    const ringSize = baseSize * data.scale * 0.8;
    const outerRingSize = ringSize * (1.2 + Math.sin(data.pulsePhase) * 0.3);
    
    return (
      <div style={getFlareStyle}>
        {/* Central core */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: coreSize,
            height: coreSize,
            background: `radial-gradient(circle, ${primaryColor} 0%, ${secondaryColor} 80%, transparent 100%)`,
            borderRadius: '50%',
            filter: 'brightness(1.2)',
          }}
        />
        
        {/* Inner ring */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: ringSize,
            height: ringSize,
            background: `conic-gradient(${primaryColor}40, ${secondaryColor}40, ${primaryColor}40)`,
            borderRadius: '50%',
            filter: 'blur(2px)',
            opacity: 0.7,
          }}
        />
        
        {/* Outer pulsing ring */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: outerRingSize,
            height: outerRingSize,
            background: `radial-gradient(circle, transparent 60%, ${secondaryColor}30 70%, transparent 90%)`,
            borderRadius: '50%',
            filter: 'blur(3px)',
            opacity: 0.5 + Math.sin(data.pulsePhase * 2) * 0.3,
          }}
        />
      </div>
    );
  }

  // Fallback for any other types
  return (
    <div
      style={getFlareStyle}
      className="select-none"
    />
  );
};

export default React.memo(OptimizedFlare);
