import ApperIcon from '@/components/ApperIcon';

const Badge = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon,
  className = '' 
}) => {
  const baseClasses = 'badge inline-flex items-center';
  
  const variants = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    gray: 'bg-gray-100 text-gray-800',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <span className={classes}>
      {icon && (
        <ApperIcon name={icon} size={iconSize} className="mr-1" />
      )}
      {children}
    </span>
  );
};

export default Badge;