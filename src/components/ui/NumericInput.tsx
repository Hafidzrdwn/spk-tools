import React, { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface NumericInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  error?: string;
  value?: number | string;
  onChange?: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
  ({ className, label, error, value, onChange, min, max, step = 1, disabled, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseFloat(e.target.value);
      if (onChange) {
        onChange(Number.isNaN(parsed) ? 0 : parsed);
      }
    };

    const handleStep = (increment: boolean) => {
      if (disabled) return;
      const current = typeof value === 'number' ? value : parseFloat(value as string) || 0;
      const delta = increment ? step : -step;
      let next = current + delta;
      if (min !== undefined && next < min) next = min;
      if (max !== undefined && next > max) next = max;
      if (onChange) {
        onChange(Number(next.toFixed(4)));
      }
    };

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            type="number"
            ref={ref}
            value={value ?? ''}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={cn(
              'w-full pl-3 pr-14 py-2 font-mono text-sm bg-white border rounded-control transition-all duration-150',
              'text-slate-800 placeholder:text-slate-400',
              'border-slate-200/90 shadow-2xs hover:border-slate-300',
              'focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20',
              'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
              error && 'border-rose-400 focus:border-rose-500',
              className
            )}
            {...props}
          />
          <div className="absolute right-1 flex items-center space-x-0.5">
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              onClick={() => handleStep(false)}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded text-xs select-none disabled:opacity-40"
            >
              -
            </button>
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              onClick={() => handleStep(true)}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded text-xs select-none disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }
);

NumericInput.displayName = 'NumericInput';
export default NumericInput;
