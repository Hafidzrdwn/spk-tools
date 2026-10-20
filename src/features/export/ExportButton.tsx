import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download,
  Loader2,
  ChevronDown,
  Layers,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { buildComprehensiveReport } from './generateReport';
import { useProjectStore } from '@/store/useProjectStore';
import { useUiStore } from '@/store/useUiStore';
import { useNormalizedCriteria } from '@/store/selectors';
import type { MethodId } from '@/types/domain';
import type { MethodResult } from '@/core/math/types';
import type { compareRankings } from '@/core/math/compareRankings';
import type { ExportScope, ExportReportConfig } from './types';
import { ExportOptionsModal } from './ExportOptionsModal';
import { ExportProgressModal } from './ExportProgressModal';

export interface ExportButtonProps {
  method?: MethodId;
  result?: MethodResult;
  comparisonResult?: ReturnType<typeof compareRankings>;
  className?: string;
  size?: 'sm' | 'md';
  variant?: 'primary' | 'secondary' | 'ghost';
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function triggerDownload(blob: Blob, fileName: string) {
  const blobUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = blobUrl;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 1000);
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  method,
  className = '',
  size = 'sm',
  variant = 'secondary',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageLabel, setStageLabel] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeTab = useUiStore((s) => s.activeTab);
  const effectiveMethod: MethodId = method || activeTab;

  const title = useProjectStore((s) => s.title);
  const criteria = useNormalizedCriteria();
  const alternatives = useProjectStore((s) => s.alternatives);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const executeExport = useCallback(
    async (config: ExportReportConfig, scope: ExportScope) => {
      if (!criteria || criteria.length === 0 || !alternatives || alternatives.length === 0) {
        alert('Kriteria atau alternatif masih kosong. Harap isi data terlebih dahulu.');
        return;
      }

      setIsOptionsModalOpen(false);
      setIsOpen(false);
      setIsProgressOpen(true);
      setProgress(5);
      setIsCompleted(false);
      setProgressError(null);
      setStageLabel('Menyiapkan dan mengekstrak data matriks proyek...');

      let timerId: ReturnType<typeof setInterval> | null = null;

      try {
        await new Promise((r) => setTimeout(r, 100));
        setProgress(20);
        setStageLabel('Menghitung kalkulasi matematis (SAW, WP, TOPSIS, AHP)...');

        const payload = buildComprehensiveReport({
          projectTitle: title,
          scope,
          primaryMethod: effectiveMethod,
          config,
          criteria,
          alternatives,
        });

        await new Promise((r) => setTimeout(r, 150));
        setProgress(45);
        setStageLabel('Menyusun struktur dokumen & tata letak bab matematis...');

        timerId = setInterval(() => {
          setProgress((prev) => {
            if (prev < 90) {
              const increment = Math.max(1, Math.round((90 - prev) / 6));
              return prev + increment;
            }
            return prev;
          });
        }, 120);

        const [{ pdf }, { DecisiPdfReport }] = await Promise.all([
          import('@react-pdf/renderer'),
          import('./DecisiPdfReport'),
        ]);

        setProgress(70);
        setStageLabel('Merender halaman, formula matematika & tabel vektor...');

        const blob = await pdf(<DecisiPdfReport payload={payload} />).toBlob();

        if (timerId) clearInterval(timerId);

        setProgress(96);
        setStageLabel('Mengirimkan berkas unduhan ke perangkat...');

        const safeTitle = sanitizeFilename(title) || 'proyek-spk';
        const methodTag =
          scope === 'ALL'
            ? 'Laporan-Lengkap'
            : config.selectedMethods.length === 1
            ? config.selectedMethods[0]
            : config.selectedMethods.join('-');
        const fileName = `DecisiGraph-${safeTitle}-${methodTag}.pdf`;

        triggerDownload(blob, fileName);

        setProgress(100);
        setIsCompleted(true);
        setStageLabel('Selesai! Berkas PDF berhasil diunduh.');

        setTimeout(() => {
          setIsProgressOpen(false);
        }, 1200);
      } catch (err: unknown) {
        if (timerId) clearInterval(timerId);
        console.error('Gagal membuat dokumen PDF:', err);
        const msg =
          err instanceof Error
            ? err.message
            : 'Terjadi kendala teknis saat merender dokumen PDF.';
        setProgressError(msg);
      }
    },
    [criteria, alternatives, title, effectiveMethod]
  );

  const handleQuickExportCurrent = () => {
    const config: ExportReportConfig = {
      selectedMethods: [effectiveMethod],
      includeComparison: false,
      includeAhp: effectiveMethod === 'AHP',
      includeStory: effectiveMethod === 'AUTO',
      includeExecutiveSummary: true,
    };
    executeExport(config, 'CURRENT');
  };

  const handleQuickExportFull = () => {
    const config: ExportReportConfig = {
      selectedMethods: ['SAW', 'WP', 'TOPSIS'],
      includeComparison: true,
      includeAhp: true,
      includeStory: true,
      includeExecutiveSummary: true,
    };
    executeExport(config, 'ALL');
  };

  const sizeClasses =
    size === 'sm' ? 'h-9 px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';

  const variantClasses =
    variant === 'primary'
      ? 'bg-accent-primary hover:bg-accent-hover text-white border-transparent shadow-xs'
      : variant === 'ghost'
      ? 'bg-transparent hover:bg-slate-100 text-slate-700 border-transparent'
      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-2xs';

  return (
    <>
      <div ref={dropdownRef} className="relative inline-flex flex-col items-end flex-1 sm:flex-initial">
        <button
          type="button"
          data-tour-id="export-pdf-btn"
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={isProgressOpen}
          title="Buka menu ekspor laporan PDF"
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg border transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
        >
          {isProgressOpen ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Ekspor PDF</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200/90 p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pilihan Ekspor Dokumen
              </span>
            </div>

            <button
              type="button"
              onClick={handleQuickExportFull}
              className="w-full text-left p-2.5 rounded-lg hover:bg-indigo-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-indigo-200 transition-colors">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 block">
                  Laporan Lengkap Komparatif
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  Seluruh metode (SAW, WP, TOPSIS, AHP, Story) + komparasi konsensus.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={handleQuickExportCurrent}
              className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2.5 group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-slate-200 transition-colors">
                <Sparkles className="w-4 h-4 text-accent-primary" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Metode Aktif ({effectiveMethod})
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  Tabel data &amp; langkah matematis detail metode {effectiveMethod}.
                </span>
              </div>
            </button>

            <div className="my-1 border-t border-slate-100" />

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsOptionsModalOpen(true);
              }}
              className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2.5 group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-purple-100 transition-colors">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Kustomisasi Pilihan Bab &amp; Metode...
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  Pilih sendiri metode (1 metode, 2 metode + compare, dll).
                </span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      <ExportOptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        activeMethod={effectiveMethod}
        onConfirmExport={executeExport}
      />

      {/* Synchronized Real Progress Modal */}
      <ExportProgressModal
        isOpen={isProgressOpen}
        progress={progress}
        stageLabel={stageLabel}
        isCompleted={isCompleted}
        error={progressError}
        onClose={() => setIsProgressOpen(false)}
      />
    </>
  );
};

export default ExportButton;
