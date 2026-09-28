import React from 'react';
import { useUiStore } from '@/store/useUiStore';
import { cn } from '@/utils/cn';

export interface DecimalFormatToggleProps {
  className?: string;
  size?: 'sm' | 'xs';
}

export const DecimalFormatToggle: React.FC<DecimalFormatToggleProps> = ({
  className,
  size = 'sm',
}) => {
  const numberFormat = useUiStore((s) => s.numberFormat);
  const setNumberFormat = useUiStore((s) => s.setNumberFormat);

  const isComma = numberFormat === 'comma';
  const isXs = size === 'xs';

  return (
    <div
      data-tour-id="decimal-format-toggle"
      className={cn(
        'inline-flex items-center rounded-lg bg-slate-100/90 p-0.5 border border-slate-200/90 shadow-2xs',
        isXs ? 'text-[10px]' : 'text-xs',
        className
      )}
      title="Format Pemisah Desimal: Koma (Indonesia) vs Titik (Internasional)"
      role="group"
      aria-label="Pilihan format desimal"
    >
      <button
        type="button"
        onClick={() => setNumberFormat('comma')}
        className={cn(
          'font-mono rounded-md transition-all cursor-pointer font-medium',
          isXs ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]',
          isComma
            ? 'bg-white text-accent-primary font-bold shadow-xs border border-slate-200/60'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/40'
        )}
        title="Format Koma (Indonesia): Contoh 3,14"
      >
        0,00 (ID)
      </button>
      <button
        type="button"
        onClick={() => setNumberFormat('dot')}
        className={cn(
          'font-mono rounded-md transition-all cursor-pointer font-medium',
          isXs ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]',
          !isComma
            ? 'bg-white text-accent-primary font-bold shadow-xs border border-slate-200/60'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/40'
        )}
        title="Format Titik (Internasional): Contoh 3.14"
      >
        0.00 (EN)
      </button>
    </div>
  );
};

export default DecimalFormatToggle;
