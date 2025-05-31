import { useState, useEffect, useRef } from 'react';
import { FlareData, FlareConfig, CursorData } from '../types/flare';

export const useFlarePhysics = (config: FlareConfig, cursor: CursorData): FlareData[] => {
  const [flares, setFlares] = useState<FlareData[]>([]);
  const animationFrameRef = useRef<number>();

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

  const createFlare = (id: number): FlareData => {
    const margin = 100; // Keep flares away from edges
    const x = margin + Math.random() * (window.innerWidth - margin * 2);
    const y = margin + Math.random() * (window.innerHeight - margin * 2);
    
    return {
      id,
      x,
      y,
      vx: (Math.random() - 0.5) * 1,
      vy: (Math.random() - 0.5) * 1,
      intensity: 0.6 + Math.random() * 0.4, // Minimum intensity to prevent vanishing
      scale: 0.7 + Math.random() * 1.0,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
      colorIndex: Math.floor(Math.random() * 5),
      sensitivity: 0.7 + Math.random() * 0.3, // Higher base sensitivity
      attractionRadius: 150 + Math.random() * 100,
      repulsionRadius: 80 + Math.random() * 40,
      autonomy: 0.3 + Math.random() * 0.4,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.02
    };
  };

  // Initialize flares when config changes
  useEffect(() => {
    const count = getFlareCount(config.density);
    const newFlares = Array.from({ length: count }, (_, i) => createFlare(i));
    setFlares(newFlares);
  }, [config.density, config.type, config.colorProfile, config.size]); // React to more config changes

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setFlares(prevFlares => prevFlares.map(flare => {
        const sensitivityMultiplier = getSensitivityMultiplier(config.sensitivity);
        
        // Calculate distance to cursor
        const dx = cursor.x - flare.x;
        const dy = cursor.y - flare.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Repulsion force - ALL flares are repelled by cursor
        let newVx = flare.vx;
        let newVy = flare.vy;
        
        if (distance < flare.repulsionRadius && distance > 0) {
          const repulsionForce = (1 - distance / flare.repulsionRadius) * 0.8 * sensitivityMultiplier;
          const angle = Math.atan2(dy, dx);
          
          // Push away from cursor
          newVx -= Math.cos(angle) * repulsionForce;
          newVy -= Math.sin(angle) * repulsionForce;
        }
        
        // Gentle autonomous movement to keep flares active
        const autonomousForce = flare.autonomy * 0.05;
        newVx += (Math.random() - 0.5) * autonomousForce;
        newVy += (Math.random() - 0.5) * autonomousForce;
        
        // Apply friction to prevent excessive speed
        newVx *= 0.92;
        newVy *= 0.92;
        
        // Update position
        let newX = flare.x + newVx;
        let newY = flare.y + newVy;
        
        // Keep flares on screen with proper boundaries
        const margin = 50;
        const maxX = window.innerWidth - margin;
        const maxY = window.innerHeight - margin;
        
        // Bounce off edges with damping
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
        
        // Gentle force to keep flares away from edges
        if (newX < margin * 2) newVx += 0.1;
        if (newX > maxX - margin) newVx -= 0.1;
        if (newY < margin * 2) newVy += 0.1;
        if (newY > maxY - margin) newVy -= 0.1;
        
        // Update rotation
        const newRotation = flare.rotation + flare.rotationSpeed;
        
        // Subtle pulse effect that doesn't make flares disappear
        const pulsePhase = flare.pulsePhase + flare.pulseSpeed;
        const pulseIntensity = 1 + Math.sin(pulsePhase) * 0.2; // Reduced pulse range
        
        // Ensure minimum intensity to prevent vanishing
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
      }));
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [config.sensitivity, cursor.x, cursor.y, cursor.isMoving]); // Optimized dependencies

  return flares;
};
