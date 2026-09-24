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

export const StoryTextArea: React.FC<StoryTextAreaProps> = ({
  value,
  onChange,
  onParse,
  onOpenTemplates,
  errorMessage,
}) => {
  return (
    <Card className="border border-slate-200/90 shadow-2xs">
      <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-control bg-indigo-50 text-accent-primary flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">
              Input Cerita / Narasi Studi Kasus
            </CardTitle>
            <CardDescription className="text-xs">
              Ketik atau tempel teks kasus dengan format &quot;Kandidat: Nama, Kriteria: Nilai&quot;
            </CardDescription>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenTemplates}
          className="text-xs font-semibold cursor-pointer shrink-0 shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-accent-primary" />
          Coba Contoh Template
        </Button>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <textarea
          rows={9}
          value={value}
          onChange={(e) => onChange.call(null, e.target.value)}
          placeholder={PLACEHOLDER_TEXT}
          className="w-full p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 font-mono text-xs text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/40 focus:border-accent-primary transition-all resize-y"
        />

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50/90 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Gagal Memproses Teks:</strong> {errorMessage}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
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
            disabled={!value.trim()}
            className="font-semibold shadow-xs cursor-pointer px-4"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 fill-white" /> Parse Teks ke Matriks
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryTextArea;
