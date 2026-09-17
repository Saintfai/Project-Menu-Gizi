import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

export const Accordion = ({ 
  title, 
  icon, 
  iconBg = 'bg-primary-50', 
  iconColor = 'text-primary-600', 
  defaultExpanded = false, 
  children, 
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`bg-neutral-0 border border-neutral-200 shadow-sm rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'pb-4 mb-4' : 'mb-3'} ${className}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-transparent border-none appearance-none outline-none cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}>
              {icon}
            </div>
          )}
          <span className="font-bold text-base text-neutral-900">{title}</span>
        </div>
        <svg 
          className={`w-5 h-5 text-neutral-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

Accordion.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  iconBg: PropTypes.string,
  iconColor: PropTypes.string,
  defaultExpanded: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Accordion;
