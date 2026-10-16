import React from 'react';
import PropTypes from 'prop-types';
import { Minus, Plus } from 'lucide-react';

// Komponen pengatur jumlah porsi (+ / -) dengan batas minimal dan maksimal
export const Stepper = ({ value = 0, min = 0, max = 99, onChange, className = '' }) => {
  // Kurangi jumlah porsi jika masih di atas batas minimal
  const handleDecrement = (e) => {
    e.stopPropagation();
    if (value > min) onChange(value - 1);
  };

  // Tambah jumlah porsi jika belum melebihi batas maksimal
  const handleIncrement = (e) => {
    e.stopPropagation();
    if (value < max) onChange(value + 1);
  };

  const isMin = value <= min;
  const isMax = value >= max;

  return (
    <div className={`flex items-center justify-between bg-neutral-100 rounded-xl p-1 border-none outline-none ring-0 ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isMin}
        aria-label="Kurangi jumlah"
        className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg transition-all border-none outline-none ring-0 cursor-pointer ${
          isMin 
            ? 'bg-white/50 text-neutral-300 shadow-none cursor-not-allowed' 
            : 'bg-white text-neutral-800 shadow-[0_1px_4px_rgba(0,0,0,0.12)] hover:shadow-md active:scale-95'
        }`}
      >
        <Minus className="w-4 h-4" strokeWidth={2.5} />
      </button>
      
      <span className="font-bold text-neutral-800 text-sm sm:text-base w-8 text-center select-none">
        {value}
      </span>
      
      <button
        type="button"
        onClick={handleIncrement}
        disabled={isMax}
        aria-label="Tambah jumlah"
        className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg transition-all border-none outline-none ring-0 cursor-pointer ${
          isMax 
            ? 'bg-white/50 text-neutral-300 shadow-none cursor-not-allowed' 
            : 'bg-white text-neutral-800 shadow-[0_1px_4px_rgba(0,0,0,0.12)] hover:shadow-md active:scale-95'
        }`}
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
