import React from 'react';
import { CASE_TEMPLATES, type CaseTemplate } from '@/core/constants/caseTemplates';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Sparkles, X, Check, ArrowRight } from 'lucide-react';

export interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: CaseTemplate) => void;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-accent-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pilih Template Studi Kasus</h3>
              <p className="text-xs text-slate-500">Pilih salah satu skenario untuk langsung mencoba kalkulasi SPK</p>
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

        {/* Template List */}
        <div className="p-6 overflow-y-auto space-y-3.5 divide-y divide-slate-100">
          {CASE_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="pt-3.5 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/70 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all group"
            >
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 group-hover:text-accent-primary transition-colors">
                    {tpl.name}
                  </span>
                  <Badge variant="primary" size="sm">
                    {tpl.badge}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {tpl.description}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                    {tpl.dimension}
                  </span>
                  <span>•</span>
                  <span>{tpl.state.criteria.length} Kriteria</span>
                  <span>•</span>
                  <span>{tpl.state.alternatives.length} Alternatif</span>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="shrink-0 group-hover:bg-accent-primary group-hover:text-white transition-all"
                onClick={() => {
                  onSelect(tpl);
                  onClose();
                }}
              >
                <span>Muat Kasus</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
          <span>Data dapat disesuaikan kembali setelah dimuat.</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelectorModal;
