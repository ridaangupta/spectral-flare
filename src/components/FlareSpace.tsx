
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import OptimizedFlare from './OptimizedFlare';
import ControlPanel from './ControlPanel';
import SortModeTutorial from './SortModeTutorial';
import SortSuccessModal from './SortSuccessModal';
import MobileWarning from './MobileWarning';
import { useOptimizedFlarePhysics } from '../hooks/useOptimizedFlarePhysics';
import { useCursorTracking } from '../hooks/useCursorTracking';
import { useIsMobile } from '../hooks/use-mobile';
import { FlareConfig } from '../types/flare';
import { getMutedBackgroundColors } from '../utils/flareUtils';

const FlareSpace = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const [config, setConfig] = useState<FlareConfig>({
    density: 'moderate',
    type: 'plasma',
    colorProfile: 'aurora',
    sensitivity: 'responsive',
    size: 'standard',
    sortMode: false
  });

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [dontShowTutorialAgain, setDontShowTutorialAgain] = useState(false);

  // Sort success state
  const [showSortSuccess, setShowSortSuccess] = useState(false);
  const [hasShownSuccessForCurrentSort, setHasShownSuccessForCurrentSort] = useState(false);

  // Reset trigger state
  const [resetTrigger, setResetTrigger] = useState(0);

  const cursor = useCursorTracking(containerRef);
  const flares = useOptimizedFlarePhysics(config, cursor, resetTrigger);

  // Check if all flares are sorted in their correct quadrants
  const checkSortCompletion = useMemo(() => {
    if (!config.sortMode || flares.length === 0) return false;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;

    // Define quadrants based on color index
    const isInCorrectQuadrant = (flare: any) => {
      const isLeft = flare.x < centerX;
      const isTop = flare.y < centerY;
      
      // Quadrant mapping: 0=top-left, 1=top-right, 2=bottom-left, 3=bottom-right
      if (flare.colorIndex === 0) return isLeft && isTop;     // Top-left
      if (flare.colorIndex === 1) return !isLeft && isTop;   // Top-right
      if (flare.colorIndex === 2) return isLeft && !isTop;   // Bottom-left
      if (flare.colorIndex === 3) return !isLeft && !isTop;  // Bottom-right
      
      return false;
    };

    return flares.every(isInCorrectQuadrant);
  }, [config.sortMode, flares]);

  // Show success modal when sorting is complete
  useEffect(() => {
    if (checkSortCompletion && !hasShownSuccessForCurrentSort) {
      // Add a small delay to make the success feel more natural
      const timer = setTimeout(() => {
        setShowSortSuccess(true);
        setHasShownSuccessForCurrentSort(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [checkSortCompletion, hasShownSuccessForCurrentSort]);

  // Handle sort mode toggle and show tutorial if needed
  const handleSortModeToggle = (checked: boolean) => {
    setConfig(prev => ({ ...prev, sortMode: checked }));
    setHasShownSuccessForCurrentSort(false);
    
    // Show tutorial when enabling sort mode (if user hasn't opted out)
    if (checked && !dontShowTutorialAgain) {
      setShowTutorial(true);
    }
  };

  const handleTutorialClose = () => {
    setShowTutorial(false);
  };

  const handleDontShowAgain = (checked: boolean) => {
    setDontShowTutorialAgain(checked);
  };

  const handleReset = () => {
    setResetTrigger(prev => prev + 1);
    setHasShownSuccessForCurrentSort(false);
    setShowSortSuccess(false);
  };

  const handleTryAgain = () => {
    setShowSortSuccess(false);
    handleReset();
  };

  // Viewport culling - only render flares that are visible
  const visibleFlares = useMemo(() => {
    const margin = 200;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    return flares.map(flare => {
      // In sort mode, flares keep their original random color assignment
      // In normal mode, use the original behavior
      const flareWithColor = config.sortMode 
        ? { ...flare } // Keep original colorIndex assigned during creation
        : { ...flare }; // Normal mode behavior (unchanged)

      return {
        flare: flareWithColor,
        isVisible: flare.x > -margin && 
                   flare.x < viewportWidth + margin && 
                   flare.y > -margin && 
                   flare.y < viewportHeight + margin
      };
    });
  }, [flares, config.sortMode]);

  // Background quadrants for sort mode
  const backgroundColors = useMemo(() => {
    if (!config.sortMode) return null;
    return getMutedBackgroundColors(config.colorProfile);
  }, [config.sortMode, config.colorProfile]);

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

  if (isMobile) {
    return <MobileWarning />;
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden cursor-none ${!config.sortMode ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800' : ''}`}
      style={{
        willChange: 'transform',
        transform: 'translate3d(0, 0, 0)',
        ...(config.sortMode && backgroundColors ? {
          background: `
            conic-gradient(from 0deg at 50% 50%, 
              ${backgroundColors[0]} 0deg 90deg,
              ${backgroundColors[1]} 90deg 180deg,
              ${backgroundColors[2]} 180deg 270deg,
              ${backgroundColors[3]} 270deg 360deg
            )`
        } : {})
      }}
    >
      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-3">
        {/* Reset Button */}
        <Button
          onClick={handleReset}
          variant="outline"
          size="icon"
          className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-white/10 hover:text-white"
        >
          <RotateCcw size={20} />
        </Button>

        {/* Sort Mode Toggle */}
        <div className="flex items-center space-x-3 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
          <span className="text-white text-sm font-medium">Sort Mode</span>
          <Switch
            checked={config.sortMode}
            onCheckedChange={handleSortModeToggle}
          />
        </div>
      </div>

      {/* Sort Mode Tutorial Dialog */}
      <SortModeTutorial
        isOpen={showTutorial}
        onClose={handleTutorialClose}
        onDontShowAgain={handleDontShowAgain}
      />

      {/* Sort Success Modal */}
      <SortSuccessModal
        isOpen={showSortSuccess}
        onTryAgain={handleTryAgain}
      />

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

      {/* Footer */}
      <footer className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <p className="text-white/40 text-sm">
          Created by{' '}
          <a
            href="https://www.linkedin.com/in/ridaan-gupta-51966b305/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/60 transition-colors duration-200 underline decoration-white/20 hover:decoration-white/40"
          >
            Ridaan Gupta
          </a>
        </p>
      </footer>
    </div>
  );
};

export default FlareSpace;
