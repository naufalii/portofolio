import React from 'react';

/**
 * Panel - 3px/4px solid pixel container with staircase/block shadow.
 * Follows Section 4.3 & Mobile Fix Fase 4:
 * - Reduced 3px border and 3px shadow on mobile
 * - Single outer frame per section with 16px horizontal padding
 * - Crisp header bar with icon and pixel title
 *
 * @param {string} title - Title badge at the top
 * @param {'default' | 'parchment' | 'moss' | 'sky'} variant
 */
export function Panel({
  children,
  title,
  icon,
  variant = 'default',
  className = '',
  headerAction,
  ...props
}) {
  const variantStyles = {
    default: 'bg-[var(--cream)] text-[var(--ink)]',
    parchment: 'bg-[#FFFDF8] text-[var(--ink)]',
    moss: 'bg-[var(--moss)] text-[var(--cloud)]',
    sky: 'bg-[var(--sky-day)] text-[var(--ink)]',
    dark: 'bg-[var(--ink)] text-[var(--cream)]',
  };

  return (
    <div
      className={`relative border-3 lg:border-4 border-[var(--ink)] shadow-[3px_3px_0_var(--ink)] lg:shadow-[4px_4px_0_var(--ink)] ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {/* Decorative Pixel Corner notches */}
      <div className="absolute -top-[3px] -left-[3px] w-1.5 h-1.5 lg:w-2 lg:h-2 bg-[var(--ink)]" />
      <div className="absolute -top-[3px] -right-[3px] w-1.5 h-1.5 lg:w-2 lg:h-2 bg-[var(--ink)]" />
      <div className="absolute -bottom-[3px] -left-[3px] w-1.5 h-1.5 lg:w-2 lg:h-2 bg-[var(--ink)]" />
      <div className="absolute -bottom-[3px] -right-[3px] w-1.5 h-1.5 lg:w-2 lg:h-2 bg-[var(--ink)]" />

      {/* Header bar if title is provided */}
      {title && (
        <div className="flex items-center justify-between border-b-3 lg:border-b-4 border-[var(--ink)] px-3.5 lg:px-4 py-2 bg-[#F6EBD3] text-[var(--ink)] font-pixel text-sm lg:text-base font-bold tracking-wider select-none">
          <div className="flex items-center gap-2">
            {icon ? (
              <span className="text-base leading-none">{icon}</span>
            ) : (
              <span className="w-2.5 h-2.5 bg-[var(--sunset)] inline-block shadow-[1px_1px_0_var(--ink)]" />
            )}
            <span>{title}</span>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      {/* Main content body: 16px horizontal padding on mobile */}
      <div className="p-4 lg:p-6 font-body">{children}</div>
    </div>
  );
}

export default Panel;
