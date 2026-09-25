import React from 'react';
import useWpViewModel from './useWpViewModel';
import { useUiStore } from '@/store/useUiStore';
import MatrixInputGrid from '@/features/shared/MatrixInputGrid';
import WpZeroGuardAlert from './components/WpZeroGuardAlert';
import WpExponentPanel from './components/WpExponentPanel';
import WpVectorTable from './components/WpVectorTable';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { ArrowRight, Trophy, Calculator, Table, Layers } from 'lucide-react';

export const WpTab: React.FC = () => {
  const {
    criteria,
    alternatives,
    hasData,
    hasZeroGuardViolation,
    violations,
    exponents,
    vectorS,
    totalS,
    finalRanking,
    bestAlternative,
    updateCellValue,
  } = useWpViewModel();

  const activeStep = useUiStore((s) => s.wpActiveStep);
  const setActiveStep = useUiStore((s) => s.setWpActiveStep);

  const steps = [
    { step: 1, label: '1. Matriks Awal (X)', icon: <Table className="w-3.5 h-3.5" /> },
    { step: 2, label: '2. Pangkat Bobot (w*)', icon: <Layers className="w-3.5 h-3.5" /> },
    { step: 3, label: '3. Vektor S & V', icon: <Calculator className="w-3.5 h-3.5" /> },
  ] as const;

  return (
    <div className="space-y-6">
      {hasZeroGuardViolation && <WpZeroGuardAlert violations={violations} />}

      {!hasZeroGuardViolation && bestAlternative && (
        <Card data-tour-id="wp-best-card" className="bg-linear-to-r from-amber-500/10 via-indigo-500/5 to-transparent border-amber-200/80">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-control bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Rekomendasi Terpilih (WP)</span>
                  <Badge variant="benefit" size="sm">Peringkat 1</Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">{bestAlternative.alternativeName}</h3>
              </div>
            </div>
            <div className="text-right font-mono bg-white/90 px-3 py-1.5 rounded-control border border-amber-200/70 shadow-2xs">
              <span className="text-[10px] text-slate-400 block">Nilai Preferensi (V)</span>
              <span className="text-base font-extrabold text-amber-700">{bestAlternative.score.toFixed(4)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stepper Navigation */}
      <div data-tour-id="wp-stepper" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2 bg-slate-100/80 rounded-card border border-slate-200/70">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {steps.map((s) => (
            <button
              key={s.step}
              type="button"
              data-tour-id={`wp-step-btn-${s.step}`}
              disabled={hasZeroGuardViolation && s.step > 1}
              onClick={() => setActiveStep(s.step)}
              className={`flex-1 sm:flex-none flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-control transition-all ${
                activeStep === s.step
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
                  : hasZeroGuardViolation && s.step > 1
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40 cursor-pointer'
              }`}
            >
              {s.icon}
              <span>{s.label}</span>
            </button>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-500 px-2 font-mono">
          <span>w_j*</span><ArrowRight className="w-3 h-3 text-slate-400" />
          <span>S_i = Π(x^w*)</span><ArrowRight className="w-3 h-3 text-slate-400" />
          <span>V_i = S_i / Σ(S)</span>
        </div>
      </div>

      {/* Stepper Content Panels */}
      {!hasData ? (
        <Card className="border-dashed border-2 border-slate-200/90 bg-white/70">
          <CardContent className="p-8 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-50 text-accent-primary flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Menunggu Data Matriks Keputusan</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Metode Weighted Product (WP) memerlukan minimal 1 kriteria dan 1 alternatif dengan nilai &gt; 0 pada kriteria Cost.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          {activeStep === 1 && (
            <Card data-tour-id="wp-matrix-panel">
              <CardHeader className="py-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Tahap 1: Matriks Keputusan Awal (X)</CardTitle>
                  <CardDescription>Pastikan tidak ada nilai 0 pada kriteria Cost</CardDescription>
                </div>
                {hasZeroGuardViolation && <Badge variant="cost" size="sm">Perbaiki Nilai 0</Badge>}
              </CardHeader>
              <CardContent className="pt-4">
                <MatrixInputGrid criteria={criteria} alternatives={alternatives} onChangeCell={updateCellValue} />
              </CardContent>
            </Card>
          )}

          {activeStep === 2 && !hasZeroGuardViolation && (
            <Card data-tour-id="wp-exponent-panel">
              <CardHeader className="py-3 border-b border-slate-100">
                <CardTitle className="text-sm">Tahap 2: Transformasi Pangkat Bobot (w*)</CardTitle>
                <CardDescription>Normalisasi bobot (+w untuk Benefit, -w untuk Cost)</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <WpExponentPanel exponents={exponents} />
              </CardContent>
            </Card>
          )}

          {activeStep === 3 && !hasZeroGuardViolation && (
            <Card data-tour-id="wp-vector-panel">
              <CardHeader className="py-3 border-b border-slate-100">
                <CardTitle className="text-sm">Tahap 3: Vektor S & Vektor V (Hasil Akhir)</CardTitle>
                <CardDescription>Perhitungan nilai perkalian S_i dan preferensi relatif V_i</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <WpVectorTable vectorS={vectorS} totalS={totalS} finalRanking={finalRanking} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default WpTab;
