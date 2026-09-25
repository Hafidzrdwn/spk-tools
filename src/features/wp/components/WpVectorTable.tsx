import React from 'react';
import type { VectorSRow } from '../useWpViewModel';
import type { RankingRow } from '@/core/math/types';
import Badge from '@/components/ui/Badge';
import { Trophy, Award } from 'lucide-react';

export interface WpVectorTableProps {
  vectorS: VectorSRow[];
  totalS: number;
  finalRanking: RankingRow[];
}

export const WpVectorTable: React.FC<WpVectorTableProps> = ({
  vectorS,
  totalS,
  finalRanking,
}) => {
  if (vectorS.length === 0 || finalRanking.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-control border border-slate-200">
        Hasil kalkulasi Vektor S dan Vektor V belum tersedia.
      </div>
    );
  }

  // Map ranking by alternativeId for fast lookup
  const rankMap = new Map<string, RankingRow>();
  finalRanking.forEach((r) => rankMap.set(r.alternativeId, r));

  const maxV = Math.max(...finalRanking.map((r) => r.score), 0.0001);

  return (
    <div className="space-y-6">
      {/* Tabel Vektor S & V Terintegrasi */}
      <div data-tour-id="wp-vector-table" className="w-full overflow-hidden rounded-card border border-slate-200/80 bg-white/90 shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-3 px-4 w-24">Peringkat</th>
              <th className="py-3 px-4">Alternatif</th>
              <th className="py-3 px-4 w-36 text-right font-mono">Nilai Vektor S (S_i)</th>
              <th className="py-3 px-4 w-36 text-right font-mono">Vektor V (Preferensi)</th>
              <th className="py-3 px-4 w-44 hidden md:table-cell">Visualisasi Relatif</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {finalRanking.map((rankItem) => {
              const sRow = vectorS.find((s) => s.alternativeId === rankItem.alternativeId);
              const isTop = rankItem.rank === 1;
              const barWidth = maxV > 0 ? (rankItem.score / maxV) * 100 : 0;

              return (
                <tr
                  key={rankItem.alternativeId}
                  className={isTop ? 'bg-amber-50/30 hover:bg-amber-50/50' : 'hover:bg-slate-50/80'}
                >
                  <td className="py-3 px-4 font-semibold">
                    <div className="flex items-center gap-1.5">
                      {isTop ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs border border-amber-300 shadow-2xs">
                          <Trophy className="w-3 h-3 text-amber-600" />
                          <span>#1 Juara</span>
                        </span>
                      ) : (
                        <span className="inline-block w-6 text-center font-mono font-bold text-slate-500">
                          #{rankItem.rank}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      {rankItem.alternativeName}
                      {isTop && (
                        <span className="text-[10px] text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded font-medium">
                          Pilihan Terbaik
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-xs font-semibold text-indigo-700">
                    {sRow ? sRow.sValue.toFixed(4) : '-'}
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-xs font-extrabold text-slate-900">
                    {rankItem.score.toFixed(4)}
                  </td>

                  <td className="py-3 px-4 hidden md:table-cell">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isTop ? 'bg-amber-500' : 'bg-accent-primary'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, barWidth))}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50/80 border-t border-slate-200 font-semibold text-slate-700">
              <td colSpan={2} className="py-2.5 px-4 text-xs">
                Total Jumlah Vektor S (Σ S_i):
              </td>
              <td className="py-2.5 px-4 text-right font-mono text-xs text-accent-primary font-bold">
                {totalS.toFixed(4)}
              </td>
              <td className="py-2.5 px-4 text-right font-mono text-xs text-emerald-600 font-bold">
                1.0000 (100%)
              </td>
              <td className="hidden md:table-cell"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default WpVectorTable;
