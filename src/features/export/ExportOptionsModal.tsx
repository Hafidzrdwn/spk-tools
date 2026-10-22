import React, { useState, useMemo } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  CheckCircle2,
  ShieldCheck,
  Key,
  ChevronDown,
  ChevronUp,
  Bot,
  Brain,
} from 'lucide-react';
import type { MethodId } from '@/types/domain';
import type { ExportScope, ExportReportConfig } from './types';
import {
  getEffectiveGeminiApiKey,
  setCustomGeminiApiKey,
} from '@/services/ai';

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
  const [includeAiNarrative, setIncludeAiNarrative] = useState<boolean>(true);

  const [showApiKeySettings, setShowApiKeySettings] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => getEffectiveGeminiApiKey());
  const [isSavedBadge, setIsSavedBadge] = useState<boolean>(false);

  const hasEffectiveKey = Boolean(apiKeyInput.trim() || getEffectiveGeminiApiKey());

  const handleSaveApiKey = () => {
    setCustomGeminiApiKey(apiKeyInput.trim());
    setIsSavedBadge(true);
    setTimeout(() => setIsSavedBadge(false), 2000);
  };

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

    if (includeAiNarrative) {
      list.push('Analisis Eksekutif & Rekomendasi Manajerial Cerdas (Dinamika & Validitas SPK)');
    }

    list.push('Kesimpulan Eksekutif & Rekomendasi Keputusan Final');
    return list;
  }, [selectedMethods, includeComparison, includeAhp, includeStory, includeAiNarrative, compareCandidates]);

  const handleExportClick = () => {
    const config: ExportReportConfig = {
      selectedMethods,
      includeComparison: includeComparison && compareCandidates.length >= 2,
      includeAhp,
      includeStory,
      includeExecutiveSummary: true,
      includeAiNarrative,
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
        <div>
          <h3 className="text-base font-bold text-slate-900 leading-none">
            Konfigurasi Ekspor Laporan PDF
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Pilih cakupan metode dan bab laporan yang ingin dimuat secara terperinci.
          </p>
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
            className="text-xs font-semibold px-4 shadow-sm"
          >
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
                <span className="font-bold text-xs text-indigo-950">
                  Lengkap Komparatif
                </span>
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
                <span className="font-bold text-xs text-indigo-950">
                  Metode Aktif Saja
                </span>
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
                <span className="font-bold text-xs text-indigo-950">
                  Kustom Mandiri
                </span>
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

          <div className="pt-2 border-t border-slate-200/60">
            <label
              className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                includeComparison && compareCandidates.length >= 2
                  ? 'border-emerald-300 bg-emerald-50/50 text-emerald-950'
                  : 'border-slate-200 bg-white text-slate-500'
              }`}
            >
              <div>
                <span className="font-bold block">Sertakan Bab Komparasi Multi-Metode</span>
                <span className="text-[10px] text-slate-500 block">
                  {compareCandidates.length >= 2
                    ? `Membandingkan secara side-by-side: ${compareCandidates.join(', ')}`
                    : 'Memerlukan minimal 2 metode terpilih (SAW, WP, atau TOPSIS)'}
                </span>
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

        <div className="bg-linear-to-br from-indigo-50/70 via-purple-50/50 to-slate-50/80 rounded-xl p-3.5 border border-indigo-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Analisis Eksekutif &amp; Rekomendasi Cerdas
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Sintesis pergeseran ranking, evaluasi keabsahan ilmiah, dan panduan manajerial
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeAiNarrative}
                onChange={(e) => setIncludeAiNarrative(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {includeAiNarrative && (
            <div className="space-y-2.5 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-white/80 p-2.5 rounded-lg border border-indigo-100 text-xs">
                <div className="flex items-center gap-2">
                  {hasEffectiveKey ? (
                    <Badge variant="benefit" size="sm" className="gap-1 font-semibold">
                      <Brain className="w-3 h-3 text-emerald-600" />
                      Gemini Flash Aktif
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm" className="gap-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                      Mesin Presisi Deterministik (Offline)
                    </Badge>
                  )}
                  <span className="text-[11px] text-slate-500">
                    {hasEffectiveKey
                      ? 'Analisis cerdas via AI'
                      : 'Kalkulasi berbasis data matematis presisi tanpa ketergantungan API'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowApiKeySettings((v) => !v)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  <Key className="w-3 h-3" />
                  <span>{showApiKeySettings ? 'Tutup Pengaturan Key' : 'Atur API Key'}</span>
                  {showApiKeySettings ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </div>

              {showApiKeySettings && (
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-800 text-[11px]">
                      Google Gemini API Key (Peramban Lokal)
                    </label>
                    {isSavedBadge && (
                      <span className="text-[10px] text-emerald-600 font-bold animate-in fade-in">
                        Tersimpan di browser!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      placeholder="Tempel AI Studio API Key (AIzaSy...)"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveApiKey}
                      className="text-xs shrink-0"
                    >
                      Simpan
                    </Button>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Kunci disimpan secara lokal di browser Anda (localStorage) dan TIDAK pernah dikirim ke server aplikasi atau database publik. Aman dan terisolasi untuk perangkat Anda.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 bg-white/50 p-2 rounded-lg border border-slate-200/60">
                <div className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                    A
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800 block">Dinamika Ranking</span>
                    <span className="text-slate-500 text-[10px]">
                      Kompensatoris SAW vs Penalti WP vs Jarak TOPSIS
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                    B
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800 block">Validitas Ilmiah</span>
                    <span className="text-slate-500 text-[10px]">
                      Evaluasi galat &amp; independensi asumsi matematis
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                    C
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800 block">Aksi Manajerial</span>
                    <span className="text-slate-500 text-[10px]">
                      Prioritas 1, opsi ke-2, &amp; rekomendasi kriteria
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Chapter Preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
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
