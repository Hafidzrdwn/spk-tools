import React, { useState, useId, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useProjectStore } from '@/store/useProjectStore';
import { useUiStore } from '@/store/useUiStore';
import { useShallow } from 'zustand/react/shallow';
import { toast } from 'sonner';
import {
  Download,
  Upload,
  Copy,
  Check,
  X,
  FileJson,
  AlertTriangle,
  CheckCircle2,
  FileUp,
  Layers,
  Settings2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  downloadProjectBackup,
  copyProjectBackupToClipboard,
  parseAndValidateProjectBackup,
  serializeProjectBackup,
  type ParsedBackupResult,
} from './projectBackupService';
import type { DecisiProjectState } from '@/types/domain';

export interface ProjectBackupModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ProjectBackupModal: React.FC<ProjectBackupModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const fileInputId = useId();
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [isCopied, setIsCopied] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  const storeIsBackupOpen = useUiStore((s) => s.isBackupModalOpen);
  const closeBackupModal = useUiStore((s) => s.closeBackupModal);
  const numberFormat = useUiStore((s) => s.numberFormat);
  const setNumberFormat = useUiStore((s) => s.setNumberFormat);

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsBackupOpen;
  const handleClose = propOnClose || closeBackupModal;

  const [importText, setImportText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [validationResult, setValidationResult] = useState<
    { success: true; data: ParsedBackupResult } | { success: false; error: string } | null
  >(null);

  const { title, activeMethod, criteria, alternatives, loadProjectState } = useProjectStore(
    useShallow((s) => ({
      title: s.title,
      activeMethod: s.activeMethod,
      criteria: s.criteria,
      alternatives: s.alternatives,
      loadProjectState: s.loadProjectState,
    }))
  );

  const currentProjectState: DecisiProjectState = {
    title,
    activeMethod,
    criteria,
    alternatives,
  };

  const currentPreferences = {
    numberFormat,
  };

  const handleCopy = async () => {
    const success = await copyProjectBackupToClipboard(currentProjectState, currentPreferences);
    if (success) {
      setIsCopied(true);
      toast.success('JSON basis data proyek berhasil disalin ke clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      toast.error('Gagal menyalin JSON ke clipboard.');
    }
  };

  const handleDownload = () => {
    downloadProjectBackup(currentProjectState, currentPreferences);
    toast.success('File cadangan (.json) berhasil diunduh!');
  };

  const handleTextChange = (text: string) => {
    setImportText(text);
    if (!text.trim()) {
      setValidationResult(null);
      return;
    }
    const result = parseAndValidateProjectBackup(text);
    setValidationResult(result);
  };

  const handleFileProcess = (file: File) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setValidationResult({
        success: false,
        error: 'Berkas harus berupa file format .json',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setValidationResult({
        success: false,
        error: 'Ukuran berkas melebihi batas keamanan maksimum 5 MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (typeof content === 'string') {
        setImportText(content);
        const result = parseAndValidateProjectBackup(content);
        setValidationResult(result);
      }
    };
    reader.onerror = () => {
      setValidationResult({
        success: false,
        error: 'Gagal membaca berkas file dari perangkat.',
      });
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleApplyRestore = () => {
    if (!validationResult || !validationResult.success) return;

    const { project: restoredProject, preferences: restoredPreferences } = validationResult.data;

    loadProjectState(restoredProject);

    if (restoredPreferences?.numberFormat) {
      setNumberFormat(restoredPreferences.numberFormat);
    }

    toast.success(`Basis data proyek "${restoredProject.title}" berhasil dipulihkan secara menyeluruh!`);
    handleClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Cadangan & Pemulihan Proyek (Global)</h3>
            <p className="text-[11px] text-slate-500">
              Ekspor/impor seluruh basis data kriteria, alternatif, dan matriks nilai SPK
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup modal cadangan data"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor / Salin (Backup)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Impor / Pulihkan (Restore)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeTab === 'export' ? (
            <div className="space-y-4">
              {/* Universal Project Snapshot Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Basis Data Proyek SPK</span>
                  </span>
                  <Badge variant="primary" size="sm" className="font-semibold text-[10px]">
                    Universal (Semua Metode)
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {title || 'Proyek SPK Baru'}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Mencakup seluruh kriteria, bobot, satuan, alternatif, dan nilai matriks keputusan bersama yang dipakai serentak oleh <strong>SAW, WP, TOPSIS, AHP</strong>, dan <strong>Komparasi</strong>.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200/80">
                      <strong>{criteria.length}</strong> Kriteria
                    </span>
                    <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200/80">
                      <strong>{alternatives.length}</strong> Alternatif
                    </span>
                    <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 text-[11px]">
                      <Settings2 className="w-3 h-3 text-slate-400" />
                      Format Desimal: {numberFormat === 'comma' ? 'Koma (3,14)' : 'Titik (3.14)'}
                    </span>
                  </div>
                </div>

                {criteria.length === 0 && alternatives.length === 0 && (
                  <p className="text-[11px] text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200/60 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Workboard masih kosong. Data yang diekspor akan berupa struktur awal.</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopy}
                  className="h-10 text-xs font-semibold cursor-pointer justify-center"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Tersalin ke Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-indigo-600" />
                      <span>Salin JSON Global</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownload}
                  className="h-10 text-xs font-semibold cursor-pointer justify-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File (.json)</span>
                </Button>
              </div>

              {/* Collapsible JSON Preview */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowJsonPreview(!showJsonPreview)}
                  className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>{showJsonPreview ? 'Sembunyikan' : 'Lihat Pratinjau'} Payload JSON Global</span>
                </button>

                {showJsonPreview && (
                  <div className="mt-2 p-3 bg-slate-900 rounded-lg text-slate-200 font-mono text-[10px] leading-relaxed max-h-44 overflow-y-auto select-all">
                    <pre>{serializeProjectBackup(currentProjectState, currentPreferences)}</pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`p-4 border-2 border-dashed rounded-xl text-center transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/60'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
              >
                <input
                  id={fileInputId}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                />
                <FileUp className="w-6 h-6 mx-auto text-slate-400 mb-1.5" />
                <p className="text-xs font-semibold text-slate-700">
                  Tarik file backup .json ke sini, atau{' '}
                  <label
                    htmlFor={fileInputId}
                    className="text-indigo-600 hover:underline cursor-pointer font-bold"
                  >
                    pilih file
                  </label>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Mendukung file .json hasil ekspor DecisiGraph dari dev maupun prod</p>
              </div>

              {/* Paste JSON Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="import-textarea" className="text-xs font-semibold text-slate-700">
                    Atau Tempel (Paste) String JSON:
                  </label>
                  {importText && (
                    <button
                      type="button"
                      onClick={() => handleTextChange('')}
                      className="text-[10px] text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      Bersihkan
                    </button>
                  )}
                </div>
                <textarea
                  id="import-textarea"
                  value={importText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="Tempel teks JSON cadangan dari production atau environment dev di sini..."
                  rows={4}
                  className="w-full p-2.5 text-[11px] font-mono text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-primary"
                />
              </div>

              {/* Validation Status Box */}
              {validationResult && (
                <div>
                  {validationResult.success ? (
                    <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Format Cadangan Universal Valid</span>
                      </div>
                      <div className="text-xs text-emerald-900 space-y-1 pl-6">
                        <p>
                          <strong>Judul:</strong> {validationResult.data.project.title}
                        </p>
                        <p className="text-[11px] text-emerald-700">
                          {validationResult.data.project.criteria.length} Kriteria •{' '}
                          {validationResult.data.project.alternatives.length} Alternatif
                          {validationResult.data.preferences?.numberFormat && (
                            <> • Format Desimal: {validationResult.data.preferences.numberFormat === 'comma' ? 'Koma (ID)' : 'Titik (US)'}</>
                          )}
                        </p>
                      </div>
                      <p className="text-[10px] text-emerald-600 pl-6 italic">
                        * Catatan: Seluruh data workboard dan perhitungan semua metode akan disinkronkan ke cadangan ini.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-bold">Gagal Memvalidasi Data</p>
                        <p className="text-[11px] text-rose-700 leading-relaxed">
                          {validationResult.error}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Restore Button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApplyRestore}
                  disabled={!validationResult || !validationResult.success}
                  className="w-full h-10 text-xs font-semibold cursor-pointer justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  <span>Terapkan & Pulihkan Data ke Seluruh Sistem</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProjectBackupModal;
