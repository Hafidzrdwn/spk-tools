import React from 'react';
import type { ComparisonResult } from '@/core/math/compareRankings';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { CheckCircle2, Sparkles, Scale, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useNumberFormatter } from '@/utils/numberFormat';

export interface RankingShiftExplanationProps {
  comparison: ComparisonResult;
}

export const RankingShiftExplanation: React.FC<RankingShiftExplanationProps> = ({ comparison }) => {
  const { formatNumber } = useNumberFormatter();
  const {
    activeMethods = ['saw', 'wp', 'topsis'],
    hasRank1Shift,
    rank1Winners,
    explanation,
    differences,
    sensitivity,
  } = comparison;

  const hasSaw = activeMethods.includes('saw');
  const hasWp = activeMethods.includes('wp');
  const hasTopsis = activeMethods.includes('topsis');

  const [isSensitivityCollapsed, setIsSensitivityCollapsed] = React.useState(false);

  return (
    <div className="space-y-4">
      {/* Kartu Status Konsensus / Pergeseran Peringkat #1 */}
      {!hasRank1Shift ? (
        <Card className="bg-benefit/5 border-benefit/20 shadow-2xs">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-control bg-benefit/15 border border-benefit/30 flex items-center justify-center text-benefit shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Konsensus Peringkat #1 Tercapai
                </h4>
                <Badge variant="benefit" size="sm">
                  Stabil
                </Badge>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{explanation}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
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
                <span className="text-[11px] text-amber-800/80">
                  Hasil terbaik berbeda antar metode yang dipilih akibat variasi pemodelan matematis
                </span>
              </div>
            </div>
            <Badge variant="cost" size="sm" className="animate-pulse">
              Divergensi Peringkat
            </Badge>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* Kartu Pemenang Peringkat 1 untuk Metode Aktif */}
            <div
              className={`grid gap-2.5 ${
                activeMethods.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'
              }`}
            >
              {hasSaw && (
                <div className="p-2.5 rounded-control bg-white/90 border border-indigo-100 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-indigo-700">Pemenang SAW</span>
                    <Badge variant="primary" size="sm">
                      #1
                    </Badge>
                  </div>
                  <div
                    className="font-bold text-slate-800 text-xs truncate"
                    title={rank1Winners.saw?.alternativeName}
                  >
                    {rank1Winners.saw?.alternativeName || '-'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Skor: {formatNumber(rank1Winners.saw?.score, 4)}
                  </div>
                </div>
              )}

              {hasWp && (
                <div className="p-2.5 rounded-control bg-white/90 border border-violet-100 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-violet-700">Pemenang WP</span>
                    <Badge variant="primary" size="sm">
                      #1
                    </Badge>
                  </div>
                  <div
                    className="font-bold text-slate-800 text-xs truncate"
                    title={rank1Winners.wp?.alternativeName}
                  >
                    {rank1Winners.wp?.alternativeName || '-'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Skor: {formatNumber(rank1Winners.wp?.score, 4)}
                  </div>
                </div>
              )}

              {hasTopsis && (
                <div className="p-2.5 rounded-control bg-white/90 border border-sky-100 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-sky-700">Pemenang TOPSIS</span>
                    <Badge variant="primary" size="sm">
                      #1
                    </Badge>
                  </div>
                  <div
                    className="font-bold text-slate-800 text-xs truncate"
                    title={rank1Winners.topsis?.alternativeName}
                  >
                    {rank1Winners.topsis?.alternativeName || '-'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    C_i: {formatNumber(rank1Winners.topsis?.score, 4)}
                  </div>
                </div>
              )}
            </div>

            {/* Narasi Alasan Matematis */}
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-slate-800 leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Mengapa Pemenang Bisa Berbeda? (Investigasi Data Aktual)</span>
              </div>
              <p className="text-slate-700">{explanation}</p>
            </div>

            {/* Tabel Komparasi Nilai Kriteria Pemenang */}
            {differences.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-600 block">
                  Perbandingan Nilai Mentah Antar Alternatif Pemenang:
                </span>
                <div className="overflow-x-auto rounded-lg border border-slate-200/80 bg-white/80">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                        <th className="py-1.5 px-3">Kriteria</th>
                        <th className="py-1.5 px-3 text-right">Bobot</th>
                        <th
                          className="py-1.5 px-3 text-right font-medium text-indigo-700 max-w-28 truncate"
                          title={`${rank1Winners.saw?.alternativeName ?? ''} (SAW)`}
                        >
                          {rank1Winners.saw?.alternativeName} (SAW)
                        </th>
                        <th
                          className="py-1.5 px-3 text-right font-medium text-sky-700 max-w-28 truncate"
                          title={`${rank1Winners.topsis?.alternativeName ?? ''} (TOPSIS)`}
                        >
                          {rank1Winners.topsis?.alternativeName} (TOPSIS)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {differences.map((diff) => (
                        <tr key={diff.criterionId}>
                          <td className="py-1.5 px-3 font-sans font-medium text-slate-700">
                            {diff.criterionName}
                          </td>
                          <td className="py-1.5 px-3 text-right text-slate-500">
                            {formatNumber(diff.weight, 2)}
                          </td>
                          <td className="py-1.5 px-3 text-right font-semibold text-indigo-900">
                            {formatNumber(diff.valA, 4)}
                          </td>
                          <td className="py-1.5 px-3 text-right font-semibold text-sky-900">
                            {formatNumber(diff.valB, 4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Kartu Analisis Sensitivitas & Margin Selisih Skor (Smart Gap Insight) */}
      {sensitivity && (
        <Card className="bg-linear-to-r from-indigo-50/50 via-slate-50 to-white border-indigo-200/70 shadow-2xs overflow-hidden transition-all">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsSensitivityCollapsed((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsSensitivityCollapsed((prev) => !prev);
              }
            }}
            className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors hover:bg-indigo-50/60 ${
              !isSensitivityCollapsed ? 'border-b border-indigo-100/80' : ''
            }`}
            aria-expanded={!isSensitivityCollapsed}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Info className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Analisis Sensitivitas & Margin Selisih Skor
                  </h4>
                  {isSensitivityCollapsed && (
                    <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50/80 px-1.5 py-0.5 rounded border border-indigo-200/50">
                      (Diciutkan)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {sensitivity.hasTightMargins ? (
                <Badge variant="cost" size="sm" className="font-semibold text-[10px]">
                  Margin Tipis (Sensitivitas Tinggi)
                </Badge>
              ) : (
                <Badge variant="benefit" size="sm" className="font-semibold text-[10px]">
                  Margin Tegas (Diferensiasi Jelas)
                </Badge>
              )}
              <div className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-slate-800 transition-transform">
                {isSensitivityCollapsed ? (
                  <ChevronDown className="w-4 h-4 text-indigo-600" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-indigo-600" />
                )}
              </div>
            </div>
          </div>

          {!isSensitivityCollapsed && (
            <CardContent className="p-4 space-y-3 pt-3">
              <p className="text-xs text-slate-700 leading-relaxed font-sans bg-white/80 p-3 rounded-lg border border-slate-200/80">
                {sensitivity.statement}
              </p>

              {/* Rincian Selisih Skor Antar Peringkat Berurutan */}
              {sensitivity.gaps.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    Daftar Selisih Skor Antar Peringkat Berurutan per Metode:
                  </span>
                  <div className="overflow-x-auto rounded-lg border border-slate-200/80 bg-white">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <th className="py-1.5 px-3">Metode</th>
                          <th className="py-1.5 px-3">Pasangan Peringkat</th>
                          <th className="py-1.5 px-3">Alternatif Dibandingkan</th>
                          <th className="py-1.5 px-3 text-right">Selisih Skor (&Delta;)</th>
                          <th className="py-1.5 px-3 text-center">Status Margin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {sensitivity.gaps.map((g, idx) => (
                          <tr
                            key={`${g.method}-${g.higherRank}-${idx}`}
                            className={g.isTight ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/60'}
                          >
                            <td className="py-1.5 px-3 font-bold font-sans">
                              <span
                                className={
                                  g.method === 'saw'
                                    ? 'text-indigo-700'
                                    : g.method === 'wp'
                                    ? 'text-violet-700'
                                    : 'text-sky-700'
                                }
                              >
                                {g.methodName}
                              </span>
                            </td>
                            <td className="py-1.5 px-3 font-sans text-slate-600">
                              #{g.higherRank} vs #{g.lowerRank}
                            </td>
                            <td
                              className="py-1.5 px-3 font-sans font-medium text-slate-800 truncate max-w-48"
                              title={`${g.higherAltName} vs ${g.lowerAltName}`}
                            >
                              <span className="text-slate-900">{g.higherAltName}</span>
                              <span className="text-slate-400 mx-1">&bull;</span>
                              <span className="text-slate-600">{g.lowerAltName}</span>
                            </td>
                            <td className="py-1.5 px-3 text-right font-bold text-slate-900">
                              {formatNumber(g.gap, 4)}
                            </td>
                            <td className="py-1.5 px-3 text-center font-sans">
                              {g.isTight ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                  Sangat Tipis
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                                  Cukup Tegas
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};

export default RankingShiftExplanation;
