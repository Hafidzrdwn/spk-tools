import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Sparkles,
  BarChart3,
  Star,
  Github,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const methods = [
    {
      id: 'SAW',
      title: 'Simple Additive Weighting',
      acronym: 'SAW',
      tag: 'Aditif Linear',
      accentBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      icon: <Calculator className="w-4 h-4 text-indigo-600" />,
      desc: 'Normalisasi matriks terbobot linear. Ideal untuk penilaian kriteria proporsional langsung.',
    },
    {
      id: 'WP',
      title: 'Weighted Product',
      acronym: 'WP',
      tag: 'Perkalian Pangkat',
      accentBg: 'bg-violet-50 text-violet-700 border-violet-200/80',
      icon: <Layers className="w-4 h-4 text-violet-600" />,
      desc: 'Perkalian eksponensial matematis. Efektif menangani skala nilai multi-dimensi.',
    },
    {
      id: 'TOPSIS',
      title: 'Technique for Order Preference',
      acronym: 'TOPSIS',
      tag: 'Jarak Geometris',
      accentBg: 'bg-sky-50 text-sky-700 border-sky-200/80',
      icon: <Compass className="w-4 h-4 text-sky-600" />,
      desc: 'Mengukur kedekatan Euclidean relatif terhadap solusi ideal positif (A+) dan negatif (A−).',
    },
    {
      id: 'AHP',
      title: 'Analytic Hierarchy Process',
      acronym: 'AHP',
      tag: 'Uji Konsistensi',
      accentBg: 'bg-purple-50 text-purple-700 border-purple-200/80',
      icon: <Sliders className="w-4 h-4 text-purple-600" />,
      desc: 'Matriks perbandingan berpasangan Saaty dengan kalkulasi otomatis rasio konsistensi (CR).',
    },
  ];

  useEffect(() => {
    // Silently prefetch remaining routes during idle time
    const cancel = scheduleAllRemainingPrefetch('landing');
    return () => cancel();
  }, []);

  const handleMethodCardClick = (methodId: string) => {
    useUiStore.getState().setActiveTab(methodId as any);
    navigate(`/board?tab=${methodId.toLowerCase()}`);
  };

  return (
    <div className="h-screen max-h-screen w-full overflow-hidden flex flex-col justify-between bg-surface bg-dot-grid text-slate-800 relative select-none">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* =========================================================================
          TOP NAVBAR
      ========================================================================== */}
      <header className="relative z-10 w-full px-6 py-3 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              onMouseEnter={prefetchRoute.landing}
              onFocus={prefetchRoute.landing}
              className="inline-flex items-center"
            >
              <Logo size="md" showWordmark />
            </Link>
            <span className="text-slate-300">|</span>
            <Badge variant="primary" size="sm" className="font-bold text-[10px]">
              v1.1
            </Badge>
          </div>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/board"
              onMouseEnter={() => prefetchRoute.board()}
              onFocus={() => prefetchRoute.board()}
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer hidden sm:block"
            >
              Workboard
            </Link>
            <Link
              to="/review"
              onMouseEnter={prefetchRoute.review}
              onFocus={prefetchRoute.review}
              className="text-xs font-semibold text-slate-600 hover:text-amber-600 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-amber-50/60 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Review</span>
            </Link>
            <Link
              to="/analytics"
              onMouseEnter={prefetchRoute.analytics}
              onFocus={prefetchRoute.analytics}
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-indigo-50/60 cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Analitik</span>
            </Link>

            <a
              href="https://github.com/hafidzrdwn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-slate-800 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
              title="GitHub Repository"
              aria-label="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>

            <Button
              variant="primary"
              size="sm"
              onMouseEnter={() => prefetchRoute.board()}
              onFocus={() => prefetchRoute.board()}
              onClick={() => navigate('/board')}
              className="shadow-sm text-xs font-semibold cursor-pointer"
            >
              <span>Buka Workboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </nav>
        </div>
      </header>

      {/* =========================================================================
          HERO MAIN CONTENT (FITS EXACT VIEWPORT, NO-SCROLL)
      ========================================================================== */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 flex flex-col justify-center gap-4 py-2">
        {/* Headline & Value Proposition */}
        <div className="text-center space-y-2.5 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Multi-Criteria Decision Analysis Engine & Transparency Inspector</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-[40px] font-extrabold tracking-tight text-slate-900 leading-tight"
          >
            Kalkulasi Transparan, <br className="hidden sm:inline" />
            <span className="bg-linear-to-r from-indigo-700 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
              Keputusan Lebih Percaya Diri.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto"
          >
            Evaluasi alternatif keputusan menggunakan 4 metode teruji (SAW, WP, TOPSIS, AHP) secara simultan dengan inspeksi rumus KaTeX per sel matriks dan konversi cerita ke matriks otomatis.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-3 pt-1"
          >
            <Button
              variant="primary"
              size="md"
              onMouseEnter={() => prefetchRoute.board()}
              onFocus={() => prefetchRoute.board()}
              onClick={() => navigate('/board')}
              className="px-6 py-2.5 text-sm font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <span>Mulai Evaluasi SPK</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="secondary"
              size="md"
              onMouseEnter={prefetchRoute.review}
              onFocus={prefetchRoute.review}
              onClick={() => navigate('/review')}
              className="px-5 py-2.5 text-sm font-semibold border-slate-300 text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Ulasan Komunitas</span>
            </Button>
          </motion.div>
        </div>

        {/* =======================================================================
            4 METHOD SHOWCASE CARDS (LIGHT, CRISP, & INTERACTIVE)
        ======================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2"
        >
          {methods.map((m) => (
            <div
              key={m.id}
              tabIndex={0}
              role="button"
              onMouseEnter={() => prefetchRoute.board(m.id.toLowerCase())}
              onFocus={() => prefetchRoute.board(m.id.toLowerCase())}
              onClick={() => handleMethodCardClick(m.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleMethodCardClick(m.id);
                }
              }}
              className="group p-3.5 rounded-xl bg-white border border-slate-200/90 hover:border-indigo-400/80 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2 shadow-2xs hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-indigo-50 transition-colors">
                    {m.icon}
                  </div>
                  <span className="font-mono font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {m.acronym}
                  </span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${m.accentBg}`}>
                  {m.tag}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                {m.desc}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="truncate group-hover:text-indigo-600 transition-colors">Buka Kalkulasi</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Feature Highlights Row (No technical jargon) */}
        <div className="flex items-center justify-center gap-5 text-[11px] text-slate-500 pt-1">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Traceability KaTeX Per Sel</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Analisis Pergeseran Peringkat</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Laporan PDF Siap Cetak (A4)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekstraksi Cerita Otomatis</span>
          </span>
        </div>
      </main>

      {/* =========================================================================
          BOTTOM STATUS BAR
      ========================================================================== */}
      <footer className="relative z-10 w-full px-6 py-2.5 border-t border-slate-200/80 bg-white/80 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span>&copy; {currentYear} DecisiGraph v1.1</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 hidden sm:inline">Pemisah Desimal:</span>
            <DecimalFormatToggle />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
