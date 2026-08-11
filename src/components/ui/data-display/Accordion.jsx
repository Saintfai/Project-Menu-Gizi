import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const Accordion = ({ title, icon, defaultExpanded = false, children, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`bg-neutral-50 rounded-xl overflow-hidden transition-all ${isExpanded ? 'pb-4' : ''} ${className}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-transparent border-none appearance-none outline-none cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
              {icon}
            </div>
          )}
          <span className="font-bold text-neutral-900">{title}</span>
        </div>
        <svg 
          className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="px-4 pt-2">
          {children}
        </div>
      )}
    </div>
  );
};

Accordion.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  defaultExpanded: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Accordion;
