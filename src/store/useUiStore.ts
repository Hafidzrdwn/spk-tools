import { create } from 'zustand';
import type { MethodId } from '@/types/domain';
import { useTourStore } from './useTourStore';

export type EditorSection = 'matrix' | 'criteria' | 'alternatives';
export type NumberSeparator = 'comma' | 'dot';
export type AppView = 'landing' | 'board' | 'review' | 'analytics';

export interface UiStore {
  currentView: AppView;
  activeTab: MethodId;
  hoveredCellId: string | null;
  isInspectorOpen: boolean;
  isGlossaryOpen: boolean;
  glossaryTargetTerm: string | null;
  isWelcomeOpen: boolean;
  /** Format angka desimal: 'comma' (Indonesia: 3,14) atau 'dot' (Internasional: 3.14) */
  numberFormat: NumberSeparator;
  /** Section aktif di panel Shared Input (Matrix / Kriteria / Alternatif) */
  activeEditorSection: EditorSection;
  sawActiveStep: 1 | 2 | 3;
  wpActiveStep: 1 | 2 | 3;
  topsisActiveStep: 1 | 2 | 3;
  ahpActiveStep: 1 | 2 | 3;
  ahpCurrentCr: number;
  storyHasExtracted: boolean;
  storyMode: 'story' | 'form';
  isSharedMatrixCollapsed: boolean;
  setCurrentView: (view: AppView) => void;
  setHoveredCell: (id: string | null) => void;
  setActiveTab: (tab: MethodId) => void;
  setInspectorOpen: (open: boolean) => void;
  toggleInspector: () => void;
  openGlossary: (term?: string) => void;
  closeGlossary: () => void;
  openWelcome: () => void;
  closeWelcome: () => void;
  setNumberFormat: (format: NumberSeparator) => void;
  toggleNumberFormat: () => void;
  setActiveEditorSection: (section: EditorSection) => void;
  setSawActiveStep: (step: 1 | 2 | 3) => void;
  setWpActiveStep: (step: 1 | 2 | 3) => void;
  setTopsisActiveStep: (step: 1 | 2 | 3) => void;
  setAhpActiveStep: (step: 1 | 2 | 3) => void;
  setAhpCurrentCr: (cr: number) => void;
  setStoryHasExtracted: (has: boolean) => void;
  setStoryMode: (mode: 'story' | 'form') => void;
  toggleSharedMatrix: () => void;
  setSharedMatrixCollapsed: (collapsed: boolean) => void;
}

const MATRIX_COLLAPSED_STORAGE_KEY = 'decisigraph_matrix_collapsed';
const NUMBER_FORMAT_STORAGE_KEY = 'decisigraph_number_format';

const getInitialMatrixCollapsed = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(MATRIX_COLLAPSED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

const getInitialNumberFormat = (): NumberSeparator => {
  if (typeof window === 'undefined') return 'comma';
  try {
    const saved = localStorage.getItem(NUMBER_FORMAT_STORAGE_KEY);
    return saved === 'dot' ? 'dot' : 'comma';
  } catch {
    return 'comma';
  }
};

export const pathToView = (pathname: string): AppView => {
  const cleanPath = pathname.replace(/\/+$/, '').toLowerCase();
  if (cleanPath === '' || cleanPath === '/') return 'landing';
  if (cleanPath.startsWith('/board') || cleanPath.startsWith('/workboard')) return 'board';
  if (cleanPath.startsWith('/review')) return 'review';
  if (cleanPath.startsWith('/analytic')) return 'analytics';
  return 'landing';
};

const getInitialView = (): AppView => {
  if (typeof window === 'undefined') return 'landing';
  try {
    const path = window.location.pathname;
    if (path && path !== '/') {
      return pathToView(path);
    }
    // Backward compatibility for legacy ?view= query parameter
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view')?.toLowerCase();
    if (viewParam === 'board' || viewParam === 'workboard') return 'board';
    if (viewParam === 'review' || viewParam === 'community') return 'review';
    if (viewParam === 'analytics') return 'analytics';
    return 'landing';
  } catch {
    return 'landing';
  }
};

export const useUiStore = create<UiStore>((set) => ({
  currentView: getInitialView(),
  activeTab: 'SAW',
  hoveredCellId: null,
  isInspectorOpen: false,
  isGlossaryOpen: false,
  glossaryTargetTerm: null,
  isWelcomeOpen: false,
  numberFormat: getInitialNumberFormat(),
  activeEditorSection: 'matrix',
  sawActiveStep: 1,
  wpActiveStep: 1,
  topsisActiveStep: 1,
  ahpActiveStep: 1,
  ahpCurrentCr: 0,
  storyHasExtracted: false,
  storyMode: 'story',
  isSharedMatrixCollapsed: getInitialMatrixCollapsed(),

  setCurrentView: (view) => {
    try {
      const url = new URL(window.location.href);
      // Clean up legacy ?view= parameter if present
      url.searchParams.delete('view');

      let targetPath = '/';
      if (view === 'board') targetPath = '/board';
      else if (view === 'review') targetPath = '/review';
      else if (view === 'analytics') targetPath = '/analytics';
      else targetPath = '/';

      if (url.pathname !== targetPath) {
        url.pathname = targetPath;
        window.history.pushState(null, '', url.pathname + url.search + url.hash);
      }
    } catch {
      // safe fallback
    }
    set({ currentView: view });
  },
  setHoveredCell: (id) => set({ hoveredCellId: id }),
  setActiveTab: (tab) => {
    useTourStore.getState().markTabVisited(tab);
    set({ activeTab: tab });
  },
  setInspectorOpen: (open) => set({ isInspectorOpen: open }),
  toggleInspector: () => set((state) => ({ isInspectorOpen: !state.isInspectorOpen })),
  openGlossary: (term) => set({ isGlossaryOpen: true, glossaryTargetTerm: term ?? null }),
  closeGlossary: () => set({ isGlossaryOpen: false, glossaryTargetTerm: null }),
  openWelcome: () => set({ isWelcomeOpen: true }),
  closeWelcome: () => set({ isWelcomeOpen: false }),
  setNumberFormat: (format) => {
    try {
      localStorage.setItem(NUMBER_FORMAT_STORAGE_KEY, format);
    } catch {
      // safe fallback
    }
    set({ numberFormat: format });
  },
  toggleNumberFormat: () => {
    set((s) => {
      const next = s.numberFormat === 'comma' ? 'dot' : 'comma';
      try {
        localStorage.setItem(NUMBER_FORMAT_STORAGE_KEY, next);
      } catch {
        // safe fallback
      }
      return { numberFormat: next };
    });
  },
  setActiveEditorSection: (section) => set({ activeEditorSection: section }),
  setSawActiveStep: (step) => set({ sawActiveStep: step }),
  setWpActiveStep: (step) => set({ wpActiveStep: step }),
  setTopsisActiveStep: (step) => set({ topsisActiveStep: step }),
  setAhpActiveStep: (step) => set({ ahpActiveStep: step }),
  setAhpCurrentCr: (cr) => set({ ahpCurrentCr: cr }),
  setStoryHasExtracted: (has) => set({ storyHasExtracted: has }),
  setStoryMode: (mode) => set({ storyMode: mode }),
  toggleSharedMatrix: () =>
    set((s) => {
      const next = !s.isSharedMatrixCollapsed;
      try {
        localStorage.setItem(MATRIX_COLLAPSED_STORAGE_KEY, String(next));
      } catch {
        // safe fallback
      }
      return { isSharedMatrixCollapsed: next };
    }),
  setSharedMatrixCollapsed: (collapsed) => {
    try {
      localStorage.setItem(MATRIX_COLLAPSED_STORAGE_KEY, String(collapsed));
    } catch {
      // safe fallback
    }
    set({ isSharedMatrixCollapsed: collapsed });
  },
}));

