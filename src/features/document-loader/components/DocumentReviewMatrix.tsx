import React, { useState } from 'react';
import { Check, ShieldCheck, AlertCircle, ArrowRight, RefreshCw, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { ProcessedDocumentResult } from '@/services/ai';
import type { Criterion, Alternative, CriterionType } from '@/types/domain';

export interface DocumentReviewMatrixProps {
  data: ProcessedDocumentResult;
  onCommit: (finalData: {
    title: string;
    criteria: Criterion[];
    alternatives: Alternative[];
  }) => void;
  onCancelOrUploadAgain: () => void;
}

export const DocumentReviewMatrix: React.FC<DocumentReviewMatrixProps> = ({
  data,
  onCommit,
  onCancelOrUploadAgain,
}) => {
  const [projectTitle, setProjectTitle] = useState(data.projectTitle);
  const [criteria, setCriteria] = useState<Criterion[]>(data.criteria);
  const [alternatives, setAlternatives] = useState<Alternative[]>(data.alternatives);
  const [activeTab, setActiveTab] = useState<'matrix' | 'criteria'>('matrix');

  const toggleCriterionType = (critId: string) => {
    setCriteria((prev) =>
      prev.map((c) => {
        if (c.id === critId) {
          const nextType: CriterionType = c.type === 'BENEFIT' ? 'COST' : 'BENEFIT';
          return { ...c, type: nextType };
        }
        return c;
      })
    );
  };

  const updateCriterionWeight = (critId: string, newWeight: number) => {
    const safeWeight = isNaN(newWeight) || newWeight < 0 ? 0 : newWeight;
    setCriteria((prev) => {
      const updated = prev.map((c) => (c.id === critId ? { ...c, weight: safeWeight } : c));
      const totalWeight = updated.reduce((acc, c) => acc + c.weight, 0);
      return updated.map((c) => ({
        ...c,
        normalizedWeight: totalWeight > 0 ? c.weight / totalWeight : 1 / updated.length,
      }));
    });
  };

  const updateCellValue = (altId: string, critId: string, value: number) => {
    const safeValue = isNaN(value) ? 0 : value;
    setAlternatives((prev) =>
      prev.map((alt) => {
        if (alt.id === altId) {
          return {
            ...alt,
            values: {
              ...alt.values,
              [critId]: safeValue,
            },
          };
        }
        return alt;
      })
    );
  };

  const handleApply = () => {
    onCommit({
      title: projectTitle.trim() || 'Proyek SPK dari Dokumen',
      criteria,
      alternatives,
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
              Judul Proyek:
            </span>
            <input
              type="text"
              id="extracted-project-title"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1 w-full max-w-md focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-hidden"
              placeholder="Masukkan judul proyek SPK"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            <Badge variant="primary" size="sm" className="font-mono text-[10px]">
              {data.modelUsed || 'AI Extracted'}
            </Badge>
            <Badge variant="neutral" size="sm" className="text-[10px]">
              {criteria.length} Kriteria • {alternatives.length} Alternatif
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60">
          <span className="flex items-center gap-1.5 truncate">
            <FileText className="w-3.5 h-3.5 text-accent-primary shrink-0" />
            <span className="text-slate-700 font-medium">{data.sourceFile.name}</span>
          </span>
          <span className="flex items-center gap-1 text-emerald-700 font-semibold shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Terverifikasi Siap Olah
          </span>
        </div>
      </div>

      {data.warnings && data.warnings.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-amber-950">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            Catatan Penyesuaian Ekstraksi ({data.warnings.length}):
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1 text-[11px] max-h-24 overflow-y-auto">
            {data.warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="tab-toggle-matrix"
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-accent-primary text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Matriks Nilai ({alternatives.length} Alternatif)
          </button>
          <button
            type="button"
            id="tab-toggle-criteria"
            onClick={() => setActiveTab('criteria')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'criteria'
                ? 'bg-accent-primary text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tipe & Bobot Kriteria ({criteria.length})
          </button>
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Klik label Benefit/Cost untuk mengubah tipe
        </span>
      </div>

      {activeTab === 'criteria' ? (
        <div className="overflow-x-auto max-h-80 border border-slate-200 rounded-xl bg-white shadow-2xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold sticky top-0 z-10">
              <tr>
                <th className="py-2 px-3 w-10">No</th>
                <th className="py-2 px-3">Nama Kriteria</th>
                <th className="py-2 px-3">Satuan</th>
                <th className="py-2 px-3 text-center">Tipe (Klik Ubah)</th>
                <th className="py-2 px-3 text-right">Bobot Mentah</th>
                <th className="py-2 px-3 text-right">Bobot Normal (W)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {criteria.map((crit, idx) => (
                <tr key={crit.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2 px-3 font-mono text-slate-400 text-center">{idx + 1}</td>
                  <td className="py-2 px-3 font-semibold text-slate-800">{crit.name}</td>
                  <td className="py-2 px-3 text-slate-500 font-mono">{crit.unit || '-'}</td>
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleCriterionType(crit.id)}
                      className="cursor-pointer group inline-flex"
                      title="Klik untuk mengubah antara Benefit dan Cost"
                    >
                      <Badge
                        variant={crit.type === 'BENEFIT' ? 'benefit' : 'cost'}
                        size="sm"
                        className="font-bold cursor-pointer group-hover:opacity-85 transition-opacity"
                      >
                        {crit.type} ⟳
                      </Badge>
                    </button>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={crit.weight}
                      onChange={(e) => updateCriterionWeight(crit.id, parseFloat(e.target.value))}
                      className="w-20 px-2 py-0.5 text-right font-mono text-xs border border-slate-200 rounded-md focus:border-accent-primary outline-hidden"
                    />
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-accent-primary">
                    {(crit.normalizedWeight * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-80 border border-slate-200 rounded-xl bg-white shadow-2xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold sticky top-0 z-10">
              <tr>
                <th className="py-2 px-3 w-10">No</th>
                <th className="py-2 px-3 min-w-35">Alternatif</th>
                {criteria.map((crit) => (
                  <th key={crit.id} className="py-2 px-3 text-right min-w-27.5">
                    <div className="flex flex-col items-end">
                      <span className="truncate max-w-30">{crit.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">
                        ({crit.type})
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alternatives.map((alt, altIdx) => (
                <tr key={alt.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2 px-3 font-mono text-slate-400 text-center">{altIdx + 1}</td>
                  <td className="py-2 px-3 font-semibold text-slate-800">{alt.name}</td>
                  {criteria.map((crit) => {
                    const val = alt.values[crit.id] ?? 0;
                    return (
                      <td key={crit.id} className="py-2 px-3 text-right font-mono">
                        <input
                          type="number"
                          step="any"
                          value={val}
                          onChange={(e) =>
                            updateCellValue(alt.id, crit.id, parseFloat(e.target.value))
                          }
                          className="w-20 px-1.5 py-0.5 text-right font-mono text-xs border border-slate-200 rounded-md focus:border-accent-primary outline-hidden"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
        <Button
          variant="secondary"
          size="sm"
          onClick={onCancelOrUploadAgain}
          className="w-full sm:w-auto h-9 px-4 text-xs font-semibold gap-1.5 border-slate-200"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          Pilih / Unggah Berkas Lain
        </Button>

        <Button
          variant="primary"
          size="sm"
          id="btn-apply-document-matrix"
          onClick={handleApply}
          className="w-full sm:w-auto h-9 px-5 text-xs font-bold gap-2 shadow-xs"
        >
          <Check className="w-4 h-4" />
          Terapkan ke Proyek Aktif
          <ArrowRight className="w-3.5 h-3.5 opacity-80" />
        </Button>
      </div>
    </div>
  );
};

export default DocumentReviewMatrix;
