import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { WorldCanvas } from '../components/world/WorldCanvas';
import { Sprite } from '../components/world/Sprite';
import { OverworldMapNav, LOCATIONS } from '../components/world/OverworldMapNav';
import { DayNightIndicator } from '../components/world/DayNightIndicator';
import { PixelButton } from '../components/ui/PixelButton';
import { Panel } from '../components/ui/Panel';
import { DialogBox } from '../components/ui/DialogBox';
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
  // Calculate horizontal camera offset for desktop parallax (0 to 1000px)
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

    // Stop traveling animation after step transition
    setTimeout(() => {
      setIsTraveling(false);
    }, 400);
  };

  return (
    <div className="relative min-h-[100dvh] text-[var(--ink)] overflow-x-hidden flex flex-col justify-between select-text">
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

          <div className="flex items-center gap-2 sm:gap-4">
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

        {/* Overworld Map Navigation Bar */}
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
          <div className="space-y-8 pb-20">
            {LOCATIONS.map((loc) => (
              <section
                key={loc.id}
                id={`section-${loc.id}`}
                className="scroll-mt-6"
              >
                <LocationSectionContent locId={loc.id} />
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
                <LocationSectionContent locId={activeLocation} />
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
          Peta Dunia Portofolio &bull; Sistem Informasi Universitas Gunadarma &bull; Navigasi via tombol atau panah keyboard
        </div>
      </footer>
    </div>
  );
}

/**
 * Renders the content preview corresponding to the current active map location.
 */
function LocationSectionContent({ locId }) {
  switch (locId) {
    case 'hero':
      return (
        <div className="space-y-4">
          <DialogBox
            speaker={profile.nama}
            speakerRole={profile.target}
            showBlinker={false}
            actions={
              <div className="flex flex-wrap gap-2 pt-1">
                <Link to="/cv">
                  <PixelButton variant="primary" size="md">
                    Buka Mode CV
                  </PixelButton>
                </Link>
                <a
                  href={profile.sosial.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <PixelButton variant="neutral" size="md">
                    GitHub
                  </PixelButton>
                </a>
                <a
                  href={profile.sosial.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <PixelButton variant="neutral" size="md">
                    LinkedIn
                  </PixelButton>
                </a>
              </div>
            }
          >
            <p className="font-medium text-base sm:text-lg">
              Halo, pengelana! Selamat datang di desa awal portofolio saya.
            </p>
            <p className="mt-2 text-sm sm:text-base leading-relaxed">
              Saya Naufal Ali Hilmi, mahasiswa Sistem Informasi di Universitas Gunadarma dengan fokus dan aspirasi mendalam pada <strong>Database Administration (Oracle)</strong> dan <strong>Linux System Administration</strong>.
            </p>
          </DialogBox>

          <Panel title="PANDUAN MENJELAJAH OVERWORLD" variant="parchment">
            <ul className="text-xs sm:text-sm space-y-2 list-disc list-inside">
              <li>Pilih lokasi di peta atas untuk menggerakkan maskot ke <strong>Quest Log</strong>, <strong>Skill Tree</strong>, atau <strong>Guild Hall</strong>.</li>
              <li>Gunakan tombol waktu di pojok kanan atas untuk melihat pergantian suasana <strong>Fajar, Siang, Senja, dan Malam</strong>.</li>
              <li>Untuk recruiter yang membutuhkan ringkasan kilat dalam &le;10 detik, gunakan tombol <strong>Mode CV</strong>.</li>
            </ul>
          </Panel>
        </div>
      );

    case 'quests':
      return (
        <Panel title="QUEST LOG (DAFTAR PROYEK)" variant="default">
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-[var(--ink)]/80">
              Misi dan proyek praktikum yang telah diselesaikan maupun sedang dikerjakan.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.quests.map((q) => (
                <div
                  key={q.id}
                  className="border-2 border-[var(--ink)] bg-[var(--cloud)] p-4 shadow-[3px_3px_0_var(--ink)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-pixel text-base font-bold text-[var(--ink)]">
                        {q.judul}
                      </h3>
                      <span className="font-pixel text-[10px] px-2 py-0.5 bg-[var(--moss)] text-[var(--cloud)] border border-[var(--ink)]">
                        {q.status}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed mb-3">
                      {q.ringkasan}
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {q.stack.map((stk, i) => (
                        <span
                          key={i}
                          className="font-pixel text-[10px] px-1.5 py-0.5 bg-[var(--cream)] border border-[var(--ink)]/30"
                        >
                          {stk}
                        </span>
                      ))}
                    </div>
                    {q.repo && q.repo !== 'TODO_OWNER' && (
                      <a
                        href={q.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                      >
                        <PixelButton variant="primary" size="sm">
                          Buka Repo &rarr;
                        </PixelButton>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      );

    case 'skills':
      return (
        <Panel title="SKILL TREE (CABANG KEAHLIAN)" variant="default">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Branch 1: Database */}
              <div className="border-2 border-[var(--ink)] bg-[var(--cloud)] p-3 shadow-[2px_2px_0_var(--ink)]">
                <div className="font-pixel text-sm font-bold text-[var(--sunset)] border-b-2 border-[var(--ink)] pb-1 mb-2">
                  DATABASE (ORACLE)
                </div>
                <div className="space-y-2">
                  {profile.skillTree.database.map((s, i) => (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between font-pixel">
                        <span>{s.name}</span>
                        <span>{s.level}%</span>
                      </div>
                      <div className="w-full h-2 border border-[var(--ink)] bg-[var(--cream)] mt-0.5">
                        <div
                          className="h-full bg-[var(--moss)]"
                          style={{ width: `${s.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Branch 2: SysAdmin */}
              <div className="border-2 border-[var(--ink)] bg-[var(--cloud)] p-3 shadow-[2px_2px_0_var(--ink)]">
                <div className="font-pixel text-sm font-bold text-[var(--moss-dark)] border-b-2 border-[var(--ink)] pb-1 mb-2">
                  SYSADMIN & LINUX
                </div>
                <div className="space-y-2">
                  {profile.skillTree.sysAdmin.map((s, i) => (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between font-pixel">
                        <span>{s.name}</span>
                        <span>{s.level}%</span>
                      </div>
                      <div className="w-full h-2 border border-[var(--ink)] bg-[var(--cream)] mt-0.5">
                        <div
                          className="h-full bg-[var(--moss)]"
                          style={{ width: `${s.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Branch 3: Web Dev */}
              <div className="border-2 border-[var(--ink)] bg-[var(--cloud)] p-3 shadow-[2px_2px_0_var(--ink)]">
                <div className="font-pixel text-sm font-bold text-[var(--ink)] border-b-2 border-[var(--ink)] pb-1 mb-2">
                  WEB & DEVOPS DASAR
                </div>
                <div className="space-y-2">
                  {profile.skillTree.webDev.map((s, i) => (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between font-pixel">
                        <span>{s.name}</span>
                        <span>{s.level}%</span>
                      </div>
                      <div className="w-full h-2 border border-[var(--ink)] bg-[var(--cream)] mt-0.5">
                        <div
                          className="h-full bg-[var(--moss)]"
                          style={{ width: `${s.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Panel>
      );

    case 'guild':
      return (
        <Panel title="GUILD HALL (BALAI ORGANISASI)" variant="default">
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-[var(--ink)]/80">
              Rekam jejak keterlibatan dan kontribusi dalam organisasi kampus.
            </p>
            <div className="space-y-3">
              {profile.organisasi.map((org) => (
                <div
                  key={org.id}
                  className="border-2 border-[var(--ink)] bg-[var(--cream)] p-3 shadow-[2px_2px_0_var(--ink)]"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-pixel text-base font-bold">{org.guild}</h3>
                    <span className="font-pixel text-xs px-2 py-0.5 bg-[var(--sunset)] text-[var(--cloud)]">
                      {org.periode}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-pixel text-[var(--moss-dark)] mt-1">
                    Peran: {org.peran}
                  </p>
                  <p className="text-xs sm:text-sm mt-1">{org.deskripsi}</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      );

    case 'contact':
      return (
        <Panel title="KOTAK POS (HUBUNGI SAYA)" variant="default">
          <div className="space-y-3">
            <p className="text-xs sm:text-sm">
              Kirimkan pesan langsung ke kotak pos saya. Form interaktif dengan validasi backend akan aktif penuh pada Fase 4.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={profile.sosial.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <PixelButton variant="primary" size="md">
                  Hubungi via LinkedIn &rarr;
                </PixelButton>
              </a>
              <a
                href={profile.sosial.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <PixelButton variant="neutral" size="md">
                  Lihat GitHub Profil &rarr;
                </PixelButton>
              </a>
            </div>
          </div>
        </Panel>
      );

    case 'guestbook':
      return (
        <Panel title="PAPAN PESAN PETUALANG (GUESTBOOK)" variant="default">
          <div className="space-y-3">
            <p className="text-xs sm:text-sm">
              Tinggalkan jejak kunjunganmu di peta petualangan ini! Pesan yang telah disetujui akan ditampilkan sebagai tempelan kertas di papan ini.
            </p>
            <div className="border-2 border-dashed border-[var(--ink)]/40 p-4 text-center text-xs font-pixel text-[var(--ink)]/70 bg-[var(--cloud)]">
              Integrasi database Postgres untuk guestbook akan diaktifkan pada Fase 4.
            </div>
          </div>
        </Panel>
      );

    default:
      return null;
  }
}

export default HomePage;
