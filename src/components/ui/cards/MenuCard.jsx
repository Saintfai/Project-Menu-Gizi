import React from 'react';
import PropTypes from 'prop-types';
import Button from '../buttons/Button';
import Stepper from '../navigation/Stepper';

export const MenuCard = ({ 
  type = 'paket', // 'paket' or 'extra'
  image, 
  title, 
  subtitle, 
  price, 
  quantity = 0,
  maxQuantity = 2,
  onQuantityChange,
  onAddClick,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col bg-neutral-0 rounded-xl border border-neutral-200 overflow-hidden shadow-sm ${className}`}>
      {/* Image Container */}
      <div className="w-full h-32 bg-neutral-100 flex-shrink-0">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            {/* Placeholder Icon */}
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {type === 'paket' ? (
          <>
            <span className="text-[11px] font-bold text-primary-600 mb-1">{subtitle}</span>
            <h4 className="font-semibold text-neutral-900 text-sm leading-tight mb-4 line-clamp-2">{title}</h4>
            
            <div className="mt-auto">
              <Stepper 
                value={quantity} 
                min={0} 
                max={maxQuantity} 
                onChange={onQuantityChange} 
                className="w-full"
              />
              {quantity >= maxQuantity && (
                <p className="text-[10px] text-danger-500 mt-1.5 text-center font-medium">Maksimal {maxQuantity} porsi tercapai</p>
              )}
            </div>
          </>
        ) : (
          <>
            <h4 className="font-semibold text-neutral-900 text-sm leading-tight mb-1 line-clamp-2">{title}</h4>
            <span className="text-xs font-bold text-primary-600 mb-4">{price}</span>
            
            <div className="mt-auto">
              <Button variant="soft" fullWidth onClick={onAddClick} className="text-xs py-1.5">
                + Tambah
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

MenuCard.propTypes = {
  type: PropTypes.oneOf(['paket', 'extra']),
  image: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  price: PropTypes.string,
  quantity: PropTypes.number,
  maxQuantity: PropTypes.number,
  onQuantityChange: PropTypes.func,
  onAddClick: PropTypes.func,
  className: PropTypes.string,
};

export default MenuCard;
