import React, { useState, useEffect } from 'react';
import { KeyRound, Check } from 'lucide-react';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DocumentMatrixIllustration from '@/components/ui/illustrations/DocumentMatrixIllustration';
import { toast } from 'sonner';
import { useProjectStore } from '@/store/useProjectStore';
import {
  readDocumentFile,
  extractMatrixFromDocument,
  getEffectiveGeminiApiKey,
  setCustomGeminiApiKey,
  type ProcessedDocumentResult,
  type DocumentLoaderError,
  type DocumentFilePayload,
} from '@/services/ai';
import DocumentDropzone from './components/DocumentDropzone';
import DocumentProcessingState from './components/DocumentProcessingState';
import DocumentErrorState from './components/DocumentErrorState';
import DocumentReviewMatrix from './components/DocumentReviewMatrix';
import { DEMO_DOCUMENTS } from './demoDocuments';
import type { Criterion, Alternative } from '@/types/domain';

export interface DocumentLoaderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalStage = 'upload' | 'processing' | 'error' | 'review';

export const DocumentLoaderModal: React.FC<DocumentLoaderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const loadProjectState = useProjectStore((s) => s.loadProjectState);

  const [stage, setStage] = useState<ModalStage>('upload');
  const [currentFile, setCurrentFile] = useState<{ name: string; size: number } | null>(null);
  const [processingStepIndex, setProcessingStepIndex] = useState(0);
  const [activeError, setActiveError] = useState<DocumentLoaderError | null>(null);
  const [extractedData, setExtractedData] = useState<ProcessedDocumentResult | null>(null);

  const [hasApiKey, setHasApiKey] = useState(false);
  const [isApiKeyInputOpen, setIsApiKeyInputOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [lastAttemptedPayload, setLastAttemptedPayload] = useState<DocumentFilePayload | null>(null);

  useEffect(() => {
    if (isOpen) {
      const key = getEffectiveGeminiApiKey();
      setHasApiKey(Boolean(key && key.length > 0));
      setApiKeyInput(key);
      if (stage === 'error' && !activeError) {
        setStage('upload');
      }
    } else {
      setTimeout(() => {
        setStage('upload');
        setCurrentFile(null);
        setActiveError(null);
        setExtractedData(null);
        setIsApiKeyInputOpen(false);
      }, 200);
    }
  }, [isOpen]);

  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    setCustomGeminiApiKey(trimmed);
    const key = getEffectiveGeminiApiKey();
    setHasApiKey(Boolean(key && key.length > 0));
    setIsApiKeyInputOpen(false);
    toast.success(trimmed ? 'Kunci Gemini API berhasil disimpan di peramban.' : 'Kunci Gemini API dihapus.');

    if (stage === 'error' && activeError?.code === 'API_KEY_MISSING' && lastAttemptedPayload) {
      executeExtraction(lastAttemptedPayload);
    }
  };

  const executeExtraction = async (payload: DocumentFilePayload) => {
    setLastAttemptedPayload(payload);
    setCurrentFile({ name: payload.name, size: payload.size });
    setStage('processing');
    setProcessingStepIndex(0);

    const step1Timer = setTimeout(() => {
      setProcessingStepIndex(1);
    }, 600);

    const step2Timer = setTimeout(() => {
      setProcessingStepIndex(2);
    }, 1600);

    try {
      const result = await extractMatrixFromDocument(payload);
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      setExtractedData(result);
      setStage('review');
    } catch (err: unknown) {
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      const loaderError = err as DocumentLoaderError;
      setActiveError(loaderError);
      setStage('error');
    }
  };

  const handleFileSelected = async (file: File) => {
    try {
      const payload = await readDocumentFile(file);
      await executeExtraction(payload);
    } catch (err: unknown) {
      const loaderError = err as DocumentLoaderError;
      setActiveError(loaderError);
      setStage('error');
    }
  };

  const handleLoadDemo = async (demoId: 'laptop' | 'cloud') => {
    const payload = DEMO_DOCUMENTS[demoId];
    await executeExtraction(payload);
  };

  const handleCommit = (finalData: {
    title: string;
    criteria: Criterion[];
    alternatives: Alternative[];
    contextMetadata?: import('@/types/domain').CaseContextMetadata;
  }) => {
    loadProjectState({
      title: finalData.title,
      activeMethod: 'SAW',
      criteria: finalData.criteria,
      alternatives: finalData.alternatives,
      contextMetadata: finalData.contextMetadata,
    });

    toast.success('Matriks keputusan dan konteks studi kasus berhasil diimpor!');
    onClose();
  };


  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={
        <div className="flex items-center gap-2.5">
          <DocumentMatrixIllustration size={36} />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              AI Document Loader
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Ekstrak dokumen PDF/Word ke matriks keputusan SPK terstandardisasi
            </p>
          </div>
        </div>
      }
      className="max-w-3xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-slate-500" />
            <span className="text-slate-600 font-medium">Status Kunci AI:</span>
            {hasApiKey ? (
              <Badge variant="benefit" size="sm" className="font-bold text-[10px]">
                Gemini API Terhubung
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm" className="text-[10px] bg-amber-100 text-amber-800 border-amber-200">
                Mode Parser Lokal (Teks/Tabel)
              </Badge>
            )}
          </div>

          <button
            type="button"
            id="btn-toggle-key-input"
            onClick={() => setIsApiKeyInputOpen((prev) => !prev)}
            className="text-xs font-semibold text-accent-primary hover:underline cursor-pointer"
          >
            {isApiKeyInputOpen ? 'Tutup Pengaturan Key' : hasApiKey ? 'Ubah API Key' : 'Pasang API Key Gemini'}
          </button>
        </div>

        {isApiKeyInputOpen && (
          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/70 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <label htmlFor="modal-gemini-key-input" className="font-bold text-slate-800">
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-accent-primary hover:underline font-semibold"
              >
                Dapatkan Kunci Gratis di Google AI Studio ↗
              </a>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                id="modal-gemini-key-input"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Tempel AIzaSy... di sini"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-hidden"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveApiKey}
                className="h-8 px-3 text-xs shrink-0"
              >
                <Check className="w-3.5 h-3.5 mr-1" /> Simpan
              </Button>
            </div>
            <p className="text-[11px] text-slate-500">
              Kunci API disimpan secara lokal di peramban Anda (localStorage) dan tidak pernah dikirim ke peladen eksternal.
            </p>
          </div>
        )}

        {stage === 'upload' && (
          <DocumentDropzone
            onFileSelected={handleFileSelected}
            onLoadDemo={handleLoadDemo}
            isProcessing={false}
          />
        )}

        {stage === 'processing' && currentFile && (
          <DocumentProcessingState
            fileName={currentFile.name}
            fileSize={currentFile.size}
            currentStepIndex={processingStepIndex}
            modelUsed="Gemini 3.8 Flash"
          />
        )}

        {stage === 'error' && activeError && (
          <DocumentErrorState
            error={activeError}
            onRetry={() => {
              if (lastAttemptedPayload) {
                executeExtraction(lastAttemptedPayload);
              } else {
                setStage('upload');
              }
            }}
            onChooseOther={() => {
              setActiveError(null);
              setStage('upload');
            }}
            onUseDemo={() => handleLoadDemo('laptop')}
            onConfigureApiKey={() => setIsApiKeyInputOpen(true)}
          />
        )}

        {stage === 'review' && extractedData && (
          <DocumentReviewMatrix
            data={extractedData}
            onCommit={handleCommit}
            onCancelOrUploadAgain={() => {
              setExtractedData(null);
              setStage('upload');
            }}
          />
        )}
      </div>
    </Dialog>
  );
};

export default DocumentLoaderModal;
