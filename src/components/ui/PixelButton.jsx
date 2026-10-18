import React from 'react';

/**
 * PixelButton - Retro 4px unit pixel button component.
 * Wrapper following Section 4.3 and Section 6.
 *
 * @param {'primary' | 'secondary' | 'neutral' | 'dark'} variant
 * @param {'sm' | 'md' | 'lg'} size
 */
export function PixelButton({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-pixel font-bold select-none cursor-pointer tracking-wider transition-all duration-75 active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sunset)]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1 border-[2px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)] active:shadow-none min-h-[32px]',
    md: 'text-sm sm:text-base px-4 py-2 border-[3px] border-[var(--ink)] shadow-[3px_3px_0_var(--ink)] active:shadow-none min-h-[44px]',
    lg: 'text-base sm:text-lg px-6 py-3 border-[4px] border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] active:shadow-none min-h-[48px]',
  };

  const variantStyles = {
    primary:
      'bg-[var(--moss)] text-[var(--cloud)] hover:bg-[var(--moss-dark)] active:bg-[var(--moss-dark)]',
    secondary:
      'bg-[var(--sunset)] text-[var(--cloud)] hover:brightness-110 active:brightness-95',
    neutral:
      'bg-[var(--cream)] text-[var(--ink)] hover:bg-[var(--cloud)] active:bg-[var(--cream)]',
    dark:
      'bg-[var(--ink)] text-[var(--cream)] hover:bg-[var(--moss-dark)] active:bg-[var(--ink)]',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default PixelButton;
