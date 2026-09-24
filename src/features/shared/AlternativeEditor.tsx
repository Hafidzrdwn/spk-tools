import React from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import Button from '@/components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';

export const AlternativeEditor: React.FC = () => {
  const { alternatives, addAlternative, removeAlternative, updateCellValue } = useProjectStore();

  const handleUpdateName = (id: string, name: string) => {
    useProjectStore.setState((state) => {
      const alt = state.alternatives.find((a) => a.id === id);
      if (alt) {
        alt.name = name;
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">Daftar Alternatif</h3>
          <p className="text-xs text-slate-500">Kelola kandidat/opsi keputusan yang akan diperingkatkan</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => addAlternative()}>
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Alternatif</span>
        </Button>
      </div>

      <div className="space-y-2">
        {alternatives.length === 0 ? (
          <div className="p-6 text-center rounded-control bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-500">
            Belum ada alternatif. Klik "Tambah Alternatif" untuk menambahkan opsi keputusan.
          </div>
        ) : (
          alternatives.map((alt, idx) => (
            <div
              key={alt.id}
              className="flex items-center gap-3 p-2.5 rounded-control bg-white/90 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all"
            >
              <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">
                A{idx + 1}
              </span>

              <input
                type="text"
                value={alt.name}
                onChange={(e) => handleUpdateName(alt.id, e.target.value)}
                placeholder="Nama alternatif / kandidat..."
                className="flex-1 px-2.5 py-1.5 text-xs font-medium text-slate-800 bg-slate-50/70 border border-slate-200 rounded-control focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent-primary"
              />

              <button
                type="button"
                onClick={() => removeAlternative(alt.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                title="Hapus alternatif"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlternativeEditor;
