import React from 'react';
import { cn } from '@/utils/cn';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Logo from './Logo';
import EditableProjectTitle from '@/features/project/EditableProjectTitle';
import GlossaryDrawer from '@/features/glossary/GlossaryDrawer';
import TourLauncherMenu from '@/features/tour/TourLauncherMenu';
import { BookOpen, Home, Star, LayoutDashboard, BarChart3 } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import type { MethodId } from '@/types/domain';

export interface HeaderProps {
  title?: string;
  activeMethod?: MethodId;
  onTitleChange?: (newTitle: string) => void;
  actions?: React.ReactNode;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Proyek SPK Baru',
  activeMethod: _activeMethod = 'SAW',
  onTitleChange,
  actions,
  className,
}) => {
  const currentView = useUiStore((s) => s.currentView);
  const setCurrentView = useUiStore((s) => s.setCurrentView);
  const isGlossaryOpen = useUiStore((s) => s.isGlossaryOpen);
  const glossaryTargetTerm = useUiStore((s) => s.glossaryTargetTerm);
  const openGlossary = useUiStore((s) => s.openGlossary);
  const closeGlossary = useUiStore((s) => s.closeGlossary);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-3',
        'transition-all duration-200',
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Identitas */}
        <div className="flex items-center gap-3">
          <h1 className="m-0 p-0 text-inherit font-inherit inline-flex items-center cursor-pointer" onClick={() => setCurrentView('landing')}>
            <Logo size="md" showWordmark />
          </h1>
          <div className="flex items-center gap-2 border-l border-slate-200/80 pl-3">
            <Badge variant="primary" size="sm" className="font-bold">
              v1.1
            </Badge>
            <EditableProjectTitle
              initialTitle={title}
              onTitleChange={onTitleChange}
            />
          </div>
        </div>

        {/* View Navigation Switcher */}
        <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100/90 rounded-lg border border-slate-200/80 text-xs">
          <button
            type="button"
            onClick={() => setCurrentView('landing')}
            className={cn(
              'px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer',
              currentView === 'landing'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            )}
            title="Halaman Depan (Landing Page)"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('board')}
            className={cn(
              'px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer',
              currentView === 'board'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            )}
            title="Workboard Perhitungan SPK"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-accent-primary" />
            <span>Workboard</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('review')}
            className={cn(
              'px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer',
              currentView === 'review'
                ? 'bg-white text-amber-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            )}
            title="Ulasan & Masukan Pengguna"
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>Review</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('analytics')}
            className={cn(
              'px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 cursor-pointer',
              currentView === 'analytics'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            )}
            title="Statistik Web & Pengunjung"
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Analitik</span>
          </button>
        </div>

        {/* Status Method & Aksi */}
        <div className="flex items-center gap-2">
          {/* Quick Nav for mobile/tablet */}
          <div className="lg:hidden flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentView('review')}
              className={cn(
                'p-1.5 rounded-lg border text-xs',
                currentView === 'review'
                  ? 'border-amber-300 bg-amber-50 text-amber-700'
                  : 'border-slate-200 text-slate-600 bg-white hover:text-amber-600'
              )}
              title="Review Pengguna"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('analytics')}
              className={cn(
                'p-1.5 rounded-lg border text-xs',
                currentView === 'analytics'
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 bg-white hover:text-indigo-600'
              )}
              title="Web Analytics"
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
            </button>
          </div>

          <TourLauncherMenu />

          <Button
            variant="secondary"
            size="sm"
            onClick={() => openGlossary()}
            data-tour-id="glossary-btn"
            title="Buka Glosarium Istilah SPK (Definisi & Rumus)"
            aria-label="Buka Glosarium Istilah SPK"
            className="flex items-center gap-1.5 text-slate-700 hover:text-accent-primary"
          >
            <BookOpen className="w-3.5 h-3.5 text-accent-primary" />
            <span className="font-medium text-xs hidden sm:inline">Glosarium</span>
          </Button>

          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>

      <GlossaryDrawer
        isOpen={isGlossaryOpen}
        onClose={closeGlossary}
        targetTerm={glossaryTargetTerm}
      />
    </header>
  );
};

export default Header;

