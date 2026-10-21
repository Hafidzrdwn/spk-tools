import type { Criterion, Alternative } from '@/types/domain';
import type { RankingRow } from '@/core/math/types';

export type AiAnalysisMethod = 'saw' | 'wp' | 'topsis';

export interface AiNarrativeRequest {
  projectTitle: string;
  criteria: Criterion[];
  alternatives: Alternative[];
  activeMethods: AiAnalysisMethod[];
  rankings: {
    saw?: RankingRow[];
    wp?: RankingRow[];
    topsis?: RankingRow[];
  };
  budgetConstraint?: number;
}

export interface AiExecutiveNarrative {
  sectionA_rankingShifts: string;
  sectionB_methodValidity: string;
  sectionC_recommendations: string;
  source: 'gemini' | 'deterministic_fallback';
  modelUsed?: string;
  generatedAt: string;
  latencyMs: number;
}
