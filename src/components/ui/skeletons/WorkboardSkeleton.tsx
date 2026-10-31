import React from 'react';

export const WorkboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface bg-dot-grid text-slate-800 flex flex-col justify-between antialiased animate-pulse">
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2 sm:py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 md:gap-4">
          <div className="flex items-center justify-between md:justify-start gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-200" />
              <div className="w-24 sm:w-28 h-5 rounded bg-slate-200" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 border-l border-slate-200/80 pl-2 sm:pl-3">
              <div className="w-8 h-4 rounded-full bg-indigo-100 hidden md:block" />
              <div className="w-28 sm:w-40 h-5 rounded bg-slate-200" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap shrink-0 overflow-x-auto">
            <div className="h-9 w-20 sm:w-24 rounded-lg bg-slate-200 shrink-0" />
            <div className="h-9 w-20 sm:w-24 rounded-lg bg-slate-200 shrink-0" />
            <div className="h-9 w-14 sm:w-16 rounded-lg bg-slate-200 shrink-0" />
            <div className="h-9 w-20 sm:w-24 rounded-lg bg-indigo-200 shrink-0" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
            <div className="w-48 sm:w-64 h-4 rounded bg-slate-300" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="h-7 w-16 rounded-lg bg-slate-100 shrink-0" />
            <div className="h-7 w-16 rounded-lg bg-slate-100 shrink-0" />
            <div className="h-7 w-16 rounded-lg bg-slate-100 shrink-0" />
            <span className="text-slate-300 hidden sm:inline">|</span>
            <div className="h-7 w-20 rounded-lg bg-indigo-100 shrink-0" />
            <div className="h-7 w-20 rounded-lg bg-indigo-100 shrink-0" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/80 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex-1 min-w-[5rem] h-9 rounded-lg bg-slate-200 shrink-0" />
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between py-2.5 px-3 sm:px-4 gap-2">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="w-6 h-6 rounded bg-slate-200 shrink-0" />
              <div className="min-w-0">
                <div className="w-36 sm:w-48 h-4 rounded bg-slate-300 mb-1" />
                <div className="w-48 sm:w-64 h-3 rounded bg-slate-200" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg self-start sm:self-auto w-full sm:w-auto overflow-x-auto">
              <div className="w-20 h-7 rounded bg-white text-center" />
              <div className="w-20 h-7 rounded bg-slate-200 text-center" />
              <div className="w-20 h-7 rounded bg-slate-200 text-center" />
            </div>
          </div>
          <div className="p-3 sm:p-4 space-y-2.5 overflow-x-auto">
            <div className="w-full min-w-[320px] h-8 rounded bg-slate-100" />
            <div className="w-full min-w-[320px] h-8 rounded bg-slate-50" />
            <div className="w-full min-w-[320px] h-8 rounded bg-slate-100" />
            <div className="w-full min-w-[320px] h-8 rounded bg-slate-50" />
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-40 sm:w-48 h-5 rounded bg-slate-300" />
            <div className="w-24 h-6 rounded-full bg-slate-100" />
          </div>
          <div className="w-full h-32 sm:h-44 rounded-lg bg-slate-100" />
          <div className="w-full sm:w-3/4 h-8 rounded bg-slate-200" />
        </div>
      </main>

      <footer className="w-full px-4 sm:px-6 py-5 sm:py-3.5 border-t border-slate-200/90 bg-white/95 text-xs text-slate-500 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3.5 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="w-32 h-4 rounded bg-slate-200" />
            <div className="w-8 h-4 rounded-full bg-indigo-100" />
            <div className="w-48 h-3 rounded bg-slate-100 hidden sm:block" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-20 h-3 rounded bg-slate-200" />
            <div className="w-16 h-3 rounded bg-slate-200" />
            <div className="w-14 h-3 rounded bg-slate-200" />
            <div className="w-16 h-3 rounded bg-slate-200" />
          </div>
          <div className="w-28 h-6 rounded bg-slate-100" />
        </div>
      </footer>
    </div>
  );
};

export default WorkboardSkeleton;
