import React, { useEffect } from 'react';

/**
 * PaginationControls - Retro pixel-styled pagination toolbar.
 * Implements Bagian 3 & 4 of Pagination Specification:
 * - Left button: ← Sebelumnya (disabled on page 1)
 * - Center indicator: "Halaman 1 / N"
 * - Right button: Berikutnya → (disabled on last page)
 * - Pixel aesthetic: font-alt-pixel, min 44px touch target, ink (#24160B) and cream (#F6EBD3)
 * - Keyboard navigation: PageDown / PageUp
 * - Shifts focus to new page title / heading on page turn
 * - Accessible announcements via aria-live="polite"
 * - Hidden on mobile or when totalPages <= 1
 */
export function PaginationControls({
  currentPage = 0,
  totalPages = 1,
  onPrev,
  onNext,
  sectionTitle = 'Halaman',
  className = '',
}) {
  const isFirst = currentPage === 0;
  const isLast = currentPage >= totalPages - 1;

  // Global PageUp / PageDown listener when focus is within active panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept when user is typing in form inputs, textareas, or selects
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return;
      }

      if (e.key === 'PageDown') {
        if (!isLast) {
          e.preventDefault();
          onNext?.();
        }
      } else if (e.key === 'PageUp') {
        if (!isFirst) {
          e.preventDefault();
          onPrev?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFirst, isLast, onPrev, onNext]);

  // Shift focus to section title / heading on page change (Bagian 3)
  useEffect(() => {
    const activeSection = document.querySelector('[id^="active-section-"]');
    if (activeSection) {
      const heading = activeSection.querySelector(
        'h1, h2, h3, [role="region"], [data-panel-heading="true"]'
      );
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
  }, [currentPage]);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Paginasi Halaman Section"
      className={`mt-2 flex items-center justify-between border-2 border-[#24160B] bg-[#F6EBD3] p-1.5 shadow-[2px_2px_0_#24160B] select-none ${className}`}
    >
      {/* Previous button */}
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirst}
        className="flex items-center justify-center min-h-[44px] min-w-[44px] px-3 py-1.5 border-2 border-[#24160B] bg-[#FFFDF8] text-[#24160B] font-alt-pixel text-xs font-bold shadow-[2px_2px_0_#24160B] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer hover:bg-[#F6EBD3] transition-colors"
        aria-label="Halaman sebelumnya"
      >
        ← Sebelumnya
      </button>

      {/* Center page indicator */}
      <div
        className="flex items-center gap-1.5 font-alt-pixel text-xs font-bold text-[#24160B] px-3 py-1 bg-[#FFFDF8] border border-[#24160B]/40 shadow-[1px_1px_0_#24160B]"
        aria-current="page"
      >
        <span className="text-[#3B5E34]">Halaman</span>
        <span className="text-[#E8793A]">{currentPage + 1}</span>
        <span className="text-[#24160B]/50">/</span>
        <span>{totalPages}</span>
      </div>

      {/* Next button */}
      <button
        type="button"
        onClick={onNext}
        disabled={isLast}
        className="flex items-center justify-center min-h-[44px] min-w-[44px] px-3 py-1.5 border-2 border-[#24160B] bg-[#FFFDF8] text-[#24160B] font-alt-pixel text-xs font-bold shadow-[2px_2px_0_#24160B] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer hover:bg-[#F6EBD3] transition-colors"
        aria-label="Halaman berikutnya"
      >
        Berikutnya →
      </button>

      {/* Screen Reader Live Region for polite arrival announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {`${sectionTitle}: Halaman ${currentPage + 1} dari ${totalPages} ditampilkan.`}
      </div>
    </nav>
  );
}

export default PaginationControls;
