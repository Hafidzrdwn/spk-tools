import React from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useNumberFormatter } from '@/utils/numberFormat';
import { Sliders, Shuffle, TrendingUp, AlertCircle, RotateCcw } from 'lucide-react';
import type { Criterion } from '@/types/domain';
import type {
  SensitivitySimulationResult,
  CrossoverPoint,
  BusinessScenarioId,
  BusinessScenarioResult,
} from '@/core/analysis';

export interface SensitivityScenarioPanelProps {
  criteria: Criterion[];
  customWeights: Record<string, number>;
  onUpdateWeight: (criterionId: string, val: number) => void;
  onResetWeights: () => void;
  simulation: SensitivitySimulationResult | null;
  crossovers: CrossoverPoint[];
  scenarios: Record<BusinessScenarioId, BusinessScenarioResult> | null;
}

export const SensitivityScenarioPanel: React.FC<SensitivityScenarioPanelProps> = ({
  criteria,
  customWeights,
  onUpdateWeight,
  onResetWeights,
  simulation,
  crossovers,
  scenarios,
}) => {
  const { formatNumber } = useNumberFormatter();

  if (!simulation || !scenarios) {
    return null;
  }

  return (
    <div className="space-y-6">
      {crossovers.length > 0 ? (
        <Card className="border-amber-200/90 bg-amber-50/40 shadow-2xs">
          <CardHeader className="py-3 px-4 border-b border-amber-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <CardTitle className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Ambang Batas Titik Balik Pemenang (Crossover Thresholds)
              </CardTitle>
            </div>
            <Badge variant="cost" size="sm">
              {crossovers.length} Titik Rentan Terdeteksi
            </Badge>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {crossovers.map((cp) => (
                <div
                  key={cp.criterionId}
                  className="p-3 rounded-xl bg-white border border-amber-200/80 shadow-2xs text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{cp.criterionName}</span>
                    <span className="font-mono text-[11px] font-bold text-amber-800">
                      {cp.direction === 'INCREASE' ? 'Naik ke' : 'Turun ke'} {formatNumber(cp.thresholdWeight * 100, 1)}%
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Jika bobot {cp.criterionName} diubah dari {formatNumber(cp.currentWeight * 100, 1)}% menjadi{' '}
                    <strong>{formatNumber(cp.thresholdWeight * 100, 1)}%</strong> ({cp.switchPercentageChange > 0 ? '+' : ''}
                    {cp.switchPercentageChange}%), posisi Juara 1 akan berbalik direbut oleh{' '}
                    <strong className="text-indigo-900">{cp.challengerName}</strong>.
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-emerald-200/80 bg-emerald-50/30 shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block">Stabilitas Pemenang Sangat Kokoh:</span>
              <p className="text-slate-600">
                Peringkat #1 ({simulation.currentWinner.alternativeName}) mempertahankan keunggulannya pada rentang variasi bobot normal tanpa titik balik crossover ekstrem.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-indigo-100 shadow-2xs">
        <CardHeader className="py-3 px-4 border-b border-indigo-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-800">
                Simulasi Sensitivitas Bobot Dinamis (Interactive Weight Testing)
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Geser bobot kriteria untuk menguji sensitivitas urutan ranking dengan penyesuaian proporsional otomatis (Total = 100%)
              </CardDescription>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={onResetWeights}
            className="self-start sm:self-auto text-xs cursor-pointer gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Bobot</span>
          </Button>
        </CardHeader>

        <CardContent className="p-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-semibold text-slate-700 block">
                Atur Bobot Kriteria (%):
              </span>

              <div className="space-y-3">
                {criteria.map((c) => {
                  const currentPercent = Math.round((customWeights[c.id] ?? c.normalizedWeight ?? 0.2) * 100);
                  return (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{c.name}</span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                              c.type === 'COST' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {c.type}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-indigo-900">{currentPercent}%</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1"
                          max="95"
                          step="1"
                          value={currentPercent}
                          onChange={(e) => onUpdateWeight(c.id, Number(e.target.value) / 100)}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kolom Hasil Peringkat Simulasi Live */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Hasil Peringkat Terkini:</span>
                {simulation.hasWinnerShifted ? (
                  <Badge variant="cost" size="sm">
                    Pemenang Bergeser!
                  </Badge>
                ) : (
                  <Badge variant="benefit" size="sm">
                    Pemenang Stabil
                  </Badge>
                )}
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs divide-y divide-slate-100">
                {simulation.simulatedRankings.map((r) => {
                  const isWinner = r.rank === 1;
                  return (
                    <div
                      key={r.alternativeId}
                      className={`p-3 flex items-center justify-between text-xs transition-colors ${
                        isWinner ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] font-mono shrink-0 ${
                            isWinner ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          #{r.rank}
                        </span>
                        <span className="font-medium text-slate-800 truncate" title={r.alternativeName}>
                          {r.alternativeName}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-700 shrink-0">
                        {formatNumber(r.score, 4)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matriks 3 Skenario Pasar Bisnis */}
      <Card className="border-indigo-100 shadow-2xs">
        <CardHeader className="py-3 px-4 border-b border-indigo-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <Shuffle className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-800">
                Analisis Skenario Kondisi Bisnis (Scenario Matrix)
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Membandingkan rekomendasi keputusan pada kondisi pasar normal, lonjakan pasokan, dan efisiensi biaya
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(Object.keys(scenarios) as BusinessScenarioId[]).map((scenarioKey) => {
              const sc = scenarios[scenarioKey];
              return (
                <div
                  key={scenarioKey}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-200 transition-colors flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-900 uppercase font-mono">
                        {sc.scenario.tagline}
                      </span>
                      <Badge variant="secondary" size="sm">
                        {sc.scenario.name.split(' ')[0]}
                      </Badge>
                    </div>
                    <h5 className="font-bold text-slate-900 text-xs">{sc.scenario.name}</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{sc.scenario.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                    <span className="text-[11px] font-semibold text-slate-500 block">Rekomendasi Terpilih:</span>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-indigo-950 truncate max-w-36" title={sc.winner.alternativeName}>
                        {sc.winner.alternativeName}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-indigo-700">
                        {formatNumber(sc.winner.score, 4)}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">
                      Runner-up: {sc.runnerUp.alternativeName} ({formatNumber(sc.runnerUp.score, 4)})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SensitivityScenarioPanel;
