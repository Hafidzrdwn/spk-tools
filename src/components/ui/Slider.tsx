import React, { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  valueDisplay?: string | React.ReactNode;
  ticks?: { value: number; label: string }[];
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, value, onChange, min = 1, max = 9, step = 1, valueDisplay, ticks, disabled, ...props }, ref) => {
    return (
      <div className={cn('w-full space-y-2', className)}>
        {(label || valueDisplay !== undefined) && (
          <div className="flex items-center justify-between text-xs">
            {label && <span className="font-semibold text-slate-700">{label}</span>}
            <span className="font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {valueDisplay ?? value}
            </span>
          </div>
        )}

        <div className="relative flex items-center py-1">
          <input
            type="range"
            ref={ref}
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className={cn(
              'w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent-primary',
              'focus:outline-none focus:ring-2 focus:ring-accent-primary/20',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            {...props}
          />
        </div>

        {ticks && ticks.length > 0 && (
          <div className="flex justify-between px-0.5 text-[10px] font-mono text-slate-400 select-none">
            {ticks.map((t) => (
              <span
                key={t.value}
                onClick={() => !disabled && onChange(t.value)}
                className={cn('cursor-pointer hover:text-slate-700', t.value === value && 'font-bold text-accent-primary')}
              >
                {t.label}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';
export default Slider;
