import React from 'react';
import PropTypes from 'prop-types';
import Button from '../buttons/Button';

export const StickyFooter = ({ 
  currentStep = 1, 
  totalSteps = 6, 
  onDetailClick, 
  onConfirmClick, 
  confirmText = 'Lanjut ke Konfirmasi',
  className = '' 
}) => {
  return (
    <div className={`fixed bottom-4 left-4 right-4 bg-neutral-0 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-4 z-fixed md:max-w-md md:mx-auto md:left-auto md:right-auto md:w-[calc(100%-2rem)] ${className}`}>
      {/* Info Row */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-[13px] font-medium text-neutral-600">
          Total Paket: <span className="font-bold text-primary-600 ml-1">{currentStep}/{totalSteps}</span>
        </div>
        <button 
          onClick={onDetailClick}
          className="flex items-center text-xs text-neutral-500 hover:text-neutral-900 transition-fast bg-transparent border-none appearance-none outline-none p-0 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Lihat Detail
        </button>
      </div>

      {/* Action Button */}
      <Button 
        variant="primary" 
        fullWidth 
        onClick={onConfirmClick}
        className="flex items-center justify-center gap-2 rounded-lg py-3 font-semibold shadow-sm"
      >
        {confirmText}
        <svg className="w-4 h-4 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </Button>
    </div>
  );
};

StickyFooter.propTypes = {
  currentStep: PropTypes.number,
  totalSteps: PropTypes.number,
  onDetailClick: PropTypes.func,
  onConfirmClick: PropTypes.func,
  confirmText: PropTypes.string,
  className: PropTypes.string,
};

export default StickyFooter;
