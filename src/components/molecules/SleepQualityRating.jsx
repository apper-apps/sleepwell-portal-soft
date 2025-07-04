import { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';

const SleepQualityRating = ({ value = 0, onChange, readonly = false }) => {
  const [hover, setHover] = useState(0);
  
  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };
  
  const handleMouseEnter = (rating) => {
    if (!readonly) {
      setHover(rating);
    }
  };
  
  const handleMouseLeave = () => {
    if (!readonly) {
      setHover(0);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`
              w-8 h-8 transition-colors duration-200 
              ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
              ${(hover || value) >= rating ? 'text-accent' : 'text-gray-300'}
            `}
          >
            <ApperIcon name="Star" className="w-full h-full fill-current" />
          </button>
        ))}
      </div>
      
      <span className="text-sm text-gray-600 min-w-[60px]">
        {value === 0 ? 'Not rated' : 
         value === 1 ? 'Poor' :
         value === 2 ? 'Fair' :
         value === 3 ? 'Good' :
         value === 4 ? 'Very Good' :
         'Excellent'}
      </span>
    </div>
  );
};

export default SleepQualityRating;