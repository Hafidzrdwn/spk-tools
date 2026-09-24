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
    <div className="flex items-center justify-between p-2 bg-slate-100/90 rounded-card border border-slate-200/80">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onSwitchToStory}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-control transition-all cursor-pointer ${
            mode === 'story'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-accent-primary" />
          <span>Mode Cerita (Teks Narasi)</span>
        </button>

        <button
          type="button"
          onClick={onSwitchToForm}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-control transition-all cursor-pointer ${
            mode === 'form'
              ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
          }`}
        >
          <TableProperties className="w-3.5 h-3.5 text-accent-primary" />
          <span>Mode Form (Pratinjau Matriks)</span>
        </button>
      </div>

      <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-mono pr-2">
        <ArrowLeftRight className="w-3 h-3 text-slate-400" />
        <span>Konversi Dua Arah Reaktif</span>
      </div>
    </div>
  );
};

export default ModeSwitcher;
