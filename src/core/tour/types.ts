import type { DecisiProjectState } from '@/types/domain';

export interface TourStep {
  id: string;
  targetSelector: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  preNavigate?: () => void;
  onLeave?: () => void;
  resetOnBack?: () => void;
  requiredAction?: {
    description: string;
    isSatisfied: (projectState?: DecisiProjectState) => boolean;
  };
}

export interface TourDefinition {
  id: 'general' | 'saw' | 'wp' | 'topsis' | 'ahp' | 'story';
  title: string;
  steps: TourStep[];
}
