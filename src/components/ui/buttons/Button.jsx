/**
 * NAMA FILE: Button.jsx
 * FUNGSI UTAMA: Komponen UI Tombol (Button) yang dapat digunakan ulang (reusable).
 * 
 * DETAIL:
 * - Menyediakan berbagai variasi tombol (primary, danger, outline, ghost, soft).
 * - Menangani interaksi klik, loading spinner, dan disabled state.
 * - Menggunakan ukuran touch target yang ramah mobile (min-height >= 44px untuk md).
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  fullWidth = false,
  pill = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 border border-transparent select-none active:scale-[0.98]';
  const radiusClass = pill ? 'rounded-full' : 'rounded-xl';

  const sizeClasses = {
    sm: 'px-3.5 py-2 text-xs gap-1.5 min-h-[36px]',
    md: 'px-4 py-2.5 text-sm gap-2 min-h-[44px]',
    lg: 'px-6 py-3.5 text-base gap-2.5 min-h-[48px]',
  };

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-900/10 active:bg-primary-800 border-transparent',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 shadow-md shadow-danger-900/10 active:bg-danger-800 border-transparent',
    outline: 'bg-transparent border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 active:bg-neutral-100',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 border-transparent',
    soft: 'bg-primary-50 text-primary-700 hover:bg-primary-100 active:bg-primary-200 border-transparent',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const isDisabled = disabled || isLoading;
  const disabledClass = isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none active:scale-100' : 'cursor-pointer';

  const combinedClasses = [
    baseClasses,
    radiusClass,
    sizeClasses[size] || sizeClasses.md,
    variantClasses[variant] || variantClasses.primary,
    widthClass,
    disabledClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      type={type}
      className={combinedClasses} 
      disabled={isDisabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0 flex items-center">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0 flex items-center">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'danger', 'outline', 'ghost', 'soft']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  fullWidth: PropTypes.bool,
  pill: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset'])
};

export default Button;
