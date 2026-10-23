import React from 'react';

export const LegalSkeleton: React.FC = () => {
  return (
    <div className="min-h-dvh w-full bg-surface bg-dot-grid text-slate-800 pb-16 antialiased animate-pulse">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xs border-b border-slate-200 px-3 sm:px-6 py-2 sm:py-2.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-24 h-6 rounded bg-slate-200" />
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="w-16 h-8 rounded-lg bg-slate-100 hidden sm:block" />
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <div className="w-20 h-8 rounded-md bg-white shadow-2xs" />
            <div className="w-20 h-8 rounded-md bg-slate-200" />
            <div className="w-20 h-8 rounded-md bg-slate-200" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 w-full">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-3">
            <div className="w-32 h-5 rounded bg-indigo-100" />
            <div className="w-64 sm:w-96 h-8 rounded bg-slate-300" />
            <div className="w-full h-16 rounded bg-slate-100" />
          </div>
          <div className="md:col-span-5 flex justify-center">
            <div className="w-48 h-36 rounded-xl bg-slate-200" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="w-48 h-5 rounded bg-slate-300" />
            <div className="w-full h-12 rounded bg-slate-100" />
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="w-48 h-5 rounded bg-slate-300" />
            <div className="w-full h-12 rounded bg-slate-100" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LegalSkeleton;
