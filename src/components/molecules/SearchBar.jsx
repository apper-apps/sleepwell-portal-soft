import { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';

const SearchBar = ({ 
  placeholder = "Search...", 
  onSearch,
  onClear,
  className = '',
  autoFocus = false 
}) => {
  const [query, setQuery] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };
  
  const handleClear = () => {
    setQuery('');
    if (onClear) {
      onClear();
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <ApperIcon name="Search" className="w-5 h-5 text-gray-400" />
      </div>
      
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="form-input pl-10 pr-10"
      />
      
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
        >
          <ApperIcon name="X" className="w-5 h-5 text-gray-400" />
        </button>
      )}
    </form>
  );
};

export default SearchBar;