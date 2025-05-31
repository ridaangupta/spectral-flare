
import { useState, useEffect, useRef, useCallback } from 'react';
import { FlareData, FlareConfig, CursorData } from '../types/flare';

export const useOptimizedFlarePhysics = (config: FlareConfig, cursor: CursorData): FlareData[] => {
  const [flares, setFlares] = useState<FlareData[]>([]);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const spatialGridRef = useRef<Map<string, FlareData[]>>(new Map());
  const GRID_SIZE = 100; // Grid cell size for spatial partitioning

  const getFlareCount = (density: string): number => {
    switch (density) {
      case 'minimal': return 64 + Math.floor(Math.random() * 40);
      case 'light': return 120 + Math.floor(Math.random() * 88);
      case 'moderate': return 240 + Math.floor(Math.random() * 128);
      case 'dense': return 400 + Math.floor(Math.random() * 168);
      case 'extreme': return 640 + Math.floor(Math.random() * 168);
      default: return 240;
    }
  };

  const getSensitivityMultiplier = (sensitivity: string): number => {
    switch (sensitivity) {
      case 'subtle': return 0.5;
      case 'responsive': return 1.0;
      case 'dynamic': return 1.5;
      case 'intense': return 2.5;
      case 'chaotic': return 4.0;
      default: return 1.0;
    }
  };

  // Spatial partitioning helpers
  const getGridKey = (x: number, y: number): string => {
    const gridX = Math.floor(x / GRID_SIZE);
    const gridY = Math.floor(y / GRID_SIZE);
    return `${gridX},${gridY}`;
  };

  const updateSpatialGrid = useCallback((flares: FlareData[]) => {
    const grid = new Map<string, FlareData[]>();
    
    flares.forEach(flare => {
      const key = getGridKey(flare.x, flare.y);
      if (!grid.has(key)) {
        grid.set(key, []);
      }
      grid.get(key)!.push(flare);
    });
    
    spatialGridRef.current = grid;
  }, []);

  const createFlare = (id: number): FlareData => {
    const margin = 100;
    const x = margin + Math.random() * (window.innerWidth - margin * 2);
    const y = margin + Math.random() * (window.innerHeight - margin * 2);
    
    return {
      id,
      x,
      y,
      vx: (Math.random() - 0.5) * 1,
      vy: (Math.random() - 0.5) * 1,
      intensity: 0.6 + Math.random() * 0.4,
      scale: 0.7 + Math.random() * 1.0,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
      colorIndex: Math.floor(Math.random() * 5),
      sensitivity: 0.7 + Math.random() * 0.3,
      attractionRadius: 150 + Math.random() * 100,
      repulsionRadius: 80 + Math.random() * 40,
      autonomy: 0.3 + Math.random() * 0.4,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.02
    };
  };

  // Optimized distance calculation using squared distance to avoid sqrt
  const getSquaredDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
  };

  // Initialize flares when config changes
  useEffect(() => {
    const count = getFlareCount(config.density);
    const newFlares = Array.from({ length: count }, (_, i) => createFlare(i));
    setFlares(newFlares);
    updateSpatialGrid(newFlares);
  }, [config.density, config.type, config.colorProfile, config.size, updateSpatialGrid]);

  // Optimized animation loop with delta time and throttling
  useEffect(() => {
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      
      // Throttle updates to 60fps maximum
      if (deltaTime < 16.67) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      
      lastTimeRef.current = currentTime;
      const deltaMultiplier = deltaTime / 16.67; // Normalize to 60fps

      setFlares(prevFlares => {
        const sensitivityMultiplier = getSensitivityMultiplier(config.sensitivity);
        const cursorXSquared = cursor.x * cursor.x;
        const cursorYSquared = cursor.y * cursor.y;
        
        const updatedFlares = prevFlares.map(flare => {
          // Use squared distance for cursor interaction
          const distanceSquared = getSquaredDistance(cursor.x, cursor.y, flare.x, flare.y);
          const repulsionRadiusSquared = flare.repulsionRadius * flare.repulsionRadius;
          
          let newVx = flare.vx;
          let newVy = flare.vy;
          
          // Repulsion force calculation
          if (distanceSquared < repulsionRadiusSquared && distanceSquared > 0) {
            const distance = Math.sqrt(distanceSquared); // Only sqrt when needed
            const repulsionForce = (1 - distance / flare.repulsionRadius) * 0.8 * sensitivityMultiplier;
            const invDistance = 1 / distance;
            
            // Normalized direction vector
            const dx = (cursor.x - flare.x) * invDistance;
            const dy = (cursor.y - flare.y) * invDistance;
            
            newVx -= dx * repulsionForce;
            newVy -= dy * repulsionForce;
          }
          
          // Autonomous movement
          const autonomousForce = flare.autonomy * 0.05 * deltaMultiplier;
          newVx += (Math.random() - 0.5) * autonomousForce;
          newVy += (Math.random() - 0.5) * autonomousForce;
          
          // Apply friction
          const friction = Math.pow(0.92, deltaMultiplier);
          newVx *= friction;
          newVy *= friction;
          
          // Update position
          let newX = flare.x + newVx * deltaMultiplier;
          let newY = flare.y + newVy * deltaMultiplier;
          
          // Boundary checking with bouncing
          const margin = 50;
          const maxX = window.innerWidth - margin;
          const maxY = window.innerHeight - margin;
          
          if (newX < margin) {
            newX = margin;
            newVx = Math.abs(newVx) * 0.7;
          } else if (newX > maxX) {
            newX = maxX;
            newVx = -Math.abs(newVx) * 0.7;
          }
          
          if (newY < margin) {
            newY = margin;
            newVy = Math.abs(newVy) * 0.7;
          } else if (newY > maxY) {
            newY = maxY;
            newVy = -Math.abs(newVy) * 0.7;
          }
          
          // Edge avoidance forces
          if (newX < margin * 2) newVx += 0.1 * deltaMultiplier;
          if (newX > maxX - margin) newVx -= 0.1 * deltaMultiplier;
          if (newY < margin * 2) newVy += 0.1 * deltaMultiplier;
          if (newY > maxY - margin) newVy -= 0.1 * deltaMultiplier;
          
          // Update rotation and pulse
          const newRotation = flare.rotation + flare.rotationSpeed * deltaMultiplier;
          const pulsePhase = flare.pulsePhase + flare.pulseSpeed * deltaMultiplier;
          const pulseIntensity = 1 + Math.sin(pulsePhase) * 0.2;
          const finalIntensity = Math.max(0.4, Math.min(1, flare.intensity * pulseIntensity));
          
          return {
            ...flare,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            rotation: newRotation,
            pulsePhase,
            intensity: finalIntensity
          };
        });
        
        // Update spatial grid for next frame
        updateSpatialGrid(updatedFlares);
        return updatedFlares;
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [config.sensitivity, cursor.x, cursor.y, cursor.isMoving, updateSpatialGrid]);

  return flares;
};
