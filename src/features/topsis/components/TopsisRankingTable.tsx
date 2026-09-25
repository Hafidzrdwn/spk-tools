import React from 'react';
import type { RankingRow } from '@/core/math/types';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Trophy, Award } from 'lucide-react';

export interface TopsisRankingTableProps {
  ranking: RankingRow[];
}

export const TopsisRankingTable: React.FC<TopsisRankingTableProps> = ({ ranking }) => {
  if (ranking.length === 0) return null;

  const maxScore = Math.max(...ranking.map((r) => r.score), 0.0001);

  return (
    <Card>
      <CardHeader className="py-3 border-b border-slate-100">
        <CardTitle className="text-sm">Perangkingan Nilai Kedekatan Relatif (C_i)</CardTitle>
        <CardDescription>
          Skor kedekatan C_i berkisar antara 0 hingga 1. Peringkat #1 adalah alternatif terdekat ke solusi ideal
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="w-full overflow-hidden rounded-card border border-slate-200/80 bg-white/90 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4 w-24">Peringkat</th>
                <th className="py-2.5 px-4">Alternatif</th>
                <th className="py-2.5 px-4 w-36 text-right font-mono">Skor Kedekatan (C_i)</th>
                <th className="py-2.5 px-4 w-44 hidden md:table-cell">Visualisasi Relatif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ranking.map((row) => {
                const isTop = row.rank === 1;
                const barWidth = maxScore > 0 ? (row.score / maxScore) * 100 : 0;

                return (
                  <tr
                    key={row.alternativeId}
                    className={isTop ? 'bg-amber-50/30 hover:bg-amber-50/50' : 'hover:bg-slate-50/70'}
                  >
                    <td className="py-2.5 px-4 font-semibold">
                      <div className="flex items-center gap-1.5">
                        {isTop ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs border border-amber-300 shadow-2xs whitespace-nowrap">
                            <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            #1
                          </span>
                        ) : row.rank === 2 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300 shadow-2xs whitespace-nowrap">
                            <Award className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            #2
                          </span>
                        ) : (
                          <span className="font-mono text-slate-500 px-2 font-semibold text-xs whitespace-nowrap">
                            #{row.rank}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900">{row.alternativeName}</span>
                        {isTop && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium whitespace-nowrap shrink-0">
                            Rekomendasi Utama
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-extrabold text-accent-primary">
                      {row.score.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-4 hidden md:table-cell">
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
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopsisRankingTable;
