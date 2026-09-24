export interface DetectedComparison {
  criterionA: string;
  criterionB: string;
  scale: number; // 1 to 9
  dominant: 'A' | 'B';
  intensityLabel: string;
  rawSentence: string;
}

export interface ComparisonDetectionSuccess {
  success: true;
  comparisons: DetectedComparison[];
}

export interface ComparisonDetectionError {
  success: false;
  error: string;
  unrecognizedSentences: string[];
}

export type ComparisonDetectionResult = ComparisonDetectionSuccess | ComparisonDetectionError;

const INTENSITY_MAP: Record<string, { scale: number; label: string }> = {
  'sama': { scale: 1, label: 'Sama Penting' },
  'setara': { scale: 1, label: 'Sama Penting / Setara' },
  'sedikit': { scale: 3, label: 'Sedikit Lebih Penting' },
  'cukup': { scale: 3, label: 'Cukup Lebih Penting' },
  'lebih': { scale: 5, label: 'Lebih Penting' },
  'jauh': { scale: 7, label: 'Jauh Lebih Penting' },
  'sangat': { scale: 7, label: 'Sangat Lebih Penting' },
  'mutlak': { scale: 9, label: 'Mutlak Lebih Penting' },
  'paling': { scale: 9, label: 'Paling Penting' },
};

function cleanName(str: string): string {
  return str.trim().replace(/^["']|["']$/g, '');
}

export function detectComparisonsFromText(text: string): ComparisonDetectionResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      success: false,
      error: 'Teks perbandingan kosong. Masukkan kalimat seperti "Kriteria A 3 kali lebih penting dari Kriteria B"',
      unrecognizedSentences: [],
    };
  }

  // Pisahkan kalimat berdasarkan titik, enter, atau titik koma
  const sentences = trimmed
    .split(/[\n;.]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);

  const comparisons: DetectedComparison[] = [];
  const unrecognizedSentences: string[] = [];

  // Pola 1: "X [N] kali/x lebih penting (dari|dibanding) Y"
  const timesRegex = /^(.+?)\s+(\d+)\s*(?:kali|x)\s+lebih\s+penting\s+(?:dari|dibanding(?:kan)?|daripada)\s+(.+)$/i;

  // Pola 2: "X [intensitas] lebih penting (dari|dibanding) Y"
  const intensityRegex = /^(.+?)\s+(sedikit|cukup|jauh|sangat|mutlak|paling)?\s*lebih\s+penting\s+(?:dari|dibanding(?:kan)?|daripada)\s+(.+)$/i;

  // Pola 3: "X sama penting (dengan|dari|dibanding) Y" atau "X setara (dengan) Y"
  const equalRegex = /^(.+?)\s+(?:sama\s+penting\s*(?:dengan|dari|dibanding(?:kan)?)?|setara\s*(?:dengan)?)\s+(.+)$/i;

  sentences.forEach((sentence) => {
    // Coba Pola 1 (N kali)
    const matchTimes = sentence.match(timesRegex);
    if (matchTimes) {
      const a = cleanName(matchTimes[1]);
      const n = Math.max(1, Math.min(9, parseInt(matchTimes[2], 10)));
      const b = cleanName(matchTimes[3]);

      comparisons.push({
        criterionA: a,
        criterionB: b,
        scale: n,
        dominant: 'A',
        intensityLabel: `${n} Kali Lebih Penting`,
        rawSentence: sentence,
      });
      return;
    }

    // Coba Pola 2 (Intensitas kualitatif Saaty)
    const matchIntensity = sentence.match(intensityRegex);
    if (matchIntensity) {
      const a = cleanName(matchIntensity[1]);
      const intensityWord = (matchIntensity[2] || 'lebih').toLowerCase();
      const b = cleanName(matchIntensity[3]);

      const mapping = INTENSITY_MAP[intensityWord] || { scale: 5, label: 'Lebih Penting' };
      comparisons.push({
        criterionA: a,
        criterionB: b,
        scale: mapping.scale,
        dominant: 'A',
        intensityLabel: mapping.label,
        rawSentence: sentence,
      });
      return;
    }

    // Coba Pola 3 (Sama penting / setara)
    const matchEqual = sentence.match(equalRegex);
    if (matchEqual) {
      const a = cleanName(matchEqual[1]);
      const b = cleanName(matchEqual[2]);

      comparisons.push({
        criterionA: a,
        criterionB: b,
        scale: 1,
        dominant: 'A',
        intensityLabel: 'Sama Penting (1:1)',
        rawSentence: sentence,
      });
      return;
    }

    // Tidak cocok pola manapun
    unrecognizedSentences.push(sentence);
  });

  if (unrecognizedSentences.length > 0 && comparisons.length === 0) {
    return {
      success: false,
      error: `Format perbandingan tidak dikenali pada kalimat: "${unrecognizedSentences[0]}". Gunakan format eksplisit seperti "A 3 kali lebih penting dari B" atau "A jauh lebih penting dibanding B".`,
      unrecognizedSentences,
    };
  }

  return {
    success: true,
    comparisons,
  };
}

export default detectComparisonsFromText;
