import React from 'react';

export const ReviewSkeleton: React.FC = () => {
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
            <div className="w-24 h-7 rounded-lg bg-white" />
            <div className="w-24 h-7 rounded-lg bg-slate-200" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Page Title & Intro */}
        <div className="space-y-2">
          <div className="w-64 h-7 rounded bg-slate-300" />
          <div className="w-96 h-4 rounded bg-slate-200" />
        </div>

        {/* 2 Columns: Form & Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Left 5 Cols */}
          <div className="lg:col-span-5 space-y-4">
            <div className="h-9 w-full bg-slate-100 rounded-xl" />
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="w-48 h-5 rounded bg-slate-300" />
              <div className="w-full h-16 rounded-xl bg-amber-50/60 border border-amber-100" />
              <div className="space-y-1.5">
                <div className="w-24 h-3.5 rounded bg-slate-200" />
                <div className="w-full h-8 rounded bg-slate-100" />
              </div>
              <div className="space-y-1.5">
                <div className="w-24 h-3.5 rounded bg-slate-200" />
                <div className="w-full h-8 rounded bg-slate-100" />
              </div>
              <div className="space-y-1.5">
                <div className="w-24 h-3.5 rounded bg-slate-200" />
                <div className="w-full h-20 rounded bg-slate-100" />
              </div>
              <div className="w-full h-9 rounded-lg bg-indigo-300" />
            </div>
          </div>

          {/* Reviews List Right 7 Cols */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="w-24 h-7 rounded bg-slate-300" />
                <div className="w-36 h-3.5 rounded bg-slate-200" />
              </div>
              <div className="w-28 h-6 rounded-full bg-emerald-100" />
            </div>

            <div className="space-y-3">
              <div className="w-36 h-4 rounded bg-slate-200" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-200" />
                      <div className="space-y-1">
                        <div className="w-24 h-4 rounded bg-slate-300" />
                        <div className="w-16 h-3 rounded bg-slate-200" />
                      </div>
                    </div>
                    <div className="w-20 h-4 rounded bg-amber-100" />
                  </div>
                  <div className="w-full h-10 rounded bg-slate-100" />
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="w-20 h-3 rounded bg-slate-200" />
                    <div className="w-16 h-3 rounded bg-emerald-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReviewSkeleton;
