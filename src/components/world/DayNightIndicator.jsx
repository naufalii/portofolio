import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TIME_PHASES, TIME_CONFIG } from '../../hooks/useTimeOfDay';

/**
 * DayNightIndicator - Shows current atmospheric time phase and quick controls.
 * Fixes Bug 1.b: Renders dropdown menu via React Portal into document.body
 * so it is NEVER clipped or covered by header/navigation stacking contexts.
 */
export function DayNightIndicator({ phase, onSelectPhase, isManual }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const currentConfig = TIME_CONFIG[phase] || TIME_CONFIG.day;

  // Update dropdown portal position based on button rect
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + window.scrollY + 6,
        left: Math.max(10, rect.right + window.scrollX - 190), // Align right edge
      });
    }
  }, [isOpen]);

  // Handle click outside and Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        !e.target.closest('#day-night-portal-menu')
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 border-2 border-[var(--ink)] bg-[var(--cream)] text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-pixel text-xs sm:text-sm cursor-pointer select-none"
        title="Ubah Siklus Waktu (Simulasi)"
        aria-label={`Waktu saat ini: ${currentConfig.label}. Klik untuk simulasi waktu.`}
        aria-expanded={isOpen}
      >
        <span className="text-sm sm:text-base leading-none">{currentConfig.icon}</span>
        <span className="font-bold hidden sm:inline">{currentConfig.label.toUpperCase()}</span>
        {isManual && (
          <span className="text-[9px] px-1 bg-[var(--sunset)] text-[var(--cloud)] border border-[var(--ink)]">
            SIMULASI
          </span>
        )}
        <span className="text-[10px] ml-0.5">▼</span>
      </button>

      {/* Render via Portal to document.body to prevent any stacking/clipping */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            id="day-night-portal-menu"
            className="fixed z-[99999] w-48 border-4 border-[var(--ink)] bg-[var(--cream)] p-2.5 shadow-[4px_4px_0_var(--ink)] space-y-1.5 font-pixel"
            style={{
              top: `${menuPos.top}px`,
              left: `${menuPos.left}px`,
            }}
          >
            <div className="text-[11px] font-bold text-[var(--ink)]/80 px-1 border-b-2 border-[var(--ink)]/20 pb-1.5 flex items-center justify-between">
              <span>PILIH SIKLUS WAKTU:</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[10px] hover:text-[var(--sunset)] cursor-pointer"
                aria-label="Tutup menu"
              >
                ✕
              </button>
            </div>

            {Object.entries(TIME_CONFIG).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onSelectPhase(key);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between border-2 transition-all cursor-pointer ${
                  phase === key
                    ? 'border-[var(--ink)] bg-[var(--moss)] text-[var(--cloud)] font-bold shadow-[2px_2px_0_var(--ink)]'
                    : 'border-transparent hover:border-[var(--ink)]/30 hover:bg-[var(--cloud)] text-[var(--ink)]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {phase === key && <span className="font-bold">✓</span>}
              </button>
            ))}

            {isManual && (
              <button
                type="button"
                onClick={() => {
                  onSelectPhase(null);
                  setIsOpen(false);
                }}
                className="w-full text-center mt-2 pt-1.5 border-t-2 border-[var(--ink)]/20 text-[10px] text-[var(--sunset)] font-bold hover:underline cursor-pointer"
              >
                Reset ke Jam Lokal Pengunjung
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

export default DayNightIndicator;
