import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import appointmentService from '@/services/api/appointmentService';
import { useUser } from '@/hooks/useUser';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { toast } from 'react-toastify';
import { format, parseISO, isToday, isFuture } from 'date-fns';

const BookingManagement = () => {
  const { user } = useUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getBookingsByCoach(user?.Id || 1);
      setBookings(data);
      setError(null);
    } catch (err) {
      setError('Failed to load bookings');
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await appointmentService.updateBookingStatus(bookingId, newStatus);
      toast.success(`Booking ${newStatus} successfully`);
      loadBookings();
    } catch (err) {
      toast.error(`Failed to ${newStatus} booking`);
      console.error('Error updating booking status:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'secondary';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.sessionType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'today') return matchesSearch && isToday(parseISO(booking.date));
    if (filter === 'upcoming') return matchesSearch && isFuture(parseISO(booking.date));
    if (filter === 'pending') return matchesSearch && booking.status === 'pending';
    
    return matchesSearch;
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadBookings} />;

  return (
    <div className="min-h-screen bg-surface p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Booking Management</h1>
            <p className="text-gray-600">Manage and track all your bookings</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'today', label: 'Today' },
                { key: 'upcoming', label: 'Upcoming' },
                { key: 'pending', label: 'Pending' }
              ].map(filterOption => (
                <Button
                  key={filterOption.key}
                  variant={filter === filterOption.key ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(filterOption.key)}
                >
                  {filterOption.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <Empty
            title="No bookings found"
            description="No bookings match your current filters"
          />
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <motion.div
                key={booking.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.clientName || 'Unknown Client'}
                      </h3>
                      <Badge variant={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
                        {format(parseISO(booking.date), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <ApperIcon name="Clock" className="w-4 h-4 mr-2" />
                        {booking.time}
                      </div>
                      <div className="flex items-center">
                        <ApperIcon name="Video" className="w-4 h-4 mr-2" />
                        {booking.sessionType || 'Session'}
                      </div>
                      <div className="flex items-center">
                        <ApperIcon name="DollarSign" className="w-4 h-4 mr-2" />
                        ${booking.price || 0}
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="mt-2 text-sm text-gray-600">{booking.notes}</p>
                    )}
                  </div>

                  <div className="flex space-x-2 mt-4 md:mt-0">
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(booking.Id, 'confirmed')}
                          className="text-success border-success hover:bg-success hover:text-white"
                        >
                          <ApperIcon name="Check" className="w-4 h-4 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(booking.Id, 'cancelled')}
                          className="text-error border-error hover:bg-error hover:text-white"
                        >
                          <ApperIcon name="X" className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </>
                    )}
                    
                    {booking.status === 'confirmed' && isFuture(parseISO(booking.date)) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(booking.Id, 'cancelled')}
                        className="text-error border-error hover:bg-error hover:text-white"
                      >
                        <ApperIcon name="X" className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                    >
                      <ApperIcon name="MoreHorizontal" className="w-4 h-4" />
                    </Button>
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

export default BookingManagement;