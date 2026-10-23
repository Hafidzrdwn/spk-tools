import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useProjectStore } from '@/store/useProjectStore';
import { useUiStore } from '@/store/useUiStore';
import {
  extractAlternativesFromText,
  detectComparisonsFromText,
  PARSER_CASE_PRESETS,
  type DetectedComparison,
  type ParserCasePreset,
} from '@/core/parser';
import { extractMatrixFromStoryText } from '@/services/ai';
import type { Criterion, Alternative, CaseContextMetadata } from '@/types/domain';

export type StoryInputMode = 'auto' | 'formatted';

export function useStoryToMatrixViewModel() {
  const criteria = useProjectStore((s) => s.criteria);
  const alternatives = useProjectStore((s) => s.alternatives);
  const loadProjectState = useProjectStore((s) => s.loadProjectState);
  const setActiveTab = useUiStore((s) => s.setActiveTab);
  const mode = useUiStore((s) => s.storyMode);
  const setMode = useUiStore((s) => s.setStoryMode);

  const lastResetAt = useProjectStore((s) => s.lastResetAt);

  const [storyInputMode, setStoryInputMode] = useState<StoryInputMode>('auto');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedTitle, setExtractedTitle] = useState<string>('');
  const [contextMetadata, setContextMetadata] = useState<CaseContextMetadata | undefined>(undefined);

  const [rawText, setRawText] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cur = useProjectStore.getState();
        const isBlankProject =
          cur.title === 'Proyek SPK Baru' &&
          cur.criteria.length === 0 &&
          cur.alternatives.length === 0 &&
          !cur.contextMetadata;

        if (isBlankProject) {
          localStorage.removeItem('decisigraph_story_raw_text');
          return '';
        }
        return localStorage.getItem('decisigraph_story_raw_text') || '';
      } catch {
      }
    }
    return '';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (rawText.trim()) {
        localStorage.setItem('decisigraph_story_raw_text', rawText);
      } else {
        localStorage.removeItem('decisigraph_story_raw_text');
      }
    }
  }, [rawText]);

  useEffect(() => {
    if (lastResetAt) {
      setRawText('');
      setPreviewAlternatives([]);
      setTempCriteria([]);
      setExtractedTitle('');
      setContextMetadata(undefined);
      setErrorMessage(null);
      setIsCommitted(false);
      setMode('story');
    }
  }, [lastResetAt, setMode]);

  const [previewAlternatives, setPreviewAlternatives] = useState<Alternative[]>([]);
  const [tempCriteria, setTempCriteria] = useState<Criterion[]>([]);
  const [unmatchedCriteria, setUnmatchedCriteria] = useState<string[]>([]);
  const [detectedComparisons, setDetectedComparisons] = useState<DetectedComparison[]>([]);
  const [isAhpPromptOpen, setIsAhpPromptOpen] = useState(false);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCommitted, setIsCommitted] = useState(false);

  const generateNarrativeFromState = useCallback(() => {
    const currentAlternatives = previewAlternatives.length > 0 ? previewAlternatives : alternatives;
    const currentCriteria = tempCriteria.length > 0 ? tempCriteria : criteria;
    if (currentAlternatives.length === 0) return '';
    return currentAlternatives
      .map((alt) => {
        const parts = currentCriteria.map((c) => `${c.name}: ${alt.values[c.id] ?? 0}`);
        return `Kandidat: ${alt.name}, ${parts.join(', ')}`;
      })
      .join('\n');
  }, [criteria, alternatives, tempCriteria, previewAlternatives]);

  const handleParse = useCallback(async () => {
    setErrorMessage(null);
    setIsCommitted(false);

    const compResult = detectComparisonsFromText(rawText);
    if (compResult.success && compResult.comparisons.length > 0) {
      setDetectedComparisons(compResult.comparisons);
      setIsAhpPromptOpen(true);
    }

    if (storyInputMode === 'auto') {
      setIsAnalyzing(true);
      try {
        const result = await extractMatrixFromStoryText(rawText);
        setTempCriteria(result.criteria);
        setPreviewAlternatives(result.alternatives);
        setExtractedTitle(result.projectTitle);
        setContextMetadata(result.contextMetadata);
        setUnmatchedCriteria([]);
        setMode('form');
        useUiStore.getState().setStoryHasExtracted(true);
        toast.success('Narasi berhasil dianalisis menjadi matriks keputusan.');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal menganalisis teks cerita.';
        setErrorMessage(msg);
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

    const baseCriteria = tempCriteria.length > 0 ? tempCriteria : criteria;
    const extractResult = extractAlternativesFromText(rawText, baseCriteria);
    if (!extractResult.success) {
      setErrorMessage(extractResult.error);
      setPreviewAlternatives([]);
      return;
    }

    if (extractResult.criteria && extractResult.criteria.length > 0) {
      setTempCriteria(extractResult.criteria);
    }
    setPreviewAlternatives(extractResult.alternatives);
    setUnmatchedCriteria(extractResult.unmatchedCriteria);
    setMode('form');
    useUiStore.getState().setStoryHasExtracted(true);
  }, [rawText, criteria, tempCriteria, setMode, storyInputMode]);

  const handleCommit = useCallback(() => {
    if (previewAlternatives.length === 0) return;
    const finalCriteria = tempCriteria.length > 0 ? tempCriteria : criteria;

    loadProjectState({
      title: extractedTitle || 'Proyek dari Story-to-Matrix',
      activeMethod: 'SAW',
      criteria: finalCriteria,
      alternatives: previewAlternatives,
      contextMetadata,
    });

    setIsCommitted(true);
    toast.success('Matriks keputusan berhasil diterapkan ke proyek.');
    setTimeout(() => setIsCommitted(false), 3000);
  }, [previewAlternatives, criteria, tempCriteria, loadProjectState, extractedTitle, contextMetadata]);

  const handleSelectTemplate = useCallback((preset: ParserCasePreset) => {
    const narrative = preset.state.alternatives
      .map((alt) => {
        const parts = preset.state.criteria.map((c) => `${c.name}: ${alt.values[c.id] ?? 0}`);
        return `Kandidat: ${alt.name}, ${parts.join(', ')}`;
      })
      .join('\n');

    setRawText(narrative);
    setTempCriteria(preset.state.criteria.map((c) => ({ ...c })));
    setPreviewAlternatives(preset.state.alternatives);
    setExtractedTitle(preset.name);
    setContextMetadata(undefined);
    setUnmatchedCriteria([]);
    setStoryInputMode('formatted');
    setMode('form');
    useUiStore.getState().setStoryHasExtracted(true);
    setIsTemplatePickerOpen(false);
    setErrorMessage(null);
  }, [setMode]);

  return {
    mode, setMode, rawText, setRawText, previewAlternatives,
    criteria: tempCriteria.length > 0 ? tempCriteria : criteria,
    unmatchedCriteria, detectedComparisons, isAhpPromptOpen,
    setIsAhpPromptOpen, isTemplatePickerOpen, setIsTemplatePickerOpen,
    errorMessage, isCommitted, handleParse, handleCommit,
    handleSelectTemplate, generateNarrativeFromState,
    storyInputMode, setStoryInputMode, isAnalyzing, contextMetadata,
    redirectToAhp: () => { setIsAhpPromptOpen(false); setActiveTab('AHP'); },
    PARSER_CASE_PRESETS,
  };
}

export default useStoryToMatrixViewModel;
