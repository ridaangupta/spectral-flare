
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
  density: string;
  type: string;
  colorProfile: string;
  sensitivity: string;
  size: string;
  sortMode: boolean;
}

export interface CursorData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isMoving: boolean;
  pressure: number;
}
