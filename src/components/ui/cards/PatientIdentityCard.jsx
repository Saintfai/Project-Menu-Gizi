import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';

export const PatientIdentityCard = ({ 
  name, 
  rmNumber, 
  room, 
  isVip = false, 
  className = '' 
}) => {
  return (
    <Card className={`p-4 flex items-start gap-4 ${className}`}>
      {/* Icon Avatar */}
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>
      
      {/* Patient Info */}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-bold text-neutral-900 leading-tight">
              {name}
            </h3>
            <p className="text-sm font-bold text-neutral-700 leading-tight">
              RM-{rmNumber}
            </p>
          </div>
          {isVip && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-warning-100 text-warning-800 uppercase tracking-wide">
              VIP Status
            </span>
          )}
        </div>
        <p className="text-sm text-neutral-500 mt-1">
          Kamar {room}
        </p>
      </div>
    </Card>
  );
};

PatientIdentityCard.propTypes = {
  name: PropTypes.string.isRequired,
  rmNumber: PropTypes.string.isRequired,
  room: PropTypes.string.isRequired,
  isVip: PropTypes.bool,
  className: PropTypes.string,
};

export default PatientIdentityCard;
