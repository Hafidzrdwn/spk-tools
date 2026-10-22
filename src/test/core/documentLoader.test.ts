import { describe, it, expect } from 'vitest';
import {
  detectFileType,
  readDocumentFile,
  inferCriterionType,
  standardizeExtractedData,
  parseLocalTextToMatrix,
  type DocumentFilePayload,
  type DocumentExtractionAiResponse,
} from '@/services/ai';

describe('AI Document Loader Module', () => {
  it('correctly detects supported and unsupported file types', () => {
    const pdfFile = new File(['dummy'], 'proposal_tender.pdf', { type: 'application/pdf' });
    expect(detectFileType(pdfFile)).toBe('pdf');

    const docxFile = new File(['dummy'], 'spesifikasi_teknis.docx');
    expect(detectFileType(docxFile)).toBe('docx');

    const txtFile = new File(['dummy'], 'data_vendor.txt', { type: 'text/plain' });
    expect(detectFileType(txtFile)).toBe('txt');

    const csvFile = new File(['dummy'], 'perbandingan.csv', { type: 'text/csv' });
    expect(detectFileType(csvFile)).toBe('csv');

    const mdFile = new File(['dummy'], 'analisis.md');
    expect(detectFileType(mdFile)).toBe('md');

    const exeFile = new File(['dummy'], 'virus.exe', { type: 'application/octet-stream' });
    expect(detectFileType(exeFile)).toBe('unknown');
  });

  it('rejects files exceeding the 10 MB limit with FILE_TOO_LARGE error', async () => {
    const oversizedFile = new File([''], 'huge_file.pdf', { type: 'application/pdf' });
    Object.defineProperty(oversizedFile, 'size', { value: 11 * 1024 * 1024 });

    await expect(readDocumentFile(oversizedFile)).rejects.toMatchObject({
      code: 'FILE_TOO_LARGE',
      suggestion: expect.stringContaining('10 MB'),
    });
  });

  it('rejects empty files with DOCUMENT_EMPTY error', async () => {
    const emptyFile = new File([''], 'empty.txt', { type: 'text/plain' });

    await expect(readDocumentFile(emptyFile)).rejects.toMatchObject({
      code: 'DOCUMENT_EMPTY',
    });
  });

  it('accurately infers Benefit vs Cost criteria types based on semantic keywords', () => {
    expect(inferCriterionType('Harga Pembelian')).toBe('COST');
    expect(inferCriterionType('Biaya Pengiriman')).toBe('COST');
    expect(inferCriterionType('Tarif Langganan')).toBe('COST');
    expect(inferCriterionType('Waktu Pengerjaan')).toBe('COST');
    expect(inferCriterionType('Tingkat Kerusakan Produk')).toBe('COST');
    expect(inferCriterionType('Jarak Tempuh Gudang')).toBe('COST');

    expect(inferCriterionType('Kualitas Bahan')).toBe('BENEFIT');
    expect(inferCriterionType('Kapasitas RAM')).toBe('BENEFIT');
    expect(inferCriterionType('Kecepatan Prosesor')).toBe('BENEFIT');
    expect(inferCriterionType('Daya Tahan Baterai')).toBe('BENEFIT');
    expect(inferCriterionType('Reputasi Vendor')).toBe('BENEFIT');
    expect(inferCriterionType('Garansi Resmi')).toBe('BENEFIT');
  });

  it('standardizes AI extraction response into valid Decision Layer schema', () => {
    const rawAiResponse: DocumentExtractionAiResponse = {
      projectTitle: 'Evaluasi Vendor Server—Cloud 2026',
      projectDescription: 'Perbandingan server aplikasi berbasis cloud.',
      criteria: [
        { name: 'Biaya Bulanan', type: 'COST', weight: 40, unit: 'Ribu Rp' },
        { name: 'Kapasitas RAM', type: 'BENEFIT', weight: 60, unit: 'GB' },
      ],
      alternatives: [
        {
          name: 'Provider Alpha',
          values: {
            'Biaya Bulanan': 450,
            'Kapasitas RAM': 16,
          },
        },
        {
          name: 'Provider Beta',
          values: {
            'Biaya Bulanan': 300,
            'Kapasitas RAM': 8,
          },
        },
      ],
      confidenceScore: 0.95,
      warnings: [],
    };

    const payload: DocumentFilePayload = {
      name: 'tender.pdf',
      size: 15000,
      type: 'pdf',
      mimeType: 'application/pdf',
    };

    const result = standardizeExtractedData(rawAiResponse, payload, 'gemini-3.8-flash');

    expect(result.projectTitle).toBe('Evaluasi Vendor Server, Cloud 2026');
    expect(result.criteria).toHaveLength(2);
    expect(result.alternatives).toHaveLength(2);

    expect(result.criteria[0].type).toBe('COST');
    expect(result.criteria[1].type).toBe('BENEFIT');

    const totalNormWeight = result.criteria.reduce((acc, c) => acc + c.normalizedWeight, 0);
    expect(totalNormWeight).toBeCloseTo(1.0, 5);

    const crit0Id = result.criteria[0].id;
    const crit1Id = result.criteria[1].id;
    expect(result.alternatives[0].values[crit0Id]).toBe(450);
    expect(result.alternatives[0].values[crit1Id]).toBe(16);
    expect(result.alternatives[1].values[crit0Id]).toBe(300);
    expect(result.alternatives[1].values[crit1Id]).toBe(8);
  });

  it('fills missing alternative values with fallback 0 and records informative warnings', () => {
    const rawWithMissing: DocumentExtractionAiResponse = {
      projectTitle: 'Studi Laptop',
      criteria: [
        { name: 'Harga', type: 'COST', weight: 1 },
        { name: 'RAM', type: 'BENEFIT', weight: 1 },
      ],
      alternatives: [
        {
          name: 'Laptop X',
          values: {
            Harga: 12000000,
          },
        },
        {
          name: 'Laptop Y',
          values: {
            RAM: 16,
          },
        },
      ],
    };

    const payload: DocumentFilePayload = {
      name: 'laptop.txt',
      size: 500,
      type: 'txt',
      mimeType: 'text/plain',
    };

    const result = standardizeExtractedData(rawWithMissing, payload);
    expect(result.warnings.length).toBeGreaterThanOrEqual(2);
    const ramCrit = result.criteria.find((c) => c.name === 'RAM');
    expect(ramCrit).toBeDefined();
    expect(result.alternatives[0].values[ramCrit!.id]).toBe(0);
  });

  it('parses structured local markdown/csv tables without requiring AI API key', () => {
    const markdownTableText = [
      '| Alternatif | Harga Beli | Kapasitas RAM | Daya Tahan Baterai |',
      '| --- | --- | --- | --- |',
      '| Laptop A | 15000000 | 16 | 10 |',
      '| Laptop B | 18000000 | 32 | 8 |',
      '| Laptop C | 12500000 | 8 | 12 |',
    ].join('\n');

    const payload: DocumentFilePayload = {
      name: 'tabel_laptop.md',
      size: 400,
      type: 'md',
      mimeType: 'text/markdown',
      textContent: markdownTableText,
    };

    const result = parseLocalTextToMatrix(payload);

    expect(result.criteria).toHaveLength(3);
    expect(result.alternatives).toHaveLength(3);
    expect(result.criteria[0].type).toBe('COST');
    expect(result.criteria[1].type).toBe('BENEFIT');
    expect(result.criteria[2].type).toBe('BENEFIT');

    const hargaId = result.criteria[0].id;
    expect(result.alternatives[0].name).toBe('Laptop A');
    expect(result.alternatives[0].values[hargaId]).toBe(15000000);
    expect(result.alternatives[1].values[hargaId]).toBe(18000000);
    expect(result.alternatives[2].values[hargaId]).toBe(12500000);
  });

  it('preserves context metadata and maps criteria codes to full descriptive names', () => {
    const rawData: DocumentExtractionAiResponse = {
      projectTitle: 'Pengadaan Lab Komputer Kampus',
      contextMetadata: {
        caseTitle: 'Pengadaan Lab Terpadu 2026',
        institutionOrOrg: 'Universitas Indonesia',
        targetStakeholder: 'Rektor & Tim Anggaran',
        domainContext: 'Pendidikan Tinggi',
        rawNarrativeSummary: 'Studi kasus pemilihan vendor laboratorium komputer terpadu.',
      },
      criteria: [
        { code: 'C1', name: 'Biaya Pengadaan dan Lisensi', type: 'COST', weight: 40 },
        { code: 'C2', name: 'Kualitas Spesifikasi Hardware', type: 'BENEFIT', weight: 60 },
      ],
      alternatives: [
        {
          code: 'A1',
          name: 'Program Lab Alpha',
          values: { C1: 250000000, C2: 92 },
        },
        {
          code: 'A2',
          name: 'Program Lab Beta',
          values: { 'Biaya Pengadaan dan Lisensi': 220000000, 'Kualitas Spesifikasi Hardware': 85 },
        },
      ],
    };

    const payload: DocumentFilePayload = {
      name: 'tender_lab.pdf',
      size: 1024,
      type: 'pdf',
      mimeType: 'application/pdf',
    };

    const result = standardizeExtractedData(rawData, payload);

    expect(result.contextMetadata).toBeDefined();
    expect(result.contextMetadata?.institutionOrOrg).toBe('Universitas Indonesia');
    expect(result.contextMetadata?.targetStakeholder).toBe('Rektor & Tim Anggaran');

    const c1 = result.criteria.find((c) => c.name.includes('Biaya'));
    const c2 = result.criteria.find((c) => c.name.includes('Kualitas'));

    expect(c1).toBeDefined();
    expect(c2).toBeDefined();
    expect(result.alternatives[0].values[c1!.id]).toBe(250000000);
    expect(result.alternatives[0].values[c2!.id]).toBe(92);
    expect(result.alternatives[1].values[c1!.id]).toBe(220000000);
    expect(result.alternatives[1].values[c2!.id]).toBe(85);
  });
});

