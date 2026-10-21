import React from 'react';
import { AlertTriangle, KeyRound, RefreshCw, FileSearch, Sparkles, HelpCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { DocumentLoaderError } from '@/services/ai';

export interface DocumentErrorStateProps {
  error: DocumentLoaderError;
  onRetry: () => void;
  onChooseOther: () => void;
  onUseDemo: () => void;
  onConfigureApiKey?: () => void;
}

export const DocumentErrorState: React.FC<DocumentErrorStateProps> = ({
  error,
  onRetry,
  onChooseOther,
  onUseDemo,
  onConfigureApiKey,
}) => {
  const isKeyError = error.code === 'API_KEY_MISSING';

  return (
    <div className="py-6 px-4 space-y-5 max-w-lg mx-auto text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-100/80 border border-rose-200/80 flex items-center justify-center text-rose-600 mx-auto shadow-xs">
        {isKeyError ? <KeyRound className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-center gap-2">
          <Badge variant="cost" size="sm" className="font-mono text-[10px] tracking-wider uppercase">
            {error.code}
          </Badge>
        </div>
        <h4 className="text-base sm:text-lg font-bold text-slate-900">
          {error.message}
        </h4>
        {error.details && (
          <p className="text-xs font-mono text-slate-500 bg-slate-100 p-2 rounded-lg break-all max-h-20 overflow-y-auto">
            {error.details}
          </p>
        )}
      </div>

      {error.suggestion && (
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-left space-y-1 text-xs text-amber-900">
          <span className="font-bold flex items-center gap-1.5 text-amber-950">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            Saran Perbaikan:
          </span>
          <p className="text-slate-600 leading-relaxed pl-5">{error.suggestion}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
        {isKeyError && onConfigureApiKey ? (
          <Button
            variant="primary"
            size="sm"
            onClick={onConfigureApiKey}
            className="w-full sm:w-auto h-9 px-4 text-xs font-semibold gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Atur Kunci Gemini API
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={onRetry}
            className="w-full sm:w-auto h-9 px-4 text-xs font-semibold gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Coba Ekstrak Ulang
          </Button>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={onChooseOther}
          className="w-full sm:w-auto h-9 px-4 text-xs font-semibold gap-1.5 border-slate-200"
        >
          <FileSearch className="w-3.5 h-3.5 text-slate-500" />
          Pilih Berkas Lain
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onUseDemo}
          className="w-full sm:w-auto h-9 px-3.5 text-xs font-semibold gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/60"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Gunakan Demo
        </Button>
      </div>
    </div>
  );
};

export default DocumentErrorState;
