import type { Criterion, Alternative } from '@/types/domain';
import type { RankingRow } from '@/core/math/types';
import type {
  GoalCongruenceResult,
  SpearmansRhoResult,
  MarginOfVictoryResult,
  CrossoverPoint,
  BusinessScenarioId,
  BusinessScenarioResult,
  GoalSeekingTarget,
  ManagerialSynthesisResult,
  DecisionEvaluationPayload,
} from './types';

export function synthesizeManagerialRecommendations(params: {
  winner: RankingRow;
  runnerUp: RankingRow;
  goalCongruence: GoalCongruenceResult;
  spearmanRho: SpearmansRhoResult;
  margin: MarginOfVictoryResult;
  crossovers: CrossoverPoint[];
  scenarios: Record<BusinessScenarioId, BusinessScenarioResult>;
  goalSeeking: GoalSeekingTarget | null;
}): ManagerialSynthesisResult {
  const { winner, runnerUp, goalCongruence, spearmanRho, margin, crossovers, scenarios, goalSeeking } = params;

  const primaryActionPoints: string[] = [
    `Memilih ${winner.alternativeName} sebagai keputusan prioritas utama pada kondisi operasional normal (skor preferensi: ${winner.score}).`,
    goalCongruence.isCongruent
      ? 'Mempertahankan standar kualitas dan keandalan yang menjadi keunggulan utama alternatif terpilih.'
      : 'Memperketat pengawasan spesifikasi mutu untuk mengimbangi orientasi kriteria biaya.',
  ];

  if (margin.isTight) {
    primaryActionPoints.push(
      `Melakukan audit validasi historis dan konfirmasi penawaran karena keunggulan atas runner-up hanya berselisih tipis (${margin.absoluteGap}).`
    );
  }

  const triggerConditions: string[] = [
    `Menjadikan ${runnerUp.alternativeName} sebagai kandidat cadangan resmi (Plan B) dengan skor ${runnerUp.score}.`,
  ];

  if (scenarios.EFFICIENCY && scenarios.EFFICIENCY.winner.alternativeId === runnerUp.alternativeId) {
    triggerConditions.push(
      'Otomatis beralih ke alternatif ini apabila organisasi menghadapi Skenario Krisis / Efisiensi Anggaran Ketat.'
    );
  }

  if (crossovers.length > 0) {
    const topCrossover = crossovers[0];
    triggerConditions.push(
      `Beralih apabila bobot kriteria ${topCrossover.criterionName} bergeser ${topCrossover.direction === 'INCREASE' ? 'naik' : 'turun'} melewati ambang batas ${topCrossover.thresholdWeight * 100}%.`
    );
  }

  if (goalSeeking && goalSeeking.isFeasible && goalSeeking.requiredRealValue !== null) {
    triggerConditions.push(
      `Mengalihkan pilihan jika ${runnerUp.alternativeName} bersedia memenuhi target negosiasi ${goalSeeking.criterionName} di angka ${goalSeeking.requiredRealValue}.`
    );
  }

  return {
    primaryRecommendation: {
      alternativeId: winner.alternativeId,
      alternativeName: winner.alternativeName,
      score: winner.score,
      statement: `Berdasarkan evaluasi multi-aspek dengan konsistensi peringkat ${spearmanRho.interpretation.toLowerCase()} (ρ = ${spearmanRho.rho}), ${winner.alternativeName} direkomendasikan sebagai pilihan terbaik.`,
      actionPoints: primaryActionPoints,
    },
    contingencyPlanB: {
      alternativeId: runnerUp.alternativeId,
      alternativeName: runnerUp.alternativeName,
      score: runnerUp.score,
      statement: `${runnerUp.alternativeName} ditetapkan sebagai alternatif mitigasi risiko (Plan B) jika terjadi perubahan parameter bisnis atau negosiasi lanjutan.`,
      triggerConditions,
    },
  };
}

export function buildDecisionEvaluationPayload(params: {
  projectTitle: string;
  criteria: Criterion[];
  alternatives: Alternative[];
  goalCongruence: GoalCongruenceResult;
  spearmanRho: SpearmansRhoResult;
  margin: MarginOfVictoryResult;
  crossovers: CrossoverPoint[];
  scenarios: Record<BusinessScenarioId, BusinessScenarioResult>;
  goalSeeking: GoalSeekingTarget | null;
  managerialSynthesis: ManagerialSynthesisResult;
}): DecisionEvaluationPayload {
  const {
    projectTitle,
    criteria,
    alternatives,
    goalCongruence,
    spearmanRho,
    margin,
    crossovers,
    scenarios,
    goalSeeking,
    managerialSynthesis,
  } = params;

  return {
    projectTitle,
    evaluatedAt: new Date().toISOString(),
    datasetMetrics: {
      criteriaCount: criteria.length,
      alternativesCount: alternatives.length,
    },
    aspects: {
      goalCongruence,
      spearmanRho,
      marginOfVictory: margin,
    },
    sensitivity: {
      crossoverThresholds: crossovers,
      isWinnerRobust: !margin.isTight && crossovers.length === 0,
    },
    scenarios,
    goalSeeking,
    managerialSynthesis,
  };
}
