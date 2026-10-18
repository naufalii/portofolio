import React from 'react';

export const LOCATIONS = [
  { id: 'hero', name: 'Desa Awal', short: 'Desa', icon: '🏡' },
  { id: 'quests', name: 'Quest Log', short: 'Quest', icon: '📜' },
  { id: 'skills', name: 'Skill Tree', short: 'Skill', icon: '⚡' },
  { id: 'guild', name: 'Guild Hall', short: 'Guild', icon: '🏛️' },
  { id: 'contact', name: 'Kotak Pos', short: 'Kontak', icon: '📬' },
  { id: 'guestbook', name: 'Papan Pesan', short: 'Pesan', icon: '📝' },
];

/**
 * OverworldMapNav - World map banner with interactive location markers.
 * Implements Section 5 & 8 & Mobile Fix Fase 3:
 * - padding-bottom with env(safe-area-inset-bottom) for iPhone home indicator
 * - Active item has --moss background with high-contrast text and border
 * - Minimum 12px label, readable from 50cm distance
 * - Tap targets >= 44x44px
 */
export function OverworldMapNav({
  activeLocation = 'hero',
  targetLocation = null,
  onSelectLocation,
  isMobile = false,
}) {
  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % LOCATIONS.length;
      onSelectLocation(LOCATIONS[nextIndex].id, 'keyboard');
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + LOCATIONS.length) % LOCATIONS.length;
      onSelectLocation(LOCATIONS[prevIndex].id, 'keyboard');
    }
  };

  if (isMobile) {
    // Mobile Bottom Navigation Dock with safe-area-inset-bottom (Fase 3)
    return (
      <nav
        aria-label="Peta Navigasi Mobile"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#F6EBD3] border-t-3 border-[#24160B] shadow-[0_-3px_0_#24160B] px-1 pt-1 pb-[max(6px,env(safe-area-inset-bottom))] flex items-center justify-around select-none"
      >
        {LOCATIONS.map((loc, i) => {
          const isActive = activeLocation === loc.id;
          return (
            <button
              key={loc.id}
              id={`mobile-tab-${loc.id}`}
              data-location-id={loc.id}
              type="button"
              onClick={() => onSelectLocation(loc.id, 'nav')}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={`flex flex-col items-center justify-center min-w-[48px] min-h-[46px] px-1 py-1 font-pixel transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#5E8B4A] text-[#F6EBD3] border-2 border-[#24160B] shadow-[2px_2px_0_#24160B] -translate-y-1 font-bold'
                  : 'text-[#24160B] hover:bg-white/60 border-2 border-transparent'
              }`}
              aria-label={`Lokasi ${loc.name}`}
              aria-current={isActive ? 'location' : undefined}
            >
              <span className="text-base sm:text-lg leading-none">{loc.icon}</span>
              <span className="text-[12px] mt-0.5 tracking-tight font-bold leading-tight">
                {loc.short}
              </span>
            </button>
          );
        })}
      </nav>
    );
  }

  // Desktop Overworld Map Header Bar (Section 5 & 8)
  return (
    <nav
      aria-label="Peta Dunia Overworld"
      className="relative z-30 w-full max-w-5xl mx-auto border-4 border-[#24160B] bg-[#F6EBD3] shadow-[4px_4px_0_#24160B] px-4 py-2.5"
    >
      <div className="flex items-center justify-between gap-2 overflow-x-auto select-none">
        <div className="flex items-center gap-2 pr-3 border-r-2 border-[#24160B]/20 select-none">
          <span className="font-pixel text-xs lg:text-sm font-bold tracking-wider text-[#24160B]">
            PETA OVERWORLD
          </span>
        </div>

        <div className="flex items-center gap-2 lg:gap-3 flex-1 justify-around">
          {LOCATIONS.map((loc, i) => {
            const isActive = activeLocation === loc.id;
            const isTarget = targetLocation === loc.id && !isActive;

            let buttonClass = 'bg-transparent text-[#24160B] hover:bg-[#FFFDF8] border border-transparent';
            if (isActive) {
              buttonClass = 'bg-[#5E8B4A] text-[#F6EBD3] border-2 border-[#24160B] shadow-[2px_2px_0_#24160B] -translate-y-0.5 font-bold';
            } else if (isTarget) {
              buttonClass = 'bg-[#FFFDF8] text-[#24160B] border-2 border-dashed border-[#E8793A] shadow-[2px_2px_0_#E8793A] -translate-y-0.5 font-bold';
            }

            return (
              <button
                key={loc.id}
                id={`map-tab-${loc.id}`}
                data-location-id={loc.id}
                type="button"
                onClick={() => onSelectLocation(loc.id, 'nav')}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className={`relative flex items-center gap-2 px-3 py-1.5 min-h-[44px] font-pixel text-xs lg:text-sm tracking-wide transition-all cursor-pointer ${buttonClass}`}
                aria-current={isActive ? 'location' : undefined}
                title={isTarget ? `Sedang menuju ke ${loc.name}` : `Beralih ke ${loc.name}`}
              >
                {isActive && (
                  <span className="w-2 h-2 bg-[#E8793A] border border-[#F6EBD3] inline-block animate-ping" />
                )}
                {isTarget && (
                  <span className="w-2 h-2 bg-[#E8793A] inline-block animate-pulse" />
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
