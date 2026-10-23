import type { MethodId, Criterion, Alternative, CaseContextMetadata } from '@/types/domain';
import type { MethodResult, RankingRow } from '@/core/math/types';
import type { ComparisonResult, CompareMethod } from '@/core/math/compareRankings';
import type { ConsistencyResult } from '@/core/math/ahp-consistency';
import type { AiExecutiveNarrative } from '@/services/ai';


export type ExportScope = 'CURRENT' | 'ALL' | 'CUSTOM';

export interface ExportReportConfig {
  selectedMethods: MethodId[];
  includeComparison: boolean;
  includeStory: boolean;
  includeAhp: boolean;
  includeExecutiveSummary: boolean;
  includeAiNarrative?: boolean;
}

export interface SawStepData {
  extremums: Record<string, { min: number; max: number }>;
  normalizedMatrix: number[][];
  weightedMatrix: number[][];
  ranking: RankingRow[];
}

export interface WpStepData {
  normalizedWeights: Record<string, number>;
  weightPowers: Record<string, number>;
  exponentsMatrix: number[][];
  vectorS: { alternativeId: string; alternativeName: string; score: number }[];
  totalSumS: number;
  ranking: RankingRow[];
  hasZeroCostAdjustment?: boolean;
  adjustedViolations?: { alternativeId: string; criterionId: string }[];
}

export interface TopsisStepData {
  columnNorms: Record<string, { sumSquares: number; norm: number }>;
  normalizedMatrix: number[][];
  weightedMatrix: number[][];
  idealPositive: number[];
  idealNegative: number[];
  distances: {
    alternativeId: string;
    alternativeName: string;
    dPlus: number;
    dMinus: number;
    cScore: number;
  }[];
  ranking: RankingRow[];
}

export interface AhpStepData {
  pairwiseMatrix: number[][];
  colSums: number[];
  normalizedMatrix: number[][];
  priorityVector: number[];
  consistency: ConsistencyResult;
}

export interface StoryStepData {
  narrativeText: string;
  extractedAlternatives: Alternative[];
  extractedCriteria: Criterion[];
}

export interface ComparisonStepData {
  result: ComparisonResult;
  activeMethods: CompareMethod[];
}

export interface ReportPayload {
  projectTitle: string;
  generatedAt: string;
  scope?: ExportScope;
  primaryMethod?: MethodId;
  config?: ExportReportConfig;
  criteria: Criterion[];
  alternatives: Alternative[];
  contextMetadata?: CaseContextMetadata;


  sawData?: SawStepData;
  wpData?: WpStepData;
  topsisData?: TopsisStepData;
  ahpData?: AhpStepData;
  storyData?: StoryStepData;
  comparisonData?: ComparisonStepData;

  primaryRanking?: RankingRow[];
  conclusionText?: string;
  aiNarrative?: AiExecutiveNarrative;

  method: MethodId;
  result: MethodResult;
  comparisonResult?: ComparisonResult;
}
