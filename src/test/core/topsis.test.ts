import { describe, it, expect } from 'vitest';
import { calculateTOPSIS } from '@/core/math/topsis';
import type { Criterion, Alternative } from '@/types/domain';

describe('calculateTOPSIS', () => {
  it('harus menghitung D+, D-, C_i dan ranking secara akurat sesuai hitungan manual', () => {
    /**
     * Hitungan Manual:
     * Kriteria:
     * - C1: Benefit, w = 1, normalizedWeight = 0.5
     * - C2: Cost,    w = 1, normalizedWeight = 0.5
     *
     * Alternatif:
     * - A1: C1 = 3, C2 = 4
     * - A2: C1 = 4, C2 = 3
     *
     * Pembagi Vektor:
     * - C1: √(3² + 4²) = √(9 + 16) = √25 = 5
     * - C2: √(4² + 3²) = √(16 + 9) = √25 = 5
     *
     * Matriks Ternormalisasi r_ij:
     * - A1: r11 = 3/5 = 0.6, r12 = 4/5 = 0.8
     * - A2: r21 = 4/5 = 0.8, r22 = 3/5 = 0.6
     *
     * Matriks Terbobot y_ij (w = 0.5):
     * - A1: y11 = 0.5 * 0.6 = 0.3, y12 = 0.5 * 0.8 = 0.4
     * - A2: y21 = 0.5 * 0.8 = 0.4, y22 = 0.5 * 0.6 = 0.3
     *
     * Solusi Ideal:
     * - C1 (Benefit): A+_1 = max(0.3, 0.4) = 0.4; A-_1 = min(0.3, 0.4) = 0.3
     * - C2 (Cost)   : A+_2 = min(0.4, 0.3) = 0.3; A-_2 = max(0.4, 0.3) = 0.4
     *   A+ = [0.4, 0.3]
     *   A- = [0.3, 0.4]
     *
     * Jarak Euclidean:
     * - A1:
     *   D+_1 = √((0.3 - 0.4)² + (0.4 - 0.3)²) = √(0.01 + 0.01) = √0.02 ≈ 0.141421356
     *   D-_1 = √((0.3 - 0.3)² + (0.4 - 0.4)²) = √(0 + 0) = 0
     *   C_1  = D-_1 / (D+_1 + D-_1) = 0 / (0.141421356 + 0) = 0
     *
     * - A2:
     *   D+_2 = √((0.4 - 0.4)² + (0.3 - 0.3)²) = √(0 + 0) = 0
     *   D-_2 = √((0.4 - 0.3)² + (0.3 - 0.4)²) = √(0.01 + 0.01) = √0.02 ≈ 0.141421356
     *   C_2  = D-_2 / (D+_2 + D-_2) = 0.141421356 / (0 + 0.141421356) = 1.0
     *
     * Ranking:
     * 1. A2 (C2 = 1.0)
     * 2. A1 (C1 = 0.0)
     */
    const criteria: Criterion[] = [
      { id: 'c1', name: 'Kualitas', type: 'BENEFIT', weight: 1, normalizedWeight: 0.5 },
      { id: 'c2', name: 'Harga', type: 'COST', weight: 1, normalizedWeight: 0.5 },
    ];

    const alternatives: Alternative[] = [
      { id: 'a1', name: 'Opsi 1', values: { c1: 3, c2: 4 } },
      { id: 'a2', name: 'Opsi 2', values: { c1: 4, c2: 3 } },
    ];

    const result = calculateTOPSIS(criteria, alternatives);

    // Verifikasi titik ideal A+ dan A- untuk Radar Chart
    expect(result.intermediateMatrices.idealPositive).toEqual([[0.4, 0.3]]);
    expect(result.intermediateMatrices.idealNegative).toEqual([[0.3, 0.4]]);

    // Verifikasi ranking akhir
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

    // Verifikasi Jarak Euclidean D+ dan D- pada formulaSteps dengan stage: 'DISTANCE'
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

    // Verifikasi formulaSteps stage 'FINAL' untuk C_i
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
