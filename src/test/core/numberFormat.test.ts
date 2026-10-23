import { describe, it, expect } from 'vitest';
import {
  formatDisplayNumber,
  formatCurrency,
  formatValueWithUnit,
  formatCurrencyInNarrative,
} from '@/utils/numberFormat';

describe('formatDisplayNumber Utility', () => {
  describe('Pembersihan Bilangan Bulat Penuh Nol (Trailing Zeros Trimming)', () => {
    it('harus menghilangkan koma dan desimal sepenuhnya jika angka adalah bilangan bulat murni', () => {
      expect(formatDisplayNumber(3)).toBe('3');
      expect(formatDisplayNumber(3.0)).toBe('3');
      expect(formatDisplayNumber(3.0000)).toBe('3');
      expect(formatDisplayNumber(1.0000)).toBe('1');
      expect(formatDisplayNumber(100.0000)).toBe('100');
      expect(formatDisplayNumber(0.0000)).toBe('0');
      expect(formatDisplayNumber(-5.0000)).toBe('-5');
    });

    it('harus mempertahankan digit desimal jika terdapat angka bermakna bukan nol (misal 3.0400)', () => {
      expect(formatDisplayNumber(3.0400, { separator: 'comma' })).toBe('3,04');
      expect(formatDisplayNumber(3.0400, { separator: 'dot' })).toBe('3.04');
      expect(formatDisplayNumber(3.0040, { separator: 'comma' })).toBe('3,004');
      expect(formatDisplayNumber(0.1174, { separator: 'comma' })).toBe('0,1174');
      expect(formatDisplayNumber(0.1174, { separator: 'dot' })).toBe('0.1174');
      expect(formatDisplayNumber(3.1362, { separator: 'comma' })).toBe('3,1362');
    });
  });

  describe('Dukungan Pemisah Desimal (Koma vs Titik)', () => {
    it('harus menggunakan koma "," secara default (standar Indonesia)', () => {
      expect(formatDisplayNumber(3.14)).toBe('3,14');
      expect(formatDisplayNumber(0.5)).toBe('0,5');
      expect(formatDisplayNumber(0.703)).toBe('0,703');
    });

    it('harus menggunakan titik "." ketika separator disetel ke "dot"', () => {
      expect(formatDisplayNumber(3.14, { separator: 'dot' })).toBe('3.14');
      expect(formatDisplayNumber(0.5, { separator: 'dot' })).toBe('0.5');
      expect(formatDisplayNumber(0.703, { separator: 'dot' })).toBe('0.703');
    });
  });

  describe('Penanganan Kasus Tepi (Edge Cases)', () => {
    it('harus mengembalikan "0" untuk null, undefined, atau NaN tanpa melempar error', () => {
      expect(formatDisplayNumber(null)).toBe('0');
      expect(formatDisplayNumber(undefined)).toBe('0');
      expect(formatDisplayNumber(NaN)).toBe('0');
      expect(formatDisplayNumber(Infinity)).toBe('0');
    });

    it('harus menangani angka negatif dengan benar', () => {
      expect(formatDisplayNumber(-2.5, { separator: 'comma' })).toBe('-2,5');
      expect(formatDisplayNumber(-2.5, { separator: 'dot' })).toBe('-2.5');
      expect(formatDisplayNumber(-2.0, { separator: 'comma' })).toBe('-2');
    });
  });

  describe('Format Mata Uang & Normalisasi Nominal Narasi', () => {
    it('formatCurrency memformat nominal ke standar Rupiah Indonesia', () => {
      expect(formatCurrency(2500000)).toBe('Rp 2.500.000');
      expect(formatCurrency(15000000)).toBe('Rp 15.000.000');
      expect(formatCurrency(0)).toBe('Rp 0');
      expect(formatCurrency(null)).toBe('Rp 0');
    });

    it('formatValueWithUnit memformat nilai sesuai satuan kriteria', () => {
      expect(formatValueWithUnit(2500000, 'Rp')).toBe('Rp 2.500.000');
      expect(formatValueWithUnit(15000000, 'IDR')).toBe('Rp 15.000.000');
      expect(formatValueWithUnit(200, 'Peserta')).toBe('200 Peserta');
      expect(formatValueWithUnit(2500, 'Peserta')).toBe('2.500 Peserta');
      expect(formatValueWithUnit(95, '%')).toBe('95%');
    });

    it('formatCurrencyInNarrative mengubah nominal mentah menjadi format rapi', () => {
      const sample = 'Beban efisiensi Biaya sebesar 2500000 Rp, sehingga memberikan rasio terbaik.';
      const res = formatCurrencyInNarrative(sample);
      expect(res).toBe('Beban efisiensi Biaya sebesar Rp 2.500.000, sehingga memberikan rasio terbaik.');

      const sample2 = 'HIMASIFO memiliki anggaran 15000000 dan target 200 peserta.';
      const res2 = formatCurrencyInNarrative(sample2);
      expect(res2).toBe('HIMASIFO memiliki anggaran sebesar Rp 15.000.000 dan target 200 peserta.');

      const sample3 = 'Usulan kegiatan dengan anggaran sebesar Rp15.000.000.';
      const res3 = formatCurrencyInNarrative(sample3);
      expect(res3).toBe('Usulan kegiatan dengan anggaran sebesar Rp 15.000.000.');
    });
  });
});
