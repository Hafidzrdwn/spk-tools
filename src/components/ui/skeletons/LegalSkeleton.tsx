import React from 'react';

export const LegalSkeleton: React.FC = () => {
  return (
    <div className="min-h-dvh w-full bg-slate-50/70 text-slate-800 flex flex-col antialiased overflow-x-hidden animate-pulse">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-3 sm:px-6 py-2 sm:py-2.5">
        <div className="flex sm:hidden items-center justify-between gap-2 w-full">
          <div className="w-28 h-7 rounded-lg bg-slate-200" />
          <div className="w-24 h-7 rounded-lg bg-indigo-100" />
        </div>

        <div className="hidden sm:flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-3 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-28 sm:w-32 h-7 rounded-lg bg-slate-200" />
            <span className="text-slate-200 hidden xs:inline">|</span>
            <div className="w-20 h-7 rounded-lg bg-slate-100 hidden sm:block" />
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="w-16 h-7 rounded-lg bg-indigo-200" />
              <div className="w-20 h-7 rounded-lg bg-slate-200" />
              <div className="w-24 h-7 rounded-lg bg-slate-200" />
              <div className="w-28 h-7 rounded-lg bg-slate-200" />
            </div>
            <div className="w-20 h-7 rounded-lg bg-indigo-100 ml-1" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full">
        <div className="mb-6 flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80 text-xs">
          <div className="w-32 h-4 rounded bg-slate-200" />
          <div className="w-28 h-3 rounded bg-slate-100 hidden sm:block" />
        </div>

        <div className="space-y-10 sm:space-y-12">
          <section className="border-b border-slate-200 pb-8 sm:pb-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-3">
              <div className="w-28 h-4 rounded bg-indigo-100" />
              <div className="w-64 sm:w-80 h-9 rounded bg-slate-300" />
              <div className="space-y-2 pt-1">
                <div className="w-full h-4 rounded bg-slate-200" />
                <div className="w-5/6 h-4 rounded bg-slate-200" />
                <div className="w-4/6 h-4 rounded bg-slate-200" />
              </div>
              <div className="w-48 h-3 rounded bg-slate-100 pt-1" />
            </div>
            <div className="md:col-span-4 flex justify-center md:justify-end">
              <div className="w-40 sm:w-48 h-36 rounded-xl bg-slate-200/80" />
            </div>
          </section>

          <section className="space-y-8 max-w-3xl">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-4 rounded bg-indigo-100" />
                  <div className="w-56 sm:w-72 h-5 rounded bg-slate-300" />
                </div>
                <div className="pl-9 space-y-2">
                  <div className="w-full h-4 rounded bg-slate-200" />
                  <div className="w-full h-4 rounded bg-slate-200" />
                  <div className="w-4/5 h-4 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </section>
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

export default LegalSkeleton;
