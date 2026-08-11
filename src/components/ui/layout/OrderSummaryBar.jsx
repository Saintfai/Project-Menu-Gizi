import React from 'react';
import PropTypes from 'prop-types';
import Button from '../buttons/Button';

export const OrderSummaryBar = ({ 
  itemCount = 0, 
  onNextClick, 
  className = '' 
}) => {
  return (
    <div className={`bg-primary-700 text-neutral-0 rounded-xl p-4 flex items-center justify-between shadow-lg ${className}`}>
      {/* Left: Icon & Item Count */}
      <div className="flex items-center">
        <div className="relative mr-3">
          {/* Shopping Bag Icon */}
          <svg className="w-6 h-6 text-neutral-0 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {/* Badge */}
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-danger-500 text-neutral-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {itemCount}
            </span>
          )}
        </div>
        <div>
          <div className="font-bold text-[15px] leading-tight">{itemCount} Item</div>
          <div className="text-xs text-primary-100 leading-tight">Item terpilih</div>
        </div>
      </div>

      {/* Right: Button */}
      <button 
        onClick={onNextClick}
        className="bg-neutral-0 text-primary-700 hover:bg-neutral-50 px-4 py-2 rounded-lg text-sm font-semibold transition-fast flex items-center gap-1.5 border-none outline-none cursor-pointer"
      >
        Lanjut ke Ringkasan
        <svg className="w-4 h-4 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

OrderSummaryBar.propTypes = {
  itemCount: PropTypes.number,
  onNextClick: PropTypes.func,
  className: PropTypes.string,
};

export default OrderSummaryBar;
