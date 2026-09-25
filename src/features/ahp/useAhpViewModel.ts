import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNormalizedCriteria } from '@/store/selectors';
import { useProjectStore } from '@/store/useProjectStore';
import { useUiStore } from '@/store/useUiStore';
import { calculateAHP, type AhpResult } from '@/core/math/ahp';
import type { ConsistencyResult, ConsistencyFixSuggestion } from '@/core/math/ahp-consistency';
import type { Criterion } from '@/types/domain';

export interface PairwiseComparisonPair {
  i: number;
  j: number;
  criterionA: Criterion;
  criterionB: Criterion;
  value: number; // > 1 means A is more important, < 1 means B is more important, 1 is equal
  dominant: 'A' | 'B';
  scaleValue: number; // 1 to 9
}

export interface AhpViewModel {
  criteria: Criterion[];
  hasData: boolean;
  matrix: number[][];
  pairs: PairwiseComparisonPair[];
  priorityVector: number[];
  normalizedMatrix: number[][];
  consistency: ConsistencyResult;
  suggestion: ConsistencyFixSuggestion | null;
  setPairwiseValue: (i: number, j: number, value: number) => void;
  applySuggestion: () => void;
  resetMatrix: () => void;
  applyWeightsToProject: () => void;
}

export function useAhpViewModel(): AhpViewModel {
  const criteria = useNormalizedCriteria();
  const updateCriterion = useProjectStore((state) => state.updateCriterion);
  const n = criteria.length;
  const hasData = n >= 2;

  // Inisialisasi matriks pairwise n x n dengan nilai 1
  const [matrix, setMatrix] = useState<number[][]>(() => {
    return Array.from({ length: n }, () => Array(n).fill(1));
  });

  // Sinkronisasi ukuran matriks jika kriteria berubah
  useEffect(() => {
    setMatrix((prev) => {
      if (prev.length === n) return prev;
      const next = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => (i === j ? 1 : prev[i]?.[j] ?? 1))
      );
      return next;
    });
  }, [n]);

  // Fungsi mutasi nilai perbandingan berpasangan (A vs B)
  const setPairwiseValue = useCallback((i: number, j: number, value: number) => {
    if (i === j || value <= 0) return;
    setMatrix((prev) => {
      const next = prev.map((row) => [...row]);
      next[i][j] = value;
      next[j][i] = Number((1 / value).toFixed(6));
      return next;
    });
  }, []);

  // Hitung hasil AHP secara reaktif (Live Recompute)
  const ahpResult: AhpResult = useMemo(() => {
    if (!hasData || matrix.length !== n) {
      return {
        priorityVector: [],
        normalizedMatrix: [],
        consistency: { weightedSumVector: [], lambdaMax: 0, ci: 0, cr: 0, ri: 0, isConsistent: true },
        suggestion: null,
        intermediateMatrices: {},
        formulaSteps: [],
        finalRanking: [],
      };
    }
    return calculateAHP(matrix, criteria);
  }, [matrix, criteria, hasData, n]);

  // Sinkronisasi rasio konsistensi (CR) ke useUiStore untuk pelacakan live tour
  useEffect(() => {
    useUiStore.getState().setAhpCurrentCr(ahpResult.consistency.cr);
  }, [ahpResult.consistency.cr]);

  // Ekstrak daftar pasangan unik (i < j) untuk slider
  const pairs = useMemo<PairwiseComparisonPair[]>(() => {
    if (!hasData || matrix.length !== n) return [];
    const list: PairwiseComparisonPair[] = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const val = matrix[i]?.[j] ?? 1;
        const dominant = val >= 1 ? 'A' : 'B';
        const scaleValue = val >= 1 ? Math.round(val) : Math.round(1 / val);
        list.push({
          i,
          j,
          criterionA: criteria[i],
          criterionB: criteria[j],
          value: val,
          dominant,
          scaleValue: Math.max(1, Math.min(9, scaleValue)),
        });
      }
    }
    return list;
  }, [matrix, criteria, hasData, n]);

  // Terapkan saran koreksi jika ada
  const applySuggestion = useCallback(() => {
    if (ahpResult.suggestion) {
      const { i, j, suggestedValue } = ahpResult.suggestion;
      setPairwiseValue(i, j, suggestedValue);
    }
  }, [ahpResult.suggestion, setPairwiseValue]);

  // Reset matriks ke nilai setara (1.0)
  const resetMatrix = useCallback(() => {
    setMatrix(Array.from({ length: n }, () => Array(n).fill(1)));
  }, [n]);

  // Terapkan bobot prioritas AHP ke proyek utama
  const applyWeightsToProject = useCallback(() => {
    if (!hasData || ahpResult.priorityVector.length !== n) return;
    criteria.forEach((crit, idx) => {
      const weight = Number((ahpResult.priorityVector[idx] * 100).toFixed(2));
      updateCriterion(crit.id, { weight });
    });
  }, [criteria, ahpResult.priorityVector, hasData, n, updateCriterion]);

  return {
    criteria,
    hasData,
    matrix,
    pairs,
    priorityVector: ahpResult.priorityVector,
    normalizedMatrix: ahpResult.normalizedMatrix,
    consistency: ahpResult.consistency,
    suggestion: ahpResult.suggestion,
    setPairwiseValue,
    applySuggestion,
    resetMatrix,
    applyWeightsToProject,
  };
}

export default useAhpViewModel;
