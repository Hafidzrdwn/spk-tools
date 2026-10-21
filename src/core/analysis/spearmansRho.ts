import type { RankingRow } from '@/core/math/types';
import type {
  AnalysisMethod,
  SpearmanConsistencyLevel,
  SpearmanRow,
  SpearmansRhoResult,
} from './types';

const METHOD_LABELS: Record<AnalysisMethod, string> = {
  saw: 'Simple Additive Weighting (SAW)',
  wp: 'Weighted Product (WP)',
  topsis: 'TOPSIS',
};

export function interpretSpearmanRho(rho: number): {
  level: SpearmanConsistencyLevel;
  interpretation: string;
} {
  const rounded = Number(rho.toFixed(4));

  if (rounded >= 0.999) {
    return {
      level: 'PERFECT',
      interpretation: 'Ranking identik (konsistensi sempurna / perfect)',
    };
  }
  if (rounded >= 0.8) {
    return {
      level: 'VERY_STRONG',
      interpretation: 'Konsistensi sangat kuat antar metode',
    };
  }
  if (rounded >= 0.6) {
    return {
      level: 'STRONG',
      interpretation: 'Konsistensi kuat',
    };
  }
  if (rounded >= 0.4) {
    return {
      level: 'MODERATE',
      interpretation: 'Konsistensi sedang',
    };
  }
  if (rounded >= 0.2) {
    return {
      level: 'WEAK',
      interpretation: 'Konsistensi lemah',
    };
  }
  if (rounded > -0.999) {
    return {
      level: 'NEGLIGIBLE',
      interpretation: 'Hampir tidak ada konsistensi',
    };
  }
  return {
    level: 'PERFECT_OPPOSITE',
    interpretation: 'Ranking berlawanan sempurna',
  };
}

export function calculateSpearmansRho(
  rankingsA: RankingRow[],
  rankingsB: RankingRow[],
  methodA: AnalysisMethod = 'saw',
  methodB: AnalysisMethod = 'wp'
): SpearmansRhoResult {
  const rankMapB = new Map<string, number>();
  rankingsB.forEach((r) => rankMapB.set(r.alternativeId, r.rank));

  const rows: SpearmanRow[] = rankingsA.map((rowA) => {
    const rankB = rankMapB.get(rowA.alternativeId) ?? rowA.rank;
    const diff = rowA.rank - rankB;
    return {
      alternativeId: rowA.alternativeId,
      alternativeName: rowA.alternativeName,
      rankMethodA: rowA.rank,
      rankMethodB: rankB,
      difference: diff,
      differenceSquared: diff * diff,
    };
  });

  const n = rows.length;
  const sumSquaredDifferences = rows.reduce((acc, row) => acc + row.differenceSquared, 0);

  let rho = 1;
  if (n > 1) {
    const denominator = n * (n * n - 1);
    rho = 1 - (6 * sumSquaredDifferences) / denominator;
  }

  const boundedRho = Math.max(-1, Math.min(1, Number(rho.toFixed(4))));
  const { level, interpretation } = interpretSpearmanRho(boundedRho);

  return {
    methodA,
    methodB,
    methodAName: METHOD_LABELS[methodA],
    methodBName: METHOD_LABELS[methodB],
    n,
    rows,
    sumSquaredDifferences,
    rho: boundedRho,
    consistencyLevel: level,
    interpretation,
  };
}
