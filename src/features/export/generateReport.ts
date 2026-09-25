import type { MethodId, Criterion, Alternative } from '@/types/domain';
import type { MethodResult } from '@/core/math/types';
import type { compareRankings } from '@/core/math/compareRankings';
import type { ReportPayload } from './types';

export interface ProjectStateSubset {
  title: string;
  criteria: Criterion[];
  alternatives: Alternative[];
}

export interface BuildReportPayloadOptions {
  projectTitle?: string;
  generatedAt?: string;
  method: MethodId;
  criteria: Criterion[];
  alternatives: Alternative[];
  result: MethodResult;
  comparisonResult?: ReturnType<typeof compareRankings>;
}

/**
 * Format tanggal ISO ke format bahasa Indonesia yang mudah dibaca.
 * Contoh: "26 September 2026, 01:25 WIB"
 */
export function formatIndonesianDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const formatter = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${formatter.format(date)} WIB`;
  } catch {
    return isoString;
  }
}

/**
 * Mendapatkan nama lengkap metode SPK yang deskriptif.
 */
export function getMethodFullName(method: MethodId): string {
  switch (method) {
    case 'SAW':
      return 'Simple Additive Weighting (SAW)';
    case 'WP':
      return 'Weighted Product (WP)';
    case 'TOPSIS':
      return 'Technique for Order of Preference by Similarity to Ideal Solution (TOPSIS)';
    case 'AHP':
      return 'Analytic Hierarchy Process (AHP)';
    case 'AUTO':
      return 'Story-to-Matrix Heuristic';
    case 'COMPARE':
      return 'Multi-Method Comparison (SAW vs WP vs TOPSIS)';
    default:
      return method;
  }
}

/**
 * Membangun narasi 1 paragraf kesimpulan otomatis berdasarkan data payload kalkulasi.
 * Menganalisis alternatif terbaik, skor preferensi, kriteria unggulan, dan konsensus perbandingan (jika ada).
 */
export function generateReportConclusion(payload: ReportPayload): string {
  const { method, criteria, alternatives, result, comparisonResult } = payload;
  const rankings = result.finalRanking;

  if (!rankings || rankings.length === 0) {
    return 'Belum ada data perangkingan alternatif yang dapat dianalisis untuk laporan ini.';
  }

  const sortedRankings = [...rankings].sort((a, b) => a.rank - b.rank);
  const winner = sortedRankings[0];
  const winnerAlt = alternatives.find((a) => a.id === winner.alternativeId);
  const scoreFormatted = Number(winner.score).toFixed(4);
  const methodName = getMethodFullName(method);

  // Analisis kriteria unggulan untuk alternatif pemenang
  let strengthSummary = '';
  if (winnerAlt && criteria.length > 0) {
    // Cari kriteria benefit dengan nilai tertinggi relatif, atau cost dengan nilai terendah
    const standoutCriteria: string[] = [];

    for (const crit of criteria) {
      const val = winnerAlt.values[crit.id];
      if (val === undefined) continue;

      const allValues = alternatives
        .map((a) => a.values[crit.id])
        .filter((v): v is number => v !== undefined);

      if (allValues.length === 0) continue;

      if (crit.type === 'BENEFIT') {
        const maxVal = Math.max(...allValues);
        if (val >= maxVal * 0.95) {
          standoutCriteria.push(crit.name);
        }
      } else {
        const minVal = Math.min(...allValues);
        if (val <= minVal * 1.05) {
          standoutCriteria.push(crit.name);
        }
      }
    }

    if (standoutCriteria.length > 0) {
      const topStrengths = standoutCriteria.slice(0, 2).join(' dan ');
      strengthSummary = `, unggul terutama pada kriteria ${topStrengths}`;
    }
  }

  // Analisis konsensus jika ada comparisonResult
  let consensusNote = '';
  if (comparisonResult && comparisonResult.rows.length > 0) {
    const winnerComparison = comparisonResult.rows.find(
      (r) => r.alternativeId === winner.alternativeId
    );
    if (winnerComparison?.isConsensusRank1) {
      consensusNote =
        ' Konsistensi alternatif ini sangat kuat karena berhasil mencapai konsensus peringkat #1 di seluruh metode (SAW, WP, dan TOPSIS).';
    } else if (comparisonResult.hasRank1Shift) {
      consensusNote =
        ' Perlu diperhatikan bahwa terdapat pergeseran peringkat #1 antar metode yang diakibatkan oleh perbedaan formulasi pembobotan geometris dan linear.';
    }
  }

  const otherCount = Math.max(0, alternatives.length - 1);
  const marginNote =
    sortedRankings.length > 1
      ? ` dengan selisih skor ${(winner.score - sortedRankings[1].score).toFixed(4)} atas runner-up (${sortedRankings[1].alternativeName})`
      : '';

  return `Berdasarkan evaluasi komputasi metode ${methodName}, alternatif "${winner.alternativeName}" terpilih sebagai rekomendasi keputusan terbaik (Peringkat #1) dengan skor preferensi akhir sebesar ${scoreFormatted}${marginNote}${strengthSummary}. Hasil perhitungan kuantitatif ini merefleksikan performa optimal dibandingkan ${otherCount} alternatif lainnya yang dievaluasi.${consensusNote}`;
}

/**
 * Fungsi pure yang membangun ReportPayload dari state proyek dan MethodResult aktif.
 * Fungsi ini murni mengonsumsi data yang sudah dihitung tanpa mengubah atau menghitung ulang matematika inti.
 */
export function generateReport(
  projectStateOrOptions: ProjectStateSubset | BuildReportPayloadOptions,
  method?: MethodId,
  result?: MethodResult,
  comparisonResult?: ReturnType<typeof compareRankings>,
  generatedAt?: string
): ReportPayload {
  // Dukung pemanggilan via objek tunggal opsi
  if ('method' in projectStateOrOptions && 'result' in projectStateOrOptions) {
    const opts = projectStateOrOptions as BuildReportPayloadOptions;
    return {
      projectTitle: opts.projectTitle?.trim() || 'Laporan Pengambilan Keputusan SPK',
      generatedAt: opts.generatedAt || new Date().toISOString(),
      method: opts.method,
      criteria: opts.criteria,
      alternatives: opts.alternatives,
      result: opts.result,
      comparisonResult: opts.comparisonResult,
    };
  }

  // Dukung pemanggilan via parameter berurutan
  const state = projectStateOrOptions as ProjectStateSubset;
  if (!method || !result) {
    throw new Error('generateReport memerlukan parameter method dan result saat dipanggil.');
  }

  return {
    projectTitle: state.title?.trim() || 'Laporan Pengambilan Keputusan SPK',
    generatedAt: generatedAt || new Date().toISOString(),
    method,
    criteria: state.criteria,
    alternatives: state.alternatives,
    result,
    comparisonResult,
  };
}

export const buildReportPayload = generateReport;
export default generateReport;
