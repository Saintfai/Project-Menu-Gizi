import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

export const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  useEffect(() => {
    // Prevent scrolling on body when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-neutral-900/50 backdrop-blur-sm transition-all p-4 sm:p-0">
      {/* Overlay click to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      
      {/* Modal Content */}
      <div 
        className={`relative bg-neutral-0 rounded-xl shadow-xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh] ${className}`}
        role="dialog" 
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-neutral-200 rounded-t-xl">
          <h3 className="text-xl font-semibold text-neutral-900">
            {title}
          </h3>
          <button 
            type="button" 
            onClick={onClose}
            className="text-neutral-400 bg-transparent hover:bg-neutral-100 hover:text-neutral-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center transition-fast ease-in-out" 
          >
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
        </div>
        
        <div className="p-4 md:p-5 space-y-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Modal;
