import Decimal from 'decimal.js';
import { RANDOM_INDEX_TABLE } from '@/core/constants/randomIndexTable';

export interface ConsistencyResult {
  weightedSumVector: number[];
  lambdaMax: number;
  ci: number; // Consistency Index
  cr: number; // Consistency Ratio
  ri: number; // Random Index
  isConsistent: boolean; // CR <= 0.10
}

export interface ConsistencyFixSuggestion {
  i: number;
  j: number;
  criterionNameI: string;
  criterionNameJ: string;
  currentValue: number;
  idealRatio: number;
  suggestedValue: number;
  deviation: number;
  message: string;
}

/**
 * Format angka untuk pesan dan label
 */
function formatNum(val: number): string {
  if (Number.isInteger(val)) {
    return val.toString();
  }
  return Number(val.toFixed(4)).toString();
}

/**
 * Menghitung Consistency Index (CI) dan Consistency Ratio (CR)
 * Langkah:
 * 1. Weighted sum vector = MatriksPairwise × PriorityVector
 * 2. λmax = rata-rata ( WeightedSumVector_i / PriorityVector_i )
 * 3. CI = (λmax - n) / (n - 1)
 * 4. CR = CI / RI(n)
 */
export function checkConsistency(
  matrix: number[][],
  priorityVector: number[]
): ConsistencyResult {
  const n = matrix.length;

  if (n <= 2) {
    return {
      weightedSumVector: [...priorityVector],
      lambdaMax: n,
      ci: 0,
      cr: 0,
      ri: 0,
      isConsistent: true,
    };
  }

  // Langkah 1: Weighted sum vector = A × w
  const weightedSumVector: number[] = [];
  for (let i = 0; i < n; i++) {
    let sumRow = new Decimal(0);
    for (let j = 0; j < n; j++) {
      const a = matrix[i][j] ?? 1;
      const w = priorityVector[j] ?? 0;
      sumRow = sumRow.plus(new Decimal(a).times(new Decimal(w)));
    }
    weightedSumVector.push(sumRow.toNumber());
  }

  // Langkah 2: λmax = rata-rata ( WeightedSumVector_i / PriorityVector_i )
  let sumLambda = new Decimal(0);
  for (let i = 0; i < n; i++) {
    const w = priorityVector[i];
    const wsv = weightedSumVector[i];
    if (w > 0) {
      sumLambda = sumLambda.plus(new Decimal(wsv).dividedBy(new Decimal(w)));
    } else {
      sumLambda = sumLambda.plus(n);
    }
  }
  const lambdaMax = sumLambda.dividedBy(n).toNumber();

  // Langkah 3: CI = (λmax - n) / (n - 1)
  const ci = Math.max(0, (lambdaMax - n) / (n - 1));

  // Langkah 4: CR = CI / RI(n)
  const ri = RANDOM_INDEX_TABLE[n] ?? 1.49;
  const cr = ri > 0 ? ci / ri : 0;

  // CR ≤ 0.10 → konsisten
  const isConsistent = cr <= 0.10;

  return {
    weightedSumVector,
    lambdaMax,
    ci,
    cr,
    ri,
    isConsistent,
  };
}

/**
 * Mencari pasangan perbandingan (i, j) yang paling menyimpang dari rasio prioritas w_i / w_j
 * dan menyarankan nilai perbaikan yang mendekati konsistensi.
 */
export function suggestConsistencyFix(
  matrix: number[][],
  priorityVector: number[],
  criteriaNames?: string[]
): ConsistencyFixSuggestion | null {
  const n = matrix.length;
  if (n <= 2) return null;

  let maxDeviation = -1;
  let worstI = -1;
  let worstJ = -1;
  let worstIdealRatio = 1;

  // Evaluasi seluruh pasangan independen (segitiga atas: i < j)
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const actualVal = matrix[i][j];
      const wi = priorityVector[i] ?? 0;
      const wj = priorityVector[j] ?? 0;

      if (wj > 0) {
        const idealRatio = wi / wj;
        // Hitung deviasi absolut antara nilai aktual dan rasio prioritas
        const deviation = Math.abs(actualVal - idealRatio);

        if (deviation > maxDeviation) {
          maxDeviation = deviation;
          worstI = i;
          worstJ = j;
          worstIdealRatio = idealRatio;
        }
      }
    }
  }

  if (worstI === -1 || worstJ === -1) {
    return null;
  }

  // Tentukan nilai saran terdekat dalam skala Saaty (1..9 atau 1/9..1)
  let suggestedValue = 1;
  if (worstIdealRatio >= 1) {
    suggestedValue = Math.min(9, Math.max(1, Math.round(worstIdealRatio)));
  } else {
    const inverted = 1 / worstIdealRatio;
    const roundedInv = Math.min(9, Math.max(1, Math.round(inverted)));
    suggestedValue = Number((1 / roundedInv).toFixed(4));
  }

  const nameI = criteriaNames?.[worstI] ?? `Kriteria ${worstI + 1}`;
  const nameJ = criteriaNames?.[worstJ] ?? `Kriteria ${worstJ + 1}`;
  const currentValue = matrix[worstI][worstJ];

  const message = `Inkonsistensi terbesar ditemukan pada perbandingan antara "${nameI}" dan "${nameJ}". Nilai saat ini: ${formatNum(currentValue)}, sedangkan rasio prioritas ideal: ${formatNum(worstIdealRatio)}. Disarankan mengubah nilai ke sekitar ${formatNum(suggestedValue)}.`;

  return {
    i: worstI,
    j: worstJ,
    criterionNameI: nameI,
    criterionNameJ: nameJ,
    currentValue,
    idealRatio: worstIdealRatio,
    suggestedValue,
    deviation: maxDeviation,
    message,
  };
}
