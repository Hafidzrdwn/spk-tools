import type { MethodId, Criterion, Alternative } from '@/types/domain';
import type { MethodResult } from '@/core/math/types';
import type { compareRankings } from '@/core/math/compareRankings';

/**
 * Kontrak data payload laporan PDF DecisiGraph sesuai spesifikasi teknis Bagian 13.
 */
export interface ReportPayload {
  projectTitle: string;
  generatedAt: string;          // ISO string, format tanggal Indonesia saat render
  method: MethodId;
  criteria: Criterion[];
  alternatives: Alternative[];
  result: MethodResult;
  comparisonResult?: ReturnType<typeof compareRankings>; // opsional, kalau user export dari mode Multi-Method Comparison
}
