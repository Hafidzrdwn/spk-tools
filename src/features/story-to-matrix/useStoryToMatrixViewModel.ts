import { useState, useCallback } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useUiStore } from '@/store/useUiStore';
import {
  extractAlternativesFromText,
  detectComparisonsFromText,
  PARSER_CASE_PRESETS,
  type DetectedComparison,
  type ParserCasePreset,
} from '@/core/parser';
import type { Criterion, Alternative } from '@/types/domain';

export function useStoryToMatrixViewModel() {
  const criteria = useProjectStore((s) => s.criteria);
  const alternatives = useProjectStore((s) => s.alternatives);
  const loadProjectState = useProjectStore((s) => s.loadProjectState);
  const setActiveTab = useUiStore((s) => s.setActiveTab);
  const mode = useUiStore((s) => s.storyMode);
  const setMode = useUiStore((s) => s.setStoryMode);

  const [rawText, setRawText] = useState<string>('');
  const [previewAlternatives, setPreviewAlternatives] = useState<Alternative[]>([]);
  const [tempCriteria, setTempCriteria] = useState<Criterion[]>([]);
  const [unmatchedCriteria, setUnmatchedCriteria] = useState<string[]>([]);
  const [detectedComparisons, setDetectedComparisons] = useState<DetectedComparison[]>([]);
  const [isAhpPromptOpen, setIsAhpPromptOpen] = useState(false);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCommitted, setIsCommitted] = useState(false);

  // Form ke Cerita: Generate narasi teks dari state proyek yang aktif atau pratinjau yang ada
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

  // Cerita ke Form: Parse teks ke alternatif & kriteria
  const handleParse = useCallback(() => {
    setErrorMessage(null);
    setIsCommitted(false);

    // 1. Cek perbandingan relatif AHP
    const compResult = detectComparisonsFromText(rawText);
    if (compResult.success && compResult.comparisons.length > 0) {
      setDetectedComparisons(compResult.comparisons);
      setIsAhpPromptOpen(true);
    }

    // 2. Ekstrak data alternatif & kriteria
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
  }, [rawText, criteria, tempCriteria, setMode]);

  // Terapkan hasil ekstraksi ke useProjectStore
  const handleCommit = useCallback(() => {
    if (previewAlternatives.length === 0) return;
    const finalCriteria = tempCriteria.length > 0 ? tempCriteria : criteria;

    loadProjectState({
      title: 'Proyek dari Story-to-Matrix',
      activeMethod: 'SAW',
      criteria: finalCriteria,
      alternatives: previewAlternatives,
    });

    setIsCommitted(true);
    setTimeout(() => setIsCommitted(false), 3000);
  }, [previewAlternatives, criteria, tempCriteria, loadProjectState]);

  // Muat salah satu preset 5 contoh kasus
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
    setUnmatchedCriteria([]);
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
    redirectToAhp: () => { setIsAhpPromptOpen(false); setActiveTab('AHP'); },
    PARSER_CASE_PRESETS,
  };
}

export default useStoryToMatrixViewModel;
