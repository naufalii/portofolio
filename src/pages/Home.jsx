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
  // Calculate horizontal camera offset for desktop parallax (0 to 1200px)
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
    }, 400);
  };

  const currentLocationMeta =
    LOCATIONS.find((l) => l.id === activeLocation) || LOCATIONS[0];

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
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1.5 border-2 border-[#24160B] bg-[#E8793A] text-white shadow-[2px_2px_0_#24160B] active:translate-y-[1px] active:shadow-none font-pixel text-xs font-bold cursor-pointer"
                  title="Buka Mode CV (Lihat ringkasan dokumen linear)"
                  aria-label="Mode CV (Lihat sebagai dokumen linear)"
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
                <PixelButton variant="secondary" size="sm" title="Lihat sebagai dokumen CV linear standar">
                  MODE CV
                </PixelButton>
              </Link>
            </div>
          </div>

          {/* Overworld Map Navigation Bar (Desktop) */}
          <OverworldMapNav
            activeLocation={activeLocation}
            onSelectLocation={handleSelectLocation}
            isMobile={false}
          />
        </header>
      )}

      {/* 3. Upgraded Mascot Traveling Sprite Anchor (No random debug string!) */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 flex justify-center items-center my-1 pointer-events-none">
        <div className="flex flex-col items-center">
          <div className="pointer-events-auto">
            <Sprite
              animation={isTraveling ? 'walk' : 'idle'}
              scale={isMobile ? 'responsive' : 2.2}
              flip={travelDir}
              onWave={() => {}}
            />
          </div>

          {/* Clean Location Badge without any extraneous debug code */}
          <div className="font-pixel text-xs text-[#24160B] bg-[#FFFDF8] border-2 border-[#24160B] px-3 py-0.5 mt-1 shadow-[2px_2px_0_#24160B] flex items-center gap-1.5 font-bold">
            <span>{currentLocationMeta.icon}</span>
            <span>Lokasi: {currentLocationMeta.name}</span>
          </div>

          {/* Role Subtitle: Only on mobile (<1024px) below mascot. On desktop, role is in the header & dialog! */}
          {isMobile && (
            <div className="text-center w-full px-4 mt-2 font-pixel text-xs text-[#3B5E34] font-bold tracking-wider select-text">
              {profile.target}
            </div>
          )}
        </div>
      </div>

      {/* 4. Overworld Sections (Desktop: Horizontal Stage, Mobile: Vertical Scroll) */}
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
                {/* Deduplicate hero location tag (Fase 2) */}
                {loc.id !== 'hero' && (
                  <div className="mb-2 font-pixel text-xs font-bold text-[#24160B]/80 uppercase flex items-center gap-1.5">
                    <span>{loc.icon}</span>
                    <span>LOKASI: {loc.name.toUpperCase()}</span>
                  </div>
                )}
                <LocationSectionContent
                  locId={loc.id}
                  onStartExplore={() => handleSelectLocation('quests')}
                  isMobile={true}
                />
              </section>
            ))}
          </div>
        ) : (
          // Desktop: Animated horizontal stage transitions via Motion
          <div className="w-full overflow-visible">
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
                  isMobile={false}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* 5. Mobile Bottom Dock Navigation */}
      {isMobile && (
        <OverworldMapNav
          activeLocation={activeLocation}
          onSelectLocation={handleSelectLocation}
          isMobile={true}
        />
      )}

      {/* 6. Footer (Desktop) */}
      <footer className="relative z-20 w-full max-w-5xl mx-auto px-4 py-3 text-center text-xs font-pixel text-[#24160B]/80 hidden lg:block">
        <div className="inline-block bg-[#F6EBD3]/95 border-2 border-[#24160B] px-4 py-1.5 shadow-[2px_2px_0_#24160B]">
          Portofolio Overworld &bull; Naufal Ali Hilmi &bull; Sistem Informasi Universitas Gunadarma &bull; Navigasi via tombol atau panah keyboard
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
