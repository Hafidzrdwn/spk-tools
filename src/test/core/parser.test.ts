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

    it('Kasus 5: Harus mengekstrak kriteria secara dinamis ketika kriteria awal kosong atau tidak cocok', () => {
      const input = `
        Kandidat: AWS, Biaya Bulanan: 15, Uptime SLA: 99.99, Fitur AI: 95
        Kandidat: Google Cloud, Biaya Bulanan: 13, Uptime SLA: 99.95, Fitur AI: 98
      `;
      // Passing empty criteria
      const result = extractAlternativesFromText(input, []);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.alternatives).toHaveLength(2);
        expect(result.criteria).toHaveLength(3);
        const names = result.criteria.map((c) => c.name);
        expect(names).toContain('Biaya Bulanan');
        expect(names).toContain('Uptime SLA');
        expect(names).toContain('Fitur AI');
        // Auto-detect COST vs BENEFIT
        const costCrit = result.criteria.find((c) => c.name === 'Biaya Bulanan');
        expect(costCrit?.type).toBe('COST');
        const slaCrit = result.criteria.find((c) => c.name === 'Uptime SLA');
        expect(slaCrit?.type).toBe('BENEFIT');
      }
    });

    it('Kasus 6: Harus mengenali bullet points dan nomor daftar (- , 1. )', () => {
      const input = `
        1. Budi Santoso: Nilai Tes: 85, Pengalaman: 3, Gaji: 5
        2. Siti Aminah: Nilai Tes: 92, Pengalaman: 5, Gaji: 7
        - Joko Widodo: Nilai Tes: 78, Pengalaman: 2, Gaji: 4.5
      `;
      const result = extractAlternativesFromText(input, mockCriteria);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.alternatives).toHaveLength(3);
        expect(result.alternatives[0].name).toBe('Budi Santoso');
        expect(result.alternatives[1].name).toBe('Siti Aminah');
        expect(result.alternatives[2].name).toBe('Joko Widodo');
        expect(result.alternatives[0].values.c_test).toBe(85);
      }
    });

    it('Kasus 7: Harus mengekstrak tabel markdown dengan rapi', () => {
      const tableInput = `
        | Kandidat | Biaya Bulanan | Uptime SLA | Fitur AI |
        |---|---|---|---|
        | AWS | 15 | 99.99 | 95 |
        | GCP | 13 | 99.95 | 98 |
        | Azure | 14 | 99.98 | 90 |
      `;
      const result = extractAlternativesFromText(tableInput, []);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.alternatives).toHaveLength(3);
        expect(result.alternatives[0].name).toBe('AWS');
        expect(result.alternatives[1].name).toBe('GCP');
        expect(result.alternatives[2].name).toBe('Azure');
        expect(result.criteria).toHaveLength(3);
      }
    });

    it('Kasus 8: Harus mengabaikan baris header instruksi dan baris perbandingan Saaty tanpa error', () => {
      const fullPlaceholderInput = `
        Contoh format input teks studi kasus:
        Kandidat: Budi Santoso, Nilai Tes: 85, Pengalaman: 3 thn, Gaji: 5 jt
        Kandidat: Siti Aminah, Nilai Tes: 92, Pengalaman: 5 thn, Gaji: 7 jt
        Kandidat: Joko Widodo, Nilai Tes: 78, Pengalaman: 2 thn, Gaji: 4.5 jt

        Atau masukkan perbandingan preferensi Saaty:
        Pengalaman 3 kali lebih penting dari Gaji.
      `;
      const result = extractAlternativesFromText(fullPlaceholderInput, mockCriteria);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.alternatives).toHaveLength(3);
        expect(result.alternatives[0].name).toBe('Budi Santoso');
        expect(result.alternatives[1].name).toBe('Siti Aminah');
        expect(result.alternatives[2].name).toBe('Joko Widodo');
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

  describe('Security & ReDoS Resilience (§20.2)', () => {
    it('Harus memproses input adversarial berulang tanpa keterlambatan (kebal ReDoS)', () => {
      // Input berulang yang berpotensi memicu catastrophic backtracking jika ada nested quantifier
      const adversarialText = 'Kandidat ' + 'sangat '.repeat(200) + 'lebih penting dibanding ' + 'X '.repeat(200);
      const start = performance.now();
      const result = detectComparisonsFromText(adversarialText);
      const duration = performance.now() - start;

      // Harus selesai dalam waktu beberapa milidetik (jauh di bawah 50ms)
      expect(duration).toBeLessThan(50);
      expect(typeof result.success).toBe('boolean');
    });

    it('Harus memproses ekstraksi entitas teks panjang (5000 karakter) secara instan', () => {
      const longText = Array.from({ length: 50 }, (_, i) => `Kandidat: K${i}, Nilai Tes: ${80 + (i % 10)}, Pengalaman: ${i % 5} thn, Gaji: ${(i % 8) + 3} jt`).join('\n');
      const start = performance.now();
      const result = extractAlternativesFromText(longText, mockCriteria);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.alternatives.length).toBe(50);
      }
    });
  });
});

