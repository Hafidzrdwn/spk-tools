import { describe, it, expect } from 'vitest';
import { calculateAHP } from '@/core/math/ahp';
import { checkConsistency, suggestConsistencyFix } from '@/core/math/ahp-consistency';
import { RANDOM_INDEX_TABLE } from '@/core/constants/randomIndexTable';
import { SAATY_SCALE } from '@/core/constants/saatyScale';
import type { Criterion } from '@/types/domain';

describe('AHP Constants, calculateAHP & Consistency Check', () => {
  it('harus memuat tabel RANDOM_INDEX_TABLE dan SAATY_SCALE sesuai spesifikasi', () => {
    expect(RANDOM_INDEX_TABLE[1]).toBe(0);
    expect(RANDOM_INDEX_TABLE[2]).toBe(0);
    expect(RANDOM_INDEX_TABLE[3]).toBe(0.58);
    expect(RANDOM_INDEX_TABLE[4]).toBe(0.9);
    expect(RANDOM_INDEX_TABLE[10]).toBe(1.49);

    expect(SAATY_SCALE).toHaveLength(9);
    expect(SAATY_SCALE[0].value).toBe(1);
    expect(SAATY_SCALE[8].value).toBe(9);
  });

  it('harus menghitung priority vector dan CR dengan benar untuk kasus konsisten (CR <= 0.1)', () => {
    /**
     * Hitungan Manual Matriks Konsisten 3x3:
     * A = [
     *   [1,   3,   5],
     *   [1/3, 1,   2],
     *   [1/5, 1/2, 1]
     * ]
     *
     * 1. Jumlah Kolom:
     *    Col 1 = 1 + 1/3 + 1/5 = 23/15 = 1.5333...
     *    Col 2 = 3 + 1 + 0.5   = 4.5
     *    Col 3 = 5 + 2 + 1     = 8.0
     *
     * 2. Rata-rata Normalisasi Baris (Priority Vector w):
     *    w1 = ((1 / 1.5333) + (3 / 4.5) + (5 / 8)) / 3 ≈ (0.6522 + 0.6667 + 0.625) / 3 ≈ 0.6479
     *    w2 = ((1/3 / 1.5333) + (1 / 4.5) + (2 / 8)) / 3 ≈ (0.2174 + 0.2222 + 0.250) / 3 ≈ 0.2299
     *    w3 = ((1/5 / 1.5333) + (0.5 / 4.5) + (1 / 8)) / 3 ≈ (0.1304 + 0.1111 + 0.125) / 3 ≈ 0.1222
     *
     * 3. Weighted Sum Vector (A x w):
     *    WSV_1 = 1*(0.6479) + 3*(0.2299) + 5*(0.1222) ≈ 1.9486
     *    WSV_2 = (1/3)*(0.6479) + 1*(0.2299) + 2*(0.1222) ≈ 0.6903
     *    WSV_3 = (1/5)*(0.6479) + 0.5*(0.2299) + 1*(0.1222) ≈ 0.3668
     *
     * 4. λmax & Rasio Konsistensi:
     *    λ1 = 1.9486 / 0.6479 ≈ 3.0076
     *    λ2 = 0.6903 / 0.2299 ≈ 3.0026
     *    λ3 = 0.3668 / 0.1222 ≈ 3.0016
     *    λmax ≈ 3.0037
     *
     *    CI = (λmax - 3) / (3 - 1) = (3.0037 - 3) / 2 ≈ 0.00185
     *    RI(3) = 0.58
     *    CR = CI / RI = 0.00185 / 0.58 ≈ 0.0032
     *
     *    Karena CR = 0.0032 ≤ 0.10, matriks terbukti KONSISTEN.
     */
    const matrix = [
      [1, 3, 5],
      [1 / 3, 1, 2],
      [1 / 5, 1 / 2, 1],
    ];

    const criteria: Criterion[] = [
      { id: 'c1', name: 'Kualitas', type: 'BENEFIT', weight: 0, normalizedWeight: 0 },
      { id: 'c2', name: 'Harga', type: 'COST', weight: 0, normalizedWeight: 0 },
      { id: 'c3', name: 'Pelayanan', type: 'BENEFIT', weight: 0, normalizedWeight: 0 },
    ];

    const result = calculateAHP(matrix, criteria);

    // Priority vector validation
    expect(result.priorityVector[0]).toBeCloseTo(0.6479, 3);
    expect(result.priorityVector[1]).toBeCloseTo(0.2299, 3);
    expect(result.priorityVector[2]).toBeCloseTo(0.1222, 3);

    // Total bobot prioritas harus 1.0
    const sumW = result.priorityVector.reduce((a, b) => a + b, 0);
    expect(sumW).toBeCloseTo(1.0, 5);

    // Consistency validation
    expect(result.consistency.lambdaMax).toBeCloseTo(3.0037, 3);
    expect(result.consistency.ci).toBeCloseTo(0.00185, 4);
    expect(result.consistency.cr).toBeCloseTo(0.0032, 3);
    expect(result.consistency.cr).toBeLessThanOrEqual(0.1);
    expect(result.consistency.isConsistent).toBe(true);

    // Tidak ada saran perbaikan yang diperlukan jika konsisten
    expect(result.suggestion).toBeNull();

    // Verifikasi ranking
    expect(result.finalRanking[0].alternativeId).toBe('c1');
    expect(result.finalRanking[0].rank).toBe(1);
    expect(result.finalRanking[1].alternativeId).toBe('c2');
    expect(result.finalRanking[1].rank).toBe(2);
    expect(result.finalRanking[2].alternativeId).toBe('c3');
    expect(result.finalRanking[2].rank).toBe(3);
  });

  it('harus mendeteksi matriks tidak konsisten (CR > 0.1) dan memberikan suggestConsistencyFix yang logis', () => {
    /**
     * Hitungan Manual Matriks Tidak Konsisten 3x3:
     * A = [
     *   [1,   5,   1/3],
     *   [1/5, 1,   7  ],
     *   [3,   1/7, 1  ]
     * ]
     * Terjadi kontradiksi siklik:
     * K1 > K2 (5), K2 > K3 (7), tetapi K3 > K1 (3).
     * Akibatnya λmax jauh di atas 3, CI besar, dan CR > 0.10.
     */
    const matrix = [
      [1, 5, 1 / 3],
      [1 / 5, 1, 7],
      [3, 1 / 7, 1],
    ];

    const criteria: Criterion[] = [
      { id: 'c1', name: 'Kriteria A', type: 'BENEFIT', weight: 0, normalizedWeight: 0 },
      { id: 'c2', name: 'Kriteria B', type: 'BENEFIT', weight: 0, normalizedWeight: 0 },
      { id: 'c3', name: 'Kriteria C', type: 'BENEFIT', weight: 0, normalizedWeight: 0 },
    ];

    const result = calculateAHP(matrix, criteria);

    // CR harus lebih besar dari 0.10
    expect(result.consistency.cr).toBeGreaterThan(0.1);
    expect(result.consistency.isConsistent).toBe(false);

    // suggestConsistencyFix harus menghasilkan saran perbaikan konkret
    expect(result.suggestion).not.toBeNull();
    const suggestion = result.suggestion!;
    expect(suggestion.i).toBeDefined();
    expect(suggestion.j).toBeDefined();
    expect(suggestion.i).toBeLessThan(suggestion.j);
    expect(suggestion.suggestedValue).toBeGreaterThan(0);
    expect(suggestion.message).toContain('Inkonsistensi terbesar');
  });

  it('harus otomatis konsisten untuk matriks ordo n = 2', () => {
    const matrix = [
      [1, 3],
      [1 / 3, 1],
    ];

    const consistency = checkConsistency(matrix, [0.75, 0.25]);
    expect(consistency.ci).toBe(0);
    expect(consistency.cr).toBe(0);
    expect(consistency.isConsistent).toBe(true);

    const suggestion = suggestConsistencyFix(matrix, [0.75, 0.25]);
    expect(suggestion).toBeNull();
  });
});
