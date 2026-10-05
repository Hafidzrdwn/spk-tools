import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Logo from './Logo';
import EditableProjectTitle from '@/features/project/EditableProjectTitle';
import GlossaryDrawer from '@/features/glossary/GlossaryDrawer';
import TourLauncherMenu from '@/features/tour/TourLauncherMenu';
import { BookOpen } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import { prefetchRoute } from '@/services/routePrefetch';
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
  const isGlossaryOpen = useUiStore((s) => s.isGlossaryOpen);
  const glossaryTargetTerm = useUiStore((s) => s.glossaryTargetTerm);
  const openGlossary = useUiStore((s) => s.openGlossary);
  const closeGlossary = useUiStore((s) => s.closeGlossary);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2 sm:py-2.5',
        'transition-all duration-200',
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 md:gap-4">
        {/* Logo & Identitas */}
        <div className="flex items-center justify-between md:justify-start gap-2 sm:gap-3 shrink-0">
          <Link
            to="/"
            onMouseEnter={prefetchRoute.landing}
            onFocus={prefetchRoute.landing}
            className="m-0 p-0 text-inherit font-inherit inline-flex items-center cursor-pointer min-h-9"
            title="Kembali ke Beranda (Landing Page)"
          >
            <Logo size="sm" showWordmark className="sm:hidden" />
            <Logo size="md" showWordmark className="hidden sm:flex" />
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2 border-l border-slate-200/80 pl-2 sm:pl-3 min-w-0">
            <Badge variant="primary" size="sm" className="font-bold text-[10px] py-0 px-1.5 hidden md:inline-flex shrink-0">
              v1.1
            </Badge>
            <EditableProjectTitle
              initialTitle={title}
              onTitleChange={onTitleChange}
            />
          </div>
        </div>

        {/* Status Method & Aksi */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2">
          {/* Support Actions: Bantuan & Glosarium */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-2">
            <TourLauncherMenu />

            <Button
              variant="secondary"
              size="sm"
              onClick={() => openGlossary()}
              data-tour-id="glossary-btn"
              title="Buka Glosarium Istilah SPK (Definisi & Rumus)"
              aria-label="Buka Glosarium Istilah SPK"
              className="h-9 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 hover:text-accent-primary shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-accent-primary shrink-0" />
              <span>Glosarium</span>
            </Button>
          </div>

          {/* Project Operations */}
          {actions && <div className="flex items-center gap-1.5 sm:gap-2">{actions}</div>}
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

