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
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
}

export const appointmentService = new AppointmentService();