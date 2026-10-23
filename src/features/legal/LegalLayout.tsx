import React from 'react';
import { Link } from 'react-router-dom';
import { Home, LayoutDashboard, ShieldCheck, Scale, History, User } from 'lucide-react';
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

  const navItems: Array<{ id: LegalTabId; path: string; label: string; icon: React.ReactNode }> = [
    { id: 'privacy', path: '/privacy', label: 'Privasi', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'terms', path: '/terms', label: 'Syarat Ketentuan', icon: <Scale className="w-3.5 h-3.5" /> },
    { id: 'releases', path: '/releases', label: 'Catatan Rilis', icon: <History className="w-3.5 h-3.5" /> },
    { id: 'about', path: '/about', label: 'Tentang & Bantuan', icon: <User className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-dvh w-full bg-surface bg-dot-grid text-slate-800 flex flex-col antialiased">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xs border-b border-slate-200 px-3 sm:px-6 py-2 sm:py-2.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2.5 min-w-0">
            <Link
              to="/"
              onMouseEnter={prefetchRoute.landing}
              onFocus={prefetchRoute.landing}
              className="flex items-center gap-2 hover:opacity-85 transition-opacity min-h-11 mr-1 shrink-0"
              title="Kembali ke Beranda DecisiGraph"
            >
              <Logo size="sm" showWordmark />
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <Link
              to="/"
              onMouseEnter={prefetchRoute.landing}
              onFocus={prefetchRoute.landing}
              className="min-h-11 px-2 sm:px-2.5 py-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
              title="Kembali ke Beranda"
            >
              <Home className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden xs:inline">Beranda</span>
            </Link>

            <span className="text-slate-200 hidden xs:inline">|</span>

            <Link
              to="/board"
              onMouseEnter={() => prefetchRoute.board()}
              onFocus={() => prefetchRoute.board()}
              className="min-h-11 px-2 sm:px-2.5 py-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
              title="Buka Workboard Evaluasi SPK"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden xs:inline">Workboard</span>
            </Link>
          </div>

          <nav aria-label="Navigasi Legal & Info" className="flex items-center gap-1 p-0.5 sm:p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs shrink-0 overflow-x-auto max-w-[60vw] sm:max-w-none">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`min-h-11 flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white/90 py-4 px-4 sm:px-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 font-medium">
            <span className="text-slate-700 font-semibold">&copy; {currentYear} DecisiGraph</span>
            <Badge variant="primary" size="sm" className="text-[10px] py-0 px-1.5 font-bold">
              v1.1
            </Badge>
            <span className="text-slate-300 hidden sm:inline">&bull;</span>
            <span className="text-slate-500">Transparansi & Rekomendasi Keputusan Objektif</span>
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
