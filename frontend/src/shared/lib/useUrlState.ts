import { useCallback } from 'react';

export function useUrlState() {
  const params = new URLSearchParams(window.location.search);

  const getParam = useCallback((key: string, defaultValue = ''): string => {
    const p = new URLSearchParams(window.location.search);
    return p.get(key) ?? defaultValue;
  }, []);

  const getNumParam = useCallback((key: string, defaultValue?: number): number | undefined => {
    const p = new URLSearchParams(window.location.search);
    const val = p.get(key);
    if (!val) return defaultValue;
    const parsed = Number(val);
    return isNaN(parsed) ? defaultValue : parsed;
  }, []);

  const setParam = useCallback((key: string, value: string | number | null) => {
    const p = new URLSearchParams(window.location.search);
    if (value === null || value === undefined || value === '') {
      p.delete(key);
    } else {
      p.set(key, String(value));
    }
    const newUrl = `${window.location.pathname}?${p.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, []);

  const setParams = useCallback((updates: Record<string, string | number | null>) => {
    const p = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        p.delete(key);
      } else {
        p.set(key, String(value));
      }
    });
    const newUrl = `${window.location.pathname}?${p.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, []);

  return {
    params,
    getParam,
    getNumParam,
    setParam,
    setParams,
  };
}
