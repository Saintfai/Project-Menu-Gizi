import React from 'react';
import PropTypes from 'prop-types';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-neutral-0 border border-neutral-200 rounded-xl shadow-sm ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`px-6 py-4 border-b border-neutral-200 ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`p-6 ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-xl ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

const propTypesNodeString = {
  children: PropTypes.node,
  className: PropTypes.string,
};

Card.propTypes = propTypesNodeString;
CardHeader.propTypes = propTypesNodeString;
CardBody.propTypes = propTypesNodeString;
CardFooter.propTypes = propTypesNodeString;

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
