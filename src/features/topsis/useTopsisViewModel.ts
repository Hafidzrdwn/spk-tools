import { useMemo } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useNormalizedCriteria } from '@/store/selectors';
import { calculateTOPSIS } from '@/core/math/topsis';
import type { Criterion, Alternative } from '@/types/domain';
import type { RankingRow, TraceStep } from '@/core/math/types';

export interface TopsisDistanceDetail {
  alternativeId: string;
  alternativeName: string;
  dPlus: number;
  dMinus: number;
  diffPlusSum: number;
  diffMinusSum: number;
  cScore: number;
}

export interface RadarDataPoint {
  criterion: string;
  fullMark: number;
  idealPositive: number;
  idealNegative: number;
  [alternativeName: string]: string | number;
}

export interface TopsisViewModel {
  criteria: Criterion[];
  alternatives: Alternative[];
  hasData: boolean;
  normalizedMatrix: number[][];
  weightedMatrix: number[][];
  idealPositive: number[];
  idealNegative: number[];
  distances: TopsisDistanceDetail[];
  finalRanking: RankingRow[];
  bestAlternative?: RankingRow;
  radarData: RadarDataPoint[];
  radarAlternativeKeys: { name: string; color: string }[];
  formulaSteps: TraceStep[];
  updateCellValue: (alternativeId: string, criterionId: string, value: number) => void;
}

const PALETTE = ['#4F46E5', '#D97706', '#7C3AED', '#0284C7', '#DB2777', '#2563EB'];

export function useTopsisViewModel(): TopsisViewModel {
  const criteria = useNormalizedCriteria();
  const alternatives = useProjectStore((state) => state.alternatives);
  const updateCellValue = useProjectStore((state) => state.updateCellValue);
  const hasData = criteria.length > 0 && alternatives.length > 0;

  const topsisResult = useMemo(() => {
    if (!hasData) {
      return {
        normalizedMatrix: [] as number[][], weightedMatrix: [] as number[][],
        idealPositive: [] as number[], idealNegative: [] as number[],
        distances: [] as TopsisDistanceDetail[], finalRanking: [] as RankingRow[],
        bestAlternative: undefined, radarData: [] as RadarDataPoint[],
        radarAlternativeKeys: [] as { name: string; color: string }[], formulaSteps: [] as TraceStep[],
      };
    }

    const result = calculateTOPSIS(criteria, alternatives);
    const normMatrix = result.intermediateMatrices.normalized ?? [];
    const weightMatrix = result.intermediateMatrices.weighted ?? [];
    const aPlus = result.intermediateMatrices.idealPositive?.[0] ?? [];
    const aMinus = result.intermediateMatrices.idealNegative?.[0] ?? [];

    const distances: TopsisDistanceDetail[] = alternatives.map((alt, altIdx) => {
      const yRow = weightMatrix[altIdx] || [];
      let diffPlusSum = 0;
      let diffMinusSum = 0;

      criteria.forEach((_, critIdx) => {
        const y = yRow[critIdx] ?? 0;
        diffPlusSum += Math.pow(y - (aPlus[critIdx] ?? 0), 2);
        diffMinusSum += Math.pow(y - (aMinus[critIdx] ?? 0), 2);
      });

      const dPlus = Math.sqrt(diffPlusSum);
      const dMinus = Math.sqrt(diffMinusSum);
      const dTotal = dPlus + dMinus;
      return {
        alternativeId: alt.id, alternativeName: alt.name,
        dPlus, dMinus, diffPlusSum, diffMinusSum,
        cScore: dTotal > 0 ? dMinus / dTotal : 0,
      };
    });

    const radarData: RadarDataPoint[] = criteria.map((crit, critIdx) => {
      const colNormValues = normMatrix.map((row) => row[critIdx] ?? 0);
      const maxCol = Math.max(...colNormValues, 0.0001);
      const minCol = Math.min(...colNormValues, 0);

      const normAPlus = crit.type === 'BENEFIT' ? maxCol / maxCol : minCol / maxCol;
      const normAMinus = crit.type === 'BENEFIT' ? minCol / maxCol : maxCol / maxCol;

      const point: RadarDataPoint = {
        criterion: crit.name || `K${critIdx + 1}`,
        fullMark: 1,
        idealPositive: Number(normAPlus.toFixed(4)),
        idealNegative: Number(normAMinus.toFixed(4)),
      };

      alternatives.forEach((alt, altIdx) => {
        const rVal = normMatrix[altIdx]?.[critIdx] ?? 0;
        point[alt.name] = Number((maxCol > 0 ? rVal / maxCol : 0).toFixed(4));
      });

      return point;
    });

    const radarAlternativeKeys = alternatives.map((alt, idx) => ({
      name: alt.name,
      color: PALETTE[idx % PALETTE.length],
    }));

    return {
      normalizedMatrix: normMatrix, weightedMatrix: weightMatrix,
      idealPositive: aPlus, idealNegative: aMinus,
      distances, finalRanking: result.finalRanking,
      bestAlternative: result.finalRanking[0], radarData,
      radarAlternativeKeys, formulaSteps: result.formulaSteps,
    };
  }, [criteria, alternatives, hasData]);

  return {
    criteria, alternatives, hasData,
    ...topsisResult, updateCellValue,
  };
}

export default useTopsisViewModel;
