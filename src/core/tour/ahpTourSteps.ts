import type { TourDefinition, TourStep } from './types';
import { useUiStore } from '@/store/useUiStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useTourStore } from '@/store/useTourStore';
import { CASE_TEMPLATES } from '@/core/constants/caseTemplates';

let initialCr = 0;
let hasCrChangedDuringStep = false;

export const resetAhpTourTracking = () => {
  hasCrChangedDuringStep = false;
  initialCr = useUiStore.getState().ahpCurrentCr;
};

export const markAhpCrChanged = () => {
  hasCrChangedDuringStep = true;
};

export const isAhpCrSatisfied = () => {
  const currentCr = useUiStore.getState().ahpCurrentCr;
  if (Math.abs(currentCr - initialCr) > 0.0001) {
    hasCrChangedDuringStep = true;
  }
  return hasCrChangedDuringStep;
};

const ensureAhpTemplateData = () => {
  const { criteria, loadProjectState } = useProjectStore.getState();
  const stashed = useTourStore.getState().stashedProjectState;
  if (stashed || criteria.length < 2) {
    loadProjectState(CASE_TEMPLATES[0].state);
  }
};

export const AHP_TOUR_STEPS: TourStep[] = [
  {
    id: 'ahp-click-tab',
    targetSelector: '[data-tour-id="nav-tab-AHP"]',
    title: 'Langkah Wajib: Buka Tab Metode AHP',
    content:
      'Metode Analytic Hierarchy Process (AHP) digunakan untuk menentukan bobot prioritas kriteria secara ilmiah melalui perbandingan berpasangan (pairwise comparison). Silakan klik tab "AHP" pada bar navigasi di atas.',
    placement: 'bottom',
    preNavigate: () => {
      resetAhpTourTracking();
      ensureAhpTemplateData();
    },
    requiredAction: {
      description: 'Klik tab "AHP" pada bar navigasi metode di atas.',
      isSatisfied: () => useUiStore.getState().activeTab === 'AHP',
    },
  },
  {
    id: 'ahp-saaty-intro',
    targetSelector: '[data-tour-id="ahp-pairwise-panel"]',
    title: 'Tahap 1: Pengantar Skala Fundamental Saaty',
    content:
      'AHP menggunakan skala Saaty bernilai 1 hingga 9:\n• 1: Kedua kriteria sama penting (1:1)\n• 3: Sedikit lebih penting\n• 5: Jelas lebih penting\n• 7: Sangat jelas lebih penting\n• 9: Mutlak lebih penting (ekstrem)',
    placement: 'top',
    preNavigate: () => {
      hasCrChangedDuringStep = false;
    },
  },
  {
    id: 'ahp-slider-action',
    targetSelector: '[data-tour-id="ahp-pairwise-slider"]',
    title: 'Langkah Wajib: Geser Slider Perbandingan Kriteria',
    content:
      'Silakan coba geser salah satu slider perbandingan kriteria ke kiri (memprioritaskan Kriteria A) atau ke kanan (memprioritaskan Kriteria B). Perhatikan bagaimana pergeseran ini langsung mengubah derajat preferensi matematis.',
    placement: 'bottom',
    preNavigate: () => {
      initialCr = useUiStore.getState().ahpCurrentCr;
      hasCrChangedDuringStep = false;
    },
    resetOnBack: () => {
      initialCr = useUiStore.getState().ahpCurrentCr;
      hasCrChangedDuringStep = false;
    },
    requiredAction: {
      description: 'Geser slider perbandingan berpasangan sampai nilai rasio konsistensi (CR) berubah.',
      isSatisfied: () => isAhpCrSatisfied(),
    },
  },
  {
    id: 'ahp-click-step-3',
    targetSelector: '[data-tour-id="ahp-step-btn-3"]',
    title: 'Langkah Wajib: Buka Tahap Uji Konsistensi (CR)',
    content:
      'Penilaian manusia rentan inkonsisten (misal: A > B, B > C, tapi C > A). AHP menyediakan uji konsistensi logika matematis. Silakan klik tombol "3. Uji Konsistensi (CR)" pada stepper di atas.',
    placement: 'bottom',
    resetOnBack: () => {
      useUiStore.getState().setAhpActiveStep(1);
    },
    requiredAction: {
      description: 'Klik tombol stepper "3. Uji Konsistensi (CR)".',
      isSatisfied: () => useUiStore.getState().ahpActiveStep === 3,
    },
  },
  {
    id: 'ahp-consistency-gauge',
    targetSelector: '[data-tour-id="ahp-consistency-gauge"]',
    title: 'Evaluasi Consistency Ratio (Batas Toleransi 10%)',
    content:
      'Kriteria konsistensi Saaty mensyaratkan nilai CR ≤ 0.10 (10%):\n• Gauge Hijau (CR ≤ 0.10): Pertimbangan Anda konsisten dan valid.\n• Gauge Merah (CR > 0.10): Terdapat kontradiksi logika pada matriks perbandingan yang perlu diperbaiki.',
    placement: 'top',
  },
  {
    id: 'ahp-correction-guide',
    targetSelector: '[data-tour-id="ahp-consistency-panel"]',
    title: 'Audit Matematis & Tombol Saran Koreksi',
    content:
      'Sistem menghitung parameter λ_max (Eigenvalue Maksimum), CI (Indeks Konsistensi), dan RI (Indeks Acak). Jika matriks Anda berwarna merah (inkonsisten), tombol "Saran Koreksi Perbandingan" akan muncul untuk memberikan rekomendasi nilai koreksi otomatis.',
    placement: 'top',
  },
  {
    id: 'ahp-apply-weights',
    targetSelector: '[data-tour-id="ahp-apply-btn"]',
    title: 'Vektor Prioritas & Terapkan Bobot ke Proyek',
    content:
      'Setelah matriks terbukti konsisten (CR ≤ 10%), Anda dapat mengklik tombol "Terapkan Bobot ke Proyek" ini untuk menyinkronkan hasil pembobotan AHP ke seluruh metode SPK lainnya (SAW, WP, TOPSIS).',
    placement: 'bottom',
  },
];

export const ahpTourDefinition: TourDefinition = {
  id: 'ahp',
  title: 'Tour Mendalam: Metode AHP',
  steps: AHP_TOUR_STEPS,
};
