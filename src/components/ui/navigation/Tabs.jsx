import React from 'react';
import PropTypes from 'prop-types';

export const Tabs = ({ tabs = [], activeTab, onTabChange, className = '' }) => {
  return (
    <div className={`flex gap-6 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange && onTabChange(tab)}
            className={`pb-2 text-sm font-bold transition-colors border-0 border-b-2 border-solid bg-transparent outline-none cursor-pointer ${
              isActive 
                ? 'border-primary-600 text-primary-700' 
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func,
  className: PropTypes.string,
};

export default Tabs;
