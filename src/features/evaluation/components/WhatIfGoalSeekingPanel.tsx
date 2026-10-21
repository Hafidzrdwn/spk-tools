import React from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useNumberFormatter } from '@/utils/numberFormat';
import { HelpCircle, Target, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Criterion, Alternative } from '@/types/domain';
import type { WhatIfSimulationResult, GoalSeekingTarget } from '@/core/analysis';

export interface WhatIfGoalSeekingPanelProps {
  criteria: Criterion[];
  alternatives: Alternative[];
  whatIfAltId: string;
  onSelectWhatIfAltId: (id: string) => void;
  whatIfCritId: string;
  onSelectWhatIfCritId: (id: string) => void;
  whatIfValue: number;
  onChangeWhatIfValue: (val: number) => void;
  whatIfResult: WhatIfSimulationResult | null;
  goalSeekingAltId: string;
  onSelectGoalSeekingAltId: (id: string) => void;
  goalSeekingCritId: string;
  onSelectGoalSeekingCritId: (id: string) => void;
  goalSeekingResult: GoalSeekingTarget | null;
}

export const WhatIfGoalSeekingPanel: React.FC<WhatIfGoalSeekingPanelProps> = ({
  criteria,
  alternatives,
  whatIfAltId,
  onSelectWhatIfAltId,
  whatIfCritId,
  onSelectWhatIfCritId,
  whatIfValue,
  onChangeWhatIfValue,
  whatIfResult,
  goalSeekingAltId,
  onSelectGoalSeekingAltId,
  goalSeekingCritId,
  onSelectGoalSeekingCritId,
  goalSeekingResult,
}) => {
  const { formatNumber } = useNumberFormatter();

  return (
    <div className="space-y-6">
      <Card className="border-indigo-100 shadow-2xs">
        <CardHeader className="py-3 px-4 border-b border-indigo-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-900 tracking-wider uppercase font-mono">
                  Teknik 1 DA
                </span>
                <span className="text-slate-300">•</span>
                <CardTitle className="text-sm font-bold text-slate-800">
                  What-If Analysis (Analisis "Bagaimana Jika Nilai Input Berubah")
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Memprediksi dampak perubahan nilai parameter alternatif terhadap urutan peringkat (contoh: negosiasi diskon harga)
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Pilih Alternatif Diuji:
              </label>
              <select
                value={whatIfAltId}
                onChange={(e) => onSelectWhatIfAltId(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {alternatives.map((alt) => (
                  <option key={alt.id} value={alt.id}>
                    {alt.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Pilih Kriteria Diubah:
              </label>
              <select
                value={whatIfCritId}
                onChange={(e) => onSelectWhatIfCritId(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {criteria.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Nilai Baru Diuji (Simulasi):
              </label>
              <input
                type="number"
                value={whatIfValue}
                onChange={(e) => onChangeWhatIfValue(Number(e.target.value))}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {whatIfResult && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Nilai Parameter</span>
                  <div className="flex items-center justify-center gap-2 mt-1 font-mono">
                    <span className="text-slate-500">{whatIfResult.oldValue}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-bold text-indigo-900">{whatIfResult.newValue}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Skor Preferensi</span>
                  <div className="flex items-center justify-center gap-2 mt-1 font-mono">
                    <span className="text-slate-500">{formatNumber(whatIfResult.originalScore, 4)}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-bold text-indigo-900">{formatNumber(whatIfResult.newScore, 4)}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                    ({whatIfResult.scoreDelta > 0 ? '+' : ''}{whatIfResult.scoreDelta})
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Perubahan Posisi Ranking</span>
                  <div className="flex items-center justify-center gap-2 mt-1 font-bold">
                    <span className="text-slate-500">#{whatIfResult.originalRank}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-indigo-900">#{whatIfResult.newRank}</span>
                  </div>
                  <span className="text-[10px] text-indigo-700 font-medium block mt-0.5">
                    {whatIfResult.rankDelta > 0
                      ? `Naik ${whatIfResult.rankDelta} peringkat`
                      : whatIfResult.rankDelta < 0
                      ? `Turun ${Math.abs(whatIfResult.rankDelta)} peringkat`
                      : 'Peringkat tidak berubah'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Goal Seeking Calculator Card */}
      <Card className="border-indigo-100 shadow-2xs">
        <CardHeader className="py-3 px-4 border-b border-indigo-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-900 tracking-wider uppercase font-mono">
                  Teknik 4 DA
                </span>
                <span className="text-slate-300">•</span>
                <CardTitle className="text-sm font-bold text-slate-800">
                  Goal Seeking Calculator (Pencarian Target Input Otomatis)
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Menghitung nilai input minimal/maksimal yang harus dicapai alternatif agar dapat merebut posisi Juara 1
              </CardDescription>
            </div>
          </div>

          {goalSeekingResult && (
            <Badge variant={goalSeekingResult.isFeasible ? 'benefit' : 'cost'} size="sm">
              {goalSeekingResult.isFeasible ? 'Target Realistis (Feasible)' : 'Tidak Realistis (Infeasible)'}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Pilih Alternatif yang Ingin Menang (Target):
              </label>
              <select
                value={goalSeekingAltId}
                onChange={(e) => onSelectGoalSeekingAltId(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {alternatives.map((alt) => (
                  <option key={alt.id} value={alt.id}>
                    {alt.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Pilih Kriteria yang Ingin Dioptimalkan:
              </label>
              <select
                value={goalSeekingCritId}
                onChange={(e) => onSelectGoalSeekingCritId(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {criteria.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {goalSeekingResult ? (
            <div className="space-y-3">
              {/* Box Rincian Langkah Matematis Modul */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
                <span className="font-bold text-slate-800 block">Langkah Perhitungan Target Matematis:</span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-sans">1. Tambahan Skor (&Delta;)</span>
                    <div className="text-xs font-bold text-indigo-950 mt-0.5">
                      {goalSeekingResult.winnerScore} - {goalSeekingResult.currentScore} = {goalSeekingResult.scoreDeltaNeeded}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-sans">2. Kenaikan Normalisasi</span>
                    <div className="text-xs font-bold text-indigo-950 mt-0.5">
                      &Delta; / w<sub>j</sub> = +{goalSeekingResult.requiredNormalizedRise} (Target: {goalSeekingResult.targetNormalizedValue})
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-sans">3. Target Nilai Riil</span>
                    <div className="text-xs font-bold text-emerald-800 mt-0.5">
                      {goalSeekingResult.requiredRealValue !== null ? formatNumber(goalSeekingResult.requiredRealValue, 2) : 'N/A'}
                    </div>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-lg border flex items-start gap-2.5 text-xs leading-relaxed ${
                    goalSeekingResult.isFeasible
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50/60 border-rose-200 text-rose-950'
                  }`}
                >
                  {goalSeekingResult.isFeasible ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <p>{goalSeekingResult.summaryExplanation}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              Pilih alternatif selain Juara 1 untuk memulai kalkulasi Goal Seeking.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatIfGoalSeekingPanel;
