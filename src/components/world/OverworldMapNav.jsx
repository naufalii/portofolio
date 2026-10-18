import React from 'react';

export const LOCATIONS = [
  { id: 'hero', name: 'Desa Awal', subtitle: 'Pengenalan', icon: '🏡' },
  { id: 'quests', name: 'Quest Log', subtitle: 'Proyek', icon: '📜' },
  { id: 'skills', name: 'Skill Tree', subtitle: 'Keahlian', icon: '⚡' },
  { id: 'guild', name: 'Guild Hall', subtitle: 'Organisasi', icon: '🏛️' },
  { id: 'contact', name: 'Kotak Pos', subtitle: 'Hubungi', icon: '📬' },
  { id: 'guestbook', name: 'Papan Pesan', subtitle: 'Buku Tamu', icon: '📝' },
];

/**
 * OverworldMapNav - World map banner with interactive location markers.
 * Implements Section 5 & 8:
 * - Desktop: fixed top map bar with step transitions
 * - Mobile: sticky bottom quick navigation bar
 * - Full keyboard navigation (Left/Right arrow keys, Enter, Tab)
 */
export function OverworldMapNav({
  activeLocation = 'hero',
  onSelectLocation,
  isMobile = false,
}) {
  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % LOCATIONS.length;
      onSelectLocation(LOCATIONS[nextIndex].id);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + LOCATIONS.length) % LOCATIONS.length;
      onSelectLocation(LOCATIONS[prevIndex].id);
    }
  };

  if (isMobile) {
    // Mobile Bottom Navigation Bar (Section 8: min tap 44x44px)
    return (
      <nav
        aria-label="Peta Navigasi Mobile"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--cream)] border-t-4 border-[var(--ink)] shadow-[0_-4px_0_var(--ink)] p-1.5 flex items-center justify-around"
      >
        {LOCATIONS.map((loc, i) => {
          const isActive = activeLocation === loc.id;
          return (
            <button
              key={loc.id}
              type="button"
              onClick={() => onSelectLocation(loc.id)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 font-pixel text-xs transition-all ${
                isActive
                  ? 'bg-[var(--sunset)] text-[var(--cloud)] border-2 border-[var(--ink)] shadow-[2px_2px_0_var(--ink)] -translate-y-1'
                  : 'text-[var(--ink)] hover:bg-[var(--cloud)]/60'
              }`}
              aria-label={`Lokasi ${loc.name}`}
              aria-current={isActive ? 'location' : undefined}
            >
              <span className="text-base leading-none">{loc.icon}</span>
              <span className="text-[10px] mt-0.5 tracking-tight font-bold">
                {loc.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>
    );
  }

  // Desktop Overworld Map Header Bar
  return (
    <nav
      aria-label="Peta Dunia Overworld"
      className="relative z-30 w-full max-w-5xl mx-auto border-4 border-[var(--ink)] bg-[var(--cream)] shadow-[4px_4px_0_var(--ink)] px-4 py-2.5"
    >
      <div className="flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2 pr-3 border-r-2 border-[var(--ink)]/20 select-none">
          <span className="w-3 h-3 bg-[var(--moss)] border border-[var(--ink)]" />
          <span className="font-pixel text-xs sm:text-sm font-bold tracking-wider">
            PETA OVERWORLD
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-around">
          {LOCATIONS.map((loc, i) => {
            const isActive = activeLocation === loc.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => onSelectLocation(loc.id)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className={`relative flex items-center gap-2 px-3 py-1.5 min-h-[44px] font-pixel text-xs sm:text-sm tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--moss)] text-[var(--cloud)] border-2 border-[var(--ink)] shadow-[2px_2px_0_var(--ink)] -translate-y-0.5'
                    : 'bg-transparent text-[var(--ink)] hover:bg-[var(--cloud)] border border-transparent'
                }`}
                aria-current={isActive ? 'location' : undefined}
              >
                {/* Active marker flag/dot */}
                {isActive && (
                  <span className="w-2 h-2 bg-[var(--sunset)] border border-[var(--cloud)] inline-block animate-ping" />
                )}
                <span>{loc.icon}</span>
                <span className="font-bold">{loc.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default OverworldMapNav;
