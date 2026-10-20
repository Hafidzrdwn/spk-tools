import { describe, it, expect } from 'vitest';
import { calculateTOPSIS } from '@/core/math/topsis';
import type { Criterion, Alternative } from '@/types/domain';

describe('calculateTOPSIS', () => {
  it('harus menghitung D+, D-, C_i dan ranking secara akurat sesuai hitungan manual', () => {
    const criteria: Criterion[] = [
      { id: 'c1', name: 'Kualitas', type: 'BENEFIT', weight: 1, normalizedWeight: 0.5 },
      { id: 'c2', name: 'Harga', type: 'COST', weight: 1, normalizedWeight: 0.5 },
    ];

    const alternatives: Alternative[] = [
      { id: 'a1', name: 'Opsi 1', values: { c1: 3, c2: 4 } },
      { id: 'a2', name: 'Opsi 2', values: { c1: 4, c2: 3 } },
    ];

    const result = calculateTOPSIS(criteria, alternatives);

    expect(result.intermediateMatrices.idealPositive).toEqual([[0.4, 0.3]]);
    expect(result.intermediateMatrices.idealNegative).toEqual([[0.3, 0.4]]);

    expect(result.finalRanking).toHaveLength(2);
    expect(result.finalRanking[0]).toEqual({
      alternativeId: 'a2',
      alternativeName: 'Opsi 2',
      score: 1.0,
      rank: 1,
    });
    expect(result.finalRanking[1]).toEqual({
      alternativeId: 'a1',
      alternativeName: 'Opsi 1',
      score: 0.0,
      rank: 2,
    });

    const dPlusA1 = result.formulaSteps.find((s) => s.cellId === 'topsis-a1-DISTANCE_POSITIVE');
    expect(dPlusA1).toBeDefined();
    expect(dPlusA1?.stage).toBe('DISTANCE');
    expect(dPlusA1?.result).toBeCloseTo(Math.sqrt(0.02), 6);
    expect(dPlusA1?.formulaLabel).toContain('D+_1');

    const dMinusA1 = result.formulaSteps.find((s) => s.cellId === 'topsis-a1-DISTANCE_NEGATIVE');
    expect(dMinusA1).toBeDefined();
    expect(dMinusA1?.stage).toBe('DISTANCE');
    expect(dMinusA1?.result).toBe(0);

    const dPlusA2 = result.formulaSteps.find((s) => s.cellId === 'topsis-a2-DISTANCE_POSITIVE');
    expect(dPlusA2?.result).toBe(0);

    const dMinusA2 = result.formulaSteps.find((s) => s.cellId === 'topsis-a2-DISTANCE_NEGATIVE');
    expect(dMinusA2?.result).toBeCloseTo(Math.sqrt(0.02), 6);

    const cStepA2 = result.formulaSteps.find((s) => s.cellId === 'topsis-a2-FINAL');
    expect(cStepA2).toBeDefined();
    expect(cStepA2?.stage).toBe('FINAL');
    expect(cStepA2?.result).toBe(1.0);
    expect(cStepA2?.formulaLabel).toContain('C_2 = D-_2 / (D+_2 + D-_2)');
  });

  it('harus menangani input kosong dengan aman tanpa melempar error', () => {
    const emptyResult = calculateTOPSIS([], []);
    expect(emptyResult.finalRanking).toEqual([]);
    expect(emptyResult.formulaSteps).toEqual([]);
    expect(emptyResult.intermediateMatrices.normalized).toEqual([]);
    expect(emptyResult.intermediateMatrices.weighted).toEqual([]);
    expect(emptyResult.intermediateMatrices.idealPositive).toEqual([]);
    expect(emptyResult.intermediateMatrices.idealNegative).toEqual([]);
  });
});
