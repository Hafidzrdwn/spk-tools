import type { DecisiProjectState } from '@/types/domain';

export interface TourStep {
  id: string;
  targetSelector: string; // css selector, gunakan atribut data-tour-id="..." di komponen target
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /**
   * Dipanggil sekali sebelum step dirender. Gunakan untuk auto-navigasi UI
   * (pindah tab editor, buka section) agar elemen target tersedia di DOM.
   */
  preNavigate?: () => void;
  /** Jika diisi, tombol "Lanjut" disembunyikan/disabled sampai kondisi ini true. */
  requiredAction?: {
    description: string; // teks instruksi ke user, misal "Coba klik Auto-distribute weight"
    isSatisfied: (projectState: DecisiProjectState) => boolean;
  };
}

export interface TourDefinition {
  id: 'general' | 'saw' | 'wp' | 'topsis' | 'ahp' | 'story';
  title: string;
  steps: TourStep[];
}
