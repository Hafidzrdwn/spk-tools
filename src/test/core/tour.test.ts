import { describe, it, expect, beforeEach } from 'vitest';
import { useTourStore } from '@/store/useTourStore';
import { generalTourDefinition as dummyTourFallback } from '@/core/tour/generalTourSteps';
import { generalTourDefinition, setCriteriaBaseline } from '@/core/tour/generalTourSteps';
import type { DecisiProjectState } from '@/types/domain';

describe('Tour Infrastructure & useTourStore', () => {
  beforeEach(() => {
    useTourStore.getState().resetAllTourProgress();
  });

  it('Inisialisasi awal tour state benar', () => {
    const state = useTourStore.getState();
    expect(state.hasSeenWelcome).toBe(false);
    expect(state.activeTourId).toBeNull();
    expect(state.activeStepIndex).toBe(0);
    expect(state.completedTours).toEqual({});
  });

  it('startTour mengaktifkan tourId dan mereset stepIndex ke 0', () => {
    useTourStore.getState().startTour('general');
    const state = useTourStore.getState();
    expect(state.activeTourId).toBe('general');
    expect(state.activeStepIndex).toBe(0);
  });

  it('goToNextStep menaikkan step index secara bertahap', () => {
    useTourStore.getState().startTour('general');
    useTourStore.getState().goToNextStep();
    expect(useTourStore.getState().activeStepIndex).toBe(1);

    useTourStore.getState().goToNextStep();
    expect(useTourStore.getState().activeStepIndex).toBe(2);
  });

  it('skipTour membatalkan tour aktif tanpa menandai selesai', () => {
    useTourStore.getState().startTour('general');
    useTourStore.getState().goToNextStep();
    useTourStore.getState().skipTour();

    const state = useTourStore.getState();
    expect(state.activeTourId).toBeNull();
    expect(state.activeStepIndex).toBe(0);
    expect(state.completedTours['general']).toBeUndefined();
  });

  it('finishTour menandai tour selesai dan mengakhiri tour aktif', () => {
    useTourStore.getState().startTour('general');
    useTourStore.getState().finishTour('general');

    const state = useTourStore.getState();
    expect(state.activeTourId).toBeNull();
    expect(state.activeStepIndex).toBe(0);
    expect(state.completedTours['general']).toBe(true);
  });

  it('requiredAction pada generalTourDefinition mengevaluasi isSatisfied secara akurat', () => {
    const requiredStep = dummyTourFallback.steps.find((s) => s.id === 'general-add-criterion');
    expect(requiredStep).toBeDefined();

    // Set baseline ke 2 agar state 2-kriteria belum memenuhi syarat
    setCriteriaBaseline(2);

    const mockStateBelow: DecisiProjectState = {
      title: 'Test',
      activeMethod: 'SAW',
      criteria: [
        { id: 'c1', name: 'C1', type: 'BENEFIT', weight: 0.5, normalizedWeight: 0.5 },
        { id: 'c2', name: 'C2', type: 'COST', weight: 0.5, normalizedWeight: 0.5 },
      ],
      alternatives: [],
    };

    expect(requiredStep!.requiredAction!.isSatisfied(mockStateBelow)).toBe(false);

    const mockStateSatisfied: DecisiProjectState = {
      ...mockStateBelow,
      criteria: [
        ...mockStateBelow.criteria,
        { id: 'c3', name: 'C3', type: 'BENEFIT', weight: 0.3, normalizedWeight: 0.3 },
      ],
    };

    expect(requiredStep!.requiredAction!.isSatisfied(mockStateSatisfied)).toBe(true);
  });

  it('generalTourDefinition memiliki alur eksplisit dari judul, glosarium, kriteria, hingga alternatif', () => {
    expect(generalTourDefinition.steps.length).toBe(14);
    
    // Step 1: title
    const titleStep = generalTourDefinition.steps.find((s) => s.id === 'general-title');
    expect(titleStep).toBeDefined();
    expect(titleStep?.requiredAction).toBeDefined();

    // Step 2: glossary
    const glossaryStep = generalTourDefinition.steps.find((s) => s.id === 'general-glossary');
    expect(glossaryStep).toBeDefined();
    expect(glossaryStep?.requiredAction).toBeDefined();

    // Step 8: open criteria
    const openCritStep = generalTourDefinition.steps.find((s) => s.id === 'general-open-criteria');
    expect(openCritStep).toBeDefined();
    expect(openCritStep?.requiredAction).toBeDefined();

    // Step 9: add criterion
    const addCritStep = generalTourDefinition.steps.find((s) => s.id === 'general-add-criterion');
    expect(addCritStep).toBeDefined();
    expect(addCritStep?.requiredAction).toBeDefined();

    // Step 11: open alternatives
    const openAltStep = generalTourDefinition.steps.find((s) => s.id === 'general-open-alternatives');
    expect(openAltStep).toBeDefined();
    expect(openAltStep?.requiredAction).toBeDefined();
  });

  it('sawTourDefinition memenuhi kriteria 8 step eksplisit, klik tab SAW, klik stepper, dan required hover sel', async () => {
    const { sawTourDefinition, resetSawTourTracking, isSawHoverSatisfied } = await import('@/core/tour/sawTourSteps');
    const { useUiStore } = await import('@/store/useUiStore');

    // 1. Jumlah step 8
    expect(sawTourDefinition.steps.length).toBe(8);

    // 2. Step 1: klik tab SAW
    const tabStep = sawTourDefinition.steps.find((s) => s.id === 'saw-click-tab');
    expect(tabStep).toBeDefined();
    expect(tabStep?.requiredAction).toBeDefined();

    // 3. Step 3: klik stepper 2
    const step2Btn = sawTourDefinition.steps.find((s) => s.id === 'saw-click-step-2');
    expect(step2Btn).toBeDefined();
    expect(step2Btn?.requiredAction).toBeDefined();

    // 4. Step 5: required step hover sel normalisasi
    const hoverStep = sawTourDefinition.steps.find((s) => s.id === 'saw-hover-inspector');
    expect(hoverStep).toBeDefined();
    expect(hoverStep?.requiredAction).toBeDefined();
    expect(hoverStep?.placement).toBe('right'); // Tidak menutupi sel

    // Reset tracking
    resetSawTourTracking();
    useUiStore.getState().setHoveredCell(null);
    expect(isSawHoverSatisfied()).toBe(false);

    // Jalankan preNavigate step hover agar tracking aktif
    hoverStep?.preNavigate?.();
    expect(isSawHoverSatisfied()).toBe(false);

    // Simulasi user hover ke sel normalisasi
    useUiStore.getState().setHoveredCell('saw-alt1-crit1-NORMALIZED');
    expect(isSawHoverSatisfied()).toBe(true);

    // Tetap true meski mouse leave
    useUiStore.getState().setHoveredCell(null);
    expect(isSawHoverSatisfied()).toBe(true);
  });

  it('wpTourDefinition memenuhi kriteria 6 step eksplisit, klik tab WP, dan required zero-guard trigger & fix', async () => {
    const { wpTourDefinition, resetWpTourTracking, isWpZeroGuardSatisfied } = await import('@/core/tour/wpTourSteps');

    // 1. Jumlah step 6
    expect(wpTourDefinition.steps.length).toBe(6);

    // 2. Step 1: klik tab WP
    const tabStep = wpTourDefinition.steps.find((s) => s.id === 'wp-click-tab');
    expect(tabStep).toBeDefined();
    expect(tabStep?.requiredAction).toBeDefined();

    // 3. Step 2: required step zero-guard
    const zeroGuardStep = wpTourDefinition.steps.find((s) => s.id === 'wp-zero-guard-step');
    expect(zeroGuardStep).toBeDefined();
    expect(zeroGuardStep?.requiredAction).toBeDefined();

    // Reset tracking
    resetWpTourTracking();

    const normalState: DecisiProjectState = {
      title: 'WP Test',
      activeMethod: 'WP',
      criteria: [
        { id: 'c_cost', name: 'Harga', type: 'COST', weight: 1, normalizedWeight: 0.5 },
        { id: 'c_ben', name: 'Kualitas', type: 'BENEFIT', weight: 1, normalizedWeight: 0.5 },
      ],
      alternatives: [
        { id: 'a1', name: 'Alt 1', values: { c_cost: 10, c_ben: 80 } },
      ],
    };

    // Saat step belum aktif -> false
    expect(isWpZeroGuardSatisfied(normalState)).toBe(false);

    // Aktifkan step via preNavigate
    zeroGuardStep?.preNavigate?.();

    // Awal: belum ada 0, belum pernah trigger -> false
    expect(isWpZeroGuardSatisfied(normalState)).toBe(false);

    // User mengisi 0 di sel Cost -> trigger alert, tapi belum diperbaiki -> false
    const violatedState: DecisiProjectState = {
      ...normalState,
      alternatives: [
        { id: 'a1', name: 'Alt 1', values: { c_cost: 0, c_ben: 80 } },
      ],
    };
    expect(isWpZeroGuardSatisfied(violatedState)).toBe(false);

    // User memperbaiki nilai 0 kembali menjadi angka positif -> alert hilang -> satisfied!
    const resolvedState: DecisiProjectState = {
      ...normalState,
      alternatives: [
        { id: 'a1', name: 'Alt 1', values: { c_cost: 15, c_ben: 80 } },
      ],
    };
    expect(isWpZeroGuardSatisfied(resolvedState)).toBe(true);
  });

  it('visitedTabs melacak tab yang pernah dibuka', () => {
    const store = useTourStore.getState();
    expect(store.visitedTabs).toContain('SAW');

    store.markTabVisited('WP');
    expect(useTourStore.getState().visitedTabs).toContain('WP');
  });
});
