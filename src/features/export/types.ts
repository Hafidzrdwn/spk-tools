import type { MethodId, Criterion, Alternative } from '@/types/domain';
import type { MethodResult } from '@/core/math/types';
import type { compareRankings } from '@/core/math/compareRankings';

export interface ReportPayload {
  projectTitle: string;
  generatedAt: string;
  method: MethodId;
  criteria: Criterion[];
  alternatives: Alternative[];
  result: MethodResult;
  comparisonResult?: ReturnType<typeof compareRankings>;
}
