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
  currentValueLabel: string;
  idealRatio: number;
  suggestedValue: number;
  suggestedValueLabel: string;
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
 * 17 nilai diskret dalam Skala Fundamental Saaty (pecahan 1/9 s.d. 9)
 */
export const SAATY_SCALE_VALUES = [
  1 / 9, 1 / 8, 1 / 7, 1 / 6, 1 / 5, 1 / 4, 1 / 3, 1 / 2,
  1,
  2, 3, 4, 5, 6, 7, 8, 9,
];

/**
 * Format nilai Saaty ke representasi pecahan yang mudah dipahami pengguna (e.g. 0.5 -> "1/2")
 */
export function formatSaatyValue(val: number): string {
  if (Math.abs(val - 1) < 1e-4) return '1';
  if (val >= 1) return Math.round(val).toString();
  // Cek resiprokal 1/2 hingga 1/9
  for (let denom = 2; denom <= 9; denom++) {
    if (Math.abs(val - 1 / denom) < 0.02) {
      return `1/${denom}`;
    }
  }
  return Number(val.toFixed(4)).toString();
}

/**
 * Menemukan nilai skala Saaty terdekat dengan jarak minimum.
 * Mendukung opsi excludeValue agar tidak menyarankan nilai yang sama persis dengan kondisi saat ini.
 */
export function findClosestSaatyValue(idealRatio: number, excludeValue?: number): number {
  if (idealRatio <= 0) return 1;

  let candidates = SAATY_SCALE_VALUES;
  if (excludeValue !== undefined) {
    const filtered = candidates.filter((val) => Math.abs(val - excludeValue) > 1e-4);
    if (filtered.length > 0) {
      candidates = filtered;
    }
  }

  let closest = candidates[0];
  let minDiff = Math.abs(idealRatio - closest);

  for (let k = 1; k < candidates.length; k++) {
    const val = candidates[k];
    const diff = Math.abs(idealRatio - val);
    if (diff < minDiff) {
      minDiff = diff;
      closest = val;
    }
  }

  return closest;
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
 * Mencari pasangan perbandingan (i, j) yang paling efektif menurunkan CR
 * dan menyarankan nilai perbaikan yang berbeda nyata dari nilai saat ini.
 */
export function suggestConsistencyFix(
  matrix: number[][],
  priorityVector: number[],
  criteriaNames?: string[]
): ConsistencyFixSuggestion | null {
  const n = matrix.length;
  if (n <= 2) return null;

  interface CandidateFix {
    i: number;
    j: number;
    currentValue: number;
    idealRatio: number;
    suggestedValue: number;
    deviation: number;
    simulatedCr: number;
  }

  const candidates: CandidateFix[] = [];

  // Evaluasi seluruh pasangan independen (segitiga atas: i < j)
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const actualVal = matrix[i][j] ?? 1;
      const wi = priorityVector[i] ?? 0;
      const wj = priorityVector[j] ?? 0;

      if (wj > 0) {
        const idealRatio = wi / wj;
        const deviation = Math.abs(actualVal - idealRatio);

        // 1. Cari nilai skala Saaty terdekat
        let suggested = findClosestSaatyValue(idealRatio);

        // 2. Jika nilai terdekat sama dengan nilai saat ini, cari nilai alternatif terdekat ke arah idealRatio
        if (Math.abs(suggested - actualVal) < 1e-4) {
          suggested = findClosestSaatyValue(idealRatio, actualVal);
        }

        // Pastikan nilai rekomendasi berbeda nyata dari nilai saat ini (tidak no-op)
        if (Math.abs(suggested - actualVal) > 1e-4) {
          // Simulasikan perbaikan pada matriks temporer
          const tempMatrix = matrix.map((row) => [...row]);
          tempMatrix[i][j] = suggested;
          tempMatrix[j][i] = Number((1 / suggested).toFixed(6));

          // Hitung estimasi prioritas dan CR baru
          const tempColSums = Array(n).fill(0);
          for (let c = 0; c < n; c++) {
            for (let r = 0; r < n; r++) {
              tempColSums[c] += tempMatrix[r][c];
            }
          }
          const tempPriority = Array(n).fill(0);
          for (let r = 0; r < n; r++) {
            let rowSum = 0;
            for (let c = 0; c < n; c++) {
              rowSum += tempMatrix[r][c] / (tempColSums[c] || 1);
            }
            tempPriority[r] = rowSum / n;
          }

          const tempConsistency = checkConsistency(tempMatrix, tempPriority);

          candidates.push({
            i,
            j,
            currentValue: actualVal,
            idealRatio,
            suggestedValue: suggested,
            deviation,
            simulatedCr: tempConsistency.cr,
          });
        }
      }
    }
  }

  if (candidates.length === 0) return null;

  // Pilih kandidat yang paling efektif menurunkan CR (atau deviasi terbesar jika CR identik)
  candidates.sort((a, b) => {
    if (Math.abs(a.simulatedCr - b.simulatedCr) > 1e-4) {
      return a.simulatedCr - b.simulatedCr;
    }
    return b.deviation - a.deviation;
  });

  const best = candidates[0];
  const nameI = criteriaNames?.[best.i] ?? `Kriteria ${best.i + 1}`;
  const nameJ = criteriaNames?.[best.j] ?? `Kriteria ${best.j + 1}`;

  const currentLabel = formatSaatyValue(best.currentValue);
  const suggestedLabel = formatSaatyValue(best.suggestedValue);

  const message = `Inkonsistensi terbesar ditemukan pada perbandingan antara "${nameI}" dan "${nameJ}". Nilai saat ini: ${currentLabel}, sedangkan rasio prioritas ideal: ${formatNum(best.idealRatio)}. Disarankan mengubah nilai ke sekitar ${suggestedLabel}.`;

  return {
    i: best.i,
    j: best.j,
    criterionNameI: nameI,
    criterionNameJ: nameJ,
    currentValue: best.currentValue,
    currentValueLabel: currentLabel,
    idealRatio: best.idealRatio,
    suggestedValue: best.suggestedValue,
    suggestedValueLabel: suggestedLabel,
    deviation: best.deviation,
    message,
  };
}

export default checkConsistency;
