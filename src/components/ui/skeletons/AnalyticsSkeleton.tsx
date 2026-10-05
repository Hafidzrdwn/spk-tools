import React from 'react';

export const AnalyticsSkeleton: React.FC = () => {
  return (
    <div className="min-h-dvh w-full bg-surface bg-dot-grid text-slate-800 pb-16 antialiased animate-pulse">
      {/* Top Bar Header - Mirrors CommunityLayout.tsx */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xs border-b border-slate-200 px-3 sm:px-6 py-2 sm:py-2.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2.5">
            <div className="w-24 h-6 rounded bg-slate-200 hidden lg:block mr-1" />
            <div className="h-4 w-px bg-slate-200 hidden lg:block" />
            <div className="w-16 sm:w-20 h-9 rounded-lg bg-slate-100" />
            <span className="text-slate-200">|</span>
            <div className="w-20 sm:w-24 h-9 rounded-lg bg-indigo-50" />
          </div>
          <div className="flex items-center gap-1 p-0.5 sm:p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
            <div className="w-16 sm:w-28 h-9 rounded-md bg-slate-200" />
            <div className="w-16 sm:w-28 h-9 rounded-md bg-white shadow-2xs" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6 w-full">
        {/* Page Title & Intro */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-200 shrink-0" />
            <div className="w-64 sm:w-80 h-7 rounded bg-slate-300" />
          </div>
          <div className="w-full max-w-md h-4 rounded bg-slate-200" />
        </div>

        {/* 4 KPI Metric Cards - Responsive 1 col mobile, 2 cols tablet, 4 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <div className="w-24 h-3.5 rounded bg-slate-200" />
              <div className="w-20 h-7 rounded bg-slate-300" />
              <div className="w-32 h-3 rounded bg-slate-100" />
            </div>
          ))}
        </div>

        {/* Grid: 7-Day Trend Chart & Device Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Trend Chart (Left 7 Cols) */}
          <div className="lg:col-span-7 p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="w-44 sm:w-56 h-4 rounded bg-slate-300" />
                <div className="w-56 sm:w-72 h-3 rounded bg-slate-200" />
              </div>
              <div className="w-14 h-5 rounded-full bg-slate-100 shrink-0" />
            </div>
            <div className="h-44 w-full flex items-end justify-between gap-1.5 sm:gap-3 pt-4 px-1 sm:px-2 overflow-x-auto">
              {[35, 60, 25, 80, 50, 90, 65].map((h, idx) => (
                <div key={idx} className="flex-1 min-w-8 flex flex-col items-center gap-2">
                  <div className="w-full bg-slate-100 rounded-t-md" style={{ height: `${h}%` }} />
                  <div className="w-8 h-2.5 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </div>

          {/* Device Breakdown (Right 5 Cols) */}
          <div className="lg:col-span-5 p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="space-y-1">
              <div className="w-40 sm:w-48 h-4 rounded bg-slate-300" />
              <div className="w-48 sm:w-60 h-3 rounded bg-slate-200" />
            </div>
            <div className="space-y-4 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="w-24 h-4 rounded bg-slate-200" />
                    <div className="w-10 h-4 rounded bg-slate-300" />
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <div className="w-32 h-3.5 rounded bg-slate-200" />
              <div className="w-16 h-3.5 rounded bg-slate-300" />
            </div>
          </div>
        </div>

        {/* Live Visits Table Skeleton */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="w-40 sm:w-48 h-4 rounded bg-slate-300" />
              <div className="w-48 sm:w-64 h-3 rounded bg-slate-200" />
            </div>
            <div className="w-20 h-5 rounded-full bg-emerald-100 shrink-0" />
          </div>
          <div className="space-y-2 overflow-x-auto">
            <div className="w-full min-w-[340px] h-9 rounded bg-slate-100" />
            <div className="w-full min-w-[340px] h-8 rounded bg-slate-50" />
            <div className="w-full min-w-[340px] h-8 rounded bg-slate-50" />
            <div className="w-full min-w-[340px] h-8 rounded bg-slate-50" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsSkeleton;
