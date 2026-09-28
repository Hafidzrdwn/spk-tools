import React from 'react';
import { ArrowLeft, Star, BarChart3 } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import Button from '@/components/ui/Button';
import Logo from '@/components/layout/Logo';

export interface CommunityLayoutProps {
  activeTab: 'review' | 'analytics';
  children: React.ReactNode;
}

export const CommunityLayout: React.FC<CommunityLayoutProps> = ({
  activeTab,
  children,
}) => {
  const setCurrentView = useUiStore((s) => s.setCurrentView);

  return (
    <div className="min-h-screen bg-surface bg-dot-grid text-slate-800 pb-16 antialiased">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentView('board')}
              className="gap-1.5 text-slate-600 hover:text-slate-900 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Workboard</span>
            </Button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <Logo size="sm" showWordmark={false} />
              <span className="text-xs font-bold text-slate-700 tracking-tight">DecisiGraph Community</span>
            </div>
          </div>

          {/* Clean Sub-Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => setCurrentView('review')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'review'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Ulasan & Masukan</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('analytics')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Statistik Web</span>
            </button>
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
