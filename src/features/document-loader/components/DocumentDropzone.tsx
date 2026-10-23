import React, { useRef, useState, useCallback } from 'react';
import { FileText, AlertCircle, FileSpreadsheet, Layers, CheckCircle2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import DocumentDropzoneIllustration from '@/components/ui/illustrations/DocumentDropzoneIllustration';

export interface DocumentDropzoneProps {
  onFileSelected: (file: File) => void;
  onLoadDemo: (demoId: 'laptop' | 'cloud') => void;
  isProcessing: boolean;
  disabled?: boolean;
}

export const DocumentDropzone: React.FC<DocumentDropzoneProps> = ({
  onFileSelected,
  onLoadDemo,
  isProcessing,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isProcessing) {
      setIsDragOver(true);
    }
  }, [disabled, isProcessing]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragError(null);

    if (disabled || isProcessing) return;

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'docx', 'txt', 'md', 'csv', 'json'];

    if (!ext || !validExtensions.includes(ext)) {
      setDragError(`Format berkas .${ext || 'unknown'} tidak didukung. Harap unggah PDF, Word (.docx), atau file teks.`);
      return;
    }

    onFileSelected(file);
  }, [disabled, isProcessing, onFileSelected]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDragError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelected(files[0]);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div
        id="document-dropzone-container"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !isProcessing) {
            fileInputRef.current?.click();
          }
        }}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 cursor-pointer select-none',
          'flex flex-col items-center justify-center gap-3',
          isDragOver
            ? 'border-accent-primary bg-indigo-50/70 shadow-md scale-[1.01]'
            : 'border-slate-200 hover:border-accent-primary/60 hover:bg-slate-50/80 bg-white/60 shadow-2xs',
          (disabled || isProcessing) && 'opacity-60 cursor-not-allowed pointer-events-none'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="document-file-input"
          accept=".pdf,.docx,.txt,.md,.markdown,.csv,.json,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv,application/json"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isProcessing}
        />

        <DocumentDropzoneIllustration size={68} className="mb-0.5" />

        <div className="space-y-1">
          <p className="text-sm sm:text-base font-bold text-slate-800">
            Seret & Lepas Dokumen di Sini, atau <span className="text-accent-primary hover:underline">Telusuri Berkas</span>
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Mendukung dokumen perbandingan evaluasi berupa laporan vendor, tabel spesifikasi teknis, atau dokumen penawaran harga.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          <Badge variant="neutral" size="sm" className="font-mono text-[11px] gap-1 bg-slate-100 text-slate-700">
            <FileText className="w-3 h-3 text-rose-500" /> PDF
          </Badge>
          <Badge variant="neutral" size="sm" className="font-mono text-[11px] gap-1 bg-slate-100 text-slate-700">
            <FileText className="w-3 h-3 text-blue-500" /> Word (.docx)
          </Badge>
          <Badge variant="neutral" size="sm" className="font-mono text-[11px] gap-1 bg-slate-100 text-slate-700">
            <FileSpreadsheet className="w-3 h-3 text-emerald-500" /> CSV / Tabel
          </Badge>
          <Badge variant="neutral" size="sm" className="font-mono text-[11px] gap-1 bg-slate-100 text-slate-700">
            <FileText className="w-3 h-3 text-slate-500" /> TXT / Markdown
          </Badge>
        </div>

        <span className="text-[11px] text-slate-400 font-medium">Batas ukuran berkas maksimum 10 MB</span>
      </div>

      {dragError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{dragError}</span>
        </div>
      )}

      <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-accent-primary" />
            Coba Cepat dengan Dokumen Studi Kasus Demo:
          </span>
          <span className="text-[11px] text-slate-500">Klik untuk memuat instan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            id="btn-demo-laptop"
            onClick={(e) => {
              e.stopPropagation();
              onLoadDemo('laptop');
            }}
            disabled={disabled || isProcessing}
            className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50/60 hover:border-accent-primary/40 text-left transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-semibold text-slate-800 group-hover:text-accent-primary">
                Pengadaan Laptop Kerja
              </span>
              <Badge variant="primary" size="sm" className="text-[10px] py-0 px-1.5">
                5 Kriteria • 4 Vendor
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">
              Evaluasi kriteria Harga (Cost), RAM, Storage, Baterai, dan Garansi.
            </p>
          </button>

          <button
            type="button"
            id="btn-demo-cloud"
            onClick={(e) => {
              e.stopPropagation();
              onLoadDemo('cloud');
            }}
            disabled={disabled || isProcessing}
            className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50/60 hover:border-accent-primary/40 text-left transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-semibold text-slate-800 group-hover:text-accent-primary">
                Seleksi Cloud VPS Server
              </span>
              <Badge variant="secondary" size="sm" className="text-[10px] py-0 px-1.5">
                5 Kriteria • 4 Provider
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">
              Evaluasi vCPU, RAM, Uptime SLA, Bandwidth, dan Biaya Bulanan (Cost).
            </p>
          </button>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-800 space-y-1">
        <p className="font-bold flex items-center gap-1.5 text-amber-900">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
          Tips untuk Akurasi Ekstraksi Optimal:
        </p>
        <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
          <li>Dokumen dengan format tabel atau poin perbandingan akan diekstrak dengan tingkat akurasi tertinggi.</li>
          <li>Pastikan dokumen PDF bukan hasil scan foto murni tanpa lapisan teks.</li>
          <li>Kriteria pengeluaran otomatis dipetakan sebagai <strong>Cost</strong>, dan kriteria keunggulan dipetakan sebagai <strong>Benefit</strong>.</li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentDropzone;
