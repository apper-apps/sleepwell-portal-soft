import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendDirection = 'up',
  className = '',
  gradient = false 
}) => {
  const cardClasses = gradient 
    ? 'bg-gradient-to-br from-primary to-accent text-white'
    : 'bg-white border border-gray-100';
    
  const getTrendColor = () => {
    if (trendDirection === 'up') return 'text-success';
    if (trendDirection === 'down') return 'text-error';
    return 'text-gray-500';
  };
  
  const getTrendIcon = () => {
    if (trendDirection === 'up') return 'TrendingUp';
    if (trendDirection === 'down') return 'TrendingDown';
    return 'Minus';
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`card ${cardClasses} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${gradient ? 'text-white opacity-90' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${gradient ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-sm mt-1 ${gradient ? 'text-white opacity-75' : 'text-gray-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
        
        {icon && (
          <div className={`p-3 rounded-lg ${gradient ? 'bg-white bg-opacity-20' : 'bg-gray-50'}`}>
            <ApperIcon 
              name={icon} 
              className={`w-6 h-6 ${gradient ? 'text-white' : 'text-primary'}`} 
            />
          </div>
        )}
      </div>
      
      {trend && (
        <div className="flex items-center mt-4">
          <div className={`flex items-center ${gradient ? 'text-white' : getTrendColor()}`}>
            <ApperIcon name={getTrendIcon()} className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">{trend}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;