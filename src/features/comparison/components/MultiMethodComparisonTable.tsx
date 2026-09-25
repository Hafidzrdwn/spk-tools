import React from 'react';
import type { ComparisonRow } from '@/core/math/compareRankings';
import Badge from '@/components/ui/Badge';
import { Trophy, CheckCircle2 } from 'lucide-react';

export interface MultiMethodComparisonTableProps {
  rows: ComparisonRow[];
}

function getRankBadgeVariant(rank: number): 'benefit' | 'cost' | 'primary' | 'neutral' {
  if (rank === 1) return 'benefit';
  if (rank === 2) return 'primary';
  return 'neutral';
}

export const MultiMethodComparisonTable: React.FC<MultiMethodComparisonTableProps> = ({ rows }) => {
  if (rows.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-control border border-slate-200">
        <p className="font-medium text-slate-600 mb-1">Data perbandingan belum tersedia.</p>
        <p>Tambahkan kriteria dan alternatif, atau klik <span className="font-semibold text-accent-primary">Muat Contoh Kasus Pergeseran</span> di atas untuk melihat perbandingan instan.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-card border border-slate-200/80 bg-white/90 shadow-2xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold">
            <th className="py-3 px-4 w-44 sticky left-0 bg-slate-50/95 z-10 border-r border-slate-200/70">
              Alternatif
            </th>
            <th className="py-3 px-3 text-center border-r border-slate-200/50">
              <span className="font-bold text-indigo-700">SAW</span>
              <span className="text-[10px] text-slate-400 block font-normal">Aditif Linear (V)</span>
            </th>
            <th className="py-3 px-3 text-center border-r border-slate-200/50">
              <span className="font-bold text-violet-700">WP</span>
              <span className="text-[10px] text-slate-400 block font-normal">Perkalian Pangkat (V)</span>
            </th>
            <th className="py-3 px-3 text-center border-r border-slate-200/50">
              <span className="font-bold text-sky-700">TOPSIS</span>
              <span className="text-[10px] text-slate-400 block font-normal">Jarak Ideal (C_i)</span>
            </th>
            <th className="py-3 px-3 text-center border-r border-slate-200/50">
              <span className="font-bold text-slate-700">Rerata Posisi</span>
              <span className="text-[10px] text-slate-400 block font-normal">Borda Average</span>
            </th>
            <th className="py-3 px-3 text-center">
              <span className="font-bold text-slate-700">Konsensus</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, idx) => (
            <tr
              key={row.alternativeId}
              className={`hover:bg-indigo-50/20 transition-colors ${
                row.isConsensusRank1 ? 'bg-amber-50/30' : ''
              }`}
            >
              <td className="py-2.5 px-4 font-semibold text-slate-800 sticky left-0 bg-white/95 z-10 border-r border-slate-200/70 shadow-xs">
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <span className="text-slate-400 font-mono text-[11px] w-5">#{idx + 1}</span>
                  <span className="truncate font-semibold" title={row.alternativeName}>{row.alternativeName}</span>
                  {row.isConsensusRank1 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-benefit/10 text-benefit border border-benefit/20 text-[10px] font-medium whitespace-nowrap shrink-0">
                      Rekomendasi Utama
                    </span>
                  )}
                </div>
              </td>

              {/* SAW */}
              <td className="py-2 px-3 border-r border-slate-100 text-center">
                <div className="flex items-center justify-center gap-1.5 font-mono">
                  <Badge variant={getRankBadgeVariant(row.saw.rank)} size="sm" className="whitespace-nowrap">
                    #{row.saw.rank}
                  </Badge>
                  <span className="text-slate-600">{row.saw.score.toFixed(4)}</span>
                </div>
              </td>

              {/* WP */}
              <td className="py-2 px-3 border-r border-slate-100 text-center">
                <div className="flex items-center justify-center gap-1.5 font-mono">
                  <Badge variant={getRankBadgeVariant(row.wp.rank)} size="sm" className="whitespace-nowrap">
                    #{row.wp.rank}
                  </Badge>
                  <span className="text-slate-600">{row.wp.score.toFixed(4)}</span>
                </div>
              </td>

              {/* TOPSIS */}
              <td className="py-2 px-3 border-r border-slate-100 text-center">
                <div className="flex items-center justify-center gap-1.5 font-mono">
                  <Badge variant={getRankBadgeVariant(row.topsis.rank)} size="sm" className="whitespace-nowrap">
                    #{row.topsis.rank}
                  </Badge>
                  <span className="text-slate-600">{row.topsis.score.toFixed(4)}</span>
                </div>
              </td>

              {/* Average Rank */}
              <td className="py-2 px-3 border-r border-slate-100 text-center font-mono font-bold text-slate-700">
                {row.averageRank.toFixed(2)}
              </td>

              {/* Consensus Status */}
              <td className="py-2 px-3 text-center">
                {row.isConsensusRank1 ? (
                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/80 border border-amber-300 px-2 py-0.5 rounded-full whitespace-nowrap shadow-2xs">
                    <Trophy className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>Konsensus #1</span>
                  </div>
                ) : row.saw.rank === row.wp.rank && row.wp.rank === row.topsis.rank ? (
                  <div className="inline-flex items-center gap-1 text-[11px] text-benefit font-medium whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3 text-benefit shrink-0" />
                    <span>Seragam (#{row.saw.rank})</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">Pergeseran Posisi</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MultiMethodComparisonTable;
