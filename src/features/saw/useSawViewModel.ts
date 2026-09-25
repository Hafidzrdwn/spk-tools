import { useMemo } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useNormalizedCriteria } from '@/store/selectors';
import { calculateSAW } from '@/core/math/saw';
import type { Criterion, Alternative } from '@/types/domain';
import type { RankingRow, TraceStep, MethodResult } from '@/core/math/types';

export interface SawViewModel {
  criteria: Criterion[];
  alternatives: Alternative[];
  normalizedMatrix: number[][];
  weightedMatrix: number[][];
  formulaSteps: TraceStep[];
  finalRanking: RankingRow[];
  bestAlternative?: RankingRow;
  rawResult: MethodResult;
  updateCellValue: (alternativeId: string, criterionId: string, value: number) => void;
  hasData: boolean;
}

export function useSawViewModel(): SawViewModel {
  const criteria = useNormalizedCriteria();
  const alternatives = useProjectStore((state) => state.alternatives);
  const updateCellValue = useProjectStore((state) => state.updateCellValue);

  const sawResult = useMemo(() => {
    return calculateSAW(criteria, alternatives);
  }, [criteria, alternatives]);

  const bestAlternative = sawResult.finalRanking.length > 0 ? sawResult.finalRanking[0] : undefined;
  const hasData = criteria.length > 0 && alternatives.length > 0;

  return {
    criteria,
    alternatives,
    normalizedMatrix: sawResult.intermediateMatrices.normalized ?? [],
    weightedMatrix: sawResult.intermediateMatrices.weighted ?? [],
    formulaSteps: sawResult.formulaSteps,
    finalRanking: sawResult.finalRanking,
    bestAlternative,
    rawResult: sawResult,
    updateCellValue,
    hasData,
  };
}

export default useSawViewModel;
