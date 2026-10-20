import React, { useState, useMemo } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  FileText,
  Layers,
  Sliders,
  CheckCircle2,
  Sparkles,
  GitCompare,
  BookOpen,
} from 'lucide-react';
import type { MethodId } from '@/types/domain';
import type { ExportScope, ExportReportConfig } from './types';

export interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMethod: MethodId;
  onConfirmExport: (config: ExportReportConfig, scope: ExportScope) => void;
}

export const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({
  isOpen,
  onClose,
  activeMethod,
  onConfirmExport,
}) => {
  const [scope, setScope] = useState<ExportScope>('ALL');

  const defaultMethod = ['SAW', 'WP', 'TOPSIS'].includes(activeMethod)
    ? activeMethod
    : 'SAW';

  const [selectedMethods, setSelectedMethods] = useState<MethodId[]>([
    'SAW',
    'WP',
    'TOPSIS',
  ]);
  const [includeComparison, setIncludeComparison] = useState<boolean>(true);
  const [includeAhp, setIncludeAhp] = useState<boolean>(true);
  const [includeStory, setIncludeStory] = useState<boolean>(true);

  const handleSelectPreset = (newScope: ExportScope) => {
    setScope(newScope);
    if (newScope === 'CURRENT') {
      setSelectedMethods([defaultMethod]);
      setIncludeComparison(false);
      setIncludeAhp(activeMethod === 'AHP');
      setIncludeStory(activeMethod === 'AUTO');
    } else if (newScope === 'ALL') {
      setSelectedMethods(['SAW', 'WP', 'TOPSIS']);
      setIncludeComparison(true);
      setIncludeAhp(true);
      setIncludeStory(true);
    }
  };

  const handleToggleMethod = (method: MethodId) => {
    setSelectedMethods((prev) => {
      const exists = prev.includes(method);
      const next = exists ? prev.filter((m) => m !== method) : [...prev, method];

      const compareEligible = next.filter((m) =>
        ['SAW', 'WP', 'TOPSIS'].includes(m)
      );
      if (compareEligible.length >= 2) {
        setIncludeComparison(true);
      } else if (compareEligible.length < 2) {
        setIncludeComparison(false);
      }

      return next;
    });
  };

  const compareCandidates = useMemo(() => {
    return selectedMethods.filter((m) => ['SAW', 'WP', 'TOPSIS'].includes(m));
  }, [selectedMethods]);

  const canExport = selectedMethods.length > 0 || includeAhp || includeStory;

  const generatedChaptersPreview = useMemo(() => {
    const list: string[] = [];
    list.push('Ringkasan Kriteria & Spesifikasi Evaluasi');
    list.push('Matriks Keputusan Awal (Tabel Mentah)');

    if (includeStory) {
      list.push('Narasi Cerita Kasus & Pemetaan Entitas (Story-to-Matrix)');
    }

    if (selectedMethods.includes('SAW')) {
      list.push('Metode SAW (Ekstrim Max/Min, Matriks R, Matriks Terbobot, Ranking)');
    }

    if (selectedMethods.includes('WP')) {
      list.push('Metode WP (Pangkat wj*, Vektor S, Jumlahan S, Vektor V, Ranking)');
    }

    if (selectedMethods.includes('TOPSIS')) {
      list.push('Metode TOPSIS (Pembagi Euclidean, Normalisasi, Solusi Ideal A+/A-, Jarak D+/D-, Kedekatan Ci, Ranking)');
    }

    if (includeAhp) {
      list.push('Analytic Hierarchy Process (Matriks Pairwise, Normalisasi, Prioritas w, Uji Konsistensi CR)');
    }

    if (includeComparison && compareCandidates.length >= 2) {
      list.push(`Komparasi Multi-Metode (${compareCandidates.join(' vs ')} & Analisis Pergeseran Ranking)`);
    }

    list.push('Kesimpulan Eksekutif & Rekomendasi Keputusan Final');
    return list;
  }, [selectedMethods, includeComparison, includeAhp, includeStory, compareCandidates]);

  const handleExportClick = () => {
    const config: ExportReportConfig = {
      selectedMethods,
      includeComparison: includeComparison && compareCandidates.length >= 2,
      includeAhp,
      includeStory,
      includeExecutiveSummary: true,
    };
    onConfirmExport(config, scope);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-none">
              Konfigurasi Ekspor Laporan PDF
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              Pilih cakupan metode dan bab laporan yang ingin dimuat secara terperinci.
            </p>
          </div>
        </div>
      }
      className="max-w-2xl max-h-[90vh] overflow-y-auto"
      footer={
        <div className="flex items-center justify-between w-full gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportClick}
            disabled={!canExport}
            className="text-xs font-semibold px-4 shadow-sm flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            Mulai Ekspor Dokumen PDF
          </Button>
        </div>
      }
    >
      <div className="space-y-5 py-2">
        {/* Preset Selector */}
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
            Pilihan Lingkup Ekspor (Preset)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleSelectPreset('ALL')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                scope === 'ALL'
                  ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-950">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Lengkap Komparatif
                </div>
                {scope === 'ALL' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Semua metode (SAW, WP, TOPSIS, AHP, Story) &amp; komparasi cross-method lengkap.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPreset('CURRENT')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                scope === 'CURRENT'
                  ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-950">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Metode Aktif Saja
                </div>
                {scope === 'CURRENT' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Hanya metode tab saat ini ({defaultMethod}) beserta langkah matematis rincinya.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPreset('CUSTOM')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                scope === 'CUSTOM'
                  ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-950">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  Kustom Mandiri
                </div>
                {scope === 'CUSTOM' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Pilih kombinasi metode dan bab tertentu sesuai kebutuhan laporan Anda.
              </p>
            </button>
          </div>
        </div>

        {/* Method Checklist */}
        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Pilihan Metode Perhitungan MCDM
            </span>
            <span className="text-[11px] text-slate-500">
              {selectedMethods.length} metode dipilih
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'SAW', name: 'SAW', desc: 'Simple Additive Weighting' },
              { id: 'WP', name: 'WP', desc: 'Weighted Product' },
              { id: 'TOPSIS', name: 'TOPSIS', desc: 'Ideal Solution Similarity' },
            ].map((m) => {
              const isChecked = selectedMethods.includes(m.id as MethodId);
              return (
                <label
                  key={m.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    isChecked
                      ? 'border-indigo-300 bg-indigo-50/50 text-indigo-950'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      if (scope !== 'CUSTOM') setScope('CUSTOM');
                      handleToggleMethod(m.id as MethodId);
                    }}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-bold block">{m.name}</span>
                    <span className="text-[10px] text-slate-500 block">{m.desc}</span>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Additional Features (AHP & Story) */}
          <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label
              className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                includeAhp
                  ? 'border-purple-300 bg-purple-50/40 text-purple-950'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <input
                type="checkbox"
                checked={includeAhp}
                onChange={(e) => {
                  if (scope !== 'CUSTOM') setScope('CUSTOM');
                  setIncludeAhp(e.target.checked);
                }}
                className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
              />
              <div>
                <span className="font-bold block">AHP (Analytic Hierarchy Process)</span>
                <span className="text-[10px] text-slate-500 block">
                  Matriks pairwise, bobot prioritas &amp; uji konsistensi CR Saaty.
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                includeStory
                  ? 'border-amber-300 bg-amber-50/40 text-amber-950'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <input
                type="checkbox"
                checked={includeStory}
                onChange={(e) => {
                  if (scope !== 'CUSTOM') setScope('CUSTOM');
                  setIncludeStory(e.target.checked);
                }}
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="font-bold block">Story-to-Matrix (Narasi Kasus)</span>
                <span className="text-[10px] text-slate-500 block">
                  Transkrip teks narasi cerita &amp; pemetaan entitas kriteria.
                </span>
              </div>
            </label>
          </div>

          {/* Comparison Toggle Note */}
          <div className="pt-2 border-t border-slate-200/60">
            <label
              className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                includeComparison && compareCandidates.length >= 2
                  ? 'border-emerald-300 bg-emerald-50/50 text-emerald-950'
                  : 'border-slate-200 bg-white text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="font-bold block">Sertakan Bab Komparasi Multi-Metode</span>
                  <span className="text-[10px] text-slate-500 block">
                    {compareCandidates.length >= 2
                      ? `Membandingkan secara side-by-side: ${compareCandidates.join(', ')}`
                      : 'Memerlukan minimal 2 metode terpilih (SAW, WP, atau TOPSIS)'}
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                disabled={compareCandidates.length < 2}
                checked={includeComparison && compareCandidates.length >= 2}
                onChange={(e) => {
                  if (scope !== 'CUSTOM') setScope('CUSTOM');
                  setIncludeComparison(e.target.checked);
                }}
                className="rounded text-emerald-600 focus:ring-emerald-500 disabled:opacity-40"
              />
            </label>
          </div>
        </div>

        {/* Live Chapter Preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              Daftar Bab Yang Akan Dicetak Dalam PDF ({generatedChaptersPreview.length} Bab)
            </label>
            <Badge variant="neutral" size="sm">
              Format A4 Standar
            </Badge>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-48 overflow-y-auto text-xs p-1">
            {generatedChaptersPreview.map((chapter, idx) => (
              <div key={idx} className="p-2 flex items-center gap-2.5 text-slate-700 hover:bg-slate-50/80">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="truncate">{chapter}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ExportOptionsModal;
