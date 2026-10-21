import type { Criterion, Alternative } from '@/types/domain';
import type { RankingRow } from '@/core/math/types';
import type { GoalCongruenceResult, MarginOfVictoryResult } from './types';

export function evaluateGoalCongruence(
  criteria: Criterion[],
  alternatives: Alternative[],
  rankings: RankingRow[]
): GoalCongruenceResult {
  const winnerRow = rankings.find((r) => r.rank === 1) || rankings[0];
  const winnerAlt = alternatives.find((a) => a.id === winnerRow?.alternativeId) || alternatives[0];

  const costCriteria = criteria.filter((c) => c.type === 'COST');
  const benefitCriteria = criteria.filter((c) => c.type === 'BENEFIT');

  let cheapestAltInfo: GoalCongruenceResult['cheapestAlternative'] | undefined;
  if (costCriteria.length > 0) {
    const primaryCost = costCriteria[0];
    let minCost = Number.POSITIVE_INFINITY;
    let minCostAlt: Alternative | null = null;

    alternatives.forEach((alt) => {
      const val = alt.values[primaryCost.id] ?? Number.POSITIVE_INFINITY;
      if (val < minCost) {
        minCost = val;
        minCostAlt = alt;
      }
    });

    if (minCostAlt) {
      const cheapRank = rankings.find((r) => r.alternativeId === (minCostAlt as Alternative).id)?.rank ?? 1;
      cheapestAltInfo = {
        id: (minCostAlt as Alternative).id,
        name: (minCostAlt as Alternative).name,
        costValue: minCost,
        rank: cheapRank,
      };
    }
  }

  let highestQualityInfo: GoalCongruenceResult['highestQualityAlternative'] | undefined;
  if (benefitCriteria.length > 0) {
    let maxBenefitScore = Number.NEGATIVE_INFINITY;
    let maxBenefitAlt: Alternative | null = null;

    alternatives.forEach((alt) => {
      let bScore = 0;
      benefitCriteria.forEach((bc) => {
        const val = alt.values[bc.id] ?? 0;
        bScore += val * (bc.normalizedWeight || 1);
      });

      if (bScore > maxBenefitScore) {
        maxBenefitScore = bScore;
        maxBenefitAlt = alt;
      }
    });

    if (maxBenefitAlt) {
      const qualRank = rankings.find((r) => r.alternativeId === (maxBenefitAlt as Alternative).id)?.rank ?? 1;
      highestQualityInfo = {
        id: (maxBenefitAlt as Alternative).id,
        name: (maxBenefitAlt as Alternative).name,
        qualityValue: Number(maxBenefitScore.toFixed(2)),
        rank: qualRank,
      };
    }
  }

  const isCostTrapAvoided =
    cheapestAltInfo && cheapestAltInfo.rank > 1 && winnerRow.alternativeId !== cheapestAltInfo.id;
  const isHighQualityChosen =
    highestQualityInfo && (winnerRow.alternativeId === highestQualityInfo.id || highestQualityInfo.rank <= 2);

  if (cheapestAltInfo && isCostTrapAvoided && isHighQualityChosen) {
    return {
      isCongruent: true,
      status: 'VERY_CONGRUENT',
      title: 'Kesesuaian Sangat Tinggi (Bebas Jebakan Biaya)',
      explanation: `SPK berhasil menggeser orientasi keputusan dari sekadar mencari nilai biaya termurah (${cheapestAltInfo.name} di peringkat #${cheapestAltInfo.rank}) ke arah kandidat dengan kualitas dan keandalan terbaik (${winnerAlt?.name} di peringkat #1).`,
      cheapestAlternative: cheapestAltInfo,
      highestQualityAlternative: highestQualityInfo,
      winnerAlternative: { id: winnerRow.alternativeId, name: winnerRow.alternativeName, rank: 1 },
    };
  }

  if (cheapestAltInfo && cheapestAltInfo.rank === 1 && benefitCriteria.length > 0) {
    return {
      isCongruent: false,
      status: 'COST_TRAP_RISK',
      title: 'Perhatian: Didominasi Faktor Biaya (Cost-Trap Risk)',
      explanation: `Pemenang peringkat #1 (${winnerAlt?.name}) juga merupakan alternatif dengan biaya termurah. Pastikan kualitas spesifikasi dan layanan purna jual telah memenuhi standar minimum agar terhindar dari risiko operasional.`,
      cheapestAlternative: cheapestAltInfo,
      highestQualityAlternative: highestQualityInfo,
      winnerAlternative: { id: winnerRow.alternativeId, name: winnerRow.alternativeName, rank: 1 },
    };
  }

  return {
    isCongruent: true,
    status: 'PARTIALLY_CONGRUENT',
    title: 'Kesesuaian Seimbang',
    explanation: `Hasil rekomendasi peringkat mencerminkan trade-off yang proporsional antara efisiensi biaya dan performa kriteria benefit pada alternatif terpilih (${winnerAlt?.name}).`,
    cheapestAlternative: cheapestAltInfo,
    highestQualityAlternative: highestQualityInfo,
    winnerAlternative: { id: winnerRow.alternativeId, name: winnerRow.alternativeName, rank: 1 },
  };
}

export function evaluateMarginOfVictory(rankings: RankingRow[]): MarginOfVictoryResult {
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);
  const winner = sorted[0] || { rank: 1, alternativeId: '', alternativeName: 'Peringkat 1', score: 0 };
  const runnerUp = sorted[1] || { rank: 2, alternativeId: '', alternativeName: 'Peringkat 2', score: 0 };

  const absoluteGap = Number(Math.abs(winner.score - runnerUp.score).toFixed(4));
  const relativeGapPercent =
    winner.score > 0 ? Number(((absoluteGap / winner.score) * 100).toFixed(2)) : 0;

  const isTight = absoluteGap <= 0.02 || relativeGapPercent < 2.5;
  const isModerate = absoluteGap <= 0.05 || relativeGapPercent < 6;

  let riskLevel: MarginOfVictoryResult['riskLevel'] = 'LOW';
  let evaluationNote = '';

  if (isTight) {
    riskLevel = 'HIGH';
    evaluationNote = `Selisih skor antara ${winner.alternativeName} (#1) dan ${runnerUp.alternativeName} (#2) sangat tipis (${absoluteGap} atau ${relativeGapPercent}%). Sangat disarankan melakukan Expert Validation dan pemeriksaan rekam jejak historis untuk memastikan keabsahan data penawaran.`;
  } else if (isModerate) {
    riskLevel = 'MEDIUM';
    evaluationNote = `Margin keunggulan ${winner.alternativeName} berada pada rentang sedang (${absoluteGap}). Keputusan relatif stabil, namun perubahan bobot pada kriteria berbobot besar berpotensi memicu pergeseran.`;
  } else {
    riskLevel = 'LOW';
    evaluationNote = `${winner.alternativeName} menduduki peringkat #1 dengan margin keunggulan yang tegas (${absoluteGap} atau ${relativeGapPercent}%) di atas runner-up, menandakan ketahanan keputusan yang sangat kuat.`;
  }

  return {
    winner,
    runnerUp,
    absoluteGap,
    relativeGapPercent,
    isTight,
    riskLevel,
    evaluationNote,
  };
}
