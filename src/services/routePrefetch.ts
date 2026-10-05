/**
 * Centralized Route & Chunk Prefetching Service
 * Provides instant zero-latency transitions across SPA pages.
 */

// Route chunk importers
export const prefetchRoute = {
  landing: () => {
    import('@/features/landing/LandingPage');
  },
  board: (tab?: string) => {
    import('@/features/workboard/WorkboardPage');
    if (!tab || tab === 'saw') import('@/features/saw/SawTab');
    if (tab === 'wp') import('@/features/wp/WpTab');
    if (tab === 'topsis') import('@/features/topsis/TopsisTab');
    if (tab === 'ahp') import('@/features/ahp/AhpTab');
    if (tab === 'comparison') import('@/features/comparison/ComparisonTab');
    if (tab === 'story') import('@/features/story-to-matrix/StoryToMatrixTab');
  },
  review: () => {
    import('@/features/community/CommunityLayout');
    import('@/features/community/ReviewsPage');
  },
  analytics: () => {
    import('@/features/community/CommunityLayout');
    import('@/features/community/AnalyticsPage');
  },
};

/**
 * Schedule background prefetching during browser idle time
 */
export function scheduleIdlePrefetch(
  route: keyof typeof prefetchRoute,
  tab?: string,
  delay = 1200
): () => void {
  if (typeof window === 'undefined') return () => {};

  if ('requestIdleCallback' in window) {
    const handle = (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
      .requestIdleCallback(() => prefetchRoute[route](tab), { timeout: delay });
    return () => {
      if ('cancelIdleCallback' in window) {
        (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(handle);
      }
    };
  } else {
    const timer = setTimeout(() => prefetchRoute[route](tab), Math.min(delay, 500));
    return () => clearTimeout(timer);
  }
}

/**
 * Schedule prefetch for all remaining secondary routes while user is idle
 */
export function scheduleAllRemainingPrefetch(exclude: keyof typeof prefetchRoute) {
  const routes = (Object.keys(prefetchRoute) as Array<keyof typeof prefetchRoute>).filter(
    (r) => r !== exclude
  );

  const cleanups = routes.map((r, idx) =>
    scheduleIdlePrefetch(r, undefined, 1000 + idx * 600)
  );

  return () => {
    cleanups.forEach((c) => c());
  };
}
