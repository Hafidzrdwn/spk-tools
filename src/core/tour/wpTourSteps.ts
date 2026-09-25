import type { TourDefinition, TourStep } from './types';
import type { DecisiProjectState } from '@/types/domain';
import { useUiStore } from '@/store/useUiStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useTourStore } from '@/store/useTourStore';
import { CASE_TEMPLATES } from '@/core/constants/caseTemplates';
import { wpZeroGuard } from '@/validators/matrixSchemas';

let isZeroGuardStepActive = false;
let zeroGuardEverTriggered = false;
let zeroGuardEverResolved = false;

export const resetWpTourTracking = () => {
  isZeroGuardStepActive = false;
  zeroGuardEverTriggered = false;
  zeroGuardEverResolved = false;
};

export const isWpZeroGuardSatisfied = (state: DecisiProjectState) => {
  if (!isZeroGuardStepActive) return false;
  const violations = wpZeroGuard(state.alternatives, state.criteria);
  if (violations.length > 0) {
    zeroGuardEverTriggered = true;
  } else if (zeroGuardEverTriggered && violations.length === 0) {
    zeroGuardEverResolved = true;
  }
  return zeroGuardEverTriggered && zeroGuardEverResolved;
};

const ensureWpTemplateData = () => {
  const { criteria, alternatives, loadProjectState, updateCriterion } = useProjectStore.getState();
  const stashed = useTourStore.getState().stashedProjectState;
  if (stashed || criteria.length === 0 || alternatives.length === 0) {
    loadProjectState(CASE_TEMPLATES[0].state);
    const currentCriteria = useProjectStore.getState().criteria;
    if (currentCriteria.length > 0 && !currentCriteria.some((c) => c.type === 'COST')) {
      updateCriterion(currentCriteria[0].id, { type: 'COST' });
    }
  } else if (!criteria.some((c) => c.type === 'COST')) {
    updateCriterion(criteria[0].id, { type: 'COST' });
  }
};

export const WP_TOUR_STEPS: TourStep[] = [
  {
    id: 'wp-click-tab',
    targetSelector: '[data-tour-id="nav-tab-WP"]',
    title: 'Langkah Wajib: Buka Tab Metode WP',
    content:
      'Metode Weighted Product (WP) mengevaluasi alternatif melalui perkalian perpangkatan nilai kriteria dengan bobot. Silakan klik tab "WP" pada bar navigasi di atas.',
    placement: 'bottom',
    preNavigate: () => {
      resetWpTourTracking();
      ensureWpTemplateData();
    },
    requiredAction: {
      description: 'Klik tab "WP" pada bar navigasi metode di atas.',
      isSatisfied: () => useUiStore.getState().activeTab === 'WP',
    },
  },
  {
    id: 'wp-zero-guard-step',
    targetSelector: '[data-tour-id="wp-matrix-panel"]',
    title: 'Langkah Wajib: Uji Proteksi WP Zero-Guard',
    content:
      'Karena nilai kriteria Cost menjadi pembagi (1 / x^w), jika ada alternatif bernilai 0, akan terjadi pembagian dengan nol (1 / 0 = Infinity) yang merusak kalkulasi. Coba ketik angka 0 pada salah satu sel kriteria Cost di tabel matriks ini hingga alert merah muncul, lalu perbaiki kembali nilainya ke angka positif (> 0).',
    placement: 'top',
    preNavigate: () => {
      isZeroGuardStepActive = true;
      zeroGuardEverTriggered = false;
      zeroGuardEverResolved = false;
    },
    resetOnBack: () => {
      isZeroGuardStepActive = true;
      zeroGuardEverTriggered = false;
      zeroGuardEverResolved = false;
    },
    requiredAction: {
      description:
        'Ubah salah satu nilai alternatif pada kolom kriteria Cost menjadi 0 (hingga alert merah muncul), lalu kembalikan ke angka semula (> 0).',
      isSatisfied: (state) => isWpZeroGuardSatisfied(state),
    },
  },
  {
    id: 'wp-click-step-2',
    targetSelector: '[data-tour-id="wp-step-btn-2"]',
    title: 'Langkah Wajib: Buka Tahap Pangkat Bobot',
    content:
      'Kalkulasi WP memerlukan transformasi bobot menjadi eksponen pangkat. Silakan klik tombol "2. Pangkat Bobot (w*)" pada stepper di atas.',
    placement: 'bottom',
    preNavigate: () => {
      isZeroGuardStepActive = false;
    },
    resetOnBack: () => {
      isZeroGuardStepActive = false;
      useUiStore.getState().setWpActiveStep(1);
    },
    requiredAction: {
      description: 'Klik tombol stepper "2. Pangkat Bobot (w*)".',
      isSatisfied: () => useUiStore.getState().wpActiveStep === 2,
    },
  },
  {
    id: 'wp-cost-negative-explanation',
    targetSelector: '[data-tour-id="wp-exponent-table"]',
    title: 'Mengapa Cost Dipangkatkan Negatif?',
    content:
      'Berdasarkan hukum aljabar perpangkatan: x^(-w) = 1 / (x^w). Pangkat negatif mengubah nilai kriteria menjadi pembagi (penyebut). Dengan demikian, alternatif dengan nilai Cost lebih kecil (misal harga lebih murah) akan menghasilkan pembagian yang lebih menguntungkan (nilai preferensi lebih tinggi).',
    placement: 'top',
    preNavigate: () => {
      isZeroGuardStepActive = false;
    },
  },
  {
    id: 'wp-click-step-3',
    targetSelector: '[data-tour-id="wp-step-btn-3"]',
    title: 'Langkah Wajib: Buka Vektor S & Vektor V',
    content:
      'Kini mari kita periksa hasil perkalian dan perankingan akhir WP. Silakan klik tombol "3. Vektor S & V" pada stepper di atas.',
    placement: 'bottom',
    preNavigate: () => {
      isZeroGuardStepActive = false;
    },
    resetOnBack: () => {
      isZeroGuardStepActive = false;
      useUiStore.getState().setWpActiveStep(2);
    },
    requiredAction: {
      description: 'Klik tombol stepper "3. Vektor S & V".',
      isSatisfied: () => useUiStore.getState().wpActiveStep === 3,
    },
  },
  {
    id: 'wp-vector-v',
    targetSelector: '[data-tour-id="wp-vector-panel"]',
    title: 'Vektor S, Vektor V, & Keputusan Terbaik',
    content:
      'Vektor S (S_i = Π x_ij^w*) mengalikan seluruh atribut berpangkat. Vektor V (V_i = S_i / Σ S_i) menormalisasinya menjadi preferensi relatif total 1.0 (100%). Alternatif dengan Vektor V tertinggi menempati peringkat #1 sebagai rekomendasi terbaik.',
    placement: 'top',
    preNavigate: () => {
      isZeroGuardStepActive = false;
    },
  },
];

export const wpTourDefinition: TourDefinition = {
  id: 'wp',
  title: 'Tour Mendalam: Metode WP',
  steps: WP_TOUR_STEPS,
};
