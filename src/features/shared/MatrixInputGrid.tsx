import React from 'react';
import type { Criterion, Alternative } from '@/types/domain';
import Badge from '@/components/ui/Badge';
import NumericInput from '@/components/ui/NumericInput';
import { cn } from '@/utils/cn';

export interface MatrixInputGridProps {
  criteria: Criterion[];
  alternatives: Alternative[];
  onChangeCell?: (alternativeId: string, criterionId: string, value: number) => void;
  readOnly?: boolean;
  className?: string;
}

export const MatrixInputGrid: React.FC<MatrixInputGridProps> = ({
  criteria,
  alternatives,
  onChangeCell,
  readOnly = false,
  className,
}) => {
  if (criteria.length === 0 || alternatives.length === 0) {
    return (
      <div className="p-8 text-center rounded-card bg-white/80 border border-slate-200/80 text-xs text-slate-500">
        Silakan tambahkan minimal 1 kriteria dan 1 alternatif untuk melihat matriks keputusan.
      </div>
    );
  }

  return (
    <div className={cn('w-full overflow-x-auto rounded-card border border-slate-200/80 bg-white/90 shadow-2xs', className)}>
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold">
            <th className="py-3 px-4 w-48 min-w-[12rem] sticky left-0 bg-slate-50/95 z-10 border-r border-slate-200/70">
              Alternatif \ Kriteria
            </th>
            {criteria.map((crit, idx) => (
              <th key={crit.id} className="py-3 px-3 min-w-[9.5rem] border-r border-slate-200/50 last:border-r-0">
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <span className="font-bold text-slate-800 truncate" title={crit.name}>
                    {crit.name || `Kriteria ${idx + 1}`}
                  </span>
                  <Badge variant={crit.type === 'BENEFIT' ? 'benefit' : 'cost'} size="sm">
                    {crit.type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>w = {crit.weight}</span>
                  <span>{(crit.normalizedWeight * 100).toFixed(1)}%</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {alternatives.map((alt, altIdx) => (
            <tr key={alt.id} className="hover:bg-indigo-50/20 transition-colors">
              <td className="py-2.5 px-4 font-semibold text-slate-800 sticky left-0 bg-white/95 z-10 border-r border-slate-200/70 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-[11px] w-5">A{altIdx + 1}</span>
                  <span className="truncate">{alt.name}</span>
                </div>
              </td>
              {criteria.map((crit) => {
                const cellValue = alt.values[crit.id] ?? 0;
                return (
                  <td key={crit.id} className="py-2 px-3 border-r border-slate-100 last:border-r-0">
                    {readOnly ? (
                      <div className="font-mono text-xs py-1.5 px-2 bg-slate-50/80 rounded border border-slate-200/60 text-slate-700 text-right">
                        {cellValue}
                      </div>
                    ) : (
                      <NumericInput
                        value={cellValue}
                        onChange={(val) => onChangeCell?.(alt.id, crit.id, val)}
                        min={0}
                        step={1}
                        className="py-1 text-xs"
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MatrixInputGrid;
