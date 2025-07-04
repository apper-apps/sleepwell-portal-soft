import { forwardRef } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Input = forwardRef(({ 
  label,
  type = 'text',
  placeholder,
  error,
  icon,
  iconPosition = 'left',
  helpText,
  required = false,
  className = '',
  ...props 
}, ref) => {
  const hasIcon = !!icon;
  const hasError = !!error;
  
  const inputClasses = `
    form-input
    ${hasIcon && iconPosition === 'left' ? 'pl-10' : ''}
    ${hasIcon && iconPosition === 'right' ? 'pr-10' : ''}
    ${hasError ? 'border-error focus:ring-error' : ''}
    ${className}
  `;
  
  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {hasIcon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ApperIcon name={icon} className="w-5 h-5 text-gray-400" />
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={inputClasses}
          aria-describedby={error ? `${props.id}-error` : helpText ? `${props.id}-help` : undefined}
          {...props}
        />
        
        {hasIcon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ApperIcon name={icon} className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${props.id}-error`} className="text-error text-sm mt-1">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p id={`${props.id}-help`} className="text-gray-500 text-sm mt-1">
          {helpText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;