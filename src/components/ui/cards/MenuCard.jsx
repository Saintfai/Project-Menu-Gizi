import React from 'react';
import PropTypes from 'prop-types';
import { Utensils } from 'lucide-react';
import Stepper from '../navigation/Stepper';

export const MenuCard = ({ 
  type = 'paket', 
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
    <div className={`flex flex-col bg-white rounded-xl border border-neutral-200/90 overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full ${className}`}>
      {/* Image Container */}
      <div className="w-full h-28 sm:h-36 bg-neutral-100 flex-shrink-0 relative overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 bg-neutral-100">
            <Utensils className="w-7 h-7 opacity-40" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        {type === 'paket' ? (
          <>
            {subtitle && (
              <span className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-1">
                {subtitle}
              </span>
            )}
            <h4 className="font-bold text-neutral-900 text-sm leading-snug mb-1 line-clamp-2">
              {title}
            </h4>
            {description && (
              <p className="text-xs text-neutral-600 line-clamp-2 mb-3.5 leading-relaxed">
                {description}
              </p>
            )}
            
            <div className="mt-auto pt-1">
              <Stepper 
                value={quantity} 
                min={0} 
                max={maxQuantity} 
                onChange={onQuantityChange} 
                className="w-full"
              />
              <div className="min-h-[20px] mt-1.5 flex items-center justify-center text-center">
                {quantity >= maxQuantity && maxQuantity !== Infinity && (
                  <p className="text-xs text-danger-600 font-semibold leading-tight">
                    {maxQuantity === 0 ? `Kuota ${sessionMaxQuantity || ''} porsi terpenuhi` : `Maksimal ${maxQuantity} porsi`}
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {subtitle && (
              <span className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-1">
                {subtitle}
              </span>
            )}
            <h4 className="font-bold text-neutral-900 text-sm leading-snug mb-1 line-clamp-2">
              {title}
            </h4>
            {description && (
              <p className="text-xs text-neutral-600 line-clamp-2 mb-2 leading-relaxed">
                {description}
              </p>
            )}
            <span className="text-xs sm:text-sm font-bold text-primary-700 mb-3.5 block">
              {price}
            </span>
            
            <div className="mt-auto pt-1">
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
  description: PropTypes.string,
  price: PropTypes.string,
  quantity: PropTypes.number,
  maxQuantity: PropTypes.number,
  sessionMaxQuantity: PropTypes.number,
  onQuantityChange: PropTypes.func,
  className: PropTypes.string,
};

export default MenuCard;
