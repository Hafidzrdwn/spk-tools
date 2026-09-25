import React, { useState } from 'react';
import GaugeMeter from '@/components/ui/GaugeMeter';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { ConsistencyResult, ConsistencyFixSuggestion } from '@/core/math/ahp-consistency';
import { AlertCircle, Wand2, ArrowRight } from 'lucide-react';

export interface AhpConsistencyGaugeProps {
  consistency: ConsistencyResult;
  suggestion: ConsistencyFixSuggestion | null;
  onApplySuggestion: () => void;
}

export const AhpConsistencyGauge: React.FC<AhpConsistencyGaugeProps> = ({
  consistency,
  suggestion,
  onApplySuggestion,
}) => {
  const [showSuggestion, setShowSuggestion] = useState(false);
  const isConsistent = consistency.isConsistent;

  return (
    <div className="space-y-4">
      {/* Gauge and Metric Summary Card */}
      <div
        data-tour-id="ahp-consistency-gauge"
        className={`p-6 rounded-card border-2 transition-all ${
          isConsistent
            ? 'bg-emerald-50/40 border-emerald-300'
            : 'bg-rose-50/70 border-rose-400 animate-pulse'
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Gauge Meter */}
          <div className="flex flex-col items-center">
            <GaugeMeter
              value={consistency.cr}
              threshold={0.1}
              label="Consistency Ratio (CR)"
              size={160}
              strokeWidth={14}
            />
            <div className="mt-1">
              <Badge variant={isConsistent ? 'benefit' : 'cost'} size="sm">
                {isConsistent ? 'CR ≤ 0.10 (Konsisten)' : 'CR > 0.10 (Inkonsisten!)'}
              </Badge>
            </div>
          </div>

          {/* Rincian Parameter Konsistensi Saaty */}
          <div className="flex-1 space-y-3 w-full">
            <div className="border-b border-slate-200/80 pb-2">
              <h4 className="text-sm font-bold text-slate-800">
                Uji Konsistensi Logika (Saaty Ratio)
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isConsistent
                  ? 'Matriks perbandingan berpasangan memenuhi syarat konsistensi transitif (CR ≤ 10%). Bobot prioritas valid untuk digunakan.'
                  : 'Ditemukan kontradiksi logika pada perbandingan antar kriteria (CR > 10%). Matriks perlu dikoreksi agar hasil SPK tidak bias.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-white/80 border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block">λ max</span>
                <span className="font-bold text-slate-800">{consistency.lambdaMax.toFixed(4)}</span>
              </div>
              <div className="p-2 rounded-lg bg-white/80 border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block">CI (Indeks)</span>
                <span className="font-bold text-slate-800">{consistency.ci.toFixed(4)}</span>
              </div>
              <div className="p-2 rounded-lg bg-white/80 border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block">RI (Random)</span>
                <span className="font-bold text-slate-800">{consistency.ri.toFixed(2)}</span>
              </div>
              <div className="p-2 rounded-lg bg-white/80 border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block">Status CR</span>
                <span className={`font-bold ${isConsistent ? 'text-benefit' : 'text-cost'}`}>
                  {(consistency.cr * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Tombol Saran Koreksi */}
            {!isConsistent && (
              <div className="pt-1">
                <Button
                  variant="danger"
                  size="sm"
                  data-tour-id="ahp-correction-btn"
                  onClick={() => setShowSuggestion((prev) => !prev)}
                  className="w-full sm:w-auto"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>{showSuggestion ? 'Sembunyikan Saran Koreksi' : 'Saran Koreksi Perbandingan'}</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panel Saran Koreksi Rekomendasi Algoritma */}
      {!isConsistent && showSuggestion && suggestion && (
        <div className="p-4.5 rounded-xl border border-rose-300 bg-white shadow-md space-y-3 animate-in fade-in-50 duration-200">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                Usulan Koreksi Nilai Perbandingan:
              </h5>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {suggestion.message}
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="font-mono space-y-0.5">
              <div>
                Pasangan: <strong>{suggestion.criterionNameI}</strong> vs <strong>{suggestion.criterionNameJ}</strong>
              </div>
              <div className="text-[11px] text-slate-500">
                Nilai Sekarang: <span className="line-through text-rose-600 font-bold">{suggestion.currentValue}</span>
                {' ➔ '}
                Nilai Rekomendasi: <span className="text-benefit font-bold">{suggestion.suggestedValue}</span>
              </div>
            </div>

            <Button
              variant="benefit"
              size="sm"
              onClick={() => {
                onApplySuggestion();
                setShowSuggestion(false);
              }}
            >
              <span>Terapkan Koreksi Ini</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AhpConsistencyGauge;
