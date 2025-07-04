import mockData from '@/services/mockData/appointments.json';

class AppointmentService {
  constructor() {
    this.data = [...mockData];
  }

  async getAll() {
    await this.delay();
    return [...this.data];
  }

  async getById(id) {
    await this.delay();
    const appointment = this.data.find(item => item.Id === id);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    return { ...appointment };
  }

  async create(appointmentData) {
    await this.delay();
    const newAppointment = {
      ...appointmentData,
      Id: Math.max(...this.data.map(item => item.Id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    this.data.push(newAppointment);
    return { ...newAppointment };
  }

  async update(id, appointmentData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error('Appointment not found');
    }
    
    this.data[index] = {
      ...this.data[index],
      ...appointmentData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.data[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error('Appointment not found');
    }
    
    this.data.splice(index, 1);
    return { success: true };
return { success: true };
  }

  async getAvailableSlots(coachId, date) {
    await this.delay();
    // Mock available slots for a given date
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isBooked = this.data.some(apt => 
          apt.coachId === coachId && 
          apt.date === date && 
          apt.time === timeString
        );
        if (!isBooked) {
          slots.push(timeString);
        }
      }
    }
    return slots;
  }

  async createBooking(bookingData) {
    await this.delay();
    const booking = {
      ...bookingData,
      Id: Math.max(...this.data.map(item => item.Id), 0) + 1,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    this.data.push(booking);
    return { ...booking };
  }

  async getBookingsByCoach(coachId) {
    await this.delay();
    return this.data.filter(item => item.coachId === coachId).map(item => ({ ...item }));
  }

  async updateBookingStatus(id, status) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error('Booking not found');
    }
    
    this.data[index] = {
      ...this.data[index],
      status,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.data[index] };
  }

  async delay() {
return new Promise(resolve => setTimeout(resolve, 300));
  }
}

const appointmentService = new AppointmentService();

export { appointmentService };