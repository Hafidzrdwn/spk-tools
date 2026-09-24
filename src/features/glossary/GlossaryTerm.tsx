import React, { useMemo } from 'react';
import { GLOSSARY_TERMS, type GlossaryEntry } from '@/core/constants/glossaryTerms';
import Tooltip from '@/components/ui/Tooltip';
import { useUiStore } from '@/store/useUiStore';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface GlossaryTermProps {
  term: string;
  children: React.ReactNode;
  className?: string;
}

export const GlossaryTerm: React.FC<GlossaryTermProps> = ({
  term,
  children,
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
    <div className="space-y-1.5 p-0.5 text-left max-w-xs">
      <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-1">
        <span className="font-bold text-white tracking-tight">{matchedEntry.term}</span>
        {matchedEntry.symbol && (
          <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-slate-800 text-indigo-300">
            {matchedEntry.symbol}
          </span>
        )}
      </div>
      <p className="text-[11px] text-slate-200 leading-relaxed font-normal">
        {matchedEntry.definition}
      </p>
      <div className="pt-0.5">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openGlossary(matchedEntry.term);
          }}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 underline decoration-indigo-400/50 cursor-pointer transition-colors"
        >
          <span>Lihat detail</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  return (
    <Tooltip
      content={tooltipContent}
      position="top"
      className="pointer-events-auto max-w-xs whitespace-normal bg-slate-900 text-white p-2.5 z-50 shadow-xl border border-slate-700/50 rounded-lg"
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
