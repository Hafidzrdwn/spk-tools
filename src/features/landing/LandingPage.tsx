import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '@/components/layout/Logo';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DecimalFormatToggle from '@/components/layout/DecimalFormatToggle';
import MathFormula from '@/components/ui/MathFormula';
import { useUiStore } from '@/store/useUiStore';
import { prefetchRoute, scheduleAllRemainingPrefetch } from '@/services/routePrefetch';
import {
  ArrowRight,
  Github,
  CheckCircle2,
  FileText,
  Sparkles,
  Binary,
} from 'lucide-react';

export type CoreMethodId = 'SAW' | 'WP' | 'TOPSIS' | 'AHP';

interface StudioMethodData {
  id: CoreMethodId;
  acronym: string;
  name: string;
  category: string;
  summary: string;
  primaryFormula: string;
  normalizationFormula: string;
  legend: Array<{ symbol: string; meaning: string }>;
  pipeline: [string, string, string];
  specs: {
    scaleType: string;
    sensitivity: string;
    assumptions: string;
    idealFor: string;
  };
}

const STUDIO_METHODS: Record<CoreMethodId, StudioMethodData> = {
  SAW: {
    id: 'SAW',
    acronym: 'SAW',
    name: 'Simple Additive Weighting',
    category: 'Normalisasi Aditif Linear',
    summary: 'Menjumlahkan perkalian bobot kriteria dengan nilai rating kinerja yang telah dinormalisasi secara proporsional linier.',
    primaryFormula: 'V_i = \\sum_{j=1}^{n} w_j \\cdot r_{ij}',
    normalizationFormula: 'r_{ij} = \\begin{cases} \\dfrac{x_{ij}}{\\max_k(x_{kj})}, & \\text{Benefit} \\\\[8pt] \\dfrac{\\min_k(x_{kj})}{x_{ij}}, & \\text{Cost} \\end{cases}',
    legend: [
      { symbol: 'V_i', meaning: 'Nilai preferensi akhir alternatif ke-i' },
      { symbol: 'w_j', meaning: 'Bobot kepentingan kriteria ke-j (Σ w = 1.0)' },
      { symbol: 'r_{ij}', meaning: 'Elemen matriks normalisasi kinerja linear' },
    ],
    pipeline: [
      'Input Matriks Keputusan Mentah (X)',
      'Normalisasi Terbobot Linear Rentang [0, 1] (R)',
      'Penjumlahan Aditif Menghasilkan Vektor Preferensi (V)',
    ],
    specs: {
      scaleType: 'Linear Proporsional [0, 1]',
      sensitivity: 'Stabil pada data berskala independen',
      assumptions: 'Kriteria tidak saling berkorelasi langsung',
      idealFor: 'Seleksi kandidat pegawai, beasiswa, evaluasi vendor barang',
    },
  },
  WP: {
    id: 'WP',
    acronym: 'WP',
    name: 'Weighted Product',
    category: 'Perkalian Eksponensial Terbobot',
    summary: 'Menggunakan perkalian eksponensial di mana rating setiap atribut dipangkatkan dengan bobot kriteria yang telah ternormalisasi.',
    primaryFormula: 'V_i = \\frac{S_i}{\\sum_{k=1}^{m} S_k} \\quad \\text{dengan} \\quad S_i = \\prod_{j=1}^{n} \\left( x_{ij} \\right)^{w_j}',
    normalizationFormula: 'w_j = \\begin{cases} +w_j, & \\text{Benefit (pangkat positif)} \\\\[4pt] -w_j, & \\text{Cost (pangkat negatif)} \\end{cases}',
    legend: [
      { symbol: 'V_i', meaning: 'Vektor preferensi relatif alternatif ke-i' },
      { symbol: 'S_i', meaning: 'Nilai preferensi hasil perkalian eksponensial' },
      { symbol: 'w_j', meaning: 'Pangkat bobot kriteria ternormalisasi' },
    ],
    pipeline: [
      'Normalisasi Vektor Bobot (Σ w_j = 1.0)',
      'Perkalian Berpangkat Menghasilkan Vektor S',
      'Pembagian Proporsional Menghasilkan Vektor V',
    ],
    specs: {
      scaleType: 'Multiplikatif Eksponensial',
      sensitivity: 'Toleran terhadap nilai ekstrem multi-orde',
      assumptions: 'Nilai matriks positif non-nol (x > 0)',
      idealFor: 'Pemilihan lokasi fasilitas, investasi aset, komparasi hardware',
    },
  },
  TOPSIS: {
    id: 'TOPSIS',
    acronym: 'TOPSIS',
    name: 'Technique for Order Preference by Similarity to Ideal Solution',
    category: 'Jarak Geometri Solusi Ideal (Euclidean)',
    summary: 'Memilih alternatif yang memiliki jarak geometris terdekat dengan solusi ideal positif (A+) dan terjauh dari solusi ideal negatif (A−).',
    primaryFormula: 'C_i^* = \\frac{D_i^-}{D_i^+ + D_i^-} \\quad (0 \\le C_i^* \\le 1)',
    normalizationFormula: 'D_i^+ = \\sqrt{\\sum_{j=1}^n \\left( y_{ij} - y_j^+ \\right)^2}, \\quad D_i^- = \\sqrt{\\sum_{j=1}^n \\left( y_{ij} - y_j^- \\right)^2}',
    legend: [
      { symbol: 'C_i^*', meaning: 'Skor kedekatan relatif alternatif ke-i terhadap solusi ideal' },
      { symbol: 'D_i^+', meaning: 'Jarak Euclidean menuju Solusi Ideal Positif (A+)' },
      { symbol: 'D_i^-', meaning: 'Jarak Euclidean menuju Solusi Ideal Negatif (A−)' },
    ],
    pipeline: [
      'Normalisasi Vektor Euclidean (Matriks R)',
      'Pembentukan Matriks Terbobot (Y) & Titik Ideal (A+, A-)',
      'Kalkulasi Jarak Euclidean & Skor Kedekatan Relatif (C*)',
    ],
    specs: {
      scaleType: 'Ruang Metrik Geometris Euclidean n-Dimensi',
      sensitivity: 'Tinggi terhadap kompromi jarak optimum',
      assumptions: 'Preferensi bertambah secara monoton',
      idealFor: 'Pemilihan sistem software enterprise, supplier strategis, tender kompleks',
    },
  },
  AHP: {
    id: 'AHP',
    acronym: 'AHP',
    name: 'Analytic Hierarchy Process',
    category: 'Dekomposisi Matriks Perbandingan Saaty',
    summary: 'Menyusun hierarki keputusan dengan membandingkan pasangan kriteria pada skala 1–9 Saaty dan menguji rasio konsistensi logis (CR).',
    primaryFormula: 'CR = \\frac{CI}{RI} < 0.10 \\quad \\text{dengan} \\quad CI = \\frac{\\lambda_{\\max} - n}{n - 1}',
    normalizationFormula: 'A \\cdot w = \\lambda_{\\max} \\cdot w, \\quad a_{ji} = \\frac{1}{a_{ij}}, \\quad a_{ii} = 1',
    legend: [
      { symbol: 'CR', meaning: 'Rasio Konsistensi (valid jika nilai CR < 0.10 / 10%)' },
      { symbol: 'CI', meaning: 'Indeks Konsistensi matriks perbandingan pairwise' },
      { symbol: 'λ_{max}', meaning: 'Nilai eigen maksimum dari matriks resiprokal Saaty' },
    ],
    pipeline: [
      'Penyusunan Matriks Resiprokal Berpasangan (n × n)',
      'Kalkulasi Vektor Eigen Utama (Prioritas Bobot)',
      'Uji Rasio Konsistensi Saaty (CR < 0.10)',
    ],
    specs: {
      scaleType: 'Skala Fundamental Saaty (1–9 Resiprokal)',
      sensitivity: 'Mendeteksi inkonsistensi pertimbangan manusia',
      assumptions: 'Aksioma transitivitas perbandingan berpasangan',
      idealFor: 'Penetapan bobot strategis, keputusan multi-level kualitatif',
    },
  },
};

interface HeroSimulationData {
  scenario: string;
  headers: string[];
  rows: Array<{ name: string; values: number[]; score: string; rank: number }>;
  formulaLatex: string;
  formulaSubtitle: string;
}

const HERO_SIMULATIONS: Record<CoreMethodId, HeroSimulationData> = {
  SAW: {
    scenario: 'Studi Kasus: Pemilihan Vendor Solusi Cloud Enterprise',
    headers: ['Alternatif', 'Keandalan (w=0.40)', 'Biaya (w=0.35)', 'Dukungan (w=0.25)'],
    rows: [
      { name: 'Vendor Alpha', values: [90, 75, 88], score: '0.845', rank: 1 },
      { name: 'Vendor Beta', values: [82, 85, 80], score: '0.812', rank: 2 },
      { name: 'Vendor Gamma', values: [78, 65, 92], score: '0.748', rank: 3 },
    ],
    formulaLatex: 'V_1 = (0.40 \\times 1.00) + (0.35 \\times 0.88) + (0.25 \\times 0.96) = 0.845',
    formulaSubtitle: 'Normalisasi matriks terbobot linear (Benefit & Cost)',
  },
  WP: {
    scenario: 'Studi Kasus: Pemilihan Vendor Solusi Cloud Enterprise',
    headers: ['Alternatif', 'Keandalan (w=0.40)', 'Biaya (w=0.35)', 'Dukungan (w=0.25)'],
    rows: [
      { name: 'Vendor Alpha', values: [90, 75, 88], score: '0.362', rank: 1 },
      { name: 'Vendor Beta', values: [82, 85, 80], score: '0.334', rank: 2 },
      { name: 'Vendor Gamma', values: [78, 65, 92], score: '0.304', rank: 3 },
    ],
    formulaLatex: 'S_1 = (90)^{0.40} \\cdot (75)^{0.35} \\cdot (88)^{0.25} = 83.47 \\implies V_1 = 0.362',
    formulaSubtitle: 'Vektor preferensi relatif hasil perkalian eksponensial',
  },
  TOPSIS: {
    scenario: 'Studi Kasus: Pemilihan Vendor Solusi Cloud Enterprise',
    headers: ['Alternatif', 'Jarak Ideal (D+)', 'Jarak Anti-Ideal (D-)', 'Kedekatan (C*)'],
    rows: [
      { name: 'Vendor Beta', values: [0.032, 0.071, 0.82], score: '0.689', rank: 1 },
      { name: 'Vendor Alpha', values: [0.041, 0.065, 0.78], score: '0.613', rank: 2 },
      { name: 'Vendor Gamma', values: [0.068, 0.038, 0.62], score: '0.358', rank: 3 },
    ],
    formulaLatex: 'C_2^* = \\frac{D_2^-}{D_2^+ + D_2^-} = \\frac{0.071}{0.032 + 0.071} = 0.689',
    formulaSubtitle: 'Kedekatan relatif Euclidean terhadap solusi ideal positif (A+)',
  },
  AHP: {
    scenario: 'Studi Kasus: Pembobotan Kriteria Pemilihan Vendor TI',
    headers: ['Kriteria', 'Bobot Prioritas', 'Vektor Eigen', 'Keterangan'],
    rows: [
      { name: 'Keandalan Teknis', values: [43, 0.432, 1], score: '43.2%', rank: 1 },
      { name: 'Efisiensi Biaya', values: [36, 0.361, 2], score: '36.1%', rank: 2 },
      { name: 'Dukungan SLA', values: [20, 0.207, 3], score: '20.7%', rank: 3 },
    ],
    formulaLatex: 'CR = \\frac{CI}{RI} = \\frac{0.024}{0.58} = 0.041 < 0.10 \\quad (\\text{Konsisten})',
    formulaSubtitle: 'Uji rasio konsistensi Saaty dengan indeks acak (RI)',
  },
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [activePreviewMethod, setActivePreviewMethod] = useState<CoreMethodId>('SAW');
  const [activeStudioMethod, setActiveStudioMethod] = useState<CoreMethodId>('SAW');

  useEffect(() => {
    const cancel = scheduleAllRemainingPrefetch('landing');
    return () => cancel();
  }, []);

  const handleOpenMethod = (methodId: CoreMethodId) => {
    useUiStore.getState().setActiveTab(methodId);
    navigate(`/board?tab=${methodId.toLowerCase()}`);
  };

  const currentHeroSim = HERO_SIMULATIONS[activePreviewMethod];
  const currentStudio = STUDIO_METHODS[activeStudioMethod];

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-surface bg-dot-grid text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* =========================================================================
          TOP NAVBAR
      ========================================================================== */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-6 py-3 border-b border-slate-200/90 bg-white/95 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              onMouseEnter={prefetchRoute.landing}
              onFocus={prefetchRoute.landing}
              className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
              title="DecisiGraph SPK"
            >
              <Logo size="md" showWordmark />
            </Link>
            <span className="text-slate-300">|</span>
            <Badge variant="primary" size="sm" className="font-bold text-[10px] py-0 px-1.5">
              v1.1
            </Badge>
          </div>

          <nav className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/board"
              onMouseEnter={() => prefetchRoute.board()}
              onFocus={() => prefetchRoute.board()}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors hidden sm:block"
            >
              Workboard
            </Link>
            <Link
              to="/review"
              onMouseEnter={prefetchRoute.review}
              onFocus={prefetchRoute.review}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Komunitas
            </Link>

            <a
              href="https://github.com/hafidzrdwn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="GitHub Repository"
              aria-label="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>

            <div className="h-4 w-px bg-slate-200 hidden sm:block mx-1" />

            <Button
              variant="primary"
              size="sm"
              onMouseEnter={() => prefetchRoute.board()}
              onFocus={() => prefetchRoute.board()}
              onClick={() => navigate('/board')}
              className="text-xs font-semibold shadow-2xs gap-1.5"
            >
              <span>Mulai Evaluasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </nav>
        </div>
      </header>

      {/* =========================================================================
          HERO & LIVE DECISION PREVIEW
      ========================================================================== */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-14">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Context & Primary CTAs (6 cols) */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              <span>Sistem Pendukung Keputusan Multi-Metode</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Evaluasi Alternatif Keputusan Secara Terukur & Objektif.
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Bandingkan peringkat alternatif secara simultan melalui 4 metode matematis teruji: SAW, WP, TOPSIS, dan AHP. Dilengkapi inspeksi rumus KaTeX per sel matriks dan validasi konsistensi hierarki.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                variant="primary"
                size="md"
                onMouseEnter={() => prefetchRoute.board()}
                onFocus={() => prefetchRoute.board()}
                onClick={() => navigate('/board')}
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-2xs gap-2"
              >
                <span>Buka Workboard Evaluasi</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                variant="secondary"
                size="md"
                onMouseEnter={prefetchRoute.review}
                onFocus={prefetchRoute.review}
                onClick={() => navigate('/review')}
                className="px-4 py-2.5 text-xs sm:text-sm font-medium border-slate-200 text-slate-700 hover:text-slate-900"
              >
                <span>Ulasan & Masukan</span>
              </Button>
            </div>

            {/* Micro Feature Proof */}
            <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Formula KaTeX per Sel</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Uji Konsistensi CR &lt; 0.1</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Laporan Siap Cetak (A4)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Decision Simulation (6 cols) */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              {/* Preview Header & Method Switcher */}
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-slate-700">Simulasi Matriks Keputusan</span>
                </div>

                <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-[11px] font-mono">
                  {(['SAW', 'WP', 'TOPSIS', 'AHP'] as CoreMethodId[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setActivePreviewMethod(m)}
                      className={`px-2.5 py-1 rounded font-bold transition-colors cursor-pointer ${
                        activePreviewMethod === m
                          ? 'bg-white text-indigo-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scenario Context */}
              <div className="p-4 space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 truncate pr-2">{currentHeroSim.scenario}</span>
                  <Badge variant="neutral" size="sm" className="font-mono text-[10px] shrink-0">
                    {activePreviewMethod}
                  </Badge>
                </div>

                {/* Mini Matrix Preview Table */}
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                        {currentHeroSim.headers.map((h, idx) => (
                          <th key={idx} className={`py-2 px-3 ${idx > 0 ? 'text-center font-mono' : ''}`}>
                            {h}
                          </th>
                        ))}
                        <th className="py-2 px-3 text-right font-mono">Skor Akhir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {currentHeroSim.rows.map((r) => (
                        <tr
                          key={r.name}
                          className={`transition-colors ${
                            r.rank === 1 ? 'bg-indigo-50/40 font-medium' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2 px-3 text-slate-800 flex items-center gap-1.5">
                            {r.rank === 1 ? (
                              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                1
                              </span>
                            ) : (
                              <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium flex items-center justify-center shrink-0">
                                {r.rank}
                              </span>
                            )}
                            <span className="font-medium text-slate-900">{r.name}</span>
                          </td>
                          {r.values.map((v, vIdx) => (
                            <td key={vIdx} className="py-2 px-3 text-center text-slate-600 font-mono">
                              {typeof v === 'number' && v < 1 ? v.toFixed(3) : v}
                            </td>
                          ))}
                          <td className="py-2 px-3 text-right font-mono font-bold text-indigo-700">
                            {r.score}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* KaTeX Formula Box in Hero Simulation */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/90 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">{currentHeroSim.formulaSubtitle}</span>
                    <span className="text-indigo-600 font-mono font-semibold text-[10px]">
                      Peringkat #1: {currentHeroSim.rows[0].name}
                    </span>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded border border-slate-200 overflow-x-auto text-xs text-slate-800">
                    <MathFormula math={currentHeroSim.formulaLatex} className="my-0 py-0.5 text-xs text-slate-800" />
                  </div>
                </div>

                {/* Direct Action Link */}
                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Buka studi kasus lengkap pada workboard</span>
                  <button
                    type="button"
                    onClick={() => handleOpenMethod(activePreviewMethod)}
                    onMouseEnter={() => prefetchRoute.board(activePreviewMethod.toLowerCase())}
                    onFocus={() => prefetchRoute.board(activePreviewMethod.toLowerCase())}
                    className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    <span>Lanjutkan ke {activePreviewMethod}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            INTERACTIVE METHOD STUDIO & FORMULATION BLUEPRINT (SPACIOUS MASTER-DETAIL)
        ========================================================================== */}
        <section className="space-y-6">
          <div className="space-y-1 text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 uppercase tracking-wider font-mono">
              <Binary className="w-3.5 h-3.5" />
              <span>Studio Komparasi Matematis</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Karakteristik & Formulasi Teoretis 4 Metode SPK
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pilih metode untuk menelaah formulasi matematis, syarat normalisasi, dan alur perhitungannya secara transparan.
            </p>
          </div>

          {/* Spacious Horizontal Method Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-1.5 bg-slate-100/80 rounded-xl border border-slate-200">
            {(['SAW', 'WP', 'TOPSIS', 'AHP'] as CoreMethodId[]).map((mId) => {
              const data = STUDIO_METHODS[mId];
              const isActive = activeStudioMethod === mId;
              return (
                <button
                  key={mId}
                  type="button"
                  onClick={() => setActiveStudioMethod(mId)}
                  className={`p-3 rounded-lg text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                    isActive
                      ? 'bg-white border border-slate-300/80 shadow-xs'
                      : 'hover:bg-white/50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-mono font-bold text-xs ${isActive ? 'text-indigo-600' : 'text-slate-800'}`}>
                      {data.acronym}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      isActive ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200/60 text-slate-600'
                    }`}>
                      {data.id === 'SAW' ? 'Aditif' : data.id === 'WP' ? 'Pangkat' : data.id === 'TOPSIS' ? 'Geometris' : 'Hierarki'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {data.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Master Detail Split Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              {/* Left Column: Mathematical Formulation Stage (6 cols) */}
              <div className="lg:col-span-6 p-6 sm:p-7 space-y-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                      {currentStudio.acronym}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {currentStudio.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {currentStudio.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {currentStudio.summary}
                  </p>
                </div>

                {/* Primary KaTeX Formula Display */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Formula Matematis Utama:
                  </span>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 space-y-3">
                    <MathFormula math={currentStudio.primaryFormula} className="text-sm sm:text-base font-semibold py-1" />
                    <div className="border-t border-slate-200/80 pt-2.5">
                      <span className="text-[10px] font-semibold text-slate-500 block mb-1">
                        Persamaan Normalisasi / Uji Pendukung:
                      </span>
                      <MathFormula math={currentStudio.normalizationFormula} className="text-xs sm:text-sm py-0.5" />
                    </div>
                  </div>
                </div>

                {/* Variable Legend */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Definisi Variabel Formula:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-600">
                    {currentStudio.legend.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50/70 px-2.5 py-1.5 rounded-lg border border-slate-200/70">
                        <span className="font-mono font-bold text-indigo-700 shrink-0 min-w-8">
                          <MathFormula math={item.symbol} inline className="font-bold" />
                        </span>
                        <span className="text-slate-700 text-[11px]">{item.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA Button */}
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleOpenMethod(currentStudio.id)}
                    onMouseEnter={() => prefetchRoute.board(currentStudio.id.toLowerCase())}
                    onFocus={() => prefetchRoute.board(currentStudio.id.toLowerCase())}
                    className="w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-2xs gap-2"
                  >
                    <span>Buka Evaluasi {currentStudio.acronym} di Workboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Right Column: Pipeline Architecture & Data Profile (6 cols) */}
              <div className="lg:col-span-6 p-6 sm:p-7 bg-slate-50/50 space-y-6 flex flex-col justify-between">
                {/* 3-Stage Calculation Pipeline */}
                <div className="space-y-3">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Alur Transformasi Data {currentStudio.acronym}:
                  </span>
                  <div className="space-y-2.5">
                    {currentStudio.pipeline.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <span className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200/70 text-indigo-700 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-800 block">
                            {idx === 0 ? 'Fase Input Data' : idx === 1 ? 'Fase Transformasi Matriks' : 'Fase Penentuan Peringkat'}
                          </span>
                          <span className="text-[11px] text-slate-600 leading-snug block">
                            {step}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Characteristic Specification Matrix */}
                <div className="space-y-2 pt-2 border-t border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Profil Karakteristik Analisis:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-0.5">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Karakter Skala:</span>
                      <span className="text-[11px] font-bold text-slate-800 block">{currentStudio.specs.scaleType}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-0.5">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Sensitivitas:</span>
                      <span className="text-[11px] font-bold text-slate-800 block">{currentStudio.specs.sensitivity}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-0.5 col-span-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Asumsi Dasar:</span>
                      <span className="text-[11px] text-slate-700 block">{currentStudio.specs.assumptions}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-0.5 col-span-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Rekomendasi Kasus:</span>
                      <span className="text-[11px] text-indigo-700 font-medium block">{currentStudio.specs.idealFor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            FEATURE ARCHITECTURE MATRIX (NO MONOTONOUS ICON BOXES)
        ========================================================================== */}
        <section className="space-y-4">
          <div className="space-y-1 text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Kapabilitas Teknis & Standar Transparansi
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Dirancang untuk menghilangkan asumsi tertutup (*black-box*) dalam proses pengambilan keputusan multi-kriteria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Capability 1: KaTeX Traceability per Cell (7 cols) */}
            <div className="md:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60 inline-block">
                  Transparansi Formula per Sel
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Inspeksi KaTeX Real-Time Tanpa Kotak Hitam
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Setiap sel matriks normalisasi, perkalian terbobot, hingga vektor solusi ideal dapat diklik untuk melihat rumus matematis, substitusi angka riil, dan hasil pembulatan presisi.
                </p>
              </div>

              {/* Realistic Cell Inspection Preview */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Pratinjau Inspeksi Sel Matriks (Baris A1, Kolom C2):</span>
                  <span className="text-emerald-700 font-bold">Terverifikasi</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <MathFormula math="r_{12} = \frac{x_{12}}{\max(x_2)} = \frac{75}{85} = 0.8824" className="text-xs py-0 text-slate-800" />
                </div>
              </div>
            </div>

            {/* Capability 2: Cross-Method Rank Shift Analysis (5 cols) */}
            <div className="md:col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60 inline-block">
                  Analisis Komparasi
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Deteksi Pergeseran Peringkat (Rank Shift)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Evaluasi sensitivitas keputusan secara berdampingan. Ketahui apakah alternatif peringkat #1 konsisten di seluruh metode atau sensitif terhadap model matematis tertentu.
                </p>
              </div>

              {/* Consistency Indicator Visual */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
                  <span>Stabilitas Alternatif A1:</span>
                  <Badge variant="primary" size="sm" className="font-mono text-[10px]">98% Konsisten</Badge>
                </div>
                <div className="grid grid-cols-4 gap-1 text-center font-mono text-[10px]">
                  <div className="bg-white p-1 rounded border border-slate-200">SAW #1</div>
                  <div className="bg-white p-1 rounded border border-slate-200">WP #1</div>
                  <div className="bg-white p-1 rounded border border-slate-200">TOPSIS #2</div>
                  <div className="bg-white p-1 rounded border border-slate-200">AHP #1</div>
                </div>
              </div>
            </div>

            {/* Capability 3: Story-to-Matrix Converter (5 cols) */}
            <div className="md:col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60 inline-block">
                  Ekstraksi Cerita
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Konversi Kasus Narasi ke Matriks
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ubah narasi masalah keputusan, deskripsi kualitatif, atau dokumen studi kasus langsung menjadi struktur matriks kriteria dan alternatif yang siap dikalkulasi.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Otomatis memetakan nama kriteria, bobot persentase, dan tipe benefit/cost.</span>
              </div>
            </div>

            {/* Capability 4: Formal PDF Documentation (7 cols) */}
            <div className="md:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60 inline-block">
                  Ekspor Dokumen Formal
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Laporan Hasil Evaluasi PDF Siap Cetak (A4)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unduh berkas PDF formal berstandar laporan manajerial atau sidang akademik. Mencakup matriks awal, normalisasi terperinci, grafik perankingan, dan ringkasan eksekutif.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium">Format PDF Berorientasi A4 Standar ISO</span>
                </div>
                <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
                  Tabel + Grafik + Ringkasan
                </Badge>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          BOTTOM FOOTER STATUS BAR
      ========================================================================== */}
      <footer className="w-full px-4 sm:px-6 py-3 border-t border-slate-200 bg-white/90 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span>&copy; {currentYear} DecisiGraph</span>
            <span className="text-slate-300">&bull;</span>
            <Badge variant="primary" size="sm" className="text-[10px] py-0 px-1.5 font-bold">
              v1.1
            </Badge>
            <span className="text-slate-300">&bull;</span>
            <span>Platform Evaluasi SPK Terpadu</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 hidden sm:inline">Pemisah Desimal:</span>
              <DecimalFormatToggle />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
