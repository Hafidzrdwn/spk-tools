import Decimal from 'decimal.js';
import type { Criterion, Alternative } from '@/types/domain';
import type { MethodResult, TraceStep, RankingRow } from './types';
import { wpZeroGuard, type ZeroGuardViolation } from '@/validators/matrixSchemas';

/**
 * Custom error terstruktur saat zero-guard mendeteksi nilai 0 pada kriteria Cost
 */
export class WpZeroGuardError extends Error {
  public readonly violations: ZeroGuardViolation[];

  constructor(violations: ZeroGuardViolation[], message: string) {
    super(message);
    this.name = 'WpZeroGuardError';
    this.violations = violations;
    Object.setPrototypeOf(this, WpZeroGuardError.prototype);
  }
}

/**
 * Format angka untuk formula label agar terbaca manusia tanpa noise desimal berlebih
 */
function formatNumber(val: number): string {
  if (Number.isInteger(val)) {
    return val.toString();
  }
  return Number(val.toFixed(4)).toString();
}

/**
 * Implementasi WP (Weighted Product)
 * Rumus:
 * 1. Pangkat pembobotan:
 *    w_j* = +w_j jika Benefit
 *    w_j* = -w_j jika Cost
 * 2. Vektor S:
 *    S_i = Π_j ( x_ij ^ w_j* )
 * 3. Normalisasi Vektor V:
 *    V_i = S_i / Σ_i(S_i)
 */
export function calculateWP(
  criteria: Criterion[],
  alternatives: Alternative[]
): MethodResult {
  if (criteria.length === 0 || alternatives.length === 0) {
    return {
      intermediateMatrices: {
        vectorS: [],
        exponents: [],
      },
      formulaSteps: [],
      finalRanking: [],
    };
  }

  // Langkah 0: Validasi Zero-Guard untuk kriteria Cost
  const violations = wpZeroGuard(alternatives, criteria);
  if (violations.length > 0) {
    const errorDetails = violations.map((v) => {
      const alt = alternatives.find((a) => a.id === v.alternativeId);
      const crit = criteria.find((c) => c.id === v.criterionId);
      return `Alternatif "${alt?.name ?? v.alternativeId}" (id: ${v.alternativeId}) bernilai 0 pada kriteria Cost "${crit?.name ?? v.criterionId}" (id: ${v.criterionId})`;
    });

    throw new WpZeroGuardError(
      violations,
      `WP Zero-Guard Error: Ditemukan ${violations.length} sel bernilai 0 pada kriteria Cost yang dapat menyebabkan pembagian nol (0^-w = Infinity):\n- ${errorDetails.join('\n- ')}`
    );
  }

  // Hitung bobot ternormalisasi w_j
  const rawWeightSum = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
  const normalizedWeights: Record<string, number> = {};
  const weightPowers: Record<string, number> = {};

  criteria.forEach((crit) => {
    let w = 0;
    if (typeof crit.normalizedWeight === 'number' && !Number.isNaN(crit.normalizedWeight)) {
      w = crit.normalizedWeight;
    } else if (rawWeightSum > 0) {
      w = new Decimal(crit.weight).dividedBy(rawWeightSum).toNumber();
    } else {
      w = new Decimal(1).dividedBy(criteria.length).toNumber();
    }

    normalizedWeights[crit.id] = w;
    // Pangkat w_j*: +w_j untuk Benefit, -w_j untuk Cost
    weightPowers[crit.id] = crit.type === 'BENEFIT' ? w : -w;
  });

  const formulaSteps: TraceStep[] = [];
  const exponentsMatrix: number[][] = [];
  const vectorSValues: { alt: Alternative; sScore: number; rowIdx: number }[] = [];
  let sumS = new Decimal(0);

  // Langkah 1 & 2: Hitung pangkat eksponen dan Vektor S per alternatif
  alternatives.forEach((alt, altIndex) => {
    const rowIdx = altIndex + 1;
    const exponentRow: number[] = [];
    const termStringsForLabel: string[] = [];
    const sourceCellIdsForS: string[] = [];
    let sAlt = new Decimal(1);

    criteria.forEach((crit, critIndex) => {
      const colIdx = critIndex + 1;
      const x = alt.values[crit.id] ?? 0;
      const wStar = weightPowers[crit.id];
      const w = normalizedWeights[crit.id];

      // x_ij ^ w_j*
      const termValue = Math.pow(x, wStar);
      exponentRow.push(termValue);
      sAlt = sAlt.times(new Decimal(termValue));

      const termCellId = `wp-${alt.id}-${crit.id}-WEIGHTED`;
      const rawCellId = `wp-${alt.id}-${crit.id}-RAW`;
      sourceCellIdsForS.push(termCellId);

      const signStr = crit.type === 'BENEFIT' ? `+${formatNumber(w)}` : `-${formatNumber(w)}`;
      const formulaLabel = `${crit.type} ⟹ x${rowIdx}${colIdx}^(w${colIdx}*) = ${formatNumber(x)}^(${signStr}) = ${formatNumber(termValue)}`;

      formulaSteps.push({
        cellId: termCellId,
        stage: 'WEIGHTED',
        formulaLabel,
        inputs: {
          x,
          w: wStar,
        },
        sourceCellIds: [rawCellId],
        result: termValue,
      });

      termStringsForLabel.push(`${formatNumber(termValue)}`);
    });

    exponentsMatrix.push(exponentRow);

    const sScore = sAlt.toNumber();
    sumS = sumS.plus(sAlt);
    vectorSValues.push({ alt, sScore, rowIdx });

    // Rekam TraceStep untuk Vektor S
    const sCellId = `wp-${alt.id}-VECTOR_S`;
    const sFormulaLabel = `S${rowIdx} = Π(x_${rowIdx}j ^ w_j*) = ${termStringsForLabel.join(' * ')} = ${formatNumber(sScore)}`;

    formulaSteps.push({
      cellId: sCellId,
      stage: 'WEIGHTED',
      formulaLabel: sFormulaLabel,
      inputs: { sScore },
      sourceCellIds: sourceCellIdsForS,
      result: sScore,
    });
  });

  const totalSumS = sumS.toNumber();
  const vectorSMatrix: number[][] = vectorSValues.map((v) => [v.sScore]);

  // Langkah 3: Hitung Vektor V_i = S_i / Σ(S)
  const rankingRows: { alternativeId: string; alternativeName: string; score: number }[] = [];

  vectorSValues.forEach(({ alt, sScore, rowIdx }) => {
    const vScore = totalSumS > 0 ? new Decimal(sScore).dividedBy(sumS).toNumber() : 0;

    const vCellId = `wp-${alt.id}-FINAL`;
    const sCellId = `wp-${alt.id}-VECTOR_S`;
    const vFormulaLabel = `V${rowIdx} = S${rowIdx} / Σ(S) = ${formatNumber(sScore)} / ${formatNumber(totalSumS)} = ${formatNumber(vScore)}`;

    formulaSteps.push({
      cellId: vCellId,
      stage: 'FINAL',
      formulaLabel: vFormulaLabel,
      inputs: {
        s: sScore,
        sumS: totalSumS,
      },
      sourceCellIds: [sCellId],
      result: vScore,
    });

    rankingRows.push({
      alternativeId: alt.id,
      alternativeName: alt.name,
      score: vScore,
    });
  });

  // Ranking descending berdasarkan V_i
  const sortedRanking = [...rankingRows].sort((a, b) => b.score - a.score);

  const finalRanking: RankingRow[] = sortedRanking.map((item, index) => ({
    alternativeId: item.alternativeId,
    alternativeName: item.alternativeName,
    score: item.score,
    rank: index + 1,
  }));

  return {
    intermediateMatrices: {
      vectorS: vectorSMatrix,
      exponents: exponentsMatrix,
    },
    formulaSteps,
    finalRanking,
  };
}
