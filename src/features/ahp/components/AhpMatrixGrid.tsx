import React from 'react';
import type { Criterion } from '@/types/domain';

export interface AhpMatrixGridProps {
  criteria: Criterion[];
  matrix: number[][];
  priorityVector: number[];
}

function formatCell(val: number): string {
  if (val === 1) return '1';
  if (val >= 1 && Number.isInteger(val)) return val.toString();
  if (val < 1) {
    const denom = Math.round(1 / val);
    if (Math.abs(val - 1 / denom) < 0.01) {
      return `1/${denom}`;
    }
  }
  return val.toFixed(4);
}

export const AhpMatrixGrid: React.FC<AhpMatrixGridProps> = ({
  criteria,
  matrix,
  priorityVector,
}) => {
  const n = criteria.length;
  if (n === 0 || matrix.length !== n) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-control border border-slate-200">
        Matriks perbandingan berpasangan belum tersedia.
      </div>
    );
  }

  // Hitung jumlah tiap kolom
  const colSums = Array.from({ length: n }, (_, j) =>
    matrix.reduce((sum, row) => sum + (row[j] ?? 1), 0)
  );

  return (
    <div className="space-y-3">
      <div className="w-full overflow-x-auto rounded-card border border-slate-200/80 bg-white/90 shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-3 px-4 w-44 sticky left-0 bg-slate-50/95 z-10 border-r border-slate-200/70">
                Kriteria \ Kriteria
              </th>
              {criteria.map((crit, idx) => (
                <th key={crit.id} className="py-3 px-3 min-w-[7.5rem] text-center border-r border-slate-200/50">
                  <div className="font-bold text-slate-800 truncate" title={crit.name}>
                    {crit.name || `C${idx + 1}`}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">C{idx + 1}</div>
                </th>
              ))}
              <th className="py-3 px-4 w-36 text-right font-mono bg-indigo-50/60 text-indigo-900 border-l border-indigo-200/60">
                Priority Vector (w)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {criteria.map((rowCrit, i) => {
              const weight = priorityVector[i] ?? 0;
              return (
                <tr key={rowCrit.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-slate-800 sticky left-0 bg-white/95 z-10 border-r border-slate-200/70">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[11px] w-5">C{i + 1}</span>
                      <span className="truncate">{rowCrit.name}</span>
                    </div>
                  </td>

                  {criteria.map((colCrit, j) => {
                    const val = matrix[i]?.[j] ?? 1;
                    const isDiagonal = i === j;
                    const isReciprocal = i > j;

                    return (
                      <td
                        key={colCrit.id}
                        className={`py-2 px-3 text-center font-mono border-r border-slate-100 last:border-r-0 ${
                          isDiagonal
                            ? 'bg-slate-100/70 text-slate-500 font-bold'
                            : isReciprocal
                            ? 'bg-slate-50/70 text-slate-600'
                            : 'text-indigo-700 font-bold bg-white'
                        }`}
                        title={
                          isDiagonal
                            ? 'Diagonal identitas (1.0)'
                            : isReciprocal
                            ? `Nilai kebalikan otomatis (1 / ${formatCell(matrix[j][i])})`
                            : 'Nilai perbandingan langsung'
                        }
                      >
                        <span className="inline-block px-2 py-1 rounded">
                          {formatCell(val)}
                        </span>
                      </td>
                    );
                  })}

                  <td className="py-2.5 px-4 text-right font-mono font-bold text-accent-primary bg-indigo-50/30 border-l border-indigo-100">
                    {(weight * 100).toFixed(2)}% ({weight.toFixed(4)})
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50/80 border-t border-slate-200 font-semibold text-slate-700">
              <td className="py-2.5 px-4 text-xs sticky left-0 bg-slate-50/95 z-10 border-r border-slate-200/70">
                Jumlah Kolom (Σ):
              </td>
              {colSums.map((sum, idx) => (
                <td key={`sum-${idx}`} className="py-2.5 px-3 text-center font-mono text-xs text-slate-600 border-r border-slate-200/50">
                  {sum.toFixed(4)}
                </td>
              ))}
              <td className="py-2.5 px-4 text-right font-mono text-xs text-indigo-700 font-bold bg-indigo-50/50 border-l border-indigo-200/60">
                100.00%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-slate-500 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300" />
          <span>Diagonal (1.0)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-white border border-indigo-200" />
          <span>Nilai Input (k)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-50 border border-slate-200" />
          <span>Nilai Kebalikan Otomatis (1/k)</span>
        </span>
      </div>
    </div>
  );
};

export default AhpMatrixGrid;
