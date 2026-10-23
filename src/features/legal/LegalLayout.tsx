import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/layout/Logo';
import Badge from '@/components/ui/Badge';
import DecimalFormatToggle from '@/components/layout/DecimalFormatToggle';
import { prefetchRoute } from '@/services/routePrefetch';

export type LegalTabId = 'privacy' | 'terms' | 'releases' | 'about';

export interface LegalLayoutProps {
  activeTab: LegalTabId;
  children: React.ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ activeTab, children }) => {
  const currentYear = new Date().getFullYear();

  const navItems: Array<{ id: LegalTabId; path: string; label: string }> = [
    { id: 'privacy', path: '/privacy', label: 'Privasi' },
    { id: 'terms', path: '/terms', label: 'Ketentuan' },
    { id: 'releases', path: '/releases', label: 'Catatan Rilis' },
    { id: 'about', path: '/about', label: 'Tentang & Bantuan' },
  ];

  return (
    <div className="min-h-dvh w-full bg-slate-50/70 text-slate-800 flex flex-col antialiased">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-6 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              onMouseEnter={prefetchRoute.landing}
              onFocus={prefetchRoute.landing}
              className="flex items-center gap-2 hover:opacity-85 transition-opacity shrink-0"
              title="Kembali ke Beranda DecisiGraph"
            >
              <Logo size="sm" showWordmark />
            </Link>

            <span className="text-slate-200 hidden sm:inline">|</span>

            <Link
              to="/board"
              onMouseEnter={() => prefetchRoute.board()}
              onFocus={() => prefetchRoute.board()}
              className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              title="Buka Workboard Evaluasi SPK"
            >
              Workboard
            </Link>
          </div>

          <nav aria-label="Navigasi Halaman" className="flex items-center gap-1 sm:gap-1.5 text-xs">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {children}
      </main>

      <footer className="w-full border-t border-slate-200/80 bg-white py-4 px-4 sm:px-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 font-medium">
            <span className="text-slate-700 font-semibold">&copy; {currentYear} DecisiGraph</span>
            <Badge variant="primary" size="sm" className="text-[10px] py-0 px-1.5 font-bold">
              v1.1
            </Badge>
            <span className="text-slate-300 hidden sm:inline">&bull;</span>
            <span className="text-slate-500">Decision Intelligence Platform</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <span className="text-slate-500 font-medium">Format Desimal:</span>
            <DecimalFormatToggle />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LegalLayout;
