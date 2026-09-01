import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

export const Input = forwardRef(({ className = '', type = 'text', label, error, leftIcon, ...props }, ref) => {
  const baseClasses = 'flex w-full py-2 text-sm bg-neutral-0 border border-neutral-300 rounded-md text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-normal ease-in-out';
  const paddingClasses = leftIcon ? 'pl-10 pr-3' : 'px-3';
  const errorClasses = error ? 'border-danger-500 focus:ring-danger-500' : '';

  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
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
      {error && <p className="text-xs text-danger-500 mt-1">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = forwardRef(({ className = '', label, error, ...props }, ref) => {
  const baseClasses = 'flex w-full px-3 py-2 text-sm bg-neutral-0 border border-neutral-300 rounded-md text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-normal ease-in-out min-h-[80px]';
  const errorClasses = error ? 'border-danger-500 focus:ring-danger-500' : '';

  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <textarea
        className={`${baseClasses} ${errorClasses} ${className}`}
        ref={ref}
        {...props}
      />
      {error && <p className="text-xs text-danger-500 mt-1">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

const sharedPropTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
};

Input.propTypes = {
  ...sharedPropTypes,
  type: PropTypes.string,
  leftIcon: PropTypes.node,
};

Textarea.propTypes = sharedPropTypes;
