import React from 'react';

export const WorkboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface bg-dot-grid text-slate-800 pb-16 antialiased animate-pulse">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200" />
            <div className="w-24 h-5 rounded bg-slate-200" />
            <span className="text-slate-200">|</span>
            <div className="w-10 h-4 rounded-full bg-indigo-100" />
            <div className="w-36 h-5 rounded bg-slate-200" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-8 rounded-lg bg-slate-200 hidden sm:block" />
            <div className="w-28 h-8 rounded-lg bg-slate-200 hidden sm:block" />
            <div className="w-24 h-8 rounded-lg bg-indigo-300" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* WorkboardTopBar Skeleton */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-white/70 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-100" />
            <div className="w-36 h-4 rounded bg-slate-200" />
            <span className="text-slate-200">|</span>
            <div className="w-48 h-3.5 rounded bg-slate-200 hidden sm:block" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-6 rounded bg-slate-200" />
            <div className="w-16 h-6 rounded bg-slate-200" />
            <div className="w-16 h-6 rounded bg-slate-200" />
          </div>
        </div>

        {/* Method Tabs Bar Skeleton */}
        <div className="p-3 rounded-xl bg-white/80 border border-slate-200/80 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-28 h-9 rounded-lg bg-slate-200 shrink-0" />
            ))}
          </div>
          <div className="h-9 w-full bg-indigo-50/60 rounded-lg border border-indigo-100/60" />
        </div>

        {/* Shared Matrix Card Skeleton */}
        <div className="rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-slate-200" />
              <div>
                <div className="w-48 h-4 rounded bg-slate-300 mb-1" />
                <div className="w-64 h-3 rounded bg-slate-200" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
              <div className="w-20 h-6 rounded bg-white" />
              <div className="w-20 h-6 rounded bg-slate-200" />
              <div className="w-20 h-6 rounded bg-slate-200" />
            </div>
          </div>
          <div className="p-4 space-y-2.5">
            <div className="w-full h-8 rounded bg-slate-100" />
            <div className="w-full h-8 rounded bg-slate-50" />
            <div className="w-full h-8 rounded bg-slate-100" />
            <div className="w-full h-8 rounded bg-slate-50" />
          </div>
        </div>

        {/* Computation Section Skeleton */}
        <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="w-48 h-5 rounded bg-slate-300" />
          <div className="w-full h-32 rounded-lg bg-slate-100" />
          <div className="w-3/4 h-8 rounded bg-slate-200" />
        </div>
      </main>
    </div>
  );
};

export default WorkboardSkeleton;
