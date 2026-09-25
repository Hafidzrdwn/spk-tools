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
  /**
   * Dipanggil saat pengguna berpindah/meninggalkan step ini (baik maju maupun mundur).
   */
  onLeave?: () => void;
  /**
   * Dipanggil khusus saat pengguna menavigasi mundur (Back) ke step ini.
   * Gunakan untuk me-reset kondisi UI/action ke status awal sebelum aksi dilakukan.
   */
  resetOnBack?: () => void;
  /** Jika diisi, tombol "Lanjut" disembunyikan/disabled sampai kondisi ini true. */
  requiredAction?: {
    description: string; // teks instruksi ke user, misal "Coba klik Auto-distribute weight"
    isSatisfied: (projectState?: DecisiProjectState) => boolean;
  };
}

export interface TourDefinition {
  id: 'general' | 'saw' | 'wp' | 'topsis' | 'ahp' | 'story';
  title: string;
  steps: TourStep[];
}
