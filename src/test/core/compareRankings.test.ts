import { describe, it, expect } from 'vitest';
import { calculateSAW } from '@/core/math/saw';
import { calculateWP } from '@/core/math/wp';
import { calculateTOPSIS } from '@/core/math/topsis';
import { compareRankings } from '@/core/math/compareRankings';
import type { Criterion, Alternative } from '@/types/domain';

describe('compareRankings & Rank Shift Analysis', () => {
  it('harus mendeteksi pergeseran peringkat #1 antara SAW dan TOPSIS pada dataset sensitif', () => {
    const criteria: Criterion[] = [
      { id: 'c1', name: 'Kapasitas', type: 'BENEFIT', weight: 70, normalizedWeight: 0.7 },
      { id: 'c2', name: 'Efisiensi', type: 'BENEFIT', weight: 15, normalizedWeight: 0.15 },
      { id: 'c3', name: 'Keandalan', type: 'BENEFIT', weight: 15, normalizedWeight: 0.15 },
    ];

    const alternatives: Alternative[] = [
      {
        id: 'alt1',
        name: 'Server Titan (Spesialis Kapasitas)',
        values: { c1: 100, c2: 20, c3: 20 },
      },
      {
        id: 'alt2',
        name: 'Server Balance (Harmonis)',
        values: { c1: 75, c2: 85, c3: 85 },
      },
      {
        id: 'alt3',
        name: 'Server Entry',
        values: { c1: 40, c2: 30, c3: 30 },
      },
    ];

    const sawRes = calculateSAW(criteria, alternatives);
    const wpRes = calculateWP(criteria, alternatives);
    const topsisRes = calculateTOPSIS(criteria, alternatives);

    const sawRank1 = sawRes.finalRanking[0];
    const topsisRank1 = topsisRes.finalRanking[0];

    const comparison = compareRankings(
      sawRes.finalRanking,
      wpRes.finalRanking,
      topsisRes.finalRanking,
      criteria,
      alternatives
    );

    expect(comparison.hasRank1Shift).toBe(true);
    expect(comparison.rank1Winners.saw?.alternativeId).not.toBe(
      comparison.rank1Winners.topsis?.alternativeId
    );

    expect(sawRank1.alternativeName).toBe('Server Balance (Harmonis)');
    expect(topsisRank1.alternativeName).toBe('Server Titan (Spesialis Kapasitas)');

    expect(comparison.explanation).toContain('Server Titan (Spesialis Kapasitas)');
    expect(comparison.explanation).toContain('Server Balance (Harmonis)');
    expect(comparison.explanation).toContain('Kapasitas');
    expect(comparison.explanation).toContain('Euclidean');
  });

  it('harus memberikan status konsensus penuh jika peringkat #1 sama di semua metode', () => {
    const criteria: Criterion[] = [
      { id: 'c1', name: 'Kualitas', type: 'BENEFIT', weight: 60, normalizedWeight: 0.6 },
      { id: 'c2', name: 'Harga', type: 'COST', weight: 40, normalizedWeight: 0.4 },
    ];

    const alternatives: Alternative[] = [
      { id: 'alt1', name: 'Opsi Unggul', values: { c1: 95, c2: 10 } },
      { id: 'alt2', name: 'Opsi Biasa', values: { c1: 50, c2: 50 } },
    ];

    const sawRes = calculateSAW(criteria, alternatives);
    const wpRes = calculateWP(criteria, alternatives);
    const topsisRes = calculateTOPSIS(criteria, alternatives);

    const comparison = compareRankings(
      sawRes.finalRanking,
      wpRes.finalRanking,
      topsisRes.finalRanking,
      criteria,
      alternatives
    );

    expect(comparison.hasRank1Shift).toBe(false);
    expect(comparison.rows[0].isConsensusRank1).toBe(true);
    expect(comparison.explanation).toContain('konsensus');
  });

  it('harus mendukung komparasi 2 metode saja (misal SAW & WP) dan menghitung rerata peringkat secara dinamis', () => {
    const criteria: Criterion[] = [
      { id: 'c1', name: 'K1', type: 'BENEFIT', weight: 50, normalizedWeight: 0.5 },
      { id: 'c2', name: 'K2', type: 'BENEFIT', weight: 50, normalizedWeight: 0.5 },
    ];

    const alternatives: Alternative[] = [
      { id: 'a1', name: 'Alt 1', values: { c1: 90, c2: 70 } },
      { id: 'a2', name: 'Alt 2', values: { c1: 80, c2: 85 } },
    ];

    const sawRes = calculateSAW(criteria, alternatives);
    const wpRes = calculateWP(criteria, alternatives);
    const topsisRes = calculateTOPSIS(criteria, alternatives);

    const comparison = compareRankings(
      sawRes.finalRanking,
      wpRes.finalRanking,
      topsisRes.finalRanking,
      criteria,
      alternatives,
      ['saw', 'wp']
    );

    expect(comparison.activeMethods).toEqual(['saw', 'wp']);
    comparison.rows.forEach((row) => {
      const manualAvg = Number(((row.saw.rank + row.wp.rank) / 2).toFixed(2));
      expect(row.averageRank).toBe(manualAvg);
      expect(row.shift).toBeDefined();
      expect(['stable', 'up', 'down', 'divergent']).toContain(row.shift!.type);
    });
  });

  it('harus menghasilkan analisis sensitivitas margin selisih skor antar peringkat', () => {
    const criteria: Criterion[] = [
      { id: 'c1', name: 'K1', type: 'BENEFIT', weight: 70, normalizedWeight: 0.7 },
      { id: 'c2', name: 'K2', type: 'BENEFIT', weight: 15, normalizedWeight: 0.15 },
      { id: 'c3', name: 'K3', type: 'BENEFIT', weight: 15, normalizedWeight: 0.15 },
    ];

    const alternatives: Alternative[] = [
      { id: 'alt1', name: 'Server Titan', values: { c1: 100, c2: 20, c3: 20 } },
      { id: 'alt2', name: 'Server Balance', values: { c1: 75, c2: 85, c3: 85 } },
      { id: 'alt3', name: 'Server Entry', values: { c1: 40, c2: 30, c3: 30 } },
    ];

    const sawRes = calculateSAW(criteria, alternatives);
    const wpRes = calculateWP(criteria, alternatives);
    const topsisRes = calculateTOPSIS(criteria, alternatives);

    const comparison = compareRankings(
      sawRes.finalRanking,
      wpRes.finalRanking,
      topsisRes.finalRanking,
      criteria,
      alternatives,
      ['saw', 'topsis']
    );

    expect(comparison.sensitivity).toBeDefined();
    expect(comparison.sensitivity!.statement).toBeTruthy();
    expect(Array.isArray(comparison.sensitivity!.gaps)).toBe(true);
    expect(comparison.sensitivity!.gaps.length).toBeGreaterThan(0);
    comparison.sensitivity!.gaps.forEach((gap) => {
      expect(typeof gap.gap).toBe('number');
      expect(gap.gap).toBeGreaterThanOrEqual(0);
      expect(typeof gap.isTight).toBe('boolean');
    });
  });
});
