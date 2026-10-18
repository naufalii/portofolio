import React, { useEffect } from 'react';

/**
 * Pixel Toast component per Section 6.
 * Displays temporary status messages for forms and user actions.
 */
export function Toast({
  message,
  type = 'info',
  onClose,
  duration = 4000,
}) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const typeStyles = {
    success: 'bg-[var(--moss)] text-[var(--cloud)] border-[var(--ink)]',
    error: 'bg-[var(--sunset)] text-[var(--cloud)] border-[var(--ink)]',
    info: 'bg-[var(--cream)] text-[var(--ink)] border-[var(--ink)]',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce"
    >
      <div
        className={`border-4 p-4 shadow-[4px_4px_0_var(--ink)] flex items-start justify-between gap-3 font-pixel ${typeStyles[type]}`}
      >
        <div className="flex items-center gap-2 text-sm sm:text-base">
          <span className="font-bold text-lg">{icons[type]}</span>
          <span className="font-body text-xs sm:text-sm font-semibold">{message}</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-xs px-1.5 py-0.5 border border-current hover:opacity-80 active:translate-y-0.5 cursor-pointer"
          aria-label="Tutup notifikasi"
        >
          TUTUP
        </button>
      </div>
    </div>
  );
}

export default Toast;
