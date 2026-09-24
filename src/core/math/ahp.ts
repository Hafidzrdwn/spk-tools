import Decimal from 'decimal.js';
import type { Criterion } from '@/types/domain';
import type { MethodResult, TraceStep, RankingRow } from './types';
import {
  checkConsistency,
  suggestConsistencyFix,
  type ConsistencyResult,
  type ConsistencyFixSuggestion,
} from './ahp-consistency';

export interface AhpResult extends MethodResult {
  priorityVector: number[];
  normalizedMatrix: number[][];
  consistency: ConsistencyResult;
  suggestion: ConsistencyFixSuggestion | null;
}

/**
 * Format angka untuk formula label agar terbaca manusia
 */
function formatNumber(val: number): string {
  if (Number.isInteger(val)) {
    return val.toString();
  }
  return Number(val.toFixed(4)).toString();
}

/**
 * Implementasi AHP (Analytic Hierarchy Process)
 * Langkah:
 * 1. Normalisasi kolom matriks pairwise: normA_ij = A_ij / Σ_k(A_kj)
 * 2. Priority vector: w_i = ( Σ_j normA_ij ) / n
 * 3. Consistency check: Weighted sum vector, λmax, CI, CR via checkConsistency()
 */
export function calculateAHP(
  matrix: number[][],
  criteria?: Criterion[]
): AhpResult {
  const n = matrix.length;

  if (n === 0) {
    return {
      priorityVector: [],
      normalizedMatrix: [],
      consistency: {
        weightedSumVector: [],
        lambdaMax: 0,
        ci: 0,
        cr: 0,
        ri: 0,
        isConsistent: true,
      },
      suggestion: null,
      intermediateMatrices: {
        normalized: [],
        pairwise: [],
      },
      formulaSteps: [],
      finalRanking: [],
    };
  }

  // Langkah 1: Hitung jumlah tiap kolom matriks perbandingan berpasangan
  const colSums: number[] = [];
  for (let j = 0; j < n; j++) {
    let sumCol = new Decimal(0);
    for (let i = 0; i < n; i++) {
      const val = matrix[i][j] ?? 1;
      sumCol = sumCol.plus(new Decimal(val));
    }
    colSums.push(sumCol.toNumber());
  }

  // Normalisasi kolom: normA_ij = A_ij / colSums[j]
  const normalizedMatrix: number[][] = [];
  const formulaSteps: TraceStep[] = [];

  for (let i = 0; i < n; i++) {
    const normRow: number[] = [];
    const critIdI = criteria?.[i]?.id ?? `c${i + 1}`;

    for (let j = 0; j < n; j++) {
      const critIdJ = criteria?.[j]?.id ?? `c${j + 1}`;
      const a = matrix[i][j] ?? 1;
      const colSum = colSums[j];
      const normVal = colSum > 0 ? new Decimal(a).dividedBy(new Decimal(colSum)).toNumber() : 0;
      normRow.push(normVal);

      const cellId = `ahp-${critIdI}-${critIdJ}-NORMALIZED`;
      const rawCellId = `ahp-${critIdI}-${critIdJ}-RAW`;
      const formulaLabel = `normA${i + 1}${j + 1} = a${i + 1}${j + 1} / Σ_col${j + 1} = ${formatNumber(a)} / ${formatNumber(colSum)} = ${formatNumber(normVal)}`;

      formulaSteps.push({
        cellId,
        stage: 'NORMALIZED',
        formulaLabel,
        inputs: {
          a,
          colSum,
        },
        sourceCellIds: [rawCellId],
        result: normVal,
      });
    }
    normalizedMatrix.push(normRow);
  }

  // Langkah 2: Hitung Priority Vector (rata-rata tiap baris ternormalisasi)
  const priorityVector: number[] = [];
  for (let i = 0; i < n; i++) {
    const rowValues = normalizedMatrix[i];
    let sumRowNorm = new Decimal(0);
    const rowParts: string[] = [];
    const rowSourceCellIds: string[] = [];

    for (let j = 0; j < n; j++) {
      const critIdI = criteria?.[i]?.id ?? `c${i + 1}`;
      const critIdJ = criteria?.[j]?.id ?? `c${j + 1}`;
      sumRowNorm = sumRowNorm.plus(new Decimal(rowValues[j]));
      rowParts.push(formatNumber(rowValues[j]));
      rowSourceCellIds.push(`ahp-${critIdI}-${critIdJ}-NORMALIZED`);
    }

    const priorityWeight = sumRowNorm.dividedBy(n).toNumber();
    priorityVector.push(priorityWeight);

    const critIdI = criteria?.[i]?.id ?? `c${i + 1}`;
    const wCellId = `ahp-${critIdI}-WEIGHTED`;
    const wFormulaLabel = `w${i + 1} = (Σ_j normA${i + 1}j) / ${n} = (${rowParts.join(' + ')}) / ${n} = ${formatNumber(priorityWeight)}`;

    formulaSteps.push({
      cellId: wCellId,
      stage: 'WEIGHTED',
      formulaLabel: wFormulaLabel,
      inputs: {
        sumRowNorm: sumRowNorm.toNumber(),
        n,
      },
      sourceCellIds: rowSourceCellIds,
      result: priorityWeight,
    });
  }

  // Langkah 3: Pengecekan Konsistensi (λmax, CI, CR)
  const consistency = checkConsistency(matrix, priorityVector);

  // Jika tidak konsisten, cari saran perbaikan
  const criteriaNames = criteria?.map((c) => c.name);
  const suggestion = consistency.isConsistent
    ? null
    : suggestConsistencyFix(matrix, priorityVector, criteriaNames);

  // Perangkingan prioritas kriteria/elemen
  const rankingRows = priorityVector.map((score, index) => {
    const crit = criteria?.[index];
    return {
      alternativeId: crit?.id ?? `c${index + 1}`,
      alternativeName: crit?.name ?? `Kriteria ${index + 1}`,
      score,
    };
  });

  const sortedRanking = [...rankingRows].sort((a, b) => b.score - a.score);
  const finalRanking: RankingRow[] = sortedRanking.map((item, index) => ({
    alternativeId: item.alternativeId,
    alternativeName: item.alternativeName,
    score: item.score,
    rank: index + 1,
  }));

  return {
    priorityVector,
    normalizedMatrix,
    consistency,
    suggestion,
    intermediateMatrices: {
      pairwise: matrix,
      normalized: normalizedMatrix,
      priorityVector: [priorityVector],
      weightedSum: [consistency.weightedSumVector],
    },
    formulaSteps,
    finalRanking,
  };
}
