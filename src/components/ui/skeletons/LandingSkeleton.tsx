import React from 'react';

export const LandingSkeleton: React.FC = () => {
  return (
    <div className="h-screen max-h-screen w-full overflow-hidden flex flex-col justify-between bg-surface bg-dot-grid text-slate-800 relative select-none animate-pulse">
      {/* Navbar Skeleton */}
      <header className="relative z-10 w-full px-6 py-3 border-b border-slate-200/80 bg-white/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200" />
            <div className="w-24 h-5 rounded bg-slate-200" />
            <span className="text-slate-200">|</span>
            <div className="w-10 h-4 rounded-full bg-slate-200" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-6 rounded bg-slate-200 hidden sm:block" />
            <div className="w-16 h-6 rounded bg-slate-200" />
            <div className="w-16 h-6 rounded bg-slate-200" />
            <div className="w-32 h-8 rounded-lg bg-indigo-200" />
          </div>
        </div>
      </header>

      {/* Hero Skeleton */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 flex flex-col justify-center gap-4 py-2">
        <div className="text-center space-y-3 max-w-3xl mx-auto flex flex-col items-center">
          <div className="w-72 h-6 rounded-full bg-indigo-100/80 mb-1" />
          <div className="w-96 sm:w-[500px] h-10 rounded-lg bg-slate-300 mb-1" />
          <div className="w-80 sm:w-96 h-8 rounded-lg bg-indigo-200 mb-2" />
          <div className="w-full max-w-xl h-4 rounded bg-slate-200" />
          <div className="w-3/4 max-w-lg h-4 rounded bg-slate-200" />

          {/* Action CTAs */}
          <div className="flex items-center justify-center gap-3 pt-3">
            <div className="w-44 h-10 rounded-xl bg-indigo-300" />
            <div className="w-36 h-10 rounded-xl bg-slate-200" />
          </div>
        </div>

        {/* 4 Method Showcase Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-white border border-slate-200/90 flex flex-col justify-between space-y-3 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-200" />
                  <div className="w-12 h-4 rounded bg-slate-200 font-bold" />
                </div>
                <div className="w-14 h-4 rounded-full bg-slate-100" />
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="w-full h-3 rounded bg-slate-200" />
                <div className="w-4/5 h-3 rounded bg-slate-200" />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="w-20 h-3 rounded bg-slate-200" />
                <div className="w-3 h-3 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>

        {/* Highlight Row Skeleton */}
        <div className="flex items-center justify-center gap-6 pt-1">
          <div className="w-36 h-4 rounded bg-slate-200" />
          <div className="w-40 h-4 rounded bg-slate-200 hidden sm:block" />
          <div className="w-36 h-4 rounded bg-slate-200 hidden md:block" />
          <div className="w-32 h-4 rounded bg-slate-200 hidden lg:block" />
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="relative z-10 w-full px-6 py-2.5 border-t border-slate-200/80 bg-white/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="w-48 h-4 rounded bg-slate-200" />
          <div className="w-28 h-5 rounded bg-slate-200" />
        </div>
      </footer>
    </div>
  );
};

export default LandingSkeleton;
