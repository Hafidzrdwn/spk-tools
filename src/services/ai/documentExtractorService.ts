import { GoogleGenAI } from '@google/genai';
import { nanoid } from 'nanoid';
import { CANDIDATE_MODELS, getEffectiveGeminiApiKey, sanitizeNarrativeText } from './geminiClient';
import type {
  DocumentFilePayload,
  DocumentLoaderError,
  DocumentExtractionAiResponse,
  ProcessedDocumentResult,
} from './documentLoaderTypes';
import type { Criterion, Alternative, CriterionType } from '@/types/domain';

const COST_KEYWORDS = [
  'harga',
  'biaya',
  'cost',
  'tarif',
  'pengeluaran',
  'waktu',
  'lama',
  'durasi',
  'delay',
  'cacat',
  'kerusakan',
  'komplain',
  'resiko',
  'jarak',
  'konsumsi',
];

export function inferCriterionType(name: string): CriterionType {
  const lower = name.toLowerCase();
  for (const keyword of COST_KEYWORDS) {
    if (lower.includes(keyword)) {
      return 'COST';
    }
  }
  return 'BENEFIT';
}

export function buildDocumentExtractionPrompt(): string {
  return [
    'Anda adalah sistem AI ekstraktor dokumen evaluasi keputusan (Decision Support System / SPK) kelas dunia.',
    'Tugas Anda adalah membaca seluruh konten dokumen (teks atau berkas PDF/Word) dan mengekstrak struktur matriks keputusan lengkap.',
    '',
    'Petunjuk Klasifikasi Kriteria:',
    '1. Tentukan nama kriteria secara ringkas dan jelas.',
    '2. Klasifikasikan tipe kriteria secara ketat sebagai "BENEFIT" atau "COST":',
    '   - BENEFIT: Kriteria di mana semakin tinggi nilainya semakin baik (contoh: kualitas, performa, reputasi, garansi, efisiensi, kapasitas, keandalan, nilai, skor).',
    '   - COST: Kriteria di mana semakin rendah nilainya semakin baik (contoh: harga, biaya beli, biaya operasional, konsumsi daya, waktu pengerjaan, tingkat cacat, jarak, resiko).',
    '3. Bobot kriteria: Jika tertera persentase atau bobot numerik di dokumen, gunakan nilai tersebut. Jika tidak tertera, berikan estimasi bobot rasional yang bernilai positif.',
    '4. Ekstrak satuan kriteria jika tersedia (contoh: Rp, Juta, %, Hari, Jam, Skor).',
    '',
    'Petunjuk Alternatif & Nilai Matriks:',
    '1. Identifikasi setiap kandidat / produk / vendor / alternatif yang dievaluasi.',
    '2. Untuk setiap alternatif, ekstrak nilai numerik murni untuk setiap kriteria.',
    '   - Bersihkan teks satuan, tanda mata uang, atau persentase menjadi angka murni (contoh: "Rp 15.000.000" menjadi 15 atau 15000000, "85%" menjadi 85, "12 hari" menjadi 12).',
    '3. Jika ada sel yang nilainya tidak disebutkan secara eksplisit di dokumen, berikan estimasi nilai median yang wajar dan catat dalam array warnings.',
    '',
    'Aturan Bahasa & Tipografi:',
    '1. Gunakan Bahasa Indonesia baku yang profesional.',
    '2. DILARANG menggunakan tanda pisah em dash ("—", "–", atau "--"). Gunakan tanda koma atau tanda hubung spasi (" - ").',
    '',
    'Format Output Wajib (Strict JSON):',
    '{',
    '  "projectTitle": "Judul Proyek atau Studi Kasus Evaluasi",',
    '  "projectDescription": "Deskripsi singkat mengenai perbandingan yang dilakukan",',
    '  "criteria": [',
    '    {',
    '      "name": "Nama Kriteria",',
    '      "type": "BENEFIT",',
    '      "weight": 25,',
    '      "unit": "Satuan",',
    '      "description": "Penjelasan singkat kriteria"',
    '    }',
    '  ],',
    '  "alternatives": [',
    '    {',
    '      "name": "Nama Alternatif",',
    '      "values": {',
    '        "Nama Kriteria": 85',
    '      }',
    '    }',
    '  ],',
    '  "summary": "Ringkasan temuan dan kualitas kelengkapan data dalam dokumen",',
    '  "confidenceScore": 0.95,',
    '  "warnings": []',
    '}',
  ].join('\n');
}

export function parseLocalTextToMatrix(payload: DocumentFilePayload): ProcessedDocumentResult {
  const text = payload.textContent || '';
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 3) {
    const error: DocumentLoaderError = {
      code: 'INSUFFICIENT_DATA',
      message: 'Dokumen teks terlalu pendek untuk memuat matriks perbandingan.',
      suggestion: 'Pastikan dokumen memiliki minimal baris kriteria dan beberapa alternatif.',
    };
    throw error;
  }

  const delimiter = text.includes('\t') ? '\t' : text.includes(',') ? ',' : text.includes(';') ? ';' : '|';
  const tableRows = lines
    .map((line) => {
      const trimmed = line.replace(/^\||\|$/g, '');
      return trimmed.split(delimiter).map((c) => c.trim());
    })
    .filter((cols) => cols.length >= 3 && !cols.every((c) => /^-+$/.test(c)));

  if (tableRows.length < 3) {
    const error: DocumentLoaderError = {
      code: 'INSUFFICIENT_DATA',
      message: 'Tidak ditemukan format tabel atau baris data keputusan yang valid pada dokumen.',
      suggestion: 'Gunakan AI Loader dengan kunci Gemini aktif untuk membaca dokumen dengan format narasi/campuran.',
    };
    throw error;
  }

  const header = tableRows[0];
  const criteriaNames = header.slice(1);
  const dataRows = tableRows.slice(1);

  const criteria: Criterion[] = criteriaNames.map((name, idx) => {
    const id = `crit_${idx + 1}_${nanoid(4)}`;
    const type = inferCriterionType(name);
    return {
      id,
      name,
      type,
      weight: 1,
      normalizedWeight: 1 / criteriaNames.length,
    };
  });

  const alternatives: Alternative[] = dataRows.map((row, idx) => {
    const id = `alt_${idx + 1}_${nanoid(4)}`;
    const altName = row[0] || `Alternatif ${idx + 1}`;
    const values: Record<string, number> = {};

    criteria.forEach((crit, critIdx) => {
      const rawVal = row[critIdx + 1] || '0';
      const cleanNum = parseFloat(rawVal.replace(/[^0-9.-]/g, ''));
      values[crit.id] = isNaN(cleanNum) ? 0 : cleanNum;
    });

    return {
      id,
      name: altName,
      values,
    };
  });

  return {
    projectTitle: payload.name.replace(/\.[^/.]+$/, ''),
    projectDescription: 'Diekstrak menggunakan modul pembaca tabel lokal.',
    criteria,
    alternatives,
    sourceFile: {
      name: payload.name,
      size: payload.size,
      type: payload.type,
    },
    warnings: ['Diekstrak secara lokal tanpa AI. Mohon periksa kembali tipe Benefit/Cost dan bobot kriteria.'],
    confidenceScore: 0.8,
  };
}

export function standardizeExtractedData(
  parsed: DocumentExtractionAiResponse,
  payload: DocumentFilePayload,
  modelUsed?: string
): ProcessedDocumentResult {
  if (!parsed.criteria || !Array.isArray(parsed.criteria) || parsed.criteria.length < 2) {
    const error: DocumentLoaderError = {
      code: 'INSUFFICIENT_DATA',
      message: 'Dokumen tidak memuat kriteria keputusan yang cukup (minimal 2 kriteria dibutuhkan).',
      suggestion: 'Pastikan dokumen Anda memuat perbandingan dengan parameter atau kriteria yang jelas.',
    };
    throw error;
  }

  if (!parsed.alternatives || !Array.isArray(parsed.alternatives) || parsed.alternatives.length < 2) {
    const error: DocumentLoaderError = {
      code: 'INSUFFICIENT_DATA',
      message: 'Dokumen tidak memuat alternatif keputusan yang cukup (minimal 2 alternatif dibutuhkan).',
      suggestion: 'Pastikan dokumen Anda memuat minimal 2 kandidat atau opsi untuk dievaluasi.',
    };
    throw error;
  }

  const warnings: string[] = Array.isArray(parsed.warnings) ? [...parsed.warnings] : [];

  const rawWeights = parsed.criteria.map((c) => {
    const w = Number(c.weight);
    return !isNaN(w) && w > 0 ? w : 1;
  });
  const sumWeights = rawWeights.reduce((acc, w) => acc + w, 0);

  const criteria: Criterion[] = parsed.criteria.map((c, idx) => {
    const id = `crit_${idx + 1}_${nanoid(4)}`;
    const rawType = String(c.type || '').toUpperCase();
    const type: CriterionType = rawType === 'COST' ? 'COST' : rawType === 'BENEFIT' ? 'BENEFIT' : inferCriterionType(c.name);
    const weight = rawWeights[idx];
    const normalizedWeight = sumWeights > 0 ? weight / sumWeights : 1 / parsed.criteria.length;

    return {
      id,
      name: sanitizeNarrativeText(c.name || `Kriteria ${idx + 1}`),
      unit: c.unit ? sanitizeNarrativeText(c.unit) : undefined,
      type,
      weight,
      normalizedWeight,
    };
  });

  const nameToIdMap = new Map<string, string>();
  criteria.forEach((crit) => {
    nameToIdMap.set(crit.name.toLowerCase(), crit.id);
  });

  const alternatives: Alternative[] = parsed.alternatives.map((alt, idx) => {
    const altId = `alt_${idx + 1}_${nanoid(4)}`;
    const altName = sanitizeNarrativeText(alt.name || `Alternatif ${idx + 1}`);
    const values: Record<string, number> = {};

    criteria.forEach((crit) => {
      let matchedVal: number | undefined;

      if (alt.values && typeof alt.values === 'object') {
        for (const [key, val] of Object.entries(alt.values)) {
          const lowerKey = key.toLowerCase();
          if (
            lowerKey === crit.name.toLowerCase() ||
            lowerKey.includes(crit.name.toLowerCase()) ||
            crit.name.toLowerCase().includes(lowerKey)
          ) {
            const num = Number(val);
            if (!isNaN(num)) {
              matchedVal = num;
              break;
            }
          }
        }
      }

      if (matchedVal === undefined) {
        matchedVal = 0;
        warnings.push(`Nilai alternatif "${altName}" untuk kriteria "${crit.name}" tidak ditemukan dalam dokumen (diisi 0).`);
      }

      values[crit.id] = matchedVal;
    });

    return {
      id: altId,
      name: altName,
      values,
    };
  });

  const projectTitle = sanitizeNarrativeText(
    parsed.projectTitle || payload.name.replace(/\.[^/.]+$/, '') || 'Proyek SPK dari Dokumen'
  );
  const projectDescription = parsed.projectDescription
    ? sanitizeNarrativeText(parsed.projectDescription)
    : undefined;

  return {
    projectTitle,
    projectDescription,
    criteria,
    alternatives,
    sourceFile: {
      name: payload.name,
      size: payload.size,
      type: payload.type,
    },
    warnings,
    confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.9,
    modelUsed,
  };
}

export async function extractMatrixFromDocument(
  payload: DocumentFilePayload,
  overrideApiKey?: string
): Promise<ProcessedDocumentResult> {
  const apiKey = typeof overrideApiKey === 'string' ? overrideApiKey.trim() : getEffectiveGeminiApiKey();

  if (!apiKey) {
    if (payload.textContent && payload.textContent.length > 0) {
      try {
        return parseLocalTextToMatrix(payload);
      } catch (err) {
        const error: DocumentLoaderError = {
          code: 'API_KEY_MISSING',
          message: 'Kunci Gemini API belum diatur dan dokumen tidak dapat diurai secara otomatis via parser tabel lokal.',
          details: err instanceof Error ? err.message : String(err),
          suggestion: 'Harap masukkan Kunci Google Gemini API Anda pada menu Konfigurasi Ekspor / API Key.',
        };
        throw error;
      }
    }

    const error: DocumentLoaderError = {
      code: 'API_KEY_MISSING',
      message: 'Kunci Gemini API diperlukan untuk membaca dan mengekstrak dokumen berkas (PDF/Word).',
      suggestion: 'Harap masukkan Kunci Google Gemini API Anda pada menu Pengaturan Ekspor / API Key untuk mengaktifkan AI Document Loader.',
    };
    throw error;
  }

  const promptText = buildDocumentExtractionPrompt();
  const ai = new GoogleGenAI({ apiKey });

  let lastError: unknown = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      let contents: unknown[];

      if (payload.type === 'pdf' && payload.base64Data) {
        contents = [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: payload.base64Data,
            },
          },
          promptText,
        ];
      } else {
        const textToAnalyze = payload.textContent || '';
        if (!textToAnalyze.trim()) {
          const error: DocumentLoaderError = {
            code: 'DOCUMENT_EMPTY',
            message: 'Konten dokumen kosong.',
            suggestion: 'Pastikan dokumen memuat teks perbandingan yang jelas.',
          };
          throw error;
        }

        contents = [
          promptText,
          `\n\n--- KONTEN DOKUMEN: ${payload.name} ---\n\n${textToAnalyze.slice(0, 100000)}`,
        ];
      }

      const response = await ai.models.generateContent({
        model,
        contents: contents as any,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          maxOutputTokens: 3000,
        },
      });

      const rawText = response?.text;
      if (!rawText) continue;

      const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsedData = JSON.parse(cleanedText) as DocumentExtractionAiResponse;

      return standardizeExtractedData(parsedData, payload, model);
    } catch (err: unknown) {
      lastError = err;
      continue;
    }
  }

  if (payload.textContent && payload.textContent.length > 0) {
    try {
      return parseLocalTextToMatrix(payload);
    } catch {
    }
  }

  const errorMessage = lastError instanceof Error ? lastError.message : String(lastError || 'Unknown error');
  const error: DocumentLoaderError = {
    code: 'AI_SERVICE_ERROR',
    message: 'Gagal mengekstrak matriks keputusan dari dokumen menggunakan layanan AI.',
    details: errorMessage,
    suggestion:
      errorMessage.includes('404') || errorMessage.includes('not found')
        ? 'Model Google AI Studio tidak tersedia pada akun Anda. Pastikan API key aktif.'
        : errorMessage.includes('429') || errorMessage.includes('quota')
        ? 'Batas kuota panggilan AI terlampaui. Harap tunggu beberapa saat atau periksa kuota Google AI Studio Anda.'
        : 'Pastikan dokumen memiliki tabel perbandingan yang jelas atau coba konversikan dokumen ke format teks biasa (.txt / .csv).',
  };
  throw error;
}
