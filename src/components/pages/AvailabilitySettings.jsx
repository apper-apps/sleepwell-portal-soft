import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { availabilityService } from '@/services/api/availabilityService';
import { useUser } from '@/hooks/useUser';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { toast } from 'react-toastify';

const AvailabilitySettings = () => {
  const { user } = useUser();
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weeklySchedule, setWeeklySchedule] = useState({
    1: { active: false, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    2: { active: false, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    3: { active: false, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    4: { active: false, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    5: { active: false, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    6: { active: false, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    0: { active: false, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' }
  });

  const dayNames = {
    1: 'Monday',
    2: 'Tuesday', 
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    0: 'Sunday'
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const data = await availabilityService.getByCoachId(user?.Id || 1);
      setAvailability(data);
      
      // Convert availability data to weekly schedule format
      const schedule = { ...weeklySchedule };
      data.forEach(avail => {
        schedule[avail.dayOfWeek] = {
          active: avail.active,
          startTime: avail.startTime,
          endTime: avail.endTime,
          breakStart: avail.breakStart,
          breakEnd: avail.breakEnd
        };
      });
      setWeeklySchedule(schedule);
      setError(null);
    } catch (err) {
      setError('Failed to load availability settings');
      console.error('Error loading availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleChange = (dayOfWeek, field, value) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      const availabilityRules = Object.entries(weeklySchedule)
        .filter(([_, schedule]) => schedule.active)
        .map(([dayOfWeek, schedule]) => ({
          dayOfWeek: parseInt(dayOfWeek),
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          breakStart: schedule.breakStart,
          breakEnd: schedule.breakEnd,
          active: true
        }));

      await availabilityService.bulkUpdate(user?.Id || 1, availabilityRules);
      toast.success('Availability settings saved successfully');
      loadAvailability();
    } catch (err) {
      toast.error('Failed to save availability settings');
      console.error('Error saving availability:', err);
    }
  };

  const copyToAll = (sourceDay) => {
    const sourceSchedule = weeklySchedule[sourceDay];
    const newSchedule = {};
    Object.keys(weeklySchedule).forEach(day => {
      newSchedule[day] = { ...sourceSchedule };
    });
    setWeeklySchedule(newSchedule);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadAvailability} />;

  return (
    <div className="min-h-screen bg-surface p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Availability Settings</h1>
            <p className="text-gray-600">Configure your weekly schedule and availability</p>
          </div>
          <Button
            onClick={handleSave}
            className="mt-4 md:mt-0 bg-primary text-white hover:bg-opacity-90"
          >
            <ApperIcon name="Save" className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="card">
          <div className="space-y-6">
            {Object.entries(dayNames).map(([dayOfWeek, dayName]) => (
              <motion.div
                key={dayOfWeek}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`active-${dayOfWeek}`}
                      checked={weeklySchedule[dayOfWeek].active}
                      onChange={(e) => handleScheduleChange(dayOfWeek, 'active', e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor={`active-${dayOfWeek}`} className="text-lg font-medium text-gray-900">
                      {dayName}
                    </label>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToAll(dayOfWeek)}
                    className="mt-2 md:mt-0"
                  >
                    <ApperIcon name="Copy" className="w-4 h-4 mr-1" />
                    Copy to All
                  </Button>
                </div>

                {weeklySchedule[dayOfWeek].active && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={weeklySchedule[dayOfWeek].startTime}
                        onChange={(e) => handleScheduleChange(dayOfWeek, 'startTime', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={weeklySchedule[dayOfWeek].endTime}
                        onChange={(e) => handleScheduleChange(dayOfWeek, 'endTime', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Break Start
                      </label>
                      <input
                        type="time"
                        value={weeklySchedule[dayOfWeek].breakStart}
                        onChange={(e) => handleScheduleChange(dayOfWeek, 'breakStart', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Break End
                      </label>
                      <input
                        type="time"
                        value={weeklySchedule[dayOfWeek].breakEnd}
                        onChange={(e) => handleScheduleChange(dayOfWeek, 'breakEnd', e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Setup Tips</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use the checkbox to enable/disable specific days</li>
              <li>• Set break times to block lunch or other unavailable periods</li>
              <li>• Use "Copy to All" to apply the same schedule to all days</li>
              <li>• Changes are saved when you click "Save Changes"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilitySettings;