import Decimal from 'decimal.js';
import type { Criterion, Alternative } from '@/types/domain';
import type { MethodResult, TraceStep, RankingRow } from './types';

/**
 * Format angka untuk formula label:
 * - Integer ditampilkan apa adanya (misal: 20, 50)
 * - Desimal dibulatkan hingga 4 angka desimal tanpa trailing zero yang berlebihan (misal: 0.4 bukan 0.4000)
 */
function formatNumber(val: number): string {
  if (Number.isInteger(val)) {
    return val.toString();
  }
  return Number(val.toFixed(4)).toString();
}

/**
 * Implementasi SAW (Simple Additive Weighting)
 * Rumus:
 * 1. Normalisasi:
 *    Benefit: r_ij = x_ij / max_i(x_ij)
 *    Cost   : r_ij = min_i(x_ij) / x_ij
 * 2. Perangkingan:
 *    V_i = Σ_j ( w_j * r_ij )  dengan w_j = normalizedWeight
 */
export function calculateSAW(
  criteria: Criterion[],
  alternatives: Alternative[]
): MethodResult {
  if (criteria.length === 0 || alternatives.length === 0) {
    return {
      intermediateMatrices: {
        normalized: [],
        weighted: [],
      },
      formulaSteps: [],
      finalRanking: [],
    };
  }

  // Hitung total raw weight untuk fallback jika normalizedWeight belum diisi atau tidak valid
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

  // Cari nilai min dan max per kriteria
  const extremums: Record<string, { min: number; max: number }> = {};
  criteria.forEach((crit) => {
    const colValues = alternatives.map((alt) => alt.values[crit.id] ?? 0);
    extremums[crit.id] = {
      min: Math.min(...colValues),
      max: Math.max(...colValues),
    };
  });

  const normalizedMatrix: number[][] = [];
  const weightedMatrix: number[][] = [];
  const formulaSteps: TraceStep[] = [];
  const alternativeScores: { alternativeId: string; alternativeName: string; score: number }[] = [];

  // Hitung normalisasi dan pembobotan tiap alternatif
  alternatives.forEach((alt, altIndex) => {
    const normRow: number[] = [];
    const weightedRow: number[] = [];
    const weightedPartsForLabel: string[] = [];
    const weightedInputsForFinal: Record<string, number> = {};
    const weightedCellIdsForFinal: string[] = [];
    let viDecimal = new Decimal(0);

    const rowIdx = altIndex + 1;

    criteria.forEach((crit, critIndex) => {
      const colIdx = critIndex + 1;
      const x = alt.values[crit.id] ?? 0;
      const { min: minX, max: maxX } = extremums[crit.id];
      const w = normalizedWeights[crit.id];

      // Langkah 1: Normalisasi
      let r = 0;
      let normFormulaLabel = '';
      const normInputs: Record<string, number> = {};

      if (crit.type === 'BENEFIT') {
        r = maxX > 0 ? new Decimal(x).dividedBy(maxX).toNumber() : 0;
        normFormulaLabel = `Benefit ⟹ x${rowIdx}${colIdx} = x${rowIdx}${colIdx}/max(X) = ${formatNumber(x)}/${formatNumber(maxX)} = ${formatNumber(r)}`;
        normInputs.x = x;
        normInputs.max = maxX;
      } else {
        // COST
        r = x > 0 ? new Decimal(minX).dividedBy(x).toNumber() : 0;
        normFormulaLabel = `Cost ⟹ x${rowIdx}${colIdx} = min(X)/x${rowIdx}${colIdx} = ${formatNumber(minX)}/${formatNumber(x)} = ${formatNumber(r)}`;
        normInputs.min = minX;
        normInputs.x = x;
      }

      normRow.push(r);

      const normCellId = `saw-${alt.id}-${crit.id}-NORMALIZED`;
      const rawCellId = `saw-${alt.id}-${crit.id}-RAW`;

      formulaSteps.push({
        cellId: normCellId,
        stage: 'NORMALIZED',
        formulaLabel: normFormulaLabel,
        inputs: normInputs,
        sourceCellIds: [rawCellId],
        result: r,
      });

      // Langkah 2: Pembobotan w_j * r_ij (gunakan Decimal untuk menghindari 0.1 + 0.2 error)
      const weightedDecimal = new Decimal(w).times(new Decimal(r));
      const weightedValue = weightedDecimal.toNumber();
      weightedRow.push(weightedValue);
      viDecimal = viDecimal.plus(weightedDecimal);

      const weightedCellId = `saw-${alt.id}-${crit.id}-WEIGHTED`;
      const weightedFormulaLabel = `v${rowIdx}${colIdx} = w${colIdx} * r${rowIdx}${colIdx} = ${formatNumber(w)} * ${formatNumber(r)} = ${formatNumber(weightedValue)}`;

      formulaSteps.push({
        cellId: weightedCellId,
        stage: 'WEIGHTED',
        formulaLabel: weightedFormulaLabel,
        inputs: {
          w,
          r,
        },
        sourceCellIds: [normCellId],
        result: weightedValue,
      });

      weightedPartsForLabel.push(`${formatNumber(weightedValue)}`);
      weightedInputsForFinal[crit.id] = weightedValue;
      weightedCellIdsForFinal.push(weightedCellId);
    });

    normalizedMatrix.push(normRow);
    weightedMatrix.push(weightedRow);

    // Langkah 3: Final preference V_i
    const viScore = viDecimal.toNumber();
    const finalCellId = `saw-${alt.id}-FINAL`;
    const finalFormulaLabel = `V${rowIdx} = Σ(w_j * r_${rowIdx}j) = ${weightedPartsForLabel.join(' + ')} = ${formatNumber(viScore)}`;

    formulaSteps.push({
      cellId: finalCellId,
      stage: 'FINAL',
      formulaLabel: finalFormulaLabel,
      inputs: weightedInputsForFinal,
      sourceCellIds: weightedCellIdsForFinal,
      result: viScore,
    });

    alternativeScores.push({
      alternativeId: alt.id,
      alternativeName: alt.name,
      score: viScore,
    });
  });

  // Urutkan ranking descending berdasarkan score (V_i)
  const sortedScores = [...alternativeScores].sort((a, b) => b.score - a.score);

  const finalRanking: RankingRow[] = sortedScores.map((item, index) => ({
    alternativeId: item.alternativeId,
    alternativeName: item.alternativeName,
    score: item.score,
    rank: index + 1,
  }));

  return {
    intermediateMatrices: {
      normalized: normalizedMatrix,
      weighted: weightedMatrix,
    },
    formulaSteps,
    finalRanking,
  };
}
