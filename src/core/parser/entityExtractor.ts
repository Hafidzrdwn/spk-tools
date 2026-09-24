import type { Criterion, Alternative } from '@/types/domain';

export interface EntityExtractionSuccess {
  success: true;
  alternatives: Alternative[];
  unmatchedCriteria: string[];
}

export interface LineError {
  line: number;
  text: string;
  reason: string;
}

export interface EntityExtractionError {
  success: false;
  error: string;
  lineErrors: LineError[];
}

export type EntityExtractionResult = EntityExtractionSuccess | EntityExtractionError;

function stripUnitsAndParseNumber(rawStr: string): number | null {
  const cleaned = rawStr
    .trim()
    .replace(/(tahun|thn|juta|jt|ribu|rb|bulan|bln|hari|hr|jam|kg|%)/gi, '')
    .replace(',', '.')
    .trim();

  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function findMatchingCriterion(key: string, criteria: Criterion[]): Criterion | null {
  const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!cleanKey) return null;

  // 1. Exact match
  const exact = criteria.find((c) => c.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanKey);
  if (exact) return exact;

  // 2. Substring match
  const sub = criteria.find((c) => {
    const cClean = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleanKey.includes(cClean) || cClean.includes(cleanKey);
  });
  return sub || null;
}

const ENTITY_NAME_KEYS = ['kandidat', 'nama', 'alternatif', 'calon', 'opsi', 'pilihan', 'item', 'vendor', 'lokasi'];

export function extractAlternativesFromText(
  rawText: string,
  criteria: Criterion[]
): EntityExtractionResult {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      success: false,
      error: 'Teks input kosong. Masukkan minimal 1 baris data berformat "Kandidat: Nama, Kriteria1: Nilai, ..."',
      lineErrors: [],
    };
  }

  const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
  const alternatives: Alternative[] = [];
  const lineErrors: LineError[] = [];

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    if (!lineText.includes(':')) {
      lineErrors.push({
        line: lineNum,
        text: lineText,
        reason: 'Baris tidak memiliki pemisah pasangan kunci-nilai titik dua (":"). Format wajib: "Kandidat: Nama, Kriteria: Nilai"',
      });
      return;
    }

    const fragments = lineText.split(/[,;]/).map((f) => f.trim()).filter(Boolean);
    let altName = '';
    const values: Record<string, number> = {};

    fragments.forEach((fragment) => {
      const colonIdx = fragment.indexOf(':');
      if (colonIdx === -1) return;

      const rawKey = fragment.slice(0, colonIdx).trim();
      const rawVal = fragment.slice(colonIdx + 1).trim();
      const lowerKey = rawKey.toLowerCase();

      if (ENTITY_NAME_KEYS.includes(lowerKey)) {
        altName = rawVal;
      } else {
        const matchedCrit = findMatchingCriterion(rawKey, criteria);
        if (matchedCrit) {
          const parsedVal = stripUnitsAndParseNumber(rawVal);
          if (parsedVal !== null) {
            values[matchedCrit.id] = parsedVal;
          }
        }
      }
    });

    if (!altName && fragments.length > 0) {
      const firstColon = fragments[0].indexOf(':');
      if (firstColon !== -1) {
        altName = fragments[0].slice(firstColon + 1).trim();
      }
    }

    if (!altName || Object.keys(values).length === 0) {
      lineErrors.push({
        line: lineNum,
        text: lineText,
        reason: !altName
          ? 'Nama alternatif/kandidat tidak dapat diidentifikasi.'
          : 'Tidak ada nilai numerik kriteria yang berhasil diekstraksi dari baris ini.',
      });
      return;
    }

    alternatives.push({
      id: `parsed-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      name: altName,
      values,
    });
  });

  if (lineErrors.length > 0 && alternatives.length === 0) {
    return {
      success: false,
      error: `Gagal mengekstrak data dari teks input. Ditemukan ${lineErrors.length} kesalahan format baris.`,
      lineErrors,
    };
  }

  const extractedCritIds = new Set(alternatives.flatMap((a) => Object.keys(a.values)));
  const unmatchedCriteria = criteria.filter((c) => !extractedCritIds.has(c.id)).map((c) => c.name);

  return {
    success: true,
    alternatives,
    unmatchedCriteria,
  };
}

export default extractAlternativesFromText;
