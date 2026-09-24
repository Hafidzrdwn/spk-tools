import { useMemo } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useNormalizedCriteria } from '@/store/selectors';
import { calculateWP, WpZeroGuardError } from '@/core/math/wp';
import { wpZeroGuard } from '@/validators/matrixSchemas';
import type { Criterion, Alternative } from '@/types/domain';
import type { RankingRow, TraceStep } from '@/core/math/types';

export interface ZeroGuardViolationDetail {
  alternativeId: string;
  alternativeName: string;
  criterionId: string;
  criterionName: string;
  value: number;
}

export interface WpExponentDetail {
  criterionId: string;
  criterionName: string;
  type: 'BENEFIT' | 'COST';
  weight: number;
  normalizedWeight: number;
  exponentPower: number;
}

export interface VectorSRow {
  alternativeId: string;
  alternativeName: string;
  sValue: number;
  percentage: number;
}

export interface WpViewModel {
  criteria: Criterion[];
  alternatives: Alternative[];
  hasData: boolean;
  hasZeroGuardViolation: boolean;
  violations: ZeroGuardViolationDetail[];
  exponents: WpExponentDetail[];
  vectorS: VectorSRow[];
  totalS: number;
  finalRanking: RankingRow[];
  bestAlternative?: RankingRow;
  formulaSteps: TraceStep[];
  updateCellValue: (alternativeId: string, criterionId: string, value: number) => void;
}

export function useWpViewModel(): WpViewModel {
  const criteria = useNormalizedCriteria();
  const alternatives = useProjectStore((state) => state.alternatives);
  const updateCellValue = useProjectStore((state) => state.updateCellValue);
  const hasData = criteria.length > 0 && alternatives.length > 0;

  // 1. Deteksi pelanggaran Zero-Guard
  const violations = useMemo<ZeroGuardViolationDetail[]>(() => {
    if (!hasData) return [];
    return wpZeroGuard(alternatives, criteria).map((v) => {
      const alt = alternatives.find((a) => a.id === v.alternativeId);
      const crit = criteria.find((c) => c.id === v.criterionId);
      return {
        alternativeId: v.alternativeId,
        alternativeName: alt?.name ?? v.alternativeId,
        criterionId: v.criterionId,
        criterionName: crit?.name ?? v.criterionId,
        value: alt?.values[v.criterionId] ?? 0,
      };
    });
  }, [alternatives, criteria, hasData]);

  const hasZeroGuardViolation = violations.length > 0;

  // 2. Transformasi Eksponen Pangkat
  const exponents = useMemo<WpExponentDetail[]>(() => {
    return criteria.map((crit) => ({
      criterionId: crit.id,
      criterionName: crit.name,
      type: crit.type,
      weight: crit.weight,
      normalizedWeight: crit.normalizedWeight,
      exponentPower: crit.type === 'BENEFIT' ? crit.normalizedWeight : -crit.normalizedWeight,
    }));
  }, [criteria]);

  // 3. Kalkulasi WP (hanya saat bebas dari zero-guard violation)
  const calculationResult = useMemo(() => {
    if (!hasData || hasZeroGuardViolation) {
      return { vectorS: [] as VectorSRow[], totalS: 0, finalRanking: [] as RankingRow[], bestAlternative: undefined, formulaSteps: [] as TraceStep[] };
    }

    try {
      const result = calculateWP(criteria, alternatives);
      const sMatrix = result.intermediateMatrices.vectorS ?? [];

      let sumS = 0;
      const sRows: VectorSRow[] = alternatives.map((alt, idx) => {
        const sValue = sMatrix[idx]?.[0] ?? 0;
        sumS += sValue;
        return { alternativeId: alt.id, alternativeName: alt.name, sValue, percentage: 0 };
      });

      sRows.forEach((row) => {
        row.percentage = sumS > 0 ? (row.sValue / sumS) * 100 : 0;
      });

      return {
        vectorS: sRows,
        totalS: sumS,
        finalRanking: result.finalRanking,
        bestAlternative: result.finalRanking[0],
        formulaSteps: result.formulaSteps,
      };
    } catch (err) {
      if (err instanceof WpZeroGuardError) {
        return { vectorS: [] as VectorSRow[], totalS: 0, finalRanking: [] as RankingRow[], bestAlternative: undefined, formulaSteps: [] as TraceStep[] };
      }
      throw err;
    }
  }, [criteria, alternatives, hasData, hasZeroGuardViolation]);

  return {
    criteria,
    alternatives,
    hasData,
    hasZeroGuardViolation,
    violations,
    exponents,
    vectorS: calculationResult.vectorS,
    totalS: calculationResult.totalS,
    finalRanking: calculationResult.finalRanking,
    bestAlternative: calculationResult.bestAlternative,
    formulaSteps: calculationResult.formulaSteps,
    updateCellValue,
  };
}

export default useWpViewModel;
