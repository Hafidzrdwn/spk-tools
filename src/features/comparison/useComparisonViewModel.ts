import { useState, useMemo, useCallback } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useNormalizedCriteria } from '@/store/selectors';
import { calculateSAW } from '@/core/math/saw';
import { calculateWP, calculateSafeWP, WpZeroGuardError } from '@/core/math/wp';
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

  const toggleMethod = useCallback((method: CompareMethod) => {
    setSelectedMethods((prev) => {
      if (prev.includes(method)) {
        if (prev.length <= 2) return prev;
        return prev.filter((m) => m !== method);
      }
      return [...prev, method];
    });
  }, []);

  const hasData = criteria.length > 0 && alternatives.length > 0;

  const methodRankings = useMemo(() => {
    if (!hasData) return null;
    let wpRanking;
    try {
      wpRanking = calculateWP(criteria, alternatives).finalRanking;
    } catch (err) {
      if (err instanceof WpZeroGuardError) {
        wpRanking = calculateSafeWP(criteria, alternatives).finalRanking;
      } else {
        throw err;
      }
    }
    return {
      saw: calculateSAW(criteria, alternatives).finalRanking,
      wp: wpRanking,
      topsis: calculateTOPSIS(criteria, alternatives).finalRanking,
    };
  }, [criteria, alternatives, hasData]);

  const comparison = useMemo<ComparisonResult>(() => {
    if (!hasData || !methodRankings) {
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

    return compareRankings(
      methodRankings.saw,
      methodRankings.wp,
      methodRankings.topsis,
      criteria,
      alternatives,
      selectedMethods
    );
  }, [methodRankings, criteria, alternatives, hasData, selectedMethods]);

  const loadShiftDemoCase = useCallback(() => {
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
  }, [loadProjectState]);

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
