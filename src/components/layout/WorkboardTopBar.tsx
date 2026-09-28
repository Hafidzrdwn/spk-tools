import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Star, BarChart3, Sparkles } from 'lucide-react';

export const WorkboardTopBar: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-2.5 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-2xs">
      <div className="flex items-center gap-2">
        <div className="p-1 rounded-md bg-indigo-50 border border-indigo-200/60 text-indigo-600">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 tracking-tight">Workboard Evaluasi SPK</span>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">Kalkulasi 4 Metode Terpadu (SAW, WP, TOPSIS, AHP)</span>
        </div>
      </div>

      {/* Quick Nav Links inside Workboard Content */}
      <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
        <Link
          to="/"
          className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
          title="Kembali ke Landing Page (Beranda)"
        >
          <Home className="w-3.5 h-3.5 text-slate-500" />
          <span>Beranda</span>
        </Link>
        <Link
          to="/review"
          className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50/70 transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
          title="Buka Ulasan Komunitas & Masukan"
        >
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>Review</span>
        </Link>
        <Link
          to="/analytics"
          className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/70 transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
          title="Buka Statistik Web"
        >
          <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Analitik</span>
        </Link>
      </div>
    </div>
  );
};

export default WorkboardTopBar;
