import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TourStore {
  hasSeenWelcome: boolean;
  completedTours: Record<string, boolean>;
  activeTourId: string | null;
  activeStepIndex: number;

  setHasSeenWelcome: (seen: boolean) => void;
  startTour: (tourId: string) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  skipTour: () => void;
  finishTour: (tourId: string) => void;
  resetAllTourProgress: () => void;

  // Backward compatibility aliases
  markTourCompleted: (tourId: string) => void;
  resetTourProgress: () => void;
}

export const useTourStore = create<TourStore>()(
  persist(
    (set) => ({
      hasSeenWelcome: false,
      completedTours: {},
      activeTourId: null,
      activeStepIndex: 0,

      setHasSeenWelcome: (seen) => set({ hasSeenWelcome: seen }),

      startTour: (tourId) =>
        set({
          activeTourId: tourId,
          activeStepIndex: 0,
        }),

      goToNextStep: () =>
        set((state) => ({
          activeStepIndex: state.activeStepIndex + 1,
        })),

      goToPrevStep: () =>
        set((state) => ({
          activeStepIndex: Math.max(0, state.activeStepIndex - 1),
        })),

      skipTour: () =>
        set({
          activeTourId: null,
          activeStepIndex: 0,
        }),

      finishTour: (tourId) =>
        set((state) => ({
          activeTourId: null,
          activeStepIndex: 0,
          completedTours: { ...state.completedTours, [tourId]: true },
        })),

      resetAllTourProgress: () =>
        set({
          hasSeenWelcome: false,
          completedTours: {},
          activeTourId: null,
          activeStepIndex: 0,
        }),

      markTourCompleted: (tourId) =>
        set((state) => ({
          completedTours: { ...state.completedTours, [tourId]: true },
        })),

      resetTourProgress: () =>
        set({
          hasSeenWelcome: false,
          completedTours: {},
          activeTourId: null,
          activeStepIndex: 0,
        }),
    }),
    {
      name: 'decisigraph-tour-state',
      version: 1,
      partialize: (state) => ({
        hasSeenWelcome: state.hasSeenWelcome,
        completedTours: state.completedTours,
      }),
    }
  )
);
