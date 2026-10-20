import React from 'react';
import { createPortal } from 'react-dom';
import { FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export interface ExportProgressModalProps {
  isOpen: boolean;
  progress: number;
  stageLabel: string;
  isCompleted: boolean;
  error: string | null;
  onClose: () => void;
}

export const ExportProgressModal: React.FC<ExportProgressModalProps> = ({
  isOpen,
  progress,
  stageLabel,
  isCompleted,
  error,
  onClose,
}) => {
  if (!isOpen || typeof document === 'undefined') return null;

  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-progress-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-6 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative mb-4">
          {error ? (
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>
          ) : isCompleted ? (
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-inner">
              <CheckCircle2 className="w-8 h-8 animate-in zoom-in-50 duration-300" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-inner">
              <FileText className="w-7 h-7 text-indigo-600 animate-pulse" />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs border border-indigo-100">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              </div>
            </div>
          )}
        </div>

        <h3 id="export-progress-title" className="text-base font-bold text-slate-900 mb-1">
          {error
            ? 'Gagal Membuat Dokumen PDF'
            : isCompleted
            ? 'Dokumen PDF Berhasil Dibuat!'
            : 'Menyusun Laporan PDF Komprehensif'}
        </h3>
        <p className="text-xs text-slate-500 mb-5 min-h-[32px] px-2 leading-relaxed">
          {error ? error : stageLabel}
        </p>

        {!error && (
          <div className="w-full space-y-2 mb-6">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600 px-0.5">
              <span>Proses Kompilasi</span>
              <span className="font-mono text-indigo-600 font-bold">{clampedProgress}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
              <div
                className="h-full rounded-full bg-linear-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-300 ease-out shadow-xs"
                style={{ width: `${clampedProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Stages Checklist preview */}
        {!error && (
          <div className="w-full bg-slate-50/80 rounded-xl p-3 mb-5 border border-slate-200/60 text-left text-xs space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${clampedProgress >= 25 ? 'bg-emerald-500' : 'bg-slate-300 animate-pulse'}`} />
              <span className={clampedProgress >= 25 ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                1. Ekstraksi & Kalkulasi Matriks Metode
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${clampedProgress >= 55 ? 'bg-emerald-500' : clampedProgress >= 25 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className={clampedProgress >= 55 ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                2. Penyusunan Tabel Matematis & KaTeX
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${clampedProgress >= 90 ? 'bg-emerald-500' : clampedProgress >= 55 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className={clampedProgress >= 90 ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                3. Kompilasi Biner Dokumen PDF
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${clampedProgress >= 100 ? 'bg-emerald-500' : clampedProgress >= 90 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className={clampedProgress >= 100 ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                4. Mengirimkan Berkas Unduhan ke Perangkat
              </span>
            </div>
          </div>
        )}

        {/* Action button if error or completed */}
        {(error || isCompleted) && (
          <Button
            variant={error ? 'secondary' : 'primary'}
            size="sm"
            onClick={onClose}
            className="w-full text-xs font-semibold"
          >
            {error ? 'Tutup & Coba Lagi' : 'Selesai'}
          </Button>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ExportProgressModal;
