import Decimal from 'decimal.js';
import type { Criterion, Alternative } from '@/types/domain';
import { calculateSAW } from '@/core/math/saw';
import type { GoalSeekingTarget } from './types';

export function calculateGoalSeeking(
  criteria: Criterion[],
  alternatives: Alternative[],
  targetAlternativeId?: string,
  targetCriterionId?: string
): GoalSeekingTarget | null {
  if (criteria.length === 0 || alternatives.length < 2) return null;

  const sawResult = calculateSAW(criteria, alternatives);
  const rankings = sawResult.finalRanking;
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);

  const winnerRow = sorted[0];
  const runnerUpRow = sorted[1];

  const targetAltRow = targetAlternativeId
    ? rankings.find((r) => r.alternativeId === targetAlternativeId) || runnerUpRow
    : runnerUpRow;

  if (!targetAltRow || targetAltRow.rank === 1) {
    return null;
  }

  const selectedCriterion = targetCriterionId
    ? criteria.find((c) => c.id === targetCriterionId) || criteria[0]
    : criteria[0];

  const targetAlt = alternatives.find((a) => a.id === targetAltRow.alternativeId);
  if (!targetAlt) return null;

  const colValues = alternatives.map((alt) => alt.values[selectedCriterion.id] ?? 0);
  const minVal = Math.min(...colValues);
  const maxVal = Math.max(...colValues);

  const rawWeight = selectedCriterion.normalizedWeight || selectedCriterion.weight || 1 / criteria.length;
  const w = new Decimal(rawWeight);

  const deltaScore = new Decimal(winnerRow.score).minus(targetAltRow.score);
  const scoreDeltaNeeded = Math.max(0, Number(deltaScore.toFixed(4)));

  const currentVal = targetAlt.values[selectedCriterion.id] ?? 0;
  let currentNorm = new Decimal(0);

  if (selectedCriterion.type === 'COST') {
    currentNorm = currentVal > 0 ? new Decimal(minVal).dividedBy(currentVal) : new Decimal(1);
  } else {
    currentNorm = maxVal > 0 ? new Decimal(currentVal).dividedBy(maxVal) : new Decimal(1);
  }

  const requiredNormalizedRise = w.greaterThan(0) ? deltaScore.dividedBy(w) : new Decimal(0);
  const targetNormDecimal = currentNorm.plus(requiredNormalizedRise);
  const targetNormalizedValue = Number(targetNormDecimal.toFixed(4));

  let requiredRealValue: number | null = null;
  let isFeasible = true;
  let infeasibilityReason: string | undefined;

  if (targetNormDecimal.greaterThan(1)) {
    isFeasible = false;
    infeasibilityReason = `Nilai normalisasi yang dibutuhkan (${targetNormalizedValue}) melampaui batas maksimum 1,000. Alternatif tidak dapat mengungguli peringkat #1 hanya dari kriteria ${selectedCriterion.name} sendirian. Dibutuhkan perbaikan kombinasi pada kriteria lain.`;
  } else if (selectedCriterion.type === 'COST') {
    if (targetNormDecimal.greaterThan(0)) {
      const targetCost = new Decimal(minVal).dividedBy(targetNormDecimal);
      requiredRealValue = Number(targetCost.toFixed(2));
      if (requiredRealValue <= 0) {
        isFeasible = false;
        infeasibilityReason = 'Target biaya yang dibutuhkan bernilai nol atau negatif sehingga tidak realistis.';
      }
    } else {
      isFeasible = false;
      infeasibilityReason = 'Kenaikan nilai normalisasi tidak valid.';
    }
  } else {
    const targetBenefit = targetNormDecimal.times(maxVal);
    requiredRealValue = Number(targetBenefit.toFixed(2));
  }

  let summaryExplanation = '';
  if (isFeasible && requiredRealValue !== null) {
    const diff = Number(Math.abs(currentVal - requiredRealValue).toFixed(2));
    if (selectedCriterion.type === 'COST') {
      summaryExplanation = `Agar ${targetAltRow.alternativeName} (#${targetAltRow.rank}) dapat menggeser ${winnerRow.alternativeName} (#1), nilai ${selectedCriterion.name} harus diturunkan dari ${currentVal} menjadi maksimal ${requiredRealValue} (turun sebesar ${diff}${selectedCriterion.unit ? ' ' + selectedCriterion.unit : ''}).`;
    } else {
      summaryExplanation = `Agar ${targetAltRow.alternativeName} (#${targetAltRow.rank}) dapat menggeser ${winnerRow.alternativeName} (#1), nilai ${selectedCriterion.name} harus dinaikkan dari ${currentVal} menjadi minimal ${requiredRealValue} (naik sebesar ${diff}${selectedCriterion.unit ? ' ' + selectedCriterion.unit : ''}).`;
    }
  } else {
    summaryExplanation = infeasibilityReason || 'Pencarian target tidak dapat dipenuhi pada konfigurasi ini.';
  }

  return {
    targetAlternativeId: targetAltRow.alternativeId,
    targetAlternativeName: targetAltRow.alternativeName,
    criterionId: selectedCriterion.id,
    criterionName: selectedCriterion.name,
    criterionType: selectedCriterion.type,
    currentValue: currentVal,
    currentRank: targetAltRow.rank,
    currentScore: targetAltRow.score,
    winnerName: winnerRow.alternativeName,
    winnerScore: winnerRow.score,
    scoreDeltaNeeded,
    requiredNormalizedRise: Number(requiredNormalizedRise.toFixed(4)),
    targetNormalizedValue,
    requiredRealValue,
    isFeasible,
    infeasibilityReason,
    summaryExplanation,
  };
}
