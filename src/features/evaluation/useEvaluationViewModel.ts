import { useState, useMemo, useCallback } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useNormalizedCriteria } from '@/store/selectors';
import { calculateSAW } from '@/core/math/saw';
import { calculateWP, calculateSafeWP, WpZeroGuardError } from '@/core/math/wp';
import { calculateTOPSIS } from '@/core/math/topsis';
import {
  calculateSpearmansRho,
  evaluateGoalCongruence,
  evaluateMarginOfVictory,
  simulateWhatIf,
  findCrossoverThresholds,
  simulateSensitivity,
  evaluateBusinessScenarios,
  calculateGoalSeeking,
  synthesizeManagerialRecommendations,
  buildDecisionEvaluationPayload,
  type SpearmansRhoResult,
  type GoalCongruenceResult,
  type MarginOfVictoryResult,
  type WhatIfSimulationResult,
  type SensitivitySimulationResult,
  type BusinessScenarioId,
  type BusinessScenarioResult,
  type GoalSeekingTarget,
  type ManagerialSynthesisResult,
  type DecisionEvaluationPayload,
  type AnalysisMethod,
} from '@/core/analysis';

export type EvaluationSubPanel = 'aspects' | 'sensitivity' | 'whatif' | 'managerial';

export function useEvaluationViewModel() {
  const criteria = useNormalizedCriteria();
  const alternatives = useProjectStore((state) => state.alternatives);
  const projectTitle = useProjectStore((state) => state.title);
  const loadProjectState = useProjectStore((state) => state.loadProjectState);

  const [activePanel, setActivePanel] = useState<EvaluationSubPanel>('aspects');
  const [spearmanMethodB, setSpearmanMethodB] = useState<AnalysisMethod>('wp');

  const [whatIfAltId, setWhatIfAltId] = useState<string>('');
  const [whatIfCritId, setWhatIfCritId] = useState<string>('');
  const [whatIfValue, setWhatIfValue] = useState<number>(0);

  const [goalSeekingAltId, setGoalSeekingAltId] = useState<string>('');
  const [goalSeekingCritId, setGoalSeekingCritId] = useState<string>('');

  const [customWeights, setCustomWeights] = useState<Record<string, number>>({});

  const hasData = criteria.length > 0 && alternatives.length > 0;

  const methodRankings = useMemo(() => {
    if (!hasData) return null;
    let wpRanking;
    try {
      wpRanking = calculateWP(criteria, alternatives).finalRanking;
    } catch (err) {
      if (err instanceof WpZeroGuardError) {
        wpRanking = calculateSafeWP(criteria, alternatives).finalRanking;
      } else {
        throw err;
      }
    }
    return {
      saw: calculateSAW(criteria, alternatives).finalRanking,
      wp: wpRanking,
      topsis: calculateTOPSIS(criteria, alternatives).finalRanking,
    };
  }, [criteria, alternatives, hasData]);

  const sawRankings = methodRankings?.saw ?? [];
  const wpRankings = methodRankings?.wp ?? [];
  const topsisRankings = methodRankings?.topsis ?? [];

  const spearmanResult: SpearmansRhoResult | null = useMemo(() => {
    if (!hasData || !methodRankings) return null;
    const targetRankings = spearmanMethodB === 'wp' ? wpRankings : topsisRankings;
    return calculateSpearmansRho(sawRankings, targetRankings, 'saw', spearmanMethodB);
  }, [hasData, methodRankings, sawRankings, wpRankings, topsisRankings, spearmanMethodB]);

  const goalCongruence: GoalCongruenceResult | null = useMemo(() => {
    if (!hasData || sawRankings.length === 0) return null;
    return evaluateGoalCongruence(criteria, alternatives, sawRankings);
  }, [hasData, criteria, alternatives, sawRankings]);

  const marginOfVictory: MarginOfVictoryResult | null = useMemo(() => {
    if (!hasData || sawRankings.length === 0) return null;
    return evaluateMarginOfVictory(sawRankings);
  }, [hasData, sawRankings]);

  const crossovers = useMemo(() => {
    if (!hasData) return [];
    return findCrossoverThresholds(criteria, alternatives);
  }, [hasData, criteria, alternatives]);

  const activeCustomWeights = useMemo(() => {
    if (Object.keys(customWeights).length > 0) return customWeights;
    const initial: Record<string, number> = {};
    criteria.forEach((c) => {
      initial[c.id] = c.normalizedWeight || c.weight || 1 / criteria.length;
    });
    return initial;
  }, [customWeights, criteria]);

  const sensitivitySimulation: SensitivitySimulationResult | null = useMemo(() => {
    if (!hasData) return null;
    return simulateSensitivity(criteria, alternatives, activeCustomWeights);
  }, [hasData, criteria, alternatives, activeCustomWeights]);

  const updateCriterionWeight = useCallback((criterionId: string, val: number) => {
    setCustomWeights((prev) => ({
      ...prev,
      [criterionId]: Math.max(0.01, Math.min(0.99, val)),
    }));
  }, []);

  const resetWeights = useCallback(() => {
    const initial: Record<string, number> = {};
    criteria.forEach((c) => {
      initial[c.id] = c.normalizedWeight || c.weight || 1 / criteria.length;
    });
    setCustomWeights(initial);
  }, [criteria]);

  const scenarios: Record<BusinessScenarioId, BusinessScenarioResult> | null = useMemo(() => {
    if (!hasData) return null;
    return evaluateBusinessScenarios(criteria, alternatives);
  }, [hasData, criteria, alternatives]);

  const effectiveWhatIfAltId = whatIfAltId || (sawRankings[1]?.alternativeId ?? alternatives[0]?.id ?? '');
  const effectiveWhatIfCritId = whatIfCritId || criteria[0]?.id || '';
  const currentWhatIfRealVal = useMemo(() => {
    const a = alternatives.find((alt) => alt.id === effectiveWhatIfAltId);
    return a?.values[effectiveWhatIfCritId] ?? 0;
  }, [alternatives, effectiveWhatIfAltId, effectiveWhatIfCritId]);

  const effectiveWhatIfValue = whatIfValue !== 0 ? whatIfValue : currentWhatIfRealVal;

  const whatIfResult: WhatIfSimulationResult | null = useMemo(() => {
    if (!hasData || !effectiveWhatIfAltId || !effectiveWhatIfCritId) return null;
    return simulateWhatIf(criteria, alternatives, {
      alternativeId: effectiveWhatIfAltId,
      criterionId: effectiveWhatIfCritId,
      newValue: effectiveWhatIfValue,
    });
  }, [hasData, criteria, alternatives, effectiveWhatIfAltId, effectiveWhatIfCritId, effectiveWhatIfValue]);

  const effectiveGoalAltId = goalSeekingAltId || (sawRankings[1]?.alternativeId ?? alternatives[1]?.id ?? '');
  const effectiveGoalCritId = goalSeekingCritId || criteria[0]?.id || '';

  const goalSeekingResult: GoalSeekingTarget | null = useMemo(() => {
    if (!hasData) return null;
    return calculateGoalSeeking(criteria, alternatives, effectiveGoalAltId, effectiveGoalCritId);
  }, [hasData, criteria, alternatives, effectiveGoalAltId, effectiveGoalCritId]);

  const managerialSynthesis: ManagerialSynthesisResult | null = useMemo(() => {
    if (
      !hasData ||
      sawRankings.length === 0 ||
      !goalCongruence ||
      !spearmanResult ||
      !marginOfVictory ||
      !scenarios
    ) {
      return null;
    }
    return synthesizeManagerialRecommendations({
      winner: sawRankings[0],
      runnerUp: sawRankings[1] || sawRankings[0],
      goalCongruence,
      spearmanRho: spearmanResult,
      margin: marginOfVictory,
      crossovers,
      scenarios,
      goalSeeking: goalSeekingResult,
    });
  }, [
    hasData,
    sawRankings,
    goalCongruence,
    spearmanResult,
    marginOfVictory,
    crossovers,
    scenarios,
    goalSeekingResult,
  ]);

  const evaluationPayload: DecisionEvaluationPayload | null = useMemo(() => {
    if (
      !hasData ||
      !goalCongruence ||
      !spearmanResult ||
      !marginOfVictory ||
      !scenarios ||
      !managerialSynthesis
    ) {
      return null;
    }
    return buildDecisionEvaluationPayload({
      projectTitle,
      criteria,
      alternatives,
      goalCongruence,
      spearmanRho: spearmanResult,
      margin: marginOfVictory,
      crossovers,
      scenarios,
      goalSeeking: goalSeekingResult,
      managerialSynthesis,
    });
  }, [
    hasData,
    projectTitle,
    criteria,
    alternatives,
    goalCongruence,
    spearmanResult,
    marginOfVictory,
    crossovers,
    scenarios,
    goalSeekingResult,
    managerialSynthesis,
  ]);

  const loadCvMajuJayaCase = useCallback(() => {
    loadProjectState({
      title: 'Studi Kasus Pengadaan Komputer CV Maju Jaya',
      activeMethod: 'EVALUATION',
      criteria: [
        { id: 'c1', name: 'Harga', type: 'COST', weight: 30, normalizedWeight: 0.3, unit: 'Juta Rp' },
        { id: 'c2', name: 'Kualitas Barang', type: 'BENEFIT', weight: 25, normalizedWeight: 0.25, unit: 'Skor' },
        { id: 'c3', name: 'Ketepatan Pengiriman', type: 'BENEFIT', weight: 20, normalizedWeight: 0.2, unit: '%' },
        { id: 'c4', name: 'Layanan Purna Jual', type: 'BENEFIT', weight: 15, normalizedWeight: 0.15, unit: 'Skor' },
        { id: 'c5', name: 'Kapasitas Pasokan', type: 'BENEFIT', weight: 10, normalizedWeight: 0.1, unit: 'Unit/bln' },
      ],
      alternatives: [
        {
          id: 'a1',
          name: 'PT Alpha Teknologi',
          values: { c1: 185, c2: 85, c3: 96, c4: 80, c5: 500 },
        },
        {
          id: 'a2',
          name: 'CV Digital Nusantara',
          values: { c1: 175, c2: 88, c3: 90, c4: 85, c5: 450 },
        },
        {
          id: 'a3',
          name: 'PT Smart Solution',
          values: { c1: 195, c2: 95, c3: 98, c4: 90, c5: 600 },
        },
        {
          id: 'a4',
          name: 'CV Prima Komputer',
          values: { c1: 170, c2: 80, c3: 88, c4: 78, c5: 400 },
        },
        {
          id: 'a5',
          name: 'PT Inovasi Informatika',
          values: { c1: 180, c2: 90, c3: 95, c4: 92, c5: 550 },
        },
      ],
    });
  }, [loadProjectState]);

  return {
    hasData,
    criteria,
    alternatives,
    projectTitle,
    activePanel,
    setActivePanel,
    spearmanMethodB,
    setSpearmanMethodB,
    spearmanResult,
    goalCongruence,
    marginOfVictory,
    crossovers,
    customWeights: activeCustomWeights,
    updateCriterionWeight,
    resetWeights,
    sensitivitySimulation,
    scenarios,
    whatIfAltId: effectiveWhatIfAltId,
    setWhatIfAltId,
    whatIfCritId: effectiveWhatIfCritId,
    setWhatIfCritId,
    whatIfValue: effectiveWhatIfValue,
    setWhatIfValue,
    whatIfResult,
    goalSeekingAltId: effectiveGoalAltId,
    setGoalSeekingAltId,
    goalSeekingCritId: effectiveGoalCritId,
    setGoalSeekingCritId,
    goalSeekingResult,
    managerialSynthesis,
    evaluationPayload,
    loadCvMajuJayaCase,
  };
}
