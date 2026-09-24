import type { DecisiProjectState } from '@/types/domain';

export interface CaseTemplate {
  id: string;
  name: string;
  description: string;
  dimension: string; // e.g. '3x3', '4x4', '5x4'
  badge: string;
  state: DecisiProjectState;
}

export const CASE_TEMPLATES: CaseTemplate[] = [
  {
    id: 'laptop-3x3',
    name: 'Pemilihan Laptop Developer',
    description: 'Menentukan laptop kerja terbaik berdasarkan harga, kapasitas RAM, dan daya tahan baterai.',
    dimension: '3 Alternatif × 3 Kriteria',
    badge: '3x3',
    state: {
      title: 'Pemilihan Laptop Developer',
      activeMethod: 'SAW',
      criteria: [
        { id: 'c_price', name: 'Harga (Juta Rp)', type: 'COST', weight: 4, normalizedWeight: 0.4 },
        { id: 'c_ram', name: 'RAM (GB)', type: 'BENEFIT', weight: 3, normalizedWeight: 0.3 },
        { id: 'c_battery', name: 'Baterai (Jam)', type: 'BENEFIT', weight: 3, normalizedWeight: 0.3 },
      ],
      alternatives: [
        { id: 'a_mac', name: 'MacBook Air M2', values: { c_price: 18, c_ram: 16, c_battery: 18 } },
        { id: 'a_think', name: 'ThinkPad T14', values: { c_price: 15, c_ram: 16, c_battery: 12 } },
        { id: 'a_zen', name: 'Zenbook 14 OLED', values: { c_price: 13, c_ram: 8, c_battery: 10 } },
      ],
    },
  },
  {
    id: 'supplier-4x4',
    name: 'Evaluasi Supplier Industri',
    description: 'Menilai vendor bahan baku berdasarkan harga, kualitas mutu, kecepatan pengiriman, dan reputasi.',
    dimension: '4 Alternatif × 4 Kriteria',
    badge: '4x4',
    state: {
      title: 'Evaluasi Supplier Industri',
      activeMethod: 'SAW',
      criteria: [
        { id: 'c_cost', name: 'Harga Satuan', type: 'COST', weight: 3, normalizedWeight: 0.3 },
        { id: 'c_quality', name: 'Kualitas Mutu (1-100)', type: 'BENEFIT', weight: 3, normalizedWeight: 0.3 },
        { id: 'c_leadtime', name: 'Waktu Kirim (Hari)', type: 'COST', weight: 2, normalizedWeight: 0.2 },
        { id: 'c_reputation', name: 'Reputasi Vendor (1-10)', type: 'BENEFIT', weight: 2, normalizedWeight: 0.2 },
      ],
      alternatives: [
        { id: 'a_sup_a', name: 'PT Mitra Sejahtera', values: { c_cost: 120, c_quality: 90, c_leadtime: 3, c_reputation: 9 } },
        { id: 'a_sup_b', name: 'CV Sumber Makmur', values: { c_cost: 100, c_quality: 75, c_leadtime: 5, c_reputation: 8 } },
        { id: 'a_sup_c', name: 'PT Logistik Prima', values: { c_cost: 140, c_quality: 95, c_leadtime: 2, c_reputation: 9.5 } },
        { id: 'a_sup_d', name: 'CV Sinar Abadi', values: { c_cost: 95, c_quality: 70, c_leadtime: 7, c_reputation: 7 } },
      ],
    },
  },
  {
    id: 'scholarship-5x4',
    name: 'Seleksi Beasiswa Prestasi',
    description: 'Menyeleksi calon penerima beasiswa berdasarkan nilai akademik, penghasilan orang tua, prestasi, dan tanggungan.',
    dimension: '5 Alternatif × 4 Kriteria',
    badge: '5x4',
    state: {
      title: 'Seleksi Beasiswa Prestasi Mahasiswa',
      activeMethod: 'SAW',
      criteria: [
        { id: 'c_gpa', name: 'IPK Akademik', type: 'BENEFIT', weight: 35, normalizedWeight: 0.35 },
        { id: 'c_income', name: 'Gaji Ortu (Juta Rp)', type: 'COST', weight: 25, normalizedWeight: 0.25 },
        { id: 'c_achieve', name: 'Skor Prestasi (0-100)', type: 'BENEFIT', weight: 25, normalizedWeight: 0.25 },
        { id: 'c_depend', name: 'Jml Tanggungan', type: 'BENEFIT', weight: 15, normalizedWeight: 0.15 },
      ],
      alternatives: [
        { id: 'a_budi', name: 'Budi Santoso', values: { c_gpa: 3.85, c_income: 3.5, c_achieve: 85, c_depend: 4 } },
        { id: 'a_siti', name: 'Siti Rahma', values: { c_gpa: 3.92, c_income: 5.0, c_achieve: 90, c_depend: 3 } },
        { id: 'a_ahmad', name: 'Ahmad Fauzi', values: { c_gpa: 3.65, c_income: 2.5, c_achieve: 70, c_depend: 5 } },
        { id: 'a_dewi', name: 'Dewi Lestari', values: { c_gpa: 3.78, c_income: 4.2, c_achieve: 80, c_depend: 2 } },
        { id: 'a_rizky', name: 'Rizky Pratama', values: { c_gpa: 3.50, c_income: 2.0, c_achieve: 60, c_depend: 4 } },
      ],
    },
  },
  {
    id: 'location-4x5',
    name: 'Ekspansi Lokasi Cabang',
    description: 'Menilai potensi kelayakan lokasi pembukaan cabang usaha baru.',
    dimension: '4 Alternatif × 5 Kriteria',
    badge: '4x5',
    state: {
      title: 'Pemilihan Lokasi Cabang Usaha',
      activeMethod: 'SAW',
      criteria: [
        { id: 'c_rent', name: 'Sewa Tahunan (Juta)', type: 'COST', weight: 25, normalizedWeight: 0.25 },
        { id: 'c_traffic', name: 'Traffic Pengunjung/Hari', type: 'BENEFIT', weight: 25, normalizedWeight: 0.25 },
        { id: 'c_purchasing', name: 'Indeks Daya Beli (1-10)', type: 'BENEFIT', weight: 20, normalizedWeight: 0.2 },
        { id: 'c_competition', name: 'Jml Pesaing Radius 1km', type: 'COST', weight: 15, normalizedWeight: 0.15 },
        { id: 'c_size', name: 'Luas Tempat (m²)', type: 'BENEFIT', weight: 15, normalizedWeight: 0.15 },
      ],
      alternatives: [
        { id: 'a_sudirman', name: 'Cabang Sudirman Hub', values: { c_rent: 180, c_traffic: 2400, c_purchasing: 9.5, c_competition: 6, c_size: 140 } },
        { id: 'a_tebet', name: 'Cabang Tebet Kuliner', values: { c_rent: 95, c_traffic: 1500, c_purchasing: 8.0, c_competition: 4, c_size: 110 } },
        { id: 'a_gading', name: 'Cabang Kelapa Gading', values: { c_rent: 130, c_traffic: 1900, c_purchasing: 8.5, c_competition: 5, c_size: 130 } },
        { id: 'a_bintaro', name: 'Cabang Bintaro Sektor 7', values: { c_rent: 85, c_traffic: 1200, c_purchasing: 7.5, c_competition: 2, c_size: 120 } },
      ],
    },
  },
  {
    id: 'employee-3x5',
    name: 'Karyawan Berprestasi Tahunan',
    description: 'Penilaian multi-kriteria untuk penghargaan tahunan karyawan terbaik.',
    dimension: '3 Alternatif × 5 Kriteria',
    badge: '3x5',
    state: {
      title: 'Penghargaan Karyawan Teladan',
      activeMethod: 'SAW',
      criteria: [
        { id: 'c_discipline', name: 'Kedisiplinan (%)', type: 'BENEFIT', weight: 20, normalizedWeight: 0.2 },
        { id: 'c_kpi', name: 'Pencapaian KPI (%)', type: 'BENEFIT', weight: 30, normalizedWeight: 0.3 },
        { id: 'c_teamwork', name: 'Kerjasama Tim (1-10)', type: 'BENEFIT', weight: 20, normalizedWeight: 0.2 },
        { id: 'c_innovation', name: 'Inisiatif Proyek (1-10)', type: 'BENEFIT', weight: 15, normalizedWeight: 0.15 },
        { id: 'c_complaints', name: 'Jumlah Komplain', type: 'COST', weight: 15, normalizedWeight: 0.15 },
      ],
      alternatives: [
        { id: 'a_anton', name: 'Anton Wijaya (Senior Sales)', values: { c_discipline: 98, c_kpi: 115, c_teamwork: 8.5, c_innovation: 7.5, c_complaints: 1 } },
        { id: 'a_bella', name: 'Bella Octavia (Tech Lead)', values: { c_discipline: 95, c_kpi: 105, c_teamwork: 9.5, c_innovation: 9.0, c_complaints: 0 } },
        { id: 'a_cahyo', name: 'Cahyo Wibowo (Product Ops)', values: { c_discipline: 99, c_kpi: 100, c_teamwork: 8.0, c_innovation: 8.0, c_complaints: 0 } },
      ],
    },
  },
];
