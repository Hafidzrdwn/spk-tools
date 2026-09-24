import type { DecisiProjectState } from '@/types/domain';

export interface ParserCasePreset {
  id: string;
  name: string;
  category: 'Bisnis' | 'Akademik';
  description: string;
  state: DecisiProjectState;
}

export const PARSER_CASE_PRESETS: ParserCasePreset[] = [
  {
    id: 'cloud-vendor',
    name: 'Pemilihan Vendor Cloud',
    category: 'Bisnis',
    description: 'Menentukan penyedia cloud terbaik berdasarkan biaya operasional, uptime SLA, dan fitur AI.',
    state: {
      title: 'Pemilihan Vendor Cloud',
      activeMethod: 'SAW',
      criteria: [
        { id: 'c_cost', name: 'Biaya Bulanan', type: 'COST', weight: 40, normalizedWeight: 0.4 },
        { id: 'c_sla', name: 'Uptime SLA (%)', type: 'BENEFIT', weight: 30, normalizedWeight: 0.3 },
        { id: 'c_ai', name: 'Fitur AI & Platform', type: 'BENEFIT', weight: 30, normalizedWeight: 0.3 },
      ],
      alternatives: [
        { id: 'alt_aws', name: 'AWS Cloud', values: { c_cost: 15, c_sla: 99.99, c_ai: 95 } },
        { id: 'alt_gcp', name: 'Google Cloud', values: { c_cost: 13, c_sla: 99.95, c_ai: 98 } },
        { id: 'alt_azure', name: 'MS Azure', values: { c_cost: 14, c_sla: 99.98, c_ai: 90 } },
      ],
    },
  },
  {
    id: 'scholarship-selection',
    name: 'Seleksi Penerima Beasiswa',
    category: 'Akademik',
    description: 'Menyeleksi calon penerima beasiswa berdasarkan prestasi akademik, penghasilan orang tua, dan tanggungan.',
    state: {
      title: 'Seleksi Penerima Beasiswa',
      activeMethod: 'TOPSIS',
      criteria: [
        { id: 'c_gpa', name: 'IPK Akademik', type: 'BENEFIT', weight: 35, normalizedWeight: 0.35 },
        { id: 'c_income', name: 'Gaji Orang Tua', type: 'COST', weight: 30, normalizedWeight: 0.3 },
        { id: 'c_achievement', name: 'Skor Prestasi', type: 'BENEFIT', weight: 20, normalizedWeight: 0.2 },
        { id: 'c_dependent', name: 'Jumlah Tanggungan', type: 'BENEFIT', weight: 15, normalizedWeight: 0.15 },
      ],
      alternatives: [
        { id: 'alt_ahmad', name: 'Ahmad Fauzi', values: { c_gpa: 3.85, c_income: 3, c_achievement: 85, c_dependent: 4 } },
        { id: 'alt_budi', name: 'Budi Santoso', values: { c_gpa: 3.65, c_income: 2, c_achievement: 90, c_dependent: 5 } },
        { id: 'alt_cantika', name: 'Cantika Dewi', values: { c_gpa: 3.95, c_income: 6, c_achievement: 95, c_dependent: 2 } },
      ],
    },
  },
  {
    id: 'cafe-location',
    name: 'Penentuan Lokasi Kafe',
    category: 'Bisnis',
    description: 'Menentukan lokasi cabang kafe baru dengan mempertimbangkan sewa tempat, lalu lintas pengunjung, dan parkir.',
    state: {
      title: 'Penentuan Lokasi Kafe',
      activeMethod: 'SAW',
      criteria: [
        { id: 'c_rent', name: 'Biaya Sewa', type: 'COST', weight: 35, normalizedWeight: 0.35 },
        { id: 'c_traffic', name: 'Foot Traffic', type: 'BENEFIT', weight: 40, normalizedWeight: 0.4 },
        { id: 'c_parking', name: 'Akses Parkir', type: 'BENEFIT', weight: 25, normalizedWeight: 0.25 },
      ],
      alternatives: [
        { id: 'alt_campus', name: 'Kawasan Kampus', values: { c_rent: 45, c_traffic: 90, c_parking: 60 } },
        { id: 'alt_office', name: 'Kawasan Perkantoran', values: { c_rent: 80, c_traffic: 95, c_parking: 85 } },
        { id: 'alt_suburb', name: 'Kawasan Residensial', values: { c_rent: 30, c_traffic: 65, c_parking: 90 } },
      ],
    },
  },
  {
    id: 'manufacturing-supplier',
    name: 'Evaluasi Supplier Manufaktur',
    category: 'Bisnis',
    description: 'Menilai vendor bahan baku berdasarkan harga material, mutu uji laboratorium, dan waktu tunggu pengiriman.',
    state: {
      title: 'Evaluasi Supplier Manufaktur',
      activeMethod: 'WP',
      criteria: [
        { id: 'c_price', name: 'Harga Satuan', type: 'COST', weight: 40, normalizedWeight: 0.4 },
        { id: 'c_quality', name: 'Kualitas Mutu', type: 'BENEFIT', weight: 35, normalizedWeight: 0.35 },
        { id: 'c_lead', name: 'Lead Time (Hari)', type: 'COST', weight: 25, normalizedWeight: 0.25 },
      ],
      alternatives: [
        { id: 'alt_sup1', name: 'PT Mitra Presisi', values: { c_price: 110, c_quality: 92, c_lead: 3 } },
        { id: 'alt_sup2', name: 'CV Logam Prima', values: { c_price: 95, c_quality: 80, c_lead: 6 } },
        { id: 'alt_sup3', name: 'PT Sinar Baja', values: { c_price: 130, c_quality: 98, c_lead: 2 } },
      ],
    },
  },
  {
    id: 'software-engineer-hiring',
    name: 'Rekrutmen Software Engineer',
    category: 'Akademik',
    description: 'Menyeleksi insinyur perangkat lunak berdasarkan kompetensi algoritma, pengalaman proyek, dan gaji yang diminta.',
    state: {
      title: 'Rekrutmen Software Engineer',
      activeMethod: 'TOPSIS',
      criteria: [
        { id: 'c_algo', name: 'Nilai Algoritma', type: 'BENEFIT', weight: 40, normalizedWeight: 0.4 },
        { id: 'c_exp', name: 'Pengalaman (Tahun)', type: 'BENEFIT', weight: 30, normalizedWeight: 0.3 },
        { id: 'c_sal', name: 'Ekspektasi Gaji', type: 'COST', weight: 30, normalizedWeight: 0.3 },
      ],
      alternatives: [
        { id: 'alt_dev1', name: 'Budi Kurniawan', values: { c_algo: 90, c_exp: 4, c_sal: 12 } },
        { id: 'alt_dev2', name: 'Citra Lestari', values: { c_algo: 82, c_exp: 5, c_sal: 11 } },
        { id: 'alt_dev3', name: 'Doni Prasetya', values: { c_algo: 96, c_exp: 2, c_sal: 14 } },
      ],
    },
  },
];

export default PARSER_CASE_PRESETS;
