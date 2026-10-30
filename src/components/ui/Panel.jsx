import React from 'react';

/**
 * Panel - 3px/4px solid pixel container with staircase/block shadow.
 * Follows Section 4.3 & Mobile Fix Fase 4 & Compact Desktop Mode:
 * - Reduced 3px border and 3px shadow on mobile and compact desktop
 * - Single outer frame per section with 16px horizontal padding
 * - Crisp header bar with icon and pixel title
 *
 * @param {string} title - Title badge at the top
 * @param {'default' | 'parchment' | 'moss' | 'sky'} variant
 * @param {boolean} isCompact - Compact mode for short desktop viewports (H < 700)
 */
export function Panel({
  children,
  title,
  icon,
  variant = 'default',
  className = '',
  headerAction,
  isCompact = false,
  ...props
}) {
  const variantStyles = {
    default: 'bg-[var(--cream)] text-[var(--ink)]',
    parchment: 'bg-[#FFFDF8] text-[var(--ink)]',
    moss: 'bg-[var(--moss)] text-[var(--cloud)]',
    sky: 'bg-[var(--sky-day)] text-[var(--ink)]',
    dark: 'bg-[var(--ink)] text-[var(--cream)]',
  };

  const borderClass = isCompact
    ? 'border-3 shadow-[3px_3px_0_var(--ink)]'
    : 'border-3 lg:border-4 shadow-[3px_3px_0_var(--ink)] lg:shadow-[4px_4px_0_var(--ink)]';

  const notchClass = isCompact ? 'w-1.5 h-1.5' : 'w-1.5 h-1.5 lg:w-2 lg:h-2';

  return (
    <div
      className={`relative ${borderClass} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {/* Decorative Pixel Corner notches */}
      <div className={`absolute -top-[3px] -left-[3px] ${notchClass} bg-[var(--ink)]`} />
      <div className={`absolute -top-[3px] -right-[3px] ${notchClass} bg-[var(--ink)]`} />
      <div className={`absolute -bottom-[3px] -left-[3px] ${notchClass} bg-[var(--ink)]`} />
      <div className={`absolute -bottom-[3px] -right-[3px] ${notchClass} bg-[var(--ink)]`} />

      {/* Header bar if title is provided */}
      {title && (
        <div
          className={`flex items-center justify-between ${
            isCompact
              ? 'border-b-3 px-3 py-1 text-xs lg:text-sm'
              : 'border-b-3 lg:border-b-4 px-3.5 lg:px-4 py-2 text-sm lg:text-base'
          } border-[var(--ink)] bg-[#F6EBD3] text-[var(--ink)] font-pixel font-bold tracking-wider select-none`}
        >
          <div className="flex items-center gap-2">
            {icon ? (
              <span className={isCompact ? 'text-sm leading-none' : 'text-base leading-none'}>
                {icon}
              </span>
            ) : (
              <span className="w-2.5 h-2.5 bg-[var(--sunset)] inline-block shadow-[1px_1px_0_var(--ink)]" />
            )}
            <span>{title}</span>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      {/* Main content body: tightly padded in compact mode, standard in normal */}
      <div className={`${isCompact ? 'p-2 lg:p-2' : 'p-4 lg:p-6'} font-body`}>
        {children}
      </div>
    </div>
  );
}

export default Panel;
