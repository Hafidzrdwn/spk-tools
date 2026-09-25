import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface DialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  showCloseButton?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  footer,
  initialFocusRef,
  className,
  showCloseButton = true,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) focusable[0].focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement.current) previousActiveElement.current.focus();
    };
  }, [isOpen, onOpenChange, initialFocusRef]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        className={cn(
          'relative w-full max-w-md max-h-[90vh] rounded-2xl bg-white backdrop-blur-md border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col',
          'animate-in zoom-in-95 duration-150 my-auto',
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-4 shrink-0 border-b border-slate-100/60">
            <div className="space-y-1 flex-1">
              {title && (typeof title === 'string' ? <h3 className="text-base font-semibold text-slate-900 leading-snug">{title}</h3> : title)}
              {description && (typeof description === 'string' ? <p className="text-xs text-slate-500 leading-relaxed">{description}</p> : description)}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer -mr-1 shrink-0"
                aria-label="Tutup dialog"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        {children && <div className="px-6 py-4 text-sm text-slate-600 overflow-y-auto flex-1 min-h-0">{children}</div>}

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Dialog;
