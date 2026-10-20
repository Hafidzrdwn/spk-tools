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
    expect(generalTourDefinition.steps.length).toBe(16);
    
    const titleStep = generalTourDefinition.steps.find((s) => s.id === 'general-title');
    expect(titleStep).toBeDefined();
    expect(titleStep?.requiredAction).toBeDefined();

    const glossaryStep = generalTourDefinition.steps.find((s) => s.id === 'general-glossary');
    expect(glossaryStep).toBeDefined();
    expect(glossaryStep?.requiredAction).toBeDefined();

    const toggleStep = generalTourDefinition.steps.find((s) => s.id === 'general-shared-matrix-toggle');
    expect(toggleStep).toBeDefined();
    expect(toggleStep?.targetSelector).toBe('[data-tour-id="shared-matrix-toggle-btn"]');

    const openCritStep = generalTourDefinition.steps.find((s) => s.id === 'general-open-criteria');
    expect(openCritStep).toBeDefined();
    expect(openCritStep?.requiredAction).toBeDefined();

    const addCritStep = generalTourDefinition.steps.find((s) => s.id === 'general-add-criterion');
    expect(addCritStep).toBeDefined();
    expect(addCritStep?.requiredAction).toBeDefined();

    const openAltStep = generalTourDefinition.steps.find((s) => s.id === 'general-open-alternatives');
    expect(openAltStep).toBeDefined();
    expect(openAltStep?.requiredAction).toBeDefined();

    const exportPdfStep = generalTourDefinition.steps.find((s) => s.id === 'general-export-pdf');
    expect(exportPdfStep).toBeDefined();
    expect(exportPdfStep?.targetSelector).toBe('[data-tour-id="export-pdf-btn"]');
  });

  it('sawTourDefinition memenuhi kriteria 8 step eksplisit, klik tab SAW, klik stepper, dan required hover sel', async () => {
    const { sawTourDefinition, resetSawTourTracking, isSawHoverSatisfied } = await import('@/core/tour/sawTourSteps');
    const { useUiStore } = await import('@/store/useUiStore');

    expect(sawTourDefinition.steps.length).toBe(8);

    const tabStep = sawTourDefinition.steps.find((s) => s.id === 'saw-click-tab');
    expect(tabStep).toBeDefined();
    expect(tabStep?.requiredAction).toBeDefined();

    const step2Btn = sawTourDefinition.steps.find((s) => s.id === 'saw-click-step-2');
    expect(step2Btn).toBeDefined();
    expect(step2Btn?.requiredAction).toBeDefined();

    const hoverStep = sawTourDefinition.steps.find((s) => s.id === 'saw-hover-inspector');
    expect(hoverStep).toBeDefined();
    expect(hoverStep?.requiredAction).toBeDefined();
    expect(hoverStep?.placement).toBe('right');

    resetSawTourTracking();
    useUiStore.getState().setHoveredCell(null);
    expect(isSawHoverSatisfied()).toBe(false);

    hoverStep?.preNavigate?.();
    expect(isSawHoverSatisfied()).toBe(false);

    useUiStore.getState().setHoveredCell('saw-alt1-crit1-NORMALIZED');
    expect(isSawHoverSatisfied()).toBe(true);

    useUiStore.getState().setHoveredCell(null);
    expect(isSawHoverSatisfied()).toBe(true);
  });

  it('wpTourDefinition memenuhi kriteria 6 step eksplisit, klik tab WP, dan required zero-guard trigger & fix', async () => {
    const { wpTourDefinition, resetWpTourTracking, isWpZeroGuardSatisfied } = await import('@/core/tour/wpTourSteps');

    expect(wpTourDefinition.steps.length).toBe(6);

    const tabStep = wpTourDefinition.steps.find((s) => s.id === 'wp-click-tab');
    expect(tabStep).toBeDefined();
    expect(tabStep?.requiredAction).toBeDefined();

    const zeroGuardStep = wpTourDefinition.steps.find((s) => s.id === 'wp-zero-guard-step');
    expect(zeroGuardStep).toBeDefined();
    expect(zeroGuardStep?.requiredAction).toBeDefined();

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

    expect(isWpZeroGuardSatisfied(normalState)).toBe(false);

    zeroGuardStep?.preNavigate?.();

    expect(isWpZeroGuardSatisfied(normalState)).toBe(false);

    const violatedState: DecisiProjectState = {
      ...normalState,
      alternatives: [
        { id: 'a1', name: 'Alt 1', values: { c_cost: 0, c_ben: 80 } },
      ],
    };
    expect(isWpZeroGuardSatisfied(violatedState)).toBe(false);

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

  it('resetOnBack dan onLeave pada step tour mereset state UI dengan benar', async () => {
    const { useUiStore } = await import('@/store/useUiStore');
    const { sawTourDefinition } = await import('@/core/tour/sawTourSteps');
    const { wpTourDefinition } = await import('@/core/tour/wpTourSteps');

    const glossaryStep = generalTourDefinition.steps.find((s) => s.id === 'general-glossary');
    useUiStore.getState().openGlossary();
    expect(useUiStore.getState().isGlossaryOpen).toBe(true);

    glossaryStep?.onLeave?.();
    expect(useUiStore.getState().isGlossaryOpen).toBe(false);

    useUiStore.getState().openGlossary();
    expect(useUiStore.getState().isGlossaryOpen).toBe(true);
    glossaryStep?.resetOnBack?.();
    expect(useUiStore.getState().isGlossaryOpen).toBe(false);

    const critStep = generalTourDefinition.steps.find((s) => s.id === 'general-open-criteria');
    useUiStore.getState().setActiveEditorSection('criteria');
    expect(useUiStore.getState().activeEditorSection).toBe('criteria');
    critStep?.resetOnBack?.();
    expect(useUiStore.getState().activeEditorSection).toBe('matrix');

    const sawStep2 = sawTourDefinition.steps.find((s) => s.id === 'saw-click-step-2');
    useUiStore.getState().setSawActiveStep(2);
    expect(useUiStore.getState().sawActiveStep).toBe(2);
    sawStep2?.resetOnBack?.();
    expect(useUiStore.getState().sawActiveStep).toBe(1);

    const wpStep2 = wpTourDefinition.steps.find((s) => s.id === 'wp-click-step-2');
    useUiStore.getState().setWpActiveStep(2);
    expect(useUiStore.getState().wpActiveStep).toBe(2);
    wpStep2?.resetOnBack?.();
    expect(useUiStore.getState().wpActiveStep).toBe(1);
  });

  it('startTour mengamankan data riil user (stash) dan memulihkannya saat tour selesai atau diskip', async () => {
    const { useProjectStore } = await import('@/store/useProjectStore');
    
    const realUserState: DecisiProjectState = {
      title: 'Proyek Riil Vendor 2026',
      activeMethod: 'SAW',
      criteria: [
        { id: 'crit_real', name: 'Kualitas Produk', type: 'BENEFIT', weight: 0.7, normalizedWeight: 0.7 },
      ],
      alternatives: [
        { id: 'alt_real', name: 'Vendor A', values: { crit_real: 95 } },
      ],
    };
    useProjectStore.getState().loadProjectState(realUserState);

    useTourStore.getState().startTour('saw');
    expect(useTourStore.getState().stashedProjectState).not.toBeNull();
    expect(useTourStore.getState().stashedProjectState?.title).toBe('Proyek Riil Vendor 2026');

    const { CASE_TEMPLATES } = await import('@/core/constants/caseTemplates');
    useProjectStore.getState().loadProjectState(CASE_TEMPLATES[0].state);
    expect(useProjectStore.getState().title).not.toBe('Proyek Riil Vendor 2026');

    useTourStore.getState().skipTour();
    expect(useTourStore.getState().stashedProjectState).toBeNull();
    expect(useProjectStore.getState().title).toBe('Proyek Riil Vendor 2026');
    expect(useProjectStore.getState().criteria[0].name).toBe('Kualitas Produk');
    expect(useProjectStore.getState().alternatives[0].name).toBe('Vendor A');
  });

  it('topsisTourDefinition memiliki 7 step, tab click, stepper jumps, dan required radar hover', async () => {
    const { topsisTourDefinition, resetTopsisTourTracking, markTopsisHover, isTopsisHoverSatisfied } = await import(
      '@/core/tour/topsisTourSteps'
    );
    const { useUiStore } = await import('@/store/useUiStore');

    expect(topsisTourDefinition.steps.length).toBe(7);

    const tabStep = topsisTourDefinition.steps.find((s) => s.id === 'topsis-click-tab');
    expect(tabStep).toBeDefined();
    expect(tabStep?.requiredAction).toBeDefined();

    useUiStore.getState().setActiveTab('SAW');
    expect(tabStep!.requiredAction!.isSatisfied()).toBe(false);
    useUiStore.getState().setActiveTab('TOPSIS');
    expect(tabStep!.requiredAction!.isSatisfied()).toBe(true);

    const step2 = topsisTourDefinition.steps.find((s) => s.id === 'topsis-click-step-2');
    expect(step2).toBeDefined();
    expect(step2?.requiredAction).toBeDefined();
    useUiStore.getState().setTopsisActiveStep(1);
    expect(step2!.requiredAction!.isSatisfied()).toBe(false);
    useUiStore.getState().setTopsisActiveStep(2);
    expect(step2!.requiredAction!.isSatisfied()).toBe(true);

    const step3 = topsisTourDefinition.steps.find((s) => s.id === 'topsis-click-step-3');
    expect(step3).toBeDefined();
    expect(step3?.requiredAction).toBeDefined();
    useUiStore.getState().setTopsisActiveStep(2);
    expect(step3!.requiredAction!.isSatisfied()).toBe(false);
    useUiStore.getState().setTopsisActiveStep(3);
    expect(step3!.requiredAction!.isSatisfied()).toBe(true);

    const radarStep = topsisTourDefinition.steps.find((s) => s.id === 'topsis-radar-chart');
    expect(radarStep).toBeDefined();
    expect(radarStep?.requiredAction).toBeDefined();

    resetTopsisTourTracking();
    expect(isTopsisHoverSatisfied()).toBe(false);

    radarStep?.preNavigate?.();
    expect(isTopsisHoverSatisfied()).toBe(false);

    markTopsisHover();
    expect(isTopsisHoverSatisfied()).toBe(true);

    step2?.resetOnBack?.();
    expect(useUiStore.getState().topsisActiveStep).toBe(1);
  });

  it('ahpTourDefinition memiliki 7 step, tab click, required slider CR change, dan audit konsistensi', async () => {
    const { ahpTourDefinition, resetAhpTourTracking, isAhpCrSatisfied } = await import('@/core/tour/ahpTourSteps');
    const { useUiStore } = await import('@/store/useUiStore');

    expect(ahpTourDefinition.steps.length).toBe(7);

    const tabStep = ahpTourDefinition.steps.find((s) => s.id === 'ahp-click-tab');
    expect(tabStep).toBeDefined();
    expect(tabStep?.requiredAction).toBeDefined();

    useUiStore.getState().setActiveTab('SAW');
    expect(tabStep!.requiredAction!.isSatisfied()).toBe(false);
    useUiStore.getState().setActiveTab('AHP');
    expect(tabStep!.requiredAction!.isSatisfied()).toBe(true);

    const sliderStep = ahpTourDefinition.steps.find((s) => s.id === 'ahp-slider-action');
    expect(sliderStep).toBeDefined();
    expect(sliderStep?.requiredAction).toBeDefined();

    useUiStore.getState().setAhpCurrentCr(0.045);
    resetAhpTourTracking();
    sliderStep?.preNavigate?.();
    expect(isAhpCrSatisfied()).toBe(false);

    useUiStore.getState().setAhpCurrentCr(0.12);
    expect(isAhpCrSatisfied()).toBe(true);

    const step3 = ahpTourDefinition.steps.find((s) => s.id === 'ahp-click-step-3');
    expect(step3).toBeDefined();
    expect(step3?.requiredAction).toBeDefined();
    useUiStore.getState().setAhpActiveStep(1);
    expect(step3!.requiredAction!.isSatisfied()).toBe(false);
    useUiStore.getState().setAhpActiveStep(3);
    expect(step3!.requiredAction!.isSatisfied()).toBe(true);

    const gaugeStep = ahpTourDefinition.steps.find((s) => s.id === 'ahp-consistency-gauge');
    expect(gaugeStep?.targetSelector).toBe('[data-tour-id="ahp-consistency-gauge"]');

    const correctionStep = ahpTourDefinition.steps.find((s) => s.id === 'ahp-correction-guide');
    expect(correctionStep?.targetSelector).toBe('[data-tour-id="ahp-consistency-panel"]');

    const applyStep = ahpTourDefinition.steps.find((s) => s.id === 'ahp-apply-weights');
    expect(applyStep?.targetSelector).toBe('[data-tour-id="ahp-apply-btn"]');
  });

  it('storyTourDefinition memiliki 6 step, tab click, required template click, dan preview section', async () => {
    const { storyTourDefinition, resetStoryTourTracking, markStoryTemplateClicked, isStoryTemplateSatisfied } =
      await import('@/core/tour/storyTourSteps');
    const { useUiStore } = await import('@/store/useUiStore');

    expect(storyTourDefinition.steps.length).toBe(6);

    const tabStep = storyTourDefinition.steps.find((s) => s.id === 'story-click-tab');
    expect(tabStep).toBeDefined();
    expect(tabStep?.requiredAction).toBeDefined();

    useUiStore.getState().setActiveTab('SAW');
    expect(tabStep!.requiredAction!.isSatisfied()).toBe(false);
    useUiStore.getState().setActiveTab('AUTO');
    expect(tabStep!.requiredAction!.isSatisfied()).toBe(true);

    const templateStep = storyTourDefinition.steps.find((s) => s.id === 'story-try-example-btn');
    expect(templateStep).toBeDefined();
    expect(templateStep?.requiredAction).toBeDefined();

    resetStoryTourTracking();
    expect(isStoryTemplateSatisfied()).toBe(false);

    markStoryTemplateClicked();
    expect(isStoryTemplateSatisfied()).toBe(true);
    expect(useUiStore.getState().storyMode).toBe('form');

    templateStep?.resetOnBack?.();
    expect(isStoryTemplateSatisfied()).toBe(false);
    expect(useUiStore.getState().storyMode).toBe('story');

    const previewStep = storyTourDefinition.steps.find((s) => s.id === 'story-preview-section');
    expect(previewStep?.targetSelector).toBe('[data-tour-id="story-preview-section"]');

    const modeStep = storyTourDefinition.steps.find((s) => s.id === 'story-mode-switcher');
    expect(modeStep?.targetSelector).toBe('[data-tour-id="story-mode-switcher"]');

    const commitStep = storyTourDefinition.steps.find((s) => s.id === 'story-commit-btn');
    expect(commitStep?.targetSelector).toBe('[data-tour-id="story-commit-btn"]');
  });
});

