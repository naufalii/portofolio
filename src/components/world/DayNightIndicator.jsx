import React, { useState } from 'react';
import { TIME_PHASES, TIME_CONFIG } from '../../hooks/useTimeOfDay';

/**
 * DayNightIndicator - Shows current atmospheric time phase and quick controls.
 */
export function DayNightIndicator({ phase, onSelectPhase, isManual }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentConfig = TIME_CONFIG[phase] || TIME_CONFIG.day;

  return (
    <div className="relative inline-block select-none z-30">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 border-2 border-[var(--ink)] bg-[var(--cream)] text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-pixel text-xs sm:text-sm cursor-pointer"
        title="Ubah Siklus Waktu (Simulasi)"
        aria-label={`Waktu saat ini: ${currentConfig.label}. Klik untuk simulasi waktu.`}
      >
        <span>{currentConfig.icon}</span>
        <span className="font-bold">{currentConfig.label.toUpperCase()}</span>
        {isManual && (
          <span className="text-[10px] px-1 bg-[var(--sunset)] text-[var(--cloud)]">
            SIMULASI
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 border-2 border-[var(--ink)] bg-[var(--cream)] p-2 shadow-[3px_3px_0_var(--ink)] space-y-1">
          <div className="text-[10px] font-pixel text-[var(--ink)]/70 px-1 border-b border-[var(--ink)]/20 pb-1 mb-1">
            PILIH SIKLUS WAKTU:
          </div>

          {Object.entries(TIME_CONFIG).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                onSelectPhase(key);
                setIsOpen(false);
              }}
              className={`w-full text-left px-2 py-1 font-pixel text-xs flex items-center justify-between border ${
                phase === key
                  ? 'border-[var(--ink)] bg-[var(--moss)] text-[var(--cloud)] font-bold'
                  : 'border-transparent hover:bg-[var(--cloud)] text-[var(--ink)]'
              }`}
            >
              <span>
                {item.icon} {item.label}
              </span>
              {phase === key && <span>✓</span>}
            </button>
          ))}

          {isManual && (
            <button
              type="button"
              onClick={() => {
                onSelectPhase(null);
                setIsOpen(false);
              }}
              className="w-full text-center mt-2 pt-1 border-t border-[var(--ink)]/20 text-[10px] font-pixel text-[var(--sunset)] hover:underline"
            >
              Reset ke Jam Lokal
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default DayNightIndicator;
