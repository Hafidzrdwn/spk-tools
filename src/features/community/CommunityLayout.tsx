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
    <div className="min-h-screen bg-surface bg-dot-grid text-slate-800 pb-16 antialiased">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 py-3 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onMouseEnter={() => prefetchRoute.board()}
              onFocus={() => prefetchRoute.board()}
              onClick={() => navigate('/board')}
              className="gap-1.5 text-slate-600 hover:text-slate-900 cursor-pointer shadow-2xs text-xs font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Workboard</span>
            </Button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <Link
              to="/"
              onMouseEnter={prefetchRoute.landing}
              onFocus={prefetchRoute.landing}
              className="hidden sm:flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Logo size="sm" showWordmark={false} />
              <span className="text-xs font-bold text-slate-700 tracking-tight">DecisiGraph Community</span>
            </Link>
          </div>

          {/* Clean Sub-Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
            <Link
              to="/review"
              onMouseEnter={prefetchRoute.review}
              onFocus={prefetchRoute.review}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'review'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              Ulasan Komunitas
            </Link>
            <Link
              to="/analytics"
              onMouseEnter={prefetchRoute.analytics}
              onFocus={prefetchRoute.analytics}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              Statistik Penggunaan
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {children}
      </main>
    </div>
  );
};

export default CommunityLayout;
