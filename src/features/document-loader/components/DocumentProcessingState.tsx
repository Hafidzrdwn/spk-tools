import React from 'react';
import { Loader2, FileText, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export interface DocumentProcessingStateProps {
  fileName: string;
  fileSize: number;
  currentStepIndex: number;
  modelUsed?: string;
}

const STEPS = [
  {
    title: 'Membaca & Memproses Berkas',
    desc: 'Mengekstrak teks mentah, tabel, dan metadata dokumen lokal.',
  },
  {
    title: 'Analisis Semantik AI (Gemini Flash)',
    desc: 'Mengidentifikasi kriteria, alternatif, dan klasifikasi Benefit/Cost.',
  },
  {
    title: 'Validasi Integritas Matriks SPK',
    desc: 'Memverifikasi kelengkapan sel numerik dan menstandarkan bobot.',
  },
];

export const DocumentProcessingState: React.FC<DocumentProcessingStateProps> = ({
  fileName,
  fileSize,
  currentStepIndex,
  modelUsed = 'Gemini 3.8 Flash',
}) => {
  const sizeKb = (fileSize / 1024).toFixed(1);

  return (
    <div className="py-8 px-4 flex flex-col items-center justify-center space-y-6 max-w-lg mx-auto text-center select-none">
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-linear-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 animate-pulse">
          <Sparkles className="w-10 h-10 animate-spin-slow" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-accent-primary animate-spin" />
        </div>
      </div>

      <div className="space-y-1.5">
        <h4 className="text-base sm:text-lg font-bold text-slate-900">
          Sedang Mengekstrak Matriks Keputusan...
        </h4>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <FileText className="w-3.5 h-3.5 text-accent-primary shrink-0" />
          <span className="font-medium text-slate-700 max-w-50 sm:max-w-xs truncate">{fileName}</span>
          <span>•</span>
          <span className="font-mono">{sizeKb} KB</span>
        </div>
      </div>

      <div className="w-full space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 text-left">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step.title}
              className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                isCurrent
                  ? 'bg-white shadow-xs border border-indigo-200/70'
                  : isDone
                  ? 'opacity-80'
                  : 'opacity-40'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-accent-primary animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                )}
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <p
                  className={`text-xs font-bold ${
                    isCurrent ? 'text-accent-primary' : isDone ? 'text-slate-800' : 'text-slate-500'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 w-full px-2 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Keamanan & Validasi Layer Evaluasi
        </span>
        <Badge variant="primary" size="sm" className="font-mono text-[10px] py-0 px-2">
          {modelUsed}
        </Badge>
      </div>
    </div>
  );
};

export default DocumentProcessingState;
