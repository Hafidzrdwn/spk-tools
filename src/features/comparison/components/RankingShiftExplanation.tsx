import React from 'react';
import type { ComparisonResult } from '@/core/math/compareRankings';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { CheckCircle2, Sparkles, Scale } from 'lucide-react';

export interface RankingShiftExplanationProps {
  comparison: ComparisonResult;
}

export const RankingShiftExplanation: React.FC<RankingShiftExplanationProps> = ({ comparison }) => {
  const { hasRank1Shift, rank1Winners, explanation, differences } = comparison;

  if (!hasRank1Shift) {
    return (
      <Card className="bg-benefit/5 border-benefit/20 shadow-2xs">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-control bg-benefit/15 border border-benefit/30 flex items-center justify-center text-benefit shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Konsensus Peringkat #1 Tercapai</h4>
              <Badge variant="benefit" size="sm">Stabil</Badge>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{explanation}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-linear-to-br from-amber-50/70 via-indigo-50/30 to-white border-amber-200/90 shadow-2xs">
      <CardHeader className="py-3 px-4 border-b border-amber-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-control bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-xs font-bold text-amber-950 uppercase tracking-wide">
              Analisis Pergeseran Peringkat #1 (Rank Shift)
            </CardTitle>
            <span className="text-[11px] text-amber-800/80">Hasil terbaik berbeda antar metode akibat perbedaan pemodelan matematis</span>
          </div>
        </div>
        <Badge variant="cost" size="sm" className="animate-pulse">Divergensi Peringkat</Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-2.5 rounded-control bg-white/90 border border-indigo-100 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-semibold text-indigo-700">Pemenang SAW</span>
              <Badge variant="primary" size="sm">#1</Badge>
            </div>
            <div className="font-bold text-slate-800 text-xs truncate" title={rank1Winners.saw?.alternativeName}>{rank1Winners.saw?.alternativeName || '-'}</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Skor: {rank1Winners.saw?.score.toFixed(4)}</div>
          </div>

          <div className="p-2.5 rounded-control bg-white/90 border border-violet-100 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-semibold text-violet-700">Pemenang WP</span>
              <Badge variant="primary" size="sm">#1</Badge>
            </div>
            <div className="font-bold text-slate-800 text-xs truncate" title={rank1Winners.wp?.alternativeName}>{rank1Winners.wp?.alternativeName || '-'}</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Skor: {rank1Winners.wp?.score.toFixed(4)}</div>
          </div>

          <div className="p-2.5 rounded-control bg-white/90 border border-sky-100 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-semibold text-sky-700">Pemenang TOPSIS</span>
              <Badge variant="primary" size="sm">#1</Badge>
            </div>
            <div className="font-bold text-slate-800 text-xs truncate" title={rank1Winners.topsis?.alternativeName}>{rank1Winners.topsis?.alternativeName || '-'}</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">C_i: {rank1Winners.topsis?.score.toFixed(4)}</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-slate-800 leading-relaxed space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Mengapa Pemenang Bisa Berbeda? (Investigasi Data Aktual)</span>
          </div>
          <p className="text-slate-700">{explanation}</p>
        </div>

        {differences.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-600 block">Perbandingan Nilai Mentah Antar Alternatif Pemenang:</span>
            <div className="overflow-x-auto rounded-lg border border-slate-200/80 bg-white/80">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <th className="py-1.5 px-3">Kriteria</th>
                    <th className="py-1.5 px-3 text-right">Bobot</th>
                    <th className="py-1.5 px-3 text-right font-medium text-indigo-700 max-w-[7rem] truncate" title={`${rank1Winners.saw?.alternativeName ?? ''} (SAW)`}>{rank1Winners.saw?.alternativeName} (SAW)</th>
                    <th className="py-1.5 px-3 text-right font-medium text-sky-700 max-w-[7rem] truncate" title={`${rank1Winners.topsis?.alternativeName ?? ''} (TOPSIS)`}>{rank1Winners.topsis?.alternativeName} (TOPSIS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {differences.map((diff) => (
                    <tr key={diff.criterionId}>
                      <td className="py-1.5 px-3 font-sans font-medium text-slate-700">{diff.criterionName}</td>
                      <td className="py-1.5 px-3 text-right text-slate-500">{diff.weight}</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-indigo-900">{diff.valA}</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-sky-900">{diff.valB}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RankingShiftExplanation;
