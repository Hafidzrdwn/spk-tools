import { describe, it, expect, beforeEach } from 'vitest';
import type { Criterion, Alternative } from '@/types/domain';
import type { RankingRow } from '@/core/math/types';
import {
  generateFallbackNarrative,
  buildGeminiPrompt,
  computeRequestHash,
  getCachedAiNarrative,
  setCachedAiNarrative,
  fetchAiExecutiveNarrative,
  type AiNarrativeRequest,
} from '@/services/ai';

describe('AI Executive Narrative & Recommendation Engine', () => {
  const criteriaMock: Criterion[] = [
    { id: 'c1', name: 'Biaya', type: 'COST', weight: 30, normalizedWeight: 0.3, unit: 'Juta' },
    { id: 'c2', name: 'Kualitas', type: 'BENEFIT', weight: 40, normalizedWeight: 0.4, unit: 'Skor' },
    { id: 'c3', name: 'Pengiriman', type: 'BENEFIT', weight: 30, normalizedWeight: 0.3, unit: '%' },
  ];

  const alternativesMock: Alternative[] = [
    { id: 'a1', name: 'Program A', values: { c1: 40, c2: 85, c3: 90 } },
    { id: 'a2', name: 'Program B', values: { c1: 65, c2: 75, c3: 95 } },
    { id: 'a3', name: 'Program C', values: { c1: 30, c2: 95, c3: 92 } },
    { id: 'a4', name: 'Program D', values: { c1: 50, c2: 88, c3: 88 } },
  ];

  const sawRankingsMock: RankingRow[] = [
    { rank: 1, alternativeId: 'a3', alternativeName: 'Program C', score: 0.945 },
    { rank: 2, alternativeId: 'a2', alternativeName: 'Program B', score: 0.885 },
    { rank: 3, alternativeId: 'a1', alternativeName: 'Program A', score: 0.882 },
    { rank: 4, alternativeId: 'a4', alternativeName: 'Program D', score: 0.812 },
  ];

  const wpRankingsMock: RankingRow[] = [
    { rank: 1, alternativeId: 'a3', alternativeName: 'Program C', score: 0.285 },
    { rank: 2, alternativeId: 'a1', alternativeName: 'Program A', score: 0.245 },
    { rank: 3, alternativeId: 'a4', alternativeName: 'Program D', score: 0.239 },
    { rank: 4, alternativeId: 'a2', alternativeName: 'Program B', score: 0.231 },
  ];

  const requestMock: AiNarrativeRequest = {
    projectTitle: 'Evaluasi Program Pengadaan',
    criteria: criteriaMock,
    alternatives: alternativesMock,
    activeMethods: ['saw', 'wp'],
    rankings: {
      saw: sawRankingsMock,
      wp: wpRankingsMock,
    },
    budgetConstraint: 70000000,
  };

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('generates high-precision deterministic fallback narrative with 3 mandatory sections', () => {
    const fallback = generateFallbackNarrative(requestMock);

    expect(fallback.source).toBe('deterministic_fallback');
    expect(fallback.sectionA_rankingShifts.length).toBeGreaterThan(50);
    expect(fallback.sectionB_methodValidity.length).toBeGreaterThan(50);
    expect(fallback.sectionC_recommendations.length).toBeGreaterThan(50);

    expect(fallback.sectionA_rankingShifts).toContain('SAW');
    expect(fallback.sectionA_rankingShifts).toContain('WP');
    expect(fallback.sectionB_methodValidity).toContain('Tidak');
    expect(fallback.sectionC_recommendations).toContain('Program C');
  });

  it('builds structured prompt with JSON schema requirements', () => {
    const prompt = buildGeminiPrompt(requestMock);

    expect(prompt).toContain('Evaluasi Program Pengadaan');
    expect(prompt).toContain('sectionA_rankingShifts');
    expect(prompt).toContain('sectionB_methodValidity');
    expect(prompt).toContain('sectionC_recommendations');
    expect(prompt).toContain('Program C');
  });

  it('computes deterministic request hash and handles caching correctly', () => {
    const hash1 = computeRequestHash(requestMock);
    const hash2 = computeRequestHash(requestMock);
    expect(hash1).toBe(hash2);

    const fallback = generateFallbackNarrative(requestMock);
    setCachedAiNarrative(requestMock, fallback);

    const cached = getCachedAiNarrative(requestMock);
    expect(cached).not.toBeNull();
    expect(cached?.sectionA_rankingShifts).toBe(fallback.sectionA_rankingShifts);
  });

  it('falls back gracefully to deterministic narrative when API key is missing', async () => {
    const narrative = await fetchAiExecutiveNarrative(requestMock, '');

    expect(narrative).toBeDefined();
    expect(narrative.source).toBe('deterministic_fallback');
    expect(narrative.sectionA_rankingShifts).toBeDefined();
    expect(narrative.sectionB_methodValidity).toBeDefined();
    expect(narrative.sectionC_recommendations).toBeDefined();
    expect(narrative.sectionA_rankingShifts).not.toContain('—');
    expect(narrative.sectionB_methodValidity).not.toContain('—');
    expect(narrative.sectionC_recommendations).not.toContain('—');
  });

  it('handles rate limit HTTP 429 and network errors by falling back gracefully', async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async () => ({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: 'Resource has been exhausted (rate limit)' } }),
      } as unknown as Response);

      const narrative = await fetchAiExecutiveNarrative(requestMock, 'AIzaMockKey');
      expect(narrative).toBeDefined();
      expect(narrative.source).toBe('deterministic_fallback');
      expect(narrative.sectionA_rankingShifts).toContain('Program B');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('eradicates em dashes and normalizes text properly', async () => {
    const { sanitizeNarrativeText, CANDIDATE_MODELS } = await import('@/services/ai');

    expect(CANDIDATE_MODELS).toContain('gemini-1.5-flash');
    expect(CANDIDATE_MODELS).toContain('gemini-2.0-flash-exp');

    const sampleWithEmDash = 'Metode SAW—menggunakan model aditif—mampu mengompensasi nilai rendah.';
    const cleaned = sanitizeNarrativeText(sampleWithEmDash);
    expect(cleaned).not.toContain('—');
    expect(cleaned).toContain('Metode SAW, menggunakan model aditif, mampu mengompensasi nilai rendah.');

    const sampleWithDoubleDash = 'Program B -- mengalami pergeseran ranking';
    const cleanedDouble = sanitizeNarrativeText(sampleWithDoubleDash);
    expect(cleanedDouble).not.toContain('--');
    expect(cleanedDouble).toContain('Program B - mengalami pergeseran ranking');
  });
});
