import React from 'react';
import type { Criterion, Alternative } from '@/types/domain';
import Badge from '@/components/ui/Badge';
import { TraceableCell } from '@/features/inspector';
import { MathFormula } from '@/components/ui/MathFormula';

import { useNumberFormatter } from '@/utils/numberFormat';

export interface SawNormalizationTableProps {
  criteria: Criterion[];
  alternatives: Alternative[];
  normalizedMatrix: number[][];
}

interface SawNormalizationRowProps {
  alt: Alternative;
  altIdx: number;
  rowValues: number[];
  criteria: Criterion[];
}

const SawNormalizationRow: React.FC<SawNormalizationRowProps> = React.memo(({
  alt,
  altIdx,
  rowValues,
  criteria,
}) => {
  const formatNumber = useNumberFormatter();

  return (
    <tr className="hover:bg-indigo-50/20 transition-colors">
      <td className="py-2.5 px-4 font-semibold text-slate-800 sticky left-0 bg-white/95 z-10 border-r border-slate-200/70 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono text-[11px] w-5">A{altIdx + 1}</span>
          <span className="truncate" title={alt.name}>{alt.name}</span>
        </div>
      </td>
      {criteria.map((crit, critIdx) => {
        const val = rowValues[critIdx] ?? 0;
        const isFirstCell = altIdx === 0 && critIdx === 0;
        return (
          <TraceableCell
            key={crit.id}
            cellId={`saw-${alt.id}-${crit.id}-NORMALIZED`}
            data-tour-id={isFirstCell ? 'saw-normalized-cell' : undefined}
            className="py-2.5 px-3 border-r border-slate-100 last:border-r-0"
          >
            <div className="font-mono text-xs py-1 px-2 rounded bg-slate-50 border border-slate-200/60 text-slate-800 text-right font-medium">
              {formatNumber(val, 4)}
            </div>
          </TraceableCell>
        );
      })}
    </tr>
  );
});
SawNormalizationRow.displayName = 'SawNormalizationRow';

export const SawNormalizationTable: React.FC<SawNormalizationTableProps> = ({
  criteria,
  alternatives,
  normalizedMatrix,
}) => {
  if (criteria.length === 0 || alternatives.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-control border border-slate-200">
        <p className="font-medium text-slate-600 mb-1">Data belum lengkap untuk normalisasi.</p>
        <p>Isi nilai matriks keputusan pada panel <span className="font-semibold text-accent-primary">Tabel Matriks</span> di atas terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div data-tour-id="saw-normalization-table" className="w-full overflow-x-auto rounded-card border border-slate-200/80 bg-white/90 shadow-2xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold">
            <th className="py-3 px-4 w-44 min-w-44 sticky left-0 bg-slate-50/95 z-10 border-r border-slate-200/70">
              Alternatif \ Matriks <MathFormula math="R" inline />
            </th>
            {criteria.map((crit, idx) => (
              <th key={crit.id} className="py-3 px-3 min-w-34 border-r border-slate-200/50 last:border-r-0">
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <span className="font-bold text-slate-800 truncate" title={crit.name}>
                    {crit.name || `Kriteria ${idx + 1}`}
                  </span>
                  <Badge variant={crit.type === 'BENEFIT' ? 'benefit' : 'cost'} size="sm">
                    {crit.type}
                  </Badge>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  <MathFormula
                    math={crit.type === 'BENEFIT' ? 'r_{ij} = \\frac{x_{ij}}{\\max_i(x_{ij})}' : 'r_{ij} = \\frac{\\min_i(x_{ij})}{x_{ij}}'}
                    inline
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {alternatives.map((alt, altIdx) => (
            <SawNormalizationRow
              key={alt.id}
              alt={alt}
              altIdx={altIdx}
              rowValues={normalizedMatrix[altIdx] || []}
              criteria={criteria}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SawNormalizationTable;
