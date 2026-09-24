import React from 'react';
import type { DetectedComparison } from '@/core/parser';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Sliders, ArrowRight, X } from 'lucide-react';

export interface AhpPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  detectedComparisons: DetectedComparison[];
}

export const AhpPromptModal: React.FC<AhpPromptModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  detectedComparisons,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-accent-primary flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Perbandingan Relatif Terdeteksi</h3>
              <p className="text-xs text-slate-500">Pola Skala Saaty AHP ditemukan pada teks cerita</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">
              Preferensi yang Ditemukan:
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {detectedComparisons.map((c, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs flex items-center justify-between gap-2"
                >
                  <span className="font-medium text-slate-800 truncate">
                    &quot;{c.rawSentence}&quot;
                  </span>
                  <Badge variant="primary" size="sm" className="shrink-0 font-mono">
                    Skala {c.scale} ({c.intensityLabel})
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            Terdeteksi perbandingan kriteria berpasangan. Apakah Anda ingin diarahkan ke <strong>Tab AHP</strong> untuk melihat dan menyetel matriks resiprokal?
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Tetap di Sini
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onConfirm}
              className="text-xs font-semibold shadow-xs cursor-pointer"
            >
              <span>Arahkan ke Tab AHP</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AhpPromptModal;
