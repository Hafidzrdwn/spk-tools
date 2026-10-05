import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, LayoutDashboard } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import { prefetchRoute, scheduleAllRemainingPrefetch } from '@/services/routePrefetch';

export interface CommunityLayoutProps {
  activeTab: 'review' | 'analytics';
  children: React.ReactNode;
}

export const CommunityLayout: React.FC<CommunityLayoutProps> = ({
  activeTab,
  children,
}) => {
  useEffect(() => {
    const cancel = scheduleAllRemainingPrefetch(activeTab);
    return () => cancel();
  }, [activeTab]);

  return (
    <div className="min-h-dvh w-full bg-surface bg-dot-grid text-slate-800 pb-16 antialiased">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xs border-b border-slate-200 px-3 sm:px-6 py-2 sm:py-2.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2.5">
            <Link
              to="/"
              onMouseEnter={prefetchRoute.landing}
              onFocus={prefetchRoute.landing}
              className="hidden lg:flex items-center gap-2 hover:opacity-85 transition-opacity min-h-11 mr-1"
              title="DecisiGraph SPK"
            >
              <Logo size="sm" showWordmark={true} />
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden lg:block" />

            <Link
              to="/"
              onMouseEnter={prefetchRoute.landing}
              onFocus={prefetchRoute.landing}
              className="min-h-11 px-2 sm:px-2.5 py-1.5 inline-flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              title="Kembali ke Beranda (Landing Page)"
            >
              <Home className="w-3.5 h-3.5 text-slate-500" />
              <span>Beranda</span>
            </Link>

            <span className="text-slate-200">|</span>

            <Link
              to="/board"
              onMouseEnter={() => prefetchRoute.board()}
              onFocus={() => prefetchRoute.board()}
              className="min-h-11 px-2 sm:px-2.5 py-1.5 inline-flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Buka Workboard Evaluasi SPK"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
              <span>Workboard</span>
            </Link>
          </div>

          {/* Clean Sub-Navigation Tabs */}
          <nav aria-label="Navigasi Komunitas" className="flex items-center gap-1 p-0.5 sm:p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs shrink-0">
            <Link
              to="/review"
              onMouseEnter={prefetchRoute.review}
              onFocus={prefetchRoute.review}
              className={`min-h-11 flex items-center justify-center px-2.5 sm:px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'review'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <span className="hidden sm:inline">Ulasan Komunitas</span>
              <span className="sm:hidden">Ulasan</span>
            </Link>
            <Link
              to="/analytics"
              onMouseEnter={prefetchRoute.analytics}
              onFocus={prefetchRoute.analytics}
              className={`min-h-11 flex items-center justify-center px-2.5 sm:px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <span className="hidden sm:inline">Statistik Penggunaan</span>
              <span className="sm:hidden">Statistik</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 w-full">
        {children}
      </main>
    </div>
  );
};

export default CommunityLayout;
