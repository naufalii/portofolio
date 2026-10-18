import React from 'react';

/**
 * DialogBox - RPG style dialogue box with character nameplate.
 * Fixes Bug 1.a: Integrated nameplate with proper top clearance to prevent clipping.
 * Contrast enhanced: #24160B on #FFFDF7 (contrast ratio > 12:1).
 *
 * @param {string} speaker - Nameplate speaker label
 * @param {string} speakerRole - Subtitle role for speaker
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
    <div className={`relative pt-4 w-full select-text ${className}`}>
      {/* Outer Border & Box */}
      <div
        className="relative w-full border-4 border-[#24160B] bg-[#FFFDF8] shadow-[4px_4px_0_#24160B] cursor-pointer"
        role="region"
        aria-label={`Dialog dari ${speaker}`}
        onClick={onNext}
      >
        {/* Corner Pixel Accents */}
        <div className="absolute -top-[4px] -left-[4px] w-2 h-2 bg-[#24160B]" />
        <div className="absolute -top-[4px] -right-[4px] w-2 h-2 bg-[#24160B]" />
        <div className="absolute -bottom-[4px] -left-[4px] w-2 h-2 bg-[#24160B]" />
        <div className="absolute -bottom-[4px] -right-[4px] w-2 h-2 bg-[#24160B]" />

        {/* Integrated Speaker Nameplate Bar (Prevents any clipping issues) */}
        {speaker && (
          <div className="flex flex-wrap items-center justify-between border-b-4 border-[#24160B] bg-[#F6EBD3] px-4 py-2 select-none">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#E8793A] border-2 border-[#24160B] inline-block shadow-[1px_1px_0_#24160B]" />
              <span className="font-pixel text-sm sm:text-base font-bold text-[#24160B] tracking-wider">
                {speaker}
              </span>
              {speakerRole && (
                <span className="font-body text-xs sm:text-sm text-[#3B5E34] font-bold bg-[#FFFDF8] border border-[#24160B]/40 px-2 py-0.5 shadow-[1px_1px_0_#24160B]">
                  {speakerRole}
                </span>
              )}
            </div>

            <span className="text-[11px] font-pixel text-[#24160B]/60 hidden sm:inline">
              *Klik kotak untuk memajukan dialog
            </span>
          </div>
        )}

        {/* Message Content: Clean 16-18px font with high contrast */}
        <div
          className="p-4 sm:p-6 min-h-[90px] text-[#24160B] font-body text-base sm:text-lg leading-relaxed selection:bg-[#E8793A] selection:text-white"
          aria-live="polite"
        >
          {children}
        </div>

        {/* Bottom bar with action buttons and waiting indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 pb-3 pt-2 border-t-2 border-[#24160B]/15 bg-[#F6EBD3]/40">
          <div
            className="flex flex-wrap items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {actions}
          </div>

          {showBlinker && (
            <div className="flex items-center gap-1.5 text-xs font-pixel text-[#3B5E34] font-bold select-none animate-bounce">
              <span>LANJUT</span>
              <span className="inline-block w-2.5 h-2.5 bg-[#E8793A] border border-[#24160B]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DialogBox;
