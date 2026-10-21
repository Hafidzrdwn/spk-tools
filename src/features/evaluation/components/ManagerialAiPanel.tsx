import React from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Award, ShieldAlert } from 'lucide-react';
import type { ManagerialSynthesisResult } from '@/core/analysis';

export interface ManagerialAiPanelProps {
  synthesis: ManagerialSynthesisResult | null;
}

export const ManagerialAiPanel: React.FC<ManagerialAiPanelProps> = ({ synthesis }) => {
  if (!synthesis) {
    return null;
  }

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
    </div>
  );
};

export default ManagerialAiPanel;
