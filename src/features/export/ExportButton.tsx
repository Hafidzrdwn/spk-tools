import React, { useState, useRef, useEffect } from 'react';
import { Download, Loader2, AlertCircle, ChevronDown, FileText, Layers } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { DecisiPdfReport } from './DecisiPdfReport';
import { generateReport } from './generateReport';
import { useProjectStore } from '@/store/useProjectStore';
import { useUiStore } from '@/store/useUiStore';
import { useNormalizedCriteria } from '@/store/selectors';
import { calculateSAW } from '@/core/math/saw';
import { calculateWP } from '@/core/math/wp';
import { calculateTOPSIS } from '@/core/math/topsis';
import { compareRankings } from '@/core/math/compareRankings';
import type { MethodId } from '@/types/domain';
import type { MethodResult } from '@/core/math/types';

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
  result,
  comparisonResult,
  className = '',
  size = 'sm',
  variant = 'secondary',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportingLabel, setExportingLabel] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeTab = useUiStore((s) => s.activeTab);
  const effectiveMethod: MethodId = method || activeTab;

  const title = useProjectStore((s) => s.title);
  const criteria = useNormalizedCriteria();
  const alternatives = useProjectStore((s) => s.alternatives);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Resolve method calculation if not directly passed
  const resolveMethodResult = (targetMethod: MethodId): {
    res: MethodResult;
    comp?: ReturnType<typeof compareRankings>;
  } => {
    if (result && (!method || method === targetMethod)) {
      return { res: result, comp: comparisonResult };
    }

    if (targetMethod === 'WP') {
      return { res: calculateWP(criteria, alternatives) };
    }
    if (targetMethod === 'TOPSIS') {
      return { res: calculateTOPSIS(criteria, alternatives) };
    }
    if (targetMethod === 'COMPARE') {
      const sawRes = calculateSAW(criteria, alternatives);
      const wpRes = calculateWP(criteria, alternatives);
      const topsisRes = calculateTOPSIS(criteria, alternatives);
      const comp = compareRankings(
        sawRes.finalRanking,
        wpRes.finalRanking,
        topsisRes.finalRanking,
        criteria,
        alternatives
      );
      const res: MethodResult = {
        intermediateMatrices: {},
        formulaSteps: [],
        finalRanking: comp.rows.map((row, idx) => ({
          alternativeId: row.alternativeId,
          alternativeName: row.alternativeName,
          score: Number((1 / Math.max(0.1, row.averageRank)).toFixed(4)),
          rank: idx + 1,
        })),
      };
      return { res, comp };
    }

    // Default: SAW (used for SAW, AHP fallback, and AUTO)
    return { res: calculateSAW(criteria, alternatives) };
  };

  // Export specific method
  const handleExportMethod = async () => {
    setErrorMessage(null);
    setIsOpen(false);

    if (!criteria || criteria.length === 0 || !alternatives || alternatives.length === 0) {
      setErrorMessage('Kriteria atau alternatif masih kosong. Harap isi data terlebih dahulu.');
      return;
    }

    try {
      setIsGenerating(true);
      setExportingLabel(effectiveMethod);

      const { res, comp } = resolveMethodResult(effectiveMethod);

      if (!res || !res.finalRanking || res.finalRanking.length === 0) {
        setErrorMessage(`Hasil perhitungan metode ${effectiveMethod} belum tersedia untuk diekspor.`);
        return;
      }

      const payload = generateReport(
        {
          title,
          criteria,
          alternatives,
        },
        effectiveMethod,
        res,
        comp || comparisonResult
      );

      const blob = await pdf(<DecisiPdfReport payload={payload} />).toBlob();
      const safeTitle = sanitizeFilename(title) || 'proyek-spk';
      const fileName = `DecisiGraph-${safeTitle}-${effectiveMethod}.pdf`;

      triggerDownload(blob, fileName);
    } catch (err: unknown) {
      console.error(`Gagal membuat dokumen PDF ${effectiveMethod}:`, err);
      const msg = err instanceof Error ? err.message : 'Terjadi kendala teknis saat merender laporan PDF.';
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
      setExportingLabel(null);
    }
  };

  // Export full project report (Criteria, Matrix, SAW, WP, TOPSIS, Consensus)
  const handleExportFullProject = async () => {
    setErrorMessage(null);
    setIsOpen(false);

    if (!criteria || criteria.length === 0 || !alternatives || alternatives.length === 0) {
      setErrorMessage('Kriteria atau alternatif masih kosong. Harap isi data terlebih dahulu.');
      return;
    }

    try {
      setIsGenerating(true);
      setExportingLabel('Lengkap');

      // Compute all individual methods
      const sawRes = calculateSAW(criteria, alternatives);
      const wpRes = calculateWP(criteria, alternatives);
      const topsisRes = calculateTOPSIS(criteria, alternatives);

      // Compute multi-method consensus
      const compRes = compareRankings(
        sawRes.finalRanking,
        wpRes.finalRanking,
        topsisRes.finalRanking,
        criteria,
        alternatives
      );

      const fullMethodResult: MethodResult = {
        intermediateMatrices: {},
        formulaSteps: [],
        finalRanking: compRes.rows.map((row, idx) => ({
          alternativeId: row.alternativeId,
          alternativeName: row.alternativeName,
          score: Number((1 / Math.max(0.1, row.averageRank)).toFixed(4)),
          rank: idx + 1,
        })),
      };

      const payload = generateReport(
        {
          title: title || 'Laporan Pengambilan Keputusan SPK',
          criteria,
          alternatives,
        },
        'COMPARE',
        fullMethodResult,
        compRes
      );

      const blob = await pdf(<DecisiPdfReport payload={payload} />).toBlob();
      const safeTitle = sanitizeFilename(title) || 'proyek-spk';
      const fileName = `DecisiGraph-${safeTitle}-Laporan-Lengkap.pdf`;

      triggerDownload(blob, fileName);
    } catch (err: unknown) {
      console.error('Gagal membuat laporan komplit PDF:', err);
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat merender laporan lengkap proyek.';
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
      setExportingLabel(null);
    }
  };

  const sizeClasses =
    size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';

  const variantClasses =
    variant === 'primary'
      ? 'bg-accent-primary hover:bg-accent-hover text-white border-transparent shadow-xs'
      : variant === 'ghost'
      ? 'bg-transparent hover:bg-slate-100 text-slate-700 border-transparent'
      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-2xs';

  const methodLabel =
    effectiveMethod === 'COMPARE'
      ? 'Perbandingan'
      : effectiveMethod === 'AUTO'
      ? 'Story SPK'
      : effectiveMethod;

  return (
    <div ref={dropdownRef} className="relative inline-flex flex-col items-end">
      <button
        type="button"
        data-tour-id="export-pdf-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isGenerating}
        title="Pilih opsi ekspor laporan ke dokumen PDF"
        className={`inline-flex items-center gap-1.5 font-semibold rounded-control border transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      >
        {isGenerating ? (
          <>
            <Loader2
              className={`w-3.5 h-3.5 animate-spin ${
                variant === 'primary' ? 'text-white' : 'text-accent-primary'
              }`}
            />
            <span>Membuat PDF ({exportingLabel})...</span>
          </>
        ) : (
          <>
            <Download
              className={`w-3.5 h-3.5 ${
                variant === 'primary' ? 'text-white' : 'text-accent-primary'
              }`}
            />
            <span>Export PDF</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              } ${
                variant === 'primary' ? 'text-white/80' : 'text-slate-400'
              }`}
            />
          </>
        )}
      </button>

      {/* Dropdown Menu Pilihan Ekspor */}
      {isOpen && (
        <div
          role="menu"
          className="absolute top-full right-0 mt-1.5 w-72 bg-white rounded-xl border border-slate-200/90 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95"
        >
          <div className="px-3.5 py-2.5 bg-slate-50/90 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-800">Pilihan Dokumen PDF</p>
            <p className="text-[10px] text-slate-500">Unduh laporan resmi berbasis vektor</p>
          </div>

          <div className="p-1.5 space-y-1">
            {/* Opsi 1: Ekspor Metode Ini */}
            <button
              type="button"
              onClick={handleExportMethod}
              className="w-full text-left p-2.5 rounded-lg hover:bg-indigo-50/60 transition-colors flex items-start gap-2.5 group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-accent-primary shrink-0 mt-0.5 group-hover:bg-indigo-100/70">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-800 group-hover:text-accent-primary block">
                  Ekspor Metode Ini ({methodLabel})
                </span>
                <p className="text-[10px] text-slate-500 leading-snug mt-0.5">
                  Laporan fokus pada matriks & hasil perhitungan metode {methodLabel}
                </p>
              </div>
            </button>

            {/* Opsi 2: Ekspor Laporan Lengkap Proyek */}
            <button
              type="button"
              onClick={handleExportFullProject}
              className="w-full text-left p-2.5 rounded-lg hover:bg-amber-50/50 transition-colors flex items-start gap-2.5 group cursor-pointer border-t border-slate-100/80"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shrink-0 mt-0.5 group-hover:bg-amber-100/70">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700 block">
                  Ekspor Laporan Lengkap Proyek
                </span>
                <p className="text-[10px] text-slate-500 leading-snug mt-0.5">
                  Kompilasi komprehensif: Kriteria, Alternatif, SAW, WP, TOPSIS & Konsensus
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Error notification */}
      {errorMessage && (
        <div
          role="alert"
          className="absolute top-full right-0 mt-1.5 w-64 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-700 shadow-lg z-50 flex items-start gap-1.5 animate-in fade-in zoom-in-95"
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="block mt-1 text-[10px] text-rose-900 underline font-semibold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
