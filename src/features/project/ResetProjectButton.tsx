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
        variant="ghost"
        size={size}
        onClick={() => setIsDialogOpen(true)}
        className={cn('text-slate-600 hover:text-slate-900', className)}
        title="Reset seluruh data proyek ke kondisi awal kosong"
      >
        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
        <span>Reset Proyek</span>
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
