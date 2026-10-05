import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = useUiStore((s) => s.activeTab);
  const setActiveTab = useUiStore((s) => s.setActiveTab);
  const isInitialized = useRef(false);

  // 1. Baca ?tab= dari URL saat pertama kali mount di /board
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const normalized = tabParam.trim().toLowerCase();
      const matchedMethod = VALID_METHOD_MAP[normalized];
      if (matchedMethod && matchedMethod !== activeTab) {
        setActiveTab(matchedMethod);
      }
    } else {
      setSearchParams({ tab: activeTab.toLowerCase() }, { replace: true });
    }
    isInitialized.current = true;
  }, []);

  // 2. Sinkronkan ke URL saat activeTab berubah
  useEffect(() => {
    if (!isInitialized.current) return;
    const currentTab = searchParams.get('tab')?.toLowerCase();
    const targetTab = activeTab.toLowerCase();
    if (currentTab !== targetTab) {
      setSearchParams({ tab: targetTab }, { replace: true });
    }
  }, [activeTab, searchParams, setSearchParams]);
}

export default useUrlTabSync;
