import { describe, it, expect } from 'vitest';
import {
  extractAlternativesFromText,
  detectComparisonsFromText,
  PARSER_CASE_PRESETS,
} from '@/core/parser';
import type { Criterion } from '@/types/domain';

describe('Story-to-Matrix Parser (Pure Logic)', () => {
  const mockCriteria: Criterion[] = [
    { id: 'c_test', name: 'Nilai Tes', type: 'BENEFIT', weight: 40, normalizedWeight: 0.4 },
    { id: 'c_exp', name: 'Pengalaman', type: 'BENEFIT', weight: 30, normalizedWeight: 0.3 },
    { id: 'c_salary', name: 'Gaji', type: 'COST', weight: 30, normalizedWeight: 0.3 },
  ];

  describe('entityExtractor', () => {
    it('Kasus 1: Harus mengekstrak format rapi standar', () => {
      const input = 'Kandidat: Budi, Nilai Tes: 85, Pengalaman: 3 thn, Gaji: 5 jt';
      const result = extractAlternativesFromText(input, mockCriteria);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.alternatives).toHaveLength(1);
        const alt = result.alternatives[0];
        expect(alt.name).toBe('Budi');
        expect(alt.values.c_test).toBe(85);
        expect(alt.values.c_exp).toBe(3);
        expect(alt.values.c_salary).toBe(5);
      }
    });

    it('Kasus 2: Harus mengekstrak format dengan spasi tidak konsisten dan multi-baris', () => {
      const input = `
        Kandidat :  Siti Aminah  ,   Nilai Tes : 92  , Pengalaman :  5 thn , Gaji :  7 jt   
        Kandidat: Joko Widodo, Nilai Tes:70, Pengalaman:1thn, Gaji:3jt
      `;
      const result = extractAlternativesFromText(input, mockCriteria);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.alternatives).toHaveLength(2);
        expect(result.alternatives[0].name).toBe('Siti Aminah');
        expect(result.alternatives[0].values.c_test).toBe(92);
        expect(result.alternatives[0].values.c_exp).toBe(5);
        expect(result.alternatives[0].values.c_salary).toBe(7);

        expect(result.alternatives[1].name).toBe('Joko Widodo');
        expect(result.alternatives[1].values.c_test).toBe(70);
        expect(result.alternatives[1].values.c_exp).toBe(1);
        expect(result.alternatives[1].values.c_salary).toBe(3);
      }
    });

    it('Kasus 3: Harus membersihkan satuan berbeda (thn, tahun, jt, juta, %)', () => {
      const input = 'Kandidat: Clara Wijaya, Nilai Tes: 88 %, Pengalaman: 4 tahun, Gaji: 6.5 juta';
      const result = extractAlternativesFromText(input, mockCriteria);

      expect(result.success).toBe(true);
      if (result.success) {
        const alt = result.alternatives[0];
        expect(alt.name).toBe('Clara Wijaya');
        expect(alt.values.c_test).toBe(88);
        expect(alt.values.c_exp).toBe(4);
        expect(alt.values.c_salary).toBe(6.5);
      }
    });

    it('Kasus 4: Harus mengembalikan pesan error terstruktur untuk teks tidak dikenal tanpa crash', () => {
      const invalidInput = 'Catatan rapat acak kemarin siang tanpa pemisah titik dua dan tanpa pasangan atribut';
      const result = extractAlternativesFromText(invalidInput, mockCriteria);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Gagal mengekstrak data');
        expect(result.lineErrors).toHaveLength(1);
        expect(result.lineErrors[0].reason).toContain('titik dua');
      }
    });
  });

  describe('comparisonDetector', () => {
    it('Kasus 1: Harus mendeteksi pola numerik eksplisit (N kali lebih penting)', () => {
      const text = 'Kapasitas 3 kali lebih penting dari Efisiensi. Performa 5x lebih penting dibanding Biaya.';
      const result = detectComparisonsFromText(text);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.comparisons).toHaveLength(2);
        expect(result.comparisons[0].criterionA).toBe('Kapasitas');
        expect(result.comparisons[0].criterionB).toBe('Efisiensi');
        expect(result.comparisons[0].scale).toBe(3);

        expect(result.comparisons[1].criterionA).toBe('Performa');
        expect(result.comparisons[1].criterionB).toBe('Biaya');
        expect(result.comparisons[1].scale).toBe(5);
      }
    });

    it('Kasus 2: Harus mendeteksi kata intensitas Saaty (jauh, sedikit, mutlak, sama)', () => {
      const text = `
        Kualitas jauh lebih penting dibanding Harga.
        Keandalan sedikit lebih penting dari Fleksibilitas.
        Keamanan mutlak lebih penting dibanding Tampilan.
        Desain sama penting dengan Kecepatan.
      `;
      const result = detectComparisonsFromText(text);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.comparisons).toHaveLength(4);
        expect(result.comparisons[0].scale).toBe(7); // jauh -> 7
        expect(result.comparisons[1].scale).toBe(3); // sedikit -> 3
        expect(result.comparisons[2].scale).toBe(9); // mutlak -> 9
        expect(result.comparisons[3].scale).toBe(1); // sama penting -> 1
      }
    });

    it('Kasus 3: Harus mengembalikan pesan error jelas untuk kalimat yang tidak cocok dengan pola perbandingan', () => {
      const randomText = 'Hari ini saya berencana untuk mengevaluasi data di spreadsheet.';
      const result = detectComparisonsFromText(randomText);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Format perbandingan tidak dikenali');
        expect(result.unrecognizedSentences).toHaveLength(1);
      }
    });
  });

  describe('caseTemplates', () => {
    it('Harus menyediakan tepat 5 preset DecisiProjectState siap pakai yang valid', () => {
      expect(PARSER_CASE_PRESETS).toHaveLength(5);
      const names = PARSER_CASE_PRESETS.map((p) => p.name);
      expect(names).toContain('Pemilihan Vendor Cloud');
      expect(names).toContain('Seleksi Penerima Beasiswa');
      expect(names).toContain('Penentuan Lokasi Kafe');

      PARSER_CASE_PRESETS.forEach((preset) => {
        expect(preset.state.criteria.length).toBeGreaterThanOrEqual(3);
        expect(preset.state.alternatives.length).toBeGreaterThanOrEqual(3);
        const weightSum = preset.state.criteria.reduce((s, c) => s + c.normalizedWeight, 0);
        expect(Math.abs(weightSum - 1.0)).toBeLessThan(1e-6);
      });
    });
  });
});
