import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
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
  const navigate = useNavigate();

  useEffect(() => {
    const cancel = scheduleAllRemainingPrefetch(activeTab);
    return () => cancel();
  }, [activeTab]);

  return (
    <div className="min-h-dvh w-full bg-surface bg-dot-grid text-slate-800 pb-16 antialiased">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xs border-b border-slate-200 px-3 sm:px-6 py-2 sm:py-2.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="secondary"
              size="sm"
              onMouseEnter={() => prefetchRoute.board()}
              onFocus={() => prefetchRoute.board()}
              onClick={() => navigate('/board')}
              className="min-h-11 px-2.5 sm:px-3 py-2 gap-1.5 text-slate-600 hover:text-slate-900 cursor-pointer shadow-2xs text-xs font-semibold shrink-0"
              title="Kembali ke Workboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kembali ke Workboard</span>
              <span className="sm:hidden">Kembali</span>
            </Button>
            <div className="h-4 w-px bg-slate-200 hidden md:block" />
            <Link
              to="/"
              onMouseEnter={prefetchRoute.landing}
              onFocus={prefetchRoute.landing}
              className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity min-h-11"
            >
              <Logo size="sm" showWordmark={false} />
              <span className="text-xs font-bold text-slate-700 tracking-tight">DecisiGraph Community</span>
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
