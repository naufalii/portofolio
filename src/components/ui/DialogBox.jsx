import React from 'react';

/**
 * DialogBox - RPG style dialogue box with character nameplate.
 * Used for Hero dialogue and NPC narrative prompts.
 * Follows Section 5 and Section 6.
 *
 * @param {string} speaker - Nameplate speaker label
 * @param {string} text - Message text to display
 * @param {React.ReactNode} actions - Optional action buttons at the bottom
 * @param {boolean} showBlinker - Blinking indicator when dialogue is waiting
 * @param {() => void} onNext - Trigger on next dialogue or click
 */
export function DialogBox({
  speaker = 'Naufal Ali Hilmi',
  speakerRole = 'System Administrator / Oracle DBA Aspirant',
  children,
  actions,
  showBlinker = true,
  onNext,
  className = '',
}) {
  return (
    <div
      className={`relative w-full border-4 border-[var(--ink)] bg-[var(--cream)] shadow-[4px_4px_0_var(--ink)] ${className}`}
      role="region"
      aria-label={`Dialog dari ${speaker}`}
      onClick={onNext}
    >
      {/* Decorative Corner Accents */}
      <div className="absolute -top-[4px] -left-[4px] w-2 h-2 bg-[var(--ink)]" />
      <div className="absolute -top-[4px] -right-[4px] w-2 h-2 bg-[var(--ink)]" />
      <div className="absolute -bottom-[4px] -left-[4px] w-2 h-2 bg-[var(--ink)]" />
      <div className="absolute -bottom-[4px] -right-[4px] w-2 h-2 bg-[var(--ink)]" />

      {/* Speaker Nameplate */}
      {speaker && (
        <div className="absolute -top-5 left-4 border-2 border-[var(--ink)] bg-[var(--sunset)] text-[var(--cloud)] px-3 py-0.5 shadow-[2px_2px_0_var(--ink)]">
          <span className="font-pixel text-xs sm:text-sm font-bold tracking-wider">
            {speaker}
          </span>
          {speakerRole && (
            <span className="ml-2 hidden sm:inline text-[11px] font-body text-[var(--cream)] opacity-90">
              [{speakerRole}]
            </span>
          )}
        </div>
      )}

      {/* Message Content with accessibility polite live region */}
      <div
        className="pt-6 pb-4 px-4 sm:px-6 min-h-[96px] text-[var(--ink)] font-body text-base sm:text-lg leading-relaxed select-text"
        aria-live="polite"
      >
        {children}
      </div>

      {/* Bottom bar with action buttons and waiting indicator */}
      <div className="flex items-center justify-between px-4 sm:px-6 pb-3 pt-1 border-t-2 border-[var(--ink)]/15">
        <div className="flex items-center gap-2">
          {actions}
        </div>

        {showBlinker && (
          <div className="flex items-center gap-1.5 text-xs font-pixel text-[var(--moss-dark)] select-none animate-bounce">
            <span>LANJUT</span>
            <span className="inline-block w-2 h-2 bg-[var(--sunset)] border border-[var(--ink)]" />
          </div>
        )}
      </div>
    </div>
  );
}

export default DialogBox;
