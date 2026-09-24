import React, { useState, useRef, useLayoutEffect, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  closeDelay?: number;
  interactive?: boolean;
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const bridgeClasses: Record<string, string> = {
  top: "after:absolute after:top-full after:left-0 after:right-0 after:h-3 after:content-['']",
  bottom: "before:absolute before:bottom-full before:left-0 before:right-0 before:h-3 before:content-['']",
  left: "after:absolute after:left-full after:top-0 after:bottom-0 after:w-3 after:content-['']",
  right: "before:absolute before:right-full before:top-0 before:bottom-0 before:w-3 before:content-['']",
};

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className,
  closeDelay = 200,
  interactive = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [effectivePosition, setEffectivePosition] = useState(position);

  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(false), closeDelay);
  };

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const tr = triggerRef.current.getBoundingClientRect();
    if (tr.bottom < 0 || tr.top > window.innerHeight) {
      setIsVisible(false);
      return;
    }

    const tt = tooltipRef.current;
    const w = tt ? tt.offsetWidth : 280;
    const h = tt ? tt.offsetHeight : 100;
    const gap = 8, pad = 12;

    let pos = position;
    if (pos === 'top' && tr.top - h - gap < pad) pos = 'bottom';
    else if (pos === 'bottom' && tr.bottom + h + gap > window.innerHeight - pad) pos = 'top';
    else if (pos === 'left' && tr.left - w - gap < pad) pos = 'right';
    else if (pos === 'right' && tr.right + w + gap > window.innerWidth - pad) pos = 'left';

    let top = pos === 'top' ? tr.top - h - gap : pos === 'bottom' ? tr.bottom + gap : tr.top + (tr.height - h) / 2;
    let left = pos === 'left' ? tr.left - w - gap : pos === 'right' ? tr.right + gap : tr.left + (tr.width - w) / 2;

    setEffectivePosition(pos);
    setCoords({
      top: Math.max(pad, Math.min(window.innerHeight - h - pad, top)),
      left: Math.max(pad, Math.min(window.innerWidth - w - pad, left)),
    });
  };

  useIsomorphicLayoutEffect(() => {
    if (!isVisible) {
      setCoords(null);
      return;
    }
    updatePosition();
    const handler = () => updatePosition();
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, [isVisible, position, content]);

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
      >
        {children}
      </span>
      {isVisible && content && typeof document !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          role="tooltip"
          onMouseEnter={interactive ? handleMouseEnter : undefined}
          onMouseLeave={interactive ? handleMouseLeave : undefined}
          style={{
            position: 'fixed',
            top: coords ? `${coords.top}px` : '-9999px',
            left: coords ? `${coords.left}px` : '-9999px',
            opacity: coords ? 1 : 0,
          }}
          className={cn(
            'fixed z-9999 px-3 py-2 text-xs text-white bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/60 max-w-[calc(100vw-24px)] wrap-break-word',
            'transition-opacity duration-150',
            coords ? 'animate-in fade-in zoom-in-95' : 'pointer-events-none',
            interactive ? 'pointer-events-auto' : 'pointer-events-none',
            bridgeClasses[effectivePosition],
            className
          )}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;
