import React, { useState, useRef, useEffect } from 'react';
import type { Criterion, Alternative, CaseContextMetadata } from '@/types/domain';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Check, Edit3, AlertTriangle, TableProperties, Building2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const CRITERIA_MAX_INLINE_LENGTH = 12;

export interface ExtractedPreviewTableProps {
  criteria: Criterion[];
  alternatives: Alternative[];
  unmatchedCriteria?: string[];
  onCommit: () => void;
  onBackToEdit: () => void;
  isCommitted: boolean;
  contextMetadata?: CaseContextMetadata;
  onUpdateCriteria?: (criteria: Criterion[]) => void;
  onUpdateAlternatives?: (alternatives: Alternative[]) => void;
}

export const ExtractedPreviewTable: React.FC<ExtractedPreviewTableProps> = ({
  criteria,
  alternatives,
  unmatchedCriteria = [],
  onCommit,
  onBackToEdit,
  isCommitted,
  contextMetadata,
  onUpdateCriteria,
  onUpdateAlternatives,
}) => {
  const originalCriteriaMap = useRef<Map<string, string>>(new Map());
  const originalAlternativesMap = useRef<Map<string, { name: string; values: Record<string, number> }>>(new Map());
  const prevAltKeys = useRef<string>('');

  const currentAltKeys = alternatives.map((a) => a.id).join(',');

  useEffect(() => {
    if (alternatives.length > 0 && prevAltKeys.current !== currentAltKeys) {
      originalCriteriaMap.current.clear();
      criteria.forEach((c) => originalCriteriaMap.current.set(c.id, c.name));

      originalAlternativesMap.current.clear();
      alternatives.forEach((a) => {
        originalAlternativesMap.current.set(a.id, {
          name: a.name,
          values: { ...a.values },
        });
      });
      prevAltKeys.current = currentAltKeys;
    }
  }, [alternatives, criteria, currentAltKeys]);

  const [editingCritId, setEditingCritId] = useState<string | null>(null);
  const [inlineCritInput, setInlineCritInput] = useState<string>('');

  const [modalCrit, setModalCrit] = useState<Criterion | null>(null);
  const [modalCritName, setModalCritName] = useState<string>('');

  const [editingAltId, setEditingAltId] = useState<string | null>(null);
  const [inlineAltInput, setInlineAltInput] = useState<string>('');

  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'criteria' | 'alternative';
    id: string;
    name: string;
  } | null>(null);

  const [editingCell, setEditingCell] = useState<{ altId: string; critId: string } | null>(null);
  const [editingCellVal, setEditingCellVal] = useState<string>('');

  const startEditInlineCrit = (crit: Criterion) => {
    setEditingCritId(crit.id);
    setInlineCritInput(crit.name);
  };

  const commitInlineCrit = (critId: string) => {
    const trimmed = inlineCritInput.trim();
    const origName = originalCriteriaMap.current.get(critId) || 'Kriteria';
    const finalName = trimmed === '' ? origName : trimmed;

    if (trimmed === '') {
      toast.info('Nama kriteria dikosongkan, dikembalikan ke hasil ekstraksi semula.');
    }

    if (onUpdateCriteria) {
      onUpdateCriteria(
        criteria.map((c) => (c.id === critId ? { ...c, name: finalName } : c))
      );
    }
    setEditingCritId(null);
  };

  const handleSaveCritModal = () => {
    if (!modalCrit) return;
    const trimmed = modalCritName.trim();
    const origName = originalCriteriaMap.current.get(modalCrit.id) || 'Kriteria';
    const finalName = trimmed === '' ? origName : trimmed;

    if (trimmed === '') {
      toast.info('Nama kriteria dikosongkan, dikembalikan ke hasil ekstraksi semula.');
    }

    if (onUpdateCriteria) {
      onUpdateCriteria(
        criteria.map((c) => (c.id === modalCrit.id ? { ...c, name: finalName } : c))
      );
    }
    setModalCrit(null);
  };

  const handleToggleCritType = (critId: string) => {
    if (onUpdateCriteria) {
      onUpdateCriteria(
        criteria.map((c) => {
          if (c.id === critId) {
            const nextType = c.type === 'BENEFIT' ? 'COST' : 'BENEFIT';
            toast.info(`Tipe kriteria ${c.name} diubah ke ${nextType}`);
            return { ...c, type: nextType };
          }
          return c;
        })
      );
    }
  };

  const startEditInlineAlt = (alt: Alternative) => {
    setEditingAltId(alt.id);
    setInlineAltInput(alt.name);
  };

  const commitInlineAlt = (altId: string) => {
    const trimmed = inlineAltInput.trim();
    const orig = originalAlternativesMap.current.get(altId);
    const origName = orig ? orig.name : 'Alternatif';
    const finalName = trimmed === '' ? origName : trimmed;

    if (trimmed === '') {
      toast.info('Nama alternatif dikosongkan, dikembalikan ke hasil ekstraksi semula.');
    }

    if (onUpdateAlternatives) {
      onUpdateAlternatives(
        alternatives.map((a) => (a.id === altId ? { ...a, name: finalName } : a))
      );
    }
    setEditingAltId(null);
  };

  const handleRequestDeleteCrit = (crit: Criterion) => {
    if (criteria.length <= 1) {
      toast.error('Matriks membutuhkan minimal 1 kriteria.');
      return;
    }
    setDeleteTarget({ type: 'criteria', id: crit.id, name: crit.name });
  };

  const handleRequestDeleteAlt = (alt: Alternative) => {
    if (alternatives.length <= 1) {
      toast.error('Matriks membutuhkan minimal 1 alternatif.');
      return;
    }
    setDeleteTarget({ type: 'alternative', id: alt.id, name: alt.name });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'criteria') {
      if (onUpdateCriteria) {
        onUpdateCriteria(criteria.filter((c) => c.id !== deleteTarget.id));
      }
      if (onUpdateAlternatives) {
        onUpdateAlternatives(
          alternatives.map((a) => {
            const nextValues = { ...a.values };
            delete nextValues[deleteTarget.id];
            return { ...a, values: nextValues };
          })
        );
      }
      toast.success('Kolom kriteria berhasil dihapus.');
    } else {
      if (onUpdateAlternatives) {
        onUpdateAlternatives(alternatives.filter((a) => a.id !== deleteTarget.id));
      }
      toast.success('Baris alternatif berhasil dihapus.');
    }

    setDeleteTarget(null);
  };

  const startEditCell = (altId: string, critId: string, currentVal: number | undefined) => {
    setEditingCell({ altId, critId });
    setEditingCellVal(currentVal !== undefined ? String(currentVal) : '');
  };

  const saveEditCell = (altId: string, critId: string) => {
    const trimmed = editingCellVal.trim();
    const orig = originalAlternativesMap.current.get(altId);
    const origVal = orig?.values[critId] ?? 0;

    let finalVal = origVal;
    if (trimmed === '') {
      toast.info('Nilai dikembalikan ke hasil ekstraksi semula.');
    } else {
      const parsed = parseFloat(trimmed.replace(',', '.'));
      if (isNaN(parsed)) {
        toast.info('Nilai tidak valid, dikembalikan ke hasil ekstraksi semula.');
      } else {
        finalVal = parsed;
      }
    }

    if (onUpdateAlternatives) {
      onUpdateAlternatives(
        alternatives.map((a) => {
          if (a.id === altId) {
            return {
              ...a,
              values: {
                ...a.values,
                [critId]: finalVal,
              },
            };
          }
          return a;
        })
      );
    }
    setEditingCell(null);
  };

  if (alternatives.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-card border border-slate-200 text-xs text-slate-500">
        Belum ada alternatif yang diekstraksi. Silakan ketik narasi teks atau coba contoh kasus.
      </div>
    );
  }

  return (
    <Card className="border border-slate-200/90 shadow-2xs space-y-4">
      <CardHeader className="py-3 px-3.5 sm:px-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-accent-primary flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <TableProperties className="w-4 h-4 shrink-0" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-sm font-bold text-slate-900 leading-tight">
              Pratinjau Matriks Hasil Ekstraksi
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5 leading-snug">
              Klik nama kriteria/alternatif atau sel untuk mengedit. Klik badge untuk beralih Benefit/Cost.
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="secondary" size="sm" onClick={onBackToEdit} className="flex-1 sm:flex-initial text-xs h-9 px-3">
            <Edit3 className="w-3.5 h-3.5 mr-1 shrink-0" />
            <span>Edit Narasi</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            data-tour-id="story-commit-btn"
            onClick={onCommit}
            className="flex-1 sm:flex-initial font-semibold shadow-xs cursor-pointer px-4 h-9"
          >
            {isCommitted ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-300 shrink-0" />
                <span>Data Diterapkan!</span>
              </>
            ) : (
              <span>Terapkan ke Proyek</span>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {contextMetadata?.institutionOrOrg && (
          <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 flex flex-wrap items-center gap-2 text-xs text-indigo-950">
            <Badge variant="neutral" size="sm" className="bg-indigo-100 text-indigo-800 border-indigo-200 font-bold flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              <span>{contextMetadata.institutionOrOrg}</span>
            </Badge>
            {contextMetadata.targetStakeholder && (
              <span className="text-[11px] text-indigo-700">
                Pemangku Kepentingan: <strong>{contextMetadata.targetStakeholder}</strong>
              </span>
            )}
            {contextMetadata.caseTitle && (
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                • {contextMetadata.caseTitle}
              </span>
            )}
          </div>
        )}

        {unmatchedCriteria.length > 0 && (
          <div className="p-2.5 rounded-lg bg-amber-50/90 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Kriteria belum memiliki nilai di teks: <strong>{unmatchedCriteria.join(', ')}</strong></span>
          </div>
        )}

        <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white/90 custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3.5 w-44 sm:w-56 min-w-40 sm:min-w-52 max-w-52 sm:max-w-64 sticky left-0 bg-slate-50/95 z-10 border-r border-slate-200/70">
                  <div className="flex items-center justify-between">
                    <span>Alternatif ({alternatives.length})</span>
                    <span className="text-[10px] text-slate-400 font-normal">Klik nama atau sel</span>
                  </div>
                </th>
                {criteria.map((crit) => {
                  const isLongCrit = crit.name.length > CRITERIA_MAX_INLINE_LENGTH;
                  const isInlineEditing = editingCritId === crit.id;

                  return (
                    <th
                      key={crit.id}
                      className="py-3 px-3 w-40 sm:w-48 min-w-36 sm:min-w-44 max-w-52 border-r border-slate-200/50 last:border-r-0 text-center align-top select-none group/col"
                    >
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="flex items-center justify-between gap-1 w-full min-h-7.5">
                          {isInlineEditing ? (
                            <input
                              type="text"
                              autoFocus
                              value={inlineCritInput}
                              onChange={(e) => setInlineCritInput(e.target.value)}
                              onBlur={() => commitInlineCrit(crit.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitInlineCrit(crit.id);
                                if (e.key === 'Escape') setEditingCritId(null);
                              }}
                              className="w-full min-w-0 text-xs font-bold text-center text-slate-800 bg-white border border-indigo-500 rounded px-1.5 py-1 outline-none ring-2 ring-indigo-500/20 shadow-2xs"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (isLongCrit) {
                                  setModalCrit(crit);
                                  setModalCritName(crit.name);
                                } else {
                                  startEditInlineCrit(crit);
                                }
                              }}
                              className="flex-1 min-w-0 text-center font-bold text-xs text-slate-800 hover:text-indigo-600 hover:bg-slate-100/70 px-1.5 py-1 rounded-md cursor-pointer transition-colors inline-flex items-center justify-center gap-1 group/critbtn"
                              title={isLongCrit ? 'Klik untuk mengedit nama kriteria di modal' : 'Klik untuk mengedit nama kriteria'}
                            >
                              <span className="truncate">{crit.name}</span>
                              <Edit3 className="w-3 h-3 text-slate-400 opacity-0 group-hover/critbtn:opacity-100 group-hover/critbtn:text-indigo-600 transition-opacity shrink-0" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRequestDeleteCrit(crit)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0 opacity-40 hover:opacity-100"
                            title="Hapus kriteria ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleCritType(crit.id)}
                          className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                          title="Klik untuk mengubah jenis kriteria (BENEFIT <-> COST)"
                        >
                          <Badge
                            variant={crit.type === 'BENEFIT' ? 'benefit' : 'cost'}
                            size="sm"
                            className="shadow-2xs select-none"
                          >
                            {crit.type}
                          </Badge>
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alternatives.map((alt, idx) => {
                const isInlineEditingAlt = editingAltId === alt.id;

                return (
                  <tr key={alt.id || idx} className="hover:bg-slate-50/60 transition-colors group/row">
                    <td className="py-2.5 px-3.5 font-semibold text-slate-800 sticky left-0 bg-white/95 z-10 border-r border-slate-200/70 shadow-xs w-44 sm:w-56 min-w-40 sm:min-w-52 max-w-52 sm:max-w-64 align-middle">
                      <div className="flex items-center justify-between gap-1.5 w-full min-h-7.5">
                        {isInlineEditingAlt ? (
                          <input
                            type="text"
                            autoFocus
                            value={inlineAltInput}
                            onChange={(e) => setInlineAltInput(e.target.value)}
                            onBlur={() => commitInlineAlt(alt.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitInlineAlt(alt.id);
                              if (e.key === 'Escape') setEditingAltId(null);
                            }}
                            className="w-full min-w-0 text-xs font-semibold text-slate-800 bg-white border border-indigo-500 rounded px-2 py-1 outline-none ring-2 ring-indigo-500/20 shadow-2xs"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEditInlineAlt(alt)}
                            className="flex-1 min-w-0 text-left font-semibold text-xs text-slate-800 hover:text-indigo-600 hover:bg-slate-50 px-1.5 py-1 rounded-md cursor-pointer transition-colors inline-flex items-center gap-1.5 group/altbtn"
                            title="Klik untuk mengedit nama alternatif"
                          >
                            <span className="truncate">{alt.name}</span>
                            <Edit3 className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover/altbtn:opacity-100 group-hover/altbtn:text-indigo-600 transition-opacity shrink-0" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRequestDeleteAlt(alt)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0 opacity-40 hover:opacity-100"
                          title="Hapus alternatif ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    {criteria.map((crit) => {
                      const val = alt.values[crit.id];
                      const isCellEditing = editingCell?.altId === alt.id && editingCell?.critId === crit.id;

                      return (
                        <td key={crit.id} className="py-2.5 px-3 border-r border-slate-100 last:border-r-0 text-center font-mono font-medium text-slate-700">
                          {isCellEditing ? (
                            <input
                              type="text"
                              autoFocus
                              inputMode="decimal"
                              value={editingCellVal}
                              onChange={(e) => setEditingCellVal(e.target.value)}
                              onBlur={() => saveEditCell(alt.id, crit.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEditCell(alt.id, crit.id);
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                              className="w-24 text-xs font-mono font-bold text-slate-900 bg-white border border-indigo-500 rounded px-2 py-1 outline-none ring-2 ring-indigo-500/20 text-center mx-auto shadow-2xs"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEditCell(alt.id, crit.id, val)}
                              className="w-full h-full py-1.5 px-2 hover:bg-indigo-50/80 hover:text-indigo-700 rounded-md cursor-pointer transition-colors"
                              title="Klik untuk mengedit nilai rating"
                            >
                              {val !== undefined ? val : <span className="text-slate-300">-</span>}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>

      {modalCrit && (
        <Dialog
          isOpen={Boolean(modalCrit)}
          onOpenChange={(open) => {
            if (!open) setModalCrit(null);
          }}
          title="Edit Nama Kriteria"
          className="max-w-md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setModalCrit(null)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveCritModal}
                className="text-xs font-semibold px-4 cursor-pointer"
              >
                Simpan
              </Button>
            </div>
          }
        >
          <div className="space-y-3 py-1 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-800 block">
                Nama Kriteria
              </label>
              <input
                type="text"
                autoFocus
                value={modalCritName}
                onChange={(e) => setModalCritName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveCritModal();
                }}
                placeholder="Masukkan nama kriteria..."
                className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <p className="text-[11px] text-slate-400">
                Kosongkan teks jika ingin memulihkan nama default hasil ekstraksi cerita.
              </p>
            </div>
          </div>
        </Dialog>
      )}

      {deleteTarget && (
        <Dialog
          isOpen={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          title={deleteTarget.type === 'criteria' ? 'Hapus Kriteria' : 'Hapus Alternatif'}
          className="max-w-sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmDelete}
                className="text-xs font-semibold px-3 cursor-pointer"
              >
                Ya, Hapus
              </Button>
            </div>
          }
        >
          <p className="text-xs text-slate-600 leading-relaxed py-2">
            Apakah Anda yakin ingin menghapus {deleteTarget.type === 'criteria' ? 'kriteria' : 'alternatif'}{' '}
            <strong className="text-slate-900 font-bold">"{deleteTarget.name}"</strong>? Tindakan ini tidak dapat dibatalkan.
          </p>
        </Dialog>
      )}
    </Card>
  );
};

export default ExtractedPreviewTable;
