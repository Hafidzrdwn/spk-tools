import React from 'react';

export const AnalyticsSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface bg-dot-grid text-slate-800 pb-16 antialiased animate-pulse">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-36 h-8 rounded-lg bg-slate-200" />
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="w-32 h-5 rounded bg-slate-200 hidden sm:block" />
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <div className="w-24 h-7 rounded-lg bg-slate-200" />
            <div className="w-24 h-7 rounded-lg bg-white" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Page Title & Intro */}
        <div className="space-y-2">
          <div className="w-72 h-7 rounded bg-slate-300" />
          <div className="w-[450px] h-4 rounded bg-slate-200" />
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <div className="w-24 h-3.5 rounded bg-slate-200" />
              <div className="w-20 h-7 rounded bg-slate-300" />
              <div className="w-28 h-3 rounded bg-slate-100" />
            </div>
          ))}
        </div>

        {/* 2 Columns: Chart & Devices */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart Left 7 Cols */}
          <div className="lg:col-span-7 p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="w-48 h-4 rounded bg-slate-300" />
                <div className="w-64 h-3 rounded bg-slate-200" />
              </div>
              <div className="w-14 h-5 rounded-full bg-slate-100" />
            </div>
            <div className="h-44 w-full flex items-end justify-between gap-3 pt-4 px-2">
              {[40, 65, 30, 80, 55, 90, 70].map((h, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-slate-100 rounded-t-lg" style={{ height: `${h}%` }} />
                  <div className="w-8 h-3 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </div>

          {/* Device Right 5 Cols */}
          <div className="lg:col-span-5 p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="space-y-1">
              <div className="w-44 h-4 rounded bg-slate-300" />
              <div className="w-56 h-3 rounded bg-slate-200" />
            </div>
            <div className="space-y-4 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="w-24 h-4 rounded bg-slate-200" />
                    <div className="w-8 h-4 rounded bg-slate-300" />
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <div className="w-32 h-3.5 rounded bg-slate-200" />
              <div className="w-20 h-3.5 rounded bg-slate-300" />
            </div>
          </div>
        </div>

        {/* Live Visits Table Skeleton */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="w-40 h-4 rounded bg-slate-300" />
              <div className="w-56 h-3 rounded bg-slate-200" />
            </div>
            <div className="w-20 h-5 rounded-full bg-emerald-100" />
          </div>
          <div className="space-y-2">
            <div className="w-full h-9 rounded bg-slate-100" />
            <div className="w-full h-8 rounded bg-slate-50" />
            <div className="w-full h-8 rounded bg-slate-50" />
            <div className="w-full h-8 rounded bg-slate-50" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsSkeleton;
