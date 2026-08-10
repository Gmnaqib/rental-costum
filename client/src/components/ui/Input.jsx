import React from 'react';

const Input = ({ label, error, type = 'text', className = '', ...props }) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      {type === 'textarea' ? (
        <textarea className={`form-textarea ${className}`} {...props} />
      ) : type === 'select' ? (
        <select className={`form-select ${className}`} {...props}>
          {props.children}
        </select>
      ) : (
        <input type={type} className={`form-input ${className}`} {...props} />
      )}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};

export default Input;
