import { useEffect, useRef } from 'react';
import { useUiStore } from '@/store/useUiStore';
import type { MethodId } from '@/types/domain';

const VALID_METHOD_MAP: Record<string, MethodId> = {
  saw: 'SAW',
  wp: 'WP',
  topsis: 'TOPSIS',
  ahp: 'AHP',
  compare: 'COMPARE',
  comparison: 'COMPARE',
  auto: 'AUTO',
  story: 'AUTO',
};

export function useUrlTabSync() {
  const activeTab = useUiStore((s) => s.activeTab);
  const setActiveTab = useUiStore((s) => s.setActiveTab);
  const isInitialized = useRef(false);

  // 1. Baca ?tab= dari URL saat mount pertama kali
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get('tab');

      if (tabParam) {
        const normalized = tabParam.trim().toLowerCase();
        const matchedMethod = VALID_METHOD_MAP[normalized];
        if (matchedMethod && matchedMethod !== activeTab) {
          setActiveTab(matchedMethod);
        }
      }
    } catch {
      // Abaikan jika URL tidak bisa di-parse
    }

    isInitialized.current = true;
  }, [setActiveTab]);

  // 2. Sinkronisasi activeTab ke URL saat terjadi perubahan (menggunakan replaceState)
  useEffect(() => {
    if (typeof window === 'undefined' || !isInitialized.current) return;

    const currentUrl = new URL(window.location.href);
    const currentTabParam = currentUrl.searchParams.get('tab')?.toLowerCase();
    const targetTabParam = activeTab.toLowerCase();

    if (currentTabParam !== targetTabParam) {
      currentUrl.searchParams.set('tab', targetTabParam);
      window.history.replaceState(null, '', currentUrl.pathname + currentUrl.search + currentUrl.hash);
    }
  }, [activeTab]);
}

export default useUrlTabSync;
