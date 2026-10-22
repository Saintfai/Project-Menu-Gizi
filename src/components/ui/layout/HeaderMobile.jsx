import React from 'react';
import PropTypes from 'prop-types';
import logoEdhos from '../../../assets/logoedhos.png';

// Komponen header navigasi mobile untuk antarmuka alur pasien
export const HeaderMobile = ({ title = 'Menu Gizi', className = '', onLogout }) => {
  return (
    <header className={`flex items-center justify-between px-4 py-3 bg-neutral-0 border-b border-neutral-100 ${className}`}>
      <div className="flex items-center min-w-0">
        <div className="flex-shrink-0 flex items-center justify-center mr-3">
          <img src={logoEdhos} alt="Logo Menu Gizi" className="w-8 h-8 object-contain" />
        </div>
        <h1 className="text-lg font-bold text-neutral-900 leading-normal flex-1 select-none truncate">
          {title}
        </h1>
      </div>
      {onLogout && (
        <button
          type="button"
          onClick={onLogout}
          className="text-xs font-semibold text-danger-600 hover:text-danger-700 bg-danger-50 hover:bg-danger-100 active:bg-danger-200 px-3 py-1.5 rounded-lg transition-colors border-none cursor-pointer flex-shrink-0 ml-2"
          title="Keluar / Ganti Pasien"
        >
          Keluar
        </button>
      )}
    </header>
  );
};

HeaderMobile.propTypes = {
  title: PropTypes.node,
  className: PropTypes.string,
  onLogout: PropTypes.func,
};

export default HeaderMobile;
