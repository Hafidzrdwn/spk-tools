import { describe, it, expect } from 'vitest';
import { calculateWP, WpZeroGuardError } from '@/core/math/wp';
import { wpZeroGuard } from '@/validators/matrixSchemas';
import type { Criterion, Alternative } from '@/types/domain';

describe('calculateWP & wpZeroGuard', () => {
  describe('wpZeroGuard validator', () => {
    it('harus mendeteksi nilai 0 pada kriteria Cost', () => {
      const criteria: Criterion[] = [
        { id: 'c1', name: 'Kecepatan', type: 'BENEFIT', weight: 5, normalizedWeight: 0.5 },
        { id: 'c2', name: 'Harga', type: 'COST', weight: 5, normalizedWeight: 0.5 },
      ];

      const alternatives: Alternative[] = [
        { id: 'a1', name: 'Produk A', values: { c1: 80, c2: 0 } }, // Pelanggaran: c2 bernilai 0
        { id: 'a2', name: 'Produk B', values: { c1: 90, c2: 15 } },
      ];

      const violations = wpZeroGuard(alternatives, criteria);

      expect(violations).toHaveLength(1);
      expect(violations[0]).toEqual({
        alternativeId: 'a1',
        criterionId: 'c2',
      });
    });

    it('tidak boleh menganggap nilai 0 pada kriteria Benefit sebagai pelanggaran zero-guard Cost', () => {
      const criteria: Criterion[] = [
        { id: 'c1', name: 'Bonus', type: 'BENEFIT', weight: 5, normalizedWeight: 0.5 },
        { id: 'c2', name: 'Biaya', type: 'COST', weight: 5, normalizedWeight: 0.5 },
      ];

      const alternatives: Alternative[] = [
        { id: 'a1', name: 'Produk A', values: { c1: 0, c2: 20 } }, // c1=0 (Benefit) dibolehkan
      ];

      const violations = wpZeroGuard(alternatives, criteria);
      expect(violations).toHaveLength(0);
    });
  });

  describe('calculateWP kalkulasi normal', () => {
    it('harus menghitung Vektor S, Vektor V, dan ranking secara akurat sesuai hitungan manual', () => {
      /**
       * Hitungan Manual:
       * Kriteria:
       * - C1: Benefit, w = 3 (w* = +0.5)
       * - C2: Cost,    w = 3 (w* = -0.5)
       * Total bobot = 6, w1 = 0.5, w2 = 0.5
       *
       * Alternatif:
       * - A1: C1 = 4,  C2 = 4
       *   S1 = (4^0.5) * (4^-0.5) = 2 * (1 / 2) = 1.0
       *
       * - A2: C1 = 9,  C2 = 1
       *   S2 = (9^0.5) * (1^-0.5) = 3 * (1 / 1) = 3.0
       *
       * - A3: C1 = 16, C2 = 4
       *   S3 = (16^0.5) * (4^-0.5) = 4 * (1 / 2) = 2.0
       *
       * Total S = 1.0 + 3.0 + 2.0 = 6.0
       *
       * Vektor V (V_i = S_i / Total S):
       * - V1 = 1.0 / 6.0 = 0.166666... (1/6)
       * - V2 = 3.0 / 6.0 = 0.500000... (3/6)
       * - V3 = 2.0 / 6.0 = 0.333333... (2/6)
       *
       * Ranking:
       * 1. A2 (V2 = 0.5)
       * 2. A3 (V3 = 0.3333)
       * 3. A1 (V1 = 0.1667)
       */
      const criteria: Criterion[] = [
        { id: 'c1', name: 'Kapasitas', type: 'BENEFIT', weight: 3, normalizedWeight: 0.5 },
        { id: 'c2', name: 'Harga', type: 'COST', weight: 3, normalizedWeight: 0.5 },
      ];

      const alternatives: Alternative[] = [
        { id: 'a1', name: 'Server A', values: { c1: 4, c2: 4 } },
        { id: 'a2', name: 'Server B', values: { c1: 9, c2: 1 } },
        { id: 'a3', name: 'Server C', values: { c1: 16, c2: 4 } },
      ];

      const result = calculateWP(criteria, alternatives);

      // Verifikasi Vektor S pada intermediateMatrices
      expect(result.intermediateMatrices.vectorS).toEqual([[1.0], [3.0], [2.0]]);

      // Verifikasi Ranking
      expect(result.finalRanking).toHaveLength(3);
      expect(result.finalRanking[0]).toEqual({
        alternativeId: 'a2',
        alternativeName: 'Server B',
        score: 0.5,
        rank: 1,
      });
      expect(result.finalRanking[1].alternativeId).toBe('a3');
      expect(result.finalRanking[1].score).toBeCloseTo(1 / 3, 4);
      expect(result.finalRanking[1].rank).toBe(2);

      expect(result.finalRanking[2].alternativeId).toBe('a1');
      expect(result.finalRanking[2].score).toBeCloseTo(1 / 6, 4);
      expect(result.finalRanking[2].rank).toBe(3);

      // Verifikasi formulaSteps human-readable
      const sStepA1 = result.formulaSteps.find((s) => s.cellId === 'wp-a1-VECTOR_S');
      expect(sStepA1).toBeDefined();
      expect(sStepA1?.formulaLabel).toBe('S1 = Π(x_1j ^ w_j*) = 2 * 0.5 = 1');

      const vStepA2 = result.formulaSteps.find((s) => s.cellId === 'wp-a2-FINAL');
      expect(vStepA2).toBeDefined();
      expect(vStepA2?.formulaLabel).toBe('V2 = S2 / Σ(S) = 3 / 6 = 0.5');
    });
  });

  describe('Zero-Guard Blocking & Error Handling', () => {
    it('harus melempar WpZeroGuardError ketika ada sel 0 di kriteria Cost dan menyebutkan detail spesifik', () => {
      const criteria: Criterion[] = [
        { id: 'c1', name: 'Efisiensi', type: 'BENEFIT', weight: 4, normalizedWeight: 0.5 },
        { id: 'c2', name: 'Biaya Operasional', type: 'COST', weight: 4, normalizedWeight: 0.5 },
      ];

      const alternatives: Alternative[] = [
        { id: 'a1', name: 'Mesin Alpha', values: { c1: 50, c2: 10 } },
        { id: 'a2', name: 'Mesin Beta', values: { c1: 70, c2: 0 } }, // Pelanggaran: 0 pada Cost
      ];

      expect(() => calculateWP(criteria, alternatives)).toThrowError(WpZeroGuardError);

      try {
        calculateWP(criteria, alternatives);
      } catch (err) {
        expect(err).toBeInstanceOf(WpZeroGuardError);
        const zeroErr = err as WpZeroGuardError;
        expect(zeroErr.violations).toEqual([{ alternativeId: 'a2', criterionId: 'c2' }]);
        // Memastikan pesan error menyebutkan alternatif dan kriteria spesifik
        expect(zeroErr.message).toContain('Mesin Beta');
        expect(zeroErr.message).toContain('Biaya Operasional');
        expect(zeroErr.message).toContain('0^-w = Infinity');
      }
    });

    it('harus mengembalikan hasil kosong saat input criteria atau alternatives kosong', () => {
      const emptyResult = calculateWP([], []);
      expect(emptyResult.finalRanking).toEqual([]);
      expect(emptyResult.formulaSteps).toEqual([]);
      expect(emptyResult.intermediateMatrices.vectorS).toEqual([]);
      expect(emptyResult.intermediateMatrices.exponents).toEqual([]);
    });
  });
});
