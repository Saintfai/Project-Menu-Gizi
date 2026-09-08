import React from 'react';
import PropTypes from 'prop-types';
import { Utensils } from 'lucide-react';
import Stepper from '../navigation/Stepper';

export const MenuCard = ({ 
  type = 'paket', // 'paket' or 'extra'
  image, 
  title, 
  subtitle, 
  description,
  price, 
  quantity = 0,
  maxQuantity = 2,
  sessionMaxQuantity,
  onQuantityChange,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col bg-neutral-0 rounded-xl border border-neutral-200 overflow-hidden shadow-sm h-full ${className}`}>
      {/* Image Container */}
      <div className="w-full h-24 sm:h-32 bg-neutral-100 flex-shrink-0">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 bg-neutral-200/50">
            <Utensils className="w-6 h-6 sm:w-8 sm:h-8 opacity-50" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {type === 'paket' ? (
          <>
            <span className="text-[10px] sm:text-[11px] font-bold text-primary-600 mb-0.5 sm:mb-1">{subtitle}</span>
            <h4 className="font-semibold text-neutral-900 text-xs sm:text-sm leading-snug mb-1 line-clamp-2">{title}</h4>
            {description && <p className="text-[10px] sm:text-[11px] text-neutral-500 line-clamp-2 mb-3 sm:mb-4">{description}</p>}
            
            <div className="mt-auto">
              <Stepper 
                value={quantity} 
                min={0} 
                max={maxQuantity} 
                onChange={onQuantityChange} 
                className="w-full"
              />
              <div className="h-4 sm:h-5 mt-1 sm:mt-1.5 flex items-start justify-center text-center">
                {quantity >= maxQuantity && maxQuantity !== Infinity && (
                  <p className="text-[9px] sm:text-[10px] text-danger-500 font-medium leading-none">
                    {maxQuantity === 0 ? `Kuota ${sessionMaxQuantity || ''} porsi terpenuhi` : `Maksimal ${maxQuantity} porsi`}
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {subtitle && <span className="text-[10px] sm:text-[11px] font-bold text-primary-600 mb-0.5 sm:mb-1">{subtitle}</span>}
            <h4 className="font-semibold text-neutral-900 text-xs sm:text-sm leading-snug mb-1 line-clamp-2">{title}</h4>
            {description && <p className="text-[10px] sm:text-[11px] text-neutral-500 line-clamp-2 mb-1.5 sm:mb-2">{description}</p>}
            <span className="text-[11px] sm:text-xs font-bold text-primary-600 mb-3 sm:mb-4">{price}</span>
            
            <div className="mt-auto">
              <Stepper 
                value={quantity} 
                min={0} 
                max={Infinity} 
                onChange={onQuantityChange} 
                className="w-full"
              />
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
  sessionMaxQuantity: PropTypes.number,
  onQuantityChange: PropTypes.func,
  className: PropTypes.string,
};

export default MenuCard;
