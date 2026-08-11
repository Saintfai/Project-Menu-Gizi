import React from 'react';
import PropTypes from 'prop-types';

export const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="relative w-full overflow-x-auto rounded-lg border border-neutral-200 shadow-sm">
      <table className={`w-full text-sm text-left text-neutral-700 ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className = '', ...props }) => {
  return (
    <thead className={`text-xs text-neutral-500 uppercase bg-neutral-50 border-b border-neutral-200 ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className = '', ...props }) => {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className = '', isSuccess = false, ...props }) => {
  // PRD FR-019 states Extra items marked as completed turn green.
  const rowClasses = isSuccess 
    ? 'bg-success-50 border-b border-success-200 hover:bg-success-100' 
    : 'bg-neutral-0 border-b border-neutral-200 hover:bg-neutral-50';

  return (
    <tr className={`${rowClasses} transition-fast ease-in-out ${className}`} {...props}>
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className = '', ...props }) => {
  return (
    <th scope="col" className={`px-6 py-3 font-semibold ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TableCell = ({ children, className = '', ...props }) => {
  return (
    <td className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </td>
  );
};

const propTypesNodeString = {
  children: PropTypes.node,
  className: PropTypes.string,
};

Table.propTypes = propTypesNodeString;
TableHeader.propTypes = propTypesNodeString;
TableBody.propTypes = propTypesNodeString;
TableRow.propTypes = { ...propTypesNodeString, isSuccess: PropTypes.bool };
TableHead.propTypes = propTypesNodeString;
TableCell.propTypes = propTypesNodeString;

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;

export default Table;
