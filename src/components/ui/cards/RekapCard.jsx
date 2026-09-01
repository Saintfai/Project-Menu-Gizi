import React from 'react';
import PropTypes from 'prop-types';

export const RekapCard = ({ 
  title, 
  icon, 
  total, 
  totalLabel = 'Total Porsi', 
  details = [], 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col p-4 bg-neutral-0 border border-neutral-200 rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        {icon && (
          <div className="text-primary-600">
            {icon}
          </div>
        )}
        <h3 className="font-semibold text-neutral-900 text-sm">{title}</h3>
      </div>

      {/* Main Stat */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-bold text-primary-700 leading-none">{total}</span>
        <span className="text-xs text-neutral-500 font-medium">{totalLabel}</span>
      </div>

      {/* Details */}
      {details.length > 0 && (
        <div className="mt-auto space-y-1.5 flex-1 flex flex-col justify-end">
          {details.map((detail, index) => (
            <div key={index} className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">{detail.label}</span>
              {detail.icon ? (
                <div className="text-primary-500">{detail.icon}</div>
              ) : (
                <span className="font-semibold text-primary-600">{detail.value}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

RekapCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  totalLabel: PropTypes.string,
  details: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      icon: PropTypes.node,
    })
  ),
  className: PropTypes.string,
};

export default RekapCard;
