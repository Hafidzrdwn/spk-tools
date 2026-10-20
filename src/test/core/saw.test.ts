import { describe, it, expect } from 'vitest';
import { calculateSAW } from '@/core/math/saw';
import type { Criterion, Alternative } from '@/types/domain';

describe('calculateSAW', () => {
  it('harus menangani kasus kriteria murni Benefit dengan benar', () => {
    const criteria: Criterion[] = [
      { id: 'c1', name: 'Kualitas', type: 'BENEFIT', weight: 6, normalizedWeight: 0.6 },
      { id: 'c2', name: 'Pelayanan', type: 'BENEFIT', weight: 4, normalizedWeight: 0.4 },
    ];

    const alternatives: Alternative[] = [
      { id: 'a1', name: 'Alternatif 1', values: { c1: 80, c2: 70 } },
      { id: 'a2', name: 'Alternatif 2', values: { c1: 100, c2: 90 } },
      { id: 'a3', name: 'Alternatif 3', values: { c1: 60, c2: 100 } },
    ];

    const result = calculateSAW(criteria, alternatives);

    expect(result.finalRanking[0].alternativeId).toBe('a2');
    expect(result.finalRanking[0].score).toBeCloseTo(0.96, 4);
    expect(result.finalRanking[0].rank).toBe(1);

    expect(result.finalRanking[1].score).toBeCloseTo(0.76, 4);
    expect(result.finalRanking[2].score).toBeCloseTo(0.76, 4);

    expect(result.intermediateMatrices.normalized[0]).toEqual([0.8, 0.7]);
    expect(result.intermediateMatrices.normalized[1]).toEqual([1.0, 0.9]);
    expect(result.intermediateMatrices.normalized[2]).toEqual([0.6, 1.0]);
  });

  it('harus menangani kasus kriteria murni Cost dengan benar', () => {
    const criteria: Criterion[] = [
      { id: 'c1', name: 'Harga', type: 'COST', weight: 5, normalizedWeight: 0.5 },
      { id: 'c2', name: 'Biaya Kirim', type: 'COST', weight: 5, normalizedWeight: 0.5 },
    ];

    const alternatives: Alternative[] = [
      { id: 'a1', name: 'Vendor 1', values: { c1: 20, c2: 50 } },
      { id: 'a2', name: 'Vendor 2', values: { c1: 40, c2: 25 } },
    ];

    const result = calculateSAW(criteria, alternatives);

    expect(result.finalRanking[0].score).toBeCloseTo(0.75, 4);
    expect(result.finalRanking[1].score).toBeCloseTo(0.75, 4);

    expect(result.intermediateMatrices.normalized[0]).toEqual([1.0, 0.5]);
    expect(result.intermediateMatrices.normalized[1]).toEqual([0.5, 1.0]);
  });

  it('harus menangani kasus campuran Benefit & Cost dengan verifikasi contoh spec', () => {
    const criteria: Criterion[] = [
      { id: 'c1', name: 'Keuntungan', type: 'BENEFIT', weight: 1, normalizedWeight: 0.5 },
      { id: 'c2', name: 'Biaya', type: 'COST', weight: 1, normalizedWeight: 0.5 },
    ];

    const alternatives: Alternative[] = [
      { id: 'a1', name: 'Opsi A', values: { c1: 80, c2: 50 } },
      { id: 'a2', name: 'Opsi B', values: { c1: 100, c2: 20 } },
    ];

    const result = calculateSAW(criteria, alternatives);

    expect(result.finalRanking).toHaveLength(2);
    expect(result.finalRanking[0]).toEqual({
      alternativeId: 'a2',
      alternativeName: 'Opsi B',
      score: 1.0,
      rank: 1,
    });
    expect(result.finalRanking[1]).toEqual({
      alternativeId: 'a1',
      alternativeName: 'Opsi A',
      score: 0.6,
      rank: 2,
    });

    const costStepA1 = result.formulaSteps.find(
      (s) => s.cellId === 'saw-a1-c2-NORMALIZED'
    );
    expect(costStepA1).toBeDefined();
    expect(costStepA1?.stage).toBe('NORMALIZED');
    expect(costStepA1?.result).toBe(0.4);
    expect(costStepA1?.formulaLabel).toBe('Cost ⟹ x12 = min(X)/x12 = 20/50 = 0.4');
    expect(costStepA1?.inputs).toEqual({ min: 20, x: 50 });
    expect(costStepA1?.sourceCellIds).toEqual(['saw-a1-c2-RAW']);

    const finalStepA1 = result.formulaSteps.find((s) => s.cellId === 'saw-a1-FINAL');
    expect(finalStepA1).toBeDefined();
    expect(finalStepA1?.stage).toBe('FINAL');
    expect(finalStepA1?.result).toBe(0.6);
    expect(finalStepA1?.formulaLabel).toContain('V1 = Σ(w_j * r_1j)');
  });

  it('harus mengembalikan hasil kosong jika input criteria atau alternatives kosong', () => {
    const emptyResult = calculateSAW([], []);
    expect(emptyResult.finalRanking).toEqual([]);
    expect(emptyResult.formulaSteps).toEqual([]);
    expect(emptyResult.intermediateMatrices.normalized).toEqual([]);
    expect(emptyResult.intermediateMatrices.weighted).toEqual([]);
  });
});
