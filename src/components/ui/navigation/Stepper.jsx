import React from 'react';
import PropTypes from 'prop-types';

export const Stepper = ({ value = 0, min = 0, max = 99, onChange, className = '' }) => {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className={`flex items-center justify-between bg-neutral-50 border border-neutral-100 rounded-lg p-1 ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className="w-8 h-8 flex items-center justify-center rounded-md bg-neutral-0 text-neutral-600 shadow-sm border border-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100 transition-fast"
      >
        <svg className="w-4 h-4 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
        </svg>
      </button>
      
      <span className="font-bold text-neutral-900 w-8 text-center">{value}</span>
      
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className="w-8 h-8 flex items-center justify-center rounded-md bg-neutral-0 text-neutral-600 shadow-sm border border-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100 transition-fast"
      >
        <svg className="w-4 h-4 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

Stepper.propTypes = {
  value: PropTypes.number.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default Stepper;
