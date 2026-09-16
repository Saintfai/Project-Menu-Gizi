/**
 * NAMA FILE: Input.jsx
 * FUNGSI UTAMA: Komponen UI Form dan Input data.
 * 
 * DETAIL:
 * - Menangani input pengguna dengan validasi dan styling standar.
 * - Mendukung berbagai tipe input (teks, pencarian, date, textarea).
 * - Menggunakan border-radius 16px (rounded-xl) dan touch-target optimal (h-11 / 44px).
 */
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

export const Input = forwardRef(({ 
  className = '', 
  type = 'text', 
  label, 
  error, 
  hint,
  leftIcon, 
  ...props 
}, ref) => {
  const baseClasses = 'flex w-full h-11 text-sm bg-neutral-0 border border-neutral-300 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150';
  const paddingClasses = leftIcon ? 'pl-10 pr-3.5' : 'px-3.5';
  const errorClasses = error ? 'border-danger-500 focus:ring-danger-500 bg-danger-50/20' : '';

  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && (
        <label className="text-xs font-semibold text-neutral-700 ml-0.5">
          {label}
        </label>
      )}
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={`${baseClasses} ${paddingClasses} ${errorClasses} ${className}`}
          ref={ref}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger-500 font-medium mt-1 ml-0.5">{error}</p>}
      {!error && hint && <p className="text-xs text-neutral-400 mt-1 ml-0.5">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = forwardRef(({ 
  className = '', 
  label, 
  error, 
  hint,
  ...props 
}, ref) => {
  const baseClasses = 'flex w-full px-3.5 py-2.5 text-sm bg-neutral-0 border border-neutral-300 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 min-h-[90px]';
  const errorClasses = error ? 'border-danger-500 focus:ring-danger-500 bg-danger-50/20' : '';

  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && (
        <label className="text-xs font-semibold text-neutral-700 ml-0.5">
          {label}
        </label>
      )}
      <textarea
        className={`${baseClasses} ${errorClasses} ${className}`}
        ref={ref}
        {...props}
      />
      {error && <p className="text-xs text-danger-500 font-medium mt-1 ml-0.5">{error}</p>}
      {!error && hint && <p className="text-xs text-neutral-400 mt-1 ml-0.5">{hint}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

const sharedPropTypes = {
  className: PropTypes.string,
  label: PropTypes.node,
  error: PropTypes.string,
  hint: PropTypes.string,
};

Input.propTypes = {
  ...sharedPropTypes,
  type: PropTypes.string,
  leftIcon: PropTypes.node,
};

Textarea.propTypes = sharedPropTypes;
export default Input;
