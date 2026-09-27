import type { Criterion, Alternative } from '@/types/domain';
import { nanoid } from 'nanoid';

export interface EntityExtractionSuccess {
  success: true;
  alternatives: Alternative[];
  criteria: Criterion[];
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

export function stripUnitsAndParseNumber(rawStr: string): number | null {
  if (!rawStr) return null;
  // ReDoS Audit (§20.2): Alternasi statis, linear O(N) tanpa nested quantifier
  let s = rawStr.trim();
  s = s.replace(/^(?:rp\.?|idr|\$|usd|eur|€|£)\s*/i, '');
  s = s.replace(/\s*(?:tahun|thn|juta|jt|ribu|rb|bulan|bln|hari|hr|jam|kg|%|km|meter|m|ms|detik|sec|s|menit|min)\b/gi, '');
  s = s.replace(/%/g, '');

  // Pemisah ribuan vs desimal:
  if (/^\d{1,3}(?:\.\d{3})+(?:,\d+)?$/.test(s)) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(s)) {
    s = s.replace(/,/g, '');
  } else {
    s = s.replace(',', '.');
  }

  const match = s.match(/[-+]?\d+(?:\.\d+)?/);
  if (!match) return null;
  const num = Number(match[0]);
  return Number.isFinite(num) ? num : null;
}

export function isCostCriterion(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower.includes('biaya') ||
    lower.includes('harga') ||
    lower.includes('gaji') ||
    lower.includes('cost') ||
    lower.includes('price') ||
    lower.includes('tarif') ||
    lower.includes('sewa') ||
    lower.includes('lead') ||
    lower.includes('waktu') ||
    lower.includes('delay') ||
    lower.includes('loss') ||
    lower.includes('cacat') ||
    lower.includes('jarak') ||
    lower.includes('komplain')
  );
}

export function findMatchingCriterion(key: string, criteria: Criterion[]): Criterion | null {
  // ReDoS Audit (§20.2): Karakter kelas tunggal [^a-z0-9], linear O(N)
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

const ENTITY_NAME_KEYS = [
  'kandidat',
  'nama',
  'alternatif',
  'calon',
  'opsi',
  'pilihan',
  'item',
  'vendor',
  'lokasi',
  'mahasiswa',
  'karyawan',
  'produk',
  'pelamar',
  'peserta',
];

function shouldSkipLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;

  // Comments
  if (/^(?:#|\/\/|\/\*|;)/.test(trimmed)) return true;

  // Markdown table horizontal rules like |---|---|
  if (/^\|?\s*[-:]+[-| :]*\|?\s*$/.test(trimmed)) return true;

  // Instruction headers like "Contoh format input teks studi kasus:" or "Atau masukkan perbandingan:"
  if (
    /^(?:contoh|instruksi|format|petunjuk|panduan|atau\s+masukkan)\b/i.test(trimmed) &&
    trimmed.endsWith(':')
  ) {
    return true;
  }

  // Saaty relative comparisons (handled separately by detectComparisonsFromText)
  if (/lebih\s+(?:penting|diutamakan|utama|baik)|dibanding(?:kan)?\s+dengan|kali\s+lebih/i.test(trimmed)) {
    return true;
  }

  return false;
}

function parseTableRows(
  candidateLines: string[],
  criteria: Criterion[]
): { alternatives: Alternative[]; criteria: Criterion[]; unmatchedCriteria: string[] } | null {
  if (candidateLines.length < 1) return null;

  const isPipeTable = candidateLines.every((l) => l.includes('|'));
  const isTabTable = !isPipeTable && candidateLines.some((l) => l.includes('\t'));

  if (!isPipeTable && !isTabTable) return null;

  const delimiter = isPipeTable ? '|' : '\t';
  const splitRow = (row: string) => {
    let cells = row.split(delimiter).map((c) => c.trim());
    if (isPipeTable) {
      if (cells.length > 0 && cells[0] === '') cells.shift();
      if (cells.length > 0 && cells[cells.length - 1] === '') cells.pop();
    }
    return cells;
  };

  const parsedGrid = candidateLines.map(splitRow).filter((r) => r.length >= 2);
  if (parsedGrid.length < 1) return null;

  // Cek apakah baris pertama adalah header tabel
  let headerCells: string[] = [];
  let dataRows = parsedGrid;
  const firstRow = parsedGrid[0];
  const allSubsequentAreNumbers = parsedGrid.slice(1).every((row) =>
    row.slice(1).some((cell) => stripUnitsAndParseNumber(cell) !== null)
  );
  const firstRowColsAreText = firstRow.slice(1).every((cell) => stripUnitsAndParseNumber(cell) === null);

  if (firstRowColsAreText && parsedGrid.length > 1 && allSubsequentAreNumbers) {
    headerCells = firstRow;
    dataRows = parsedGrid.slice(1);
  }

  const pool: Criterion[] = [...criteria];
  const colCriteria: (Criterion | null)[] = [];
  const colCount = Math.max(...dataRows.map((r) => r.length));

  for (let c = 1; c < colCount; c++) {
    const rawHeader = headerCells[c] || `Kriteria ${c}`;
    let match = findMatchingCriterion(rawHeader, pool);
    if (!match) {
      match = {
        id: `crit_${nanoid(6)}`,
        name: rawHeader,
        type: isCostCriterion(rawHeader) ? 'COST' : 'BENEFIT',
        weight: 1,
        normalizedWeight: 0,
      };
      pool.push(match);
    }
    colCriteria[c] = match;
  }

  const alternatives: Alternative[] = [];
  dataRows.forEach((row, idx) => {
    const name = row[0];
    if (!name) return;
    const values: Record<string, number> = {};
    for (let c = 1; c < row.length; c++) {
      const crit = colCriteria[c];
      if (!crit) continue;
      const val = stripUnitsAndParseNumber(row[c]);
      if (val !== null) {
        values[crit.id] = val;
      }
    }
    if (Object.keys(values).length > 0) {
      alternatives.push({
        id: `parsed-${Date.now()}-${idx}-${nanoid(4)}`,
        name,
        values,
      });
    }
  });

  if (alternatives.length === 0) return null;

  const usedCritIds = new Set(alternatives.flatMap((a) => Object.keys(a.values)));
  const activeCriteria = pool.filter((c) => usedCritIds.has(c.id));
  activeCriteria.forEach((c) => {
    c.normalizedWeight = 1 / Math.max(1, activeCriteria.length);
  });
  const unmatchedCriteria = criteria.filter((c) => !usedCritIds.has(c.id)).map((c) => c.name);

  return { alternatives, criteria: activeCriteria, unmatchedCriteria };
}

export function extractAlternativesFromText(
  rawText: string,
  criteria: Criterion[] = []
): EntityExtractionResult {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      success: false,
      error: 'Teks input kosong. Masukkan minimal 1 baris data berformat "Kandidat: Nama, Kriteria1: Nilai, ..."',
      lineErrors: [],
    };
  }

  const rawLines = trimmed.split('\n');
  const validCandidateLines = rawLines.map((l) => l.trim()).filter((l) => !shouldSkipLine(l));

  // 1. Coba deteksi format tabular (Markdown table atau TSV)
  const tableResult = parseTableRows(validCandidateLines, criteria);
  if (tableResult && tableResult.alternatives.length > 0) {
    return {
      success: true,
      alternatives: tableResult.alternatives,
      criteria: tableResult.criteria,
      unmatchedCriteria: tableResult.unmatchedCriteria,
    };
  }

  const alternatives: Alternative[] = [];
  const lineErrors: LineError[] = [];
  const criteriaPool: Criterion[] = [...criteria];

  rawLines.forEach((originalLine, idx) => {
    const lineNum = idx + 1;
    let lineText = originalLine.trim();

    // Abaikan baris kosong, komentar, atau header instruksi
    if (shouldSkipLine(lineText)) return;

    // Bersihkan numbering / bullet points di awal baris: "1. ", "- ", "• ", "* "
    lineText = lineText.replace(/^[\s*\-•#>\d+.)\]]+\s*/, '').trim();

    // Izinkan tanda kurung yang berisi pasangan nilai: "Budi (Tes: 85, Exp: 3)" -> "Budi, Tes: 85, Exp: 3"
    if (lineText.includes('(') && lineText.endsWith(')')) {
      lineText = lineText.replace(/\(([^)]+)\)/, ', $1');
    }

    const hasColonOrEquals = lineText.includes(':') || lineText.includes('=');
    if (!hasColonOrEquals) {
      lineErrors.push({
        line: lineNum,
        text: originalLine,
        reason: 'Baris tidak memiliki pemisah pasangan kunci-nilai titik dua (":"). Format wajib: "Kandidat: Nama, Kriteria: Nilai"',
      });
      return;
    }

    // ReDoS Audit (§20.2): Pemisahan delimiter koma/titik-koma/pipa deterministik O(N)
    const rawFragments = lineText.split(/[,;|]/).map((f) => f.trim()).filter(Boolean);
    let altName = '';
    const values: Record<string, number> = {};

    // Cek jika fragmen pertama adalah nama murni tanpa titik dua (e.g. "Budi Santoso, Nilai Tes: 85")
    if (rawFragments.length > 0 && !rawFragments[0].includes(':') && !rawFragments[0].includes('=')) {
      altName = rawFragments[0];
    }

    // Cek jika baris diawali "NamaKandidat: Kriteria: Nilai"
    if (!altName && rawFragments.length > 0) {
      const firstFrag = rawFragments[0];
      const delimIdx = firstFrag.search(/[:=]/);
      if (delimIdx !== -1) {
        const potentialKey = firstFrag.slice(0, delimIdx).trim();
        const potentialVal = firstFrag.slice(delimIdx + 1).trim();
        const cleanKey = potentialKey.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (ENTITY_NAME_KEYS.includes(cleanKey)) {
          altName = potentialVal;
        } else if (findMatchingCriterion(potentialKey, criteriaPool) === null) {
          // Token sebelum titik dua bukan nama kriteria dan bukan keyword entity, cek jika sisa fragmen berisi titik dua
          const remainderHasColon = potentialVal.includes(':') || potentialVal.includes('=') || rawFragments.length > 1;
          if (remainderHasColon && isNaN(Number(potentialKey))) {
            altName = potentialKey;
            // Jika potentialVal mengandung pasangan kriteria, modifikasi fragmen pertama
            if (potentialVal.includes(':') || potentialVal.includes('=')) {
              rawFragments[0] = potentialVal;
            }
          }
        }
      }
    }

    rawFragments.forEach((fragment) => {
      const delimIdx = fragment.search(/[:=]/);
      if (delimIdx === -1) return;

      const rawKey = fragment.slice(0, delimIdx).trim();
      const rawVal = fragment.slice(delimIdx + 1).trim();
      const cleanKey = rawKey.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (ENTITY_NAME_KEYS.includes(cleanKey)) {
        altName = rawVal;
        return;
      }

      // Cari atau buat kriteria secara dinamis
      let matchedCrit = findMatchingCriterion(rawKey, criteriaPool);
      if (!matchedCrit) {
        const parsedVal = stripUnitsAndParseNumber(rawVal);
        if (parsedVal !== null) {
          matchedCrit = {
            id: `crit_${nanoid(6)}`,
            name: rawKey,
            type: isCostCriterion(rawKey) ? 'COST' : 'BENEFIT',
            weight: 1,
            normalizedWeight: 0,
          };
          criteriaPool.push(matchedCrit);
        }
      }

      if (matchedCrit) {
        const parsedVal = stripUnitsAndParseNumber(rawVal);
        if (parsedVal !== null) {
          values[matchedCrit.id] = parsedVal;
        }
      }
    });

    // Fallback jika altName masih kosong: ambil fragmen pertama
    if (!altName && rawFragments.length > 0) {
      const firstDelim = rawFragments[0].search(/[:=]/);
      if (firstDelim !== -1) {
        const cand = rawFragments[0].slice(firstDelim + 1).trim();
        if (isNaN(Number(cand))) altName = cand;
      } else {
        altName = rawFragments[0];
      }
    }

    if (!altName || Object.keys(values).length === 0) {
      lineErrors.push({
        line: lineNum,
        text: originalLine,
        reason: !altName
          ? 'Nama alternatif/kandidat tidak dapat diidentifikasi.'
          : 'Tidak ada nilai numerik kriteria yang berhasil diekstraksi dari baris ini.',
      });
      return;
    }

    alternatives.push({
      id: `parsed-${Date.now()}-${idx}-${nanoid(4)}`,
      name: altName,
      values,
    });
  });

  if (alternatives.length === 0) {
    return {
      success: false,
      error: `Gagal mengekstrak data dari teks input. Ditemukan ${Math.max(1, lineErrors.length)} kesalahan format baris.`,
      lineErrors: lineErrors.length > 0 ? lineErrors : [
        {
          line: 1,
          text: trimmed,
          reason: 'Baris tidak memiliki pemisah pasangan kunci-nilai titik dua (":"). Format wajib: "Kandidat: Nama, Kriteria: Nilai"',
        },
      ],
    };
  }

  const usedCritIds = new Set(alternatives.flatMap((a) => Object.keys(a.values)));
  const activeCriteria = criteriaPool.filter((c) => usedCritIds.has(c.id));
  activeCriteria.forEach((c) => {
    c.normalizedWeight = 1 / Math.max(1, activeCriteria.length);
  });
  const unmatchedCriteria = criteria.filter((c) => !usedCritIds.has(c.id)).map((c) => c.name);

  return {
    success: true,
    alternatives,
    criteria: activeCriteria,
    unmatchedCriteria,
  };
}

export default extractAlternativesFromText;
