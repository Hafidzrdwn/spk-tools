import type { Criterion, Alternative } from '@/types/domain';
import { calculateSAW } from '@/core/math/saw';
import { normalizeWeightDistribution } from './sensitivityEngine';
import type {
  BusinessScenarioId,
  BusinessScenarioDefinition,
  BusinessScenarioResult,
} from './types';

export function generateScenarioDefinitions(criteria: Criterion[]): Record<BusinessScenarioId, BusinessScenarioDefinition> {
  const baseWeights: Record<string, number> = {};
  criteria.forEach((c) => {
    baseWeights[c.id] = c.normalizedWeight || c.weight || 1 / criteria.length;
  });

  const supplyWeights: Record<string, number> = {};
  criteria.forEach((c) => {
    if (c.type === 'BENEFIT') {
      supplyWeights[c.id] = (baseWeights[c.id] || 0.1) * 1.5;
    } else {
      supplyWeights[c.id] = (baseWeights[c.id] || 0.1) * 0.5;
    }
  });

  const efficiencyWeights: Record<string, number> = {};
  criteria.forEach((c) => {
    if (c.type === 'COST') {
      efficiencyWeights[c.id] = (baseWeights[c.id] || 0.1) * 2.2;
    } else {
      efficiencyWeights[c.id] = (baseWeights[c.id] || 0.1) * 0.6;
    }
  });

  return {
    BASELINE: {
      id: 'BASELINE',
      name: 'Skenario A (Baseline)',
      tagline: 'Kondisi Normal / Stabil',
      description: 'Menyeimbangkan seluruh kriteria sesuai prioritas standar operasional organisasi.',
      weights: normalizeWeightDistribution(baseWeights),
    },
    SUPPLY_FOCUS: {
      id: 'SUPPLY_FOCUS',
      name: 'Skenario B (Fokus Pasokan & Mutu)',
      tagline: 'High Demand / Peak Season',
      description: 'Memprioritaskan kepastian pengiriman, spesifikasi mutu, dan kapasitas pasokan.',
      weights: normalizeWeightDistribution(supplyWeights),
    },
    EFFICIENCY: {
      id: 'EFFICIENCY',
      name: 'Skenario C (Efisiensi Biaya)',
      tagline: 'Krisis / Pengetatan Anggaran',
      description: 'Menjadikan efisiensi harga dan penghematan biaya sebagai pertimbangan utama.',
      weights: normalizeWeightDistribution(efficiencyWeights),
    },
  };
}

export function evaluateBusinessScenarios(
  criteria: Criterion[],
  alternatives: Alternative[]
): Record<BusinessScenarioId, BusinessScenarioResult> {
  const definitions = generateScenarioDefinitions(criteria);
  const result: Partial<Record<BusinessScenarioId, BusinessScenarioResult>> = {};

  (Object.keys(definitions) as BusinessScenarioId[]).forEach((scenarioId) => {
    const def = definitions[scenarioId];
    const modCriteria = criteria.map((c) => ({
      ...c,
      weight: def.weights[c.id] ?? c.weight,
      normalizedWeight: def.weights[c.id] ?? c.normalizedWeight,
    }));

    const calcResult = calculateSAW(modCriteria, alternatives);
    const rankings = calcResult.finalRanking;
    const winner = rankings.find((r) => r.rank === 1) || rankings[0];
    const runnerUp = rankings.find((r) => r.rank === 2) || rankings[1] || winner;

    result[scenarioId] = {
      scenario: def,
      rankings,
      winner,
      runnerUp,
    };
  });

  return result as Record<BusinessScenarioId, BusinessScenarioResult>;
}
