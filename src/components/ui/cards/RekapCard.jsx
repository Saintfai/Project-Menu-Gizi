import React from 'react';
import PropTypes from 'prop-types';

// Kartu ringkasan rekapitulasi data porsi per sesi makan dan menu ekstra di dashboard admin
export const RekapCard = ({ 
  title, 
  icon, 
  total, 
  totalLabel = 'Total Porsi', 
  details = [], 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col p-4 bg-white border border-neutral-200 rounded-xl shadow-xs ${className}`}>
      <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-neutral-100">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <h3 className="font-bold text-neutral-800 text-xs uppercase tracking-wider">{title}</h3>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 leading-none">{total}</span>
        <span className="text-xs text-neutral-500 font-semibold">{totalLabel}</span>
      </div>

      {details.length > 0 && (
        <div className="mt-auto space-y-1.5 flex-1 flex flex-col justify-end pt-2 border-t border-neutral-100">
          {details.map((detail, index) => (
            <div key={index} className="flex justify-between items-center text-xs gap-2">
              <span 
                className="text-neutral-600 font-medium truncate flex-1 min-w-0" 
                title={detail.label}
              >
                {detail.label}
              </span>
              {detail.icon ? (
                <div className="text-primary-600 flex-shrink-0">{detail.icon}</div>
              ) : (
                <span className="font-bold text-neutral-800 flex-shrink-0 tabular-nums">{detail.value}</span>
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

