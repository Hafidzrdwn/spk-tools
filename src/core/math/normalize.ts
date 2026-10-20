import type { Criterion, Alternative, CriterionType } from '@/types/domain';
import type { TraceStep } from './types';

export function normalizeBenefit(value: number, max: number): number {
  if (max === 0) return 0;
  return value / max;
}

export function normalizeCost(value: number, min: number): number {
  if (value === 0) return 0;
  return min / value;
}

export function normalizeValue(
  value: number,
  type: CriterionType,
  extremum: { min: number; max: number }
): number {
  return type === 'BENEFIT'
    ? normalizeBenefit(value, extremum.max)
    : normalizeCost(value, extremum.min);
}

export function getExtremumPerCriterion(
  criteria: Criterion[],
  alternatives: Alternative[]
): Record<string, { min: number; max: number }> {
  const result: Record<string, { min: number; max: number }> = {};

  for (const criterion of criteria) {
    const values = alternatives
      .map((alt) => alt.values[criterion.id])
      .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));

    if (values.length === 0) {
      result[criterion.id] = { min: 0, max: 0 };
    } else {
      result[criterion.id] = {
        min: Math.min(...values),
        max: Math.max(...values),
      };
    }
  }

  return result;
}

export interface NormalizationResult {
  matrix: number[][];
  records: Record<string, Record<string, number>>;
  traceSteps: TraceStep[];
}

export function normalizeMatrix(
  criteria: Criterion[],
  alternatives: Alternative[],
  methodPrefix = 'saw'
): NormalizationResult {
  const extremums = getExtremumPerCriterion(criteria, alternatives);
  const matrix: number[][] = [];
  const records: Record<string, Record<string, number>> = {};
  const traceSteps: TraceStep[] = [];

  alternatives.forEach((alt, altIndex) => {
    const rowValues: number[] = [];
    records[alt.id] = {};

    criteria.forEach((crit, critIndex) => {
      const rawValue = alt.values[crit.id] ?? 0;
      const extremum = extremums[crit.id] ?? { min: 0, max: 0 };
      const normalized = normalizeValue(rawValue, crit.type, extremum);

      rowValues.push(normalized);
      records[alt.id][crit.id] = normalized;

      const cellId = `${methodPrefix}-${alt.id}-${crit.id}-NORMALIZED`;
      const rawCellId = `${methodPrefix}-${alt.id}-${crit.id}-RAW`;

      const formulaLabel =
        crit.type === 'BENEFIT'
          ? `Benefit ⟹ r_${altIndex + 1}${critIndex + 1} = x_${altIndex + 1}${critIndex + 1} / max(X) = ${rawValue} / ${extremum.max} = ${normalized.toFixed(4)}`
          : `Cost ⟹ r_${altIndex + 1}${critIndex + 1} = min(X) / x_${altIndex + 1}${critIndex + 1} = ${extremum.min} / ${rawValue} = ${normalized.toFixed(4)}`;

      traceSteps.push({
        cellId,
        stage: 'NORMALIZED',
        formulaLabel,
        inputs: {
          x: rawValue,
          ...(crit.type === 'BENEFIT' ? { max: extremum.max } : { min: extremum.min }),
        },
        sourceCellIds: [rawCellId],
        result: normalized,
      });
    });

    matrix.push(rowValues);
  });

  return {
    matrix,
    records,
    traceSteps,
  };
}
