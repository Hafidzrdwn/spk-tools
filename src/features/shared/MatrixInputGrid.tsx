import React, { useState, useEffect } from 'react';
import type { Criterion, Alternative } from '@/types/domain';
import Badge from '@/components/ui/Badge';
import NumericInput from '@/components/ui/NumericInput';
import GlossaryTerm from '@/features/glossary/GlossaryTerm';
import { useDebouncedCallback } from '@/utils/useDebouncedCallback';
import { cn } from '@/utils/cn';

interface MatrixCellInputProps {
  value: number;
  onCommit: (val: number) => void;
  className?: string;
}

const MatrixCellInput: React.FC<MatrixCellInputProps> = React.memo(({ value, onCommit, className }) => {
  const [localVal, setLocalVal] = useState<number>(value);

  // Sinkronisasi jika nilai luar berubah (misal ganti template atau reset)
  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const debouncedCommit = useDebouncedCallback((val: number) => {
    onCommit(val);
  }, 250);

  const handleChange = (newVal: number) => {
    setLocalVal(newVal);
    debouncedCommit(newVal);
  };

  return (
    <NumericInput
      value={localVal}
      onChange={handleChange}
      onBlur={() => debouncedCommit.flush()}
      min={0}
      step={1}
      className={className}
    />
  );
});
MatrixCellInput.displayName = 'MatrixCellInput';

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
    const missingCrit = criteria.length === 0;
    const missingAlt = alternatives.length === 0;

    return (
      <div className="p-8 text-center rounded-card bg-white/80 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 text-accent-primary flex items-center justify-center shadow-xs">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-800">Matriks Keputusan Belum Siap</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {missingCrit && missingAlt
              ? 'Belum ada Kriteria dan Alternatif. Silakan tambahkan data melalui tab "Kriteria" & "Alternatif", atau gunakan tombol "Muat Contoh Kasus".'
              : missingCrit
              ? 'Kriteria evaluasi belum ada. Tambahkan minimal 1 kriteria pada tab "Kriteria".'
              : 'Daftar alternatif belum ada. Tambahkan minimal 1 alternatif pada tab "Alternatif".'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full overflow-x-auto rounded-card border border-slate-200/80 bg-white/90 shadow-2xs', className)}>
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold">
            <th className="py-3 px-4 w-48 min-w-48 sticky left-0 bg-slate-50/95 z-10 border-r border-slate-200/70">
              <GlossaryTerm term="Alternatif">Alternatif</GlossaryTerm> \ <GlossaryTerm term="Kriteria">Kriteria</GlossaryTerm>
            </th>
            {criteria.map((crit, idx) => (
              <th key={crit.id} className="py-3 px-3 min-w-38 border-r border-slate-200/50 last:border-r-0">
                <div className="flex items-start justify-between gap-1.5 mb-1">
                  <div className="truncate flex-1">
                    <span className="font-bold text-slate-800 block truncate" title={crit.name}>
                      {crit.name || `Kriteria ${idx + 1}`}
                    </span>
                    {crit.unit && (
                      <span className="text-[10px] text-slate-400 font-normal block truncate" title={crit.unit}>
                        ({crit.unit})
                      </span>
                    )}
                  </div>
                  <Badge variant={crit.type === 'BENEFIT' ? 'benefit' : 'cost'} size="sm" className="shrink-0 mt-0.5">
                    <GlossaryTerm term={crit.type === 'BENEFIT' ? 'Benefit' : 'Cost'}>{crit.type}</GlossaryTerm>
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span><GlossaryTerm term="Bobot (Weight)">w</GlossaryTerm> = {crit.weight}</span>
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
                  <td
                    key={crit.id}
                    data-cell-id={`saw-${alt.id}-${crit.id}-RAW topsis-${alt.id}-${crit.id}-RAW wp-${alt.id}-${crit.id}-RAW raw-${alt.id}-${crit.id}`}
                    className="py-2 px-3 border-r border-slate-100 last:border-r-0 transition-all duration-150"
                  >
                    {readOnly ? (
                      <div className="font-mono text-xs py-1.5 px-2 bg-slate-50/80 rounded border border-slate-200/60 text-slate-700 text-right">
                        {cellValue}
                      </div>
                    ) : (
                      <MatrixCellInput
                        value={cellValue}
                        onCommit={(val) => onChangeCell?.(alt.id, crit.id, val)}
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
