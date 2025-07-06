import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import appointmentService from '@/services/api/appointmentService';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { toast } from 'react-toastify';
import { format, parseISO, addDays, startOfWeek } from 'date-fns';

const Schedule = () => {
  const { user } = useUser();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  
  useEffect(() => {
    loadAppointments();
  }, []);
  
  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentService.getAll();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleBookAppointment = async (appointmentData) => {
    try {
      await appointmentService.create({
        ...appointmentData,
        clientId: user?.Id,
        coachId: user?.coachId || 1,
        status: 'scheduled'
      });
      toast.success('Appointment booked successfully');
      await loadAppointments();
      setShowBookingModal(false);
    } catch (err) {
      toast.error(err.message);
    }
  };
  
  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentService.update(appointmentId, { status: 'cancelled' });
        toast.success('Appointment cancelled successfully');
        await loadAppointments();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'gray';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return 'Calendar';
      case 'completed': return 'CheckCircle';
      case 'cancelled': return 'XCircle';
      default: return 'Clock';
    }
  };
  
  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return 'Video';
      case 'phone': return 'Phone';
      case 'in-person': return 'User';
      default: return 'Calendar';
    }
  };
  
  const getWeekDays = () => {
    const start = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };
  
  const getAppointmentsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => 
      format(parseISO(apt.dateTime), 'yyyy-MM-dd') === dateStr
    );
  };
  
  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadAppointments} />;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'coach' ? 'Schedule Management' : 'My Appointments'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'coach' 
              ? 'Manage your availability and client sessions'
              : 'View and manage your scheduled sessions'
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'week' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'month' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Month
            </Button>
          </div>
          
          {user?.role === 'client' && (
            <Button
              icon="Plus"
              onClick={() => setShowBookingModal(true)}
            >
              Book Appointment
            </Button>
          )}
        </div>
      </div>
      
      {/* Calendar Navigation */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {format(selectedDate, 'MMMM yyyy')}
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              icon="ChevronLeft"
              onClick={() => setSelectedDate(prev => addDays(prev, -7))}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon="ChevronRight"
              onClick={() => setSelectedDate(prev => addDays(prev, 7))}
            />
          </div>
        </div>
        
        {/* Week View */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-7 gap-4">
            {getWeekDays().map((day) => {
              const dayAppointments = getAppointmentsForDate(day);
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[200px] p-4 rounded-lg border ${
                    isToday ? 'bg-primary bg-opacity-5 border-primary' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="text-center mb-3">
                    <div className="text-sm font-medium text-gray-600">
                      {format(day, 'EEE')}
                    </div>
                    <div className={`text-lg font-semibold ${
                      isToday ? 'text-primary' : 'text-gray-900'
                    }`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {dayAppointments.map((appointment) => (
                      <motion.div
                        key={appointment.Id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-2 rounded-md shadow-sm border border-gray-200"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">
                            {format(parseISO(appointment.dateTime), 'HH:mm')}
                          </span>
                          <Badge 
                            variant={getStatusColor(appointment.status)}
                            size="sm"
                            icon={getStatusIcon(appointment.status)}
                          />
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {appointment.type}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Appointments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {user?.role === 'coach' ? 'All Appointments' : 'Your Appointments'}
          </h3>
        </div>
        
        {appointments.length === 0 ? (
          <Empty
            title="No appointments scheduled"
            description={user?.role === 'coach' 
              ? "You don't have any appointments scheduled yet."
              : "You haven't scheduled any appointments yet."
            }
            icon="Calendar"
            action={user?.role === 'client' ? () => setShowBookingModal(true) : undefined}
            actionLabel="Book Your First Appointment"
            showAction={user?.role === 'client'}
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((appointment) => (
              <motion.div
                key={appointment.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {format(parseISO(appointment.dateTime), 'EEEE, MMMM d, yyyy')}
                      </h4>
                      <Badge 
                        variant={getStatusColor(appointment.status)}
                        icon={getStatusIcon(appointment.status)}
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="Clock" className="w-4 h-4" />
                        <span>{format(parseISO(appointment.dateTime), 'h:mm a')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ApperIcon name={getTypeIcon(appointment.type)} className="w-4 h-4" />
                        <span className="capitalize">{appointment.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="User" className="w-4 h-4" />
                        <span>
                          {user?.role === 'coach' ? 'Client Session' : 'Dr. Sarah Wilson'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {appointment.status === 'scheduled' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          icon="Edit"
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="X"
                          onClick={() => handleCancelAppointment(appointment.Id)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    
                    {appointment.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="FileText"
                      >
                        View Notes
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Book Appointment</h3>
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={() => setShowBookingModal(false)}
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              
              <div>
                <label className="form-label">Time</label>
                <select className="form-select">
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Session Type</label>
                <select className="form-select">
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-4 pt-4">
                <Button
                  onClick={() => {
                    handleBookAppointment({
                      dateTime: '2024-02-15T10:00:00Z',
                      type: 'video'
                    });
                  }}
                  fullWidth
                >
                  Book Appointment
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowBookingModal(false)}
                  fullWidth
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Schedule;