import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-opacity-90 focus:ring-primary',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
    danger: 'bg-error text-white hover:bg-opacity-90 focus:ring-error',
    success: 'bg-success text-white hover:bg-opacity-90 focus:ring-success',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`;
  
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : size === 'xl' ? 20 : 16;
  
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="spinner mr-2" style={{ width: iconSize, height: iconSize }} />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <ApperIcon name={icon} size={iconSize} className="mr-2" />
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <ApperIcon name={icon} size={iconSize} className="ml-2" />
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;