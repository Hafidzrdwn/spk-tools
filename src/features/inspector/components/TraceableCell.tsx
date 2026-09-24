import React from 'react';
import { useUiStore } from '@/store/useUiStore';
import { cn } from '@/utils/cn';

export interface TraceableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  cellId: string;
  children: React.ReactNode;
  className?: string;
}

export const TraceableCell: React.FC<TraceableCellProps> = ({
  cellId,
  children,
  className,
  onMouseEnter,
  onMouseLeave,
  ...rest
}) => {
  const setHoveredCell = useUiStore((state) => state.setHoveredCell);
  const hoveredCellId = useUiStore((state) => state.hoveredCellId);
  const isHovered = hoveredCellId === cellId;

  const handleMouseEnter = (e: React.MouseEvent<HTMLTableCellElement>) => {
    setHoveredCell(cellId);
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLTableCellElement>) => {
    setHoveredCell(null);
    onMouseLeave?.(e);
  };

  return (
    <td
      data-cell-id={cellId}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'transition-all duration-150 relative cursor-help',
        isHovered && 'bg-indigo-50/80 ring-1 ring-accent-primary/50',
        className
      )}
      {...rest}
    >
      {children}
    </td>
  );
};

export default TraceableCell;
