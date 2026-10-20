import React from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useShallow } from 'zustand/react/shallow';
import { useNormalizedCriteria } from '@/store/selectors';
import Button from '@/components/ui/Button';
import NumericInput from '@/components/ui/NumericInput';
import GlossaryTerm from '@/features/glossary/GlossaryTerm';
import { Plus, Trash2 } from 'lucide-react';
import { useNumberFormatter } from '@/utils/numberFormat';

import CreatableSelect from 'react-select/creatable';

export interface UnitOption {
  label: string;
  value: string;
}

export const COMMON_CRITERIA_UNITS: UnitOption[] = [
  { label: 'Skala 0-100', value: 'Skala 0-100' },
  { label: 'Skala 1-100', value: '1-100' },
  { label: 'Skala 1-10', value: 'Skala 1-10' },
  { label: 'Skala 1-5', value: 'Skala 1-5' },
  { label: 'Skala 4.0 (IPK)', value: 'Skala 4.0' },
  { label: 'Juta Rp', value: 'Juta Rp' },
  { label: 'Ribu Rp', value: 'Ribu Rp' },
  { label: 'Rupiah (Rp)', value: 'Rp' },
  { label: 'Persen (%)', value: '%' },
  { label: 'Hari', value: 'Hari' },
  { label: 'Bulan', value: 'Bulan' },
  { label: 'Tahun', value: 'Tahun' },
  { label: 'Jam', value: 'Jam' },
  { label: 'GB (Gigabyte)', value: 'GB' },
  { label: 'Unit / Buah', value: 'Unit' },
  { label: 'Orang', value: 'Orang' },
  { label: 'Orang/Hari', value: 'Orang/Hari' },
];

interface CriterionUnitSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

const CriterionUnitSelector: React.FC<CriterionUnitSelectorProps> = ({ value, onChange }) => {
  const currentOption: UnitOption | null = value
    ? COMMON_CRITERIA_UNITS.find((u) => u.value.toLowerCase() === value.toLowerCase()) || {
        label: value,
        value: value,
      }
    : null;

  return (
    <div className="w-32 sm:w-40 min-w-32 shrink-0">
      <CreatableSelect<UnitOption>
        value={currentOption}
        onChange={(opt) => onChange(opt ? opt.value : '')}
        options={COMMON_CRITERIA_UNITS}
        isClearable
        isSearchable
        placeholder="Pilih / cari satuan..."
        formatCreateLabel={(inputValue) => `Gunakan kustom: "${inputValue}"`}
        noOptionsMessage={({ inputValue }) =>
          inputValue ? `Tekan Enter untuk gunakan "${inputValue}"` : 'Tidak ada opsi satuan'
        }
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: '30px',
            height: '30px',
            fontSize: '11px',
            backgroundColor: state.isFocused ? '#ffffff' : 'rgba(248, 250, 252, 0.7)',
            borderColor: state.isFocused ? '#6366f1' : '#e2e8f0',
            borderRadius: '6px',
            boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
            '&:hover': {
              borderColor: '#cbd5e1',
            },
          }),
          valueContainer: (base) => ({
            ...base,
            padding: '0 6px',
            height: '28px',
          }),
          input: (base) => ({
            ...base,
            margin: 0,
            padding: 0,
            fontSize: '11px',
            color: '#1e293b',
          }),
          singleValue: (base) => ({
            ...base,
            fontSize: '11px',
            color: '#334155',
            fontWeight: 500,
          }),
          placeholder: (base) => ({
            ...base,
            fontSize: '11px',
            color: '#94a3b8',
          }),
          indicatorsContainer: (base) => ({
            ...base,
            height: '28px',
          }),
          dropdownIndicator: (base) => ({
            ...base,
            padding: '2px 4px',
            color: '#94a3b8',
            '&:hover': {
              color: '#64748b',
            },
            svg: {
              width: '14px',
              height: '14px',
            },
          }),
          clearIndicator: (base) => ({
            ...base,
            padding: '2px 4px',
            color: '#94a3b8',
            '&:hover': {
              color: '#ef4444',
            },
            svg: {
              width: '13px',
              height: '13px',
            },
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          menu: (base) => ({
            ...base,
            zIndex: 9999,
            fontSize: '11px',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
          }),
          option: (base, state) => ({
            ...base,
            fontSize: '11px',
            padding: '5px 10px',
            backgroundColor: state.isSelected
              ? '#4f46e5'
              : state.isFocused
              ? '#eef2ff'
              : 'transparent',
            color: state.isSelected ? '#ffffff' : '#1e293b',
            cursor: 'pointer',
            '&:active': {
              backgroundColor: '#e0e7ff',
            },
          }),
        }}
      />
    </div>
  );
};

export const CriteriaEditor: React.FC = () => {
  const { formatNumber } = useNumberFormatter();
  const { addCriterion, removeCriterion, updateCriterion, autoDistributeWeights } = useProjectStore(
    useShallow((s) => ({
      addCriterion: s.addCriterion,
      removeCriterion: s.removeCriterion,
      updateCriterion: s.updateCriterion,
      autoDistributeWeights: s.autoDistributeWeights,
    }))
  );
  const criteria = useNormalizedCriteria();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">Kriteria Keputusan</h3>
          <p className="text-xs text-slate-500">
            Kelola <GlossaryTerm term="Kriteria">kriteria</GlossaryTerm>,{' '}
            <GlossaryTerm term="Bobot (Weight)">bobot</GlossaryTerm>, dan tipe (
            <GlossaryTerm term="Benefit">Benefit</GlossaryTerm> /{' '}
            <GlossaryTerm term="Cost">Cost</GlossaryTerm>)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={autoDistributeWeights} className="min-h-9 sm:min-h-10 text-xs cursor-pointer">
            <span className="hidden xs:inline">Ratakan Bobot</span>
            <span className="xs:hidden">Ratakan</span>
          </Button>
          <Button variant="primary" size="sm" onClick={() => addCriterion()} data-tour-id="add-criterion-btn" className="min-h-9 sm:min-h-10 text-xs cursor-pointer">
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
          <>
            <div className="hidden sm:flex items-center gap-3 px-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span className="w-6 text-center">Kode</span>
              <span className="flex-1 min-w-32.5">Nama Kriteria</span>
              <span className="w-32 sm:w-40">Satuan / Format</span>
              <span className="w-30 text-center">Tipe</span>
              <span className="w-28 sm:w-32 text-center">Bobot (w)</span>
              <span className="w-16 text-right">Normalisasi</span>
              <span className="w-8"></span>
            </div>

            {criteria.map((crit, idx) => (
              <div
                key={crit.id}
                className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 p-2.5 rounded-control bg-white/90 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all"
              >
                <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">
                  C{idx + 1}
                </span>

                <input
                  type="text"
                  value={crit.name}
                  onChange={(e) => updateCriterion(crit.id, { name: e.target.value })}
                  placeholder="Nama kriteria..."
                  title="Nama kriteria evaluasi"
                  className="flex-1 min-w-32.5 px-2.5 py-1.5 text-xs font-medium text-slate-800 bg-slate-50/70 border border-slate-200 rounded-control focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent-primary"
                />

                <CriterionUnitSelector
                  value={crit.unit || ''}
                  onChange={(val) => updateCriterion(crit.id, { unit: val })}
                />

                <div
                  className="inline-flex items-center p-0.5 bg-slate-100/90 rounded-lg border border-slate-200/80 shadow-2xs shrink-0"
                  data-tour-id={idx === 0 ? "benefit-cost-toggle" : undefined}
                  role="group"
                  aria-label="Tipe Kriteria"
                >
                  <button
                    type="button"
                    onClick={() => updateCriterion(crit.id, { type: 'BENEFIT' })}
                    className={`px-2 py-0.5 text-[11px] rounded-md transition-all cursor-pointer ${
                      crit.type === 'BENEFIT'
                        ? 'bg-benefit text-white font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 font-medium'
                    }`}
                    title="Benefit: Nilai kriteria yang lebih besar lebih diinginkan"
                  >
                    Benefit
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCriterion(crit.id, { type: 'COST' })}
                    className={`px-2 py-0.5 text-[11px] rounded-md transition-all cursor-pointer ${
                      crit.type === 'COST'
                        ? 'bg-cost text-white font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 font-medium'
                    }`}
                    title="Cost: Nilai kriteria yang lebih kecil lebih diinginkan"
                  >
                    Cost
                  </button>
                </div>

                <div className="w-28 sm:w-32">
                  <NumericInput
                    value={crit.weight}
                    onChange={(val) => updateCriterion(crit.id, { weight: val })}
                    min={0}
                    step={0.5}
                    placeholder="Bobot (cth: 25 / 20%)"
                    title="Nilai bobot: angka bulat, desimal, atau persen (cth: 25, 0.25, 20%)"
                  />
                </div>

                <div className="w-16 text-right font-mono text-xs font-semibold text-slate-500">
                  {formatNumber(crit.normalizedWeight * 100, 1)}%
                </div>

                <button
                  type="button"
                  onClick={() => removeCriterion(crit.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  title="Hapus kriteria"
                  aria-label="Hapus kriteria"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default CriteriaEditor;
