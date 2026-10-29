import React from 'react';
import PropTypes from 'prop-types';
import logoEdhos from '../../../assets/logoedhos.png';

// Komponen header navigasi mobile untuk antarmuka alur pasien
export const HeaderMobile = ({ title = 'Menu Gizi', className = '' }) => {
  return (
    <header className={`flex items-center px-4 py-3 bg-neutral-0 border-b border-neutral-100 ${className}`}>
      <div className="flex items-center min-w-0">
        <div className="flex-shrink-0 flex items-center justify-center mr-3">
          <img src={logoEdhos} alt="Logo Menu Gizi" className="w-8 h-8 object-contain" />
        </div>
        <h1 className="text-lg font-bold text-neutral-900 leading-normal flex-1 select-none truncate">
          {title}
        </h1>
      </div>
    </header>
  );
};

HeaderMobile.propTypes = {
  title: PropTypes.node,
  className: PropTypes.string,
};

export default HeaderMobile;
