import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Button component
 * Menggunakan utility classes dari Tailwind yang sudah di-mapping ke theme.css
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  pill = false,
  className = '',
  type = 'button',
  ...props
}) => {
  // Base classes (transisi, font-weight, fix browser defaults)
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-normal ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 border border-transparent appearance-none';
  const radiusClass = pill ? 'rounded-full' : 'rounded-md';
  
  // Size variations
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // Variant variations (menggunakan warna dari theme.css via tailwind.config)
  const variantClasses = {
    primary: 'bg-primary-600 text-neutral-0 hover:bg-primary-700 border border-transparent',
    danger: 'bg-danger-600 text-neutral-0 hover:bg-danger-700 border border-transparent',
    outline: 'bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 border border-transparent',
    soft: 'bg-primary-50 text-primary-700 hover:bg-primary-100 border border-transparent',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';

  // Gabungkan semua class
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
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'danger', 'outline', 'ghost', 'soft']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  pill: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset'])
};

export default Button;
