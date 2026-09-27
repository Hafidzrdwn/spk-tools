import React from 'react';
import type { TopsisDistanceDetail } from '../useTopsisViewModel';
import { MathFormula } from '@/components/ui/MathFormula';
import { useNumberFormatter } from '@/utils/numberFormat';

export interface TopsisDistanceCardProps {
  distances: TopsisDistanceDetail[];
}

export const TopsisDistanceCard: React.FC<TopsisDistanceCardProps> = ({ distances }) => {
  const { formatNumber } = useNumberFormatter();
  if (distances.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-control border border-slate-200">
        <p className="font-medium text-slate-600 mb-1">Data jarak Euclidean belum tersedia.</p>
        <p>Isi nilai matriks keputusan terlebih dahulu untuk menghitung jarak ke solusi ideal A+ dan A−.</p>
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
              <th className="py-3 px-4 text-right">
                <MathFormula math="\sum (y_{ij} - A_j^+)^2" inline className="text-xs" />
              </th>
              <th className="py-3 px-4 text-right text-benefit bg-benefit/5">
                <span className="inline-flex items-center justify-end gap-1">
                  <span className="font-sans text-[11px] font-medium">Jarak</span>
                  <MathFormula math="D_i^+ = \sqrt{\sum}" inline className="text-xs text-benefit" />
                </span>
              </th>
              <th className="py-3 px-4 text-right">
                <MathFormula math="\sum (y_{ij} - A_j^-)^2" inline className="text-xs" />
              </th>
              <th className="py-3 px-4 text-right text-cost bg-cost/5">
                <span className="inline-flex items-center justify-end gap-1">
                  <span className="font-sans text-[11px] font-medium">Jarak</span>
                  <MathFormula math="D_i^- = \sqrt{\sum}" inline className="text-xs text-cost" />
                </span>
              </th>
              <th className="py-3 px-4 text-right font-bold text-slate-900">
                <span className="inline-flex items-center justify-end gap-1.5">
                  <span className="font-sans text-[11px] font-medium text-slate-600">Skor</span>
                  <MathFormula math="C_i = \frac{D_i^-}{D_i^+ + D_i^-}" inline className="text-xs" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {distances.map((row, idx) => (
              <tr key={row.alternativeId} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 px-4 font-semibold text-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px] w-5">A{idx + 1}</span>
                    <span className="truncate" title={row.alternativeName}>{row.alternativeName}</span>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                  {formatNumber(row.diffPlusSum, 4)}
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-benefit bg-benefit/5">
                  <span className="inline-flex items-center justify-end gap-1">
                    <MathFormula math={`\\sqrt{${formatNumber(row.diffPlusSum, 4)}}`} inline className="text-xs text-benefit" />
                    <span>= {formatNumber(row.dPlus, 4)}</span>
                  </span>
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                  {formatNumber(row.diffMinusSum, 4)}
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-cost bg-cost/5">
                  <span className="inline-flex items-center justify-end gap-1">
                    <MathFormula math={`\\sqrt{${formatNumber(row.diffMinusSum, 4)}}`} inline className="text-xs text-cost" />
                    <span>= {formatNumber(row.dMinus, 4)}</span>
                  </span>
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-extrabold text-xs text-accent-primary">
                  {formatNumber(row.cScore, 4)}
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
