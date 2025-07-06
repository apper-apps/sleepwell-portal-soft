import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import sleepEntryService from '@/services/api/sleepEntryService';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Button from '@/components/atoms/Button';
import TimePicker from '@/components/molecules/TimePicker';
import SleepQualityRating from '@/components/molecules/SleepQualityRating';
import ApperIcon from '@/components/ApperIcon';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';

const SleepDiary = () => {
  const { user } = useUser();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    bedTime: '22:00',
    wakeTime: '07:00',
    quality: 0,
    notes: ''
  });
  
  useEffect(() => {
    loadEntries();
  }, []);
  
  const loadEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sleepEntryService.getAll();
      setEntries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.quality) {
      toast.error('Please rate your sleep quality');
      return;
    }
    
    try {
      setSaving(true);
      const entryData = {
        ...formData,
        userId: user?.Id,
        bedTime: formData.bedTime,
        wakeTime: formData.wakeTime
      };
      
      if (editingEntry) {
        await sleepEntryService.update(editingEntry.Id, entryData);
        toast.success('Sleep entry updated successfully');
      } else {
        await sleepEntryService.create(entryData);
        toast.success('Sleep entry saved successfully');
      }
      
      await loadEntries();
      resetForm();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };
  
  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date,
      bedTime: entry.bedTime,
      wakeTime: entry.wakeTime,
      quality: entry.quality,
      notes: entry.notes || ''
    });
    setShowForm(true);
  };
  
  const handleDelete = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await sleepEntryService.delete(entryId);
        toast.success('Sleep entry deleted successfully');
        await loadEntries();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };
  
  const resetForm = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      bedTime: '22:00',
      wakeTime: '07:00',
      quality: 0,
      notes: ''
    });
    setEditingEntry(null);
    setShowForm(false);
  };
  
  const calculateSleepDuration = (bedTime, wakeTime) => {
    const [bedHour, bedMinute] = bedTime.split(':').map(Number);
    const [wakeHour, wakeMinute] = wakeTime.split(':').map(Number);
    
    let bedMinutes = bedHour * 60 + bedMinute;
    let wakeMinutes = wakeHour * 60 + wakeMinute;
    
    if (wakeMinutes < bedMinutes) {
      wakeMinutes += 24 * 60; // Add 24 hours
    }
    
    const durationMinutes = wakeMinutes - bedMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };
  
  const getQualityColor = (quality) => {
    if (quality >= 4) return 'text-success';
    if (quality >= 3) return 'text-info';
    if (quality >= 2) return 'text-warning';
    return 'text-error';
  };
  
  const getQualityLabel = (quality) => {
    if (quality >= 4) return 'Excellent';
    if (quality >= 3) return 'Good';
    if (quality >= 2) return 'Fair';
    return 'Poor';
  };
  
  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadEntries} />;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'coach' ? 'Client Sleep Diaries' : 'My Sleep Diary'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'coach' 
              ? 'Monitor and analyze your clients\' sleep patterns'
              : 'Track your sleep patterns and improve your rest quality'
            }
          </p>
        </div>
        
        {user?.role === 'client' && (
          <Button
            icon="Plus"
            onClick={() => setShowForm(true)}
          >
            Add Entry
          </Button>
        )}
      </div>
      
      {/* Sleep Entry Form */}
      {showForm && user?.role === 'client' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingEntry ? 'Edit Sleep Entry' : 'Add Sleep Entry'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              icon="X"
              onClick={resetForm}
            />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Sleep Duration</label>
                <div className="text-lg font-semibold text-primary">
                  {calculateSleepDuration(formData.bedTime, formData.wakeTime)}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TimePicker
                label="Bedtime"
                value={formData.bedTime}
                onChange={(value) => setFormData(prev => ({ ...prev, bedTime: value }))}
                required
              />
              
              <TimePicker
                label="Wake Time"
                value={formData.wakeTime}
                onChange={(value) => setFormData(prev => ({ ...prev, wakeTime: value }))}
                required
              />
            </div>
            
            <div>
              <label className="form-label">Sleep Quality</label>
              <SleepQualityRating
                value={formData.quality}
                onChange={(value) => setFormData(prev => ({ ...prev, quality: value }))}
              />
            </div>
            
            <div>
              <label className="form-label">Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="How did you sleep? Any factors that affected your sleep?"
                className="form-textarea"
                rows="4"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                type="submit"
                loading={saving}
                disabled={saving}
              >
                {editingEntry ? 'Update Entry' : 'Save Entry'}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={resetForm}
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}
      
      {/* Entries List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Sleep Entries</h3>
        </div>
        
        {entries.length === 0 ? (
          <Empty
            title="No sleep entries yet"
            description={user?.role === 'coach' 
              ? "Your clients haven't logged any sleep entries yet."
              : "Start tracking your sleep patterns by adding your first entry."
            }
            icon="Moon"
            action={user?.role === 'client' ? () => setShowForm(true) : undefined}
            actionLabel="Add First Entry"
            showAction={user?.role === 'client'}
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <motion.div
                key={entry.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {format(parseISO(entry.date), 'EEEE, MMMM d, yyyy')}
                      </h4>
                      <div className={`font-semibold ${getQualityColor(entry.quality)}`}>
                        {getQualityLabel(entry.quality)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="Moon" className="w-4 h-4" />
                        <span>Bedtime: {entry.bedTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="Sun" className="w-4 h-4" />
                        <span>Wake: {entry.wakeTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="Clock" className="w-4 h-4" />
                        <span>Duration: {calculateSleepDuration(entry.bedTime, entry.wakeTime)}</span>
                      </div>
                    </div>
                    
                    {entry.notes && (
                      <p className="mt-2 text-sm text-gray-700">{entry.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <SleepQualityRating value={entry.quality} readonly />
                    
                    {user?.role === 'client' && (
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="Edit"
                          onClick={() => handleEdit(entry)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="Trash2"
                          onClick={() => handleDelete(entry.Id)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SleepDiary;