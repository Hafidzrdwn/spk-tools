import { useState, useMemo } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useNormalizedCriteria } from '@/store/selectors';
import { calculateSAW } from '@/core/math/saw';
import { calculateWP } from '@/core/math/wp';
import { calculateTOPSIS } from '@/core/math/topsis';
import {
  compareRankings,
  type ComparisonResult,
  type CompareMethod,
} from '@/core/math/compareRankings';
import type { Criterion, Alternative } from '@/types/domain';

export interface ComparisonViewModel {
  criteria: Criterion[];
  alternatives: Alternative[];
  hasData: boolean;
  selectedMethods: CompareMethod[];
  setSelectedMethods: (methods: CompareMethod[]) => void;
  toggleMethod: (method: CompareMethod) => void;
  comparison: ComparisonResult;
  loadShiftDemoCase: () => void;
}

export function useComparisonViewModel(): ComparisonViewModel {
  const criteria = useNormalizedCriteria();
  const alternatives = useProjectStore((state) => state.alternatives);
  const loadProjectState = useProjectStore((state) => state.loadProjectState);

  const [selectedMethods, setSelectedMethods] = useState<CompareMethod[]>([
    'saw',
    'wp',
    'topsis',
  ]);

  const toggleMethod = (method: CompareMethod) => {
    setSelectedMethods((prev) => {
      if (prev.includes(method)) {
        // Minimal harus ada 2 metode untuk dibandingkan
        if (prev.length <= 2) return prev;
        return prev.filter((m) => m !== method);
      }
      return [...prev, method];
    });
  };

  const hasData = criteria.length > 0 && alternatives.length > 0;

  const comparison = useMemo<ComparisonResult>(() => {
    if (!hasData) {
      return {
        activeMethods: selectedMethods,
        rows: [],
        hasRank1Shift: false,
        rank1Winners: {},
        explanation: 'Belum ada data kriteria dan alternatif untuk dibandingkan.',
        differences: [],
        sensitivity: {
          hasTightMargins: false,
          statement: '',
          gaps: [],
        },
      };
    }

    const sawRes = calculateSAW(criteria, alternatives);
    const wpRes = calculateWP(criteria, alternatives);
    const topsisRes = calculateTOPSIS(criteria, alternatives);

    return compareRankings(
      sawRes.finalRanking,
      wpRes.finalRanking,
      topsisRes.finalRanking,
      criteria,
      alternatives,
      selectedMethods
    );
  }, [criteria, alternatives, hasData, selectedMethods]);

  const loadShiftDemoCase = () => {
    loadProjectState({
      title: 'Studi Kasus Pergeseran Peringkat (SAW vs TOPSIS)',
      activeMethod: 'SAW',
      criteria: [
        { id: 'c1', name: 'Kapasitas', type: 'BENEFIT', weight: 70, normalizedWeight: 0.7 },
        { id: 'c2', name: 'Efisiensi', type: 'BENEFIT', weight: 15, normalizedWeight: 0.15 },
        { id: 'c3', name: 'Keandalan', type: 'BENEFIT', weight: 15, normalizedWeight: 0.15 },
      ],
      alternatives: [
        {
          id: 'alt-titan',
          name: 'Server Titan (Spesialis Kapasitas)',
          values: { c1: 100, c2: 20, c3: 20 },
        },
        {
          id: 'alt-balance',
          name: 'Server Balance (Harmonis)',
          values: { c1: 75, c2: 85, c3: 85 },
        },
        {
          id: 'alt-entry',
          name: 'Server Entry',
          values: { c1: 40, c2: 30, c3: 30 },
        },
      ],
    });
  };

  return {
    criteria,
    alternatives,
    hasData,
    selectedMethods,
    setSelectedMethods,
    toggleMethod,
    comparison,
    loadShiftDemoCase,
  };
}

export default useComparisonViewModel;
