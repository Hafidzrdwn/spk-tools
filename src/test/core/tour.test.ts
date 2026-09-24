import { describe, it, expect, beforeEach } from 'vitest';
import { useTourStore } from '@/store/useTourStore';
import { DUMMY_TOURS } from '@/features/tour/TourRunner';
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

  it('requiredAction pada dummy tour mengevaluasi isSatisfied secara akurat', () => {
    const generalTour = DUMMY_TOURS['general'];
    const requiredStep = generalTour.steps.find((s) => s.requiredAction);
    expect(requiredStep).toBeDefined();

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
        { id: 'c4', name: 'C4', type: 'BENEFIT', weight: 0.2, normalizedWeight: 0.2 },
      ],
    };

    expect(requiredStep!.requiredAction!.isSatisfied(mockStateSatisfied)).toBe(true);
  });
});
