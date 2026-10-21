import type { Criterion, Alternative } from '@/types/domain';
import { calculateSAW } from '@/core/math/saw';
import type { WhatIfSimulationInput, WhatIfSimulationResult } from './types';

export function simulateWhatIf(
  criteria: Criterion[],
  alternatives: Alternative[],
  input: WhatIfSimulationInput
): WhatIfSimulationResult {
  const targetAlt = alternatives.find((a) => a.id === input.alternativeId);
  const criterion = criteria.find((c) => c.id === input.criterionId);

  const originalResult = calculateSAW(criteria, alternatives);
  const originalRanking = originalResult.finalRanking;
  const originalRow = originalRanking.find((r) => r.alternativeId === input.alternativeId);
  const originalRank = originalRow?.rank ?? 1;
  const originalScore = originalRow?.score ?? 0;
  const oldValue = targetAlt?.values[input.criterionId] ?? 0;

  const simulatedAlternatives = alternatives.map((alt) => {
    if (alt.id !== input.alternativeId) return alt;
    return {
      ...alt,
      values: {
        ...alt.values,
        [input.criterionId]: input.newValue,
      },
    };
  });

  const simulatedResult = calculateSAW(criteria, simulatedAlternatives);
  const newRankings = simulatedResult.finalRanking;
  const newRow = newRankings.find((r) => r.alternativeId === input.alternativeId);
  const newRank = newRow?.rank ?? 1;
  const newScore = newRow?.score ?? 0;

  return {
    targetAlternativeId: input.alternativeId,
    targetAlternativeName: targetAlt?.name ?? 'Alternatif Terpilih',
    criterionId: input.criterionId,
    criterionName: criterion?.name ?? 'Kriteria',
    oldValue,
    newValue: input.newValue,
    originalRank,
    originalScore,
    newRank,
    newScore,
    rankDelta: originalRank - newRank,
    scoreDelta: Number((newScore - originalScore).toFixed(4)),
    newRankings,
  };
}
