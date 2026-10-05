import React from 'react';

export const ReviewSkeleton: React.FC = () => {
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
            <div className="w-16 sm:w-28 h-9 rounded-md bg-white shadow-2xs" />
            <div className="w-16 sm:w-28 h-9 rounded-md bg-slate-200" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6 w-full">
        {/* Page Title & Intro */}
        <div className="space-y-1">
          <div className="w-64 sm:w-80 h-7 rounded bg-slate-300" />
          <div className="w-full max-w-md h-4 rounded bg-slate-200" />
        </div>

        {/* 2 Columns: Form (Left 5 Cols) & Reviews (Right 7 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Left 5 Cols */}
          <div className="lg:col-span-5 space-y-4">
            {/* Form Mode Selector */}
            <div className="p-1 bg-slate-100 rounded-lg flex items-center gap-1 border border-slate-200">
              <div className="flex-1 min-h-11 rounded-md bg-white shadow-2xs" />
              <div className="flex-1 min-h-11 rounded-md bg-slate-200" />
            </div>

            {/* Form Card */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="space-y-1 pb-3 border-b border-slate-100">
                <div className="w-44 h-4 rounded bg-slate-300" />
                <div className="w-60 h-3 rounded bg-slate-200" />
              </div>

              {/* Star rating placeholder */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col items-center">
                <div className="w-28 h-3 rounded bg-slate-200" />
                <div className="w-48 h-8 rounded bg-amber-50 border border-amber-100" />
              </div>

              <div className="space-y-1.5">
                <div className="w-24 h-3.5 rounded bg-slate-200" />
                <div className="w-full min-h-10 sm:min-h-9 rounded-lg bg-slate-50 border border-slate-200" />
              </div>

              <div className="space-y-1.5">
                <div className="w-24 h-3.5 rounded bg-slate-200" />
                <div className="w-full min-h-10 sm:min-h-9 rounded-lg bg-slate-50 border border-slate-200" />
              </div>

              <div className="space-y-1.5">
                <div className="w-28 h-3.5 rounded bg-slate-200" />
                <div className="w-full min-h-20 sm:min-h-18 rounded-lg bg-slate-50 border border-slate-200" />
              </div>

              <div className="w-full min-h-11 rounded-lg bg-indigo-300" />
            </div>
          </div>

          {/* Reviews List Right 7 Cols */}
          <div className="lg:col-span-7 space-y-4">
            {/* Score Summary Card */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-7 rounded bg-slate-300" />
                  <div className="w-24 h-4 rounded bg-amber-100" />
                </div>
                <div className="w-32 h-3 rounded bg-slate-200" />
              </div>
              <div className="w-28 h-6 rounded-full bg-slate-100 hidden sm:block" />
            </div>

            {/* List Header */}
            <div className="space-y-3">
              <div className="w-36 h-4 rounded bg-slate-200 px-1" />

              {/* 3 Review Cards */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                      <div className="space-y-1">
                        <div className="w-24 sm:w-32 h-3.5 rounded bg-slate-300" />
                        <div className="w-16 sm:w-20 h-2.5 rounded bg-slate-200" />
                      </div>
                    </div>
                    <div className="w-16 sm:w-20 h-4 rounded bg-amber-100 shrink-0" />
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <div className="w-full h-3 rounded bg-slate-100" />
                    <div className="w-4/5 h-3 rounded bg-slate-100" />
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="w-16 h-2.5 rounded bg-slate-200" />
                    <div className="w-20 h-4 rounded-full bg-slate-100" />
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
