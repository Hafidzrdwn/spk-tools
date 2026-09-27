import { useRef, useEffect, useCallback, useMemo } from 'react';

/**
 * Hook generik untuk mendebounce pemanggilan callback function.
 * Memastikan callback selalu memegang state terbaru tanpa re-creating timer secara berlebihan.
 *
 * @param callback Fungsi yang ingin dieksekusi secara ter-debounce
 * @param delay Jeda waktu tunggu dalam milidetik (default: 250ms)
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay = 250
): ((...args: Parameters<T>) => void) & { cancel: () => void; flush: () => void } {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const argsRef = useRef<Parameters<T> | null>(null);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      argsRef.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current && argsRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      callbackRef.current(...argsRef.current);
      argsRef.current = null;
    }
  }, []);

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      argsRef.current = args;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        callbackRef.current(...args);
        argsRef.current = null;
      }, delay);
    },
    [delay]
  );

  useEffect(() => cancel, [cancel]);

  return useMemo(() => Object.assign(debounced, { cancel, flush }), [debounced, cancel, flush]);
}

export default useDebouncedCallback;
