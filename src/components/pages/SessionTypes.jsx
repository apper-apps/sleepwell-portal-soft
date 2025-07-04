import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sessionTypeService } from '@/services/api/sessionTypeService';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { toast } from 'react-toastify';

const SessionTypes = () => {
  const [sessionTypes, setSessionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 60,
    price: 0,
    color: '#6B46C1',
    bufferTime: 15,
    maxAdvanceBooking: 30,
    minAdvanceBooking: 24,
    active: true
  });

  useEffect(() => {
    loadSessionTypes();
  }, []);

  const loadSessionTypes = async () => {
    try {
      setLoading(true);
      const data = await sessionTypeService.getAll();
      setSessionTypes(data);
      setError(null);
    } catch (err) {
      setError('Failed to load session types');
      console.error('Error loading session types:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingType) {
        await sessionTypeService.update(editingType.Id, formData);
        toast.success('Session type updated successfully');
      } else {
        await sessionTypeService.create(formData);
        toast.success('Session type created successfully');
      }
      
      setShowModal(false);
      setEditingType(null);
      resetForm();
      loadSessionTypes();
    } catch (err) {
      toast.error(editingType ? 'Failed to update session type' : 'Failed to create session type');
      console.error('Error saving session type:', err);
    }
  };

  const handleEdit = (sessionType) => {
    setEditingType(sessionType);
    setFormData({
      name: sessionType.name,
      description: sessionType.description,
      duration: sessionType.duration,
      price: sessionType.price,
      color: sessionType.color,
      bufferTime: sessionType.bufferTime,
      maxAdvanceBooking: sessionType.maxAdvanceBooking,
      minAdvanceBooking: sessionType.minAdvanceBooking,
      active: sessionType.active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session type?')) return;
    
    try {
      await sessionTypeService.delete(id);
      toast.success('Session type deleted successfully');
      loadSessionTypes();
    } catch (err) {
      toast.error('Failed to delete session type');
      console.error('Error deleting session type:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: 60,
      price: 0,
      color: '#6B46C1',
      bufferTime: 15,
      maxAdvanceBooking: 30,
      minAdvanceBooking: 24,
      active: true
    });
  };

  const openModal = () => {
    resetForm();
    setEditingType(null);
    setShowModal(true);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadSessionTypes} />;

  return (
    <div className="min-h-screen bg-surface p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Session Types</h1>
            <p className="text-gray-600">Manage your available session types and pricing</p>
          </div>
          <Button
            onClick={openModal}
            className="mt-4 md:mt-0 bg-primary text-white hover:bg-opacity-90"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Session Type
          </Button>
        </div>

        {sessionTypes.length === 0 ? (
          <Empty
            title="No session types found"
            description="Create your first session type to start accepting bookings"
            actionLabel="Add Session Type"
            onAction={openModal}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessionTypes.map((sessionType) => (
              <motion.div
                key={sessionType.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: sessionType.color }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900">{sessionType.name}</h3>
                  </div>
                  <Badge variant={sessionType.active ? 'success' : 'secondary'}>
                    {sessionType.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <p className="text-gray-600 text-sm mb-4">{sessionType.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium">{sessionType.duration} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price:</span>
                    <span className="font-medium">${sessionType.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Buffer Time:</span>
                    <span className="font-medium">{sessionType.bufferTime} minutes</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(sessionType)}
                    className="flex-1"
                  >
                    <ApperIcon name="Edit2" className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(sessionType.Id)}
                    className="text-error border-error hover:bg-error hover:text-white"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {editingType ? 'Edit Session Type' : 'Create Session Type'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ApperIcon name="X" className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="form-textarea"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      label="Duration (minutes)"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      required
                    />
                    <Input
                      type="number"
                      label="Price ($)"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      type="number"
                      label="Buffer Time (min)"
                      value={formData.bufferTime}
                      onChange={(e) => setFormData({ ...formData, bufferTime: parseInt(e.target.value) })}
                    />
                    <Input
                      type="number"
                      label="Max Advance (days)"
                      value={formData.maxAdvanceBooking}
                      onChange={(e) => setFormData({ ...formData, maxAdvanceBooking: parseInt(e.target.value) })}
                    />
                    <Input
                      type="number"
                      label="Min Advance (hrs)"
                      value={formData.minAdvanceBooking}
                      onChange={(e) => setFormData({ ...formData, minAdvanceBooking: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-primary text-white">
                      {editingType ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionTypes;