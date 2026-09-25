import type { TourDefinition, TourStep } from './types';
import { useUiStore } from '@/store/useUiStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useTourStore } from '@/store/useTourStore';
import { CASE_TEMPLATES } from '@/core/constants/caseTemplates';

let isTopsisHoverStepActive = false;
let topsisHoverSatisfied = false;

export const resetTopsisTourTracking = () => {
  isTopsisHoverStepActive = false;
  topsisHoverSatisfied = false;
};

export const markTopsisHover = () => {
  if (isTopsisHoverStepActive) {
    topsisHoverSatisfied = true;
  }
};

export const isTopsisHoverSatisfied = () => {
  return topsisHoverSatisfied;
};

const ensureTopsisTemplateData = () => {
  const { criteria, alternatives, loadProjectState } = useProjectStore.getState();
  const stashed = useTourStore.getState().stashedProjectState;
  if (stashed || criteria.length === 0 || alternatives.length === 0) {
    loadProjectState(CASE_TEMPLATES[0].state);
  }
};

export const TOPSIS_TOUR_STEPS: TourStep[] = [
  {
    id: 'topsis-click-tab',
    targetSelector: '[data-tour-id="nav-tab-TOPSIS"]',
    title: 'Langkah Wajib: Buka Tab Metode TOPSIS',
    content:
      'Metode TOPSIS didasarkan pada konsep bahwa alternatif terbaik harus memiliki jarak geometris terdekat dengan solusi ideal positif (A+) dan terjauh dari solusi ideal negatif (A-). Silakan klik tab "TOPSIS" pada bar navigasi di atas.',
    placement: 'bottom',
    preNavigate: () => {
      resetTopsisTourTracking();
      ensureTopsisTemplateData();
    },
    requiredAction: {
      description: 'Klik tab "TOPSIS" pada bar navigasi metode di atas.',
      isSatisfied: () => useUiStore.getState().activeTab === 'TOPSIS',
    },
  },
  {
    id: 'topsis-matrix-panel',
    targetSelector: '[data-tour-id="topsis-matrix-panel"]',
    title: 'Tahap 1: Matriks Keputusan Awal (X)',
    content:
      'Pada tahap awal ini, nilai kinerja alternatif terhadap masing-masing kriteria ditampilkan. TOPSIS akan menormalisasi nilai-nilai ini menggunakan vektor Euclidean akar kuadrat agar skala komparasi seimbang.',
    placement: 'top',
    preNavigate: () => {
      isTopsisHoverStepActive = false;
    },
  },
  {
    id: 'topsis-click-step-2',
    targetSelector: '[data-tour-id="topsis-step-btn-2"]',
    title: 'Langkah Wajib: Buka Tahap Solusi Ideal & Jarak',
    content:
      'Silakan klik tombol "2. Solusi Ideal & Jarak" pada bar stepper di atas untuk memeriksa penetapan titik ekstrem A+/A- dan perhitungan jarak Euclidean.',
    placement: 'bottom',
    preNavigate: () => {
      isTopsisHoverStepActive = false;
    },
    resetOnBack: () => {
      isTopsisHoverStepActive = false;
      useUiStore.getState().setTopsisActiveStep(1);
    },
    requiredAction: {
      description: 'Klik tombol stepper "2. Solusi Ideal & Jarak".',
      isSatisfied: () => useUiStore.getState().topsisActiveStep === 2,
    },
  },
  {
    id: 'topsis-ideal-panel',
    targetSelector: '[data-tour-id="topsis-ideal-panel"]',
    title: 'Konsep Solusi Ideal Positif (A+) & Negatif (A-)',
    content:
      'TOPSIS menentukan dua titik acuan hipotesis:\n• Solusi Ideal Positif (A+): Nilai terbaik (Max untuk Benefit, Min untuk Cost).\n• Solusi Ideal Negatif (A-): Nilai terburuk (Min untuk Benefit, Max untuk Cost).\nAlternatif ideal adalah target optimasi yang ingin didekati sedekat mungkin.',
    placement: 'top',
    preNavigate: () => {
      isTopsisHoverStepActive = false;
    },
  },
  {
    id: 'topsis-click-step-3',
    targetSelector: '[data-tour-id="topsis-step-btn-3"]',
    title: 'Langkah Wajib: Buka Radar Chart & Ranking',
    content:
      'Sekarang mari kita lihat visualisasi kontur geometris alternatif terhadap A+/A-. Silakan klik tombol "3. Radar & Ranking (C_i)" pada stepper di atas.',
    placement: 'bottom',
    preNavigate: () => {
      isTopsisHoverStepActive = false;
    },
    resetOnBack: () => {
      isTopsisHoverStepActive = false;
      useUiStore.getState().setTopsisActiveStep(2);
    },
    requiredAction: {
      description: 'Klik tombol stepper "3. Radar & Ranking (C_i)".',
      isSatisfied: () => useUiStore.getState().topsisActiveStep === 3,
    },
  },
  {
    id: 'topsis-radar-chart',
    targetSelector: '[data-tour-id="topsis-radar-chart"]',
    title: 'Langkah Wajib: Eksplorasi Radar Profile A+ & A-',
    content:
      'Radar Chart ini memetakan profil multi-dimensi setiap alternatif. Arahkan kursor mouse (hover) ke kontur garis hijau A+ (Solusi Ideal), garis merah A- (Solusi Terburuk), atau legendanya untuk menginspeksi nilai acuan di setiap sumbu kriteria.',
    placement: 'top',
    preNavigate: () => {
      isTopsisHoverStepActive = true;
      topsisHoverSatisfied = false;
    },
    onLeave: () => {
      isTopsisHoverStepActive = false;
    },
    resetOnBack: () => {
      isTopsisHoverStepActive = true;
      topsisHoverSatisfied = false;
    },
    requiredAction: {
      description: 'Arahkan kursor (hover) ke garis, titik, atau legenda A+ / A- pada Radar Chart.',
      isSatisfied: () => isTopsisHoverSatisfied(),
    },
  },
  {
    id: 'topsis-ranking-panel',
    targetSelector: '[data-tour-id="topsis-ranking-panel"]',
    title: 'Kedekatan Relatif (C_i) & Rekomendasi Akhir',
    content:
      'Skor preferensi final dihitung dengan rumus kedekatan relatif C_i = D_i^- / (D_i^+ + D_i^-). Nilai C_i berada pada rentang [0, 1]. Alternatif dengan nilai C_i tertinggi (paling mendekati 1) terpilih sebagai rekomendasi peringkat #1.',
    placement: 'top',
    preNavigate: () => {
      isTopsisHoverStepActive = false;
    },
  },
];

export const topsisTourDefinition: TourDefinition = {
  id: 'topsis',
  title: 'Tour Mendalam: Metode TOPSIS',
  steps: TOPSIS_TOUR_STEPS,
};
