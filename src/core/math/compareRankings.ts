import type { Criterion, Alternative } from '@/types/domain';
import type { RankingRow } from './types';

export type CompareMethod = 'saw' | 'wp' | 'topsis';

export interface MethodRankDetail {
  score: number;
  rank: number;
}

export interface RankShiftDetail {
  type: 'stable' | 'up' | 'down' | 'divergent';
  label: string; // e.g. "Tetap", "Naik 1", "Turun 2", "Rentang #2 - #4"
  delta?: number;
  minRank: number;
  maxRank: number;
  details: string;
}

export interface ComparisonRow {
  alternativeId: string;
  alternativeName: string;
  saw: MethodRankDetail;
  wp: MethodRankDetail;
  topsis: MethodRankDetail;
  averageRank: number;
  isConsensusRank1: boolean;
  shift?: RankShiftDetail;
}

export interface CriteriaDifference {
  criterionId: string;
  criterionName: string;
  weight: number;
  valA: number;
  valB: number;
  delta: number;
}

export interface MethodScoreGap {
  method: CompareMethod;
  methodName: string;
  higherRank: number;
  higherAltName: string;
  lowerRank: number;
  lowerAltName: string;
  gap: number;
  isTight: boolean;
}

export interface SensitivityInsight {
  hasTightMargins: boolean;
  tightRankRange?: { startRank: number; endRank: number; altNames: string[] };
  statement: string;
  gaps: MethodScoreGap[];
}

export interface ComparisonResult {
  activeMethods?: CompareMethod[];
  rows: ComparisonRow[];
  hasRank1Shift: boolean;
  rank1Winners: {
    saw?: RankingRow;
    wp?: RankingRow;
    topsis?: RankingRow;
  };
  explanation: string;
  differences: CriteriaDifference[];
  sensitivity?: SensitivityInsight;
}

export function compareRankings(
  sawRanking: RankingRow[],
  wpRanking: RankingRow[],
  topsisRanking: RankingRow[],
  criteria: Criterion[] = [],
  alternatives: Alternative[] = [],
  activeMethods: CompareMethod[] = ['saw', 'wp', 'topsis']
): ComparisonResult {
  const validActiveMethods: CompareMethod[] =
    activeMethods && activeMethods.length >= 2 ? activeMethods : ['saw', 'wp', 'topsis'];

  const sawWinner = sawRanking.find((r) => r.rank === 1);
  const wpWinner = wpRanking.find((r) => r.rank === 1);
  const topsisWinner = topsisRanking.find((r) => r.rank === 1);

  // Filter pemenang berdasarkan metode aktif saja
  const activeWinnerMap: Record<CompareMethod, RankingRow | undefined> = {
    saw: sawWinner,
    wp: wpWinner,
    topsis: topsisWinner,
  };

  const activeWinnerIds = new Set(
    validActiveMethods.map((m) => activeWinnerMap[m]?.alternativeId).filter(Boolean)
  );
  const hasRank1Shift = activeWinnerIds.size > 1;

  // Bangun tabel gabungan side-by-side
  const rows: ComparisonRow[] = alternatives.map((alt) => {
    const saw = sawRanking.find((r) => r.alternativeId === alt.id) ?? { score: 0, rank: 99 };
    const wp = wpRanking.find((r) => r.alternativeId === alt.id) ?? { score: 0, rank: 99 };
    const topsis = topsisRanking.find((r) => r.alternativeId === alt.id) ?? { score: 0, rank: 99 };

    // Hitung rerata peringkat dinamis hanya untuk metode yang aktif
    const activeRanks = validActiveMethods.map((m) => {
      if (m === 'saw') return saw.rank;
      if (m === 'wp') return wp.rank;
      return topsis.rank;
    });

    const avgRank = Number(
      (activeRanks.reduce((acc, r) => acc + r, 0) / activeRanks.length).toFixed(2)
    );

    const isConsensusRank1 = validActiveMethods.every((m) => {
      if (m === 'saw') return saw.rank === 1;
      if (m === 'wp') return wp.rank === 1;
      return topsis.rank === 1;
    });

    // Hitung pergeseran posisi (shift detail)
    const minRank = Math.min(...activeRanks);
    const maxRank = Math.max(...activeRanks);
    let shift: RankShiftDetail;

    if (validActiveMethods.length === 2) {
      const m1 = validActiveMethods[0];
      const m2 = validActiveMethods[1];
      const r1 = m1 === 'saw' ? saw.rank : m1 === 'wp' ? wp.rank : topsis.rank;
      const r2 = m2 === 'saw' ? saw.rank : m2 === 'wp' ? wp.rank : topsis.rank;
      const diff = r1 - r2; // Jika r2 < r1 (misal #2 vs #1), berarti naik 1 posisi di m2

      if (diff === 0) {
        shift = {
          type: 'stable',
          label: 'Tetap',
          delta: 0,
          minRank,
          maxRank,
          details: `Posisi tetap di peringkat #${r1} pada ${m1.toUpperCase()} & ${m2.toUpperCase()}`,
        };
      } else if (diff > 0) {
        shift = {
          type: 'up',
          label: `Naik ${diff}`,
          delta: diff,
          minRank,
          maxRank,
          details: `Naik ${diff} posisi (${m1.toUpperCase()} #${r1} → ${m2.toUpperCase()} #${r2})`,
        };
      } else {
        const absDiff = Math.abs(diff);
        shift = {
          type: 'down',
          label: `Turun ${absDiff}`,
          delta: -absDiff,
          minRank,
          maxRank,
          details: `Turun ${absDiff} posisi (${m1.toUpperCase()} #${r1} → ${m2.toUpperCase()} #${r2})`,
        };
      }
    } else {
      // 3 metode aktif
      const span = maxRank - minRank;
      if (span === 0) {
        shift = {
          type: 'stable',
          label: 'Tetap',
          delta: 0,
          minRank,
          maxRank,
          details: `Posisi seragam di peringkat #${minRank} pada seluruh metode`,
        };
      } else {
        shift = {
          type: 'divergent',
          label: `Rentang #${minRank} - #${maxRank}`,
          delta: span,
          minRank,
          maxRank,
          details: `Pergeseran ${span} posisi (tertinggi #${minRank}, terendah #${maxRank})`,
        };
      }
    }

    return {
      alternativeId: alt.id,
      alternativeName: alt.name,
      saw: { score: saw.score, rank: saw.rank },
      wp: { score: wp.score, rank: wp.rank },
      topsis: { score: topsis.score, rank: topsis.rank },
      averageRank: avgRank,
      isConsensusRank1,
      shift,
    };
  });

  // Urutkan berdasarkan rata-rata peringkat terbaik metode aktif
  rows.sort((a, b) => a.averageRank - b.averageRank);

  // Analisis Selisih Skor (Score Gap) antar peringkat yang berurutan per metode aktif
  const allGaps: MethodScoreGap[] = [];
  const tightGaps: MethodScoreGap[] = [];

  validActiveMethods.forEach((m) => {
    const ranking = m === 'saw' ? sawRanking : m === 'wp' ? wpRanking : topsisRanking;
    const sorted = [...ranking].sort((a, b) => a.rank - b.rank);

    for (let i = 0; i < sorted.length - 1; i++) {
      const higher = sorted[i];
      const lower = sorted[i + 1];
      const gap = Number(Math.abs(higher.score - lower.score).toFixed(4));
      // Ambang batas selisih tipis: <= 0.02
      const isTight = gap <= 0.02;

      const gapItem: MethodScoreGap = {
        method: m,
        methodName: m.toUpperCase(),
        higherRank: higher.rank,
        higherAltName: higher.alternativeName,
        lowerRank: lower.rank,
        lowerAltName: lower.alternativeName,
        gap,
        isTight,
      };

      allGaps.push(gapItem);
      if (isTight) {
        tightGaps.push(gapItem);
      }
    }
  });

  // Susun Wawasan Sensitivitas Nilai & Pernyataan Selisih Tipis
  const shiftingRows = rows.filter((r) => r.shift && r.shift.type !== 'stable');
  const hasTightMargins = tightGaps.length > 0;
  let sensitivityStatement = '';
  let tightRankRange: { startRank: number; endRank: number; altNames: string[] } | undefined;

  if (shiftingRows.length > 0 && hasTightMargins) {
    const shiftRanks = shiftingRows
      .map((r) => r.shift?.minRank ?? 1)
      .concat(shiftingRows.map((r) => r.shift?.maxRank ?? 1));
    const startRank = Math.min(...shiftRanks);
    const endRank = Math.max(...shiftRanks);
    const altNames = shiftingRows.map((r) => r.alternativeName);
    tightRankRange = { startRank, endRank, altNames };

    // Ambil contoh selisih tipis dari metode aktif
    const gapSnippets = validActiveMethods.map((m) => {
      const mGaps = tightGaps.filter((g) => g.method === m);
      if (mGaps.length > 0) {
        const topG = mGaps[0];
        return `Di ${m.toUpperCase()}, ${topG.higherAltName} dan ${topG.lowerAltName} hanya berselisih ${topG.gap}`;
      }
      return null;
    }).filter(Boolean);

    const gapText = gapSnippets.length > 0 ? gapSnippets.join('. ') + '. ' : '';

    sensitivityStatement =
      `Satu hal penting yang perlu dicatat: selisih skor pada peringkat ${startRank} sampai ${endRank} sangat tipis. ` +
      gapText +
      `Jadi perubahan posisi peringkat lebih dipicu oleh sensitivitas formula matematis antar metode terhadap nilai yang berdekatan, bukan karena disparitas kualitas alternatif yang besar.`;
  } else if (hasRank1Shift) {
    sensitivityStatement =
      `Terjadi pergeseran peringkat antar metode akibat perbedaan pemodelan matematis agregasi nilai, dengan margin diferensiasi skor yang cukup tegas antar alternatif.`;
  } else {
    sensitivityStatement =
      `Seluruh metode (${validActiveMethods.map((m) => m.toUpperCase()).join(', ')}) menghasilkan urutan peringkat yang seragam dan konsisten dengan pemisahan skor yang jelas.`;
  }

  const sensitivity: SensitivityInsight = {
    hasTightMargins,
    tightRankRange,
    statement: sensitivityStatement,
    gaps: allGaps,
  };

  // Jika tidak ada pergeseran peringkat 1 antar metode aktif
  if (!hasRank1Shift) {
    const winnerAlt = activeWinnerMap[validActiveMethods[0]];
    const methodNames = validActiveMethods.map((m) => m.toUpperCase()).join(', ');
    return {
      activeMethods: validActiveMethods,
      rows,
      hasRank1Shift: false,
      rank1Winners: { saw: sawWinner, wp: wpWinner, topsis: topsisWinner },
      explanation: `Metode yang dipilih (${methodNames}) secara konsisten merekomendasikan "${winnerAlt?.alternativeName || 'Alternatif Terbaik'}" sebagai peringkat #1. Terdapat konsensus penuh antar metode aktif.`,
      differences: [],
      sensitivity,
    };
  }

  // Jika ada pergeseran ranking 1, lakukan analisis komparasi kriteria aktual
  const m1 = validActiveMethods[0];
  const m2 = validActiveMethods[1];
  const winA = activeWinnerMap[m1];
  const winB = activeWinnerMap[m2];

  const altA = alternatives.find((a) => a.id === winA?.alternativeId);
  const altB = alternatives.find((a) => a.id === winB?.alternativeId);
  const differences: CriteriaDifference[] = [];

  if (altA && altB) {
    criteria.forEach((c) => {
      const vA = altA.values[c.id] ?? 0;
      const vB = altB.values[c.id] ?? 0;
      differences.push({
        criterionId: c.id,
        criterionName: c.name,
        weight: c.weight,
        valA: vA,
        valB: vB,
        delta: vA - vB,
      });
    });
  }

  const aStrong = differences.filter((d) => (criteria.find(c => c.id === d.criterionId)?.type === 'COST' ? d.delta < 0 : d.delta > 0));
  const bStrong = differences.filter((d) => (criteria.find(c => c.id === d.criterionId)?.type === 'COST' ? d.delta > 0 : d.delta < 0));

  let explanation = '';
  if (sawWinner && topsisWinner && sawWinner.alternativeId !== topsisWinner.alternativeId && validActiveMethods.includes('saw') && validActiveMethods.includes('topsis')) {
    const sawAdvText = aStrong.map((s) => `${s.criterionName} (${s.valA} vs ${s.valB}, bobot ${s.weight})`).join(', ') || 'kriteria tertentu';
    const topAdvText = bStrong.map((s) => `${s.criterionName} (${s.valB} vs ${s.valA})`).join(', ') || 'kriteria lainnya';

    explanation = `Pergeseran peringkat #1 terjadi antara SAW ("${sawWinner.alternativeName}") dan TOPSIS ("${topsisWinner.alternativeName}"). ` +
      `Pada SAW (model aditif linier), "${sawWinner.alternativeName}" menduduki posisi teratas karena keunggulan pada ${sawAdvText}. ` +
      `Sebaliknya, pada TOPSIS (jarak Euclidean), "${topsisWinner.alternativeName}" menang karena memiliki ` +
      `profil nilai yang lebih seimbang terhadap titik ideal positif A+, sedangkan kelemahan "${sawWinner.alternativeName}" pada ${topAdvText} ` +
      `dihukum secara kuadratik (y - A+)² sehingga menjauhkannya dari solusi ideal.`;
  } else if (wpWinner && sawWinner && wpWinner.alternativeId !== sawWinner.alternativeId && validActiveMethods.includes('saw') && validActiveMethods.includes('wp')) {
    explanation = `Pergeseran peringkat #1 terjadi antara SAW ("${sawWinner.alternativeName}") dan WP ("${wpWinner.alternativeName}"). ` +
      `Sifat perkalian pangkat eksponensial pada metode WP memberikan penalti lebih berat terhadap nilai kriteria yang rendah dibandingkan penjumlahan linier pada SAW.`;
  } else if (wpWinner && topsisWinner && wpWinner.alternativeId !== topsisWinner.alternativeId && validActiveMethods.includes('wp') && validActiveMethods.includes('topsis')) {
    explanation = `Pergeseran peringkat #1 terjadi antara WP ("${wpWinner.alternativeName}") dan TOPSIS ("${topsisWinner.alternativeName}"). ` +
      `WP mengevaluasi produk eksponensial relatif terhadap bobot kriteria, sedangkan TOPSIS mengevaluasi kedekatan geometris terhadap solusi ideal positif dan pemisahan dari solusi ideal negatif.`;
  } else {
    explanation = `Terjadi pergeseran preferensi peringkat #1 antar metode aktif akibat perbedaan pemodelan matematis normalisasi dan fungsi agregasi nilai.`;
  }

  return {
    activeMethods: validActiveMethods,
    rows,
    hasRank1Shift: true,
    rank1Winners: { saw: sawWinner, wp: wpWinner, topsis: topsisWinner },
    explanation,
    differences,
    sensitivity,
  };
}

export default compareRankings;
