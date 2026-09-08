import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Utensils, Minus, Plus, Send } from 'lucide-react';

export const ExcludeModal = ({ isOpen, onClose, itemData, initialQuantity = 0, onSave }) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity || 0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, itemData, initialQuantity]);

  if (!isOpen || !itemData) return null;

  const handleDecrement = () => setQuantity(prev => Math.max(0, prev - 1));
  const handleIncrement = () => setQuantity(prev => prev + 1);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-0 sm:p-4 md:p-6">
      {/* Overlay click to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Card */}
      <div 
        className="relative bg-white w-full max-w-md sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95"
        role="dialog"
        aria-modal="true"
        style={{ maxHeight: '90vh' }}
      >
        <div className="px-5 pt-3 pb-0 flex flex-col items-center">
          {/* Draggable indicator line (optional UX detail) */}
          <div className="w-12 h-1.5 bg-neutral-200 rounded-full mb-3 sm:hidden" />
          
          {/* Image Area with Padding and Rounded Corners */}
          <div className="w-full relative rounded-2xl overflow-hidden bg-neutral-100 mb-4" style={{ aspectRatio: '4/3' }}>
            {itemData.image || itemData.imageUrl ? (
              <img 
                src={itemData.image || itemData.imageUrl} 
                alt={itemData.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-200/50 text-neutral-400">
                <Utensils className="w-12 h-12 opacity-40" />
              </div>
            )}
            {/* Price Badge */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-primary-700 font-bold text-xs">
              {itemData.price || "Rp 15.000"}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 flex flex-col flex-1 overflow-y-auto">
          <h3 className="text-xl font-bold text-neutral-900">
            {itemData.paketName || itemData.name}
          </h3>
          <p className="text-sm text-neutral-500 mt-1 leading-relaxed">
            {itemData.description}
          </p>

          {/* Stepper Section */}
          <div className="flex items-center justify-between bg-slate-50/80 border border-slate-100 rounded-2xl p-4 mt-6">
            <span className="text-sm font-bold text-neutral-900">Jumlah Pesanan</span>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleDecrement}
                disabled={quantity === 0}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-primary-600 shadow-sm border border-neutral-100 disabled:opacity-50 transition-transform active:scale-95"
              >
                <Minus size={18} />
              </button>
              <span className="w-4 text-center font-bold text-lg text-neutral-900">{quantity}</span>
              <button 
                onClick={handleIncrement}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-primary-600 shadow-sm border border-neutral-100 transition-transform active:scale-95"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Button */}
        <div className="px-6 pb-6 pt-5 flex-shrink-0 bg-white">
          <button
            onClick={() => onSave(quantity)}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm rounded-2xl shadow-lg border-0 outline-none transition-colors"
          >
            <Send className="w-4 h-4 rotate-45 mb-0.5" />
            Simpan Pesanan
          </button>
        </div>
      </div>
    </div>
  );
};

ExcludeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  itemData: PropTypes.object,
  initialQuantity: PropTypes.number,
  onSave: PropTypes.func.isRequired,
};

export default ExcludeModal;
