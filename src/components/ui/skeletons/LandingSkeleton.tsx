import React from 'react';

export const LandingSkeleton: React.FC = () => {
  return (
    <div className="min-h-dvh w-full flex flex-col justify-between bg-surface bg-dot-grid text-slate-800 antialiased animate-pulse">
      {/* Navbar Skeleton - Matches LandingPage.tsx header */}
      <header className="sticky top-0 z-40 w-full px-3 sm:px-6 py-2 sm:py-2.5 border-b border-slate-200/90 bg-white/95 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <div className="w-24 sm:w-32 h-7 rounded-lg bg-slate-200" />
            <span className="text-slate-300 hidden xs:inline">|</span>
            <div className="w-8 h-4 rounded-full bg-indigo-100 hidden xs:block" />
          </div>
          <nav className="flex items-center gap-1 sm:gap-2">
            <div className="w-20 h-7 rounded-lg bg-slate-100 hidden sm:block" />
            <div className="w-18 sm:w-20 h-7 rounded-lg bg-slate-100" />
            <div className="w-8 h-8 rounded-lg bg-slate-100 hidden xs:block" />
            <div className="h-4 w-px bg-slate-200 hidden sm:block mx-1" />
            <div className="w-16 sm:w-28 min-h-11 rounded-lg bg-indigo-300" />
          </nav>
        </div>
      </header>

      {/* Main Skeleton */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-12 space-y-12 sm:space-y-14 overflow-hidden">
        {/* Section 1: Hero & Simulation Skeleton */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column Skeleton (6 cols) */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <div className="w-52 sm:w-60 h-6 rounded-md bg-slate-100 border border-slate-200" />
            <div className="space-y-2.5">
              <div className="w-full h-8 sm:h-10 rounded bg-slate-300" />
              <div className="w-4/5 h-8 sm:h-10 rounded bg-slate-300" />
              <div className="w-full h-4 rounded bg-slate-200 mt-2" />
              <div className="w-5/6 h-4 rounded bg-slate-200" />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 w-full">
              <div className="w-full sm:w-44 min-h-11 rounded-lg bg-indigo-300" />
              <div className="w-full sm:w-36 min-h-11 rounded-lg bg-slate-200" />
            </div>
            <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="w-full h-4 rounded bg-slate-200" />
              <div className="w-full h-4 rounded bg-slate-200" />
              <div className="w-full h-4 rounded bg-slate-200" />
            </div>
          </div>

          {/* Right Column Skeleton (6 cols - Decision Preview Card) */}
          <div className="lg:col-span-6 w-full">
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="w-36 sm:w-44 h-5 rounded bg-slate-200" />
                <div className="w-28 sm:w-32 h-6 rounded bg-slate-200" />
              </div>
              <div className="w-full h-32 rounded bg-slate-100" />
              <div className="w-full h-12 rounded bg-slate-200" />
              <div className="flex items-center justify-between pt-1">
                <div className="w-36 sm:w-48 h-4 rounded bg-slate-200" />
                <div className="w-20 sm:w-24 h-4 rounded bg-indigo-200" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Method Studio Master-Detail Skeleton */}
        <section className="space-y-6">
          <div className="space-y-2">
            <div className="w-40 sm:w-48 h-4 rounded bg-indigo-100" />
            <div className="w-60 sm:w-72 h-7 rounded bg-slate-300" />
            <div className="w-full max-w-sm h-4 rounded bg-slate-200" />
          </div>

          {/* 4 Horizontal Tabs Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-white space-y-2 min-h-16">
                <div className="flex items-center justify-between">
                  <div className="w-10 sm:w-12 h-4 rounded bg-slate-200" />
                  <div className="w-12 sm:w-14 h-4 rounded bg-slate-100" />
                </div>
                <div className="w-20 sm:w-24 h-4 rounded bg-slate-200" />
              </div>
            ))}
          </div>

          {/* Master Detail Split Panel Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            <div className="lg:col-span-6 p-4 sm:p-7 space-y-5">
              <div className="space-y-2">
                <div className="w-20 sm:w-24 h-5 rounded bg-indigo-100" />
                <div className="w-48 sm:w-56 h-6 rounded bg-slate-300" />
                <div className="w-full h-4 rounded bg-slate-200" />
              </div>
              <div className="w-full h-28 sm:h-32 rounded-xl bg-slate-100" />
              <div className="space-y-2">
                <div className="w-full h-8 rounded bg-slate-50" />
                <div className="w-full h-8 rounded bg-slate-50" />
              </div>
              <div className="w-48 sm:w-56 h-10 rounded-lg bg-indigo-200" />
            </div>

            <div className="lg:col-span-6 p-4 sm:p-7 bg-slate-50/50 space-y-5">
              <div className="space-y-3">
                <div className="w-36 sm:w-40 h-4 rounded bg-slate-200" />
                <div className="w-full h-12 sm:h-14 rounded-xl bg-white" />
                <div className="w-full h-12 sm:h-14 rounded-xl bg-white" />
                <div className="w-full h-12 sm:h-14 rounded-xl bg-white" />
              </div>
              <div className="w-full h-20 sm:h-24 rounded-lg bg-white" />
            </div>
          </div>
        </section>

        {/* Section 3: Feature Architecture Matrix Skeleton (2x2 Asymmetric) */}
        <section className="space-y-4">
          <div className="space-y-1.5">
            <div className="w-56 sm:w-64 h-6 rounded bg-slate-300" />
            <div className="w-full max-w-sm h-4 rounded bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7 p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
              <div className="w-28 sm:w-32 h-5 rounded bg-indigo-100" />
              <div className="w-48 sm:w-56 h-5 rounded bg-slate-300" />
              <div className="w-full h-4 rounded bg-slate-200" />
              <div className="w-full h-14 sm:h-16 rounded-xl bg-slate-50" />
            </div>

            <div className="md:col-span-5 p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
              <div className="w-28 sm:w-32 h-5 rounded bg-indigo-100" />
              <div className="w-40 sm:w-48 h-5 rounded bg-slate-300" />
              <div className="w-full h-4 rounded bg-slate-200" />
              <div className="w-full h-14 sm:h-16 rounded-xl bg-slate-50" />
            </div>

            <div className="md:col-span-5 p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
              <div className="w-28 sm:w-32 h-5 rounded bg-indigo-100" />
              <div className="w-40 sm:w-48 h-5 rounded bg-slate-300" />
              <div className="w-full h-4 rounded bg-slate-200" />
              <div className="w-full h-12 rounded-xl bg-slate-50" />
            </div>

            <div className="md:col-span-7 p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
              <div className="w-28 sm:w-32 h-5 rounded bg-indigo-100" />
              <div className="w-48 sm:w-56 h-5 rounded bg-slate-300" />
              <div className="w-full h-4 rounded bg-slate-200" />
              <div className="w-full h-12 rounded-xl bg-slate-50" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer Skeleton */}
      <footer className="w-full px-4 sm:px-6 py-4 sm:py-3.5 border-t border-slate-200 bg-white/90">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="w-40 sm:w-48 h-4 rounded bg-slate-200" />
          <div className="w-24 sm:w-28 h-5 rounded bg-slate-200" />
        </div>
      </footer>
    </div>
  );
};

export default LandingSkeleton;
