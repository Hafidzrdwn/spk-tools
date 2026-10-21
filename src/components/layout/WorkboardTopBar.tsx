import React from 'react';
import { Link } from 'react-router-dom';
import { FileUp } from 'lucide-react';
import { prefetchRoute } from '@/services/routePrefetch';
import { useUiStore } from '@/store/useUiStore';

export const WorkboardTopBar: React.FC = () => {
  const openDocLoader = useUiStore((s) => s.openDocLoader);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-2xs">
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
        <span className="text-xs font-bold text-slate-800 tracking-tight truncate">
          Workboard Kalkulasi Sistem Pendukung Keputusan
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-start sm:justify-end gap-1.5 text-xs w-full sm:w-auto">
        <Link
          to="/"
          onMouseEnter={prefetchRoute.landing}
          onFocus={prefetchRoute.landing}
          className="min-h-8 px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors inline-flex items-center font-medium cursor-pointer shrink-0"
          title="Kembali ke Landing Page (Beranda)"
        >
          Beranda
        </Link>
        <Link
          to="/review"
          onMouseEnter={prefetchRoute.review}
          onFocus={prefetchRoute.review}
          className="min-h-8 px-2.5 py-1 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/70 transition-colors inline-flex items-center font-medium cursor-pointer shrink-0"
          title="Buka Ulasan Komunitas & Masukan"
        >
          Ulasan
        </Link>
        <Link
          to="/analytics"
          onMouseEnter={prefetchRoute.analytics}
          onFocus={prefetchRoute.analytics}
          className="min-h-8 px-2.5 py-1 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/70 transition-colors inline-flex items-center font-medium cursor-pointer shrink-0"
          title="Buka Statistik Web"
        >
          Statistik
        </Link>

        <span className="text-slate-300 hidden sm:inline select-none">|</span>

        <button
          type="button"
          id="topbar-btn-upload-doc"
          onClick={openDocLoader}
          title="Unggah Dokumen (PDF, Word, Teks) ke Matriks Keputusan via AI"
          className="min-h-8 px-3 py-1 rounded-lg text-xs font-semibold text-accent-primary bg-indigo-50/80 hover:bg-indigo-100/90 border border-indigo-200/80 transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
        >
          <FileUp className="w-3.5 h-3.5 text-accent-primary shrink-0" />
          <span>Unggah Dokumen</span>
        </button>
      </div>
    </div>
  );
};

export default WorkboardTopBar;
