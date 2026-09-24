import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import useCellTrace from '../useCellTrace';
import type { TraceStep } from '@/core/math/types';
import Badge from '@/components/ui/Badge';
import { Calculator, ArrowRight, Sparkles } from 'lucide-react';

export interface FormulaFloatingCardProps {
  formulaSteps?: TraceStep[];
  step?: TraceStep | null;
}

export const FormulaFloatingCard: React.FC<FormulaFloatingCardProps> = ({
  formulaSteps = [],
  step: directStep,
}) => {
  const { hoveredCellId, activeStep: tracedStep } = useCellTrace(formulaSteps);
  const activeStep = directStep ?? tracedStep;

  const [coords, setCoords] = useState<{ top: number; left: number; placeAbove: boolean } | null>(null);

  // Efek highlight sel sumber: temukan elemen data-cell-id yang cocok dan beri pulse ring
  useEffect(() => {
    if (!activeStep?.sourceCellIds?.length) return;
    const highlightedElements: HTMLElement[] = [];

    activeStep.sourceCellIds.forEach((srcId) => {
      const els = document.querySelectorAll<HTMLElement>(
        `[data-cell-id~="${srcId}"], [data-cell-id="${srcId}"]`
      );
      els.forEach((el) => {
        el.classList.add('ring-2', 'ring-indigo-400', 'ring-offset-1', 'animate-pulse', 'bg-indigo-50/80');
        highlightedElements.push(el);
      });
    });

    return () => {
      highlightedElements.forEach((el) => {
        el.classList.remove('ring-2', 'ring-indigo-400', 'ring-offset-1', 'animate-pulse', 'bg-indigo-50/80');
      });
    };
  }, [activeStep]);

  // Hitung posisi koordinat mengambang via getBoundingClientRect()
  useEffect(() => {
    if (!hoveredCellId || !activeStep) {
      setCoords(null);
      return;
    }

    const cellEl = document.querySelector<HTMLElement>(
      `[data-cell-id~="${hoveredCellId}"], [data-cell-id="${hoveredCellId}"]`
    );
    if (!cellEl) {
      setCoords(null);
      return;
    }

    const rect = cellEl.getBoundingClientRect();
    const cardWidth = 380;
    const placeAbove = rect.top > 160;

    const top = placeAbove
      ? window.scrollY + rect.top - 10
      : window.scrollY + rect.bottom + 10;

    let left = window.scrollX + rect.left + rect.width / 2 - cardWidth / 2;
    left = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, left));

    setCoords({ top, left, placeAbove });
  }, [hoveredCellId, activeStep]);

  if (!activeStep || !coords || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      style={{
        position: 'absolute',
        top: coords.top,
        left: coords.left,
        transform: coords.placeAbove ? 'translateY(-100%)' : 'none',
      }}
      className="z-50 w-[380px] pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95"
    >
      <div className="p-4 rounded-xl bg-white/95 backdrop-blur-md border border-indigo-200/90 shadow-2xl text-slate-800 space-y-2.5 ring-1 ring-slate-900/5">
        {/* Header Kartu Rumus */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Calculator className="w-3.5 h-3.5 text-accent-primary" />
            <span>Traceability Inspector</span>
          </div>
          <Badge variant="primary" size="sm">
            Tahap: {activeStep.stage}
          </Badge>
        </div>

        {/* Tampilan Formula Label */}
        <div className="p-2.5 rounded-lg bg-indigo-50/80 border border-indigo-100/90 font-mono text-xs text-indigo-950 font-medium leading-relaxed break-words shadow-2xs">
          {activeStep.formulaLabel}
        </div>

        {/* Info Hasil & Sel Sumber */}
        <div className="flex items-center justify-between text-[11px] pt-0.5 text-slate-500 font-mono">
          <div className="flex items-center gap-1">
            <span>Hasil =</span>
            <span className="font-bold text-slate-900 text-xs">{activeStep.result.toFixed(4)}</span>
          </div>
          {activeStep.sourceCellIds.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-full font-sans font-medium">
              <Sparkles className="w-3 h-3" />
              <span>{activeStep.sourceCellIds.length} Sel Sumber Disorot</span>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FormulaFloatingCard;
