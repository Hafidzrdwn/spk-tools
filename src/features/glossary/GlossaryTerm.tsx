import React, { useMemo } from 'react';
import { GLOSSARY_TERMS, type GlossaryEntry } from '@/core/constants/glossaryTerms';
import Tooltip from '@/components/ui/Tooltip';
import { useUiStore } from '@/store/useUiStore';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface GlossaryTermProps {
  term: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const GlossaryTerm: React.FC<GlossaryTermProps> = ({
  term,
  children,
  position = 'top',
  className,
}) => {
  const openGlossary = useUiStore((s) => s.openGlossary);

  // Cari entri glosarium yang cocok dengan prop term
  const matchedEntry = useMemo<GlossaryEntry | null>(() => {
    const normalized = term.trim().toLowerCase();
    return (
      GLOSSARY_TERMS.find((entry) => {
        const entryTerm = entry.term.toLowerCase();
        return (
          entryTerm === normalized ||
          entryTerm.startsWith(normalized + ' ') ||
          entryTerm.startsWith(normalized + '(') ||
          (entry.symbol && entry.symbol.toLowerCase() === normalized)
        );
      }) ?? null
    );
  }, [term]);

  if (!matchedEntry) {
    return <span className={className}>{children}</span>;
  }

  const tooltipContent = (
    <div className="w-72 max-w-[90vw] space-y-2 p-1 text-left whitespace-normal select-none">
      <div className="flex items-center justify-between gap-2 border-b border-slate-700/70 pb-1.5">
        <span className="font-bold text-white text-xs tracking-tight">{matchedEntry.term}</span>
        {matchedEntry.symbol && (
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold border border-slate-700">
            {matchedEntry.symbol}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-300 leading-relaxed font-normal">
        {matchedEntry.definition}
      </p>
      <div className="pt-1 border-t border-slate-800/80 flex items-center justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openGlossary(matchedEntry.term);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer py-0.5 px-1 rounded hover:bg-slate-800/60"
        >
          <span>Lihat detail</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <Tooltip
      content={tooltipContent}
      position={position}
      interactive={true}
      closeDelay={200}
      className="p-2.5 shadow-2xl border border-slate-700/60 rounded-xl"
    >
      <span
        className={cn(
          'underline decoration-dotted decoration-slate-400 underline-offset-2 cursor-help inline-flex items-center',
          className
        )}
      >
        {children}
      </span>
    </Tooltip>
  );
};

export default GlossaryTerm;
