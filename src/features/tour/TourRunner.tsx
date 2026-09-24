import React, { useEffect, useMemo } from 'react';
import { Joyride, type Step, type TooltipRenderProps, type EventData, STATUS, ACTIONS } from 'react-joyride';
import { useTourStore } from '@/store/useTourStore';
import { useProjectStore } from '@/store/useProjectStore';
import type { TourDefinition, TourStep } from '@/core/tour/types';

export const DUMMY_TOURS: Record<string, TourDefinition> = {
  general: {
    id: 'general',
    title: 'Tour Fitur Umum DecisiGraph',
    steps: [
      { id: '1', targetSelector: 'body', title: 'Selamat Datang di Tour', content: 'Langkah pengantar tour.', placement: 'center' },
      {
        id: '2',
        targetSelector: 'body',
        title: 'Langkah Wajib: Tambah Kriteria',
        content: 'Silakan tambah 1 kriteria baru untuk melanjutkan.',
        placement: 'center',
        requiredAction: {
          description: 'Tambahkan kriteria baru sehingga jumlah kriteria >= 4.',
          isSatisfied: (state) => state.criteria.length >= 4,
        },
      },
      { id: '3', targetSelector: 'body', title: 'Tour Selesai!', content: 'Infrastruktur tour berhasil diuji.', placement: 'center' },
    ],
  },
};

const CustomTooltip: React.FC<TooltipRenderProps> = ({ index, step, isLastStep, tooltipProps }) => {
  const { skipTour, goToNextStep, finishTour, activeTourId } = useTourStore();
  const projectState = useProjectStore();
  const tourStep = step.data as TourStep | undefined;
  const requiredAction = tourStep?.requiredAction;
  const isSatisfied = requiredAction ? requiredAction.isSatisfied(projectState) : true;

  const handleNext = () => {
    if (isLastStep) {
      if (activeTourId) finishTour(activeTourId);
    } else {
      goToNextStep();
    }
  };

  return (
    <div {...tooltipProps} className="w-80 max-w-[90vw] p-4 bg-white rounded-2xl border border-slate-200 shadow-2xl space-y-3 z-9999">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <h4 className="text-sm font-bold text-slate-900 leading-snug">{step.title}</h4>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
          Langkah {index + 1}
        </span>
      </div>
      <div className="text-xs text-slate-600 leading-relaxed">{step.content}</div>
      {requiredAction && !isSatisfied && (
        <div className="p-2.5 rounded-xl bg-amber-50/80 border-2 border-dashed border-amber-400 text-amber-900 text-xs font-medium animate-pulse">
          <div className="font-bold text-[11px] text-amber-800">⚡ Aksi Wajib:</div>
          <p className="leading-snug text-[11px] mt-0.5">{requiredAction.description}</p>
        </div>
      )}
      {requiredAction && isSatisfied && (
        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-semibold">
          ✓ Aksi berhasil! Lanjut otomatis...
        </div>
      )}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <button type="button" onClick={skipTour} className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer">
          Lewati Tour
        </button>
        {(!requiredAction || isSatisfied) && (
          <button
            type="button"
            onClick={handleNext}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {isLastStep ? 'Selesai' : 'Lanjut'}
          </button>
        )}
      </div>
    </div>
  );
};

export interface TourRunnerProps {
  tours?: Record<string, TourDefinition>;
}

export const TourRunner: React.FC<TourRunnerProps> = ({ tours = DUMMY_TOURS }) => {
  const { activeTourId, activeStepIndex, goToNextStep, skipTour, finishTour } = useTourStore();
  const projectState = useProjectStore();

  const currentTour = activeTourId ? tours[activeTourId] : null;
  const currentStep = currentTour?.steps[activeStepIndex];
  const requiredAction = currentStep?.requiredAction;
  const isSatisfied = requiredAction ? requiredAction.isSatisfied(projectState) : true;

  useEffect(() => {
    if (!activeTourId || !requiredAction || !isSatisfied) return;
    const timer = setTimeout(() => {
      if (activeStepIndex >= (currentTour?.steps.length ?? 0) - 1) {
        finishTour(activeTourId);
      } else {
        goToNextStep();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isSatisfied, activeStepIndex, activeTourId, requiredAction, currentTour, finishTour, goToNextStep]);

  const joyrideSteps: Step[] = useMemo(() => {
    if (!currentTour) return [];
    return currentTour.steps.map((step) => ({
      target: step.targetSelector,
      title: step.title,
      content: step.content,
      placement: step.placement ?? 'center',
      disableBeacon: true,
      data: step,
    }));
  }, [currentTour]);

  if (!activeTourId || !currentTour) return null;

  return (
    <Joyride
      steps={joyrideSteps}
      stepIndex={activeStepIndex}
      run={Boolean(activeTourId && currentTour)}
      continuous
      tooltipComponent={CustomTooltip}
      onEvent={(data: EventData) => {
        if (data.status === STATUS.SKIPPED || data.action === ACTIONS.CLOSE) skipTour();
      }}
      styles={{ floater: { zIndex: 10000 }, overlay: { zIndex: 9998 } }}
    />
  );
};

export default TourRunner;
