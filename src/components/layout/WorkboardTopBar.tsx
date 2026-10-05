import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MessageSquare, BarChart3, Sparkles } from 'lucide-react';
import { prefetchRoute } from '@/services/routePrefetch';

export const WorkboardTopBar: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-2xs">
      <div className="flex items-center gap-2">
        <div className="p-1 rounded-md bg-indigo-50 border border-indigo-200/60 text-indigo-600 shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 truncate">
          <span className="text-xs font-bold text-slate-800 tracking-tight shrink-0">Workboard SPK</span>
          <span className="text-slate-300 hidden xs:inline">|</span>
          <span className="text-[11px] text-slate-500 hidden sm:inline truncate">Kalkulasi 4 Metode Terpadu (SAW, WP, TOPSIS, AHP)</span>
        </div>
      </div>

      {/* Quick Nav Links inside Workboard Content */}
      <div className="flex items-center justify-start sm:justify-end gap-1 sm:gap-1.5 text-xs overflow-x-auto scrollbar-none touch-pan-x w-full sm:w-auto">
        <Link
          to="/"
          onMouseEnter={prefetchRoute.landing}
          onFocus={prefetchRoute.landing}
          className="min-h-9 px-2 sm:px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5 font-medium cursor-pointer shrink-0"
          title="Kembali ke Landing Page (Beranda)"
        >
          <Home className="w-3.5 h-3.5 text-slate-500" />
          <span>Beranda</span>
        </Link>
        <Link
          to="/review"
          onMouseEnter={prefetchRoute.review}
          onFocus={prefetchRoute.review}
          className="min-h-9 px-2 sm:px-2.5 py-1 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/70 transition-colors inline-flex items-center gap-1.5 font-medium cursor-pointer shrink-0"
          title="Buka Ulasan Komunitas & Masukan"
        >
          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
          <span>Ulasan</span>
        </Link>
        <Link
          to="/analytics"
          onMouseEnter={prefetchRoute.analytics}
          onFocus={prefetchRoute.analytics}
          className="min-h-9 px-2 sm:px-2.5 py-1 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/70 transition-colors inline-flex items-center gap-1.5 font-medium cursor-pointer shrink-0"
          title="Buka Statistik Web"
        >
          <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Statistik</span>
        </Link>
      </div>
    </div>
  );
};

export default WorkboardTopBar;
