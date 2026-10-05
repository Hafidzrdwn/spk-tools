import React from 'react';
import { FileText, TableProperties, ArrowLeftRight } from 'lucide-react';

export interface ModeSwitcherProps {
  mode: 'story' | 'form';
  onSwitchToStory: () => void;
  onSwitchToForm: () => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({
  mode,
  onSwitchToStory,
  onSwitchToForm,
}) => {
  return (
    <div className="flex items-center justify-between p-1.5 sm:p-2 bg-slate-100/90 rounded-card border border-slate-200/80">
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 w-full sm:w-auto">
        <button
          type="button"
          onClick={onSwitchToStory}
          className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer min-h-9.5 ${
            mode === 'story'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-accent-primary shrink-0" />
          <span className="hidden sm:inline">Mode Cerita (Teks Narasi)</span>
          <span className="sm:hidden">Mode Cerita</span>
        </button>

        <button
          type="button"
          onClick={onSwitchToForm}
          className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer min-h-9.5 ${
            mode === 'form'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
          }`}
        >
          <TableProperties className="w-3.5 h-3.5 text-accent-primary shrink-0" />
          <span className="hidden sm:inline">Mode Form (Pratinjau Matriks)</span>
          <span className="sm:hidden">Pratinjau Matriks</span>
        </button>
      </div>

      <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 font-mono pr-2">
        <ArrowLeftRight className="w-3 h-3 text-slate-400" />
        <span>Konversi Dua Arah Reaktif</span>
      </div>
    </div>
  );
};

export default ModeSwitcher;
