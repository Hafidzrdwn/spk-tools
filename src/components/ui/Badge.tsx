import React, { type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'benefit' | 'cost' | 'primary' | 'secondary' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full border transition-colors select-none';

  const variants = {
    benefit: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-2xs',
    cost: 'bg-rose-50 text-rose-700 border-rose-200/80 shadow-2xs',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 shadow-2xs',
    secondary: 'bg-violet-50 text-violet-700 border-violet-200/80 shadow-2xs',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/80',
    outline: 'bg-transparent text-slate-600 border-slate-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};

export default Badge;
