import React from 'react';

export const LandingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-surface bg-dot-grid text-slate-800 antialiased animate-pulse">
      {/* Navbar Skeleton */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-6 py-3 border-b border-slate-200/90 bg-white/95">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200" />
            <div className="w-24 h-5 rounded bg-slate-200" />
            <span className="text-slate-200">|</span>
            <div className="w-10 h-4 rounded-full bg-slate-200" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-16 h-6 rounded bg-slate-200 hidden sm:block" />
            <div className="w-16 h-6 rounded bg-slate-200" />
            <div className="w-16 h-6 rounded bg-slate-200" />
            <div className="w-28 h-8 rounded-lg bg-indigo-200" />
          </div>
        </div>
      </header>

      {/* Main Skeleton: Two Column Asymmetric Hero */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column Skeleton (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            <div className="w-56 h-6 rounded bg-slate-200" />
            <div className="space-y-2.5">
              <div className="w-full h-8 rounded bg-slate-300" />
              <div className="w-4/5 h-8 rounded bg-slate-300" />
              <div className="w-full h-4 rounded bg-slate-200 mt-2" />
              <div className="w-5/6 h-4 rounded bg-slate-200" />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="w-44 h-10 rounded-lg bg-indigo-300" />
              <div className="w-32 h-10 rounded-lg bg-slate-200" />
            </div>
            <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-3">
              <div className="w-full h-4 rounded bg-slate-200" />
              <div className="w-full h-4 rounded bg-slate-200" />
              <div className="w-full h-4 rounded bg-slate-200" />
            </div>
          </div>

          {/* Right Column Skeleton (6 cols - Decision Preview Card) */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="w-40 h-5 rounded bg-slate-200" />
                <div className="w-28 h-6 rounded bg-slate-200" />
              </div>
              <div className="w-full h-32 rounded bg-slate-100" />
              <div className="w-full h-10 rounded bg-slate-200" />
              <div className="flex items-center justify-between pt-1">
                <div className="w-48 h-4 rounded bg-slate-200" />
                <div className="w-24 h-4 rounded bg-indigo-200" />
              </div>
            </div>
          </div>
        </section>

        {/* 4 Methods Bento Grid Skeleton */}
        <section className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <div className="w-72 h-6 rounded bg-slate-300" />
            <div className="w-96 h-4 rounded bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-6 rounded bg-slate-200" />
                  <div className="w-16 h-4 rounded bg-slate-100" />
                </div>
                <div className="space-y-1.5">
                  <div className="w-28 h-4 rounded bg-slate-300" />
                  <div className="w-full h-3 rounded bg-slate-200" />
                  <div className="w-4/5 h-3 rounded bg-slate-200" />
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="w-20 h-3 rounded bg-slate-200" />
                  <div className="w-16 h-3 rounded bg-indigo-200" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Pillars Skeleton */}
        <section className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="w-36 h-4 rounded bg-slate-300" />
                <div className="w-full h-3 rounded bg-slate-200" />
                <div className="w-3/4 h-3 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer Skeleton */}
      <footer className="w-full px-4 sm:px-6 py-3 border-t border-slate-200 bg-white/90">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="w-48 h-4 rounded bg-slate-200" />
          <div className="w-28 h-5 rounded bg-slate-200" />
        </div>
      </footer>
    </div>
  );
};

export default LandingSkeleton;
