import React, { useState, useMemo, useEffect, useRef } from 'react';
import Drawer from '@/components/ui/Drawer';
import { GLOSSARY_TERMS, type GlossaryEntry } from '@/core/constants/glossaryTerms';
import Badge from '@/components/ui/Badge';
import { Search, BookOpen, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface GlossaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  targetTerm?: string | null;
}

export const GlossaryDrawer: React.FC<GlossaryDrawerProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  targetTerm,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [highlightedTerm, setHighlightedTerm] = useState<string | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 1. Urutkan istilah secara alfabetis di runtime menggunakan localeCompare
  const sortedTerms = useMemo(() => {
    return [...GLOSSARY_TERMS].sort((a, b) => a.term.localeCompare(b.term, 'id'));
  }, []);

  // Effect untuk scroll ke target term saat drawer dibuka dengan targetTerm
  useEffect(() => {
    if (!isOpen || !targetTerm) return;

    setSearchQuery('');
    setHighlightedTerm(targetTerm);

    const timer = setTimeout(() => {
      const el = itemRefs.current[targetTerm];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);

    const clearHighlightTimer = setTimeout(() => {
      setHighlightedTerm(null);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(clearHighlightTimer);
    };
  }, [isOpen, targetTerm]);

  // 2. Filter istilah berdasarkan query pencarian (term, definition, atau symbol)
  const filteredTerms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sortedTerms;
    return sortedTerms.filter(
      (item) =>
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        (item.symbol && item.symbol.toLowerCase().includes(q))
    );
  }, [sortedTerms, searchQuery]);

  // 3. Kelompokkan per huruf awal untuk sticky header abjad
  const groupedTerms = useMemo(() => {
    return filteredTerms.reduce<Record<string, GlossaryEntry[]>>((acc, item) => {
      const firstChar = item.term.charAt(0).toUpperCase();
      const letter = /^[A-Z]/.test(firstChar) ? firstChar : '#';
      if (!acc[letter]) acc[letter] = [];
      acc[letter].push(item);
      return acc;
    }, {});
  }, [filteredTerms]);

  const groupKeys = Object.keys(groupedTerms).sort((a, b) => a.localeCompare(b));

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent-primary" />
          <span>Glosarium Istilah SPK</span>
        </div>
      }
      description="Kamus definisi dan simbol teknis metode pengambilan keputusan"
    >
      {/* Search Input */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-20 backdrop-blur-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari istilah, simbol, atau definisi..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Term List */}
      <div className="divide-y divide-slate-100">
        {groupKeys.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-1">
            <p className="text-sm font-medium text-slate-600">Istilah tidak ditemukan</p>
            <p className="text-xs">Coba kata kunci pencarian yang lain.</p>
          </div>
        ) : (
          groupKeys.map((letter) => (
            <div key={letter}>
              <div className="sticky top-[57px] z-10 bg-slate-100/90 backdrop-blur-xs px-5 py-1 text-xs font-bold text-accent-primary border-y border-slate-200/60">
                {letter}
              </div>
              <div className="divide-y divide-slate-50">
                {groupedTerms[letter].map((entry) => {
                  const isHighlighted = highlightedTerm === entry.term;
                  return (
                    <div
                      key={entry.term}
                      ref={(el) => {
                        itemRefs.current[entry.term] = el;
                      }}
                      className={cn(
                        'px-5 py-3.5 transition-all duration-300',
                        isHighlighted
                          ? 'bg-indigo-50/80 ring-2 ring-inset ring-accent-primary/50'
                          : 'hover:bg-slate-50/80'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-800 tracking-tight">
                          {entry.term}
                        </span>
                        {entry.symbol && (
                          <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-indigo-50 text-accent-primary border border-indigo-100 font-semibold shrink-0">
                            {entry.symbol}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {entry.definition}
                      </p>
                      {entry.relatedTabs && entry.relatedTabs.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                          {entry.relatedTabs.map((tab) => (
                            <Badge key={tab} variant="outline" size="sm">
                              {tab}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </Drawer>
  );
};

export default GlossaryDrawer;
