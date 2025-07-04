import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { bookingRuleService } from '@/services/api/bookingRuleService';
import { useUser } from '@/hooks/useUser';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import { toast } from 'react-toastify';

const BookingRules = () => {
  const { user } = useUser();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: 'Standard Booking Policy',
    description: 'Default booking rules for all session types',
    maxDailyBookings: 8,
    allowWeekendBookings: false,
    requireDeposit: true,
    depositPercentage: 25,
    cancellationPolicy: '24_hours',
    reschedulePolicy: '12_hours',
    autoConfirm: true,
    bufferBetweenSessions: 15,
    blackoutDates: []
  });
  const [newBlackoutDate, setNewBlackoutDate] = useState('');

  useEffect(() => {
    loadBookingRules();
  }, []);

  const loadBookingRules = async () => {
    try {
      setLoading(true);
      const data = await bookingRuleService.getByCoachId(user?.Id || 1);
      setRules(data);
      
      if (data.length > 0) {
        const rule = data[0];
        setFormData({
          name: rule.name,
          description: rule.description,
          maxDailyBookings: rule.rules.maxDailyBookings,
          allowWeekendBookings: rule.rules.allowWeekendBookings,
          requireDeposit: rule.rules.requireDeposit,
          depositPercentage: rule.rules.depositPercentage,
          cancellationPolicy: rule.rules.cancellationPolicy,
          reschedulePolicy: rule.rules.reschedulePolicy,
          autoConfirm: rule.rules.autoConfirm,
          bufferBetweenSessions: rule.rules.bufferBetweenSessions,
          blackoutDates: rule.rules.blackoutDates || []
        });
      }
      setError(null);
    } catch (err) {
      setError('Failed to load booking rules');
      console.error('Error loading booking rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const ruleData = {
        coachId: user?.Id || 1,
        name: formData.name,
        description: formData.description,
        rules: {
          maxDailyBookings: formData.maxDailyBookings,
          allowWeekendBookings: formData.allowWeekendBookings,
          requireDeposit: formData.requireDeposit,
          depositPercentage: formData.depositPercentage,
          cancellationPolicy: formData.cancellationPolicy,
          reschedulePolicy: formData.reschedulePolicy,
          autoConfirm: formData.autoConfirm,
          bufferBetweenSessions: formData.bufferBetweenSessions,
          blackoutDates: formData.blackoutDates
        },
        active: true
      };

      if (rules.length > 0) {
        await bookingRuleService.update(rules[0].Id, ruleData);
        toast.success('Booking rules updated successfully');
      } else {
        await bookingRuleService.create(ruleData);
        toast.success('Booking rules created successfully');
      }
      
      loadBookingRules();
    } catch (err) {
      toast.error('Failed to save booking rules');
      console.error('Error saving booking rules:', err);
    }
  };

  const addBlackoutDate = () => {
    if (newBlackoutDate && !formData.blackoutDates.includes(newBlackoutDate)) {
      setFormData(prev => ({
        ...prev,
        blackoutDates: [...prev.blackoutDates, newBlackoutDate].sort()
      }));
      setNewBlackoutDate('');
    }
  };

  const removeBlackoutDate = (date) => {
    setFormData(prev => ({
      ...prev,
      blackoutDates: prev.blackoutDates.filter(d => d !== date)
    }));
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadBookingRules} />;

  return (
    <div className="min-h-screen bg-surface p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Booking Rules</h1>
            <p className="text-gray-600">Configure booking policies and restrictions</p>
          </div>
          <Button
            onClick={handleSave}
            className="mt-4 md:mt-0 bg-primary text-white hover:bg-opacity-90"
          >
            <ApperIcon name="Save" className="w-4 h-4 mr-2" />
            Save Rules
          </Button>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">General Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="Policy Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                type="number"
                label="Max Daily Bookings"
                value={formData.maxDailyBookings}
                onChange={(e) => setFormData({ ...formData, maxDailyBookings: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-textarea"
                rows={3}
              />
            </div>
          </motion.div>

          {/* Booking Policies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Policies</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowWeekends"
                  checked={formData.allowWeekendBookings}
                  onChange={(e) => setFormData({ ...formData, allowWeekendBookings: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="allowWeekends" className="ml-2 text-sm text-gray-900">
                  Allow weekend bookings
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoConfirm"
                  checked={formData.autoConfirm}
                  onChange={(e) => setFormData({ ...formData, autoConfirm: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="autoConfirm" className="ml-2 text-sm text-gray-900">
                  Auto-confirm bookings
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cancellation Policy
                  </label>
                  <select
                    value={formData.cancellationPolicy}
                    onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                    className="form-select"
                  >
                    <option value="2_hours">2 hours before</option>
                    <option value="12_hours">12 hours before</option>
                    <option value="24_hours">24 hours before</option>
                    <option value="48_hours">48 hours before</option>
                    <option value="72_hours">72 hours before</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reschedule Policy
                  </label>
                  <select
                    value={formData.reschedulePolicy}
                    onChange={(e) => setFormData({ ...formData, reschedulePolicy: e.target.value })}
                    className="form-select"
                  >
                    <option value="2_hours">2 hours before</option>
                    <option value="12_hours">12 hours before</option>
                    <option value="24_hours">24 hours before</option>
                    <option value="48_hours">48 hours before</option>
                  </select>
                </div>
              </div>

              <Input
                type="number"
                label="Buffer Between Sessions (minutes)"
                value={formData.bufferBetweenSessions}
                onChange={(e) => setFormData({ ...formData, bufferBetweenSessions: parseInt(e.target.value) })}
              />
            </div>
          </motion.div>

          {/* Payment Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireDeposit"
                  checked={formData.requireDeposit}
                  onChange={(e) => setFormData({ ...formData, requireDeposit: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="requireDeposit" className="ml-2 text-sm text-gray-900">
                  Require deposit for bookings
                </label>
              </div>

              {formData.requireDeposit && (
                <Input
                  type="number"
                  label="Deposit Percentage (%)"
                  value={formData.depositPercentage}
                  onChange={(e) => setFormData({ ...formData, depositPercentage: parseInt(e.target.value) })}
                  min="1"
                  max="100"
                />
              )}
            </div>
          </motion.div>

          {/* Blackout Dates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Blackout Dates</h2>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={newBlackoutDate}
                  onChange={(e) => setNewBlackoutDate(e.target.value)}
                  className="form-input flex-1"
                />
                <Button
                  onClick={addBlackoutDate}
                  disabled={!newBlackoutDate}
                  className="bg-primary text-white"
                >
                  <ApperIcon name="Plus" className="w-4 h-4" />
                </Button>
              </div>

              {formData.blackoutDates.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">Blocked Dates:</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.blackoutDates.map(date => (
                      <div
                        key={date}
                        className="flex items-center bg-gray-100 px-3 py-1 rounded-lg text-sm"
                      >
                        <span>{new Date(date).toLocaleDateString()}</span>
                        <button
                          onClick={() => removeBlackoutDate(date)}
                          className="ml-2 text-gray-500 hover:text-error"
                        >
                          <ApperIcon name="X" className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookingRules;