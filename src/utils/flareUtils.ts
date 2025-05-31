
export const getFlareColors = (colorProfile: string): string[] => {
  switch (colorProfile) {
    case 'aurora':
      return ['#00D4FF', '#0099CC', '#6B46C1', '#10B981', '#3B82F6'];
    case 'inferno':
      return ['#FF4500', '#FF8C00', '#FFD700', '#DC2626', '#F59E0B'];
    case 'cosmic':
      return ['#8B5CF6', '#EC4899', '#3B82F6', '#A855F7', '#EF4444'];
    case 'neon':
      return ['#FF1493', '#00FF7F', '#00FFFF', '#FF6B35', '#7DF9FF'];
    case 'monochrome':
      return ['#FFFFFF', '#D1D5DB', '#9CA3AF', '#6B7280', '#F3F4F6'];
    default:
      return ['#00D4FF', '#0099CC', '#6B46C1', '#10B981', '#3B82F6'];
  }
};

export const getFlareSize = (size: string): number => {
  switch (size) {
    case 'micro': return 30;
    case 'compact': return 60;
    case 'standard': return 100;
    case 'large': return 150;
    case 'massive': return 240;
    default: return 100;
  }
};
