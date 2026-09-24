export interface SaatyScaleLevel {
  value: number;
  label: string;
  description: string;
}

/**
 * Skala Fundamental Saaty (1-9) untuk Perbandingan Berpasangan (Pairwise Comparison)
 */
export const SAATY_SCALE: SaatyScaleLevel[] = [
  {
    value: 1,
    label: 'Sama penting (Equal)',
    description: 'Kedua elemen memiliki pengaruh yang sama besar.',
  },
  {
    value: 2,
    label: 'Mendekati sedikit lebih penting',
    description: 'Nilai kompromi antara 1 dan 3.',
  },
  {
    value: 3,
    label: 'Sedikit lebih penting (Moderate)',
    description: 'Pengalaman dan pertimbangan sedikit menyokong satu elemen dibanding yang lain.',
  },
  {
    value: 4,
    label: 'Mendekati lebih penting',
    description: 'Nilai kompromi antara 3 dan 5.',
  },
  {
    value: 5,
    label: 'Lebih penting (Strong)',
    description: 'Pengalaman dan pertimbangan sangat menyokong satu elemen dibanding yang lain.',
  },
  {
    value: 6,
    label: 'Mendekati sangat penting',
    description: 'Nilai kompromi antara 5 dan 7.',
  },
  {
    value: 7,
    label: 'Sangat penting (Very Strong)',
    description: 'Satu elemen terbukti sangat kuat disokong dan dominasinya nyata.',
  },
  {
    value: 8,
    label: 'Mendekati mutlak lebih penting',
    description: 'Nilai kompromi antara 7 dan 9.',
  },
  {
    value: 9,
    label: 'Mutlak lebih penting (Extreme)',
    description: 'Bukti yang menyokong satu elemen atas yang lain memiliki tingkat kepastian tertinggi.',
  },
];
