import React from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useNormalizedCriteria } from '@/store/selectors';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import NumericInput from '@/components/ui/NumericInput';
import GlossaryTerm from '@/features/glossary/GlossaryTerm';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import type { CriterionType } from '@/types/domain';

export const CriteriaEditor: React.FC = () => {
  const { addCriterion, removeCriterion, updateCriterion, autoDistributeWeights } = useProjectStore();
  const criteria = useNormalizedCriteria();

  const handleToggleType = (id: string, currentType: CriterionType) => {
    updateCriterion(id, { type: currentType === 'BENEFIT' ? 'COST' : 'BENEFIT' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">Kriteria Keputusan</h3>
          <p className="text-xs text-slate-500">
            Kelola <GlossaryTerm term="Kriteria">kriteria</GlossaryTerm>,{' '}
            <GlossaryTerm term="Bobot (Weight)">bobot</GlossaryTerm>, dan tipe (
            <GlossaryTerm term="Benefit">Benefit</GlossaryTerm> /{' '}
            <GlossaryTerm term="Cost">Cost</GlossaryTerm>)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={autoDistributeWeights}>
            <Wand2 className="w-3.5 h-3.5 text-accent-primary" />
            <span>Ratakan Bobot</span>
          </Button>
          <Button variant="primary" size="sm" onClick={() => addCriterion()} data-tour-id="add-criterion-btn">
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kriteria</span>
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {criteria.length === 0 ? (
          <div className="p-6 text-center rounded-control bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-500">
            Belum ada kriteria. Klik "Tambah Kriteria" untuk memulai.
          </div>
        ) : (
          criteria.map((crit, idx) => (
            <div
              key={crit.id}
              className="flex items-center gap-3 p-2.5 rounded-control bg-white/90 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all"
            >
              <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">
                C{idx + 1}
              </span>

              <input
                type="text"
                value={crit.name}
                onChange={(e) => updateCriterion(crit.id, { name: e.target.value })}
                placeholder="Nama kriteria..."
                className="flex-1 px-2.5 py-1.5 text-xs font-medium text-slate-800 bg-slate-50/70 border border-slate-200 rounded-control focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent-primary"
              />

              <button
                type="button"
                onClick={() => handleToggleType(crit.id, crit.type)}
                data-tour-id={idx === 0 ? "benefit-cost-toggle" : undefined}
                className="focus:outline-none transition-transform active:scale-95 cursor-pointer"
                title="Klik untuk mengubah tipe"
              >
                <Badge variant={crit.type === 'BENEFIT' ? 'benefit' : 'cost'} size="sm">
                  <GlossaryTerm term={crit.type === 'BENEFIT' ? 'Benefit' : 'Cost'}>
                    {crit.type}
                  </GlossaryTerm>
                </Badge>
              </button>

              <div className="w-24">
                <NumericInput
                  value={crit.weight}
                  onChange={(val) => updateCriterion(crit.id, { weight: val })}
                  min={0}
                  step={0.5}
                />
              </div>

              <div className="w-16 text-right font-mono text-xs font-semibold text-slate-500">
                {(crit.normalizedWeight * 100).toFixed(1)}%
              </div>

              <button
                type="button"
                onClick={() => removeCriterion(crit.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                title="Hapus kriteria"
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

export default CriteriaEditor;
