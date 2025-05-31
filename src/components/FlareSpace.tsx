
import React, { useState, useRef, useEffect, useMemo } from 'react';
import OptimizedFlare from './OptimizedFlare';
import ControlPanel from './ControlPanel';
import { useOptimizedFlarePhysics } from '../hooks/useOptimizedFlarePhysics';
import { useCursorTracking } from '../hooks/useCursorTracking';
import { FlareConfig } from '../types/flare';

const FlareSpace = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<FlareConfig>({
    density: 'moderate',
    type: 'plasma',
    colorProfile: 'aurora',
    sensitivity: 'responsive',
    size: 'standard'
  });

  const cursor = useCursorTracking(containerRef);
  const flares = useOptimizedFlarePhysics(config, cursor);

  // Viewport culling - only render flares that are visible
  const visibleFlares = useMemo(() => {
    const margin = 200; // Render flares slightly outside viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    return flares.map(flare => ({
      flare,
      isVisible: flare.x > -margin && 
                 flare.x < viewportWidth + margin && 
                 flare.y > -margin && 
                 flare.y < viewportHeight + margin
    }));
  }, [flares]);

  // Performance monitoring (optional - remove in production)
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        console.log(`FPS: ${fps}, Flares: ${flares.length}, Visible: ${visibleFlares.filter(v => v.isVisible).length}`);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    const rafId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(rafId);
  }, [flares.length, visibleFlares]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden cursor-none"
      style={{
        // Enable hardware acceleration for the container
        willChange: 'transform',
        transform: 'translate3d(0, 0, 0)'
      }}
    >
      {/* Optimized flares with viewport culling */}
      {visibleFlares.map(({ flare, isVisible }) => (
        <OptimizedFlare 
          key={flare.id} 
          data={flare} 
          config={config}
          cursor={cursor}
          isVisible={isVisible}
        />
      ))}

      {/* Custom cursor */}
      <div 
        className="absolute pointer-events-none z-50 w-6 h-6 border-2 border-white rounded-full opacity-60 transition-opacity duration-200"
        style={{
          left: cursor.x - 12,
          top: cursor.y - 12,
          opacity: cursor.isMoving ? 0.8 : 0.4,
          transform: `translate3d(0, 0, 0) scale(${cursor.isMoving ? 1.2 : 1})`,
          transition: 'transform 0.2s ease-out',
          willChange: 'transform'
        }}
      >
        <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Control Panel */}
      <ControlPanel config={config} onChange={setConfig} />
    </div>
  );
};

export default FlareSpace;
