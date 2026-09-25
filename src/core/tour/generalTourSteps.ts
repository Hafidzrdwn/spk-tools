import type { TourDefinition, TourStep } from './types';
import { useUiStore } from '@/store/useUiStore';
import { useProjectStore } from '@/store/useProjectStore';

let baselineTitle = '';
let baselineCriteriaCount = 0;
let baselineAlternativesCount = 0;

export const setBaselineTitle = (title: string) => {
  baselineTitle = title;
};

export const setCriteriaBaseline = (count: number) => {
  baselineCriteriaCount = count;
};

export const setAlternativesBaseline = (count: number) => {
  baselineAlternativesCount = count;
};

export const GENERAL_TOUR_STEPS: TourStep[] = [
  {
    id: 'general-title',
    targetSelector: '[data-tour-id="project-title-input"]',
    title: 'Langkah Awal: Judul Proyek Keputusan',
    content:
      'Setiap pengambilan keputusan memiliki konteks tersendiri. Coba klik dan ubah nama proyek ini sesuai kebutuhan analisis Anda (misal: "Pemilihan Laptop 2026").',
    placement: 'bottom',
    preNavigate: () => {
      baselineTitle = useProjectStore.getState().title;
    },
    resetOnBack: () => {
      baselineTitle = useProjectStore.getState().title;
    },
    requiredAction: {
      description: 'Ketik nama judul proyek yang baru hingga tersimpan.',
      isSatisfied: (state) => state.title.trim() !== baselineTitle.trim(),
    },
  },
  {
    id: 'general-glossary',
    targetSelector: '[data-tour-id="glossary-btn"]',
    title: 'Pusat Glosarium & Rumus SPK',
    content:
      'Memerlukan bantuan memahami istilah teknis SPK seperti Vektor S, Vektor V, Normalisasi, atau Rasio Konsistensi? Klik tombol Glosarium ini untuk membuka kamus SPK.',
    placement: 'bottom',
    onLeave: () => {
      useUiStore.getState().closeGlossary();
    },
    resetOnBack: () => {
      useUiStore.getState().closeGlossary();
    },
    requiredAction: {
      description: 'Klik tombol "Glosarium" untuk membuka drawer panduan istilah.',
      isSatisfied: () => useUiStore.getState().isGlossaryOpen === true,
    },
  },
  {
    id: 'general-help-launcher',
    targetSelector: '[data-tour-id="help-launcher"]',
    title: 'Pusat Bantuan & Tour Interaktif',
    content:
      'Menu Bantuan ini menyimpan panduan awal serta tour mendalam untuk setiap metode SPK yang dapat Anda jalankan kembali kapan saja.',
    placement: 'bottom',
  },
  {
    id: 'general-template',
    targetSelector: '[data-tour-id="load-template-btn"]',
    title: 'Muat Contoh Studi Kasus',
    content:
      'Tidak ingin mengetik dari awal? Tombol ini menyediakan berbagai template kasus nyata (seperti Evaluasi Supplier, Beasiswa, dan Laptop) yang siap dianalisis secara instan.',
    placement: 'bottom',
  },
  {
    id: 'general-reset',
    targetSelector: '[data-tour-id="reset-project-btn"]',
    title: 'Reset Data Proyek',
    content:
      'Jika ingin membersihkan seluruh data dan memulai pengambilan keputusan baru dari lembar kosong, gunakan tombol Reset ini.',
    placement: 'bottom',
  },
  {
    id: 'general-nav-tabs',
    targetSelector: '[data-tour-id="nav-tabs"]',
    title: 'Navigasi 5 Metode Pengambilan Keputusan',
    content:
      'DecisiGraph menyediakan metode linier (SAW), perkalian eksponensial (WP), jarak solusi ideal (TOPSIS), pembobotan berpasangan (AHP), dan Perbandingan Komparatif lintas metode.',
    placement: 'bottom',
  },
  {
    id: 'general-shared-matrix',
    targetSelector: '[data-tour-id="shared-matrix-card"]',
    title: 'Matriks Keputusan Bersama (Shared Input)',
    content:
      'Data alternatif dan kriteria disimpan di panel bersama ini, sehingga nilai yang Anda masukkan langsung tersinkronisasi ke seluruh metode tanpa perlu input ulang.',
    placement: 'top',
    preNavigate: () => {
      useUiStore.getState().setSharedMatrixCollapsed(false);
    },
  },
  {
    id: 'general-shared-matrix-toggle',
    targetSelector: '[data-tour-id="shared-matrix-toggle-btn"]',
    title: 'Fitur Buka / Ciutkan Matriks Bersama',
    content:
      'Container ini dapat diciutkan (collapsible)! Anda dapat mengklik tombol panah atau tombol "Ciutkan" kapan saja untuk menyembunyikan input tabel agar area komputasi di bawah lebih lega, dan klik lagi untuk membukanya.',
    placement: 'bottom',
    preNavigate: () => {
      useUiStore.getState().setSharedMatrixCollapsed(false);
    },
  },
  {
    id: 'general-open-criteria',
    targetSelector: '[data-tour-id="editor-tab-criteria"]',
    title: 'Langkah Wajib: Buka Tab Kriteria',
    content:
      'Mari kita kelola tolok ukur evaluasi keputusan. Silakan klik tombol tab "Kriteria" di atas tabel matriks ini.',
    placement: 'bottom',
    resetOnBack: () => {
      // Saat mundur ke step ini, reset section ke 'matrix' agar user wajib klik tab Kriteria lagi
      useUiStore.getState().setActiveEditorSection('matrix');
    },
    requiredAction: {
      description: 'Klik tab "Kriteria" untuk membuka editor kriteria.',
      isSatisfied: () => useUiStore.getState().activeEditorSection === 'criteria',
    },
  },
  {
    id: 'general-add-criterion',
    targetSelector: '[data-tour-id="add-criterion-btn"]',
    title: 'Langkah Wajib: Tambah Kriteria Baru',
    content:
      'Kriteria adalah tolok ukur penilaian. Silakan klik tombol "+ Tambah Kriteria" untuk membuat kriteria evaluasi baru ke dalam daftar.',
    placement: 'bottom',
    preNavigate: () => {
      baselineCriteriaCount = useProjectStore.getState().criteria.length;
    },
    resetOnBack: () => {
      baselineCriteriaCount = useProjectStore.getState().criteria.length;
    },
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
      'Setiap kriteria memiliki arah preferensi: pilih "Benefit" jika nilai lebih besar lebih diinginkan (keuntungan/kualitas), atau "Cost" jika nilai lebih kecil lebih disukai (harga/biaya).',
    placement: 'bottom',
  },
  {
    id: 'general-open-alternatives',
    targetSelector: '[data-tour-id="editor-tab-alternatives"]',
    title: 'Langkah Wajib: Buka Tab Alternatif',
    content:
      'Kini giliran mengelola daftar kandidat pilihan keputusan. Silakan klik tombol tab "Alternatif".',
    placement: 'bottom',
    resetOnBack: () => {
      // Saat mundur ke step ini, kembalikan ke 'criteria' agar user wajib klik tab Alternatif lagi
      useUiStore.getState().setActiveEditorSection('criteria');
    },
    requiredAction: {
      description: 'Klik tab "Alternatif" untuk membuka editor kandidat alternatif.',
      isSatisfied: () => useUiStore.getState().activeEditorSection === 'alternatives',
    },
  },
  {
    id: 'general-add-alternative',
    targetSelector: '[data-tour-id="add-alternative-btn"]',
    title: 'Langkah Wajib: Tambah Alternatif Baru',
    content:
      'Klik tombol "+ Tambah Alternatif" untuk memasukkan pilihan kandidat baru (misal kandidat produk, pelamar, atau lokasi) yang akan dievaluasi.',
    placement: 'bottom',
    preNavigate: () => {
      baselineAlternativesCount = useProjectStore.getState().alternatives.length;
    },
    resetOnBack: () => {
      baselineAlternativesCount = useProjectStore.getState().alternatives.length;
    },
    requiredAction: {
      description: 'Klik tombol "+ Tambah Alternatif" agar jumlah alternatif bertambah.',
      isSatisfied: (state) => state.alternatives.length > baselineAlternativesCount,
    },
  },
  {
    id: 'general-back-to-matrix',
    targetSelector: '[data-tour-id="editor-tab-matrix"]',
    title: 'Langkah Wajib: Kembali ke Tabel Matriks',
    content:
      'Bagus! Sekarang silakan klik kembali tab "Tabel Matriks" untuk melihat grid pengisian nilai matriks.',
    placement: 'bottom',
    resetOnBack: () => {
      // Saat mundur ke step ini, kembalikan ke 'alternatives' agar user wajib klik tab Tabel Matriks lagi
      useUiStore.getState().setActiveEditorSection('alternatives');
    },
    requiredAction: {
      description: 'Klik tab "Tabel Matriks" untuk kembali ke tampilan matriks awal.',
      isSatisfied: () => useUiStore.getState().activeEditorSection === 'matrix',
    },
  },
  {
    id: 'general-compute-section',
    targetSelector: '[data-tour-id="compute-section"]',
    title: 'Panel Komputasi & Perhitungan Instan',
    content:
      'Di bagian bawah, sistem secara instan menampilkan proses normalisasi, kalkulasi bobot, dan peringkat akhir sesuai tab metode yang aktif.',
    placement: 'top',
  },
  {
    id: 'general-export-pdf',
    targetSelector: '[data-tour-id="export-pdf-btn"]',
    title: 'Fitur Unggulan: Export Laporan ke PDF',
    content:
      'Fitur penting yang sangat bermanfaat: Klik tombol "Export ke PDF" ini untuk langsung mengunduh berkas laporan resmi berbasis teks vektor asli, lengkap dengan 7 bagian mulai dari kriteria hingga kesimpulan naratif otomatis.',
    placement: 'bottom',
  },
];

export const generalTourDefinition: TourDefinition = {
  id: 'general',
  title: 'Tour Fitur Umum DecisiGraph',
  steps: GENERAL_TOUR_STEPS,
};
