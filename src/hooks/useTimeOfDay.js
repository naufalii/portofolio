import { useState, useEffect } from 'react';

/**
 * Time phases definition according to Section 5:
 * - 05:00–07:00: dawn (fajar)
 * - 07:00–16:00: day (siang)
 * - 16:00–18:00: dusk (senja)
 * - 18:00–05:00: night (malam)
 */
export const TIME_PHASES = {
  DAWN: 'dawn',
  DAY: 'day',
  DUSK: 'dusk',
  NIGHT: 'night',
};

export const TIME_CONFIG = {
  dawn: {
    label: 'Fajar',
    icon: '🌅',
    skyTop: '#8FC6E8',
    skyBottom: '#F2A66B',
    particle: 'dandelion',
    stars: false,
    ambientLight: 0.85,
  },
  day: {
    label: 'Siang',
    icon: '☀️',
    skyTop: '#68B0DE',
    skyBottom: '#8FC6E8',
    particle: 'dandelion',
    stars: false,
    ambientLight: 1.0,
  },
  dusk: {
    label: 'Senja',
    icon: '🌇',
    skyTop: '#785A7E',
    skyBottom: '#F2A66B',
    particle: 'dandelion',
    stars: true,
    ambientLight: 0.75,
  },
  night: {
    label: 'Malam',
    icon: '🌙',
    skyTop: '#0F1626',
    skyBottom: '#1F2A44',
    particle: 'firefly',
    stars: true,
    ambientLight: 0.45,
  },
};

/**
 * Calculate the time phase from a given Date object.
 * @param {Date} date
 * @returns {'dawn' | 'day' | 'dusk' | 'night'}
 */
export function getPhaseFromDate(date = new Date()) {
  const hours = date.getHours() + date.getMinutes() / 60;
  if (hours >= 5 && hours < 7) {
    return TIME_PHASES.DAWN;
  } else if (hours >= 7 && hours < 16) {
    return TIME_PHASES.DAY;
  } else if (hours >= 16 && hours < 18) {
    return TIME_PHASES.DUSK;
  } else {
    return TIME_PHASES.NIGHT;
  }
}

/**
 * Hook to manage time of day and optional manual test override.
 */
export function useTimeOfDay(overridePhase = null) {
  const [phase, setPhase] = useState(() => getPhaseFromDate());
  const [activeOverride, setActiveOverride] = useState(overridePhase);

  useEffect(() => {
    if (activeOverride) return;

    const interval = setInterval(() => {
      setPhase(getPhaseFromDate());
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [activeOverride]);

  const currentPhase = activeOverride || phase;

  return {
    phase: currentPhase,
    config: TIME_CONFIG[currentPhase],
    setManualOverride: setActiveOverride,
    isManual: Boolean(activeOverride),
  };
}

export default useTimeOfDay;
