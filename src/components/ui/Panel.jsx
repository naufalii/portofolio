import React from 'react';

/**
 * Panel - 4px solid pixel container with staircase/block shadow.
 * Follows Section 4.3 specification.
 *
 * @param {string} title - Optional title badge at the top
 * @param {'default' | 'parchment' | 'moss' | 'sky'} variant
 */
export function Panel({
  children,
  title,
  variant = 'default',
  className = '',
  headerAction,
  ...props
}) {
  const variantStyles = {
    default: 'bg-[var(--cream)] text-[var(--ink)]',
    parchment: 'bg-[#FFFDF7] text-[var(--ink)]',
    moss: 'bg-[var(--moss)] text-[var(--cloud)]',
    sky: 'bg-[var(--sky-day)] text-[var(--ink)]',
    dark: 'bg-[var(--ink)] text-[var(--cream)]',
  };

  return (
    <div
      className={`relative border-4 border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {/* Decorative Pixel Corner notches */}
      <div className="absolute -top-[4px] -left-[4px] w-2 h-2 bg-[var(--ink)]" />
      <div className="absolute -top-[4px] -right-[4px] w-2 h-2 bg-[var(--ink)]" />
      <div className="absolute -bottom-[4px] -left-[4px] w-2 h-2 bg-[var(--ink)]" />
      <div className="absolute -bottom-[4px] -right-[4px] w-2 h-2 bg-[var(--ink)]" />

      {/* Header bar if title is provided */}
      {title && (
        <div className="flex items-center justify-between border-b-4 border-[var(--ink)] px-4 py-2 bg-[var(--cream)] text-[var(--ink)] font-pixel text-sm sm:text-base font-bold tracking-wider select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[var(--sunset)] inline-block shadow-[1px_1px_0_var(--ink)]" />
            <span>{title}</span>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      {/* Main content body */}
      <div className="p-4 sm:p-6 font-body">{children}</div>
    </div>
  );
}

export default Panel;
