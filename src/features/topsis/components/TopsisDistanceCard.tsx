import React from 'react';
import type { TopsisDistanceDetail } from '../useTopsisViewModel';
import { Compass, CheckCircle2 } from 'lucide-react';

export interface TopsisDistanceCardProps {
  distances: TopsisDistanceDetail[];
}

export const TopsisDistanceCard: React.FC<TopsisDistanceCardProps> = ({ distances }) => {
  if (distances.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-control border border-slate-200">
        Data jarak Euclidean belum tersedia.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="w-full overflow-x-auto rounded-card border border-slate-200/80 bg-white/90 shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-3 px-4 w-44">Alternatif</th>
              <th className="py-3 px-4 text-right font-mono">Σ (y_ij - A+j)²</th>
              <th className="py-3 px-4 text-right font-mono text-benefit bg-benefit/5">Jarak D+ = √(Σ)</th>
              <th className="py-3 px-4 text-right font-mono">Σ (y_ij - A-j)²</th>
              <th className="py-3 px-4 text-right font-mono text-cost bg-cost/5">Jarak D- = √(Σ)</th>
              <th className="py-3 px-4 text-right font-mono font-bold text-slate-900">Skor C_i = D- / (D+ + D-)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {distances.map((row, idx) => (
              <tr key={row.alternativeId} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 px-4 font-semibold text-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px] w-5">A{idx + 1}</span>
                    <span className="truncate">{row.alternativeName}</span>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                  {row.diffPlusSum.toFixed(4)}
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-benefit bg-benefit/5">
                  √({row.diffPlusSum.toFixed(4)}) = {row.dPlus.toFixed(4)}
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                  {row.diffMinusSum.toFixed(4)}
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-cost bg-cost/5">
                  √({row.diffMinusSum.toFixed(4)}) = {row.dMinus.toFixed(4)}
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-extrabold text-xs text-accent-primary">
                  {row.cScore.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50 rounded-control border border-slate-200/70 text-[11px] text-slate-500 font-mono flex items-center justify-between">
        <span>Prinsip TOPSIS: Alternatif optimal meminimalkan jarak ke A+ (D+ kecil) dan memaksimalkan jarak ke A- (D- besar).</span>
        <span className="text-accent-primary font-bold">C_i mendekati 1.0 = Terbaik</span>
      </div>
    </div>
  );
};

export default TopsisDistanceCard;
