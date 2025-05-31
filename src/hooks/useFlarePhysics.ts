
import { useState, useEffect, useRef } from 'react';
import { FlareData, FlareConfig, CursorData } from '../types/flare';

export const useFlarePhysics = (config: FlareConfig, cursor: CursorData): FlareData[] => {
  const [flares, setFlares] = useState<FlareData[]>([]);
  const animationFrameRef = useRef<number>();

  const getFlareCount = (density: string): number => {
    switch (density) {
      case 'minimal': return 8 + Math.floor(Math.random() * 5);
      case 'light': return 15 + Math.floor(Math.random() * 11);
      case 'moderate': return 30 + Math.floor(Math.random() * 16);
      case 'dense': return 50 + Math.floor(Math.random() * 21);
      case 'extreme': return 80 + Math.floor(Math.random() * 21);
      default: return 30;
    }
  };

  const getSensitivityMultiplier = (sensitivity: string): number => {
    switch (sensitivity) {
      case 'subtle': return 0.3;
      case 'responsive': return 0.6;
      case 'dynamic': return 1.0;
      case 'intense': return 1.5;
      case 'chaotic': return 2.5;
      default: return 1.0;
    }
  };

  const createFlare = (id: number): FlareData => {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    
    return {
      id,
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      intensity: 0.3 + Math.random() * 0.7,
      scale: 0.5 + Math.random() * 1.5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 4,
      colorIndex: Math.floor(Math.random() * 5),
      sensitivity: 0.5 + Math.random() * 0.5,
      attractionRadius: 100 + Math.random() * 200,
      repulsionRadius: 50 + Math.random() * 50,
      autonomy: Math.random(),
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03
    };
  };

  // Initialize flares when config changes
  useEffect(() => {
    const count = getFlareCount(config.density);
    const newFlares = Array.from({ length: count }, (_, i) => createFlare(i));
    setFlares(newFlares);
  }, [config.density]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setFlares(prevFlares => prevFlares.map(flare => {
        const sensitivityMultiplier = getSensitivityMultiplier(config.sensitivity);
        
        // Calculate distance to cursor
        const dx = cursor.x - flare.x;
        const dy = cursor.y - flare.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Cursor influence
        let newVx = flare.vx;
        let newVy = flare.vy;
        
        if (distance < flare.attractionRadius && cursor.isMoving) {
          const force = (1 - distance / flare.attractionRadius) * 0.5 * sensitivityMultiplier;
          const angle = Math.atan2(dy, dx);
          
          // Some flares are attracted, others repelled
          const direction = flare.sensitivity > 0.7 ? 1 : -1;
          newVx += Math.cos(angle) * force * direction * flare.sensitivity;
          newVy += Math.sin(angle) * force * direction * flare.sensitivity;
        }
        
        // Autonomous movement
        const autonomousForce = flare.autonomy * 0.1;
        newVx += (Math.random() - 0.5) * autonomousForce;
        newVy += (Math.random() - 0.5) * autonomousForce;
        
        // Apply friction
        newVx *= 0.95;
        newVy *= 0.95;
        
        // Update position
        let newX = flare.x + newVx;
        let newY = flare.y + newVy;
        
        // Bounce off edges
        if (newX < 0 || newX > window.innerWidth) {
          newVx *= -0.8;
          newX = Math.max(0, Math.min(window.innerWidth, newX));
        }
        if (newY < 0 || newY > window.innerHeight) {
          newVy *= -0.8;
          newY = Math.max(0, Math.min(window.innerHeight, newY));
        }
        
        // Update rotation
        const newRotation = flare.rotation + flare.rotationSpeed;
        
        // Pulse effect
        const pulsePhase = flare.pulsePhase + flare.pulseSpeed;
        const intensityMultiplier = 1 + Math.sin(pulsePhase) * 0.3;
        
        return {
          ...flare,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          rotation: newRotation,
          pulsePhase,
          intensity: Math.min(1, flare.intensity * intensityMultiplier)
        };
      }));
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [config.sensitivity, cursor]);

  return flares;
};
