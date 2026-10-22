import Decimal from 'decimal.js';
import type { MethodId, Criterion, Alternative, CaseContextMetadata } from '@/types/domain';

import type { MethodResult, RankingRow } from '@/core/math/types';
import { calculateSAW } from '@/core/math/saw';
import { calculateWP, calculateSafeWP, WpZeroGuardError } from '@/core/math/wp';
import { calculateTOPSIS } from '@/core/math/topsis';
import { calculateAHP } from '@/core/math/ahp';
import { compareRankings, type CompareMethod } from '@/core/math/compareRankings';
import type {
  ExportScope,
  ExportReportConfig,
  SawStepData,
  WpStepData,
  TopsisStepData,
  AhpStepData,
  StoryStepData,
  ComparisonStepData,
  ReportPayload,
} from './types';
import type { AiExecutiveNarrative } from '@/services/ai';
import { formatDisplayNumber } from '@/utils/numberFormat';

export interface ProjectStateSubset {
  title: string;
  criteria: Criterion[];
  alternatives: Alternative[];
}

export interface BuildReportOptions {
  projectTitle?: string;
  generatedAt?: string;
  scope?: ExportScope;
  primaryMethod?: MethodId;
  config?: Partial<ExportReportConfig>;
  criteria: Criterion[];
  alternatives: Alternative[];
  contextMetadata?: CaseContextMetadata;
  customAhpMatrix?: number[][];

  storyNarrative?: string;
  cachedResult?: MethodResult;
  cachedComparisonResult?: ReturnType<typeof compareRankings>;
  aiNarrative?: AiExecutiveNarrative;
}

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

export function getMethodFullName(method: MethodId | 'COMPARE' | 'AUTO'): string {
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
      return 'Story-to-Matrix Heuristic Parser';
    case 'COMPARE':
      return 'Komparasi Multi-Metode (SAW, WP & TOPSIS)';
    default:
      return method;
  }
}

export function buildSawStepData(
  criteria: Criterion[],
  alternatives: Alternative[]
): SawStepData {
  const extremums: Record<string, { min: number; max: number }> = {};
  criteria.forEach((crit) => {
    const colValues = alternatives.map((alt) => alt.values[crit.id] ?? 0);
    extremums[crit.id] = {
      min: colValues.length > 0 ? Math.min(...colValues) : 0,
      max: colValues.length > 0 ? Math.max(...colValues) : 0,
    };
  });

  const rawRes = calculateSAW(criteria, alternatives);
  const normalizedMatrix = rawRes.intermediateMatrices.normalized || [];
  const weightedMatrix = rawRes.intermediateMatrices.weighted || [];

  return {
    extremums,
    normalizedMatrix,
    weightedMatrix,
    ranking: rawRes.finalRanking || [],
  };
}

export function buildWpStepData(
  criteria: Criterion[],
  alternatives: Alternative[]
): WpStepData {
  const rawWeightSum = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
  const normalizedWeights: Record<string, number> = {};
  const weightPowers: Record<string, number> = {};

  criteria.forEach((crit) => {
    let w = 0;
    if (typeof crit.normalizedWeight === 'number' && !Number.isNaN(crit.normalizedWeight)) {
      w = crit.normalizedWeight;
    } else if (rawWeightSum > 0) {
      w = new Decimal(crit.weight).dividedBy(rawWeightSum).toNumber();
    } else {
      w = new Decimal(1).dividedBy(Math.max(1, criteria.length)).toNumber();
    }
    normalizedWeights[crit.id] = w;
    weightPowers[crit.id] = crit.type === 'BENEFIT' ? w : -w;
  });

  let rawRes: MethodResult;
  try {
    rawRes = calculateWP(criteria, alternatives);
  } catch (err) {
    if (err instanceof WpZeroGuardError) {
      rawRes = calculateSafeWP(criteria, alternatives);
    } else {
      throw err;
    }
  }

  const exponentsMatrix = rawRes.intermediateMatrices.exponents || [];
  const vectorSValues = rawRes.intermediateMatrices.vectorS || [];
  const vectorS = alternatives.map((alt, idx) => ({
    alternativeId: alt.id,
    alternativeName: alt.name,
    score: vectorSValues[idx]?.[0] ?? 0,
  }));
  const totalSumS = vectorS.reduce((acc, curr) => acc + curr.score, 0);

  return {
    normalizedWeights,
    weightPowers,
    exponentsMatrix,
    vectorS,
    totalSumS,
    ranking: rawRes.finalRanking || [],
    hasZeroCostAdjustment: rawRes.hasZeroCostAdjustment,
    adjustedViolations: rawRes.adjustedViolations,
  };
}

export function buildTopsisStepData(
  criteria: Criterion[],
  alternatives: Alternative[]
): TopsisStepData {
  const columnNorms: Record<string, { sumSquares: number; norm: number }> = {};
  criteria.forEach((crit) => {
    const sumSquares = alternatives.reduce((sum, alt) => {
      const x = alt.values[crit.id] ?? 0;
      return sum + x * x;
    }, 0);
    const norm = Math.sqrt(sumSquares);
    columnNorms[crit.id] = { sumSquares, norm };
  });

  const rawRes = calculateTOPSIS(criteria, alternatives);
  const normalizedMatrix = rawRes.intermediateMatrices.normalized || [];
  const weightedMatrix = rawRes.intermediateMatrices.weighted || [];
  const idealPositive = rawRes.intermediateMatrices.idealPositive?.[0] || [];
  const idealNegative = rawRes.intermediateMatrices.idealNegative?.[0] || [];

  const distances = alternatives.map((alt, altIndex) => {
    const yRow = weightedMatrix[altIndex] || [];
    let diffPlusSum = 0;
    let diffMinusSum = 0;

    criteria.forEach((_, critIndex) => {
      const y = yRow[critIndex] ?? 0;
      const aPlus = idealPositive[critIndex] ?? 0;
      const aMinus = idealNegative[critIndex] ?? 0;
      const diffPlus = y - aPlus;
      const diffMinus = y - aMinus;
      diffPlusSum += diffPlus * diffPlus;
      diffMinusSum += diffMinus * diffMinus;
    });

    const dPlus = Math.sqrt(diffPlusSum);
    const dMinus = Math.sqrt(diffMinusSum);
    const dTotal = dPlus + dMinus;
    const cScore = dTotal > 0 ? dMinus / dTotal : 0;

    return {
      alternativeId: alt.id,
      alternativeName: alt.name,
      dPlus,
      dMinus,
      cScore,
    };
  });

  return {
    columnNorms,
    normalizedMatrix,
    weightedMatrix,
    idealPositive,
    idealNegative,
    distances,
    ranking: rawRes.finalRanking || [],
  };
}

export function buildAhpStepData(
  criteria: Criterion[],
  customPairwiseMatrix?: number[][]
): AhpStepData {
  const n = criteria.length;
  let matrix: number[][];

  if (
    customPairwiseMatrix &&
    customPairwiseMatrix.length === n &&
    customPairwiseMatrix.every((r) => r.length === n)
  ) {
    matrix = customPairwiseMatrix;
  } else if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('decisigraph_ahp_matrix');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === n && parsed.every((r) => r.length === n)) {
          matrix = parsed;
        } else {
          matrix = generateDefaultAhpMatrix(criteria);
        }
      } else {
        matrix = generateDefaultAhpMatrix(criteria);
      }
    } catch {
      matrix = generateDefaultAhpMatrix(criteria);
    }
  } else {
    matrix = generateDefaultAhpMatrix(criteria);
  }

  const colSums: number[] = [];
  for (let j = 0; j < n; j++) {
    let sumCol = new Decimal(0);
    for (let i = 0; i < n; i++) {
      const val = matrix[i]?.[j] ?? 1;
      sumCol = sumCol.plus(new Decimal(val));
    }
    colSums.push(sumCol.toNumber());
  }

  const ahpRes = calculateAHP(matrix, criteria);

  return {
    pairwiseMatrix: matrix,
    colSums,
    normalizedMatrix: ahpRes.normalizedMatrix || [],
    priorityVector: ahpRes.priorityVector || [],
    consistency: ahpRes.consistency,
  };
}

function generateDefaultAhpMatrix(criteria: Criterion[]): number[][] {
  const n = criteria.length;
  if (n === 0) return [];
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(1));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1;
      } else {
        const wI = Math.max(0.001, criteria[i]?.weight || 1);
        const wJ = Math.max(0.001, criteria[j]?.weight || 1);
        matrix[i][j] = Number((wI / wJ).toFixed(4));
      }
    }
  }
  return matrix;
}

export function buildStoryStepData(
  criteria: Criterion[],
  alternatives: Alternative[],
  customStoryNarrative?: string
): StoryStepData {
  let narrativeText = customStoryNarrative?.trim() || '';

  if (!narrativeText && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('decisigraph_story_raw_text');
      if (stored && stored.trim()) {
        narrativeText = stored.trim();
      }
    } catch {
      // Fallback
    }
  }

  if (!narrativeText && alternatives.length > 0) {
    narrativeText = alternatives
      .map((alt) => {
        const specs = criteria
          .map((c) => `${c.name}: ${alt.values[c.id] ?? 0}${c.unit ? ` ${c.unit}` : ''}`)
          .join(', ');
        return `Kandidat ${alt.name} memiliki profil spesifikasi: ${specs}.`;
      })
      .join('\n');
  }

  return {
    narrativeText,
    extractedAlternatives: alternatives,
    extractedCriteria: criteria,
  };
}

export function buildComparisonStepData(
  sawRanking: RankingRow[],
  wpRanking: RankingRow[],
  topsisRanking: RankingRow[],
  criteria: Criterion[],
  alternatives: Alternative[],
  activeMethods: CompareMethod[]
): ComparisonStepData {
  const comp = compareRankings(
    sawRanking,
    wpRanking,
    topsisRanking,
    criteria,
    alternatives,
    activeMethods
  );
  return {
    result: comp,
    activeMethods,
  };
}

export function generateReportConclusion(
  payload: ReportPayload,
  separator: 'comma' | 'dot' = 'comma'
): string {
  const { config, criteria, alternatives, primaryRanking, comparisonData, comparisonResult } = payload;
  const rankings = primaryRanking && primaryRanking.length > 0
    ? primaryRanking
    : payload.result?.finalRanking || [];

  if (!rankings || rankings.length === 0) {
    return 'Belum ada data perangkingan alternatif yang dapat dianalisis untuk laporan ini.';
  }

  const sortedRankings = [...rankings].sort((a, b) => a.rank - b.rank);
  const winner = sortedRankings[0];
  const winnerAlt = alternatives.find((a) => a.id === winner.alternativeId);
  const scoreFormatted = formatDisplayNumber(winner.score, { decimals: 4, separator });

  const resolvedMethods = config?.selectedMethods || [payload.method || 'SAW'];
  const methodLabel =
    resolvedMethods.length === 1
      ? resolvedMethods[0]
      : resolvedMethods.join(', ');

  let strengthSummary = '';
  if (winnerAlt && criteria.length > 0) {
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
        if (val >= maxVal * 0.95) standoutCriteria.push(crit.name);
      } else {
        const minVal = Math.min(...allValues);
        if (val <= minVal * 1.05) standoutCriteria.push(crit.name);
      }
    }

    if (standoutCriteria.length > 0) {
      const topStrengths = standoutCriteria.slice(0, 2).join(' dan ');
      strengthSummary = `, unggul terutama pada kriteria ${topStrengths}`;
    }
  }

  let consensusNote = '';
  const compRes = comparisonResult || comparisonData?.result;
  if (compRes && compRes.rows.length > 0) {
    const winnerComparison = compRes.rows.find(
      (r) => r.alternativeId === winner.alternativeId
    );
    if (winnerComparison?.isConsensusRank1) {
      consensusNote =
        ' Konsistensi alternatif ini sangat kuat karena berhasil mencapai konsensus peringkat #1 di seluruh metode (SAW, WP, dan TOPSIS).';
    } else if (compRes.hasRank1Shift) {
      consensusNote =
        ' Perlu diperhatikan bahwa terdapat pergeseran peringkat #1 antar metode yang diakibatkan oleh perbedaan formulasi pembobotan geometris dan linear.';
    }
  }

  const otherCount = Math.max(0, alternatives.length - 1);
  const marginNote =
    sortedRankings.length > 1
      ? ` dengan selisih skor ${formatDisplayNumber(winner.score - sortedRankings[1].score, { decimals: 4, separator })} atas runner-up (${sortedRankings[1].alternativeName})`
      : '';

  return `Berdasarkan evaluasi komputasi metode ${methodLabel}, alternatif "${winner.alternativeName}" terpilih sebagai rekomendasi keputusan terbaik (Peringkat #1) dengan skor preferensi akhir sebesar ${scoreFormatted}${marginNote}${strengthSummary}. Hasil perhitungan kuantitatif ini merefleksikan performa optimal dibandingkan ${otherCount} alternatif lainnya yang dievaluasi.${consensusNote}`;
}

export function buildComprehensiveReport(options: BuildReportOptions): ReportPayload {
  const {
    projectTitle = 'Laporan Pengambilan Keputusan SPK',
    generatedAt = new Date().toISOString(),
    scope = 'CURRENT',
    primaryMethod = 'SAW',
    criteria,
    alternatives,
    customAhpMatrix,
    storyNarrative,
  } = options;

  const resolvedMethods: MethodId[] =
    options.config?.selectedMethods && options.config.selectedMethods.length > 0
      ? options.config.selectedMethods
      : scope === 'ALL'
      ? ['SAW', 'WP', 'TOPSIS', 'AHP']
      : [primaryMethod];

  const compareCandidates = resolvedMethods.filter((m) =>
    ['SAW', 'WP', 'TOPSIS'].includes(m)
  );

  const autoIncludeComparison =
    options.config?.includeComparison !== undefined
      ? options.config.includeComparison
      : compareCandidates.length >= 2;

  const autoIncludeStory =
    options.config?.includeStory !== undefined
      ? options.config.includeStory
      : resolvedMethods.includes('AUTO') || scope === 'ALL';

  const autoIncludeAhp =
    options.config?.includeAhp !== undefined
      ? options.config.includeAhp
      : resolvedMethods.includes('AHP') || scope === 'ALL';

  const config: ExportReportConfig = {
    selectedMethods: resolvedMethods,
    includeComparison: autoIncludeComparison,
    includeStory: autoIncludeStory,
    includeAhp: autoIncludeAhp,
    includeExecutiveSummary: options.config?.includeExecutiveSummary ?? true,
  };

  let sawData: SawStepData | undefined;
  let wpData: WpStepData | undefined;
  let topsisData: TopsisStepData | undefined;
  let ahpData: AhpStepData | undefined;
  let storyData: StoryStepData | undefined;
  let comparisonData: ComparisonStepData | undefined;

  const needsSaw = resolvedMethods.includes('SAW') || config.includeComparison;
  const needsWp = resolvedMethods.includes('WP') || config.includeComparison;
  const needsTopsis = resolvedMethods.includes('TOPSIS') || config.includeComparison;

  if (needsSaw && criteria.length > 0 && alternatives.length > 0) {
    sawData = buildSawStepData(criteria, alternatives);
  }

  if (needsWp && criteria.length > 0 && alternatives.length > 0) {
    wpData = buildWpStepData(criteria, alternatives);
  }

  if (needsTopsis && criteria.length > 0 && alternatives.length > 0) {
    topsisData = buildTopsisStepData(criteria, alternatives);
  }

  if (config.includeAhp && criteria.length >= 2) {
    ahpData = buildAhpStepData(criteria, customAhpMatrix);
  }

  if (config.includeStory) {
    storyData = buildStoryStepData(criteria, alternatives, storyNarrative);
  }

  if (
    config.includeComparison &&
    sawData &&
    wpData &&
    topsisData &&
    compareCandidates.length >= 2
  ) {
    const activeCompareMethods: CompareMethod[] = compareCandidates.map((m) =>
      m.toLowerCase() as CompareMethod
    );
    comparisonData = buildComparisonStepData(
      sawData.ranking,
      wpData.ranking,
      topsisData.ranking,
      criteria,
      alternatives,
      activeCompareMethods
    );
  }

  let primaryRanking: RankingRow[] = [];
  if (options.cachedResult?.finalRanking && options.cachedResult.finalRanking.length > 0) {
    primaryRanking = options.cachedResult.finalRanking;
  } else if (primaryMethod === 'SAW' && sawData) {
    primaryRanking = sawData.ranking;
  } else if (primaryMethod === 'WP' && wpData) {
    primaryRanking = wpData.ranking;
  } else if (primaryMethod === 'TOPSIS' && topsisData) {
    primaryRanking = topsisData.ranking;
  } else if (comparisonData && comparisonData.result.rows.length > 0) {
    primaryRanking = comparisonData.result.rows.map((row, idx) => ({
      alternativeId: row.alternativeId,
      alternativeName: row.alternativeName,
      score: Number((1 / Math.max(0.1, row.averageRank)).toFixed(4)),
      rank: idx + 1,
    }));
  } else if (sawData) {
    primaryRanking = sawData.ranking;
  }

  const effectiveResult: MethodResult = options.cachedResult || {
    intermediateMatrices: {},
    formulaSteps: [],
    finalRanking: primaryRanking,
    hasZeroCostAdjustment: wpData?.hasZeroCostAdjustment,
    adjustedViolations: wpData?.adjustedViolations,
  };

  const payloadDraft: ReportPayload = {
    projectTitle: projectTitle.trim() || 'Laporan Pengambilan Keputusan SPK',
    generatedAt,
    scope,
    primaryMethod,
    config,
    criteria,
    alternatives,
    contextMetadata: options.contextMetadata,
    sawData,

    wpData,
    topsisData,
    ahpData,
    storyData,
    comparisonData,
    primaryRanking,
    conclusionText: '',
    aiNarrative: options.aiNarrative,
    method: primaryMethod,
    result: effectiveResult,
    comparisonResult: options.cachedComparisonResult || comparisonData?.result,
  };

  payloadDraft.conclusionText = generateReportConclusion(payloadDraft);

  return payloadDraft;
}

export function generateReport(
  projectStateOrOptions: ProjectStateSubset | BuildReportOptions,
  method?: MethodId,
  result?: MethodResult,
  comparisonResult?: ReturnType<typeof compareRankings>,
  generatedAt?: string
): ReportPayload {
  if ('criteria' in projectStateOrOptions && 'alternatives' in projectStateOrOptions) {
    if ('scope' in projectStateOrOptions || 'config' in projectStateOrOptions) {
      return buildComprehensiveReport(projectStateOrOptions as BuildReportOptions);
    }

    const state = projectStateOrOptions as ProjectStateSubset;
    const effectiveMethod: MethodId = method || 'SAW';
    return buildComprehensiveReport({
      projectTitle: state.title,
      criteria: state.criteria,
      alternatives: state.alternatives,
      primaryMethod: effectiveMethod,
      generatedAt: generatedAt || new Date().toISOString(),
      cachedResult: result,
      cachedComparisonResult: comparisonResult,
    });
  }

  throw new Error('generateReport memerlukan parameter data kriteria dan alternatif yang valid.');
}

export const buildReportPayload = generateReport;
export default generateReport;
