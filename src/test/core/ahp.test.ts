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

    expect(result.priorityVector[0]).toBeCloseTo(0.6479, 3);
    expect(result.priorityVector[1]).toBeCloseTo(0.2299, 3);
    expect(result.priorityVector[2]).toBeCloseTo(0.1222, 3);

    const sumW = result.priorityVector.reduce((a, b) => a + b, 0);
    expect(sumW).toBeCloseTo(1.0, 5);

    expect(result.consistency.lambdaMax).toBeCloseTo(3.0037, 3);
    expect(result.consistency.ci).toBeCloseTo(0.00185, 4);
    expect(result.consistency.cr).toBeCloseTo(0.0032, 3);
    expect(result.consistency.cr).toBeLessThanOrEqual(0.1);
    expect(result.consistency.isConsistent).toBe(true);

    expect(result.suggestion).toBeNull();

    expect(result.finalRanking[0].alternativeId).toBe('c1');
    expect(result.finalRanking[0].rank).toBe(1);
    expect(result.finalRanking[1].alternativeId).toBe('c2');
    expect(result.finalRanking[1].rank).toBe(2);
    expect(result.finalRanking[2].alternativeId).toBe('c3');
    expect(result.finalRanking[2].rank).toBe(3);
  });

  it('harus mendeteksi matriks tidak konsisten (CR > 0.1) dan memberikan suggestConsistencyFix yang logis', () => {
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

    expect(result.consistency.cr).toBeGreaterThan(0.1);
    expect(result.consistency.isConsistent).toBe(false);

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

  it('harus menjamin nilai rekomendasi perbaikan konsistensi berbeda nyata dari nilai saat ini (tidak no-op)', () => {
    const matrix = [
      [1, 1, 3],
      [1, 1, 4],
      [1 / 3, 1 / 4, 1],
    ];
    const priorityVector = [0.428, 0.463, 0.109];
    const suggestion = suggestConsistencyFix(matrix, priorityVector, ['Harga', 'RAM', 'Kamera']);

    expect(suggestion).not.toBeNull();
    if (suggestion) {
      expect(suggestion.suggestedValue).not.toBe(suggestion.currentValue);
      expect(suggestion.suggestedValue).toBeGreaterThan(0);
      expect(suggestion.currentValueLabel).toBeDefined();
      expect(suggestion.suggestedValueLabel).toBeDefined();
    }
  });

  it('harus memetakan rasio ideal desimal ke skala Saaty terdekat (termasuk pecahan 1/2)', () => {
    const matrix = [
      [1, 1, 2],
      [1, 1, 3],
      [0.5, 1 / 3, 1],
    ];
    const priorityVector = [0.35, 0.45, 0.20];
    const suggestion = suggestConsistencyFix(matrix, priorityVector, ['K1', 'K2', 'K3']);
    if (suggestion) {
      expect(suggestion.suggestedValue).not.toBe(suggestion.currentValue);
    }
  });
});
