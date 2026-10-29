import { GoogleGenAI } from '@google/genai';
import { nanoid } from 'nanoid';
import { getEffectiveGeminiApiKey, CANDIDATE_MODELS, withTimeout, AI_REQUEST_TIMEOUT_MS } from './geminiClient';
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
    '   - Tentukan "projectTitle" yang deskriptif dan mencerminkan inti masalah (contoh: "Pemilihan Proyek MVP Bali DigiFest 2026" atau "Penentuan Prioritas Program Kerja HIMASIFO").',
    '   - Ekstrak batasan anggaran total dalam angka murni ke field "budgetConstraint" jika disebutkan (contoh: jika Rp15.000.000 maka 15000000).',
    '   - Lengkapi objek "contextMetadata": nama institusi/organisasi/lomba ("institutionOrOrg"), target pengambil keputusan/stakeholder/juri ("targetStakeholder"), bidang konteks ("domainContext"), dan rangkuman masalah 1-2 kalimat ("rawNarrativeSummary").',
    '',
    '2. Identifikasi Kriteria Evaluasi:',
    '   - Temukan seluruh kriteria pertimbangan di dalam teks (baik kualitatif maupun kuantitatif).',
    '   - Jika teks memiliki kode kriteria (misal C1, C2, dst.), simpan kodenya di field "code" dan nama lengkap di field "name".',
    '   - Tentukan tipe kriteria secara tegas:',
    '     * "COST": Jika nilai yang semakin rendah/hemat lebih disukai (misal: Anggaran, Biaya, Tingkat Kesulitan, Risiko, Kompleksitas, Waktu, Error).',
    '     * "BENEFIT": Jika nilai yang semakin tinggi lebih disukai (misal: Target Peserta, Urgensi, Manfaat, Kesesuaian, Kemudahan, Kualitas, Inovasi, Feasibility, Relevansi).',
    '   - Tetapkan bobot: jika ada bobot eksplisit (misal 0.25 atau 25%), konversikan ke angka bobot (25 atau 0.25).',
    '   - Sertakan satuan yang sesuai (contoh: "Rp", "Orang", "Skor 1-100", "Skor 1-5").',
    '',
    '3. Identifikasi Alternatif Opsi Keputusan:',
    '   - Temukan setiap usulan, kandidat, atau opsi yang dibandingkan.',
    '   - Jika teks memiliki kode alternatif (misal A1, A2, dst.), simpan kodenya di field "code" dan nama/judul di "name".',
    '',
    '4. Pemetaan Nilai Sel Matriks (values):',
    '   - SANGAT PENTING: Jika teks memuat matriks skor atau nilai eksplisit untuk masing-masing alternatif (misal "skor C1 = 85, C2 = 92..."), WAJIB gunakan angka numerik persis dari teks tersebut.',
    '   - Untuk kriteria dengan angka kuantitatif (misal anggaran Rp5.000.000 atau 200 peserta), gunakan nilai numerik murni tanpa simbol mata uang.',
    '   - Pada objek "values", gunakan kunci berupa kode kriteria (misal "C1": 85) atau nama kriteria.',
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
    '    { "code": "C1", "name": "Kriteria Utama", "type": "BENEFIT", "weight": 25, "unit": "Skor 1-100" },',
    '    { "code": "C2", "name": "Anggaran Biaya", "type": "COST", "weight": 20, "unit": "Rp" }',
    '  ],',
    '  "alternatives": [',
    '    {',
    '      "code": "A1",',
    '      "name": "Kandidat Opsi 1",',
    '      "values": {',
    '        "C1": 85,',
    '        "Anggaran Biaya": 5000000',
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

  const rawWeightsSum = rawCriteria.reduce((sum, c) => {
    const w = typeof c.weight === 'number' && !isNaN(c.weight) && c.weight > 0 ? c.weight : 0;
    return sum + w;
  }, 0);
  const shouldScaleDecimalWeights = rawWeightsSum > 0 && rawWeightsSum <= 1.05;

  const criteria: Criterion[] = rawCriteria.map((c, idx) => {
    const id = `crit_${nanoid(6)}`;
    const name = c.name?.trim() || `Kriteria ${idx + 1}`;
    const type = c.type === 'COST' ? 'COST' : 'BENEFIT';
    let weight = typeof c.weight === 'number' && !isNaN(c.weight) && c.weight > 0 ? c.weight : 1;
    if (shouldScaleDecimalWeights) {
      weight = Math.round(weight * 100);
    }
    const unit = c.unit?.trim() || (type === 'COST' && name.toLowerCase().includes('biaya') ? 'Rp' : 'Skor 1-100');

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
    let name = a.name?.trim() || `Alternatif ${aIdx + 1}`;
    if (a.code && !name.toLowerCase().startsWith(a.code.toLowerCase())) {
      name = `${a.code} - ${name}`;
    }
    const values: Record<string, number> = {};
    const rawValues = a.values || {};

    criteria.forEach((crit, critIdx) => {
      const origRawCrit = rawCriteria[critIdx];
      const critCode = (origRawCrit?.code || `C${critIdx + 1}`).toLowerCase();
      let foundVal: number | undefined;

      if (rawValues[crit.name] !== undefined && typeof rawValues[crit.name] === 'number') {
        foundVal = rawValues[crit.name];
      } else if (origRawCrit?.code && rawValues[origRawCrit.code] !== undefined && typeof rawValues[origRawCrit.code] === 'number') {
        foundVal = rawValues[origRawCrit.code];
      } else if (rawValues[`C${critIdx + 1}`] !== undefined && typeof rawValues[`C${critIdx + 1}`] === 'number') {
        foundVal = rawValues[`C${critIdx + 1}`];
      } else if (rawValues[`c${critIdx + 1}`] !== undefined && typeof rawValues[`c${critIdx + 1}`] === 'number') {
        foundVal = rawValues[`c${critIdx + 1}`];
      } else {
        const lowerCritName = crit.name.toLowerCase();
        for (const [k, v] of Object.entries(rawValues)) {
          if (typeof v === 'number') {
            const lowerK = k.toLowerCase().trim();
            if (
              lowerK === critCode ||
              lowerK === `c${critIdx + 1}` ||
              lowerK.includes(critCode) ||
              lowerK.includes(lowerCritName) ||
              lowerCritName.includes(lowerK)
            ) {
              foundVal = v;
              break;
            }
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

function extractStructuredMcdmPattern(text: string): ProcessedStoryResult | null {
  const critRegex = /\b(C\d+)\s*(?:\(([^)]+)\)|:\s*([^,;()]+))\s*(?:[^;.]*?bobot\s*[:=]?\s*([\d.,]+)(?:\s*\(([\d.,]+)%\))?)?(?:[^;.]*?bertipe\s*[:=]?\s*(benefit|cost|keuntungan|biaya))?/gi;
  const rawCrits: Array<{ code: string; name: string; weight: number; type: 'BENEFIT' | 'COST'; unit: string }> = [];

  for (const m of text.matchAll(critRegex)) {
    const code = m[1].toUpperCase();
    const rawName = (m[2] || m[3] || '').trim();
    if (!rawName) continue;

    let weight = 20;
    if (m[5]) {
      const p = Number(m[5].replace(',', '.'));
      if (!isNaN(p) && p > 0) weight = p;
    } else if (m[4]) {
      const w = Number(m[4].replace(',', '.'));
      if (!isNaN(w) && w > 0) {
        weight = w <= 1 ? Math.round(w * 100) : w;
      }
    }

    let type: 'BENEFIT' | 'COST' = 'BENEFIT';
    if (m[6]) {
      const t = m[6].toLowerCase();
      if (t === 'cost' || t === 'biaya') type = 'COST';
    } else {
      const lower = rawName.toLowerCase();
      if (
        lower.includes('cost') ||
        lower.includes('biaya') ||
        lower.includes('anggaran') ||
        lower.includes('harga') ||
        lower.includes('risiko') ||
        lower.includes('error') ||
        lower.includes('kesulitan') ||
        lower.includes('kompleksitas')
      ) {
        type = 'COST';
      }
    }

    const unit = type === 'COST' && rawName.toLowerCase().includes('biaya') ? 'Rp' : 'Skor 1-100';

    if (!rawCrits.some((c) => c.code === code)) {
      rawCrits.push({
        code,
        name: rawName,
        weight,
        type,
        unit,
      });
    }
  }

  if (rawCrits.length < 2) {
    return null;
  }

  const altRegex = /\b(A\d+)\s*(?:\(([^)]+)\)|:\s*([^,;()]+))/gi;
  const rawAlts: Array<{ code: string; name: string }> = [];

  for (const m of text.matchAll(altRegex)) {
    const code = m[1].toUpperCase();
    const fullInner = (m[2] || m[3] || '').trim();
    if (!fullInner) continue;

    const cleanTitle = fullInner.split(/\s*[-–—]\s*|\s+kategori\s+/i)[0].trim();
    const finalName = cleanTitle || fullInner;

    if (!rawAlts.some((a) => a.code === code)) {
      rawAlts.push({
        code,
        name: `${code} (${finalName})`,
      });
    }
  }

  if (rawAlts.length < 2) {
    return null;
  }

  const criteria: Criterion[] = rawCrits.map((c) => ({
    id: `crit_${nanoid(6)}`,
    name: `${c.code} - ${c.name}`,
    type: c.type,
    weight: c.weight,
    normalizedWeight: 0,
    unit: c.unit,
  }));

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  criteria.forEach((c) => {
    c.normalizedWeight = totalWeight > 0 ? Number((c.weight / totalWeight).toFixed(4)) : 0;
  });

  const alternatives: Alternative[] = rawAlts.map((alt) => {
    const altId = `alt_${nanoid(6)}`;
    const values: Record<string, number> = {};

    const altScoreBlockRegex = new RegExp(
      `(?:Alternatif|Kandidat|Opsi)?\\s*${alt.code}[^;.\\n]*?(?:memperoleh|mendapatkan|dengan)?\\s*skor\\s*[:=]?\\s*([^;.\\n]+)`,
      'i'
    );
    const scoreBlockMatch = text.match(altScoreBlockRegex);
    const scoreStr = scoreBlockMatch ? scoreBlockMatch[1] : '';

    const scoreMap: Record<string, number> = {};
    if (scoreStr) {
      const scorePairRegex = /(C\d+)\s*[:=]\s*([\d.,]+)/gi;
      for (const sm of scoreStr.matchAll(scorePairRegex)) {
        const cCode = sm[1].toUpperCase();
        const scoreVal = Number(sm[2].replace(',', '.'));
        if (!isNaN(scoreVal)) {
          scoreMap[cCode] = scoreVal;
        }
      }
    }

    criteria.forEach((crit, idx) => {
      const origCode = rawCrits[idx].code;
      if (scoreMap[origCode] !== undefined) {
        values[crit.id] = scoreMap[origCode];
      } else {
        values[crit.id] = crit.type === 'COST' ? 20 : 80;
      }
    });

    return {
      id: altId,
      name: alt.name,
      values,
    };
  });

  const titleMatch = text.match(/^(?:Pemilihan|Penentuan|Seleksi|Evaluasi|Analisis)\s+([^,;.\n]+)/i);
  let projectTitle = titleMatch ? titleMatch[0].trim() : 'Evaluasi Keputusan Multi-Kriteria';
  if (projectTitle.length > 70) {
    projectTitle = projectTitle.slice(0, 70).trim() + '...';
  }

  const orgMatch = text.match(/\b([A-Z][a-zA-Z0-9\s]{2,30}?(?:DigiFest|Challenge|Festival|Himpunan|Badan|Dinas|Kompetisi|PT|CV))\b/i);
  const detectedOrg = orgMatch ? orgMatch[1].trim() : 'Panitia & Penilai Kasus';

  return {
    projectTitle,
    budgetConstraint: undefined,
    contextMetadata: {
      caseTitle: projectTitle,
      institutionOrOrg: detectedOrg,
      targetStakeholder: `Dewan Juri & Pengambil Keputusan ${detectedOrg}`,
      domainContext: 'Kompetisi & Inovasi Digital',
      rawNarrativeSummary: text.slice(0, 240) + '...',
    },
    criteria,
    alternatives,
    rawSummary: 'Ekstraksi pola terstruktur MCDM berhasil',
    source: 'fallback',
  };
}

function extractActivityBudgetPattern(storyText: string): ProcessedStoryResult | null {
  const himasifoRegex = /(?:yaitu|adalah|,)?\s*([a-zA-Z0-9\s]{4,40}?)\s+dengan\s+anggaran\s+Rp?\s*([\d.,]+)\s+dan\s+target\s+(\d+)\s+peserta/gi;
  const himasifoMatches = [...storyText.matchAll(himasifoRegex)];

  if (himasifoMatches.length < 2) {
    return null;
  }

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

  const alternatives: Alternative[] = himasifoMatches.map((m, idx) => {
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
    rawSummary: 'Ekstraksi pola anggaran kegiatan otomatis',
    source: 'fallback',
  };
}

function extractGeneralCandidatesPattern(storyText: string): ProcessedStoryResult | null {
  const generalCandidateRegex = /(?:^|[,;:]|\b(?:yaitu|adalah|serta|dan)\b)\s*([A-Za-z0-9\s_-]{3,35}?)\s+dengan\s+([^,;]+?)(?=(?:[,;]|\b(?:serta|dan)\b)\s*[A-Za-z0-9\s_-]{3,35}?\s+dengan|\.|$)/gi;
  const generalMatches = [...storyText.matchAll(generalCandidateRegex)];

  if (generalMatches.length < 2) {
    return null;
  }

  const isInfluencer = /influencer|followers|pengikut|tarif/i.test(storyText);

  const critPrimary: Criterion = {
    id: `crit_${nanoid(6)}`,
    name: isInfluencer ? 'Tarif Jasa' : 'Biaya / Tarif',
    type: 'COST',
    weight: 40,
    normalizedWeight: 0.4,
    unit: 'Rp',
  };
  const critSecondary: Criterion = {
    id: `crit_${nanoid(6)}`,
    name: isInfluencer ? 'Jumlah Followers' : 'Kapasitas / Jangkauan',
    type: 'BENEFIT',
    weight: 35,
    normalizedWeight: 0.35,
    unit: isInfluencer ? 'Followers' : 'Kapasitas',
  };
  const critQuality: Criterion = {
    id: `crit_${nanoid(6)}`,
    name: 'Kualitas & Reputasi',
    type: 'BENEFIT',
    weight: 25,
    normalizedWeight: 0.25,
    unit: 'Skor 1-5',
  };

  const criteria = [critPrimary, critSecondary, critQuality];

  const alternatives: Alternative[] = generalMatches.map((m, idx) => {
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
        [critPrimary.id]: numbersInDetail[0] || (idx + 1) * 1000000,
        [critSecondary.id]: numbersInDetail[1] || (idx + 1) * 50000,
        [critQuality.id]: 3 + (idx % 3),
      },
    };
  });

  return {
    projectTitle: isInfluencer ? 'Seleksi Influencer Pemasaran' : 'Evaluasi Pilihan Kandidat',
    budgetConstraint: undefined,
    contextMetadata: {
      caseTitle: isInfluencer ? 'Seleksi Influencer Terbaik' : 'Evaluasi Alternatif Kandidat',
      institutionOrOrg: 'Tim Pemasaran & Strategi',
      targetStakeholder: 'Manajer Proyek / Pimpinan Tim',
      domainContext: isInfluencer ? 'Pemasaran Digital' : 'Evaluasi Opsi',
      rawNarrativeSummary: storyText.slice(0, 200) + '...',
    },
    criteria,
    alternatives,
    rawSummary: 'Ekstraksi pola kandidat umum otomatis',
    source: 'fallback',
  };
}

function extractDynamicFallback(storyText: string): ProcessedStoryResult {
  const isCompetition = /lomba|kompetisi|challenge|festival|hackathon/i.test(storyText);
  const isTech = /software|aplikasi|web|ai|sistem|teknologi/i.test(storyText);
  const isProcurement = /vendor|pengadaan|supplier|perangkat|laptop|alat/i.test(storyText);

  let crit1Name = 'Kualitas & Relevansi Solusi';
  let crit2Name = 'Biaya / Kebutuhan Sumber Daya';
  let crit3Name = 'Kelayakan Eksekusi';
  let crit4Name = 'Dampak & Manfaat';

  if (isCompetition || isTech) {
    crit1Name = 'Inovasi & Relevansi AI';
    crit2Name = 'Kompleksitas & Risiko Teknis';
    crit3Name = 'Kesiapan & Kecepatan MVP';
    crit4Name = 'Dampak Solusi Nyata';
  } else if (isProcurement) {
    crit1Name = 'Kesesuaian Spesifikasi Teknis';
    crit2Name = 'Biaya Pengadaan & Operasional';
    crit3Name = 'Dukungan Layanan & Garansi';
    crit4Name = 'Kualitas Produk & Keandalan';
  }

  const crit1: Criterion = {
    id: `crit_${nanoid(6)}`,
    name: crit1Name,
    type: 'BENEFIT',
    weight: 30,
    normalizedWeight: 0.3,
    unit: 'Skor 1-100',
  };
  const crit2: Criterion = {
    id: `crit_${nanoid(6)}`,
    name: crit2Name,
    type: 'COST',
    weight: 25,
    normalizedWeight: 0.25,
    unit: 'Skor 1-100',
  };
  const crit3: Criterion = {
    id: `crit_${nanoid(6)}`,
    name: crit3Name,
    type: 'BENEFIT',
    weight: 25,
    normalizedWeight: 0.25,
    unit: 'Skor 1-100',
  };
  const crit4: Criterion = {
    id: `crit_${nanoid(6)}`,
    name: crit4Name,
    type: 'BENEFIT',
    weight: 20,
    normalizedWeight: 0.2,
    unit: 'Skor 1-100',
  };

  const criteria = [crit1, crit2, crit3, crit4];

  const alternatives: Alternative[] = [
    {
      id: `alt_${nanoid(6)}`,
      name: 'Opsi Alternatif 1',
      values: {
        [crit1.id]: 88,
        [crit2.id]: 30,
        [crit3.id]: 85,
        [crit4.id]: 90,
      },
    },
    {
      id: `alt_${nanoid(6)}`,
      name: 'Opsi Alternatif 2',
      values: {
        [crit1.id]: 92,
        [crit2.id]: 50,
        [crit3.id]: 78,
        [crit4.id]: 86,
      },
    },
    {
      id: `alt_${nanoid(6)}`,
      name: 'Opsi Alternatif 3',
      values: {
        [crit1.id]: 80,
        [crit2.id]: 25,
        [crit3.id]: 90,
        [crit4.id]: 75,
      },
    },
  ];

  const titleMatch = storyText.match(/^(?:Pemilihan|Penentuan|Seleksi|Evaluasi|Analisis)\s+([^,;.\n]+)/i);
  const projectTitle = titleMatch ? `Evaluasi ${titleMatch[1].trim()}` : 'Studi Kasus Narasi Keputusan';

  return {
    projectTitle,
    budgetConstraint: undefined,
    contextMetadata: {
      caseTitle: projectTitle,
      institutionOrOrg: 'Pengambil Keputusan Independen',
      targetStakeholder: 'Tim Penilai / Pengambil Keputusan',
      domainContext: isCompetition ? 'Kompetisi Inovasi' : isTech ? 'Rekayasa Teknologi' : 'Manajemen Keputusan',
      rawNarrativeSummary: storyText.slice(0, 200) + '...',
    },
    criteria,
    alternatives,
    rawSummary: 'Ekstraksi pola narasi umum dinamis',
    source: 'fallback',
  };
}

export function buildFallbackStoryResult(storyText: string): ProcessedStoryResult {
  const normalizedText = storyText.replace(/[\u2014\u2013]|--/g, ' - ').trim();

  const structuredResult = extractStructuredMcdmPattern(normalizedText);
  if (structuredResult) {
    return structuredResult;
  }

  const activityResult = extractActivityBudgetPattern(normalizedText);
  if (activityResult) {
    return activityResult;
  }

  const generalResult = extractGeneralCandidatesPattern(normalizedText);
  if (generalResult) {
    return generalResult;
  }

  throw new Error('Ekstraksi tidak berhasil menemukan alternatif dan kriteria dari teks narasi. Harap sertakan nama kandidat alternatif dan aspek evaluasi secara spesifik, atau gunakan Format Standar.');
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
    if (typeof overrideApiKey === 'string' && overrideApiKey === '') {
      return buildFallbackStoryResult(trimmed);
    }
    throw new Error('Kunci API Google Gemini belum dikonfigurasi. Harap pasang kunci API di menu Pengaturan AI terlebih dahulu.');
  }

  const prompt = buildStoryExtractionPrompt(trimmed);
  let lastErrorMsg = '';

  try {
    const ai = new GoogleGenAI({ apiKey });

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.1,
              maxOutputTokens: 2500,
            },
          }),
          AI_REQUEST_TIMEOUT_MS
        );

        const rawText = response?.text;
        if (!rawText) continue;

        const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsed = JSON.parse(cleanedText) as RawStoryExtractionResponse;

        if (!Array.isArray(parsed.criteria) || parsed.criteria.length === 0 || !Array.isArray(parsed.alternatives) || parsed.alternatives.length === 0) {
          continue;
        }

        const result = standardizeStoryResult(parsed);
        return result;
      } catch (err: unknown) {
        lastErrorMsg = err instanceof Error ? err.message : String(err);
        continue;
      }
    }
  } catch (err: unknown) {
    lastErrorMsg = err instanceof Error ? err.message : String(err);
  }

  const normalizedText = trimmed.replace(/[\u2014\u2013]|--/g, ' - ');
  const heuristic = extractStructuredMcdmPattern(normalizedText) || extractActivityBudgetPattern(normalizedText) || extractGeneralCandidatesPattern(normalizedText);
  if (heuristic && heuristic.alternatives.length >= 2) {
    return heuristic;
  }

  throw new Error(
    lastErrorMsg
      ? `AI belum berhasil menganalisis narasi (${lastErrorMsg}). Harap pastikan narasi memuat minimal 2 kandidat alternatif dan kriteria nilai numerik yang jelas.`
      : 'AI belum berhasil mengekstrak alternatif dan kriteria dari narasi. Harap lengkapi deskripsi atau gunakan Format Standar.'
  );
}
