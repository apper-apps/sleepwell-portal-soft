import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sessionTypeService } from '@/services/api/sessionTypeService';
import availabilityService from '@/services/api/availabilityService';
import appointmentService from '@/services/api/appointmentService';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import { toast } from 'react-toastify';
import { format, addDays, startOfDay, parseISO } from 'date-fns';

const PublicBooking = () => {
  const { coachId } = useParams();
  const [step, setStep] = useState(1);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [selectedSessionType, setSelectedSessionType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const nextSevenDays = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfDay(new Date()), i)
  );

  useEffect(() => {
    loadSessionTypes();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedSessionType) {
      loadAvailableSlots();
    }
  }, [selectedDate, selectedSessionType]);

  const loadSessionTypes = async () => {
    try {
      setLoading(true);
      const data = await sessionTypeService.getActiveSessionTypes();
      setSessionTypes(data);
      setError(null);
    } catch (err) {
      setError('Failed to load session types');
      console.error('Error loading session types:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const slots = await appointmentService.getAvailableSlots(parseInt(coachId), dateStr);
      setAvailableSlots(slots);
    } catch (err) {
      console.error('Error loading available slots:', err);
      setAvailableSlots([]);
    }
  };

  const handleSessionTypeSelect = (sessionType) => {
    setSelectedSessionType(sessionType);
    setStep(2);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const bookingData = {
        coachId: parseInt(coachId),
        clientName: clientInfo.name,
        clientEmail: clientInfo.email,
        clientPhone: clientInfo.phone,
        sessionType: selectedSessionType.name,
        sessionTypeId: selectedSessionType.Id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        duration: selectedSessionType.duration,
        price: selectedSessionType.price,
        notes: clientInfo.notes,
        status: 'pending'
      };

      await appointmentService.createBooking(bookingData);
      setBookingComplete(true);
      toast.success('Booking request submitted successfully!');
    } catch (err) {
      toast.error('Failed to submit booking request');
      console.error('Error creating booking:', err);
    }
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedSessionType(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setBookingComplete(false);
    setClientInfo({ name: '', email: '', phone: '', notes: '' });
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadSessionTypes} />;

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
            <ApperIcon name="Check" className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your booking request has been submitted successfully. You will receive a confirmation email shortly.
          </p>
          <Button onClick={resetBooking} className="w-full bg-primary text-white">
            Book Another Session
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <ApperIcon name="Moon" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SleepWell Coaching</h1>
              <p className="text-gray-600">Book your sleep coaching session</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            {[
              { number: 1, title: 'Select Service', completed: step > 1 },
              { number: 2, title: 'Choose Date & Time', completed: step > 2 },
              { number: 3, title: 'Your Information', completed: false }
            ].map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepItem.completed ? 'bg-success text-white' : 
                  step === stepItem.number ? 'bg-primary text-white' : 
                  'bg-gray-200 text-gray-600'
                }`}>
                  {stepItem.completed ? (
                    <ApperIcon name="Check" className="w-4 h-4" />
                  ) : (
                    stepItem.number
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step === stepItem.number ? 'text-primary' : 'text-gray-600'
                }`}>
                  {stepItem.title}
                </span>
                {index < 2 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    stepItem.completed ? 'bg-success' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Step 1: Select Session Type */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900">Select a Session Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessionTypes.map((sessionType) => (
                <motion.div
                  key={sessionType.Id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleSessionTypeSelect(sessionType)}
                  className="card cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="flex items-start space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                      style={{ backgroundColor: sessionType.color }}
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {sessionType.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {sessionType.description}
                      </p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">
                          {sessionType.duration} minutes
                        </span>
                        <span className="font-semibold text-primary">
                          ${sessionType.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Choose Date & Time</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(1)}
              >
                <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-1" />
                Back
              </Button>
            </div>

            <div className="card">
              <h3 className="font-medium text-gray-900 mb-4">Selected Session:</h3>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedSessionType.color }}
                />
                <span className="font-medium">{selectedSessionType.name}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">{selectedSessionType.duration} min</span>
                <span className="text-gray-500">•</span>
                <span className="font-medium">${selectedSessionType.price}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div className="card">
                <h3 className="font-medium text-gray-900 mb-4">Select Date</h3>
                <div className="space-y-2">
                  {nextSevenDays.map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleDateSelect(date)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                          ? 'border-primary bg-primary bg-opacity-10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{format(date, 'EEEE, MMMM d')}</div>
                      <div className="text-sm text-gray-500">{format(date, 'yyyy')}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className="card">
                <h3 className="font-medium text-gray-900 mb-4">Select Time</h3>
                {!selectedDate ? (
                  <p className="text-gray-500 text-center py-8">
                    Please select a date first
                  </p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No available times for this date
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => handleTimeSelect(slot)}
                        className={`p-2 text-center rounded-lg border transition-colors ${
                          selectedTime === slot
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Client Information */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Your Information</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(2)}
              >
                <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-1" />
                Back
              </Button>
            </div>

            <div className="card">
              <h3 className="font-medium text-gray-900 mb-4">Booking Summary:</h3>
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <span>Session:</span>
                  <span className="font-medium">{selectedSessionType.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">{format(selectedDate, 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{selectedSessionType.duration} minutes</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">${selectedSessionType.price}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit} className="card space-y-4">
              <h3 className="font-medium text-gray-900">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                  required
                />
                <Input
                  type="email"
                  label="Email Address"
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                  required
                />
              </div>

              <Input
                type="tel"
                label="Phone Number"
                value={clientInfo.phone}
                onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={clientInfo.notes}
                  onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                  className="form-textarea"
                  rows={3}
                  placeholder="Any specific concerns or information you'd like to share..."
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-white"
              >
                Submit Booking Request
              </Button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PublicBooking;