import React, { useState } from 'react';
import useSawViewModel from './useSawViewModel';
import MatrixInputGrid from '@/features/shared/MatrixInputGrid';
import SawNormalizationTable from './components/SawNormalizationTable';
import SawRankingTable from './components/SawRankingTable';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { ArrowRight, CheckCircle2, Trophy, Calculator, Table, BarChart2 } from 'lucide-react';

export const SawTab: React.FC = () => {
  const {
    criteria,
    alternatives,
    normalizedMatrix,
    finalRanking,
    bestAlternative,
    updateCellValue,
    hasData,
  } = useSawViewModel();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(3);

  const steps = [
    { step: 1, label: '1. Matriks Awal (X)', icon: <Table className="w-3.5 h-3.5" /> },
    { step: 2, label: '2. Normalisasi (R)', icon: <Calculator className="w-3.5 h-3.5" /> },
    { step: 3, label: '3. Perangkingan (V)', icon: <BarChart2 className="w-3.5 h-3.5" /> },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Top Banner & Best Alternative Card */}
      {bestAlternative && (
        <Card className="bg-linear-to-r from-amber-500/10 via-indigo-500/5 to-transparent border-amber-200/80">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-control bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                    Rekomendasi Terpilih (Metode SAW)
                  </span>
                  <Badge variant="benefit" size="sm">
                    Peringkat 1
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {bestAlternative.alternativeName}
                </h3>
              </div>
            </div>
            <div className="text-right font-mono bg-white/90 px-3 py-1.5 rounded-control border border-amber-200/70 shadow-2xs">
              <span className="text-[10px] text-slate-400 block">Nilai Preferensi (V)</span>
              <span className="text-base font-extrabold text-amber-700">
                {bestAlternative.score.toFixed(4)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Mathematical Stepper Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2 bg-slate-100/80 rounded-card border border-slate-200/70">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {steps.map((s) => {
            const isActive = activeStep === s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(s.step)}
                className={`flex-1 sm:flex-none flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-control transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                }`}
              >
                {s.icon}
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-500 px-2 font-mono">
          <span>X_ij</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span>R_ij (Normalisasi)</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span>V_i = Σ(w_j · r_ij)</span>
        </div>
      </div>

      {/* Stepper Content Panels */}
      {!hasData ? (
        <Card>
          <CardContent className="p-8 text-center text-xs text-slate-500">
            Kriteria atau alternatif belum lengkap. Masukkan minimal 1 kriteria dan 1 alternatif pada panel input.
          </CardContent>
        </Card>
      ) : (
        <div>
          {activeStep === 1 && (
            <Card>
              <CardHeader className="py-3 border-b border-slate-100">
                <CardTitle className="text-sm">Tahap 1: Matriks Keputusan Awal (X)</CardTitle>
                <CardDescription>Ketik nilai kriteria setiap alternatif di bawah ini</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <MatrixInputGrid criteria={criteria} alternatives={alternatives} onChangeCell={updateCellValue} />
              </CardContent>
            </Card>
          )}

          {activeStep === 2 && (
            <Card>
              <CardHeader className="py-3 border-b border-slate-100">
                <CardTitle className="text-sm">Tahap 2: Matriks Ternormalisasi (R)</CardTitle>
                <CardDescription>
                  Nilai r_ij = x_ij / max (Benefit) atau min / x_ij (Cost) dengan rentang [0, 1]
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <SawNormalizationTable criteria={criteria} alternatives={alternatives} normalizedMatrix={normalizedMatrix} />
              </CardContent>
            </Card>
          )}

          {activeStep === 3 && (
            <Card>
              <CardHeader className="py-3 border-b border-slate-100">
                <CardTitle className="text-sm">Tahap 3: Hasil Perangkingan Akhir (V)</CardTitle>
                <CardDescription>
                  Agregasi bobot ternormalisasi: V_i = Σ (w_j · r_ij), urutan ranking 1 adalah alternatif terbaik
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <SawRankingTable ranking={finalRanking} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default SawTab;
