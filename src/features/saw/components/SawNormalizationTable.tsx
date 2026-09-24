import React from 'react';
import type { Criterion, Alternative } from '@/types/domain';
import Badge from '@/components/ui/Badge';
import { TraceableCell } from '@/features/inspector';

export interface SawNormalizationTableProps {
  criteria: Criterion[];
  alternatives: Alternative[];
  normalizedMatrix: number[][];
}

export const SawNormalizationTable: React.FC<SawNormalizationTableProps> = ({
  criteria,
  alternatives,
  normalizedMatrix,
}) => {
  if (criteria.length === 0 || alternatives.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-control border border-slate-200">
        Data kriteria atau alternatif belum tersedia untuk normalisasi.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-card border border-slate-200/80 bg-white/90 shadow-2xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold">
            <th className="py-3 px-4 w-44 min-w-[11rem] sticky left-0 bg-slate-50/95 z-10 border-r border-slate-200/70">
              Alternatif \ Matriks R
            </th>
            {criteria.map((crit, idx) => (
              <th key={crit.id} className="py-3 px-3 min-w-[8.5rem] border-r border-slate-200/50 last:border-r-0">
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <span className="font-bold text-slate-800 truncate" title={crit.name}>
                    {crit.name || `Kriteria ${idx + 1}`}
                  </span>
                  <Badge variant={crit.type === 'BENEFIT' ? 'benefit' : 'cost'} size="sm">
                    {crit.type}
                  </Badge>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {crit.type === 'BENEFIT' ? 'r = x / max' : 'r = min / x'}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {alternatives.map((alt, altIdx) => {
            const rowValues = normalizedMatrix[altIdx] || [];
            return (
              <tr key={alt.id} className="hover:bg-indigo-50/20 transition-colors">
                <td className="py-2.5 px-4 font-semibold text-slate-800 sticky left-0 bg-white/95 z-10 border-r border-slate-200/70 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px] w-5">A{altIdx + 1}</span>
                    <span className="truncate">{alt.name}</span>
                  </div>
                </td>
                {criteria.map((crit, critIdx) => {
                  const val = rowValues[critIdx] ?? 0;
                  return (
                    <TraceableCell
                      key={crit.id}
                      cellId={`saw-${alt.id}-${crit.id}-NORMALIZED`}
                      className="py-2.5 px-3 border-r border-slate-100 last:border-r-0"
                    >
                      <div className="font-mono text-xs py-1 px-2 rounded bg-slate-50 border border-slate-200/60 text-slate-800 text-right font-medium">
                        {val.toFixed(4)}
                      </div>
                    </TraceableCell>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SawNormalizationTable;
