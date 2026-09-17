import React from 'react';
import PropTypes from 'prop-types';

export const DateTimeDisplay = ({ date, time, className = '' }) => {
  return (
    <div className={`pl-3 border-l-2 border-neutral-200 ${className}`}>
      <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider leading-tight mb-0.5">
        {date}
      </div>
      <div className="text-xs font-bold text-primary-600 leading-tight">
        {time}
      </div>
    </div>
  );
};

DateTimeDisplay.propTypes = {
  date: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default DateTimeDisplay;
