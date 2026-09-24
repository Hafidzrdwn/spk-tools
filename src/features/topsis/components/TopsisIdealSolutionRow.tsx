import React from 'react';
import type { Criterion, Alternative } from '@/types/domain';
import Badge from '@/components/ui/Badge';
import { TraceableCell } from '@/features/inspector';
import { Sparkles, AlertOctagon, CheckCircle2 } from 'lucide-react';

export interface TopsisIdealSolutionRowProps {
  criteria: Criterion[];
  alternatives: Alternative[];
  weightedMatrix: number[][];
  idealPositive: number[];
  idealNegative: number[];
}

export const TopsisIdealSolutionRow: React.FC<TopsisIdealSolutionRowProps> = ({
  criteria,
  alternatives,
  weightedMatrix,
  idealPositive,
  idealNegative,
}) => {
  if (criteria.length === 0 || alternatives.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-control border border-slate-200">
        Data kriteria dan alternatif belum tersedia untuk penentuan solusi ideal.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="w-full overflow-x-auto rounded-card border border-slate-200/80 bg-white/90 shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-3 px-4 w-52 min-w-[13rem] sticky left-0 bg-slate-50/95 z-10 border-r border-slate-200/70">
                Matriks Terbobot (Y) & Solusi Ideal
              </th>
              {criteria.map((crit, idx) => (
                <th key={crit.id} className="py-3 px-3 min-w-[8.5rem] border-r border-slate-200/50 last:border-r-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-slate-800 truncate" title={crit.name}>
                      {crit.name || `C${idx + 1}`}
                    </span>
                    <Badge variant={crit.type === 'BENEFIT' ? 'benefit' : 'cost'} size="sm">
                      {crit.type}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    w = {crit.normalizedWeight.toFixed(4)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Baris Alternatif Y_ij */}
            {alternatives.map((alt, altIdx) => (
              <tr key={alt.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 px-4 font-semibold text-slate-700 sticky left-0 bg-white/95 z-10 border-r border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px] w-5">Y{altIdx + 1}</span>
                    <span className="truncate">{alt.name}</span>
                  </div>
                </td>
                {criteria.map((crit, critIdx) => (
                  <TraceableCell
                    key={crit.id}
                    cellId={`topsis-${alt.id}-${crit.id}-WEIGHTED`}
                    className="py-2.5 px-3 border-r border-slate-100 last:border-r-0 text-right font-mono text-slate-600"
                  >
                    {(weightedMatrix[altIdx]?.[critIdx] ?? 0).toFixed(4)}
                  </TraceableCell>
                ))}
              </tr>
            ))}

            {/* Baris Solusi Ideal Positif A+ (Menyala Hijau / Emerald) */}
            <tr className="bg-emerald-50/80 border-t-2 border-emerald-400 font-semibold text-emerald-950 hover:bg-emerald-100/60 transition-colors">
              <td className="py-3 px-4 sticky left-0 bg-emerald-50/95 z-10 border-r border-emerald-300">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-mono font-bold text-xs border border-emerald-400 shadow-2xs">
                    <Sparkles className="w-3 h-3 text-emerald-700" />
                    <span>A+</span>
                  </span>
                  <span className="text-xs font-bold text-emerald-900">Solusi Ideal Positif</span>
                </div>
              </td>
              {criteria.map((crit, critIdx) => (
                <td key={crit.id} className="py-3 px-3 border-r border-emerald-200/60 last:border-r-0 text-right font-mono font-bold text-emerald-800">
                  {(idealPositive[critIdx] ?? 0).toFixed(4)}
                </td>
              ))}
            </tr>

            {/* Baris Solusi Ideal Negatif A- (Menyala Merah Muda / Rose) */}
            <tr className="bg-rose-50/80 border-t border-rose-300 font-semibold text-rose-950 hover:bg-rose-100/60 transition-colors">
              <td className="py-3 px-4 sticky left-0 bg-rose-50/95 z-10 border-r border-rose-300">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-900 font-mono font-bold text-xs border border-rose-400 shadow-2xs">
                    <AlertOctagon className="w-3 h-3 text-rose-700" />
                    <span>A-</span>
                  </span>
                  <span className="text-xs font-bold text-rose-900">Solusi Ideal Negatif</span>
                </div>
              </td>
              {criteria.map((crit, critIdx) => (
                <td key={crit.id} className="py-3 px-3 border-r border-rose-200/60 last:border-r-0 text-right font-mono font-bold text-rose-800">
                  {(idealNegative[critIdx] ?? 0).toFixed(4)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopsisIdealSolutionRow;
