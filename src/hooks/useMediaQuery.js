import { useState, useEffect } from 'react';
import { computeWorldLayout } from '../lib/worldLayout';

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
 * Breakpoint helper hook - Single Source of Truth derived directly from computeWorldLayout.
 * Synchronized across resize, orientation change, and visualViewport.
 */
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState(() => {
    if (typeof window === 'undefined') return { isMobile: false, isDesktop: true };
    const layout = computeWorldLayout(window.innerWidth, window.innerHeight);
    return { isMobile: !layout.isDesktop, isDesktop: layout.isDesktop };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUpdate = () => {
      const layout = computeWorldLayout(window.innerWidth, window.innerHeight);
      setDeviceType({ isMobile: !layout.isDesktop, isDesktop: layout.isDesktop });
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('orientationchange', handleUpdate);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleUpdate);
    }

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('orientationchange', handleUpdate);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleUpdate);
      }
    };
  }, []);

  return deviceType;
}

export default useMediaQuery;
