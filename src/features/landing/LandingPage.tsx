import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '@/components/layout/Logo';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DecimalFormatToggle from '@/components/layout/DecimalFormatToggle';
import { useUiStore } from '@/store/useUiStore';
import { prefetchRoute, scheduleAllRemainingPrefetch } from '@/services/routePrefetch';
import {
  ArrowRight,
  Calculator,
  Layers,
  Compass,
  Sliders,
  BarChart3,
  Star,
  Github,
  CheckCircle2,
  FileText,
  Table,
  Sparkles,
} from 'lucide-react';

export type CoreMethodId = 'SAW' | 'WP' | 'TOPSIS' | 'AHP';

interface MethodItem {
  id: CoreMethodId;
  acronym: string;
  title: string;
  subtitle: string;
  desc: string;
  mathHighlight: string;
  icon: React.ReactNode;
}

const METHODS: MethodItem[] = [
  {
    id: 'SAW',
    acronym: 'SAW',
    title: 'Simple Additive Weighting',
    subtitle: 'Normalisasi Aditif Linear',
    desc: 'Metode penjumlahan terbobot dengan normalisasi linear pada kriteria benefit dan cost. Menghasilkan skor preferensi proporsional.',
    mathHighlight: 'V_i = \\sum w_j \\cdot r_{ij}',
    icon: <Calculator className="w-4 h-4 text-indigo-600" />,
  },
  {
    id: 'WP',
    acronym: 'WP',
    title: 'Weighted Product',
    subtitle: 'Perkalian Eksponensial',
    desc: 'Menghubungkan atribut melalui perkalian berpangkat dengan bobot ternormalisasi. Efektif menangani skala nilai multi-dimensi.',
    mathHighlight: 'S_i = \\prod x_{ij}^{w_j}',
    icon: <Layers className="w-4 h-4 text-indigo-600" />,
  },
  {
    id: 'TOPSIS',
    acronym: 'TOPSIS',
    title: 'Technique for Order Preference',
    subtitle: 'Geometri Solusi Ideal',
    desc: 'Mengukur jarak Euclidean relatif terhadap solusi ideal positif (A+) dan negatif (A−) untuk menentukan alternatif kompromi terbaik.',
    mathHighlight: 'C_i = \\frac{D_i^-}{D_i^+ + D_i^-}',
    icon: <Compass className="w-4 h-4 text-indigo-600" />,
  },
  {
    id: 'AHP',
    acronym: 'AHP',
    title: 'Analytic Hierarchy Process',
    subtitle: 'Perbandingan Berpasangan Saaty',
    desc: 'Dekomposisi hierarki keputusan dengan matriks perbandingan pairwise serta kalkulasi otomatis rasio konsistensi logis (CR < 0.1).',
    mathHighlight: 'CR = \\frac{CI}{RI} < 0.10',
    icon: <Sliders className="w-4 h-4 text-indigo-600" />,
  },
];

interface SimulationData {
  scenario: string;
  headers: string[];
  rows: Array<{ name: string; values: number[]; score: string; rank: number }>;
  formulaNote: string;
  formulaCode: string;
}

const SIMULATIONS: Record<CoreMethodId, SimulationData> = {
  SAW: {
    scenario: 'Studi Kasus: Pemilihan Vendor Solusi Cloud',
    headers: ['Alternatif', 'Keandalan (40%)', 'Biaya (35%)', 'Dukungan (25%)'],
    rows: [
      { name: 'Vendor Alpha', values: [90, 75, 88], score: '0.845', rank: 1 },
      { name: 'Vendor Beta', values: [82, 85, 80], score: '0.812', rank: 2 },
      { name: 'Vendor Gamma', values: [78, 65, 92], score: '0.748', rank: 3 },
    ],
    formulaNote: 'Normalisasi matriks terbobot linear (Benefit & Cost)',
    formulaCode: 'V_i = (0.40 × r_i1) + (0.35 × r_i2) + (0.25 × r_i3)',
  },
  WP: {
    scenario: 'Studi Kasus: Pemilihan Vendor Solusi Cloud',
    headers: ['Alternatif', 'Keandalan (w=0.40)', 'Biaya (w=0.35)', 'Dukungan (w=0.25)'],
    rows: [
      { name: 'Vendor Alpha', values: [90, 75, 88], score: '0.362', rank: 1 },
      { name: 'Vendor Beta', values: [82, 85, 80], score: '0.334', rank: 2 },
      { name: 'Vendor Gamma', values: [78, 65, 92], score: '0.304', rank: 3 },
    ],
    formulaNote: 'Vektor preferensi relatif hasil perkalian eksponensial',
    formulaCode: 'S_i = (x_i1)^0.40 × (x_i2)^0.35 × (x_i3)^0.25',
  },
  TOPSIS: {
    scenario: 'Studi Kasus: Pemilihan Vendor Solusi Cloud',
    headers: ['Alternatif', 'Jarak Ideal (D+)', 'Jarak Anti-Ideal (D-)', 'Kedekatan Relatif'],
    rows: [
      { name: 'Vendor Beta', values: [0.032, 0.071, 0.82], score: '0.689', rank: 1 },
      { name: 'Vendor Alpha', values: [0.041, 0.065, 0.78], score: '0.613', rank: 2 },
      { name: 'Vendor Gamma', values: [0.068, 0.038, 0.62], score: '0.358', rank: 3 },
    ],
    formulaNote: 'Kedekatan relatif Euclidean terhadap solusi ideal positif (A+)',
    formulaCode: 'C_i = D_i^- / (D_i^+ + D_i^-) → Nilai optimum mendekati 1.0',
  },
  AHP: {
    scenario: 'Studi Kasus: Pembobotan Kriteria Vendor TI',
    headers: ['Kriteria', 'Bobot Prioritas', 'Vektor Eigen', 'Keterangan'],
    rows: [
      { name: 'Keandalan Teknis', values: [43, 0.432, 1], score: '43.2%', rank: 1 },
      { name: 'Efisiensi Biaya', values: [36, 0.361, 2], score: '36.1%', rank: 2 },
      { name: 'Dukungan SLA', values: [20, 0.207, 3], score: '20.7%', rank: 3 },
    ],
    formulaNote: 'Uji konsistensi rasio Saaty dengan indeks acak (RI)',
    formulaCode: 'λ_max = 3.048, CI = 0.024, CR = 0.041 < 0.10 (Konsisten)',
  },
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [activePreviewMethod, setActivePreviewMethod] = useState<CoreMethodId>('SAW');

  useEffect(() => {
    const cancel = scheduleAllRemainingPrefetch('landing');
    return () => cancel();
  }, []);

  const handleOpenMethod = (methodId: CoreMethodId) => {
    useUiStore.getState().setActiveTab(methodId);
    navigate(`/board?tab=${methodId.toLowerCase()}`);
  };

  const currentSim = SIMULATIONS[activePreviewMethod];

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
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Review</span>
            </Link>
            <Link
              to="/analytics"
              onMouseEnter={prefetchRoute.analytics}
              onFocus={prefetchRoute.analytics}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Analitik</span>
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
          HERO & ASYMMETRIC FOCAL POINT
      ========================================================================== */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Authoritative Context & Action (7 cols) */}
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
                Bandingkan peringkat alternatif secara terpadu melalui 4 metode matematis teruji: SAW, WP, TOPSIS, dan AHP. Dilengkapi inspeksi rumus KaTeX per sel matriks dan validasi konsistensi hierarki.
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
                <span>Traceability Rumus KaTeX</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Konsistensi AHP (CR &lt; 0.1)</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Laporan Siap Cetak (A4)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Decision Engine Preview (6 cols) */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              {/* Preview Header & Method Switcher */}
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-slate-700">Simulasi Matriks Keputusan</span>
                </div>

                <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-[11px] font-mono">
                  {METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setActivePreviewMethod(m.id)}
                      className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                        activePreviewMethod === m.id
                          ? 'bg-white text-indigo-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {m.acronym}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scenario Context */}
              <div className="p-4 space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{currentSim.scenario}</span>
                  <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
                    Metode: {activePreviewMethod}
                  </Badge>
                </div>

                {/* Mini Matrix Preview Table */}
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                        {currentSim.headers.map((h, idx) => (
                          <th key={idx} className={`py-2 px-3 ${idx > 0 ? 'text-center font-mono' : ''}`}>
                            {h}
                          </th>
                        ))}
                        <th className="py-2 px-3 text-right font-mono">Skor Akhir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {currentSim.rows.map((r) => (
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

                {/* Active Formula Note */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">{currentSim.formulaNote}</span>
                    <span className="text-indigo-600 font-mono font-semibold text-[10px]">
                      Peringkat #1: {currentSim.rows[0].name}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 truncate">
                    {currentSim.formulaCode}
                  </div>
                </div>

                {/* Quick Link into Workboard with Active Method */}
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
            BENTO METHODS GRID
        ========================================================================== */}
        <section className="space-y-4 pt-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              4 Landasan Teoretis Pengambilan Keputusan Terpadu
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pilih metode yang sesuai dengan struktur data, jenis kriteria, dan kebutuhan objektivitas analisis Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {METHODS.map((m) => (
              <div
                key={m.id}
                tabIndex={0}
                role="button"
                onClick={() => handleOpenMethod(m.id)}
                onMouseEnter={() => prefetchRoute.board(m.id.toLowerCase())}
                onFocus={() => prefetchRoute.board(m.id.toLowerCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenMethod(m.id);
                  }
                }}
                className="group p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-colors duration-150 cursor-pointer flex flex-col justify-between space-y-3 shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-white border border-slate-200/80 transition-colors">
                        {m.icon}
                      </div>
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {m.acronym}
                      </span>
                    </div>
                    <Badge variant="neutral" size="sm" className="text-[10px] font-medium">
                      {m.subtitle}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                      {m.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-500 text-[10px]">
                    {m.mathHighlight}
                  </span>
                  <span className="font-medium text-slate-600 group-hover:text-indigo-600 flex items-center gap-1 transition-colors">
                    Buka Kalkulasi
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            FEATURE PILLARS / TECHNICAL CAPABILITIES
        ========================================================================== */}
        <section className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-slate-600">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Table className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Inspeksi Rumus Per Sel</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Verifikasi tahap normalisasi, pembobotan, dan perankingan secara langsung melalui tooltip KaTeX matematis di setiap sel.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <BarChart3 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Analisis Pergeseran Peringkat</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Lakukan komparasi sensitivitas peringkat alternatif secara berdampingan untuk menilai stabilitas rekomendasi keputusan.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Ekstraksi Kasus ke Matriks</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Konversikan narasi studi kasus atau cerita kualitatif menjadi matriks alternatif dan kriteria terstruktur secara otomatis.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Laporan Siap Cetak (A4)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Ekspor dokumentasi formal lengkap dengan tabel matriks awal, normalisasi, dan kesimpulan peringkat dalam format PDF.
              </p>
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
