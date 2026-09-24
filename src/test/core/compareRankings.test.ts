import { describe, it, expect } from 'vitest';
import { calculateSAW } from '@/core/math/saw';
import { calculateWP } from '@/core/math/wp';
import { calculateTOPSIS } from '@/core/math/topsis';
import { compareRankings } from '@/core/math/compareRankings';
import type { Criterion, Alternative } from '@/types/domain';

describe('compareRankings & Rank Shift Analysis', () => {
  it('harus mendeteksi pergeseran peringkat #1 antara SAW dan TOPSIS pada dataset sensitif', () => {
    // Dataset di mana A1 (Spesialis Kriteria 1) vs A2 (Seimbang di semua kriteria)
    // C1 berbobot cukup tinggi (Benefit), C2 (Benefit), C3 (Benefit)
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

    // Jalankan pembanding
    const comparison = compareRankings(
      sawRes.finalRanking,
      wpRes.finalRanking,
      topsisRes.finalRanking,
      criteria,
      alternatives
    );

    // Verifikasi pergeseran peringkat #1
    expect(comparison.hasRank1Shift).toBe(true);
    expect(comparison.rank1Winners.saw?.alternativeId).not.toBe(
      comparison.rank1Winners.topsis?.alternativeId
    );

    // Pemenang SAW dan TOPSIS terbukti berbeda
    expect(sawRank1.alternativeName).toBe('Server Balance (Harmonis)');
    expect(topsisRank1.alternativeName).toBe('Server Titan (Spesialis Kapasitas)');

    // Penjelasan harus kontekstual dan menyebut nama kriteria aktual serta kedua alternatif
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
});
