import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, BookOpen, Compass, Sparkles, CheckCircle2, Circle } from 'lucide-react';
import { useTourStore } from '@/store/useTourStore';
import { useUiStore } from '@/store/useUiStore';
import { useProjectStore } from '@/store/useProjectStore';
import { setCriteriaBaseline } from '@/core/tour/generalTourSteps';

const METHOD_TOURS = [
  { id: 'saw', label: 'Tour Mendalam: SAW', methodTab: 'SAW' },
  { id: 'wp', label: 'Tour Mendalam: WP', methodTab: 'WP' },
  { id: 'topsis', label: 'Tour Mendalam: TOPSIS', methodTab: 'TOPSIS' },
  { id: 'ahp', label: 'Tour Mendalam: AHP', methodTab: 'AHP' },
  { id: 'story', label: 'Tour: Story-to-Matrix', methodTab: 'AUTO' },
] as const;

export const TourLauncherMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const startTour = useTourStore((s) => s.startTour);
  const completedTours = useTourStore((s) => s.completedTours);
  const openWelcome = useUiStore((s) => s.openWelcome);
  const openGlossary = useUiStore((s) => s.openGlossary);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleStartGeneralTour = () => {
    setCriteriaBaseline(useProjectStore.getState().criteria.length);
    startTour('general');
    setIsOpen(false);
  };

  const handleStartMethodTour = (tourId: string) => {
    startTour(tourId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        data-tour-id="help-launcher"
        title="Buka Menu Bantuan & Panduan Tour SPK"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-accent-primary text-xs font-medium transition-all shadow-2xs cursor-pointer"
      >
        <HelpCircle className="w-3.5 h-3.5 text-accent-primary" />
        <span>Bantuan</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200/90 shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-900 block">Pusat Bantuan SPK</span>
            <span className="text-[10px] text-slate-400 block">Panduan interaktif & materi belajar</span>
          </div>

          <button
            type="button"
            onClick={() => {
              openWelcome();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="font-medium">Buka Panduan Umum</span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleStartGeneralTour}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-accent-primary shrink-0" />
              <span className="font-medium">Tour Fitur Umum</span>
            </div>
            {completedTours['general'] ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Selesai
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full">
                <Circle className="w-2.5 h-2.5 text-slate-300" /> Belum
              </span>
            )}
          </button>

          <div className="pt-1 border-t border-slate-100">
            <span className="px-3 py-1 text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
              Tour Metode
            </span>
            {METHOD_TOURS.map((t) => {
              const isCompleted = completedTours[t.id];
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleStartMethodTour(t.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <span className="font-medium">{t.label}</span>
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Selesai
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full">
                      <Circle className="w-2.5 h-2.5 text-slate-300" /> Belum
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                openGlossary();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="font-medium">Buka Glosarium</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourLauncherMenu;
