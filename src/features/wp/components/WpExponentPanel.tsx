import React from 'react';
import type { WpExponentDetail } from '../useWpViewModel';
import Badge from '@/components/ui/Badge';
import { ArrowRight, CheckCircle2, Info } from 'lucide-react';

export interface WpExponentPanelProps {
  exponents: WpExponentDetail[];
}

export const WpExponentPanel: React.FC<WpExponentPanelProps> = ({ exponents }) => {
  if (exponents.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-control border border-slate-200">
        Data kriteria belum tersedia untuk transformasi pangkat bobot.
      </div>
    );
  }

  const totalAbsWeight = exponents.reduce((sum, e) => sum + Math.abs(e.normalizedWeight), 0);

  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100/80 flex items-start gap-2.5 text-xs text-indigo-900">
        <Info className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Aturan Pangkat Pembobotan Weighted Product (WP):</p>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Bobot ternormalisasi <span className="font-mono font-bold">w_j</span> (di mana <span className="font-mono">Σ w_j = 1.0</span>) diubah menjadi pangkat eksponen: bernilai <strong>positif (+w_j)</strong> untuk kriteria <strong>Benefit</strong>, dan bernilai <strong>negatif (-w_j)</strong> untuk kriteria <strong>Cost</strong>.
          </p>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-card border border-slate-200/80 bg-white/90 shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-3 px-4 w-12 text-center">No</th>
              <th className="py-3 px-4">Kriteria</th>
              <th className="py-3 px-4 w-28">Tipe</th>
              <th className="py-3 px-4 w-28 text-right font-mono">Bobot Mentah (w)</th>
              <th className="py-3 px-4 w-32 text-right font-mono">Normalisasi (|w_j|)</th>
              <th className="py-3 px-4 w-36 text-center font-mono">Pangkat WP (w_j*)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {exponents.map((exp, idx) => {
              const isBenefit = exp.type === 'BENEFIT';
              return (
                <tr key={exp.criterionId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 text-center font-mono text-slate-400 text-[11px]">
                    C{idx + 1}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">
                    {exp.criterionName}
                  </td>
                  <td className="py-2.5 px-4">
                    <Badge variant={isBenefit ? 'benefit' : 'cost'} size="sm">
                      {exp.type}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                    {exp.weight}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                    {exp.normalizedWeight.toFixed(4)}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md font-mono text-xs font-bold border ${
                        isBenefit
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {isBenefit ? `+${exp.normalizedWeight.toFixed(4)}` : `-${exp.normalizedWeight.toFixed(4)}`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50/80 border-t border-slate-200 font-semibold text-slate-700">
              <td colSpan={4} className="py-2.5 px-4 text-right text-xs">
                Total Jumlah Absolut Bobot (Σ |w_j|):
              </td>
              <td className="py-2.5 px-4 text-right font-mono text-xs text-accent-primary font-bold">
                {totalAbsWeight.toFixed(4)}
              </td>
              <td className="py-2.5 px-4 text-center">
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Valid (1.0)</span>
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default WpExponentPanel;
