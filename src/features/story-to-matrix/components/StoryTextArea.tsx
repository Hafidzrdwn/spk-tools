import React from 'react';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Sparkles, Play, RotateCcw, AlertCircle, FileText } from 'lucide-react';

export interface StoryTextAreaProps {
  value: string;
  onChange: (val: string) => void;
  onParse: () => void;
  onOpenTemplates: () => void;
  errorMessage: string | null;
}

const PLACEHOLDER_TEXT = `Contoh format input teks studi kasus:
Kandidat: Budi Santoso, Nilai Tes: 85, Pengalaman: 3 thn, Gaji: 5 jt
Kandidat: Siti Aminah, Nilai Tes: 92, Pengalaman: 5 thn, Gaji: 7 jt
Kandidat: Joko Widodo, Nilai Tes: 78, Pengalaman: 2 thn, Gaji: 4.5 jt

Atau masukkan perbandingan preferensi Saaty:
Pengalaman 3 kali lebih penting dari Gaji.`;

export const MAX_STORY_CHARS = 5000;

export const StoryTextArea: React.FC<StoryTextAreaProps> = ({
  value,
  onChange,
  onParse,
  onOpenTemplates,
  errorMessage,
}) => {
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
              Ketik atau tempel teks kasus dengan format &quot;Kandidat: Nama, Kriteria: Nilai&quot;
            </CardDescription>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenTemplates}
          className="w-full sm:w-auto text-xs font-semibold cursor-pointer shrink-0 shadow-2xs h-9 px-3 flex items-center justify-center"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-accent-primary shrink-0" />
          <span>Coba Contoh Template</span>
        </Button>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <div className="space-y-1.5">
          <textarea
            rows={9}
            maxLength={MAX_STORY_CHARS}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={PLACEHOLDER_TEXT}
            className={`w-full p-3.5 rounded-xl border bg-slate-50/50 font-mono text-xs text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 transition-all resize-y ${
              isOverLimit
                ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-500'
                : 'border-slate-200/90 focus:ring-accent-primary/40 focus:border-accent-primary'
            }`}
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
              <strong>Gagal Memproses Teks:</strong> {errorMessage}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange('')}
            disabled={!value}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Bersihkan
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onParse}
            disabled={!value.trim() || isOverLimit}
            className="font-semibold shadow-xs cursor-pointer px-3 sm:px-4 text-xs"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 fill-white" />
            <span className="hidden sm:inline">Parse Teks ke Matriks</span>
            <span className="sm:hidden">Parse Matriks</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryTextArea;
