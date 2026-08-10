import React from 'react';

const Badge = ({ variant = 'info', children, className = '' }) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
