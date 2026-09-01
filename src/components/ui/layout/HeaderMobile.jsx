import React from 'react';
import PropTypes from 'prop-types';
import logoEdhos from '../../../assets/logoedhos.png';

export const HeaderMobile = ({ title = 'Menu Gizi', className = '' }) => {
  return (
    <header className={`flex items-center px-4 py-3 bg-neutral-0 border-b border-neutral-100 ${className}`}>
      <div className="flex-shrink-0 flex items-center justify-center mr-3">
        <img src={logoEdhos} alt="Logo Menu Gizi" className="w-8 h-8 object-contain" />
      </div>
      <h1 className="text-lg font-bold text-neutral-900 leading-none mt-0.5">
        {title}
      </h1>
    </header>
  );
};

HeaderMobile.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
};

export default HeaderMobile;
