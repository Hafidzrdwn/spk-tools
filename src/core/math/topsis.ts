import Decimal from 'decimal.js';
import type { Criterion, Alternative } from '@/types/domain';
import type { MethodResult, TraceStep, RankingRow } from './types';

/**
 * Format angka untuk formula label agar bersih dan informatif
 */
function formatNumber(val: number): string {
  if (Number.isInteger(val)) {
    return val.toString();
  }
  return Number(val.toFixed(4)).toString();
}

/**
 * Implementasi TOPSIS (Technique for Order Preference by Similarity to Ideal Solution)
 * Rumus:
 * 1. Normalisasi vektor:
 *    r_ij = x_ij / √( Σ_i(x_ij²) )
 * 2. Matriks terbobot:
 *    y_ij = w_j * r_ij
 * 3. Solusi ideal:
 *    Benefit ⟹ A+_j = max_i(y_ij), A-_j = min_i(y_ij)
 *    Cost    ⟹ A+_j = min_i(y_ij), A-_j = max_i(y_ij)
 * 4. Jarak Euclidean:
 *    D+_i = √( Σ_j (y_ij - A+_j)² )
 *    D-_i = √( Σ_j (y_ij - A-_j)² )
 * 5. Nilai preferensi:
 *    C_i = D-_i / (D+_i + D-_i)
 */
export function calculateTOPSIS(
  criteria: Criterion[],
  alternatives: Alternative[]
): MethodResult {
  if (criteria.length === 0 || alternatives.length === 0) {
    return {
      intermediateMatrices: {
        normalized: [],
        weighted: [],
        idealPositive: [],
        idealNegative: [],
      },
      formulaSteps: [],
      finalRanking: [],
    };
  }

  // Hitung bobot ternormalisasi w_j
  const rawWeightSum = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
  const normalizedWeights: Record<string, number> = {};

  criteria.forEach((crit) => {
    if (typeof crit.normalizedWeight === 'number' && !Number.isNaN(crit.normalizedWeight)) {
      normalizedWeights[crit.id] = crit.normalizedWeight;
    } else if (rawWeightSum > 0) {
      normalizedWeights[crit.id] = new Decimal(crit.weight).dividedBy(rawWeightSum).toNumber();
    } else {
      normalizedWeights[crit.id] = new Decimal(1).dividedBy(criteria.length).toNumber();
    }
  });

  // Langkah 1: Hitung pembagi normalisasi vektor per kriteria: √( Σ_i(x_ij²) )
  const columnNorms: Record<string, { sumSquares: number; norm: number }> = {};
  criteria.forEach((crit) => {
    const sumSquares = alternatives.reduce((sum, alt) => {
      const x = alt.values[crit.id] ?? 0;
      return sum + x * x;
    }, 0);
    const norm = Math.sqrt(sumSquares);
    columnNorms[crit.id] = { sumSquares, norm };
  });

  const normalizedMatrix: number[][] = [];
  const weightedMatrix: number[][] = [];
  const formulaSteps: TraceStep[] = [];

  // Hitung matriks normalisasi r_ij dan matriks terbobot y_ij
  alternatives.forEach((alt, altIndex) => {
    const rowIdx = altIndex + 1;
    const normRow: number[] = [];
    const weightedRow: number[] = [];

    criteria.forEach((crit, critIndex) => {
      const colIdx = critIndex + 1;
      const x = alt.values[crit.id] ?? 0;
      const { sumSquares, norm } = columnNorms[crit.id];
      const w = normalizedWeights[crit.id];

      // r_ij = x_ij / √( Σ_i(x_ij²) )
      const r = norm > 0 ? x / norm : 0;
      normRow.push(r);

      const normCellId = `topsis-${alt.id}-${crit.id}-NORMALIZED`;
      const rawCellId = `topsis-${alt.id}-${crit.id}-RAW`;
      const normFormulaLabel = `r${rowIdx}${colIdx} = x${rowIdx}${colIdx} / √(Σ x_i${colIdx}²) = ${formatNumber(x)} / √(${formatNumber(sumSquares)}) = ${formatNumber(r)}`;

      formulaSteps.push({
        cellId: normCellId,
        stage: 'NORMALIZED',
        formulaLabel: normFormulaLabel,
        inputs: {
          x,
          sumSquares,
          norm,
        },
        sourceCellIds: [rawCellId],
        result: r,
      });

      // y_ij = w_j * r_ij
      const y = w * r;
      weightedRow.push(y);

      const weightedCellId = `topsis-${alt.id}-${crit.id}-WEIGHTED`;
      const weightedFormulaLabel = `y${rowIdx}${colIdx} = w${colIdx} * r${rowIdx}${colIdx} = ${formatNumber(w)} * ${formatNumber(r)} = ${formatNumber(y)}`;

      formulaSteps.push({
        cellId: weightedCellId,
        stage: 'WEIGHTED',
        formulaLabel: weightedFormulaLabel,
        inputs: {
          w,
          r,
        },
        sourceCellIds: [normCellId],
        result: y,
      });
    });

    normalizedMatrix.push(normRow);
    weightedMatrix.push(weightedRow);
  });

  // Langkah 3: Menentukan Solusi Ideal Positif A+ dan Solusi Ideal Negatif A-
  // Benefit ⟹ A+_j = max_i(y_ij), A-_j = min_i(y_ij)
  // Cost    ⟹ A+_j = min_i(y_ij), A-_j = max_i(y_ij)
  const idealPositive: number[] = [];
  const idealNegative: number[] = [];

  criteria.forEach((crit, critIndex) => {
    const colY = weightedMatrix.map((row) => row[critIndex]);
    const maxY = Math.max(...colY);
    const minY = Math.min(...colY);

    if (crit.type === 'BENEFIT') {
      idealPositive.push(maxY);
      idealNegative.push(minY);
    } else {
      // COST
      idealPositive.push(minY);
      idealNegative.push(maxY);
    }
  });

  // Langkah 4 & 5: Jarak Euclidean D+ & D- serta Kedekatan Relatif C_i
  const rankingRows: { alternativeId: string; alternativeName: string; score: number }[] = [];

  alternatives.forEach((alt, altIndex) => {
    const rowIdx = altIndex + 1;
    const yRow = weightedMatrix[altIndex];
    let diffPlusSum = 0;
    let diffMinusSum = 0;
    const weightedSourceCellIds: string[] = [];

    criteria.forEach((crit, critIndex) => {
      const colIdx = critIndex + 1;
      const y = yRow[critIndex];
      const aPlus = idealPositive[critIndex];
      const aMinus = idealNegative[critIndex];

      const diffPlus = y - aPlus;
      const diffMinus = y - aMinus;

      diffPlusSum += diffPlus * diffPlus;
      diffMinusSum += diffMinus * diffMinus;

      weightedSourceCellIds.push(`topsis-${alt.id}-${crit.id}-WEIGHTED`);
    });

    const dPlus = Math.sqrt(diffPlusSum);
    const dMinus = Math.sqrt(diffMinusSum);

    // Rekam TraceStep untuk D+
    const dPlusCellId = `topsis-${alt.id}-DISTANCE_POSITIVE`;
    const dPlusFormulaLabel = `D+_${rowIdx} = √(Σ(y_${rowIdx}j - A+j)²) = √(${formatNumber(diffPlusSum)}) = ${formatNumber(dPlus)}`;
    formulaSteps.push({
      cellId: dPlusCellId,
      stage: 'DISTANCE',
      formulaLabel: dPlusFormulaLabel,
      inputs: {
        diffSquaresSum: diffPlusSum,
        dPlus,
      },
      sourceCellIds: weightedSourceCellIds,
      result: dPlus,
    });

    // Rekam TraceStep untuk D-
    const dMinusCellId = `topsis-${alt.id}-DISTANCE_NEGATIVE`;
    const dMinusFormulaLabel = `D-_${rowIdx} = √(Σ(y_${rowIdx}j - A-j)²) = √(${formatNumber(diffMinusSum)}) = ${formatNumber(dMinus)}`;
    formulaSteps.push({
      cellId: dMinusCellId,
      stage: 'DISTANCE',
      formulaLabel: dMinusFormulaLabel,
      inputs: {
        diffSquaresSum: diffMinusSum,
        dMinus,
      },
      sourceCellIds: weightedSourceCellIds,
      result: dMinus,
    });

    // Langkah 5: C_i = D-_i / (D+_i + D-_i)
    const dTotal = dPlus + dMinus;
    let cScore = 0;
    if (dTotal > 0) {
      cScore = new Decimal(dMinus).dividedBy(dTotal).toNumber();
    }

    const cCellId = `topsis-${alt.id}-FINAL`;
    const cFormulaLabel = `C_${rowIdx} = D-_${rowIdx} / (D+_${rowIdx} + D-_${rowIdx}) = ${formatNumber(dMinus)} / (${formatNumber(dPlus)} + ${formatNumber(dMinus)}) = ${formatNumber(cScore)}`;

    formulaSteps.push({
      cellId: cCellId,
      stage: 'FINAL',
      formulaLabel: cFormulaLabel,
      inputs: {
        dPlus,
        dMinus,
        dTotal,
      },
      sourceCellIds: [dPlusCellId, dMinusCellId],
      result: cScore,
    });

    rankingRows.push({
      alternativeId: alt.id,
      alternativeName: alt.name,
      score: cScore,
    });
  });

  // Ranking descending berdasarkan skor C_i (C_i terbesar = rank 1)
  const sortedRanking = [...rankingRows].sort((a, b) => b.score - a.score);

  const finalRanking: RankingRow[] = sortedRanking.map((item, index) => ({
    alternativeId: item.alternativeId,
    alternativeName: item.alternativeName,
    score: item.score,
    rank: index + 1,
  }));

  return {
    intermediateMatrices: {
      normalized: normalizedMatrix,
      weighted: weightedMatrix,
      idealPositive: [idealPositive],
      idealNegative: [idealNegative],
    },
    formulaSteps,
    finalRanking,
  };
}
