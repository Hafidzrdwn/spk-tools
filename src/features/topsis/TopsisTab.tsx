import React from 'react';
import useTopsisViewModel from './useTopsisViewModel';
import { useUiStore } from '@/store/useUiStore';
import MatrixInputGrid from '@/features/shared/MatrixInputGrid';
import TopsisIdealSolutionRow from './components/TopsisIdealSolutionRow';
import TopsisDistanceCard from './components/TopsisDistanceCard';
import TopsisRadarChart from './components/TopsisRadarChart';
import TopsisRankingTable from './components/TopsisRankingTable';
import { FormulaFloatingCard } from '@/features/inspector';
import ExportButton from '@/features/export/ExportButton';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { ArrowRight, Trophy, Compass, Table, BarChart2 } from 'lucide-react';

export const TopsisTab: React.FC = () => {
  const {
    criteria, alternatives, hasData, weightedMatrix,
    idealPositive, idealNegative, distances, finalRanking,
    bestAlternative, radarData, radarAlternativeKeys, updateCellValue,
    formulaSteps, rawResult,
  } = useTopsisViewModel();

  const activeStep = useUiStore((s) => s.topsisActiveStep);
  const setActiveStep = useUiStore((s) => s.setTopsisActiveStep);

  const steps = [
    { step: 1, label: '1. Matriks Awal (X)', icon: <Table className="w-3.5 h-3.5" /> },
    { step: 2, label: '2. Solusi Ideal & Jarak', icon: <Compass className="w-3.5 h-3.5" /> },
    { step: 3, label: '3. Radar & Ranking (C_i)', icon: <BarChart2 className="w-3.5 h-3.5" /> },
  ] as const;

  return (
    <div className="space-y-6">
      {bestAlternative && (
        <Card className="bg-linear-to-r from-amber-500/10 via-indigo-500/5 to-transparent border-amber-200/80">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-control bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Rekomendasi Terpilih (TOPSIS)</span>
                  <Badge variant="benefit" size="sm">Peringkat 1</Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">{bestAlternative.alternativeName}</h3>
              </div>
            </div>
            <div className="text-right font-mono bg-white/90 px-3 py-1.5 rounded-control border border-amber-200/70 shadow-2xs">
              <span className="text-[10px] text-slate-400 block">Kedekatan Relatif (C_i)</span>
              <span className="text-base font-extrabold text-amber-700">{bestAlternative.score.toFixed(4)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stepper Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2 bg-slate-100/80 rounded-card border border-slate-200/70">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {steps.map((s) => (
            <button
              key={s.step}
              type="button"
              data-tour-id={`topsis-step-btn-${s.step}`}
              onClick={() => setActiveStep(s.step)}
              className={`flex-1 sm:flex-none flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-control transition-all ${
                activeStep === s.step ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40 cursor-pointer'
              }`}
            >
              {s.icon}
              <span>{s.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-500 px-2 font-mono">
            <span>Y = w·r</span><ArrowRight className="w-3 h-3 text-slate-400" />
            <span>A+, A-</span><ArrowRight className="w-3 h-3 text-slate-400" />
            <span>D+, D-</span><ArrowRight className="w-3 h-3 text-slate-400" />
            <span>C_i</span>
          </div>
          <ExportButton method="TOPSIS" result={rawResult} />
        </div>
      </div>

      {/* Stepper Content Panels */}
      {!hasData ? (
        <Card className="border-dashed border-2 border-slate-200/90 bg-white/70">
          <CardContent className="p-8 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-50 text-accent-primary flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Menunggu Data Matriks Keputusan</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Metode TOPSIS memerlukan minimal 1 kriteria dan 1 alternatif untuk menghitung solusi ideal dan jarak Euclidean.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {activeStep === 1 && (
            <Card data-tour-id="topsis-matrix-panel">
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
            <div className="space-y-6" data-tour-id="topsis-ideal-panel">
              <Card>
                <CardHeader className="py-3 border-b border-slate-100">
                  <CardTitle className="text-sm">Tahap 2A: Solusi Ideal Positif (A+) & Negatif (A-)</CardTitle>
                  <CardDescription>Titik referensi terbaik dan terburuk pada ruang matriks terbobot</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <TopsisIdealSolutionRow criteria={criteria} alternatives={alternatives} weightedMatrix={weightedMatrix} idealPositive={idealPositive} idealNegative={idealNegative} />
                </CardContent>
              </Card>

              <Card data-tour-id="topsis-distance-panel">
                <CardHeader className="py-3 border-b border-slate-100">
                  <CardTitle className="text-sm">Tahap 2B: Jarak Separasi Euclidean (D+ & D-)</CardTitle>
                  <CardDescription>Rincian kuadrat selisih jarak ke solusi ideal A+ dan anti-ideal A-</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <TopsisDistanceCard distances={distances} />
                </CardContent>
              </Card>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-6">
              <div data-tour-id="topsis-radar-chart">
                <TopsisRadarChart radarData={radarData} alternativeKeys={radarAlternativeKeys} />
              </div>
              <div data-tour-id="topsis-ranking-panel">
                <TopsisRankingTable ranking={finalRanking} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Inspector Portal for Live Formula Tracing */}
      <FormulaFloatingCard formulaSteps={formulaSteps} />
    </div>
  );
};

export default TopsisTab;
