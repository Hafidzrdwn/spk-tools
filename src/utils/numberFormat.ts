import { useCallback } from 'react';
import { useUiStore } from '@/store/useUiStore';

export type NumberSeparator = 'comma' | 'dot';

export interface FormatNumberOptions {
  decimals?: number;
  separator?: NumberSeparator;
  trimTrailingZeros?: boolean;
}

export function formatDisplayNumber(
  val: number | null | undefined,
  options?: FormatNumberOptions
): string {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
    return '0';
  }

  const separator = options?.separator ?? 'comma';
  const maxDecimals = options?.decimals ?? 4;
  const trimTrailingZeros = options?.trimTrailingZeros ?? true;

  if (Math.abs(val - Math.round(val)) < 1e-9) {
    return Math.round(val).toString();
  }

  let fixedStr = val.toFixed(maxDecimals);

  if (trimTrailingZeros) {
    fixedStr = fixedStr.replace(/\.?0+$/, '');
  }

  if (!fixedStr.includes('.')) {
    return fixedStr;
  }

  if (separator === 'comma') {
    fixedStr = fixedStr.replace('.', ',');
  }

  return fixedStr;
}

export type NumberFormatterFn = (
  val: number | null | undefined,
  decimals?: number,
  trimTrailingZeros?: boolean
) => string;

export interface NumberFormatterHook extends NumberFormatterFn {
  formatNumber: NumberFormatterFn;
  numberFormat: NumberSeparator;
}

export function useNumberFormatter(): NumberFormatterHook {
  const numberFormat = useUiStore((s) => s.numberFormat);

  const fn = useCallback(
    (val: number | null | undefined, decimals = 4, trimTrailingZeros = true) => {
      return formatDisplayNumber(val, {
        separator: numberFormat,
        decimals,
        trimTrailingZeros,
      });
    },
    [numberFormat]
  );

  return Object.assign(fn, {
    formatNumber: fn,
    numberFormat,
  });
}

export default formatDisplayNumber;
