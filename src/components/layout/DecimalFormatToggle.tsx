import React from 'react';
import { useUiStore } from '@/store/useUiStore';
import Button from '@/components/ui/Button';

export const DecimalFormatToggle: React.FC = () => {
  const numberFormat = useUiStore((s) => s.numberFormat);
  const toggleNumberFormat = useUiStore((s) => s.toggleNumberFormat);

  const isComma = numberFormat === 'comma';

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={toggleNumberFormat}
      data-tour-id="decimal-format-toggle"
      title={`Format Desimal: ${isComma ? 'Koma (Indonesia: 3,14)' : 'Titik (Internasional: 3.14)'} — Klik untuk mengganti`}
      aria-label={`Ubah format desimal ke ${isComma ? 'titik' : 'koma'}`}
      className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 text-slate-700 hover:text-accent-primary cursor-pointer border border-slate-200/90 shadow-2xs"
    >
      <span className="text-[11px] font-semibold text-slate-500 font-sans hidden sm:inline">Desimal:</span>
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-50/80 text-accent-primary font-bold text-[11px]">
        {isComma ? '0,00 (ID)' : '0.00 (EN)'}
      </span>
    </Button>
  );
};

export default DecimalFormatToggle;
