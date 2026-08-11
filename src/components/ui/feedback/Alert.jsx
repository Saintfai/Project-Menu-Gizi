import React from 'react';
import PropTypes from 'prop-types';

export const Alert = ({ title, children, variant = 'danger', icon, className = '' }) => {
  const variantStyles = {
    danger: 'bg-danger-50 text-danger-700 border-danger-100',
    warning: 'bg-warning-50 text-warning-700 border-warning-100',
    success: 'bg-success-50 text-success-700 border-success-100',
    info: 'bg-primary-50 text-primary-700 border-primary-100',
  };

  const selectedVariant = variantStyles[variant] || variantStyles.danger;

  return (
    <div className={`flex items-start p-4 border rounded-lg ${selectedVariant} ${className}`}>
      {icon && (
        <div className="flex-shrink-0 mr-3 mt-0.5">
          {icon}
        </div>
      )}
      <div className="text-sm">
        {title && <h4 className="font-bold mb-0.5">{title}</h4>}
        <div className={title ? "font-normal" : "font-medium"}>
          {children}
        </div>
      </div>
    </div>
  );
};

Alert.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['danger', 'warning', 'success', 'info']),
  icon: PropTypes.node,
  className: PropTypes.string,
};

export default Alert;
