import type { Criterion, Alternative } from '@/types/domain';
import type { RankingRow } from '@/core/math/types';

export type AnalysisMethod = 'saw' | 'wp' | 'topsis';

export type SpearmanConsistencyLevel =
  | 'PERFECT'
  | 'VERY_STRONG'
  | 'STRONG'
  | 'MODERATE'
  | 'WEAK'
  | 'NEGLIGIBLE'
  | 'PERFECT_OPPOSITE';

export interface SpearmanRow {
  alternativeId: string;
  alternativeName: string;
  rankMethodA: number;
  rankMethodB: number;
  difference: number;
  differenceSquared: number;
}

export interface SpearmansRhoResult {
  methodA: AnalysisMethod;
  methodB: AnalysisMethod;
  methodAName: string;
  methodBName: string;
  n: number;
  rows: SpearmanRow[];
  sumSquaredDifferences: number;
  rho: number;
  consistencyLevel: SpearmanConsistencyLevel;
  interpretation: string;
}

export interface GoalCongruenceResult {
  isCongruent: boolean;
  status: 'VERY_CONGRUENT' | 'PARTIALLY_CONGRUENT' | 'COST_TRAP_RISK';
  title: string;
  explanation: string;
  cheapestAlternative?: { id: string; name: string; costValue: number; rank: number };
  highestQualityAlternative?: { id: string; name: string; qualityValue: number; rank: number };
  winnerAlternative: { id: string; name: string; rank: number };
}

export interface MarginOfVictoryResult {
  winner: RankingRow;
  runnerUp: RankingRow;
  absoluteGap: number;
  relativeGapPercent: number;
  isTight: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  evaluationNote: string;
}

export interface WhatIfSimulationInput {
  alternativeId: string;
  criterionId: string;
  newValue: number;
}

export interface WhatIfSimulationResult {
  targetAlternativeId: string;
  targetAlternativeName: string;
  criterionId: string;
  criterionName: string;
  oldValue: number;
  newValue: number;
  originalRank: number;
  originalScore: number;
  newRank: number;
  newScore: number;
  rankDelta: number;
  scoreDelta: number;
  newRankings: RankingRow[];
}

export interface CrossoverPoint {
  criterionId: string;
  criterionName: string;
  currentWeight: number;
  thresholdWeight: number;
  challengerId: string;
  challengerName: string;
  direction: 'INCREASE' | 'DECREASE';
  switchPercentageChange: number;
}

export interface SensitivitySimulationResult {
  baseRankings: RankingRow[];
  simulatedRankings: RankingRow[];
  adjustedWeights: Record<string, number>;
  crossoverPoints: CrossoverPoint[];
  hasWinnerShifted: boolean;
  currentWinner: RankingRow;
  newWinner: RankingRow;
}

export type BusinessScenarioId = 'BASELINE' | 'SUPPLY_FOCUS' | 'EFFICIENCY';

export interface BusinessScenarioDefinition {
  id: BusinessScenarioId;
  name: string;
  tagline: string;
  description: string;
  weights: Record<string, number>;
}

export interface BusinessScenarioResult {
  scenario: BusinessScenarioDefinition;
  rankings: RankingRow[];
  winner: RankingRow;
  runnerUp: RankingRow;
}

export interface GoalSeekingTarget {
  targetAlternativeId: string;
  targetAlternativeName: string;
  criterionId: string;
  criterionName: string;
  criterionType: 'BENEFIT' | 'COST';
  currentValue: number;
  currentRank: number;
  currentScore: number;
  winnerName: string;
  winnerScore: number;
  scoreDeltaNeeded: number;
  requiredNormalizedRise: number;
  targetNormalizedValue: number;
  requiredRealValue: number | null;
  isFeasible: boolean;
  infeasibilityReason?: string;
  summaryExplanation: string;
}

export interface ManagerialSynthesisResult {
  primaryRecommendation: {
    alternativeId: string;
    alternativeName: string;
    score: number;
    statement: string;
    actionPoints: string[];
  };
  contingencyPlanB: {
    alternativeId: string;
    alternativeName: string;
    score: number;
    statement: string;
    triggerConditions: string[];
  };
}

export interface DecisionEvaluationPayload {
  projectTitle: string;
  evaluatedAt: string;
  datasetMetrics: {
    criteriaCount: number;
    alternativesCount: number;
  };
  aspects: {
    goalCongruence: GoalCongruenceResult;
    spearmanRho: SpearmansRhoResult;
    marginOfVictory: MarginOfVictoryResult;
  };
  sensitivity: {
    crossoverThresholds: CrossoverPoint[];
    isWinnerRobust: boolean;
  };
  scenarios: Record<BusinessScenarioId, BusinessScenarioResult>;
  goalSeeking: GoalSeekingTarget | null;
  managerialSynthesis: ManagerialSynthesisResult;
}

export interface EvaluationStateBundle {
  criteria: Criterion[];
  alternatives: Alternative[];
  sawRankings: RankingRow[];
  wpRankings: RankingRow[];
  topsisRankings: RankingRow[];
}
