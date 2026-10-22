import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { Utensils, Send, Info } from 'lucide-react';

// Modal pemilihan jadwal penyajian (Hari Ini atau Besok) untuk menu ekstra — layout identik dengan IncludeModal
export const EkstraModal = ({ isOpen, onClose, itemData, onSave, isHariIniDisabled = false, isBesokDisabled = false }) => {
  const [selected, setSelected] = useState('HARI_INI');

  useEffect(() => {
    if (isOpen) {
      if (!isHariIniDisabled) {
        setSelected('HARI_INI');
      } else if (!isBesokDisabled) {
        setSelected('BESOK');
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, itemData, isHariIniDisabled, isBesokDisabled]);

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

  if (!isOpen || !itemData) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
      {/* Fullscreen Backdrop Blur yang menutupi seluruh layar secara merata dan lembut */}
      <div 
        className="fixed inset-0 bg-neutral-900/20 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div 
        className="relative z-10 bg-white w-full max-w-md sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        style={{ maxHeight: '85vh' }}
      >
        {/* Drag handle pill untuk tampilan layar mobile */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-neutral-200 rounded-full" />
        </div>

        {/* Gambar hero menu */}
        <div className="w-full h-48 sm:h-56 bg-neutral-100 flex-shrink-0 relative">
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

        <div className="px-5 pt-4 pb-2">
          <h3 className="text-lg font-bold text-neutral-900">
            {itemData.paketName || itemData.name}
          </h3>
          <p className="text-sm text-neutral-500 mt-1 leading-relaxed">
            {itemData.description}
          </p>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => !isHariIniDisabled && setSelected('HARI_INI')}
              disabled={isHariIniDisabled}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-full border-0 outline-none transition-all cursor-pointer ${
                isHariIniDisabled
                  ? 'bg-neutral-100 text-neutral-400 opacity-50 cursor-not-allowed'
                  : selected === 'HARI_INI'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-neutral-200 text-neutral-500 hover:bg-neutral-300'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => !isBesokDisabled && setSelected('BESOK')}
              disabled={isBesokDisabled}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-full border-0 outline-none transition-all cursor-pointer ${
                isBesokDisabled
                  ? 'bg-neutral-100 text-neutral-400 opacity-50 cursor-not-allowed'
                  : selected === 'BESOK'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-neutral-200 text-neutral-500 hover:bg-neutral-300'
              }`}
            >
              Besok
            </button>
          </div>

          {/* Informasi batas order sesuai pilihan */}
          <div className="mt-3 flex items-start gap-2 text-xs text-neutral-500">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-primary-500" />
            <span>
              {selected === 'HARI_INI'
                ? 'Batas order untuk makan siang pukul 10.00 WIB, dan untuk makan sore 14.00 WIB.'
                : 'Batas order jam 15.00 WIB khusus untuk besok.'}
            </span>
          </div>
        </div>

        <div className="px-5 pb-5 pt-2 flex-shrink-0">
          <button
            onClick={() => onSave(selected)}
            disabled={(selected === 'HARI_INI' && isHariIniDisabled) || (selected === 'BESOK' && isBesokDisabled)}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-full shadow-lg border-0 outline-none transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4 rotate-45 mb-0.5" />
            Simpan Pesanan
          </button>
        </div>
      </div>
    </div>
  );

  // Render via portal ke document.body agar tidak terpotong oleh PageTransition atau container layout
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};

EkstraModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  itemData: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  isHariIniDisabled: PropTypes.bool,
  isBesokDisabled: PropTypes.bool,
};

export default EkstraModal;
