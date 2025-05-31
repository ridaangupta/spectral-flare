
export interface FlareData {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  intensity: number;
  scale: number;
  rotation: number;
  rotationSpeed: number;
  colorIndex: number;
  sensitivity: number;
  attractionRadius: number;
  repulsionRadius: number;
  autonomy: number;
  pulsePhase: number;
  pulseSpeed: number;
}

export interface FlareConfig {
  density: 'minimal' | 'light' | 'moderate' | 'dense' | 'extreme';
  type: 'plasma' | 'crystal' | 'nebula' | 'electric' | 'liquid';
  colorProfile: 'aurora' | 'inferno' | 'cosmic' | 'neon' | 'monochrome';
  sensitivity: 'subtle' | 'responsive' | 'dynamic' | 'intense' | 'chaotic';
  size: 'micro' | 'compact' | 'standard' | 'large' | 'massive';
}

export interface CursorData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isMoving: boolean;
  pressure: number;
}
