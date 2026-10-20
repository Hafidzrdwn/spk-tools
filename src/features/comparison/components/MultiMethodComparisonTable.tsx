import React from 'react';
import type { ComparisonRow, CompareMethod } from '@/core/math/compareRankings';
import Badge from '@/components/ui/Badge';
import { Trophy, CheckCircle2, ArrowUp, ArrowDown, Minus, SlidersHorizontal } from 'lucide-react';
import { useNumberFormatter } from '@/utils/numberFormat';

export interface MultiMethodComparisonTableProps {
  rows: ComparisonRow[];
  activeMethods?: CompareMethod[];
  onToggleMethod?: (method: CompareMethod) => void;
  onSelectMethodPreset?: (methods: CompareMethod[]) => void;
}

function getRankBadgeVariant(rank: number): 'benefit' | 'cost' | 'primary' | 'neutral' {
  if (rank === 1) return 'benefit';
  if (rank === 2) return 'primary';
  return 'neutral';
}

export const MultiMethodComparisonTable: React.FC<MultiMethodComparisonTableProps> = React.memo(({
  rows,
  activeMethods = ['saw', 'wp', 'topsis'],
  onToggleMethod,
  onSelectMethodPreset,
}) => {
  const { formatNumber } = useNumberFormatter();

  const hasSaw = activeMethods.includes('saw');
  const hasWp = activeMethods.includes('wp');
  const hasTopsis = activeMethods.includes('topsis');

  if (rows.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-control border border-slate-200">
        <p className="font-medium text-slate-600 mb-1">Data perbandingan belum tersedia.</p>
        <p>
          Tambahkan kriteria dan alternatif, atau klik{' '}
          <span className="font-semibold text-accent-primary">Muat Contoh Kasus Pergeseran</span>{' '}
          di atas untuk melihat perbandingan instan.
        </p>
      </div>
    );
  }

  const isPresetActive = (preset: CompareMethod[]) =>
    preset.length === activeMethods.length && preset.every((m) => activeMethods.includes(m));

  return (
    <div className="space-y-3.5">
      {/* Filter / Toggle Bar Pemilihan Metode */}
      {onToggleMethod && (
        <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
              <span>Metode yang Dibandingkan:</span>
            </span>

            {/* Tombol Checklist / Pills Metode */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => onToggleMethod('saw')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer border ${
                  hasSaw
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                }`}
                title="Sertakan / Sembunyikan metode SAW"
              >
                {hasSaw ? '✓ SAW' : '+ SAW'}
              </button>

              <button
                type="button"
                onClick={() => onToggleMethod('wp')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer border ${
                  hasWp
                    ? 'bg-violet-600 text-white border-violet-700 shadow-2xs'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                }`}
                title="Sertakan / Sembunyikan metode WP"
              >
                {hasWp ? '✓ WP' : '+ WP'}
              </button>

              <button
                type="button"
                onClick={() => onToggleMethod('topsis')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer border ${
                  hasTopsis
                    ? 'bg-sky-600 text-white border-sky-700 shadow-2xs'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                }`}
                title="Sertakan / Sembunyikan metode TOPSIS"
              >
                {hasTopsis ? '✓ TOPSIS' : '+ TOPSIS'}
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          {onSelectMethodPreset && (
            <div className="flex items-center gap-1 flex-wrap shrink-0">
              <span className="text-[11px] text-slate-400 font-medium hidden md:inline">Preset:</span>
              <button
                type="button"
                onClick={() => onSelectMethodPreset(['saw', 'wp', 'topsis'])}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                  isPresetActive(['saw', 'wp', 'topsis'])
                    ? 'bg-slate-800 text-white font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                Semua (3)
              </button>
              <button
                type="button"
                onClick={() => onSelectMethodPreset(['saw', 'wp'])}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                  isPresetActive(['saw', 'wp'])
                    ? 'bg-slate-800 text-white font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                SAW &bull; WP
              </button>
              <button
                type="button"
                onClick={() => onSelectMethodPreset(['saw', 'topsis'])}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                  isPresetActive(['saw', 'topsis'])
                    ? 'bg-slate-800 text-white font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                SAW &bull; TOPSIS
              </button>
              <button
                type="button"
                onClick={() => onSelectMethodPreset(['wp', 'topsis'])}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                  isPresetActive(['wp', 'topsis'])
                    ? 'bg-slate-800 text-white font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                WP &bull; TOPSIS
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tabel Utama Matriks Komparasi */}
      <div className="w-full overflow-x-auto rounded-card border border-slate-200/80 bg-white/90 shadow-2xs touch-pan-x [contain:paint]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-3 px-3 sm:px-4 w-36 sm:w-60 min-w-[140px] sm:min-w-60 max-w-[175px] sm:max-w-72 sticky left-0 bg-slate-50/95 z-10 border-r border-slate-200/70">
                Alternatif
              </th>

              {hasSaw && (
                <th className="py-3 px-3 text-center border-r border-slate-200/50 min-w-[95px] sm:min-w-[110px] whitespace-nowrap">
                  <span className="font-bold text-indigo-700">SAW</span>
                  <span className="text-[10px] text-slate-400 block font-normal">Aditif Linear (V)</span>
                </th>
              )}

              {hasWp && (
                <th className="py-3 px-3 text-center border-r border-slate-200/50 min-w-[95px] sm:min-w-[110px] whitespace-nowrap">
                  <span className="font-bold text-violet-700">WP</span>
                  <span className="text-[10px] text-slate-400 block font-normal">Perkalian Pangkat (V)</span>
                </th>
              )}

              {hasTopsis && (
                <th className="py-3 px-3 text-center border-r border-slate-200/50 min-w-[95px] sm:min-w-[110px] whitespace-nowrap">
                  <span className="font-bold text-sky-700">TOPSIS</span>
                  <span className="text-[10px] text-slate-400 block font-normal">Jarak Ideal (C_i)</span>
                </th>
              )}

              <th className="py-3 px-3 text-center border-r border-slate-200/50 min-w-[105px] sm:min-w-[125px] whitespace-nowrap">
                <span className="font-bold text-slate-700">Pergeseran Posisi</span>
                <span className="text-[10px] text-slate-400 block font-normal">
                  {activeMethods.length === 2 ? 'Delta Antar Metode' : 'Rentang Posisi'}
                </span>
              </th>

              <th className="py-3 px-3 text-center border-r border-slate-200/50 min-w-[90px] sm:min-w-[110px] whitespace-nowrap">
                <span className="font-bold text-slate-700">Rerata Posisi</span>
                <span className="text-[10px] text-slate-400 block font-normal">
                  {activeMethods.map((m) => m.toUpperCase()).join(' & ')}
                </span>
              </th>

              <th className="py-3 px-3 text-center min-w-[100px] sm:min-w-[120px] whitespace-nowrap">
                <span className="font-bold text-slate-700">Konsensus</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, idx) => {
              const shift = row.shift;
              return (
                <tr
                  key={row.alternativeId}
                  className={`hover:bg-indigo-50/20 transition-colors ${
                    row.isConsensusRank1 ? 'bg-amber-50/30' : ''
                  }`}
                >
                  {/* Nama Alternatif */}
                  <td className="py-2.5 px-3 sm:px-4 font-semibold text-slate-800 sticky left-0 bg-white/95 z-10 border-r border-slate-200/70 shadow-xs w-36 sm:w-60 min-w-[140px] sm:min-w-60 max-w-[175px] sm:max-w-72 align-middle">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-start gap-1.5 min-w-0">
                        <span className="text-slate-400 font-mono text-[10px] sm:text-[11px] shrink-0 mt-0.5">#{idx + 1}</span>
                        <span className="font-semibold text-xs text-slate-800 break-words leading-snug" title={row.alternativeName}>
                          {row.alternativeName}
                        </span>
                      </div>
                      {row.isConsensusRank1 && (
                        <div className="flex items-center pl-4 sm:pl-5">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-benefit/10 text-benefit border border-benefit/20 text-[10px] font-medium whitespace-nowrap shrink-0">
                            <Trophy className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>Rekomendasi Utama</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* SAW Column */}
                  {hasSaw && (
                    <td className="py-2 px-3 border-r border-slate-100 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 font-mono">
                        <Badge variant={getRankBadgeVariant(row.saw.rank)} size="sm" className="whitespace-nowrap">
                          #{row.saw.rank}
                        </Badge>
                        <span className="text-slate-600">{formatNumber(row.saw.score, 4)}</span>
                      </div>
                    </td>
                  )}

                  {/* WP Column */}
                  {hasWp && (
                    <td className="py-2 px-3 border-r border-slate-100 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 font-mono">
                        <Badge variant={getRankBadgeVariant(row.wp.rank)} size="sm" className="whitespace-nowrap">
                          #{row.wp.rank}
                        </Badge>
                        <span className="text-slate-600">{formatNumber(row.wp.score, 4)}</span>
                      </div>
                    </td>
                  )}

                  {/* TOPSIS Column */}
                  {hasTopsis && (
                    <td className="py-2 px-3 border-r border-slate-100 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 font-mono">
                        <Badge variant={getRankBadgeVariant(row.topsis.rank)} size="sm" className="whitespace-nowrap">
                          #{row.topsis.rank}
                        </Badge>
                        <span className="text-slate-600">{formatNumber(row.topsis.score, 4)}</span>
                      </div>
                    </td>
                  )}

                  {/* Pergeseran Posisi (Shift Badge) */}
                  <td className="py-2 px-3 border-r border-slate-100 text-center whitespace-nowrap" title={shift?.details}>
                    {shift?.type === 'stable' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium whitespace-nowrap">
                        <Minus className="w-3 h-3 text-slate-400" />
                        <span>Tetap</span>
                      </span>
                    ) : shift?.type === 'up' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold whitespace-nowrap">
                        <ArrowUp className="w-3 h-3 text-emerald-600" />
                        <span>{shift.label}</span>
                      </span>
                    ) : shift?.type === 'down' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold whitespace-nowrap">
                        <ArrowDown className="w-3 h-3 text-rose-600" />
                        <span>{shift.label}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-medium whitespace-nowrap">
                        <span>{shift?.label}</span>
                      </span>
                    )}
                  </td>

                  {/* Average Rank (Dinamis sesuai metode aktif) */}
                  <td className="py-2 px-3 border-r border-slate-100 text-center font-mono font-bold text-slate-800 whitespace-nowrap">
                    {formatNumber(row.averageRank, 2)}
                  </td>

                  {/* Consensus Status */}
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    {row.isConsensusRank1 ? (
                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/80 border border-amber-300 px-2 py-0.5 rounded-full whitespace-nowrap shadow-2xs">
                        <Trophy className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Konsensus #1</span>
                      </div>
                    ) : shift?.type === 'stable' ? (
                      <div className="inline-flex items-center gap-1 text-[11px] text-benefit font-medium whitespace-nowrap">
                        <CheckCircle2 className="w-3 h-3 text-benefit shrink-0" />
                        <span>Seragam (#{row.saw.rank})</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                        Pergeseran
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

MultiMethodComparisonTable.displayName = 'MultiMethodComparisonTable';

export default MultiMethodComparisonTable;
