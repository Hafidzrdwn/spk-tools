export default function App() {
  return (
    <main className="min-h-screen bg-surface bg-dot-grid flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="w-full max-w-xl rounded-card bg-white/85 p-8 shadow-xl backdrop-blur-md border border-slate-200/60 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-semibold mb-4">
          <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
          DecisiGraph Initialized
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
          DecisiGraph
        </h1>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Platform Sistem Pendukung Keputusan Interaktif (SAW, WP, TOPSIS, AHP). Tooling dan skeleton folder siap digunakan.
        </p>

        <div className="grid grid-cols-2 gap-3 text-left mb-6">
          <div className="p-3.5 rounded-control bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-semibold text-benefit block mb-1">Benefit Token</span>
            <span className="font-mono text-xs text-slate-500">#10B981 (Emerald)</span>
          </div>
          <div className="p-3.5 rounded-control bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-semibold text-cost block mb-1">Cost Token</span>
            <span className="font-mono text-xs text-slate-500">#F43F5E (Rose)</span>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-100 py-2 px-3 rounded-control">
          Path alias: @/ &bull; Tailwind &bull; Vitest ready
        </div>
      </div>
    </main>
  );
}
