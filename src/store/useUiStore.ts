import { create } from 'zustand';
import type { MethodId } from '@/types/domain';

export interface UiStore {
  activeTab: MethodId;
  hoveredCellId: string | null;
  isInspectorOpen: boolean;
  isGlossaryOpen: boolean;
  glossaryTargetTerm: string | null;
  setHoveredCell: (id: string | null) => void;
  setActiveTab: (tab: MethodId) => void;
  setInspectorOpen: (open: boolean) => void;
  toggleInspector: () => void;
  openGlossary: (term?: string) => void;
  closeGlossary: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  activeTab: 'SAW',
  hoveredCellId: null,
  isInspectorOpen: false,
  isGlossaryOpen: false,
  glossaryTargetTerm: null,

  setHoveredCell: (id) => set({ hoveredCellId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setInspectorOpen: (open) => set({ isInspectorOpen: open }),
  toggleInspector: () => set((state) => ({ isInspectorOpen: !state.isInspectorOpen })),
  openGlossary: (term) => set({ isGlossaryOpen: true, glossaryTargetTerm: term ?? null }),
  closeGlossary: () => set({ isGlossaryOpen: false, glossaryTargetTerm: null }),
}));
