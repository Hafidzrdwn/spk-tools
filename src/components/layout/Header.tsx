import React from 'react';
import { cn } from '@/utils/cn';
import Badge from '@/components/ui/Badge';
import Logo from './Logo';
import EditableProjectTitle from '@/features/project/EditableProjectTitle';
import GlossaryDrawer from '@/features/glossary/GlossaryDrawer';
import { BookOpen } from 'lucide-react';
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
  activeMethod = 'SAW',
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
        'sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-3',
        'transition-all duration-200',
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Identitas */}
        <div className="flex items-center gap-3">
          <Logo size="md" showWordmark />
          <div className="flex items-center gap-2 border-l border-slate-200/80 pl-3">
            <Badge variant="primary" size="sm">
              v1.0
            </Badge>
            <EditableProjectTitle
              initialTitle={title}
              onTitleChange={onTitleChange}
            />
          </div>
        </div>

        {/* Status Method & Aksi */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-full border border-slate-200/60">
            <span>Metode:</span>
            <span className="font-semibold text-slate-800">{activeMethod}</span>
          </div>

          <button
            type="button"
            onClick={() => openGlossary()}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Buka Glosarium Istilah SPK"
            aria-label="Buka Glosarium"
          >
            <BookOpen className="w-4 h-4" />
          </button>

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

