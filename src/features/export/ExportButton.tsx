import React, { useState } from 'react';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { DecisiPdfReport } from './DecisiPdfReport';
import { generateReport } from './generateReport';
import { useProjectStore } from '@/store/useProjectStore';
import { useNormalizedCriteria } from '@/store/selectors';
import type { MethodId } from '@/types/domain';
import type { MethodResult } from '@/core/math/types';
import type { compareRankings } from '@/core/math/compareRankings';

export interface ExportButtonProps {
  method: MethodId;
  result: MethodResult;
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

export const ExportButton: React.FC<ExportButtonProps> = ({
  method,
  result,
  comparisonResult,
  className = '',
  size = 'sm',
  variant = 'secondary',
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const title = useProjectStore((s) => s.title);
  const criteria = useNormalizedCriteria();
  const alternatives = useProjectStore((s) => s.alternatives);

  const handleExport = async () => {
    setErrorMessage(null);

    // Validasi data awal
    if (!criteria || criteria.length === 0 || !alternatives || alternatives.length === 0) {
      setErrorMessage('Kriteria atau alternatif masih kosong. Harap isi data terlebih dahulu.');
      return;
    }

    if (!result || !result.finalRanking || result.finalRanking.length === 0) {
      setErrorMessage('Hasil perhitungan belum tersedia untuk diekspor.');
      return;
    }

    try {
      setIsGenerating(true);

      const payload = generateReport(
        {
          title,
          criteria,
          alternatives,
        },
        method,
        result,
        comparisonResult
      );

      // Render PDF ke Blob berbasis vector asli
      const blob = await pdf(<DecisiPdfReport payload={payload} />).toBlob();

      // Buat nama file rapi sesuai spesifikasi
      const safeTitle = sanitizeFilename(title) || 'proyek-spk';
      const fileName = `DecisiGraph-${safeTitle}-${method}.pdf`;

      // Trigger auto-download browser
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Bersihkan memory
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (err) {
      console.error('Gagal membuat dokumen PDF:', err);
      setErrorMessage('Terjadi kendala teknis saat merender laporan PDF.');
    } finally {
      setIsGenerating(false);
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

  return (
    <div className="relative inline-flex flex-col items-end">
      <button
        type="button"
        data-tour-id="export-pdf-btn"
        onClick={handleExport}
        disabled={isGenerating}
        title="Export laporan analisis ini ke dokumen PDF resmi"
        className={`inline-flex items-center gap-1.5 font-semibold rounded-control border transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-3.5 h-3.5 text-accent-primary animate-spin" />
            <span>Membuat PDF...</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5 text-accent-primary" />
            <span>Export ke PDF</span>
          </>
        )}
      </button>

      {errorMessage && (
        <div
          role="alert"
          className="absolute top-full right-0 mt-1.5 w-64 p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-700 shadow-lg z-50 flex items-start gap-1.5 animate-in fade-in zoom-in-95"
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
