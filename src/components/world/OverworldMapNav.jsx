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
              type="button"
              onClick={() => onSelectLocation(loc.id)}
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

  // Desktop Overworld Map Header Bar (Integrated horizontally)
  return (
    <nav
      aria-label="Peta Dunia Overworld"
      className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto select-none"
    >
      {LOCATIONS.map((loc, i) => {
        const isActive = activeLocation === loc.id;
        return (
          <button
            key={loc.id}
            type="button"
            onClick={() => onSelectLocation(loc.id)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 min-h-[40px] font-pixel text-xs sm:text-sm tracking-wide transition-all cursor-pointer select-none ${
              isActive
                ? 'bg-[#5E8B4A] text-white border-2 border-[#24160B] shadow-[2px_2px_0_#24160B] -translate-y-0.5 font-bold'
                : 'bg-[#FFFDF8] text-[#24160B] hover:bg-[#F6EBD3] border-2 border-[#24160B]/40 shadow-[1px_1px_0_#24160B]/20'
            }`}
            aria-current={isActive ? 'location' : undefined}
            title={`Beralih ke ${loc.name}`}
          >
            {isActive && (
              <span className="w-2 h-2 bg-[#E8793A] border border-white inline-block animate-ping" />
            )}
            <span className="text-sm">{loc.icon}</span>
            <span>{loc.name}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default OverworldMapNav;
