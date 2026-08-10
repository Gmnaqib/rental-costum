import React from 'react';

const Button = ({ children, variant = 'primary', size = 'md', className = '', icon: Icon, ...props }) => {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  return (
    <button className={`btn btn-${variant} ${sizeClass} ${className}`} {...props}>
      {Icon && <Icon />}
      {children}
    </button>
  );
};

export default Button;
