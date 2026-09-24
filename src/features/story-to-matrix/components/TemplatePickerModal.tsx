import React from 'react';
import type { ParserCasePreset } from '@/core/parser';
import Badge from '@/components/ui/Badge';
import { Sparkles, ArrowRight, X } from 'lucide-react';

export interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (preset: ParserCasePreset) => void;
  presets: ParserCasePreset[];
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  presets,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-accent-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pilih Contoh Studi Kasus</h3>
              <p className="text-xs text-slate-500">Klik salah satu template untuk langsung mengisi textarea narasi</p>
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

        <div className="p-6 overflow-y-auto space-y-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              className="w-full text-left p-4 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-300 hover:bg-indigo-50/20 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-accent-primary transition-colors">
                    {preset.name}
                  </span>
                  <Badge variant="primary" size="sm">
                    {preset.category}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {preset.description}
                </p>
                <div className="text-[10px] text-slate-400 font-mono">
                  {preset.state.alternatives.length} Alternatif &bull; {preset.state.criteria.length} Kriteria
                </div>
              </div>

              <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-accent-primary group-hover:text-white flex items-center justify-center text-slate-400 shrink-0 transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplatePickerModal;
