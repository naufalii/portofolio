import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, animate } from 'motion/react';
import { WorldCanvas } from '../components/world/WorldCanvas';
import { Sprite } from '../components/world/Sprite';
import { OverworldMapNav, LOCATIONS } from '../components/world/OverworldMapNav';
import { DayNightIndicator } from '../components/world/DayNightIndicator';
import { PixelCursor } from '../components/world/PixelCursor';
import { AudioPlayer } from '../components/world/AudioPlayer';
import { PixelButton } from '../components/ui/PixelButton';
import { HeroSection } from '../components/sections/HeroSection';
import { QuestsSection } from '../components/sections/QuestsSection';
import { SkillTreeSection } from '../components/sections/SkillTreeSection';
import { GuildSection } from '../components/sections/GuildSection';
import { ContactSection } from '../components/sections/ContactSection';
import { GuestbookSection } from '../components/sections/GuestbookSection';
import { profile } from '../content/profile';
import { useTimeOfDay } from '../hooks/useTimeOfDay';
import { useDeviceType } from '../hooks/useMediaQuery';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function HomePage() {
  const { phase, setManualOverride, isManual } = useTimeOfDay();
  const { isMobile } = useDeviceType();
  const reducedMotion = useReducedMotion();

  // Helper to determine initial location from URL hash or default to hero
  const getInitialLocation = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '').trim();
      const match = LOCATIONS.find((l) => l.id === hash);
      if (match) return match.id;
    }
    return 'hero';
  };

  const [currentLocation, setCurrentLocation] = useState(getInitialLocation);
  const [targetLocation, setTargetLocation] = useState(null);
  const [isTraveling, setIsTraveling] = useState(false);
  const [travelDir, setTravelDir] = useState(false); // false = facing right, true = facing left
  const [isWavingHero, setIsWavingHero] = useState(false);

  // Panel state: panel is hidden during travel and opens when mascot arrives
  const [panelLocation, setPanelLocation] = useState(getInitialLocation);
  const [panelVisible, setPanelVisible] = useState(true);

  // Screen reader polite announcement
  const [announcement, setAnnouncement] = useState('');

  // Motion value for mascot horizontal travel (without React state updates per frame)
  const mascotX = useMotionValue(0);

  // Active refs to guard callbacks against stale closures and race conditions
  const currentLocationRef = useRef(currentLocation);
  currentLocationRef.current = currentLocation;

  const targetLocationRef = useRef(targetLocation);
  targetLocationRef.current = targetLocation;

  const isTravelingRef = useRef(isTraveling);
  isTravelingRef.current = isTraveling;

  const stageRef = useRef(null);
  const travelSeqRef = useRef(0);
  const currentAnimRef = useRef(null);

  // Parallax camera offset
  const activeIndex = LOCATIONS.findIndex(
    (loc) => loc.id === (targetLocation || currentLocation)
  );
  const cameraX = activeIndex * 240;

  // Calculates the horizontal pixel offset relative to the stage center for a given location tab
  const calculateTargetX = (locId) => {
    if (!stageRef.current) return 0;
    const tabEl = document.querySelector(`[data-location-id="${locId}"]`);
    if (!tabEl) return 0;
    const tabRect = tabEl.getBoundingClientRect();
    const stageRect = stageRef.current.getBoundingClientRect();

    const tabCenterX = tabRect.left + tabRect.width / 2;
    const stageCenterX = stageRect.left + stageRect.width / 2;
    return tabCenterX - stageCenterX;
  };

  // Focus helper to guide keyboard & screen readers after arrival
  const focusSectionHeading = (locId) => {
    const container = document.getElementById(`active-section-${locId}`);
    if (container) {
      const heading = container.querySelector(
        'h1, h2, h3, [role="region"], [data-section-focus]'
      );
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      } else {
        container.focus({ preventScroll: true });
      }
    }
  };

  // Centralized Navigation Dispatcher: all desktop triggers pass through goTo
  const goTo = (targetId, source = 'nav') => {
    if (isMobile) {
      if (targetId === currentLocationRef.current) return;
      setCurrentLocation(targetId);
      currentLocationRef.current = targetId;
      const el = document.getElementById(`section-${targetId}`);
      if (el) {
        el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      }
      return;
    }

    // 1. Same location check
    if (targetId === currentLocationRef.current && !isTravelingRef.current) {
      return;
    }
    // Already traveling to this exact destination
    if (isTravelingRef.current && targetId === targetLocationRef.current) {
      return;
    }

    // 2. Interruption token: cancel any pending arrival from previous target
    const thisSeq = ++travelSeqRef.current;

    // Stop currently running motion tween immediately (takes over from exact current X)
    if (currentAnimRef.current) {
      currentAnimRef.current.stop();
      currentAnimRef.current = null;
    }

    // Close the old panel quickly (duration <= 150ms)
    setPanelVisible(false);

    const targetMeta = LOCATIONS.find((l) => l.id === targetId) || LOCATIONS[0];
    targetLocationRef.current = targetId;
    setTargetLocation(targetId);

    const startX = mascotX.get();
    const targetX = calculateTargetX(targetId);
    const distance = Math.abs(targetX - startX);
    const movingLeft = targetX < startX;

    setTravelDir(movingLeft);
    setIsTraveling(true);
    isTravelingRef.current = true;

    // 3. Reduced Motion: instant jump without walking
    if (reducedMotion) {
      mascotX.set(targetX);
      setIsTraveling(false);
      isTravelingRef.current = false;
      setCurrentLocation(targetId);
      currentLocationRef.current = targetId;
      setTargetLocation(null);
      targetLocationRef.current = null;
      setPanelLocation(targetId);
      setPanelVisible(true);
      setAnnouncement(`Tiba di ${targetMeta.name}`);
      setTimeout(() => focusSectionHeading(targetId), 50);
      if (window.location.hash !== `#${targetId}`) {
        window.history.replaceState(null, '', `#${targetId}`);
      }
      return;
    }

    // 4. Constant speed (~550 px/s) clamped between 450ms and 1100ms
    const speed = 550;
    const rawDuration = (distance / speed) * 1000;
    const durationMs = Math.min(1100, Math.max(450, rawDuration));

    // 5. Linear Motion Tween via transform
    const anim = animate(mascotX, targetX, {
      duration: durationMs / 1000,
      ease: 'linear',
      onComplete: () => {
        // Interrupted by newer goTo call
        if (travelSeqRef.current !== thisSeq) return;

        setIsTraveling(false);
        isTravelingRef.current = false;
        setCurrentLocation(targetId);
        currentLocationRef.current = targetId;
        setTargetLocation(null);
        targetLocationRef.current = null;

        // Wave once if returning to starting village
        if (targetId === 'hero') {
          setIsWavingHero(true);
          setTimeout(() => setIsWavingHero(false), 1200);
        }

        // Open destination panel (duration <= 300ms, easeOut)
        setPanelLocation(targetId);
        setPanelVisible(true);

        // Announce arrival politely
        setAnnouncement(`Tiba di ${targetMeta.name}`);

        // Shift keyboard/screen-reader focus to section
        setTimeout(() => {
          focusSectionHeading(targetId);
        }, 50);

        // Sync URL hash without adding extra history entries
        if (window.location.hash !== `#${targetId}`) {
          window.history.replaceState(null, '', `#${targetId}`);
        }
      },
    });

    currentAnimRef.current = anim;
  };

  // Align mascot instantly on mount (supports direct URL hash loading)
  useLayoutEffect(() => {
    if (isMobile) return;
    const initialLoc = getInitialLocation();
    const initialX = calculateTargetX(initialLoc);
    mascotX.set(initialX);
  }, [isMobile]);

  // Recalculate mascot position on window resize and container observer
  useEffect(() => {
    if (isMobile) return;

    const handleResize = () => {
      if (!isTravelingRef.current) {
        const x = calculateTargetX(currentLocationRef.current);
        mascotX.set(x);
      }
    };

    window.addEventListener('resize', handleResize);

    let observer = null;
    if (stageRef.current && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(handleResize);
      observer.observe(stageRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) observer.disconnect();
    };
  }, [isMobile]);

  // URL Hash change listener
  useEffect(() => {
    const handleHashChange = () => {
      const hashLoc = getInitialLocation();
      if (hashLoc !== currentLocationRef.current) {
        goTo(hashLoc, 'hash');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global Keyboard Navigation (Arrow keys & A/D)
  useEffect(() => {
    if (isMobile) return;

    const handleKeyDown = (e) => {
      if (e.repeat) return;

      // Ignore when focused in form fields, textareas, or open dialogs/menus
      const activeEl = document.activeElement;
      if (activeEl) {
        const tag = activeEl.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        if (activeEl.isContentEditable) return;
        if (
          activeEl.closest &&
          (activeEl.closest('[role="dialog"]') || activeEl.closest('[role="menu"]'))
        ) {
          return;
        }
      }

      // Next Location: ArrowRight or D / d
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (e.key === 'ArrowRight') e.preventDefault();
        const baseLoc = targetLocationRef.current || currentLocationRef.current;
        const curIndex = LOCATIONS.findIndex((l) => l.id === baseLoc);
        const nextIndex = (curIndex + 1) % LOCATIONS.length;
        goTo(LOCATIONS[nextIndex].id, 'keyboard');
      }
      // Previous Location: ArrowLeft or A / a
      else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (e.key === 'ArrowLeft') e.preventDefault();
        const baseLoc = targetLocationRef.current || currentLocationRef.current;
        const curIndex = LOCATIONS.findIndex((l) => l.id === baseLoc);
        const prevIndex = (curIndex - 1 + LOCATIONS.length) % LOCATIONS.length;
        goTo(LOCATIONS[prevIndex].id, 'keyboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, reducedMotion]);

  const currentMeta =
    LOCATIONS.find((l) => l.id === currentLocation) || LOCATIONS[0];
  const targetMeta =
    LOCATIONS.find((l) => l.id === targetLocation) || currentMeta;

  return (
    <div className="relative min-h-[100dvh] text-[var(--ink)] overflow-x-hidden flex flex-col justify-between select-text">
      {/* Desktop Only Pixel Cursor */}
      <PixelCursor />

      {/* 1. Canvas Parallax World Background with Landmarks & Ambient Life */}
      <WorldCanvas
        phase={phase}
        cameraX={cameraX}
        isMobile={isMobile}
      />

      {/* 2. Top Header & Nav Container (Mobile: Sticky 56px, Desktop: Two Panels per c383241) */}
      {isMobile ? (
        /* Mobile Header (Fase 1: Sticky 56px with safe-area-inset-top) */
        <header className="sticky top-0 z-40 w-full bg-[var(--cream)] border-b-4 border-[#24160B] shadow-[0_3px_0_#24160B] pt-[env(safe-area-inset-top)]">
          <div className="w-full max-w-6xl mx-auto h-[56px] px-3 flex items-center justify-between gap-2">
            {/* Left: Identity (single line, truncated if long) */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-3.5 h-3.5 bg-[#5E8B4A] border-2 border-[#24160B] inline-block shadow-[1px_1px_0_#24160B] flex-shrink-0" />
              <div className="min-w-0">
                <span className="font-pixel text-base font-bold tracking-wider block leading-tight text-[#24160B] truncate">
                  {profile.nama}
                </span>
              </div>
            </div>

            {/* Right: Quick Tools (Audio, Time Phase, Mode CV) */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <AudioPlayer />

              <DayNightIndicator
                phase={phase}
                onSelectPhase={setManualOverride}
                isManual={isManual}
              />

              <Link to="/cv">
                <button
                  type="button"
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1.5 border-2 border-[#24160B] bg-[#E8793A] text-white shadow-[2px_2px_0_#24160B] active:translate-y-[1px] active:shadow-none font-alt-pixel text-xs font-bold cursor-pointer"
                  title="Buka Mode CV (Lihat ringkasan dokumen linear)"
                  aria-label="Mode CV"
                >
                  CV
                </button>
              </Link>
            </div>
          </div>
        </header>
      ) : (
        /* Desktop Header: Two Panels (Panel 1: Identity & Controls, Panel 2: Peta Overworld per c383241) */
        <header className="relative z-30 w-full p-4 lg:p-5 flex flex-col gap-3">
          <div className="w-full max-w-5xl mx-auto flex items-center justify-between border-4 border-[#24160B] bg-[#F6EBD3] px-4 py-2.5 shadow-[4px_4px_0_#24160B]">
            <div className="flex items-center gap-3">
              <div>
                <span className="font-pixel text-base lg:text-lg font-bold tracking-wider block leading-tight text-[#24160B]">
                  {profile.nama}
                </span>
                <span className="font-body text-xs text-[#3B5E34] font-bold block">
                  {profile.target}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AudioPlayer />

              <DayNightIndicator
                phase={phase}
                onSelectPhase={setManualOverride}
                isManual={isManual}
              />

              <Link to="/cv">
                <PixelButton
                  variant="secondary"
                  size="sm"
                  aria-label="Mode CV"
                  title="Lihat sebagai dokumen CV linear standar"
                >
                  MODE CV
                </PixelButton>
              </Link>
            </div>
          </div>

          {/* Overworld Map Navigation Bar (Desktop) */}
          <OverworldMapNav
            activeLocation={currentLocation}
            targetLocation={targetLocation}
            onSelectLocation={(id, src) => goTo(id, src || 'nav')}
            isMobile={false}
          />
        </header>
      )}

      {/* 3. Upgraded Mascot Traveling Sprite Anchor (Desktop: Linear Track Motion, Mobile: Unaltered) */}
      {isMobile ? (
        <div className="relative z-20 w-full max-w-4xl mx-auto px-4 flex justify-center items-center my-1 pointer-events-none">
          <div className="flex flex-col items-center">
            <div className="pointer-events-auto">
              <Sprite
                animation="idle"
                scale="responsive"
                flip={false}
                onWave={() => {}}
              />
            </div>

            <div className="font-pixel text-xs text-[#24160B] bg-[#FFFDF8] border-2 border-[#24160B] px-3 py-0.5 mt-1 shadow-[2px_2px_0_#24160B] flex items-center gap-1.5 font-bold">
              <span>{currentMeta.icon}</span>
              <span>Lokasi: {currentMeta.name}</span>
            </div>

            <div className="text-center w-full px-4 mt-2 font-pixel text-xs text-[#3B5E34] font-bold tracking-wider select-text">
              {profile.target}
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={stageRef}
          className="relative z-20 w-full max-w-4xl mx-auto px-4 flex justify-center items-center my-1 pointer-events-none overflow-visible"
        >
          <motion.div
            style={{ x: mascotX }}
            className="flex flex-col items-center will-change-transform"
          >
            <div className="pointer-events-auto">
              <Sprite
                animation={isTraveling ? 'walk' : isWavingHero ? 'wave' : 'idle'}
                scale={2.2}
                flip={travelDir}
                className="!transition-none"
                onWave={() => setIsWavingHero(true)}
              />
            </div>

            {/* Dynamic Location Badge: displays 'Menuju:' while walking and 'Lokasi:' when arrived */}
            <div
              className={`font-pixel text-xs text-[#24160B] bg-[#FFFDF8] border-2 border-[#24160B] px-3 py-0.5 mt-1 shadow-[2px_2px_0_#24160B] flex items-center gap-1.5 font-bold select-none ${
                isTraveling
                  ? 'border-[#E8793A] bg-[#FFF8F0]'
                  : 'border-[#24160B]'
              }`}
            >
              <span>{isTraveling ? targetMeta.icon : currentMeta.icon}</span>
              <span>
                {isTraveling
                  ? `Menuju: ${targetMeta.name}`
                  : `Lokasi: ${currentMeta.name}`}
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* 4. Overworld Sections (Desktop: Sequential Panel Transitions, Mobile: Vertical Scroll) */}
      <main className="relative z-20 flex-1 w-full max-w-5xl mx-auto px-4 py-3 lg:py-5 flex flex-col justify-center overflow-visible">
        {isMobile ? (
          // Mobile: Vertical flow of sections with safe-area clearance (Fase 3 & 4)
          <div className="space-y-8 pb-[calc(6rem+env(safe-area-inset-bottom))]">
            {LOCATIONS.map((loc) => (
              <section
                key={loc.id}
                id={`section-${loc.id}`}
                className="scroll-mt-16"
              >
                {loc.id !== 'hero' && (
                  <div className="mb-2 font-pixel text-xs font-bold text-[#24160B]/80 uppercase flex items-center gap-1.5">
                    <span>{loc.icon}</span>
                    <span>LOKASI: {loc.name.toUpperCase()}</span>
                  </div>
                )}
                <LocationSectionContent
                  locId={loc.id}
                  onStartExplore={() => goTo('quests', 'cta')}
                  isMobile={true}
                />
              </section>
            ))}
          </div>
        ) : (
          // Desktop: Panel closes when departing (<=150ms), and opens when mascot arrives (<=300ms, easeOut)
          <div className="w-full overflow-visible">
            <AnimatePresence mode="wait">
              {panelVisible && (
                <motion.div
                  key={panelLocation}
                  initial={
                    reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.25, ease: 'easeOut' },
                  }}
                  exit={
                    reducedMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          y: -8,
                          transition: { duration: 0.12, ease: 'easeIn' },
                        }
                  }
                  className="w-full"
                >
                  <div
                    id={`active-section-${panelLocation}`}
                    tabIndex={-1}
                    className="outline-none"
                  >
                    <LocationSectionContent
                      locId={panelLocation}
                      onStartExplore={() => goTo('quests', 'cta')}
                      isMobile={false}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Screen Reader Live Region for polite arrival announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* 5. Mobile Bottom Dock Navigation */}
      {isMobile && (
        <OverworldMapNav
          activeLocation={currentLocation}
          targetLocation={null}
          onSelectLocation={(id, src) => goTo(id, src || 'nav')}
          isMobile={true}
        />
      )}

      {/* 6. Footer (Desktop) */}
      <footer className="relative z-20 w-full max-w-5xl mx-auto px-4 py-3 text-center text-xs font-pixel text-[#24160B]/80 hidden lg:block">
        <div className="inline-block bg-[#F6EBD3]/95 border-2 border-[#24160B] px-4 py-1.5 shadow-[2px_2px_0_#24160B]">
          Portofolio Overworld &bull;  Naufal Ali Hilmi  &bull; Sistem Informasi Universitas Gunadarma
        </div>
      </footer>
    </div>
  );
}

/**
 * Renders the content corresponding to the current active map location.
 */
function LocationSectionContent({ locId, onStartExplore, isMobile }) {
  switch (locId) {
    case 'hero':
      return <HeroSection onStartExplore={onStartExplore} isMobile={isMobile} />;

    case 'quests':
      return <QuestsSection isMobile={isMobile} />;

    case 'skills':
      return <SkillTreeSection isMobile={isMobile} />;

    case 'guild':
      return <GuildSection isMobile={isMobile} />;

    case 'contact':
      return isMobile ? <ContactSection defaultTab="contact" isMobile={true} /> : <ContactSection isMobile={false} />;

    case 'guestbook':
      return isMobile ? <ContactSection defaultTab="guestbook" isMobile={true} /> : <GuestbookSection />;

    default:
      return null;
  }
}

export default HomePage;
