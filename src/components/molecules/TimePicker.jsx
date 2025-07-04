const TimePicker = ({ value, onChange, label, error, required = false }) => {
  const parseTime = (timeString) => {
    if (!timeString) return { hours: 22, minutes: 0, period: 'PM' };
    
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    return {
      hours: hours === 0 ? 12 : hours > 12 ? hours - 12 : hours,
      minutes,
      period: period || (hours >= 12 ? 'PM' : 'AM')
    };
  };
  
  const formatTime = (hours, minutes, period) => {
    const hour24 = period === 'AM' 
      ? (hours === 12 ? 0 : hours)
      : (hours === 12 ? 12 : hours + 12);
    
    return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  const { hours, minutes, period } = parseTime(value);
  
  const handleChange = (newHours, newMinutes, newPeriod) => {
    const timeString = formatTime(newHours, newMinutes, newPeriod);
    onChange(timeString);
  };
  
  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="flex items-center space-x-2">
        <select
          value={hours}
          onChange={(e) => handleChange(Number(e.target.value), minutes, period)}
          className="form-select text-center"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
            <option key={hour} value={hour}>{hour}</option>
          ))}
        </select>
        
        <span className="text-gray-400 font-medium">:</span>
        
        <select
          value={minutes}
          onChange={(e) => handleChange(hours, Number(e.target.value), period)}
          className="form-select text-center"
        >
          {Array.from({ length: 60 }, (_, i) => i).map(minute => (
            <option key={minute} value={minute}>
              {minute.toString().padStart(2, '0')}
            </option>
          ))}
        </select>
        
        <select
          value={period}
          onChange={(e) => handleChange(hours, minutes, e.target.value)}
          className="form-select text-center"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
      
      {error && (
        <p className="text-error text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default TimePicker;