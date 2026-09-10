import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Utensils, Send } from 'lucide-react';

export const IncludeModal = ({ isOpen, onClose, itemData, onSave, takenRoles = [] }) => {
  const [selected, setSelected] = useState('PASIEN');

  useEffect(() => {
    if (isOpen) {
      if (!takenRoles.includes('PASIEN')) {
        setSelected('PASIEN');
      } else if (!takenRoles.includes('PENDAMPING')) {
        setSelected('PENDAMPING');
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, itemData, takenRoles]);

  if (!isOpen || !itemData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-0 sm:p-4 md:p-6">
      {/* Overlay click to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Card */}
      <div 
        className="relative bg-white w-full max-w-md sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95"
        role="dialog"
        aria-modal="true"
        style={{ maxHeight: '85vh' }}
      >
        {/* Draggable indicator line (optional UX detail) - Hidden on larger screens */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-neutral-200 rounded-full" />
        </div>

        {/* Image Area */}
        <div className="w-full h-48 sm:h-56 bg-neutral-100 flex-shrink-0">
          {itemData.image || itemData.imageUrl ? (
            <img 
              src={itemData.image || itemData.imageUrl} 
              alt={itemData.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-200/50 text-neutral-400">
              <Utensils className="w-14 h-14 opacity-40" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-5 pt-4 pb-2">
          <h3 className="text-lg font-bold text-neutral-900">
            {itemData.paketName || itemData.name}
          </h3>
          <p className="text-sm text-neutral-500 mt-1 leading-relaxed">
            {itemData.description}
          </p>

          {/* Toggle Consumer Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => !takenRoles.includes('PASIEN') && setSelected('PASIEN')}
              disabled={takenRoles.includes('PASIEN')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-full border-0 outline-none transition-all ${
                takenRoles.includes('PASIEN')
                  ? 'bg-neutral-100 text-neutral-400 opacity-50 cursor-not-allowed'
                  : selected === 'PASIEN'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-neutral-200 text-neutral-500 hover:bg-neutral-300'
              }`}
            >
              Pasien
            </button>
            <button
              onClick={() => !takenRoles.includes('PENDAMPING') && setSelected('PENDAMPING')}
              disabled={takenRoles.includes('PENDAMPING')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-full border-0 outline-none transition-all ${
                takenRoles.includes('PENDAMPING')
                  ? 'bg-neutral-100 text-neutral-400 opacity-50 cursor-not-allowed'
                  : selected === 'PENDAMPING'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-neutral-200 text-neutral-500 hover:bg-neutral-300'
              }`}
            >
              Pendamping
            </button>
          </div>
        </div>

        {/* Fixed Bottom Button */}
        <div className="px-5 pb-5 pt-2 flex-shrink-0">
          <button
            onClick={() => onSave(selected)}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm rounded-full shadow-lg border-0 outline-none transition-colors"
          >
            <Send className="w-4 h-4 rotate-45 mb-0.5" />
            Simpan Pesanan
          </button>
        </div>
      </div>
    </div>
  );
};

IncludeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  itemData: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  takenRoles: PropTypes.array,
};

export default IncludeModal;
