import { GoogleGenAI } from '@google/genai';
import { nanoid } from 'nanoid';
import { getEffectiveGeminiApiKey } from './geminiClient';
import { CANDIDATE_MODELS } from './geminiClient';
import type { Criterion, Alternative, CaseContextMetadata } from '@/types/domain';

export interface ProcessedStoryResult {
  projectTitle: string;
  contextMetadata?: CaseContextMetadata;
  budgetConstraint?: number;
  criteria: Criterion[];
  alternatives: Alternative[];
  rawSummary?: string;
  source: 'ai' | 'fallback';
}

interface RawStoryExtractionResponse {
  projectTitle?: string;
  budgetConstraint?: number;
  contextMetadata?: {
    caseTitle?: string;
    institutionOrOrg?: string;
    targetStakeholder?: string;
    domainContext?: string;
    rawNarrativeSummary?: string;
  };
  criteria?: Array<{
    code?: string;
    name: string;
    type: 'BENEFIT' | 'COST';
    weight?: number;
    unit?: string;
  }>;
  alternatives?: Array<{
    code?: string;
    name: string;
    values?: Record<string, number>;
  }>;
}

export function buildStoryExtractionPrompt(storyText: string): string {
  return [
    'Kamu adalah asisten analisis Sistem Pendukung Keputusan (SPK/MCDM) cerdas.',
    'Tugasmu adalah membaca narasi studi kasus, soal cerita, atau deskripsi naratif bebas berikut, lalu mentransformasikannya menjadi matriks keputusan kuantitatif yang lengkap dan terstruktur.',
    '',
    'TEKS NARASI STUDI KASUS:',
    '"""',
    storyText.trim(),
    '"""',
    '',
    'INSTRUKSI EKSTRAKSI MATRIKS KEPUTUSAN:',
    '1. Identifikasi Judul & Konteks Kasus:',
    '   - Tentukan "projectTitle" yang deskriptif dan mencerminkan inti masalah (contoh: "Penentuan Prioritas Program Kerja HIMASIFO").',
    '   - Ekstrak batasan anggaran total dalam angka murni ke field "budgetConstraint" jika disebutkan (contoh: jika Rp15.000.000 maka 15000000).',
    '   - Lengkapi objek "contextMetadata": nama institusi/organisasi ("institutionOrOrg"), target pengambil keputusan/stakeholder ("targetStakeholder"), bidang konteks ("domainContext"), dan rangkuman masalah 1-2 kalimat ("rawNarrativeSummary").',
    '',
    '2. Identifikasi Kriteria Evaluasi:',
    '   - Temukan seluruh kriteria pertimbangan yang relevan di dalam teks (baik kriteria kuantitatif terukur maupun kualitatif).',
    '   - Tentukan tipe kriteria secara tegas:',
    '     * "COST": Jika nilai yang semakin rendah/hemat lebih disukai (misal: Anggaran, Biaya, Tingkat Kesulitan, Risiko, Waktu).',
    '     * "BENEFIT": Jika nilai yang semakin tinggi lebih disukai (misal: Target Peserta, Urgensi, Manfaat, Kesesuaian, Kemudahan, Kualitas).',
    '   - Tetapkan bobot awal yang rasional (skala 1-100) untuk setiap kriteria.',
    '   - Sertakan satuan yang sesuai (contoh: "Rp", "Orang", "Skala 1-5").',
    '',
    '3. Identifikasi Alternatif Opsi Keputusan:',
    '   - Temukan setiap usulan kegiatan, kandidat, atau opsi yang dibandingkan (contoh: Seminar Nasional, Pelatihan Web, dll.).',
    '   - Berikan nama yang jelas dan bersih.',
    '',
    '4. Pemetaan Nilai Sel Matriks (values):',
    '   - Untuk kriteria dengan angka eksplisit dalam teks (misal anggaran Rp5.000.000 atau 200 peserta), gunakan angka kuantitatif tersebut (gunakan nilai numerik murni tanpa simbol mata uang).',
    '   - Untuk kriteria kualitatif yang disebutkan dalam narasi (misal tingkat urgensi, manfaat, kemudahan), estimasikan skor rasional pada skala 1-5 yang logis dan bervariasi antar alternatif.',
    '   - Pastikan setiap alternatif memiliki nilai numerik untuk SEMUA kriteria yang diekstrak.',
    '',
    '5. ATURAN PENULISAN:',
    '   - DILARANG menggunakan tanda baca em dash ("—", "–", atau "--"), gunakan tanda hubung spasi (" - ").',
    '   - Keluaran WAJIB berupa JSON murni tanpa tag markdown ```json.',
    '',
    'Format JSON yang diharapkan:',
    '{',
    '  "projectTitle": "string",',
    '  "budgetConstraint": 15000000,',
    '  "contextMetadata": {',
    '    "caseTitle": "string",',
    '    "institutionOrOrg": "string",',
    '    "targetStakeholder": "string",',
    '    "domainContext": "string",',
    '    "rawNarrativeSummary": "string"',
    '  },',
    '  "criteria": [',
    '    { "code": "C1", "name": "Anggaran Biaya", "type": "COST", "weight": 25, "unit": "Rp" },',
    '    { "code": "C2", "name": "Target Peserta", "type": "BENEFIT", "weight": 20, "unit": "Orang" }',
    '  ],',
    '  "alternatives": [',
    '    {',
    '      "code": "A1",',
    '      "name": "Seminar Nasional Teknologi",',
    '      "values": {',
    '        "Anggaran Biaya": 5000000,',
    '        "Target Peserta": 200',
    '      }',
    '    }',
    '  ]',
    '}',
  ].join('\n');
}

export function standardizeStoryResult(raw: RawStoryExtractionResponse): ProcessedStoryResult {
  const projectTitle = raw.projectTitle?.trim() || 'Studi Kasus Narasi Keputusan';
  const rawCriteria = Array.isArray(raw.criteria) ? raw.criteria : [];
  const rawAlternatives = Array.isArray(raw.alternatives) ? raw.alternatives : [];

  const criteria: Criterion[] = rawCriteria.map((c, idx) => {
    const id = `crit_${nanoid(6)}`;
    const name = c.name?.trim() || `Kriteria ${idx + 1}`;
    const type = c.type === 'COST' ? 'COST' : 'BENEFIT';
    const weight = typeof c.weight === 'number' && !isNaN(c.weight) && c.weight > 0 ? c.weight : 1;
    const unit = c.unit?.trim() || '';

    return {
      id,
      name,
      type,
      weight,
      normalizedWeight: 0,
      unit,
    };
  });

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  criteria.forEach((c) => {
    c.normalizedWeight = totalWeight > 0 ? Number((c.weight / totalWeight).toFixed(4)) : 0;
  });

  const alternatives: Alternative[] = rawAlternatives.map((a, aIdx) => {
    const id = `alt_${nanoid(6)}`;
    const name = a.name?.trim() || `Alternatif ${aIdx + 1}`;
    const values: Record<string, number> = {};

    const rawValues = a.values || {};

    criteria.forEach((crit, critIdx) => {
      const origRawCrit = rawCriteria[critIdx];
      let foundVal: number | undefined;

      if (rawValues[crit.name] !== undefined && typeof rawValues[crit.name] === 'number') {
        foundVal = rawValues[crit.name];
      } else if (origRawCrit?.code && rawValues[origRawCrit.code] !== undefined && typeof rawValues[origRawCrit.code] === 'number') {
        foundVal = rawValues[origRawCrit.code];
      } else {
        const lowerCritName = crit.name.toLowerCase();
        for (const [k, v] of Object.entries(rawValues)) {
          if (typeof v === 'number' && (k.toLowerCase().includes(lowerCritName) || lowerCritName.includes(k.toLowerCase()))) {
            foundVal = v;
            break;
          }
        }
      }

      values[crit.id] = foundVal !== undefined && !isNaN(foundVal) ? foundVal : (crit.type === 'COST' ? 100 : 50);
    });

    return {
      id,
      name,
      values,
    };
  });

  let budgetConstraint: number | undefined;
  if (typeof raw.budgetConstraint === 'number' && !isNaN(raw.budgetConstraint) && raw.budgetConstraint > 0) {
    budgetConstraint = raw.budgetConstraint;
  }

  const contextMetadata: CaseContextMetadata | undefined = raw.contextMetadata
    ? {
        caseTitle: raw.contextMetadata.caseTitle?.trim(),
        institutionOrOrg: raw.contextMetadata.institutionOrOrg?.trim(),
        targetStakeholder: raw.contextMetadata.targetStakeholder?.trim(),
        domainContext: raw.contextMetadata.domainContext?.trim(),
        rawNarrativeSummary: raw.contextMetadata.rawNarrativeSummary?.trim(),
      }
    : undefined;

  return {
    projectTitle,
    budgetConstraint,
    contextMetadata,
    criteria,
    alternatives,
    rawSummary: raw.contextMetadata?.rawNarrativeSummary,
    source: 'ai',
  };
}

export function buildFallbackStoryResult(storyText: string): ProcessedStoryResult {
  const critBudget: Criterion = {
    id: `crit_${nanoid(6)}`,
    name: 'Alokasi Biaya',
    type: 'COST',
    weight: 30,
    normalizedWeight: 0.3,
    unit: 'Rp',
  };
  const critReach: Criterion = {
    id: `crit_${nanoid(6)}`,
    name: 'Jangkauan Peserta',
    type: 'BENEFIT',
    weight: 25,
    normalizedWeight: 0.25,
    unit: 'Orang',
  };
  const critImpact: Criterion = {
    id: `crit_${nanoid(6)}`,
    name: 'Dampak & Manfaat',
    type: 'BENEFIT',
    weight: 25,
    normalizedWeight: 0.25,
    unit: 'Skor 1-5',
  };
  const critFeasibility: Criterion = {
    id: `crit_${nanoid(6)}`,
    name: 'Kemudahan Pelaksanaan',
    type: 'BENEFIT',
    weight: 20,
    normalizedWeight: 0.2,
    unit: 'Skor 1-5',
  };

  const criteria = [critBudget, critReach, critImpact, critFeasibility];

  const himasifoRegex = /(?:yaitu|adalah|,)?\s*([a-zA-Z0-9\s]{4,40}?)\s+dengan\s+anggaran\s+Rp?\s*([\d.,]+)\s+dan\s+target\s+(\d+)\s+peserta/gi;
  const himasifoMatches = [...storyText.matchAll(himasifoRegex)];

  let alternatives: Alternative[] = [];

  if (himasifoMatches.length > 0) {
    alternatives = himasifoMatches.map((m, idx) => {
      const rawName = m[1].replace(/^(serta|dan|yaitu|,)\s*/i, '').trim();
      const cleanName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      const budgetNum = Number(m[2].replace(/[.,]/g, '')) || 3000000;
      const reachNum = Number(m[3]) || 50;

      const altId = `alt_${nanoid(6)}`;
      return {
        id: altId,
        name: cleanName || `Usulan Kegiatan ${idx + 1}`,
        values: {
          [critBudget.id]: budgetNum,
          [critReach.id]: reachNum,
          [critImpact.id]: 4 - (idx % 2),
          [critFeasibility.id]: 3 + (idx % 3),
        },
      };
    });
  } else {
    const generalCandidateRegex = /(?:^|[,;:]|\b(?:yaitu|adalah|serta|dan)\b)\s*([A-Za-z0-9\s_-]{3,35}?)\s+dengan\s+([^,;]+?)(?=(?:[,;]|\b(?:serta|dan)\b)\s*[A-Za-z0-9\s_-]{3,35}?\s+dengan|\.|$)/gi;
    const generalMatches = [...storyText.matchAll(generalCandidateRegex)];

    if (generalMatches.length >= 2) {
      alternatives = generalMatches.map((m, idx) => {
        const rawName = m[1].replace(/^(serta|dan|yaitu|:|,)\s*/i, '').trim();
        const cleanName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        const details = m[2];

        const numbersInDetail = [...details.matchAll(/([\d.,]+)\s*(?:jt|juta|k|rb|ribu|%)?/gi)]
          .map((n) => {
            let num = Number(n[1].replace(/[.,]/g, '')) || 0;
            const fullMatch = n[0].toLowerCase();
            if (fullMatch.includes('jt') || fullMatch.includes('juta')) num *= 1000000;
            else if (fullMatch.includes('k') || fullMatch.includes('rb') || fullMatch.includes('ribu')) num *= 1000;
            return num;
          })
          .filter((n) => n > 0);

        const altId = `alt_${nanoid(6)}`;
        return {
          id: altId,
          name: cleanName || `Kandidat ${idx + 1}`,
          values: {
            [critBudget.id]: numbersInDetail[0] || (idx + 1) * 1000000,
            [critReach.id]: numbersInDetail[1] || (idx + 1) * 50,
            [critImpact.id]: 3 + (idx % 3),
            [critFeasibility.id]: 4 - (idx % 2),
          },
        };
      });
    }
  }

  if (alternatives.length === 0) {
    alternatives = [
      {
        id: `alt_${nanoid(6)}`,
        name: 'Usulan Program A',
        values: {
          [critBudget.id]: 5000000,
          [critReach.id]: 200,
          [critImpact.id]: 4,
          [critFeasibility.id]: 4,
        },
      },
      {
        id: `alt_${nanoid(6)}`,
        name: 'Usulan Program B',
        values: {
          [critBudget.id]: 3000000,
          [critReach.id]: 100,
          [critImpact.id]: 3,
          [critFeasibility.id]: 5,
        },
      },
    ];
  }

  const budgetTotalMatch = storyText.match(/anggaran(?:\s+sebesar)?\s+Rp?\s*([\d.,]+)/i);
  const budgetConstraint = budgetTotalMatch ? Number(budgetTotalMatch[1].replace(/[.,]/g, '')) : undefined;

  const orgMatch = storyText.match(/^([A-Z0-9\s-]{3,20})\s+memiliki/);
  const institutionOrOrg = orgMatch ? orgMatch[1].trim() : 'Organisasi / Lembaga';

  return {
    projectTitle: `Prioritas Program Kerja ${institutionOrOrg}`,
    budgetConstraint,
    contextMetadata: {
      caseTitle: `Penentuan Prioritas Usulan Kegiatan ${institutionOrOrg}`,
      institutionOrOrg,
      targetStakeholder: `Pengurus & Pimpinan ${institutionOrOrg}`,
      domainContext: 'Manajemen Program Kerja',
      rawNarrativeSummary: storyText.slice(0, 200) + '...',
    },
    criteria,
    alternatives,
    rawSummary: 'Ekstraksi pola narasi otomatis',
    source: 'fallback',
  };
}

export async function extractMatrixFromStoryText(
  storyText: string,
  overrideApiKey?: string
): Promise<ProcessedStoryResult> {
  const trimmed = storyText.trim();
  if (trimmed.length < 20) {
    throw new Error('Narasi cerita terlalu singkat. Masukkan deskripsi studi kasus atau soal cerita secara lebih lengkap.');
  }

  const apiKey = typeof overrideApiKey === 'string' ? overrideApiKey.trim() : getEffectiveGeminiApiKey();
  if (!apiKey) {
    return buildFallbackStoryResult(trimmed);
  }

  const prompt = buildStoryExtractionPrompt(trimmed);

  try {
    const ai = new GoogleGenAI({ apiKey });

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
            maxOutputTokens: 2500,
          },
        });

        const rawText = response?.text;
        if (!rawText) continue;

        const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsed = JSON.parse(cleanedText) as RawStoryExtractionResponse;

        if (!Array.isArray(parsed.criteria) || parsed.criteria.length === 0 || !Array.isArray(parsed.alternatives) || parsed.alternatives.length === 0) {
          continue;
        }

        const result = standardizeStoryResult(parsed);
        return result;
      } catch {
        continue;
      }
    }
  } catch {
  }

  return buildFallbackStoryResult(trimmed);
}
