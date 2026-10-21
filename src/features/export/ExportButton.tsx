import React, { useState, useCallback } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { buildComprehensiveReport } from './generateReport';
import { useProjectStore } from '@/store/useProjectStore';
import { useUiStore } from '@/store/useUiStore';
import { useNormalizedCriteria } from '@/store/selectors';
import type { MethodId } from '@/types/domain';
import type { MethodResult } from '@/core/math/types';
import type { compareRankings } from '@/core/math/compareRankings';
import { calculateSAW } from '@/core/math/saw';
import { calculateSafeWP } from '@/core/math/wp';
import { calculateTOPSIS } from '@/core/math/topsis';
import {
  fetchAiExecutiveNarrative,
  type AiExecutiveNarrative,
  type AiAnalysisMethod,
} from '@/services/ai';
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
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageLabel, setStageLabel] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);

  const activeTab = useUiStore((s) => s.activeTab);
  const effectiveMethod: MethodId = method || activeTab;

  const title = useProjectStore((s) => s.title);
  const criteria = useNormalizedCriteria();
  const alternatives = useProjectStore((s) => s.alternatives);

  const executeExport = useCallback(
    async (config: ExportReportConfig, scope: ExportScope) => {
      if (!criteria || criteria.length === 0 || !alternatives || alternatives.length === 0) {
        alert('Kriteria atau alternatif masih kosong. Harap isi data terlebih dahulu.');
        return;
      }

      setIsOptionsModalOpen(false);
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

        let aiNarrative: AiExecutiveNarrative | undefined = undefined;

        if (config.includeAiNarrative) {
          setProgress(35);
          setStageLabel('Mensintesis Analisis Narasi Eksekutif & Rekomendasi Keputusan...');
          try {
            const sawRes = calculateSAW(criteria, alternatives);
            const wpRes = calculateSafeWP(criteria, alternatives);
            const topsisRes = calculateTOPSIS(criteria, alternatives);

            const activeMethodsList: AiAnalysisMethod[] = [];
            if (config.selectedMethods.includes('SAW')) activeMethodsList.push('saw');
            if (config.selectedMethods.includes('WP')) activeMethodsList.push('wp');
            if (config.selectedMethods.includes('TOPSIS')) activeMethodsList.push('topsis');

            aiNarrative = await fetchAiExecutiveNarrative({
              projectTitle: title,
              criteria,
              alternatives,
              activeMethods: activeMethodsList.length > 0 ? activeMethodsList : ['saw', 'wp', 'topsis'],
              rankings: {
                saw: sawRes.finalRanking,
                wp: wpRes.finalRanking,
                topsis: topsisRes.finalRanking,
              },
            });
          } catch (aiErr) {
            console.warn('AI synthesis fallback:', aiErr);
          }
        }

        await new Promise((r) => setTimeout(r, 100));
        setProgress(50);
        setStageLabel('Menyusun struktur dokumen & tata letak bab matematis...');

        const payload = buildComprehensiveReport({
          projectTitle: title,
          scope,
          primaryMethod: effectiveMethod,
          config,
          criteria,
          alternatives,
          aiNarrative,
        });

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
      <div className="relative inline-flex flex-col items-end flex-1 sm:flex-initial">
        <button
          type="button"
          data-tour-id="export-pdf-btn"
          onClick={() => setIsOptionsModalOpen(true)}
          disabled={isProgressOpen}
          title="Buka pengaturan dan ekspor laporan PDF"
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
            </>
          )}
        </button>
      </div>

      <ExportOptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        activeMethod={effectiveMethod}
        onConfirmExport={executeExport}
      />

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
