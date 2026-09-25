import React from 'react';
import type { PairwiseComparisonPair } from '../useAhpViewModel';
import { SAATY_SCALE } from '@/core/constants/saatyScale';

export interface AhpPairwiseSliderProps {
  pairs: PairwiseComparisonPair[];
  onSetPairwiseValue: (i: number, j: number, value: number) => void;
}

export const AhpPairwiseSlider: React.FC<AhpPairwiseSliderProps> = ({
  pairs,
  onSetPairwiseValue,
}) => {
  if (pairs.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-control border border-slate-200">
        Tambahkan minimal 2 kriteria untuk membuat perbandingan berpasangan.
      </div>
    );
  }

  const handleBipolarChange = (pair: PairwiseComparisonPair, v: number) => {
    if (v === 0) {
      onSetPairwiseValue(pair.i, pair.j, 1);
    } else if (v < 0) {
      const scale = Math.abs(v) + 1;
      onSetPairwiseValue(pair.i, pair.j, scale);
    } else {
      const scale = v + 1;
      onSetPairwiseValue(pair.i, pair.j, Number((1 / scale).toFixed(6)));
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs text-slate-700 flex items-center justify-between">
        <span>Geser slider langsung ke kiri untuk memprioritaskan Kriteria A, atau ke kanan untuk Kriteria B.</span>
        <span className="font-mono text-[11px] text-accent-primary font-bold">{pairs.length} Pasangan</span>
      </div>

      <div className="space-y-3">
        {pairs.map((pair) => {
          let sliderVal = 0;
          if (pair.value > 1.001) {
            sliderVal = -(Math.min(9, Math.round(pair.value)) - 1);
          } else if (pair.value < 0.999) {
            sliderVal = Math.min(9, Math.round(1 / pair.value)) - 1;
          }

          const currentScale = sliderVal === 0 ? 1 : Math.abs(sliderVal) + 1;
          const saaty = SAATY_SCALE.find((s) => s.value === currentScale) || SAATY_SCALE[0];
          const isA = sliderVal < 0;
          const isB = sliderVal > 0;
          const isEqual = sliderVal === 0;

          return (
            <div
              key={`${pair.i}-${pair.j}`}
              data-tour-id="ahp-pairwise-slider"
              className="p-4 rounded-xl border border-slate-200/80 bg-white/90 shadow-2xs space-y-3 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleBipolarChange(pair, -2)}
                    className={`font-bold px-2 py-0.5 rounded cursor-pointer transition-all ${
                      isA ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Klik untuk memprioritaskan Kriteria A"
                  >
                    {pair.criterionA.name}
                  </button>
                  <span className="text-slate-400 font-mono text-[11px]">vs</span>
                  <button
                    type="button"
                    onClick={() => handleBipolarChange(pair, 2)}
                    className={`font-bold px-2 py-0.5 rounded cursor-pointer transition-all ${
                      isB ? 'bg-violet-600 text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Klik untuk memprioritaskan Kriteria B"
                  >
                    {pair.criterionB.name}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-600">
                    {isEqual ? (
                      <span className="text-slate-500 font-semibold">Sama Penting (1:1)</span>
                    ) : isA ? (
                      <span className="text-indigo-700 font-semibold">{pair.criterionA.name} ({currentScale}:1) — {saaty.label}</span>
                    ) : (
                      <span className="text-violet-700 font-semibold">{pair.criterionB.name} (1:{currentScale}) — {saaty.label}</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleBipolarChange(pair, 0)}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors"
                    title="Reset ke Setara (1:1)"
                  >
                    1:1
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <input
                  type="range"
                  min={-8}
                  max={8}
                  step={1}
                  value={sliderVal}
                  onChange={(e) => handleBipolarChange(pair, Number(e.target.value))}
                  className="w-full h-2.5 bg-linear-to-r from-indigo-200 via-slate-200 to-violet-200 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />

                <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5">
                  <span className={isA ? 'text-indigo-600 font-bold' : ''}>← {pair.criterionA.name} (9:1)</span>
                  <span className={isEqual ? 'text-slate-900 font-bold' : ''}>Setara (1:1)</span>
                  <span className={isB ? 'text-violet-600 font-bold' : ''}>{pair.criterionB.name} (1:9) →</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AhpPairwiseSlider;
