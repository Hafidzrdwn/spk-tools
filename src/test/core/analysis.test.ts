import { describe, it, expect } from 'vitest';
import type { Criterion, Alternative } from '@/types/domain';
import { calculateSAW } from '@/core/math/saw';
import { calculateWP } from '@/core/math/wp';
import {
  calculateSpearmansRho,
  evaluateGoalCongruence,
  evaluateMarginOfVictory,
  simulateWhatIf,
  findCrossoverThresholds,
  evaluateBusinessScenarios,
  calculateGoalSeeking,
  synthesizeManagerialRecommendations,
} from '@/core/analysis';

describe('Decision Evaluation & Analysis Core Engine', () => {
  const criteriaCV: Criterion[] = [
    { id: 'c1', name: 'Harga', type: 'COST', weight: 0.3, normalizedWeight: 0.3, unit: 'Juta Rp' },
    { id: 'c2', name: 'Kualitas', type: 'BENEFIT', weight: 0.25, normalizedWeight: 0.25, unit: 'Skor' },
    { id: 'c3', name: 'Pengiriman', type: 'BENEFIT', weight: 0.2, normalizedWeight: 0.2, unit: '%' },
    { id: 'c4', name: 'Layanan', type: 'BENEFIT', weight: 0.15, normalizedWeight: 0.15, unit: 'Skor' },
    { id: 'c5', name: 'Kapasitas', type: 'BENEFIT', weight: 0.1, normalizedWeight: 0.1, unit: 'Unit' },
  ];

  const alternativesCV: Alternative[] = [
    { id: 'a1', name: 'PT Alpha Teknologi', values: { c1: 185, c2: 85, c3: 96, c4: 80, c5: 500 } },
    { id: 'a2', name: 'CV Digital Nusantara', values: { c1: 175, c2: 88, c3: 90, c4: 85, c5: 450 } },
    { id: 'a3', name: 'PT Smart Solution', values: { c1: 195, c2: 95, c3: 98, c4: 90, c5: 600 } },
    { id: 'a4', name: 'CV Prima Komputer', values: { c1: 170, c2: 80, c3: 88, c4: 78, c5: 400 } },
    { id: 'a5', name: 'PT Inovasi Informatika', values: { c1: 180, c2: 90, c3: 95, c4: 92, c5: 550 } },
  ];

  it('calculates Spearman Rho accurately for identical rankings (CV Maju Jaya case)', () => {
    const sawResult = calculateSAW(criteriaCV, alternativesCV);
    const wpResult = calculateWP(criteriaCV, alternativesCV);

    const spearman = calculateSpearmansRho(sawResult.finalRanking, wpResult.finalRanking, 'saw', 'wp');

    expect(spearman.n).toBe(5);
    expect(spearman.sumSquaredDifferences).toBe(0);
    expect(spearman.rho).toBe(1);
    expect(spearman.consistencyLevel).toBe('PERFECT');
  });

  it('evaluates Goal Congruence and avoids cost-trap', () => {
    const sawResult = calculateSAW(criteriaCV, alternativesCV);
    const congruence = evaluateGoalCongruence(criteriaCV, alternativesCV, sawResult.finalRanking);

    expect(congruence.isCongruent).toBe(true);
    expect(congruence.status).toBe('VERY_CONGRUENT');
    expect(congruence.cheapestAlternative?.name).toBe('CV Prima Komputer');
    expect(congruence.cheapestAlternative?.rank).toBe(5);
    expect(congruence.winnerAlternative.name).toBe('PT Smart Solution');
  });

  it('detects tight Margin of Victory between top 2 alternatives', () => {
    const sawResult = calculateSAW(criteriaCV, alternativesCV);
    const margin = evaluateMarginOfVictory(sawResult.finalRanking);

    expect(margin.winner.alternativeName).toBe('PT Smart Solution');
    expect(margin.runnerUp.alternativeName).toBe('PT Inovasi Informatika');
    expect(margin.absoluteGap).toBeLessThanOrEqual(0.01);
    expect(margin.isTight).toBe(true);
    expect(margin.riskLevel).toBe('HIGH');
  });

  it('simulates What-If scenario when A3 lowers price to 180 million', () => {
    const whatIf = simulateWhatIf(criteriaCV, alternativesCV, {
      alternativeId: 'a3',
      criterionId: 'c1',
      newValue: 180,
    });

    expect(whatIf.newRank).toBe(1);
    expect(whatIf.newScore).toBeGreaterThan(whatIf.originalScore);
    expect(whatIf.newScore).toBeCloseTo(0.9801, 2);
  });

  it('finds sensitivity crossover thresholds when price weight increases', () => {
    const crossovers = findCrossoverThresholds(criteriaCV, alternativesCV);
    const priceCrossover = crossovers.find((c) => c.criterionId === 'c1');

    expect(priceCrossover).toBeDefined();
    expect(priceCrossover?.challengerName).toBe('PT Inovasi Informatika');
    expect(priceCrossover?.thresholdWeight).toBeGreaterThan(0.3);
  });

  it('evaluates 3 business scenarios with respective winners', () => {
    const scenarios = evaluateBusinessScenarios(criteriaCV, alternativesCV);

    expect(scenarios.BASELINE.winner.alternativeName).toBe('PT Smart Solution');
    expect(scenarios.SUPPLY_FOCUS.winner.alternativeName).toBe('PT Smart Solution');
    expect(scenarios.EFFICIENCY.winner.alternativeName).toBe('PT Inovasi Informatika');
  });

  it('calculates Goal Seeking target price for A5 to overtake A3', () => {
    const target = calculateGoalSeeking(criteriaCV, alternativesCV, 'a5', 'c1');

    expect(target).not.toBeNull();
    expect(target?.isFeasible).toBe(true);
    expect(target?.targetAlternativeName).toBe('PT Inovasi Informatika');
    expect(target?.requiredRealValue).toBeLessThan(180);
    expect(target?.requiredRealValue).toBeGreaterThan(177);
  });

  it('synthesizes actionable managerial recommendations with Plan B', () => {
    const sawResult = calculateSAW(criteriaCV, alternativesCV);
    const wpResult = calculateWP(criteriaCV, alternativesCV);
    const spearman = calculateSpearmansRho(sawResult.finalRanking, wpResult.finalRanking);
    const congruence = evaluateGoalCongruence(criteriaCV, alternativesCV, sawResult.finalRanking);
    const margin = evaluateMarginOfVictory(sawResult.finalRanking);
    const crossovers = findCrossoverThresholds(criteriaCV, alternativesCV);
    const scenarios = evaluateBusinessScenarios(criteriaCV, alternativesCV);
    const goalSeeking = calculateGoalSeeking(criteriaCV, alternativesCV, 'a5', 'c1');

    const synthesis = synthesizeManagerialRecommendations({
      winner: sawResult.finalRanking[0],
      runnerUp: sawResult.finalRanking[1],
      goalCongruence: congruence,
      spearmanRho: spearman,
      margin,
      crossovers,
      scenarios,
      goalSeeking,
    });

    expect(synthesis.primaryRecommendation.alternativeName).toBe('PT Smart Solution');
    expect(synthesis.contingencyPlanB.alternativeName).toBe('PT Inovasi Informatika');
    expect(synthesis.primaryRecommendation.actionPoints.length).toBeGreaterThan(0);
    expect(synthesis.contingencyPlanB.triggerConditions.length).toBeGreaterThan(0);
  });
});
