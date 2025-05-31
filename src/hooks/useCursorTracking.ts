
import { useState, useEffect, useRef, RefObject } from 'react';
import { CursorData } from '../types/flare';

export const useCursorTracking = (containerRef: RefObject<HTMLElement>): CursorData => {
  const [cursor, setCursor] = useState<CursorData>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    isMoving: false,
    pressure: 0
  });

  const lastPosition = useRef({ x: 0, y: 0, time: Date.now() });
  const movementTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const now = Date.now();
      const deltaTime = now - lastPosition.current.time;
      const deltaX = x - lastPosition.current.x;
      const deltaY = y - lastPosition.current.y;
      
      const vx = deltaTime > 0 ? deltaX / deltaTime * 16 : 0; // Normalize to 60fps
      const vy = deltaTime > 0 ? deltaY / deltaTime * 16 : 0;
      
      const speed = Math.sqrt(vx * vx + vy * vy);
      const pressure = Math.min(1, speed / 10);

      setCursor({
        x,
        y,
        vx,
        vy,
        isMoving: true,
        pressure
      });

      lastPosition.current = { x, y, time: now };

      // Clear existing timeout
      if (movementTimeout.current) {
        clearTimeout(movementTimeout.current);
      }

      // Set movement to false after no movement for 100ms
      movementTimeout.current = setTimeout(() => {
        setCursor(prev => ({ ...prev, isMoving: false, vx: 0, vy: 0 }));
      }, 100);
    };

    const handleMouseLeave = () => {
      setCursor(prev => ({ ...prev, isMoving: false, vx: 0, vy: 0 }));
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (movementTimeout.current) {
        clearTimeout(movementTimeout.current);
      }
    };
  }, [containerRef]);

  return cursor;
};
