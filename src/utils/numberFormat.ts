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

export function isCurrencyUnit(unit?: string): boolean {
  if (!unit) return false;
  const lower = unit.trim().toLowerCase();
  return lower === 'rp' || lower === 'idr' || lower === 'rupiah' || lower === 'rp.' || lower === 'juta rp' || lower === 'ribu rp';
}

export function formatCurrency(val: number | string | null | undefined): string {
  if (val === null || val === undefined) return 'Rp 0';
  const num = typeof val === 'number' ? val : Number(String(val).replace(/[^\d.-]/g, ''));
  if (isNaN(num) || !isFinite(num)) return 'Rp 0';

  if (Math.abs(num - Math.round(num)) < 1e-9) {
    return `Rp ${Math.round(num).toLocaleString('id-ID')}`;
  }
  return `Rp ${num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatValueWithUnit(
  val: number | null | undefined,
  unit?: string,
  options?: FormatNumberOptions
): string {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
    return '0';
  }

  if (isCurrencyUnit(unit)) {
    return formatCurrency(val);
  }

  const cleanUnit = unit?.trim();
  if (cleanUnit === '%') {
    return `${formatDisplayNumber(val, options)}%`;
  }

  if (val >= 1000 && Math.abs(val - Math.round(val)) < 1e-9) {
    return `${Math.round(val).toLocaleString('id-ID')}${cleanUnit ? ` ${cleanUnit}` : ''}`;
  }

  return `${formatDisplayNumber(val, options)}${cleanUnit ? ` ${cleanUnit}` : ''}`;
}

export function formatCurrencyInNarrative(text: string): string {
  if (!text) return '';

  let res = text;

  res = res.replace(/(\d{1,3}(?:\.\d{3})*(?:,\d+)?|\d+)\s*(?:rp\.?|idr|rupiah)\b/gi, (_, rawDigits) => {
    const cleanNum = Number(rawDigits.replace(/\./g, '').replace(',', '.'));
    if (!isNaN(cleanNum) && isFinite(cleanNum)) {
      return formatCurrency(cleanNum);
    }
    return rawDigits;
  });

  res = res.replace(/\b(?:rp\.?|idr)\s*(\d{4,})(?!\d*[.,]\d{3})\b/gi, (_, rawDigits) => {
    const cleanNum = Number(rawDigits);
    if (!isNaN(cleanNum) && isFinite(cleanNum)) {
      return formatCurrency(cleanNum);
    }
    return `Rp ${rawDigits}`;
  });

  res = res.replace(/\b(?:rp\.?|idr)(\d)/gi, 'Rp $1');

  res = res.replace(
    /\b(anggaran|biaya|dana|pagu|modal|tarif|gaji|harga)\s+(?:sebesar\s+)?(\d{4,})\b(?!\s*(?:orang|peserta|unit|buah|kali|hari|bulan|tahun|%))/gi,
    (_, keyword, rawDigits) => {
      const cleanNum = Number(rawDigits);
      if (!isNaN(cleanNum) && isFinite(cleanNum)) {
        return `${keyword} sebesar ${formatCurrency(cleanNum)}`;
      }
      return `${keyword} ${rawDigits}`;
    }
  );

  res = res.replace(/Rp\s+Rp\s+/g, 'Rp ');

  return res;
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
