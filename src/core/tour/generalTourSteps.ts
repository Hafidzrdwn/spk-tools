import type { TourDefinition, TourStep } from './types';
import { useUiStore } from '@/store/useUiStore';

let baselineCriteriaCount = 0;

export const setCriteriaBaseline = (count: number) => {
  baselineCriteriaCount = count;
};

export const getCriteriaBaseline = () => baselineCriteriaCount;

export const GENERAL_TOUR_STEPS: TourStep[] = [
  {
    id: 'general-nav-tabs',
    targetSelector: '[data-tour-id="nav-tabs"]',
    title: 'Navigasi 5 Tab Metode SPK',
    content:
      'Pilih metode SPK sesuai kebutuhan: SAW (linier), WP (perkalian), TOPSIS (jarak ideal), AHP (perbandingan berpasangan), atau Perbandingan lintas metode.',
    placement: 'bottom',
    preNavigate: () => useUiStore.getState().setActiveEditorSection('matrix'),
  },
  {
    id: 'general-add-criterion',
    targetSelector: '[data-tour-id="add-criterion-btn"]',
    title: 'Langkah Wajib: Tambah Kriteria Baru',
    content:
      'Kriteria adalah tolok ukur penilaian. Silakan klik tombol "+ Tambah Kriteria" untuk melanjutkan tur.',
    placement: 'bottom',
    // Otomatis pindah ke tab Kriteria agar tombol muncul di DOM
    preNavigate: () => useUiStore.getState().setActiveEditorSection('criteria'),
    requiredAction: {
      description: 'Klik tombol "+ Tambah Kriteria" agar jumlah kriteria bertambah.',
      isSatisfied: (state) => state.criteria.length > baselineCriteriaCount,
    },
  },
  {
    id: 'general-benefit-cost',
    targetSelector: '[data-tour-id="benefit-cost-toggle"]',
    title: 'Tipe Kriteria: Benefit vs Cost',
    content:
      'Pilih "Benefit" jika nilai lebih besar lebih diinginkan (kualitas/keuntungan), atau "Cost" jika nilai lebih kecil lebih disukai (harga/biaya).',
    placement: 'bottom',
    // Toggle ada di dalam tab Kriteria
    preNavigate: () => useUiStore.getState().setActiveEditorSection('criteria'),
  },
  {
    id: 'general-add-alternative',
    targetSelector: '[data-tour-id="add-alternative-btn"]',
    title: 'Tambah Alternatif Keputusan',
    content:
      'Klik tombol "+ Tambah Alternatif" untuk memasukkan pilihan kandidat (misal produk, pelamar, atau lokasi) yang akan dievaluasi.',
    placement: 'bottom',
    // Tombol ada di tab Alternatif
    preNavigate: () => useUiStore.getState().setActiveEditorSection('alternatives'),
  },
  {
    id: 'general-compute-section',
    targetSelector: '[data-tour-id="compute-section"]',
    title: 'Panel Komputasi & Perhitungan',
    content:
      'Di bagian bawah, sistem secara instan menampilkan proses normalisasi, kalkulasi bobot, dan peringkat akhir sesuai tab metode yang aktif.',
    placement: 'top',
    // Kembalikan ke matrix view agar lebih rapi
    preNavigate: () => useUiStore.getState().setActiveEditorSection('matrix'),
  },
  {
    id: 'general-help-launcher',
    targetSelector: '[data-tour-id="help-launcher"]',
    title: 'Pusat Bantuan & Glosarium',
    content:
      'Gunakan tombol Bantuan ini untuk memutar ulang tour, membuka panduan awal, atau mengakses Glosarium istilah dan rumus kapan saja.',
    placement: 'bottom',
  },
];

export const generalTourDefinition: TourDefinition = {
  id: 'general',
  title: 'Tour Fitur Umum DecisiGraph',
  steps: GENERAL_TOUR_STEPS,
};
