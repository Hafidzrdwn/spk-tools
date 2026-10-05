import React, { useState } from 'react';
import useAhpViewModel from './useAhpViewModel';
import { useUiStore } from '@/store/useUiStore';
import { useNumberFormatter } from '@/utils/numberFormat';
import { AhpPairwiseSlider } from './components/AhpPairwiseSlider';
import { AhpMatrixGrid } from './components/AhpMatrixGrid';
import { AhpConsistencyGauge } from './components/AhpConsistencyGauge';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { MathFormula } from '@/components/ui/MathFormula';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Sliders, Grid3X3, Activity, Sparkles, Check, RotateCcw } from 'lucide-react';

export const AhpTab: React.FC = () => {
  const { criteria, hasData, matrix, pairs, priorityVector, consistency, suggestion, setPairwiseValue, applySuggestion, resetMatrix, applyWeightsToProject } = useAhpViewModel();
  const { formatNumber } = useNumberFormatter();
  const activeStep = useUiStore((s) => s.ahpActiveStep);
  const setActiveStep = useUiStore((s) => s.setAhpActiveStep);
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    applyWeightsToProject();
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  const steps = [
    { step: 1, label: '1. Perbandingan Berpasangan', icon: <Sliders className="w-3.5 h-3.5" /> },
    { step: 2, label: '2. Matriks & Prioritas', icon: <Grid3X3 className="w-3.5 h-3.5" /> },
    { step: 3, label: '3. Uji Konsistensi (CR)', icon: <Activity className="w-3.5 h-3.5" /> },
  ] as const;

  return (
    <div className="space-y-6">
      <Card className="bg-linear-to-r from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-200/80">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-control bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-700 shadow-xs">
              <Sparkles className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-900 uppercase tracking-wide">Analytic Hierarchy Process (AHP)</span>
                <Badge variant={consistency.isConsistent ? 'benefit' : 'cost'} size="sm">
                  {consistency.isConsistent ? `CR = ${formatNumber(consistency.cr, 4)} (Konsisten)` : `CR = ${formatNumber(consistency.cr, 4)} (Inkonsisten)`}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Hitung eigen-vektor prioritas kriteria kualitatif via perbandingan berpasangan Saaty.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto" data-tour-id="ahp-apply-btn">
            <Button variant="ghost" size="sm" onClick={resetMatrix} title="Reset Matriks ke 1.0" className="min-h-9 sm:min-h-10 text-xs">
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
            </Button>
            <Button variant="primary" size="sm" onClick={handleApply} disabled={!hasData || !consistency.isConsistent} className="min-h-9 sm:min-h-10 text-xs font-medium shadow-xs">
              {applied ? <><Check className="w-3.5 h-3.5 mr-1 text-emerald-300" /> Bobot Diterapkan!</> : 'Terapkan Bobot ke Proyek'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2 bg-slate-100/80 rounded-card border border-slate-200/70">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none touch-pan-x pb-0.5 sm:pb-0">
          {steps.map((s) => (
            <button
              key={s.step}
              type="button"
              data-tour-id={`ahp-step-btn-${s.step}`}
              onClick={() => setActiveStep(s.step)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-control transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeStep === s.step ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
              }`}
            >
              {s.icon}
              <span className="hidden xs:inline">{s.label}</span>
              <span className="xs:hidden">{s.step === 1 ? '1. Perbandingan' : s.step === 2 ? '2. Prioritas' : '3. Konsistensi'}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <div className="text-[11px] text-slate-500 px-2 font-mono hidden md:block">{criteria.length} Kriteria &bull; {pairs.length} Perbandingan</div>
        </div>
      </div>

      {!hasData ? (
        <Card className="border-dashed border-2 border-slate-200/90 bg-white/70">
          <CardContent className="p-8 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-50 text-accent-primary flex items-center justify-center"><Sliders className="w-5 h-5" /></div>
            <h4 className="text-sm font-bold text-slate-800">Kriteria Kurang dari 2</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Metode AHP memerlukan minimal 2 kriteria untuk membentuk matriks perbandingan berpasangan. Tambahkan kriteria pada panel Kriteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {activeStep === 1 && (
            <Card data-tour-id="ahp-pairwise-panel">
              <CardHeader className="py-3 border-b border-slate-100">
                <CardTitle className="text-sm">Tahap 1: Slider Perbandingan Berpasangan (Skala Saaty)</CardTitle>
                <CardDescription>Geser slider untuk menentukan derajat kepentingan relatif kriteria baris vs kriteria kolom</CardDescription>
              </CardHeader>
              <CardContent className="pt-4"><AhpPairwiseSlider pairs={pairs} onSetPairwiseValue={setPairwiseValue} /></CardContent>
            </Card>
          )}

          {activeStep === 2 && (
            <Card data-tour-id="ahp-matrix-panel">
              <CardHeader className="py-3 border-b border-slate-100">
                <CardTitle className="text-sm flex items-center gap-1.5 flex-wrap">
                  <span>Tahap 2: Matriks Resiprokal &amp; Vektor Prioritas (</span>
                  <MathFormula math="w_i" inline />
                  <span>)</span>
                </CardTitle>
                <CardDescription className="flex items-center gap-1 flex-wrap text-xs">
                  <span>Matriks</span>
                  <MathFormula math="n \times n" inline />
                  <span>lengkap dengan nilai kebalikan otomatis dan bobot eigen-vektor ternormalisasi</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4"><AhpMatrixGrid criteria={criteria} matrix={matrix} priorityVector={priorityVector} /></CardContent>
            </Card>
          )}

          {activeStep === 3 && (
            <Card data-tour-id="ahp-consistency-panel">
              <CardHeader className="py-3 border-b border-slate-100">
                <CardTitle className="text-sm flex items-center gap-1.5 flex-wrap">
                  <span>Tahap 3: Uji Konsistensi Rasio (Saaty Consistency Check -</span>
                  <MathFormula math="\text{CR}" inline />
                  <span>)</span>
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 flex-wrap text-xs">
                  <span>Visualisasi gauge</span>
                  <MathFormula math="\text{CR}" inline />
                  <span>, parameter</span>
                  <MathFormula math="\lambda_{\max}" inline />
                  <span>,</span>
                  <MathFormula math="\text{CI}" inline />
                  <span>,</span>
                  <MathFormula math="\text{RI}" inline />
                  <span>, dan rekomendasi perbaikan</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4"><AhpConsistencyGauge consistency={consistency} suggestion={suggestion} onApplySuggestion={applySuggestion} /></CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AhpTab;
