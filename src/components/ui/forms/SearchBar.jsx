import React from 'react';
import PropTypes from 'prop-types';

export const SearchBar = ({ className = '', placeholder = 'Cari menu makanan...', ...props }) => {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-400">
        <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
        </svg>
      </div>
      <input
        type="search"
        className="block w-full p-3 pl-10 text-sm text-neutral-900 border border-neutral-300 rounded-full bg-neutral-0 focus:ring-primary-500 focus:border-primary-500 placeholder:text-neutral-400 outline-none transition-normal"
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
};

SearchBar.propTypes = {
  className: PropTypes.string,
  placeholder: PropTypes.string,
};

export default SearchBar;
