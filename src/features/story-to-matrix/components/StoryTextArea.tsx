import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Play, RotateCcw, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import { getEffectiveGeminiApiKey } from '@/services/ai';

export interface StoryTextAreaProps {
  value: string;
  onChange: (val: string) => void;
  onParse: () => void;
  onOpenTemplates: () => void;
  errorMessage: string | null;
  storyInputMode: 'auto' | 'formatted';
  onChangeMode: (mode: 'auto' | 'formatted') => void;
  isAnalyzing?: boolean;
}

const PLACEHOLDER_AUTO = 'Tempel atau ketik narasi cerita, soal studi kasus, atau deskripsi usulan keputusan di sini...';

const PLACEHOLDER_FORMATTED = 'Ketik teks terstruktur. Contoh:\nKandidat: Program A, Biaya: 50 jt, Kualitas: 85';

export const MAX_STORY_CHARS = 5000;

export const StoryTextArea: React.FC<StoryTextAreaProps> = ({
  value,
  onChange,
  onParse,
  onOpenTemplates,
  errorMessage,
  storyInputMode,
  onChangeMode,
  isAnalyzing = false,
}) => {
  const openAiConfig = useUiStore((s) => s.openAiConfig);
  const aiKeyVersion = useUiStore((s) => s.aiKeyVersion);
  const [hasAiKey, setHasAiKey] = useState(false);

  useEffect(() => {
    const key = getEffectiveGeminiApiKey();
    setHasAiKey(Boolean(key && key.length > 0));
  }, [aiKeyVersion]);

  const isOverLimit = value.length > MAX_STORY_CHARS;
  const isNearLimit = value.length >= MAX_STORY_CHARS * 0.9;

  return (
    <Card className="border border-slate-200/90 shadow-2xs">
      <CardHeader className="py-3 px-3.5 sm:px-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-accent-primary flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <FileText className="w-4 h-4 shrink-0" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-sm font-bold text-slate-900 leading-tight">
              Input Cerita / Narasi Studi Kasus
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5 leading-snug">
              {storyInputMode === 'auto'
                ? 'Ketik atau tempel teks narasi bebas, soal cerita, atau deskripsi program kerja'
                : 'Ketik teks dengan format "Kandidat: Nama, Kriteria: Nilai"'}
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {storyInputMode === 'formatted' && (
            <Button
              variant="secondary"
              size="md"
              onClick={onOpenTemplates}
              className="text-xs font-semibold cursor-pointer shrink-0 shadow-2xs h-9 px-3 flex items-center justify-center"
            >
              <span>Contoh Template</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 pb-1">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium">
            <button
              type="button"
              onClick={() => onChangeMode('auto')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                storyInputMode === 'auto'
                  ? 'bg-white text-indigo-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Analisis Otomatis (Narasi Bebas)
            </button>
            <button
              type="button"
              onClick={() => onChangeMode('formatted')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                storyInputMode === 'formatted'
                  ? 'bg-white text-indigo-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Format Standar (Template)
            </button>
          </div>
        </div>

        {storyInputMode === 'auto' && !hasAiKey ? (
          <div className="py-10 px-4 rounded-xl border border-dashed border-indigo-200/90 bg-indigo-50/30 text-center flex flex-col items-center justify-center gap-3">
            <svg
              className="w-14 h-14 text-indigo-500"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="10" y="14" width="44" height="36" rx="8" className="fill-indigo-50 stroke-indigo-200" strokeWidth="1.5" />
              <path d="M24 32H29M35 32H40" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
              <circle cx="32" cy="32" r="4.5" className="fill-white stroke-indigo-600" strokeWidth="2" />
              <circle cx="32" cy="32" r="1.5" fill="#6366F1" />
              <path d="M22 22L24 20M42 22L40 20M22 42L24 44M42 42L40 44" stroke="#A5B4FC" strokeWidth="1.5" strokeLinecap="round" />
            </svg>

            <div className="space-y-1 max-w-sm">
              <h4 className="text-sm font-bold text-slate-800">
                Kunci Gemini AI Belum Dikonfigurasi
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mode Analisis Otomatis memerlukan Kunci API Google Gemini untuk mengekstrak kriteria dan alternatif dari teks narasi bebas.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={openAiConfig}
                className="text-xs font-semibold cursor-pointer"
              >
                Pasang Kunci AI
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChangeMode('formatted')}
                className="text-xs cursor-pointer"
              >
                Gunakan Format Standar (Offline)
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <textarea
                rows={10}
                maxLength={MAX_STORY_CHARS}
                value={value}
                disabled={isAnalyzing}
                onChange={(e) => onChange(e.target.value)}
                placeholder={storyInputMode === 'auto' ? PLACEHOLDER_AUTO : PLACEHOLDER_FORMATTED}
                className={`w-full p-3.5 rounded-xl border bg-slate-50/50 font-sans text-xs text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 transition-all resize-y ${
                  isOverLimit
                    ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-500'
                    : 'border-slate-200/90 focus:ring-accent-primary/40 focus:border-accent-primary'
                } ${isAnalyzing ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
              <div className="flex items-center justify-between text-[10px] sm:text-xs px-1 gap-2">
                <span className={`truncate ${isOverLimit ? 'text-rose-600 font-medium' : isNearLimit ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
                  {isOverLimit ? (
                    'Maksimal 5.000 karakter terlampaui!'
                  ) : (
                    <>
                      <span className="hidden xs:inline">Batas maksimal 5.000 karakter per proses narasi</span>
                      <span className="xs:hidden">Maks. 5.000 karakter</span>
                    </>
                  )}
                </span>
                <span
                  data-testid="story-char-counter"
                  className={`font-mono shrink-0 ${isOverLimit ? 'text-rose-600 font-bold' : isNearLimit ? 'text-amber-600 font-semibold' : 'text-slate-400'}`}
                >
                  {value.length.toLocaleString('id-ID')} / {MAX_STORY_CHARS.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50/90 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Pemberitahuan:</strong> {errorMessage}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange('')}
                disabled={!value || isAnalyzing}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Bersihkan
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onParse}
                disabled={!value.trim() || isOverLimit || isAnalyzing}
                className="font-semibold shadow-xs cursor-pointer px-3 sm:px-4 text-xs gap-1.5"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Menganalisis Cerita...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>
                      {storyInputMode === 'auto' ? 'Mulai Analisis Cerita' : 'Parse Teks Terformat'}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StoryTextArea;
