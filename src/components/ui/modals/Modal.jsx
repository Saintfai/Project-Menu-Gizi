import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

export const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  useEffect(() => {
    // Kunci scroll pada body saat modal terbuka
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Dukungan tombol Escape keyboard untuk menutup modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
      {/* Fullscreen Backdrop Blur lembut dan tidak terlalu gelap */}
      <div 
        className="fixed inset-0 bg-neutral-900/20 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      
      <div 
        className={`relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${className}`}
        role="dialog" 
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-neutral-100 bg-neutral-50/70 rounded-t-2xl">
          <h3 className="text-lg font-bold text-neutral-900 leading-tight">
            {title}
          </h3>
          <button 
            type="button" 
            onClick={onClose}
            className="text-neutral-400 bg-transparent hover:bg-neutral-200/60 hover:text-neutral-700 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center transition-colors cursor-pointer border-none outline-none" 
          >
            <svg className="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span className="sr-only">Tutup modal</span>
          </button>
        </div>
        
        <div className="p-4 md:p-5 space-y-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Modal;
