import { GoogleGenAI } from '@google/genai';
import type { AiNarrativeRequest, AiExecutiveNarrative } from './types';
import { getCachedAiNarrative, setCachedAiNarrative } from './aiCache';
import { buildGeminiPrompt } from './promptBuilder';
import { generateFallbackNarrative } from './fallbackNarrative';

export const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
  'gemini-2.5-pro',
] as const;

export function sanitizeNarrativeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u2014\u2013]|--/g, (match, offset, fullStr) => {
      const prevChar = fullStr[offset - 1] || '';
      const nextChar = fullStr[offset + match.length] || '';
      if (/\w/.test(prevChar) && /\w/.test(nextChar)) {
        return ', ';
      }
      return ' - ';
    })
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function getEffectiveGeminiApiKey(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    const localKey = localStorage.getItem('decisigraph_gemini_api_key');
    if (localKey && localKey.trim().length > 0) {
      return localKey.trim();
    }
  }

  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 0) {
    return envKey.trim();
  }

  return '';
}

export function setCustomGeminiApiKey(apiKey: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  if (!apiKey || apiKey.trim().length === 0) {
    localStorage.removeItem('decisigraph_gemini_api_key');
  } else {
    localStorage.setItem('decisigraph_gemini_api_key', apiKey.trim());
  }
}

export interface FetchAiNarrativeOptions {
  bypassCache?: boolean;
}

export async function fetchAiExecutiveNarrative(
  request: AiNarrativeRequest,
  overrideApiKey?: string,
  options?: FetchAiNarrativeOptions
): Promise<AiExecutiveNarrative> {
  if (!options?.bypassCache) {
    const cached = getCachedAiNarrative(request);
    if (cached) {
      return {
        ...cached,
        sectionA_rankingShifts: sanitizeNarrativeText(cached.sectionA_rankingShifts),
        sectionB_methodValidity: sanitizeNarrativeText(cached.sectionB_methodValidity),
        sectionC_recommendations: sanitizeNarrativeText(cached.sectionC_recommendations),
      };
    }
  }

  const apiKey = typeof overrideApiKey === 'string' ? overrideApiKey.trim() : getEffectiveGeminiApiKey();
  if (!apiKey) {
    const fallback = generateFallbackNarrative(request);
    return {
      ...fallback,
      sectionA_rankingShifts: sanitizeNarrativeText(fallback.sectionA_rankingShifts),
      sectionB_methodValidity: sanitizeNarrativeText(fallback.sectionB_methodValidity),
      sectionC_recommendations: sanitizeNarrativeText(fallback.sectionC_recommendations),
    };
  }

  const prompt = buildGeminiPrompt(request);
  const startTime = performance.now();

  try {
    const ai = new GoogleGenAI({ apiKey });

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
            maxOutputTokens: 1000,
          },
        });

        const rawText = response?.text;
        if (!rawText) continue;

        const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsed = JSON.parse(cleanedText);

        if (
          typeof parsed.sectionA_rankingShifts !== 'string' ||
          typeof parsed.sectionB_methodValidity !== 'string' ||
          typeof parsed.sectionC_recommendations !== 'string'
        ) {
          continue;
        }

        const latencyMs = Number((performance.now() - startTime).toFixed(1));
        const result: AiExecutiveNarrative = {
          sectionA_rankingShifts: sanitizeNarrativeText(parsed.sectionA_rankingShifts),
          sectionB_methodValidity: sanitizeNarrativeText(parsed.sectionB_methodValidity),
          sectionC_recommendations: sanitizeNarrativeText(parsed.sectionC_recommendations),
          source: 'gemini',
          modelUsed: model,
          generatedAt: new Date().toISOString(),
          latencyMs,
        };

        setCachedAiNarrative(request, result);
        return result;
      } catch {
        continue;
      }
    }
  } catch {
  }

  const fallback = generateFallbackNarrative(request);
  return {
    ...fallback,
    sectionA_rankingShifts: sanitizeNarrativeText(fallback.sectionA_rankingShifts),
    sectionB_methodValidity: sanitizeNarrativeText(fallback.sectionB_methodValidity),
    sectionC_recommendations: sanitizeNarrativeText(fallback.sectionC_recommendations),
  };
}
