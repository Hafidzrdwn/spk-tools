import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button';
import ResetConfirmDialog from './ResetConfirmDialog';
import { useProjectStore } from '@/store/useProjectStore';
import { cn } from '@/utils/cn';

export interface ResetProjectButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ResetProjectButton: React.FC<ResetProjectButtonProps> = ({
  className,
  size = 'sm',
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const resetProject = useProjectStore((s) => s.resetProject);

  return (
    <>
      <Button
        variant="secondary"
        size={size}
        onClick={() => setIsDialogOpen(true)}
        data-tour-id="reset-project-btn"
        className={cn(
          'h-9 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200/90 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0',
          className
        )}
        title="Reset seluruh data proyek ke kondisi awal kosong"
      >
        <RotateCcw className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-600 shrink-0" />
        <span className="hidden sm:inline">Reset Proyek</span>
        <span className="sm:hidden">Reset</span>
      </Button>

      <ResetConfirmDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={resetProject}
      />
    </>
  );
};

export default ResetProjectButton;
