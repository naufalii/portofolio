import React from 'react';

/**
 * DialogBox - RPG style dialogue box.
 * Follows Mobile Fix Fase 2:
 * - Single-line name header (no role clutter in header)
 * - min-height: auto with clean 16px padding
 * - Interactive LANJUT button with arrow icon (min 44x44px tap area)
 * - High contrast 16-18px body text
 *
 * @param {string} speaker - Nameplate speaker label
 * @param {React.ReactNode} actions - Action buttons at the bottom
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
    <div className={`relative w-full select-text ${className}`}>
      {/* Outer Border & Box */}
      <div
        className="relative w-full border-3 lg:border-4 border-[#24160B] bg-[#FFFDF8] shadow-[3px_3px_0_#24160B] lg:shadow-[4px_4px_0_#24160B] lg:cursor-pointer"
        role="region"
        aria-label={`Dialog dari ${speaker}`}
        onClick={onNext}
      >
        {/* Corner Pixel Accents */}
        <div className="absolute -top-[3px] -left-[3px] w-1.5 h-1.5 lg:-top-[4px] lg:-left-[4px] lg:w-2 lg:h-2 bg-[#24160B]" />
        <div className="absolute -top-[3px] -right-[3px] w-1.5 h-1.5 lg:-top-[4px] lg:-right-[4px] lg:w-2 lg:h-2 bg-[#24160B]" />
        <div className="absolute -bottom-[3px] -left-[3px] w-1.5 h-1.5 lg:-bottom-[4px] lg:-left-[4px] lg:w-2 lg:h-2 bg-[#24160B]" />
        <div className="absolute -bottom-[3px] -right-[3px] w-1.5 h-1.5 lg:-bottom-[4px] lg:-right-[4px] lg:w-2 lg:h-2 bg-[#24160B]" />

        {/* Integrated Speaker Nameplate Bar: Nama di mobile, Nama + Role di desktop */}
        {speaker && (
          <div className="flex items-center justify-between border-b-3 lg:border-b-4 border-[#24160B] bg-[#F6EBD3] px-3.5 lg:px-5 py-2 select-none">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 bg-[#E8793A] border border-[#24160B] inline-block shadow-[1px_1px_0_#24160B] flex-shrink-0" />
              <span className="font-pixel text-base lg:text-lg font-bold text-[#24160B] tracking-wider truncate">
                {speaker}
              </span>
              {speakerRole && (
                <span className="hidden lg:inline font-body text-xs lg:text-sm text-[#3B5E34] font-bold bg-[#FFFDF8] border border-[#24160B]/40 px-2 py-0.5 shadow-[1px_1px_0_#24160B] whitespace-nowrap ml-2">
                  [{speakerRole}]
                </span>
              )}
            </div>

            <span className="text-[11px] font-pixel text-[#24160B]/60 hidden lg:inline flex-shrink-0 ml-2">
              *Klik kotak untuk memajukan dialog
            </span>
          </div>
        )}

        {/* Message Content: min-height: auto on mobile, min-h-[90px] on desktop */}
        <div
          className="p-4 lg:p-6 lg:min-h-[90px] text-[#24160B] font-body text-base lg:text-lg leading-relaxed selection:bg-[#E8793A] selection:text-white cursor-pointer"
          aria-live="polite"
          onClick={onNext}
        >
          {children}
        </div>

        {/* Bottom bar with action buttons and LANJUT indicator */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-3.5 lg:px-6 pb-3.5 lg:pb-3 pt-2 border-t-2 border-[#24160B]/15 bg-[#F6EBD3]/40">
          <div
            className="w-full lg:w-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {actions}
          </div>

          {showBlinker && (
            <>
              {/* Mobile (<1024px): Tombol interaktif min 44x44px sesuai Fase 2 */}
              <button
                type="button"
                onClick={onNext}
                className="lg:hidden self-end flex items-center gap-2 px-3 py-1.5 min-h-[44px] border-2 border-[#24160B] bg-[#5E8B4A] text-white font-pixel text-xs font-bold shadow-[2px_2px_0_#24160B] active:translate-y-[1px] active:shadow-none cursor-pointer whitespace-nowrap"
                aria-label="Lanjut ke dialog berikutnya"
              >
                <span>LANJUT</span>
                <span className="text-sm font-bold">&rarr;</span>
              </button>

              {/* Desktop (>=1024px): RPG bouncing indicator persis c383241 */}
              <div
                className="hidden lg:flex items-center gap-1.5 text-xs font-pixel text-[#3B5E34] font-bold select-none animate-bounce cursor-pointer"
                onClick={onNext}
              >
                <span>LANJUT</span>
                <span className="inline-block w-2.5 h-2.5 bg-[#E8793A] border border-[#24160B]" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DialogBox;
