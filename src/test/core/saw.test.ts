import { describe, it, expect } from 'vitest';
import { calculateSAW } from '@/core/math/saw';
import type { Criterion, Alternative } from '@/types/domain';

describe('calculateSAW', () => {
  it('harus menangani kasus kriteria murni Benefit dengan benar', () => {
    /**
     * Hitungan Manual:
     * Kriteria:
     * - C1: Benefit, w = 0.6
     * - C2: Benefit, w = 0.4
     *
     * Alternatif:
     * - A1: C1=80,  C2=70
     * - A2: C1=100, C2=90
     * - A3: C1=60,  C2=100
     *
     * Nilai Max:
     * - Max C1 = 100
     * - Max C2 = 100
     *
     * Matriks Ternormalisasi (r_ij = x_ij / max):
     * - A1: r11 = 80/100 = 0.8,  r12 = 70/100 = 0.7
     * - A2: r21 = 100/100 = 1.0, r22 = 90/100 = 0.9
     * - A3: r31 = 60/100 = 0.6,  r32 = 100/100 = 1.0
     *
     * Skor Akhir (V_i = w1*r_i1 + w2*r_i2):
     * - V1 = (0.6 * 0.8) + (0.4 * 0.7) = 0.48 + 0.28 = 0.76
     * - V2 = (0.6 * 1.0) + (0.4 * 0.9) = 0.60 + 0.36 = 0.96
     * - V3 = (0.6 * 0.6) + (0.4 * 1.0) = 0.36 + 0.40 = 0.76
     *
     * Ranking:
     * 1. A2 (0.96)
     * 2. A1 / A3 (0.76)
     */
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
    /**
     * Hitungan Manual:
     * Kriteria:
     * - C1: Cost, w = 0.5
     * - C2: Cost, w = 0.5
     *
     * Alternatif:
     * - A1: C1=20, C2=50
     * - A2: C1=40, C2=25
     *
     * Nilai Min:
     * - Min C1 = 20
     * - Min C2 = 25
     *
     * Matriks Ternormalisasi (r_ij = min / x_ij):
     * - A1: r11 = 20/20 = 1.0,  r12 = 25/50 = 0.5
     * - A2: r21 = 20/40 = 0.5,  r22 = 25/25 = 1.0
     *
     * Skor Akhir (V_i = w1*r_i1 + w2*r_i2):
     * - V1 = (0.5 * 1.0) + (0.5 * 0.5) = 0.50 + 0.25 = 0.75
     * - V2 = (0.5 * 0.5) + (0.5 * 1.0) = 0.25 + 0.50 = 0.75
     */
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
    /**
     * Hitungan Manual:
     * Kriteria:
     * - C1: Benefit, w = 0.5
     * - C2: Cost,    w = 0.5
     *
     * Alternatif:
     * - A1: C1=80,  C2=50
     * - A2: C1=100, C2=20
     *
     * Nilai Ekstrim:
     * - Max C1 = 100
     * - Min C2 = 20
     *
     * Normalisasi:
     * - A1:
     *   r11 (Benefit) = 80 / 100 = 0.8
     *   r12 (Cost)    = 20 / 50 = 0.4  <-- Sesuai contoh di spec: min(X)/x12 = 20/50 = 0.4
     *   V1 = (0.5 * 0.8) + (0.5 * 0.4) = 0.4 + 0.2 = 0.60
     *
     * - A2:
     *   r21 (Benefit) = 100 / 100 = 1.0
     *   r22 (Cost)    = 20 / 20 = 1.0
     *   V2 = (0.5 * 1.0) + (0.5 * 1.0) = 0.5 + 0.5 = 1.00
     *
     * Ranking:
     * 1. A2 (Score: 1.00)
     * 2. A1 (Score: 0.60)
     */
    const criteria: Criterion[] = [
      { id: 'c1', name: 'Keuntungan', type: 'BENEFIT', weight: 1, normalizedWeight: 0.5 },
      { id: 'c2', name: 'Biaya', type: 'COST', weight: 1, normalizedWeight: 0.5 },
    ];

    const alternatives: Alternative[] = [
      { id: 'a1', name: 'Opsi A', values: { c1: 80, c2: 50 } },
      { id: 'a2', name: 'Opsi B', values: { c1: 100, c2: 20 } },
    ];

    const result = calculateSAW(criteria, alternatives);

    // Ranking validation
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

    // TraceSteps validation
    const costStepA1 = result.formulaSteps.find(
      (s) => s.cellId === 'saw-a1-c2-NORMALIZED'
    );
    expect(costStepA1).toBeDefined();
    expect(costStepA1?.stage).toBe('NORMALIZED');
    expect(costStepA1?.result).toBe(0.4);
    // Verifikasi format string human-readable persis seperti di spec
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
