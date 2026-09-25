import type { TourDefinition, TourStep } from './types';
import { useUiStore } from '@/store/useUiStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useTourStore } from '@/store/useTourStore';
import { CASE_TEMPLATES } from '@/core/constants/caseTemplates';

let isHoverStepActive = false;
let sawCellHoveredDuringStep = false;

export const resetSawTourTracking = () => {
  isHoverStepActive = false;
  sawCellHoveredDuringStep = false;
};

// Hanya tandai hovered jika step hover sedang aktif
useUiStore.subscribe((state) => {
  if (isHoverStepActive && state.hoveredCellId !== null) {
    sawCellHoveredDuringStep = true;
  }
});

export const isSawHoverSatisfied = () => {
  if (isHoverStepActive && useUiStore.getState().hoveredCellId !== null) {
    sawCellHoveredDuringStep = true;
  }
  return sawCellHoveredDuringStep;
};

const ensureTemplateData = () => {
  const { criteria, alternatives, loadProjectState } = useProjectStore.getState();
  const stashed = useTourStore.getState().stashedProjectState;
  // Muat template demonstrasi jika ada data stashed (data asli pengguna sudah diamankan)
  // atau jika data saat ini masih kosong
  if (stashed || criteria.length === 0 || alternatives.length === 0) {
    loadProjectState(CASE_TEMPLATES[0].state);
  }
};

export const SAW_TOUR_STEPS: TourStep[] = [
  {
    id: 'saw-click-tab',
    targetSelector: '[data-tour-id="nav-tab-SAW"]',
    title: 'Langkah Wajib: Buka Tab Metode SAW',
    content:
      'Mari kita pelajari alur komputasi metode Simple Additive Weighting (SAW). Silakan klik tab "SAW" pada bar navigasi di atas.',
    placement: 'bottom',
    preNavigate: () => {
      resetSawTourTracking();
      ensureTemplateData();
    },
    requiredAction: {
      description: 'Klik tab "SAW" pada bar navigasi metode di atas.',
      isSatisfied: () => useUiStore.getState().activeTab === 'SAW',
    },
  },
  {
    id: 'saw-matrix-x',
    targetSelector: '[data-tour-id="saw-matrix-panel"]',
    title: 'Tahap 1: Matriks Keputusan Awal (X)',
    content:
      'Tabel ini memuat nilai kinerja awal (X_ij) setiap alternatif terhadap seluruh kriteria. Karena kriteria dapat memiliki skala atau satuan berbeda (misal jutaan rupiah vs rating 1-5), data ini belum bisa langsung dijumlahkan.',
    placement: 'top',
    preNavigate: () => {
      isHoverStepActive = false;
    },
  },
  {
    id: 'saw-click-step-2',
    targetSelector: '[data-tour-id="saw-step-btn-2"]',
    title: 'Langkah Wajib: Buka Tahap Normalisasi',
    content:
      'Kalkulasi SAW dibagi ke dalam 3 tahapan. Silakan klik tombol "2. Normalisasi (R)" pada stepper di atas untuk melihat proses normalisasi.',
    placement: 'bottom',
    preNavigate: () => {
      isHoverStepActive = false;
    },
    resetOnBack: () => {
      isHoverStepActive = false;
      useUiStore.getState().setSawActiveStep(1);
    },
    requiredAction: {
      description: 'Klik tombol stepper "2. Normalisasi (R)".',
      isSatisfied: () => useUiStore.getState().sawActiveStep === 2,
    },
  },
  {
    id: 'saw-normalization-concept',
    targetSelector: '[data-tour-id="saw-normalization-panel"]',
    title: 'Konsep Normalisasi: Benefit vs Cost',
    content:
      'Normalisasi memetakan seluruh nilai ke rentang seragam [0, 1]:\n• Kriteria Benefit: r_ij = x_ij / Max(X_j) (nilai makin besar makin diuntungkan).\n• Kriteria Cost: r_ij = Min(X_j) / x_ij (nilai makin kecil makin hemat, skor normalisasi makin tinggi).',
    placement: 'top',
    preNavigate: () => {
      isHoverStepActive = false;
    },
  },
  {
    id: 'saw-hover-inspector',
    targetSelector: '[data-tour-id="saw-normalized-cell"]',
    title: 'Langkah Wajib: Eksplorasi Formula Inspector',
    content:
      'Arahkan kursor mouse (hover) ke sel nilai normalisasi di samping. Formula Inspector akan langsung terbuka membongkar rumus kalkulasi, nilai pembilang, penyebut kolom, dan substitusi angka aslinya.',
    placement: 'right',
    preNavigate: () => {
      isHoverStepActive = true;
      sawCellHoveredDuringStep = false;
    },
    onLeave: () => {
      isHoverStepActive = false;
      useUiStore.getState().setInspectorOpen(false);
      useUiStore.getState().setHoveredCell(null);
    },
    resetOnBack: () => {
      isHoverStepActive = true;
      sawCellHoveredDuringStep = false;
      useUiStore.getState().setInspectorOpen(false);
      useUiStore.getState().setHoveredCell(null);
    },
    requiredAction: {
      description: 'Arahkan kursor (hover) ke salah satu sel matriks normalisasi untuk membuka Formula Inspector.',
      isSatisfied: () => isSawHoverSatisfied(),
    },
  },
  {
    id: 'saw-inspector-transparency',
    targetSelector: '[data-tour-id="saw-normalization-table"]',
    title: 'Audit Transparansi & Traceability',
    content:
      'Traceability Inspector memberikan audit matematis transparan: Anda dapat melihat sel mana yang menjadi nilai Max atau Min kolom pembanding. Hal ini mencegah efek "black box" pada sistem pendukung keputusan.',
    placement: 'top',
    preNavigate: () => {
      isHoverStepActive = false;
    },
  },
  {
    id: 'saw-click-step-3',
    targetSelector: '[data-tour-id="saw-step-btn-3"]',
    title: 'Langkah Wajib: Buka Tahap Perangkingan',
    content:
      'Sekarang mari kita lihat hasil evaluasi dan perankingan akhir. Silakan klik tombol "3. Perangkingan (V)" pada stepper di atas.',
    placement: 'bottom',
    preNavigate: () => {
      isHoverStepActive = false;
    },
    resetOnBack: () => {
      isHoverStepActive = false;
      useUiStore.getState().setSawActiveStep(2);
    },
    requiredAction: {
      description: 'Klik tombol stepper "3. Perangkingan (V)".',
      isSatisfied: () => useUiStore.getState().sawActiveStep === 3,
    },
  },
  {
    id: 'saw-ranking-v',
    targetSelector: '[data-tour-id="saw-ranking-panel"]',
    title: 'Tahap 3: Perangkingan Akhir (V)',
    content:
      'Skor preferensi dihitung dengan formula V_i = Σ (w_j · r_ij), yaitu akumulasi perkalian bobot kriteria dengan nilai normalisasi. Alternatif dengan nilai V tertinggi menempati peringkat #1 sebagai rekomendasi terbaik.',
    placement: 'top',
    preNavigate: () => {
      isHoverStepActive = false;
    },
  },
];

export const sawTourDefinition: TourDefinition = {
  id: 'saw',
  title: 'Tour Mendalam: Metode SAW',
  steps: SAW_TOUR_STEPS,
};
