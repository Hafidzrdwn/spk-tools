import React from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Award, ShieldAlert, ShieldCheck, TrendingUp, RefreshCw, Loader2, Building2, Bot } from 'lucide-react';
import type { ManagerialSynthesisResult } from '@/core/analysis';
import type { AiExecutiveNarrative, CaseContextMetadata } from '@/services/ai';

export interface ManagerialAiPanelProps {
  synthesis: ManagerialSynthesisResult | null;
  aiNarrative?: AiExecutiveNarrative | null;
  isAiLoading?: boolean;
  aiError?: string | null;
  onRefreshAi?: () => void;
  contextMetadata?: CaseContextMetadata;
}

interface ParsedPoint {
  number: string | null;
  stakeholder: string | null;
  text: string;
}

function parseRecommendationPoints(content: string): ParsedPoint[] {
  if (!content) return [];
  const normalized = content.replace(/(?:^|\s+)(?=\d+\.\s)/g, '\n').trim();
  const segments = normalized
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return segments.map((seg, idx) => {
    const numMatch = seg.match(/^(\d+)\.\s*(.*)$/s);
    const num = numMatch ? numMatch[1] : null;
    let body = numMatch ? numMatch[2].trim() : seg;

    let stakeholder: string | null = null;
    const startStakeholderMatch = body.match(/^\[([^\]]+)\]\s*:?\s*(.*)$/s);
    if (startStakeholderMatch) {
      stakeholder = startStakeholderMatch[1].trim();
      body = startStakeholderMatch[2].trim();
    } else {
      const endStakeholderMatch = body.match(/^(.*?)\s*\[([^\]]+)\]\.?$/s);
      if (endStakeholderMatch) {
        stakeholder = endStakeholderMatch[2].trim();
        body = endStakeholderMatch[1].trim();
      }
    }

    return {
      number: num || (segments.length > 1 ? String(idx + 1) : null),
      stakeholder,
      text: body.replace(/^[-*]\s*/, ''),
    };
  });
}

export const ManagerialAiPanel: React.FC<ManagerialAiPanelProps> = ({
  synthesis,
  aiNarrative,
  isAiLoading = false,
  aiError = null,
  onRefreshAi,
  contextMetadata,
}) => {
  if (!synthesis && !aiNarrative && !isAiLoading) {
    return null;
  }

  const recPoints = aiNarrative?.sectionC_recommendations
    ? parseRecommendationPoints(aiNarrative.sectionC_recommendations)
    : [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-2 flex-wrap">
          {aiNarrative?.source === 'gemini' ? (
            <Badge variant="benefit" size="sm" className="font-bold text-[10px] gap-1">
              Sintesis AI ({aiNarrative.modelUsed || 'Gemini Flash'})
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm" className="font-bold text-[10px] bg-slate-200 text-slate-700">
              Sintesis Deterministik Multi-Metode
            </Badge>
          )}

          {aiNarrative?.latencyMs ? (
            <span className="text-[11px] text-slate-500 font-mono">
              {aiNarrative.latencyMs} ms
            </span>
          ) : null}

          {contextMetadata?.institutionOrOrg && (
            <Badge variant="neutral" size="sm" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-semibold flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {contextMetadata.institutionOrOrg}
            </Badge>
          )}

          {contextMetadata?.targetStakeholder && (
            <Badge variant="neutral" size="sm" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-semibold">
              Stakeholder: {contextMetadata.targetStakeholder}
            </Badge>
          )}
        </div>

        {onRefreshAi && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefreshAi}
            disabled={isAiLoading}
            className="text-xs font-semibold cursor-pointer gap-1.5 self-start sm:self-auto shrink-0"
          >
            {isAiLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-primary" />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerasi AI</span>
              </>
            )}
          </Button>
        )}
      </div>

      {aiError && !isAiLoading && (
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
          <span>
            Panggilan AI dialihkan ke narasi terstruktur lokal (kuota API atau koneksi terbatas).
          </span>
          <Badge variant="neutral" size="sm" className="text-[10px] bg-amber-100 text-amber-800 border-amber-300">
            Fallback Lokal Aktif
          </Badge>
        </div>
      )}

      {isAiLoading ? (
        <Card className="border-indigo-100 bg-linear-to-b from-indigo-50/30 to-white shadow-2xs">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-100 text-accent-primary flex items-center justify-center animate-pulse">
              <Bot className="w-5 h-5 animate-spin" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">Menyusun Sintesis Eksekutif & Langkah Aksi...</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Gemini AI sedang memetakan dinamika peringkat antar metode dan mempersonalisasi rekomendasi berdasarkan konteks studi kasus.
              </p>
            </div>
            <div className="space-y-2 max-w-md mx-auto pt-2">
              <div className="h-3 bg-slate-200 rounded-full animate-pulse w-3/4 mx-auto" />
              <div className="h-3 bg-slate-200 rounded-full animate-pulse w-5/6 mx-auto" />
              <div className="h-3 bg-slate-200 rounded-full animate-pulse w-2/3 mx-auto" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {aiNarrative && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-indigo-200/80 bg-indigo-50/20 shadow-2xs">
                <CardHeader className="py-2.5 px-4 border-b border-indigo-100 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <CardTitle className="text-xs font-bold text-slate-900">
                      Dinamika Peringkat & Komparasi Algoritma
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 text-xs text-slate-700 leading-relaxed font-medium">
                  {aiNarrative.sectionA_rankingShifts}
                </CardContent>
              </Card>

              <Card className="border-emerald-200/80 bg-emerald-50/20 shadow-2xs">
                <CardHeader className="py-2.5 px-4 border-b border-emerald-100 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <CardTitle className="text-xs font-bold text-slate-900">
                      Validitas Matematis & Keputusan
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 text-xs text-slate-700 leading-relaxed font-medium">
                  {aiNarrative.sectionB_methodValidity}
                </CardContent>
              </Card>
            </div>
          )}

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
                    {synthesis && (
                      <>
                        <span className="text-slate-300">•</span>
                        <CardTitle className="text-sm font-bold text-slate-900">
                          {synthesis.primaryRecommendation.alternativeName}
                        </CardTitle>
                      </>
                    )}
                  </div>
                  <CardDescription className="text-xs text-slate-500">
                    Rencana aksi konkret dan terukur bagi pemangku kepentingan
                  </CardDescription>
                </div>
              </div>

              {synthesis && (
                <Badge variant="benefit" size="md">
                  Skor: {synthesis.primaryRecommendation.score.toFixed(4)}
                </Badge>
              )}
            </CardHeader>

            <CardContent className="p-4 space-y-3.5 text-xs">
              {recPoints.length > 0 ? (
                <div className="space-y-2.5">
                  {recPoints.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-emerald-100 shadow-2xs flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {pt.number || idx + 1}
                      </span>
                      <div className="space-y-1 flex-1">
                        {pt.stakeholder && (
                          <Badge
                            variant="neutral"
                            size="sm"
                            className="bg-emerald-100/70 text-emerald-900 border-emerald-200 font-bold text-[10px] inline-block mb-0.5"
                          >
                            {pt.stakeholder}
                          </Badge>
                        )}
                        <p className="text-slate-800 leading-relaxed font-medium">{pt.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : synthesis ? (
                <div className="space-y-2">
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {synthesis.primaryRecommendation.statement}
                  </p>
                  <ul className="space-y-1.5 pt-1">
                    {synthesis.primaryRecommendation.actionPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {synthesis?.contingencyPlanB && (
            <Card className="border-amber-200/90 bg-amber-50/20 shadow-2xs">
              <CardHeader className="py-3 px-4 border-b border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-amber-900 tracking-wider uppercase font-mono">
                        Rekomendasi Cadangan (Plan B)
                      </span>
                      <span className="text-slate-300">•</span>
                      <CardTitle className="text-sm font-bold text-slate-900">
                        {synthesis.contingencyPlanB.alternativeName}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs text-slate-500">
                      Kandidat mitigasi risiko jika parameter atau kapasitas operasional berubah
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
          )}
        </>
      )}
    </div>
  );
};

export default ManagerialAiPanel;

