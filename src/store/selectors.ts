import { useProjectStore } from './useProjectStore';
import type { Criterion } from '@/types/domain';

/**
 * Pure selector functions (dapat digunakan di luar komponen React / unit test)
 */
export function selectTotalWeight(criteria: Criterion[]): number {
  return criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
}

export function selectIsWeightValid(criteria: Criterion[]): boolean {
  if (criteria.length === 0) return false;
  const total = selectTotalWeight(criteria);
  const hasNegative = criteria.some((c) => (c.weight || 0) < 0);
  return total > 0 && !hasNegative;
}

export function selectNormalizedCriteria(criteria: Criterion[]): Criterion[] {
  const total = selectTotalWeight(criteria);
  const n = criteria.length;

  return criteria.map((c) => {
    let normalizedWeight = 0;
    if (total > 0) {
      normalizedWeight = (c.weight || 0) / total;
    } else if (n > 0) {
      normalizedWeight = 1 / n;
    }

    return {
      ...c,
      normalizedWeight,
    };
  });
}

/**
 * React Hook Selectors (reaktif terhadap perubahan criteria di useProjectStore)
 */
export const useTotalWeight = (): number => {
  return useProjectStore((state) => selectTotalWeight(state.criteria));
};

export const useIsWeightValid = (): boolean => {
  return useProjectStore((state) => selectIsWeightValid(state.criteria));
};

export const useNormalizedCriteria = (): Criterion[] => {
  return useProjectStore((state) => selectNormalizedCriteria(state.criteria));
};
