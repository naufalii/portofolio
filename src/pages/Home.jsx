import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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

  const [activeLocation, setActiveLocation] = useState('hero');
  const [isTraveling, setIsTraveling] = useState(false);
  const [travelDir, setTravelDir] = useState(false); // false = right, true = left

  const activeIndex = LOCATIONS.findIndex((loc) => loc.id === activeLocation);
  const cameraX = activeIndex * 240;

  const handleSelectLocation = (id) => {
    if (id === activeLocation) return;
    const newIndex = LOCATIONS.findIndex((loc) => loc.id === id);
    setTravelDir(newIndex < activeIndex);
    setIsTraveling(true);
    setActiveLocation(id);

    if (isMobile) {
      const el = document.getElementById(`section-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    }

    setTimeout(() => {
      setIsTraveling(false);
    }, 350);
  };

  return (
    <div className="relative min-h-[100dvh] text-[var(--ink)] overflow-x-hidden flex flex-col justify-between select-text">
      {/* Custom Retro Pixel Cursor (Desktop only per Section 6 & 8) */}
      <PixelCursor />

      {/* 1. Canvas Parallax World Background (Section 7) */}
      <WorldCanvas
        phase={phase}
        cameraX={cameraX}
        isMobile={isMobile}
      />

      {/* 2. Top Header & Nav Container */}
      <header className="relative z-30 w-full p-3 sm:p-5 flex flex-col gap-3">
        <div className="w-full max-w-5xl mx-auto flex items-center justify-between border-4 border-[var(--ink)] bg-[var(--cream)] px-4 py-2.5 shadow-[4px_4px_0_var(--ink)]">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 bg-[var(--moss)] border-2 border-[var(--ink)] inline-block shadow-[1px_1px_0_var(--ink)]" />
            <div>
              <span className="font-pixel text-base sm:text-lg font-bold tracking-wider block leading-tight">
                {profile.nama}
              </span>
              <span className="font-body text-[11px] sm:text-xs text-[var(--ink)]/80 hidden sm:block">
                {profile.target}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Toggle per Section 7.4 */}
            <AudioPlayer />

            {/* Time of Day Indicator per Section 5 */}
            <DayNightIndicator
              phase={phase}
              onSelectPhase={setManualOverride}
              isManual={isManual}
            />

            <Link to="/cv">
              <PixelButton variant="secondary" size="sm">
                MODE CV
              </PixelButton>
            </Link>
          </div>
        </div>

        {/* Overworld Map Navigation Bar (Desktop) */}
        {!isMobile && (
          <OverworldMapNav
            activeLocation={activeLocation}
            onSelectLocation={handleSelectLocation}
            isMobile={false}
          />
        )}
      </header>

      {/* 3. Mascot Traveling Sprite Anchor */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 flex justify-center items-center my-2 pointer-events-none">
        <div className="flex flex-col items-center">
          <Sprite
            animation={isTraveling ? 'walk' : 'idle'}
            scale={2}
            flip={travelDir}
          />
          <div className="font-pixel text-[11px] text-[var(--ink)] bg-[var(--cream)]/90 border border-[var(--ink)] px-2 py-0.5 mt-1 shadow-[1px_1px_0_var(--ink)]">
            Lokasi: {LOCATIONS.find((l) => l.id === activeLocation)?.name}
          </div>
        </div>
      </div>

      {/* 4. Overworld Sections (Desktop: Horizontal Stage, Mobile: Vertical Scroll) */}
      <main className="relative z-20 flex-1 w-full max-w-5xl mx-auto px-4 py-4 sm:py-6 flex flex-col justify-center">
        {isMobile ? (
          // Mobile: Vertical flow of sections
          <div className="space-y-10 pb-24">
            {LOCATIONS.map((loc) => (
              <section
                key={loc.id}
                id={`section-${loc.id}`}
                className="scroll-mt-6"
              >
                <div className="mb-2 font-pixel text-xs font-bold text-[var(--ink)]/70 uppercase">
                  &bull; LOKASI: {loc.name.toUpperCase()}
                </div>
                <LocationSectionContent
                  locId={loc.id}
                  onStartExplore={() => handleSelectLocation('quests')}
                />
              </section>
            ))}
          </div>
        ) : (
          // Desktop: Animated horizontal stage transitions via Motion
          <div className="overflow-hidden w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLocation}
                initial={
                  reducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: travelDir ? -40 : 40 }
                }
                animate={{ opacity: 1, x: 0 }}
                exit={
                  reducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: travelDir ? 40 : -40 }
                }
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full"
              >
                <LocationSectionContent
                  locId={activeLocation}
                  onStartExplore={() => handleSelectLocation('quests')}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* 5. Mobile Bottom Navigation */}
      {isMobile && (
        <OverworldMapNav
          activeLocation={activeLocation}
          onSelectLocation={handleSelectLocation}
          isMobile={true}
        />
      )}

      {/* 6. Footer (Desktop) */}
      <footer className="relative z-20 w-full max-w-5xl mx-auto px-4 py-3 text-center text-xs font-pixel text-[var(--ink)]/80 hidden sm:block">
        <div className="inline-block bg-[var(--cream)]/90 border-2 border-[var(--ink)] px-4 py-1.5 shadow-[2px_2px_0_var(--ink)]">
          Peta Dunia Portofolio &bull; Naufal Ali Hilmi &bull; Sistem Informasi Universitas Gunadarma &bull; Navigasi via tombol atau panah keyboard
        </div>
      </footer>
    </div>
  );
}

/**
 * Renders the content corresponding to the current active map location.
 */
function LocationSectionContent({ locId, onStartExplore }) {
  switch (locId) {
    case 'hero':
      return <HeroSection onStartExplore={onStartExplore} />;

    case 'quests':
      return <QuestsSection />;

    case 'skills':
      return <SkillTreeSection />;

    case 'guild':
      return <GuildSection />;

    case 'contact':
      return <ContactSection />;

    case 'guestbook':
      return <GuestbookSection />;

    default:
      return null;
  }
}

export default HomePage;
