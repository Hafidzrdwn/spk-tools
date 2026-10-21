import React from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useNumberFormatter } from '@/utils/numberFormat';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type {
  GoalCongruenceResult,
  SpearmansRhoResult,
  MarginOfVictoryResult,
  AnalysisMethod,
} from '@/core/analysis';

export interface AspectEvaluationPanelProps {
  goalCongruence: GoalCongruenceResult | null;
  spearmanResult: SpearmansRhoResult | null;
  marginOfVictory: MarginOfVictoryResult | null;
  spearmanMethodB: AnalysisMethod;
  onSelectSpearmanMethodB: (method: AnalysisMethod) => void;
}

export const AspectEvaluationPanel: React.FC<AspectEvaluationPanelProps> = ({
  goalCongruence,
  spearmanResult,
  marginOfVictory,
  spearmanMethodB,
  onSelectSpearmanMethodB,
}) => {
  const { formatNumber } = useNumberFormatter();

  if (!goalCongruence || !spearmanResult || !marginOfVictory) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="border-indigo-100 shadow-2xs">
        <CardHeader className="py-3 px-4 border-b border-indigo-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
              <div>
                <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-900 tracking-wider uppercase font-mono">
                  Aspek 1 Evaluasi
                </span>
                <span className="text-slate-300">•</span>
                <CardTitle className="text-sm font-bold text-slate-800">
                  Kesesuaian dengan Tujuan (Goal Congruence)
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Memastikan SPK menyelesaikan prioritas strategis organisasi dan tidak terjebak ilusi biaya termurah
              </CardDescription>
              </div>
          </div>

          <Badge
            variant={goalCongruence.status === 'VERY_CONGRUENT' ? 'benefit' : goalCongruence.status === 'COST_TRAP_RISK' ? 'cost' : 'neutral'}
            size="md"
            className="self-start sm:self-auto"
          >
            {goalCongruence.title}
          </Badge>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs text-slate-700 leading-relaxed flex items-start gap-3">
            <div className="mt-0.5 text-indigo-600 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 block mb-0.5">Analisis Kesesuaian Sasaran:</span>
              <p>{goalCongruence.explanation}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200/80 bg-white">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                Alternatif Terpilih (#1)
              </span>
              <span className="text-sm font-bold text-slate-900 block truncate">
                {goalCongruence.winnerAlternative.name}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium mt-1 inline-flex items-center gap-1">
                Peringkat #1 Konsisten
              </span>
            </div>

            {goalCongruence.cheapestAlternative && (
              <div className="p-3 rounded-xl border border-slate-200/80 bg-white">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Kandidat Biaya Termurah
                </span>
                <span className="text-sm font-bold text-slate-900 block truncate">
                  {goalCongruence.cheapestAlternative.name}
                </span>
                <span className="text-[11px] text-slate-600 mt-1 block">
                  Nilai: {formatNumber(goalCongruence.cheapestAlternative.costValue, 2)} • Peringkat #{goalCongruence.cheapestAlternative.rank}
                </span>
              </div>
            )}

            {goalCongruence.highestQualityAlternative && (
              <div className="p-3 rounded-xl border border-slate-200/80 bg-white">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Kandidat Kualitas Tertinggi
                </span>
                <span className="text-sm font-bold text-slate-900 block truncate">
                  {goalCongruence.highestQualityAlternative.name}
                </span>
                <span className="text-[11px] text-indigo-700 font-medium mt-1 block">
                  Peringkat #{goalCongruence.highestQualityAlternative.rank}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-indigo-100 shadow-2xs">
        <CardHeader className="py-3 px-4 border-b border-indigo-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-900 tracking-wider uppercase font-mono">
                  Aspek 2 Evaluasi
                </span>
                <span className="text-slate-300">•</span>
                <CardTitle className="text-sm font-bold text-slate-800">
                  Uji Konsistensi Spearman's Rho (&rho;)
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Menguji kekokohan (robustness) urutan peringkat antara metode SAW dengan metode pembanding
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-control">
            <span className="text-[11px] font-semibold text-slate-500 px-1.5">Bandingkan:</span>
            <button
              type="button"
              onClick={() => onSelectSpearmanMethodB('wp')}
              className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${
                spearmanMethodB === 'wp' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SAW vs WP
            </button>
            <button
              type="button"
              onClick={() => onSelectSpearmanMethodB('topsis')}
              className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${
                spearmanMethodB === 'topsis' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SAW vs TOPSIS
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Card Formula & Nilai Rho */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-linear-to-br from-indigo-50/80 to-white border border-indigo-100 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 font-mono">
                  Koefisien Korelasi (&rho;)
                </span>
                <div className="text-2xl font-black text-indigo-950 font-mono mt-1">
                  {formatNumber(spearmanResult.rho, 4)}
                </div>
              </div>
              <div className="mt-2">
                <Badge
                  variant={spearmanResult.rho >= 0.8 ? 'benefit' : spearmanResult.rho >= 0.4 ? 'primary' : 'cost'}
                  size="sm"
                  className="font-semibold text-[11px]"
                >
                  {spearmanResult.interpretation}
                </Badge>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 md:col-span-2 flex flex-col justify-center space-y-2 text-xs">
              <span className="font-semibold text-slate-800">Rumus Matematis Spearman's Rho:</span>
              <div className="font-mono text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                &rho; = 1 - [6 &times; &sum;d<sub>i</sub><sup>2</sup>] / [n(n<sup>2</sup> - 1)] = 1 - [6 &times; {spearmanResult.sumSquaredDifferences}] / [{spearmanResult.n}({spearmanResult.n}<sup>2</sup> - 1)] = <strong className="text-indigo-900">{formatNumber(spearmanResult.rho, 4)}</strong>
              </div>
              <p className="text-[11px] text-slate-500">
                *Spearman membandingkan urutan peringkat (bukan nilai preferensi desimal), menguji stabilitas urutan keputusan lintas algoritma.
              </p>
            </div>
          </div>

          {/* Tabel Selisih Peringkat dan d_i^2 */}
          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2 px-3">Alternatif</th>
                  <th className="py-2 px-3 text-center">Rank {spearmanResult.methodA.toUpperCase()}</th>
                  <th className="py-2 px-3 text-center">Rank {spearmanResult.methodB.toUpperCase()}</th>
                  <th className="py-2 px-3 text-right">Selisih (d<sub>i</sub>)</th>
                  <th className="py-2 px-3 text-right">Kuadrat Selisih (d<sub>i</sub><sup>2</sup>)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {spearmanResult.rows.map((row) => (
                  <tr key={row.alternativeId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-sans font-medium text-slate-800 truncate max-w-56">
                      {row.alternativeName}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-700">#{row.rankMethodA}</td>
                    <td className="py-2 px-3 text-center text-slate-700">#{row.rankMethodB}</td>
                    <td className="py-2 px-3 text-right text-slate-700">{row.difference}</td>
                    <td className="py-2 px-3 text-right font-bold text-indigo-900">{row.differenceSquared}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                  <td colSpan={4} className="py-2 px-3 font-sans text-right">
                    Total Kuadrat Selisih (&sum;d<sub>i</sub><sup>2</sup>):
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-indigo-900">
                    {spearmanResult.sumSquaredDifferences}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Aspek 3: Validitas Hasil & Margin of Victory */}
      <Card className="border-indigo-100 shadow-2xs">
        <CardHeader className="py-3 px-4 border-b border-indigo-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-900 tracking-wider uppercase font-mono">
                  Aspek 3 Evaluasi
                </span>
                <span className="text-slate-300">•</span>
                <CardTitle className="text-sm font-bold text-slate-800">
                  Validitas Hasil & Margin of Victory
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Pemeriksaan ketat terhadap margin selisih skor Juara 1 vs Juara 2 untuk memitigasi risiko data bias
              </CardDescription>
            </div>
          </div>

          <Badge
            variant={marginOfVictory.riskLevel === 'HIGH' ? 'cost' : marginOfVictory.riskLevel === 'MEDIUM' ? 'primary' : 'benefit'}
            size="md"
          >
            {marginOfVictory.riskLevel === 'HIGH' ? 'Margin Selisih Kritis' : marginOfVictory.riskLevel === 'MEDIUM' ? 'Margin Sedang' : 'Margin Kuat & Stabil'}
          </Badge>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="font-semibold text-slate-700 block">Perbandingan Skor Juara 1 vs Juara 2:</span>
              <div className="flex items-center justify-between font-mono bg-white p-2 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-400 block">Pemenang (#1)</span>
                  <span className="font-bold text-indigo-900 font-sans">{marginOfVictory.winner.alternativeName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Skor</span>
                  <span className="font-bold text-indigo-900">{formatNumber(marginOfVictory.winner.score, 4)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between font-mono bg-white p-2 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-400 block">Runner-Up (#2)</span>
                  <span className="font-bold text-slate-700 font-sans">{marginOfVictory.runnerUp.alternativeName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Skor</span>
                  <span className="font-bold text-slate-700">{formatNumber(marginOfVictory.runnerUp.score, 4)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="font-medium text-slate-600">Selisih Mutlak (&Delta;V):</span>
                <span className="font-mono font-bold text-slate-900">{marginOfVictory.absoluteGap} ({marginOfVictory.relativeGapPercent}%)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Rekomendasi Validasi Realitas (Reality Fit):</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">{marginOfVictory.evaluationNote}</p>

              <div className="pt-2 space-y-1.5 border-t border-indigo-100 text-[11px]">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                  <span><strong>Expert Validation:</strong> Telaah pertimbangan subjektif pakar pada kriteria non-numerik.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                  <span><strong>Historical Validation:</strong> Audit rekam jejak aktual 1-3 tahun terakhir untuk menghindari klaim proposal palsu.</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AspectEvaluationPanel;
