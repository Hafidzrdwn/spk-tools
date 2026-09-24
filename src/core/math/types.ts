/** Satu langkah rumus untuk SATU sel, dipakai FormulaFloatingCard */
export interface TraceStep {
  cellId: string; // format: "{method}-{alternativeId}-{criterionId}-{stage}"
  stage: 'RAW' | 'NORMALIZED' | 'WEIGHTED' | 'DISTANCE' | 'FINAL';
  formulaLabel: string; // "Cost ⟹ x12 = min(X) / x12" → siap tampil, bukan cuma angka
  inputs: Record<string, number>; // { min: 20, x: 50 } → dipakai highlight sel sumber
  sourceCellIds: string[]; // id sel-sel di tabel awal yang harus ikut nyala (pulse effect)
  result: number;
}

export interface RankingRow {
  alternativeId: string;
  alternativeName: string;
  score: number;
  rank: number; // 1 = terbaik
}

export interface MethodResult<TRanking = RankingRow> {
  intermediateMatrices: Record<string, number[][]>; // { normalized: [...], weighted: [...] }
  formulaSteps: TraceStep[];
  finalRanking: TRanking[];
}
