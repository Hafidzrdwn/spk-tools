import type { TourDefinition, TourStep } from './types';
import { useUiStore } from '@/store/useUiStore';

let templateClickedDuringStep = false;

export const resetStoryTourTracking = () => {
  templateClickedDuringStep = false;
  useUiStore.getState().setStoryHasExtracted(false);
  useUiStore.getState().setStoryMode('story');
};

export const markStoryTemplateClicked = () => {
  templateClickedDuringStep = true;
  useUiStore.getState().setStoryHasExtracted(true);
  useUiStore.getState().setStoryMode('form');
};

export const isStoryTemplateSatisfied = () => {
  return templateClickedDuringStep || useUiStore.getState().storyHasExtracted;
};

export const STORY_TOUR_STEPS: TourStep[] = [
  {
    id: 'story-click-tab',
    targetSelector: '[data-tour-id="nav-tab-AUTO"]',
    title: 'Langkah Wajib: Buka Tab Story-to-Matrix',
    content:
      'Story-to-Matrix adalah parser heuristik cerdas yang mampu mengekstraksi data alternatif, kriteria, dan angka nilai langsung dari teks narasi bahasa alami. Silakan klik tab "Story-to-Matrix" pada navigasi di atas.',
    placement: 'bottom',
    preNavigate: () => {
      resetStoryTourTracking();
    },
    requiredAction: {
      description: 'Klik tab "Story-to-Matrix" pada bar navigasi di atas.',
      isSatisfied: () => useUiStore.getState().activeTab === 'AUTO',
    },
  },
  {
    id: 'story-textarea-card',
    targetSelector: '[data-tour-id="story-textarea-card"]',
    title: 'Editor Narasi Cerita Kasus',
    content:
      'Di panel ini, Anda dapat mengetikkan atau menyalin teks studi kasus nyata (misal: "Kandidat: Budi, Nilai Tes: 85, Pengalaman: 3 thn, Gaji: 5 jt"). Sistem akan memindai pola teks tersebut secara otomatis.',
    placement: 'top',
    preNavigate: () => {
      useUiStore.getState().setStoryMode('story');
      templateClickedDuringStep = false;
    },
  },
  {
    id: 'story-try-example-btn',
    targetSelector: '[data-tour-id="story-try-example-btn"]',
    title: 'Langkah Wajib: Klik Tombol "Coba Contoh"',
    content:
      'Tidak ingin mengetik teks dari awal? Silakan klik tombol "Coba Contoh" ini dan pilih salah satu template narasi kasus nyata yang disediakan.',
    placement: 'bottom',
    preNavigate: () => {
      useUiStore.getState().setStoryMode('story');
      templateClickedDuringStep = false;
    },
    resetOnBack: () => {
      templateClickedDuringStep = false;
      useUiStore.getState().setStoryHasExtracted(false);
      useUiStore.getState().setStoryMode('story');
    },
    requiredAction: {
      description: 'Klik tombol "Coba Contoh" dan pilih salah satu template studi kasus.',
      isSatisfied: () => isStoryTemplateSatisfied(),
    },
  },
  {
    id: 'story-preview-section',
    targetSelector: '[data-tour-id="story-preview-section"]',
    title: 'Pratinjau Hasil Ekstraksi Matriks',
    content:
      'Hebat! Teks narasi telah diproses oleh parser. Di sini Anda dapat melihat tabel pratinjau matriks yang berhasil diekstrak lengkap dengan entitas alternatif dan kolom kriteria yang teridentifikasi.',
    placement: 'top',
    preNavigate: () => {
      useUiStore.getState().setStoryMode('form');
    },
    resetOnBack: () => {
      useUiStore.getState().setStoryMode('story');
      useUiStore.getState().setStoryHasExtracted(false);
      templateClickedDuringStep = false;
    },
  },
  {
    id: 'story-mode-switcher',
    targetSelector: '[data-tour-id="story-mode-switcher"]',
    title: 'ModeSwitcher: Teks Cerita ↔ Form Matriks',
    content:
      'Komponen ModeSwitcher ini memungkinkan Anda berpindah secara fleksibel: Mode Cerita (menulis/mengedit narasi teks) atau Mode Form (mengedit nilai tabel matriks langsung). Sinkronisasi berjalan dua arah secara instan.',
    placement: 'bottom',
  },
  {
    id: 'story-commit-btn',
    targetSelector: '[data-tour-id="story-commit-btn"]',
    title: 'Terapkan ke Matriks Proyek',
    content:
      'Langkah terakhir: klik tombol "Terapkan ke Matriks Utama" ini untuk mentransfer seluruh alternatif dan kriteria hasil ekstraksi ke shared state proyek SPK Anda.',
    placement: 'top',
  },
];

export const storyTourDefinition: TourDefinition = {
  id: 'story',
  title: 'Tour Mendalam: Story-to-Matrix',
  steps: STORY_TOUR_STEPS,
};
