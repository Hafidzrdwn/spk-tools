import React from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/layout/Logo';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DecimalFormatToggle from '@/components/layout/DecimalFormatToggle';
import { useUiStore } from '@/store/useUiStore';
import {
  ArrowRight,
  Calculator,
  Layers,
  Compass,
  Sliders,
  Sparkles,
  BarChart3,
  Star,
  Github,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const setCurrentView = useUiStore((s) => s.setCurrentView);
  const currentYear = new Date().getFullYear();

  const methods = [
    {
      id: 'SAW',
      title: 'Simple Additive Weighting',
      acronym: 'SAW',
      formula: 'V_i = \\sum w_j r_{ij}',
      tag: 'Aditif Linear',
      color: 'from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-200/80 text-indigo-700',
      icon: <Calculator className="w-4 h-4 text-indigo-600" />,
      desc: 'Normalisasi matriks terbobot linear. Ideal untuk penilaian kriteria proporsional langsung.',
    },
    {
      id: 'WP',
      title: 'Weighted Product',
      acronym: 'WP',
      formula: 'S_i = \\prod x_{ij}^{w_j}',
      tag: 'Perkalian Pangkat',
      color: 'from-violet-500/10 via-violet-500/5 to-transparent border-violet-200/80 text-violet-700',
      icon: <Layers className="w-4 h-4 text-violet-600" />,
      desc: 'Perkalian eksponensial matematis. Efektif menangani skala nilai multi-dimensi.',
    },
    {
      id: 'TOPSIS',
      title: 'Technique for Order Preference',
      acronym: 'TOPSIS',
      formula: 'C_i = \\frac{D_i^-}{D_i^+ + D_i^-}',
      tag: 'Jarak Geometris',
      color: 'from-sky-500/10 via-sky-500/5 to-transparent border-sky-200/80 text-sky-700',
      icon: <Compass className="w-4 h-4 text-sky-600" />,
      desc: 'Mengukur kedekatan jarak Euclidean relatif terhadap solusi ideal positif (A+) & negatif (A−).',
    },
    {
      id: 'AHP',
      title: 'Analytic Hierarchy Process',
      acronym: 'AHP',
      formula: 'CR = \\frac{CI}{RI} \\le 0.10',
      tag: 'Uji Konsistensi',
      color: 'from-purple-500/10 via-purple-500/5 to-transparent border-purple-200/80 text-purple-700',
      icon: <Sliders className="w-4 h-4 text-purple-600" />,
      desc: 'Matriks perbandingan berpasangan Saaty dengan kalkulasi otomatis rasio konsistensi (CR).',
    },
  ];

  return (
    <div className="h-screen max-h-screen w-full overflow-hidden flex flex-col justify-between bg-slate-900 text-slate-100 relative select-none">
      {/* Background Decorative Gradients & Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* =========================================================================
          TOP NAVBAR
      ========================================================================== */}
      <header className="relative z-10 w-full px-6 py-3 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" showWordmark />
            <span className="text-slate-700">|</span>
            <Badge variant="primary" size="sm" className="font-bold text-[10px]">
              v1.1 Refinement
            </Badge>
          </div>

          <nav className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentView('community')}
              className="text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Review & Web Analytics</span>
            </button>

            <a
              href="https://github.com/hafidzrdwn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800/60"
              title="GitHub Repository"
              aria-label="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setCurrentView('workboard')}
              className="shadow-lg shadow-indigo-500/20 text-xs font-semibold"
            >
              <span>Buka Workboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </nav>
        </div>
      </header>

      {/* =========================================================================
          HERO MAIN CONTENT (FITS EXACT VIEWPORT)
      ========================================================================== */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 flex flex-col justify-center gap-4 py-2">
        {/* Headline & Value Proposition */}
        <div className="text-center space-y-2.5 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Multi-Criteria Decision Analysis Engine & Transparency Inspector</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-[42px] font-extrabold tracking-tight text-white leading-tight"
          >
            Kalkulasi Transparan, <br className="hidden sm:inline" />
            <span className="bg-linear-to-r from-indigo-400 via-purple-300 to-sky-400 bg-clip-text text-transparent">
              Keputusan Lebih Percaya Diri.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto"
          >
            Evaluasi alternatif keputusan menggunakan 4 metode teruji (SAW, WP, TOPSIS, AHP) secara simultan. Dilengkapi inspeksi rumus KaTeX per sel matriks dan konversi cerita ke matriks (*Story-to-Matrix*) secara otomatis.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 pt-1"
          >
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentView('workboard')}
              className="px-6 py-2.5 text-sm font-bold shadow-xl shadow-indigo-600/30 bg-indigo-600 hover:bg-indigo-500 cursor-pointer"
            >
              <span>Mulai Evaluasi SPK Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={() => setCurrentView('community')}
              className="px-5 py-2.5 text-sm font-semibold bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-accent-primary" />
              <span>Lihat Review & Analytics</span>
            </Button>
          </motion.div>
        </div>

        {/* =======================================================================
            4 METHOD SHOWCASE CARDS (COMPACT & MODERN)
        ======================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2"
        >
          {methods.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                useUiStore.getState().setActiveTab(m.id as any);
                setCurrentView('workboard');
              }}
              className="group p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/70 hover:border-indigo-400/50 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2 backdrop-blur-xs shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-700/60 group-hover:bg-indigo-500/20 transition-colors">
                    {m.icon}
                  </div>
                  <span className="font-mono font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                    {m.acronym}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 px-1.5 py-0.5 rounded bg-slate-700/50">
                  {m.tag}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                {m.desc}
              </p>

              <div className="pt-1 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span className="truncate">Klik untuk kalkulasi</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Feature Badges Pill Row */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Traceability KaTeX Per Sel</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Multi-Method Rank Shift Analysis</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ekspor PDF Siap Cetak (A4)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Firebase Realtime DB</span>
          </span>
        </div>
      </main>

      {/* =========================================================================
          BOTTOM STATUS BAR
      ========================================================================== */}
      <footer className="relative z-10 w-full px-6 py-2.5 border-t border-slate-800/80 bg-slate-900/80 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span>&copy; {currentYear} DecisiGraph v1.1 &mdash; Dibuat oleh Hafidz Ridwan</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Pemisah Desimal:</span>
            <DecimalFormatToggle />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
