import React from 'react';
import type { Criterion, Alternative } from '@/types/domain';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Check, Edit3, AlertTriangle, TableProperties } from 'lucide-react';

export interface ExtractedPreviewTableProps {
  criteria: Criterion[];
  alternatives: Alternative[];
  unmatchedCriteria?: string[];
  onCommit: () => void;
  onBackToEdit: () => void;
  isCommitted: boolean;
}

export const ExtractedPreviewTable: React.FC<ExtractedPreviewTableProps> = ({
  criteria,
  alternatives,
  unmatchedCriteria = [],
  onCommit,
  onBackToEdit,
  isCommitted,
}) => {
  if (alternatives.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-card border border-slate-200 text-xs text-slate-500">
        Belum ada alternatif yang diekstraksi. Silakan ketik narasi teks atau coba contoh kasus.
      </div>
    );
  }

  return (
    <Card className="border border-slate-200/90 shadow-2xs space-y-4">
      <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-control bg-indigo-50 text-accent-primary flex items-center justify-center">
            <TableProperties className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">
              Pratinjau Matriks Hasil Ekstraksi
            </CardTitle>
            <CardDescription className="text-xs">
              Verifikasi kelengkapan nilai sebelum menerapkan data ke proyek utama
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBackToEdit} className="text-xs">
            <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Narasi
          </Button>

          <Button
            variant="primary"
            size="sm"
            data-tour-id="story-commit-btn"
            onClick={onCommit}
            className="font-semibold shadow-xs cursor-pointer px-4"
          >
            {isCommitted ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-300" />
                Data Diterapkan!
              </>
            ) : (
              'Terapkan ke Proyek'
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {unmatchedCriteria.length > 0 && (
          <div className="p-2.5 rounded-lg bg-amber-50/90 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Kriteria belum memiliki nilai di teks: <strong>{unmatchedCriteria.join(', ')}</strong></span>
          </div>
        )}

        <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white/90">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3 w-40 sticky left-0 bg-slate-50/95 z-10 border-r border-slate-200/70">
                  Alternatif / Kandidat
                </th>
                {criteria.map((crit) => (
                  <th key={crit.id} className="py-2.5 px-3 min-w-[7.5rem] border-r border-slate-200/50 last:border-r-0 text-center">
                    <div className="font-bold text-slate-800 truncate" title={crit.name}>{crit.name}</div>
                    <Badge variant={crit.type === 'BENEFIT' ? 'benefit' : 'cost'} size="sm" className="mt-0.5">
                      {crit.type}
                    </Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alternatives.map((alt, idx) => (
                <tr key={alt.id || idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2 px-3 font-semibold text-slate-800 sticky left-0 bg-white/95 z-10 border-r border-slate-200/70">
                    <span className="truncate">{alt.name}</span>
                  </td>
                  {criteria.map((crit) => {
                    const val = alt.values[crit.id];
                    return (
                      <td key={crit.id} className="py-2 px-3 border-r border-slate-100 last:border-r-0 text-center font-mono font-medium text-slate-700">
                        {val !== undefined ? val : <span className="text-slate-300">-</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtractedPreviewTable;
