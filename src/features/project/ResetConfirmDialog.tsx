import React, { useRef } from 'react';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export interface ResetConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const ResetConfirmDialog: React.FC<ResetConfirmDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
}) => {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      initialFocusRef={cancelBtnRef}
      showCloseButton={true}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-cost flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Reset proyek ini?</h3>
        </div>
      }
      footer={
        <>
          <Button
            ref={cancelBtnRef}
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            variant="cost"
            size="sm"
            onClick={handleConfirm}
          >
            Ya, Reset
          </Button>
        </>
      }
    >
      <p className="text-xs text-slate-600 leading-relaxed">
        Semua kriteria, alternatif, dan hasil perhitungan akan dihapus dan tidak bisa dikembalikan.
      </p>
    </Dialog>
  );
};

export default ResetConfirmDialog;
