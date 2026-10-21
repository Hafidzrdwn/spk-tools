import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Award, ShieldAlert, Sparkles, Code2, Check, Copy } from 'lucide-react';
import type {
  ManagerialSynthesisResult,
  DecisionEvaluationPayload,
} from '@/core/analysis';

export interface ManagerialAiPanelProps {
  synthesis: ManagerialSynthesisResult | null;
  payload: DecisionEvaluationPayload | null;
}

export const ManagerialAiPanel: React.FC<ManagerialAiPanelProps> = ({ synthesis, payload }) => {
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  if (!synthesis) {
    return null;
  }

  const jsonString = payload ? JSON.stringify(payload, null, 2) : '';

  const handleCopyJson = () => {
    if (!jsonString) return;
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200/90 bg-emerald-50/20 shadow-2xs">
        <CardHeader className="py-3 px-4 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-900 tracking-wider uppercase font-mono">
                  Rekomendasi Utama
                </span>
                <span className="text-slate-300">•</span>
                <CardTitle className="text-sm font-bold text-slate-900">
                  {synthesis.primaryRecommendation.alternativeName}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Pilihan optimal pada kondisi bisnis normal berdasarkan evaluasi multi-kriteria
              </CardDescription>
            </div>
          </div>

          <Badge variant="benefit" size="md">
            Skor: {synthesis.primaryRecommendation.score.toFixed(4)}
          </Badge>
        </CardHeader>

        <CardContent className="p-4 space-y-3 text-xs">
          <p className="text-slate-700 leading-relaxed font-medium">
            {synthesis.primaryRecommendation.statement}
          </p>

          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-800 block">
              Langkah Aksi Manajerial yang Direkomendasikan:
            </span>
            <ul className="space-y-1">
              {synthesis.primaryRecommendation.actionPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200/90 bg-amber-50/20 shadow-2xs">
        <CardHeader className="py-3 px-4 border-b border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-900 tracking-wider uppercase font-mono">
                  Rekomendasi Strategis (Plan B)
                </span>
                <span className="text-slate-300">•</span>
                <CardTitle className="text-sm font-bold text-slate-900">
                  {synthesis.contingencyPlanB.alternativeName}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Kandidat mitigasi risiko dan pemenang cadangan resmi jika terjadi perubahan parameter
              </CardDescription>
            </div>
          </div>

          <Badge variant="secondary" size="md">
            Skor: {synthesis.contingencyPlanB.score.toFixed(4)}
          </Badge>
        </CardHeader>

        <CardContent className="p-4 space-y-3 text-xs">
          <p className="text-slate-700 leading-relaxed font-medium">
            {synthesis.contingencyPlanB.statement}
          </p>

          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-800 block">
              Kondisi Pemicu Pengalihan Keputusan (Trigger Conditions):
            </span>
            <ul className="space-y-1">
              {synthesis.contingencyPlanB.triggerConditions.map((cond, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                  <span>{cond}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-indigo-200/90 bg-linear-to-br from-indigo-50/50 via-white to-slate-50 shadow-2xs">
        <CardHeader className="py-3 px-4 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold text-indigo-950">
                  Fondasi Integrasi Gemini AI (AI-Ready Context)
                </CardTitle>
                <Badge variant="benefit" size="sm" className="font-semibold text-[10px]">
                  Payload Ready
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Data evaluasi telah dirangkum dalam format terstruktur untuk dikonsumsi oleh model Gemini AI
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowJson((prev) => !prev)}
              className="text-xs gap-1.5 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showJson ? 'Tutup JSON' : 'Lihat JSON Payload'}</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleCopyJson}
              className="text-xs gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Konteks AI'}</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-slate-200/80">
              <span className="font-bold text-slate-800 block mb-1">1. Smart PDF Recommendation</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Payload data ini dapat disalurkan ke Gemini API saat mencetak PDF untuk menghasilkan narasi kesimpulan manajerial yang tajam dan personal.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200/80">
              <span className="font-bold text-slate-800 block mb-1">2. AI Document Extractor</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Skema kriteria Benefit/Cost dan batas nilai menjadi acuan validasi otomatis saat file Word/PDF dimuat ke sistem.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200/80">
              <span className="font-bold text-slate-800 block mb-1">3. Mode Hybrid Story-to-Matrix</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Menyediakan fondasi ekstraksi studi kasus naratif bebas berbasis LLM di samping parser teks statis saat ini.
              </p>
            </div>
          </div>

          {showJson && (
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-300 bg-slate-900 text-slate-100 p-3 text-[11px] font-mono max-h-80 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{jsonString}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerialAiPanel;
