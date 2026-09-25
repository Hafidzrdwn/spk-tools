import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DecisiProjectState } from '@/types/domain';
import { useProjectStore } from './useProjectStore';

export interface TourStore {
  hasSeenWelcome: boolean;
  completedTours: Record<string, boolean>;
  activeTourId: string | null;
  activeStepIndex: number;
  stashedProjectState: DecisiProjectState | null;

  setHasSeenWelcome: (seen: boolean) => void;
  startTour: (tourId: string) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  skipTour: () => void;
  finishTour: (tourId: string) => void;
  resetAllTourProgress: () => void;
  restoreStashedProject: () => void;

  visitedTabs: string[];
  markTabVisited: (tab: string) => void;

  // Backward compatibility aliases
  markTourCompleted: (tourId: string) => void;
  resetTourProgress: () => void;
}

export const useTourStore = create<TourStore>()(
  persist(
    (set, get) => ({
      hasSeenWelcome: false,
      completedTours: {},
      activeTourId: null,
      activeStepIndex: 0,
      stashedProjectState: null,

      setHasSeenWelcome: (seen) => set({ hasSeenWelcome: seen }),

      startTour: (tourId) => {
        // Amankan snapshot data asli proyek user jika sudah ada kriteria/alternatif
        // agar tidak tertimpa permanen saat tour memuat data simulasi/template
        const currentProject = useProjectStore.getState();
        const hasUserData = currentProject.criteria.length > 0 || currentProject.alternatives.length > 0;
        let stashed: DecisiProjectState | null = null;

        if (hasUserData) {
          stashed = {
            title: currentProject.title,
            activeMethod: currentProject.activeMethod,
            criteria: JSON.parse(JSON.stringify(currentProject.criteria)),
            alternatives: JSON.parse(JSON.stringify(currentProject.alternatives)),
          };
        }

        set({
          activeTourId: tourId,
          activeStepIndex: 0,
          stashedProjectState: stashed,
        });
      },

      goToNextStep: () =>
        set((state) => ({
          activeStepIndex: state.activeStepIndex + 1,
        })),

      goToPrevStep: () =>
        set((state) => ({
          activeStepIndex: Math.max(0, state.activeStepIndex - 1),
        })),

      skipTour: () => {
        const { stashedProjectState } = get();
        if (stashedProjectState) {
          useProjectStore.getState().loadProjectState(stashedProjectState);
        }
        set({
          activeTourId: null,
          activeStepIndex: 0,
          stashedProjectState: null,
        });
      },

      finishTour: (tourId) => {
        const { stashedProjectState } = get();
        if (stashedProjectState) {
          useProjectStore.getState().loadProjectState(stashedProjectState);
        }
        set((state) => ({
          activeTourId: null,
          activeStepIndex: 0,
          stashedProjectState: null,
          completedTours: { ...state.completedTours, [tourId]: true },
        }));
      },

      restoreStashedProject: () => {
        const { stashedProjectState } = get();
        if (stashedProjectState) {
          useProjectStore.getState().loadProjectState(stashedProjectState);
          set({ stashedProjectState: null });
        }
      },

      visitedTabs: ['SAW'],

      markTabVisited: (tab) =>
        set((state) => ({
          visitedTabs: (state.visitedTabs || []).includes(tab)
            ? state.visitedTabs || ['SAW']
            : [...(state.visitedTabs || ['SAW']), tab],
        })),

      resetAllTourProgress: () =>
        set({
          hasSeenWelcome: false,
          completedTours: {},
          activeTourId: null,
          activeStepIndex: 0,
          stashedProjectState: null,
          visitedTabs: ['SAW'],
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
          stashedProjectState: null,
        }),
    }),
    {
      name: 'decisigraph-tour-state',
      version: 1,
      partialize: (state) => ({
        hasSeenWelcome: state.hasSeenWelcome,
        completedTours: state.completedTours,
        visitedTabs: state.visitedTabs,
        stashedProjectState: state.stashedProjectState,
      }),
    }
  )
);
