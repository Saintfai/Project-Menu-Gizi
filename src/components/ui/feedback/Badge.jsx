import React from 'react';
import PropTypes from 'prop-types';

/**
 * Badge Component for Statuses (Menunggu, Proses, Selesai)
 */
const Badge = ({
  children,
  variant = 'neutral',
  className = '',
  ...props
}) => {
  // Variant mappings using the specific domain colors from theme.css
  const variantClasses = {
    menunggu: 'bg-menunggu-100 text-menunggu-700 border-menunggu-200',
    proses: 'bg-proses-100 text-proses-700 border-proses-200',
    selesai: 'bg-selesai-100 text-selesai-700 border-selesai-200',
    success: 'bg-success-100 text-success-700 border-success-200',
    danger: 'bg-danger-100 text-danger-700 border-danger-200',
    warning: 'bg-warning-100 text-warning-700 border-warning-200',
    neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  };

  const selectedVariant = variantClasses[variant] || variantClasses.neutral;

  return (
    <span 
      className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold rounded-full border ${selectedVariant} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    'menunggu', 'proses', 'selesai', 'success', 'danger', 'warning', 'neutral'
  ]),
  className: PropTypes.string,
};

export default Badge;
