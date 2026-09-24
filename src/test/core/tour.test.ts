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
    const requiredStep = dummyTourFallback.steps.find((s) => s.requiredAction);
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

  it('generalTourDefinition memiliki 6 step dan requiredAction berbasis baseline criteria', () => {
    expect(generalTourDefinition.steps.length).toBe(6);
    const addCritStep = generalTourDefinition.steps.find((s) => s.id === 'general-add-criterion');
    expect(addCritStep).toBeDefined();
    expect(addCritStep?.requiredAction).toBeDefined();

    setCriteriaBaseline(3);
    const stateAtBaseline: DecisiProjectState = {
      title: 'T',
      activeMethod: 'SAW',
      criteria: [
        { id: '1', name: '1', type: 'BENEFIT', weight: 1, normalizedWeight: 0.33 },
        { id: '2', name: '2', type: 'BENEFIT', weight: 1, normalizedWeight: 0.33 },
        { id: '3', name: '3', type: 'BENEFIT', weight: 1, normalizedWeight: 0.34 },
      ],
      alternatives: [],
    };
    expect(addCritStep!.requiredAction!.isSatisfied(stateAtBaseline)).toBe(false);

    const stateIncremented: DecisiProjectState = {
      ...stateAtBaseline,
      criteria: [
        ...stateAtBaseline.criteria,
        { id: '4', name: '4', type: 'BENEFIT', weight: 1, normalizedWeight: 0.25 },
      ],
    };
    expect(addCritStep!.requiredAction!.isSatisfied(stateIncremented)).toBe(true);
  });
});
