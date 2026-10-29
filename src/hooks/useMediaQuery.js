import { useState, useEffect } from 'react';
import { DESKTOP_MIN_W, DESKTOP_MIN_H } from '../lib/worldLayout';

/**
 * Hook to match media queries reactively.
 * @param {string} query
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Breakpoint helper hooks based on D1 Single Source of Truth:
 * - isMobile: width < DESKTOP_MIN_W (1024px) OR height < DESKTOP_MIN_H (480px)
 * - isDesktop: width >= DESKTOP_MIN_W (1024px) AND height >= DESKTOP_MIN_H (480px)
 */
export function useDeviceType() {
  const isMobile = useMediaQuery(`(max-width: ${DESKTOP_MIN_W - 1}px), (max-height: ${DESKTOP_MIN_H - 1}px)`);
  const isDesktop = useMediaQuery(`(min-width: ${DESKTOP_MIN_W}px) and (min-height: ${DESKTOP_MIN_H}px)`);

  return { isMobile, isDesktop };
}

export default useMediaQuery;
