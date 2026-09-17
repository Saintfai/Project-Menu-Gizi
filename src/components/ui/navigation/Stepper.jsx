import React from 'react';
import PropTypes from 'prop-types';
import { Minus, Plus } from 'lucide-react';

export const Stepper = ({ value = 0, min = 0, max = 99, onChange, className = '' }) => {
  const handleDecrement = (e) => {
    e.stopPropagation();
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (value < max) onChange(value + 1);
  };

  return (
    <div className={`flex items-center justify-between bg-neutral-100/70 border border-neutral-200/80 rounded-xl p-1.5 ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label="Kurangi jumlah"
        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white text-neutral-700 shadow-sm border border-neutral-200/80 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 active:scale-95 transition-all outline-none"
      >
        <Minus className="w-4 h-4" strokeWidth={2.5} />
      </button>
      
      <span className="font-bold text-neutral-800 text-sm sm:text-base w-8 text-center select-none">
        {value}
      </span>
      
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label="Tambah jumlah"
        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-white text-neutral-700 shadow-sm border border-neutral-200/80 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 active:scale-95 transition-all outline-none"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
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
