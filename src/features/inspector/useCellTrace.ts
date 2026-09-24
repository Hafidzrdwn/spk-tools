import { useMemo } from 'react';
import { useUiStore } from '@/store/useUiStore';
import type { TraceStep } from '@/core/math/types';

export function useCellTrace(formulaSteps: TraceStep[] = []) {
  const hoveredCellId = useUiStore((state) => state.hoveredCellId);

  const activeStep = useMemo(() => {
    if (!hoveredCellId || !formulaSteps.length) return null;
    return formulaSteps.find((step) => step.cellId === hoveredCellId) || null;
  }, [hoveredCellId, formulaSteps]);

  return {
    hoveredCellId,
    activeStep,
    isTracing: Boolean(activeStep),
  };
}

export default useCellTrace;
