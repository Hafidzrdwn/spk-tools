import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TourStore {
  hasSeenWelcome: boolean;
  completedTours: Record<string, boolean>;
  setHasSeenWelcome: (seen: boolean) => void;
  markTourCompleted: (tourId: string) => void;
  resetTourProgress: () => void;
}

export const useTourStore = create<TourStore>()(
  persist(
    (set) => ({
      hasSeenWelcome: false,
      completedTours: {},

      setHasSeenWelcome: (seen) => set({ hasSeenWelcome: seen }),

      markTourCompleted: (tourId) =>
        set((state) => ({
          completedTours: { ...state.completedTours, [tourId]: true },
        })),

      resetTourProgress: () =>
        set({
          hasSeenWelcome: false,
          completedTours: {},
        }),
    }),
    {
      name: 'decisigraph-tour-state',
      version: 1,
    }
  )
);
