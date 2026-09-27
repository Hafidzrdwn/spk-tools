import React, { forwardRef, useState, useEffect, useRef, type InputHTMLAttributes } from 'react';
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
  ({ className, label, error, value, onChange, min, max, disabled, onBlur, ...props }, ref) => {
    // Local text state allows empty string when user deletes without reverting to '0'
    const [localText, setLocalText] = useState<string>(() => (value !== undefined && value !== null ? String(value) : ''));
    const isFocusedRef = useRef(false);

    useEffect(() => {
      // Sync from outside when not actively typing or if numeric values diverge
      if (!isFocusedRef.current) {
        setLocalText(value !== undefined && value !== null ? String(value) : '');
      } else {
        const numVal = typeof value === 'number' ? value : parseFloat(String(value));
        const numLocal = parseFloat(localText.replace(',', '.'));
        if (Number.isFinite(numVal) && (!Number.isFinite(numLocal) || Math.abs(numVal - numLocal) > 1e-6)) {
          setLocalText(String(value));
        }
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setLocalText(raw);

      if (raw.trim() === '') {
        // User deleted everything; notify parent with 0 or min without forcing input text to '0'
        if (onChange) {
          onChange(min !== undefined ? min : 0);
        }
        return;
      }

      // Convert comma to period for Indonesian / continental decimal support, strip %
      const normalized = raw.replace(',', '.').replace('%', '').trim();
      const parsed = parseFloat(normalized);
      if (Number.isFinite(parsed) && onChange) {
        onChange(parsed);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = true;
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = false;
      const normalized = localText.trim().replace(',', '.').replace('%', '').trim();
      let parsed = parseFloat(normalized);

      if (!Number.isFinite(parsed) || normalized === '') {
        parsed = min !== undefined ? min : 0;
        setLocalText(String(parsed));
        if (onChange) onChange(parsed);
      } else {
        if (min !== undefined && parsed < min) parsed = min;
        if (max !== undefined && parsed > max) parsed = max;
        setLocalText(String(parsed));
        if (onChange) onChange(parsed);
      }

      onBlur?.(e);
    };

    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <input
          type="text"
          inputMode="decimal"
          ref={ref}
          value={localText}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-1.5 font-mono text-xs sm:text-sm bg-white border rounded-control transition-all duration-150',
            'text-slate-800 placeholder:text-slate-400',
            'border-slate-200/90 shadow-2xs hover:border-slate-300',
            'focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20',
            'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
            error && 'border-rose-400 focus:border-rose-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }
);

NumericInput.displayName = 'NumericInput';
export default NumericInput;
