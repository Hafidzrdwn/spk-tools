import Decimal from 'decimal.js';
import type { Criterion, Alternative } from '@/types/domain';
import { calculateSAW } from '@/core/math/saw';
import type { CrossoverPoint, SensitivitySimulationResult } from './types';

export function normalizeWeightDistribution(weights: Record<string, number>): Record<string, number> {
  const keys = Object.keys(weights);
  const sum = keys.reduce((acc, k) => acc + Math.max(0, weights[k] || 0), 0);
  const result: Record<string, number> = {};

  if (sum === 0) {
    const eq = keys.length > 0 ? 1 / keys.length : 1;
    keys.forEach((k) => (result[k] = eq));
    return result;
  }

  keys.forEach((k) => {
    result[k] = Number(new Decimal(Math.max(0, weights[k] || 0)).dividedBy(sum).toFixed(4));
  });

  return result;
}

export function adjustWeightsProportionally(
  criteria: Criterion[],
  targetCriterionId: string,
  newWeight: number
): Record<string, number> {
  const boundedTarget = Math.max(0.01, Math.min(0.99, newWeight));
  const remainingWeight = 1 - boundedTarget;

  const otherCriteria = criteria.filter((c) => c.id !== targetCriterionId);
  const otherTotalOriginal = otherCriteria.reduce((acc, c) => acc + (c.normalizedWeight || c.weight || 0), 0);

  const result: Record<string, number> = {
    [targetCriterionId]: Number(boundedTarget.toFixed(4)),
  };

  otherCriteria.forEach((c) => {
    if (otherTotalOriginal > 0) {
      const share = (c.normalizedWeight || c.weight || 0) / otherTotalOriginal;
      result[c.id] = Number((remainingWeight * share).toFixed(4));
    } else {
      result[c.id] = Number((remainingWeight / otherCriteria.length).toFixed(4));
    }
  });

  return result;
}

export function findCrossoverThresholds(
  criteria: Criterion[],
  alternatives: Alternative[]
): CrossoverPoint[] {
  if (criteria.length < 2 || alternatives.length < 2) return [];

  const baseResult = calculateSAW(criteria, alternatives);
  const baseWinner = baseResult.finalRanking.find((r) => r.rank === 1);
  if (!baseWinner) return [];

  const crossoverPoints: CrossoverPoint[] = [];

  criteria.forEach((crit) => {
    const currentWeight = crit.normalizedWeight || crit.weight || 1 / criteria.length;
    let foundCrossover: CrossoverPoint | null = null;

    for (let w = currentWeight + 0.02; w <= 0.95; w += 0.02) {
      const adjusted = adjustWeightsProportionally(criteria, crit.id, w);
      const modCriteria = criteria.map((c) => ({
        ...c,
        weight: adjusted[c.id] ?? c.weight,
        normalizedWeight: adjusted[c.id] ?? c.normalizedWeight,
      }));

      const res = calculateSAW(modCriteria, alternatives);
      const newWin = res.finalRanking.find((r) => r.rank === 1);

      if (newWin && newWin.alternativeId !== baseWinner.alternativeId) {
        foundCrossover = {
          criterionId: crit.id,
          criterionName: crit.name,
          currentWeight: Number(currentWeight.toFixed(4)),
          thresholdWeight: Number(w.toFixed(4)),
          challengerId: newWin.alternativeId,
          challengerName: newWin.alternativeName,
          direction: 'INCREASE',
          switchPercentageChange: Number((((w - currentWeight) / currentWeight) * 100).toFixed(1)),
        };
        break;
      }
    }

    if (!foundCrossover) {
      for (let w = currentWeight - 0.02; w >= 0.05; w -= 0.02) {
        const adjusted = adjustWeightsProportionally(criteria, crit.id, w);
        const modCriteria = criteria.map((c) => ({
          ...c,
          weight: adjusted[c.id] ?? c.weight,
          normalizedWeight: adjusted[c.id] ?? c.normalizedWeight,
        }));

        const res = calculateSAW(modCriteria, alternatives);
        const newWin = res.finalRanking.find((r) => r.rank === 1);

        if (newWin && newWin.alternativeId !== baseWinner.alternativeId) {
          foundCrossover = {
            criterionId: crit.id,
            criterionName: crit.name,
            currentWeight: Number(currentWeight.toFixed(4)),
            thresholdWeight: Number(w.toFixed(4)),
            challengerId: newWin.alternativeId,
            challengerName: newWin.alternativeName,
            direction: 'DECREASE',
            switchPercentageChange: Number((((w - currentWeight) / currentWeight) * 100).toFixed(1)),
          };
          break;
        }
      }
    }

    if (foundCrossover) {
      crossoverPoints.push(foundCrossover);
    }
  });

  return crossoverPoints;
}

export function simulateSensitivity(
  criteria: Criterion[],
  alternatives: Alternative[],
  customWeights: Record<string, number>
): SensitivitySimulationResult {
  const baseResult = calculateSAW(criteria, alternatives);
  const baseRankings = baseResult.finalRanking;
  const currentWinner = baseRankings.find((r) => r.rank === 1) || baseRankings[0];

  const normalizedCustom = normalizeWeightDistribution(customWeights);

  const modifiedCriteria = criteria.map((c) => ({
    ...c,
    weight: normalizedCustom[c.id] ?? c.weight,
    normalizedWeight: normalizedCustom[c.id] ?? c.normalizedWeight,
  }));

  const simResult = calculateSAW(modifiedCriteria, alternatives);
  const simulatedRankings = simResult.finalRanking;
  const newWinner = simulatedRankings.find((r) => r.rank === 1) || simulatedRankings[0];

  const crossoverPoints = findCrossoverThresholds(criteria, alternatives);

  return {
    baseRankings,
    simulatedRankings,
    adjustedWeights: normalizedCustom,
    crossoverPoints,
    hasWinnerShifted: currentWinner.alternativeId !== newWinner.alternativeId,
    currentWinner,
    newWinner,
  };
}
