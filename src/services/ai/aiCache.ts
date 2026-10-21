import type { AiNarrativeRequest, AiExecutiveNarrative } from './types';

const CACHE_PREFIX = 'decisigraph_ai_cache_';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface CacheEntry {
  narrative: AiExecutiveNarrative;
  timestamp: number;
}

export function computeRequestHash(request: AiNarrativeRequest): string {
  const critKey = request.criteria.map((c) => `${c.id}:${c.type}:${c.weight}:${c.normalizedWeight}`).join('|');
  const altKey = request.alternatives
    .map((a) => `${a.id}:${Object.entries(a.values).sort().map(([k, v]) => `${k}=${v}`).join(',')}`)
    .join('|');
  const methodKey = [...request.activeMethods].sort().join(',');
  const rawKey = `${request.projectTitle}_${critKey}_${altKey}_${methodKey}_${request.budgetConstraint ?? ''}`;

  let hash = 0;
  for (let i = 0; i < rawKey.length; i++) {
    const char = rawKey.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function getCachedAiNarrative(request: AiNarrativeRequest): AiExecutiveNarrative | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  try {
    const key = CACHE_PREFIX + computeRequestHash(request);
    const item = localStorage.getItem(key);
    if (!item) return null;

    const entry: CacheEntry = JSON.parse(item);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.narrative;
  } catch {
    return null;
  }
}

export function setCachedAiNarrative(request: AiNarrativeRequest, narrative: AiExecutiveNarrative): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const key = CACHE_PREFIX + computeRequestHash(request);
    const entry: CacheEntry = {
      narrative,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Storage quota or parsing failure safe ignore
  }
}
