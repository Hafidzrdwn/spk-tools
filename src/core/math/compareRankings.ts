import type { Criterion, Alternative } from '@/types/domain';
import type { RankingRow } from './types';

export interface MethodRankDetail {
  score: number;
  rank: number;
}

export interface ComparisonRow {
  alternativeId: string;
  alternativeName: string;
  saw: MethodRankDetail;
  wp: MethodRankDetail;
  topsis: MethodRankDetail;
  averageRank: number;
  isConsensusRank1: boolean;
}

export interface CriteriaDifference {
  criterionId: string;
  criterionName: string;
  weight: number;
  valA: number;
  valB: number;
  delta: number;
}

export interface ComparisonResult {
  rows: ComparisonRow[];
  hasRank1Shift: boolean;
  rank1Winners: {
    saw?: RankingRow;
    wp?: RankingRow;
    topsis?: RankingRow;
  };
  explanation: string;
  differences: CriteriaDifference[];
}

export function compareRankings(
  sawRanking: RankingRow[],
  wpRanking: RankingRow[],
  topsisRanking: RankingRow[],
  criteria: Criterion[] = [],
  alternatives: Alternative[] = []
): ComparisonResult {
  const sawWinner = sawRanking.find((r) => r.rank === 1);
  const wpWinner = wpRanking.find((r) => r.rank === 1);
  const topsisWinner = topsisRanking.find((r) => r.rank === 1);

  const winnerIds = new Set(
    [sawWinner?.alternativeId, wpWinner?.alternativeId, topsisWinner?.alternativeId].filter(Boolean)
  );
  const hasRank1Shift = winnerIds.size > 1;

  // Bangun tabel gabungan side-by-side
  const rows: ComparisonRow[] = alternatives.map((alt) => {
    const saw = sawRanking.find((r) => r.alternativeId === alt.id) ?? { score: 0, rank: 99 };
    const wp = wpRanking.find((r) => r.alternativeId === alt.id) ?? { score: 0, rank: 99 };
    const topsis = topsisRanking.find((r) => r.alternativeId === alt.id) ?? { score: 0, rank: 99 };

    const avgRank = Number(((saw.rank + wp.rank + topsis.rank) / 3).toFixed(2));
    const isConsensusRank1 = saw.rank === 1 && wp.rank === 1 && topsis.rank === 1;

    return {
      alternativeId: alt.id,
      alternativeName: alt.name,
      saw: { score: saw.score, rank: saw.rank },
      wp: { score: wp.score, rank: wp.rank },
      topsis: { score: topsis.score, rank: topsis.rank },
      averageRank: avgRank,
      isConsensusRank1,
    };
  });

  // Urutkan berdasarkan rata-rata peringkat terbaik
  rows.sort((a, b) => a.averageRank - b.averageRank);

  // Jika tidak ada pergeseran peringkat 1, berikan konfirmasi konsensus
  if (!hasRank1Shift && sawWinner) {
    return {
      rows,
      hasRank1Shift: false,
      rank1Winners: { saw: sawWinner, wp: wpWinner, topsis: topsisWinner },
      explanation: `Seluruh metode (SAW, WP, TOPSIS) secara konsisten merekomendasikan "${sawWinner.alternativeName}" sebagai alternatif terbaik peringkat #1. Terdapat konsensus penuh antar paradigma linier, multiplikatif, dan geometri.`,
      differences: [],
    };
  }

  // Jika ada pergeseran ranking 1, lakukan analisis komparasi kriteria aktual
  const altSaw = alternatives.find((a) => a.id === sawWinner?.alternativeId);
  const altTopsis = alternatives.find((a) => a.id === topsisWinner?.alternativeId);
  const differences: CriteriaDifference[] = [];

  if (altSaw && altTopsis) {
    criteria.forEach((c) => {
      const vSaw = altSaw.values[c.id] ?? 0;
      const vTop = altTopsis.values[c.id] ?? 0;
      differences.push({
        criterionId: c.id,
        criterionName: c.name,
        weight: c.weight,
        valA: vSaw,
        valB: vTop,
        delta: vSaw - vTop,
      });
    });
  }

  // Kriteria di mana SAW unggul & TOPSIS unggul
  const sawStrong = differences.filter((d) => (criteria.find(c => c.id === d.criterionId)?.type === 'COST' ? d.delta < 0 : d.delta > 0));
  const topsisStrong = differences.filter((d) => (criteria.find(c => c.id === d.criterionId)?.type === 'COST' ? d.delta > 0 : d.delta < 0));

  let explanation = '';
  if (sawWinner && topsisWinner && sawWinner.alternativeId !== topsisWinner.alternativeId) {
    const sawAdvText = sawStrong.map((s) => `${s.criterionName} (${s.valA} vs ${s.valB}, bobot ${s.weight})`).join(', ') || 'kriteria tertentu';
    const topAdvText = topsisStrong.map((s) => `${s.criterionName} (${s.valB} vs ${s.valA})`).join(', ') || 'kriteria lainnya';

    explanation = `Pergeseran peringkat #1 terjadi antara SAW ("${sawWinner.alternativeName}") dan TOPSIS ("${topsisWinner.alternativeName}"). ` +
      `Pada SAW (model aditif linier), "${sawWinner.alternativeName}" menduduki posisi teratas karena keunggulan mencolok pada ${sawAdvText}, ` +
      `yang mengompensasi nilai lainnya. Sebaliknya, pada TOPSIS (jarak Euclidean), "${topsisWinner.alternativeName}" menang karena memiliki ` +
      `profil nilai yang lebih merata terhadap titik ideal positif A+, sedangkan kelemahan "${sawWinner.alternativeName}" pada ${topAdvText} ` +
      `dihukum secara kuadratik (y - A+)² sehingga menjauhkannya dari solusi ideal.`;
  } else if (wpWinner && sawWinner && wpWinner.alternativeId !== sawWinner.alternativeId) {
    explanation = `Pergeseran peringkat #1 terjadi antara SAW ("${sawWinner.alternativeName}") dan WP ("${wpWinner.alternativeName}"). ` +
      `Sifat perkalian pangkat eksponensial pada metode WP memberikan penalti lebih berat terhadap nilai kriteria yang rendah dibandingkan penjumlahan linier pada SAW.`;
  } else {
    explanation = `Terjadi pergeseran preferensi peringkat #1 antar metode akibat perbedaan pemodelan matematis normalisasi dan fungsi agregasi nilai.`;
  }

  return {
    rows,
    hasRank1Shift: true,
    rank1Winners: { saw: sawWinner, wp: wpWinner, topsis: topsisWinner },
    explanation,
    differences,
  };
}

export default compareRankings;
