import { useCallback } from 'react';
import { useUiStore } from '@/store/useUiStore';

export type NumberSeparator = 'comma' | 'dot';

export interface FormatNumberOptions {
  decimals?: number; // Jumlah digit desimal maksimum, default 4
  separator?: NumberSeparator; // 'comma' | 'dot', default 'comma'
  trimTrailingZeros?: boolean; // Hapus angka nol tak bermakna di belakang koma, default true
}

/**
 * Format angka numerik untuk tampilan antarmuka (UI):
 * 1. Jika angka adalah bilangan bulat murni (misal: 3, 3.0000, 1.0000), hilangkan koma dan desimal sepenuhnya (hasil: "3", "1").
 * 2. Jika angka memiliki digit desimal bermakna (misal: 3.04, 3.0400, 0.1174), pertahankan digit desimalnya (hasil: "3,04", "0,1174").
 * 3. Pemisah desimal disesuaikan dengan preferensi pengguna: 'comma' (Indonesia: ",") atau 'dot' (Internasional: ".").
 */
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

  // Cek apakah angka adalah bilangan bulat murni (misal: 3, 3.0000)
  if (Math.abs(val - Math.round(val)) < 1e-9) {
    return Math.round(val).toString();
  }

  // Format dengan jumlah digit desimal maksimum
  let fixedStr = val.toFixed(maxDecimals);

  if (trimTrailingZeros) {
    // Hilangkan trailing zeros yang tidak bermakna di belakang koma:
    // Contoh: "3.0400" -> "3.04", "1.0000" -> "1"
    fixedStr = fixedStr.replace(/\.?0+$/, '');
  }

  // Jika setelah pembersihan tidak ada pecahan, kembalikan sebagai integer
  if (!fixedStr.includes('.')) {
    return fixedStr;
  }

  // Ubah pemisah desimal sesuai preferensi
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

/**
 * Hook React untuk memformat angka secara reaktif mengikuti pengaturan `numberFormat` di useUiStore.
 * Mendukung baik pemanggilan langsung: `const formatNumber = useNumberFormatter();`
 * maupun destrukturisasi: `const { formatNumber, numberFormat } = useNumberFormatter();`
 */
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
