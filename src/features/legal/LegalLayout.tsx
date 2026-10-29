import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/layout/Logo';
import Footer from '@/components/layout/Footer';
import { prefetchRoute } from '@/services/routePrefetch';

export type LegalTabId = 'privacy' | 'terms' | 'releases' | 'about';

export interface LegalLayoutProps {
  activeTab: LegalTabId;
  children: React.ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ activeTab, children }) => {
  const navItems: Array<{ id: LegalTabId; path: string; label: string }> = [
    { id: 'privacy', path: '/privacy', label: 'Privasi' },
    { id: 'terms', path: '/terms', label: 'Ketentuan' },
    { id: 'releases', path: '/releases', label: 'Catatan Rilis' },
    { id: 'about', path: '/about', label: 'Tentang & Bantuan' },
  ];

  return (
    <div className="min-h-dvh w-full bg-slate-50/70 text-slate-800 flex flex-col antialiased overflow-x-hidden">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-3 sm:px-6 py-2 sm:py-2.5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-3">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <Link
                to="/"
                onMouseEnter={prefetchRoute.landing}
                onFocus={prefetchRoute.landing}
                className="flex items-center gap-1.5 hover:opacity-85 transition-opacity shrink-0"
                title="DecisiGraph SPK"
              >
                <Logo size="sm" showWordmark />
              </Link>

              <span className="text-slate-200 hidden xs:inline">|</span>

              <Link
                to="/"
                onMouseEnter={prefetchRoute.landing}
                onFocus={prefetchRoute.landing}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                title="Kembali ke Beranda"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Beranda</span>
              </Link>
            </div>

            <Link
              to="/board"
              onMouseEnter={() => prefetchRoute.board()}
              onFocus={() => prefetchRoute.board()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors shrink-0 md:hidden"
              title="Buka Workboard Evaluasi SPK"
            >
              <span>Workboard</span>
            </Link>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            <nav aria-label="Navigasi Halaman Informasi" className="flex items-center gap-1 sm:gap-1.5 text-xs shrink-0">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 whitespace-nowrap ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Link
              to="/board"
              onMouseEnter={() => prefetchRoute.board()}
              onFocus={() => prefetchRoute.board()}
              className="hidden md:inline-flex text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors shrink-0 ml-1"
              title="Buka Workboard Evaluasi SPK"
            >
              Workboard
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full">
        <div className="mb-6 flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80 text-xs">
          <Link
            to="/"
            onMouseEnter={prefetchRoute.landing}
            onFocus={prefetchRoute.landing}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-medium transition-colors group"
            title="Kembali ke Beranda"
          >
            <svg
              className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:-translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kembali ke Beranda</span>
          </Link>
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            DecisiGraph Platform
          </span>
        </div>

        {children}
      </main>

      <Footer />
    </div>
  );
};

export default LegalLayout;
