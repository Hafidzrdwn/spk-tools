import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type { DecisiProjectState, Criterion, Alternative, MethodId } from '@/types/domain';

export interface ProjectStore extends DecisiProjectState {
  // Actions Kriteria
  addCriterion: (initialData?: Partial<Criterion>) => void;
  removeCriterion: (id: string) => void;
  updateCriterion: (id: string, patch: Partial<Criterion>) => void;
  autoDistributeWeights: () => void;

  // Actions Alternatif
  addAlternative: (initialData?: Partial<Alternative>) => void;
  removeAlternative: (id: string) => void;
  updateCellValue: (alternativeId: string, criterionId: string, value: number) => void;

  // Actions Proyek & Navigasi
  setTitle: (title: string) => void;
  setActiveMethod: (method: MethodId) => void;
  loadProjectState: (state: DecisiProjectState) => void;
  resetProject: () => void;
}

const defaultInitialState: DecisiProjectState = {
  title: 'Proyek SPK Baru',
  activeMethod: 'SAW',
  criteria: [],
  alternatives: [],
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    immer((set) => ({
      ...defaultInitialState,

      addCriterion: (initialData) => {
        set((state) => {
          const id = initialData?.id ?? `crit_${nanoid(6)}`;
          const name = initialData?.name ?? `Kriteria ${state.criteria.length + 1}`;
          const type = initialData?.type ?? 'BENEFIT';
          const weight = initialData?.weight ?? 1;

          state.criteria.push({
            id,
            name,
            type,
            weight,
            normalizedWeight: 0,
          });

          state.alternatives.forEach((alt) => {
            if (alt.values[id] === undefined) {
              alt.values[id] = 0;
            }
          });
        });
      },

      removeCriterion: (id) => {
        set((state) => {
          state.criteria = state.criteria.filter((c) => c.id !== id);
          state.alternatives.forEach((alt) => {
            delete alt.values[id];
          });
        });
      },

      updateCriterion: (id, patch) => {
        set((state) => {
          const crit = state.criteria.find((c) => c.id === id);
          if (crit) {
            Object.assign(crit, patch);
          }
        });
      },

      autoDistributeWeights: () => {
        set((state) => {
          if (state.criteria.length === 0) return;
          state.criteria.forEach((crit) => {
            crit.weight = 1;
          });
        });
      },

      addAlternative: (initialData) => {
        set((state) => {
          const id = initialData?.id ?? `alt_${nanoid(6)}`;
          const name = initialData?.name ?? `Alternatif ${state.alternatives.length + 1}`;
          const values: Record<string, number> = { ...(initialData?.values ?? {}) };

          state.criteria.forEach((crit) => {
            if (values[crit.id] === undefined) {
              values[crit.id] = 0;
            }
          });

          state.alternatives.push({
            id,
            name,
            values,
          });
        });
      },

      removeAlternative: (id) => {
        set((state) => {
          state.alternatives = state.alternatives.filter((alt) => alt.id !== id);
        });
      },

      updateCellValue: (alternativeId, criterionId, value) => {
        set((state) => {
          const alt = state.alternatives.find((a) => a.id === alternativeId);
          if (alt) {
            alt.values[criterionId] = value;
          }
        });
      },

      setTitle: (title) => {
        set((state) => {
          state.title = title;
        });
      },

      setActiveMethod: (method) => {
        set((state) => {
          state.activeMethod = method;
        });
      },

      loadProjectState: (newState) => {
        set((state) => {
          state.title = newState.title;
          state.activeMethod = newState.activeMethod;
          state.criteria = newState.criteria;
          state.alternatives = newState.alternatives;
        });
      },

      resetProject: () => {
        useProjectStore.persist?.clearStorage();
        set((state) => {
          state.title = defaultInitialState.title;
          state.activeMethod = defaultInitialState.activeMethod;
          state.criteria = JSON.parse(JSON.stringify(defaultInitialState.criteria));
          state.alternatives = JSON.parse(JSON.stringify(defaultInitialState.alternatives));
        });
      },
    })),
    {
      name: 'decisigraph-project-state',
      version: 1,
      partialize: (state) => ({
        title: state.title,
        activeMethod: state.activeMethod,
        criteria: state.criteria,
        alternatives: state.alternatives,
      }),
      // TODO: migrate: (persisted, version) => persisted, // siapkan slot ini untuk breaking change di masa depan
    }
  )
);
