
import React, { useState, useRef, useEffect } from 'react';
import Flare from './Flare';
import ControlPanel from './ControlPanel';
import { useFlarePhysics } from '../hooks/useFlarePhysics';
import { useCursorTracking } from '../hooks/useCursorTracking';
import { FlareConfig, FlareData } from '../types/flare';

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
  const flares = useFlarePhysics(config, cursor);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden cursor-none"
    >
      {/* Flares */}
      {flares.map((flare) => (
        <Flare 
          key={flare.id} 
          data={flare} 
          config={config}
          cursor={cursor}
        />
      ))}

      {/* Custom cursor */}
      <div 
        className="absolute pointer-events-none z-50 w-6 h-6 border-2 border-white rounded-full opacity-60 transition-opacity duration-200"
        style={{
          left: cursor.x - 12,
          top: cursor.y - 12,
          opacity: cursor.isMoving ? 0.8 : 0.4,
          transform: `scale(${cursor.isMoving ? 1.2 : 1})`,
          transition: 'transform 0.2s ease-out'
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
