export interface TraceStep {
  cellId: string;
  stage: 'RAW' | 'NORMALIZED' | 'WEIGHTED' | 'DISTANCE' | 'FINAL';
  formulaLabel: string;
  inputs: Record<string, number>;
  sourceCellIds: string[];
  result: number;
}

export interface RankingRow {
  alternativeId: string;
  alternativeName: string;
  score: number;
  rank: number;
}

export interface MethodResult<TRanking = RankingRow> {
  intermediateMatrices: Record<string, number[][]>;
  formulaSteps: TraceStep[];
  finalRanking: TRanking[];
  hasZeroCostAdjustment?: boolean;
  adjustedViolations?: { alternativeId: string; criterionId: string }[];
  warningNote?: string;
}

