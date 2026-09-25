import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useTourStore } from '@/store/useTourStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useUiStore } from '@/store/useUiStore';
import type { TourDefinition } from '@/core/tour/types';

// ─── Spotlight geometry ───────────────────────────────────────────────────────
interface SpotRect { top: number; left: number; width: number; height: number; }

const PAD = 12;
const POLL_INTERVAL_MS = 80;
const POLL_MAX_ATTEMPTS = 25; // ~2s max
const SCROLL_SETTLE_MS = 400; // tunggu smooth scroll selesai sebelum ukur posisi

function queryEl(selector: string): Element | null {
  if (!selector || selector === 'body') return null;
  return document.querySelector(selector);
}

function getSpotRect(selector: string): SpotRect | null {
  const el = queryEl(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
}

// ─── 4-Strip Spotlight Overlay ───────────────────────────────────────────────
const BG = 'rgba(15,23,42,0.60)';

const SpotlightOverlay: React.FC<{ spot: SpotRect | null; onSkip: () => void }> = ({ spot, onSkip }) => {
  const base: React.CSSProperties = { position: 'fixed', zIndex: 9990, background: BG, cursor: 'default' };

  if (!spot) {
    return <div style={{ ...base, inset: 0 }} onClick={onSkip} aria-hidden="true" />;
  }

  const { top, left, width, height } = spot;

  return (
    <div aria-hidden="true">
      <div style={{ ...base, top: 0, left: 0, right: 0, height: top }} onClick={onSkip} />
      <div style={{ ...base, top: top + height, left: 0, right: 0, bottom: 0 }} onClick={onSkip} />
      <div style={{ ...base, top, left: 0, width: left, height }} onClick={onSkip} />
      <div style={{ ...base, top, left: left + width, right: 0, height }} onClick={onSkip} />
      {/* Border pulse — pointer-events:none agar tidak blokir klik target */}
      <div
        style={{
          position: 'fixed', zIndex: 9991,
          top, left, width, height,
          border: '2.5px solid rgba(99,102,241,0.9)',
          borderRadius: 10,
          pointerEvents: 'none',
          animation: 'tour-spot-pulse 2s ease-in-out infinite',
          transition: 'top 0.3s cubic-bezier(.4,0,.2,1), left 0.3s cubic-bezier(.4,0,.2,1), width 0.3s, height 0.3s',
        }}
      />
    </div>
  );
};

// ─── Tooltip placement with Collision Detection & Safe Gap ─────────────────────
function calcTooltipPos(
  spot: SpotRect | null,
  preferredPlacement: 'top' | 'bottom' | 'left' | 'right' | 'center' = 'bottom',
  tooltipW = 360,
  tooltipH = 310
): React.CSSProperties {
  if (!spot || preferredPlacement === 'center') {
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 9999,
      width: tooltipW,
      maxWidth: 'calc(100vw - 32px)',
    };
  }

  const W = window.innerWidth;
  const H = window.innerHeight;
  const gap = 16;
  const clampedW = Math.min(tooltipW, W - gap * 2);

  // Helper untuk mengecek apakah posisi tooltip menimpa target spotlight
  const overlapsSpot = (t: number, l: number, w: number, h: number) => {
    return !(
      l + w <= spot.left ||
      l >= spot.left + spot.width ||
      t + h <= spot.top ||
      t >= spot.top + spot.height
    );
  };

  // Urutan fallback penempatan berdasarkan preferensi step
  const placementsToTry: Array<'top' | 'bottom' | 'left' | 'right'> = [
    preferredPlacement,
    ...(preferredPlacement === 'right'
      ? ['left', 'bottom', 'top']
      : preferredPlacement === 'left'
      ? ['right', 'bottom', 'top']
      : preferredPlacement === 'top'
      ? ['bottom', 'right', 'left']
      : ['top', 'right', 'left']),
  ] as Array<'top' | 'bottom' | 'left' | 'right'>;

  for (const pl of placementsToTry) {
    let top = 0;
    let left = 0;

    if (pl === 'bottom') {
      top = spot.top + spot.height + gap;
      left = Math.max(gap, Math.min(spot.left + spot.width / 2 - clampedW / 2, W - clampedW - gap));
      if (top + tooltipH <= H - gap && !overlapsSpot(top, left, clampedW, tooltipH)) {
        return { position: 'fixed', top, left, zIndex: 9999, width: clampedW };
      }
    } else if (pl === 'top') {
      top = spot.top - tooltipH - gap;
      left = Math.max(gap, Math.min(spot.left + spot.width / 2 - clampedW / 2, W - clampedW - gap));
      if (top >= gap && !overlapsSpot(top, left, clampedW, tooltipH)) {
        return { position: 'fixed', top, left, zIndex: 9999, width: clampedW };
      }
    } else if (pl === 'right') {
      left = spot.left + spot.width + gap;
      top = Math.max(gap, Math.min(spot.top + spot.height / 2 - tooltipH / 2, H - tooltipH - gap));
      if (left + clampedW <= W - gap && !overlapsSpot(top, left, clampedW, tooltipH)) {
        return { position: 'fixed', top, left, zIndex: 9999, width: clampedW };
      }
    } else if (pl === 'left') {
      left = spot.left - clampedW - gap;
      top = Math.max(gap, Math.min(spot.top + spot.height / 2 - tooltipH / 2, H - tooltipH - gap));
      if (left >= gap && !overlapsSpot(top, left, clampedW, tooltipH)) {
        return { position: 'fixed', top, left, zIndex: 9999, width: clampedW };
      }
    }
  }

  // Fallback jika semua sisi sempit: pilih sisi vertikal yang paling luas tanpa menimpa
  const spaceBelow = H - (spot.top + spot.height);
  const spaceAbove = spot.top;
  if (spaceBelow >= spaceAbove) {
    const top = Math.min(spot.top + spot.height + gap, H - tooltipH - gap);
    const left = Math.max(gap, Math.min(spot.left + spot.width / 2 - clampedW / 2, W - clampedW - gap));
    return { position: 'fixed', top: Math.max(gap, top), left, zIndex: 9999, width: clampedW };
  } else {
    const top = Math.max(gap, spot.top - tooltipH - gap);
    const left = Math.max(gap, Math.min(spot.left + spot.width / 2 - clampedW / 2, W - clampedW - gap));
    return { position: 'fixed', top, left, zIndex: 9999, width: clampedW };
  }
}

// ─── Main TourRunner ──────────────────────────────────────────────────────────
export interface TourRunnerProps {
  tours?: Record<string, TourDefinition>;
}

export const TourRunner: React.FC<TourRunnerProps> = ({ tours = {} }) => {
  const { activeTourId, activeStepIndex, goToNextStep, goToPrevStep, skipTour, finishTour, stashedProjectState } = useTourStore();
  const projectState = useProjectStore();
  // Subscribe ke state UI agar perubahan drawer/tab/inspector memicu re-evaluasi requiredAction secara reaktif
  useUiStore();

  const [spot, setSpot] = useState<SpotRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<React.CSSProperties>({});
  const [stepReady, setStepReady] = useState(false);
  const rafRef = useRef<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentTour = activeTourId ? tours[activeTourId] : null;
  const currentStep = currentTour?.steps[activeStepIndex];
  const totalSteps = currentTour?.steps.length ?? 0;
  const isLastStep = activeStepIndex >= totalSteps - 1;
  const isFirstStep = activeStepIndex === 0;
  const requiredAction = currentStep?.requiredAction;
  const isSatisfied = requiredAction ? requiredAction.isSatisfied(projectState) : true;

  // Membersihkan modal/drawer/inspector terbuka agar tidak menutupi tampilan step berikutnya/sebelumnya
  const cleanupOverlays = useCallback((targetSelector?: string) => {
    const isTargetInsideGlossary = targetSelector
      ? targetSelector.includes('glossary-drawer') || targetSelector.includes('glossary-content')
      : false;
    if (!isTargetInsideGlossary) {
      useUiStore.getState().closeGlossary();
    }
    useUiStore.getState().setInspectorOpen(false);
    useUiStore.getState().setHoveredCell(null);
  }, []);

  const measure = useCallback(() => {
    if (!currentStep) return;
    const s = getSpotRect(currentStep.targetSelector);
    setSpot(s);
    setTooltipPos(calcTooltipPos(s, currentStep.placement));
  }, [currentStep]);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      cleanupOverlays();
    };
  }, [cleanupOverlays]);

  // Saat step berubah: auto-cleanup overlay luar → preNavigate → poll DOM → scroll → ukur
  useEffect(() => {
    if (!activeTourId || !currentStep) return;

    setStepReady(false);

    // Auto-cleanup overlay jika target step ini berada di luar overlay
    const isTargetInsideGlossary =
      currentStep.targetSelector?.includes('glossary-drawer') ||
      currentStep.targetSelector?.includes('glossary-content');
    if (!isTargetInsideGlossary && useUiStore.getState().isGlossaryOpen) {
      useUiStore.getState().closeGlossary();
    }

    // 1. Jalankan preNavigate (jika ada hook inisialisasi)
    currentStep.preNavigate?.();

    // Bersihkan interval/timer sebelumnya
    if (pollRef.current) clearInterval(pollRef.current);
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);

    const isCenter = !currentStep.targetSelector || currentStep.targetSelector === 'body';

    if (isCenter) {
      setSpot(null);
      setTooltipPos(calcTooltipPos(null, 'center'));
      setStepReady(true);
      return;
    }

    // 2. Poll sampai elemen muncul di DOM
    let attempts = 0;
    pollRef.current = setInterval(() => {
      attempts++;
      const el = queryEl(currentStep.targetSelector);

      if (el) {
        clearInterval(pollRef.current!);

        // 3. Smooth scroll ke elemen target
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

        // 4. Tunggu scroll selesai, baru ukur posisi spotlight & tooltip
        scrollTimerRef.current = setTimeout(() => {
          const s = getSpotRect(currentStep.targetSelector);
          setSpot(s);
          setTooltipPos(calcTooltipPos(s, currentStep.placement));
          setStepReady(true);
        }, SCROLL_SETTLE_MS);

      } else if (attempts >= POLL_MAX_ATTEMPTS) {
        clearInterval(pollRef.current!);
        setSpot(null);
        setTooltipPos(calcTooltipPos(null, 'center'));
        setStepReady(true);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTourId, activeStepIndex]);

  // Re-measure on scroll/resize (setelah step ready)
  useEffect(() => {
    if (!activeTourId || !stepReady) return;
    const handler = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activeTourId, stepReady, measure]);

  if (!activeTourId || !currentTour || !currentStep) return null;

  const handleNext = () => {
    currentStep?.onLeave?.();
    const nextIndex = activeStepIndex + 1;
    const nextStep = currentTour?.steps[nextIndex];
    cleanupOverlays(nextStep?.targetSelector);

    if (isLastStep) {
      cleanupOverlays();
      finishTour(activeTourId);
    } else {
      goToNextStep();
    }
  };

  const handlePrev = () => {
    if (isFirstStep) return;
    currentStep?.onLeave?.();

    const prevIndex = activeStepIndex - 1;
    const prevStep = currentTour?.steps[prevIndex];

    cleanupOverlays(prevStep?.targetSelector);
    prevStep?.resetOnBack?.();
    goToPrevStep();
  };

  const handleSkip = () => {
    currentStep?.onLeave?.();
    cleanupOverlays();
    skipTour();
  };

  return createPortal(
    <>
      {/* Keyframes injected sekali — aman didefinisikan di sini */}
      <style>{`
        @keyframes tour-spot-pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(99,102,241,0.12); }
          50% { box-shadow: 0 0 0 8px rgba(99,102,241,0.25); }
        }
      `}</style>

      {/* Loading indicator saat polling / scroll settling */}
      <AnimatePresence>
        {!stepReady && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 9999, pointerEvents: 'none' }}
          >
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/95 rounded-full shadow-xl border border-slate-200 backdrop-blur-sm">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
              <span className="text-[11px] text-slate-500 font-medium">Memuat langkah…</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay + spotlight */}
      {stepReady && <SpotlightOverlay spot={spot} onSkip={handleSkip} />}

      {/* Tooltip dengan animasi masuk per step */}
      <AnimatePresence mode="wait">
        {stepReady && (
          <motion.div
            key={`step-${activeStepIndex}`}
            style={tooltipPos}
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="pointer-events-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden">

              {/* Header */}
              <div className="flex items-start justify-between px-4 pt-3.5 pb-2.5 border-b border-slate-100 bg-linear-to-r from-indigo-50/70 to-white gap-3">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold shrink-0 mt-0.5 shadow-2xs">
                    {activeStepIndex + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug break-words">
                    {currentStep.title}
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2 pt-0.5">
                  <span className="text-[10px] text-slate-400 font-mono font-medium">{activeStepIndex + 1}/{totalSteps}</span>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    aria-label="Tutup tour"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Simulation Mode Indicator jika data asli user dicadangkan */}
              {stashedProjectState && (
                <div className="mx-4 mt-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100/80 text-[11px] text-indigo-700 leading-tight">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>
                    <strong>Mode Simulasi:</strong> Data proyek asli Anda aman dan otomatis dikembalikan saat tour ditutup.
                  </span>
                </div>
              )}

              {/* Body */}
              <div className="px-4 py-3 space-y-2.5">
                <p className="text-xs text-slate-600 leading-relaxed">{currentStep.content}</p>

                {requiredAction && !isSatisfied && (
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-amber-800">Aksi Diperlukan</p>
                      <p className="text-[11px] text-amber-700 leading-snug mt-0.5">{requiredAction.description}</p>
                    </div>
                  </div>
                )}

                {requiredAction && isSatisfied && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <p className="text-[11px] font-semibold text-emerald-800">Berhasil! Klik Lanjut untuk melanjutkan.</p>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 pb-3.5 pt-1 space-y-2.5">
                {/* Progress dots */}
                <div className="flex items-center justify-center gap-1">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <span
                      key={i}
                      className={`block rounded-full transition-all duration-300 ${
                        i === activeStepIndex ? 'w-5 h-1.5 bg-indigo-600'
                        : i < activeStepIndex ? 'w-1.5 h-1.5 bg-indigo-300'
                        : 'w-1.5 h-1.5 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigasi */}
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={isFirstStep}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 text-xs font-medium transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Kembali
                  </button>

                  {(!requiredAction || isSatisfied) ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      {isLastStep ? 'Selesai 🎉' : 'Lanjut'}
                      {!isLastStep && <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Selesaikan aksi dulu…</span>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
};

export default TourRunner;
