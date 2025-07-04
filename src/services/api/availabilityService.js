import mockData from '@/services/mockData/availability.json';

class AvailabilityService {
  constructor() {
    this.data = [...mockData];
  }

  async getAll() {
    await this.delay();
    return [...this.data];
  }

  async getByCoachId(coachId) {
    await this.delay();
    return this.data.filter(item => item.coachId === parseInt(coachId)).map(item => ({ ...item }));
  }

  async getById(id) {
    await this.delay();
    const availability = this.data.find(item => item.Id === parseInt(id));
    if (!availability) {
      throw new Error('Availability not found');
    }
    return { ...availability };
  }

  async create(availabilityData) {
    await this.delay();
    const newAvailability = {
      ...availabilityData,
      Id: Math.max(...this.data.map(item => item.Id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    this.data.push(newAvailability);
    return { ...newAvailability };
  }

  async update(id, availabilityData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Availability not found');
    }
    
    this.data[index] = {
      ...this.data[index],
      ...availabilityData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.data[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Availability not found');
    }
    
    this.data.splice(index, 1);
    return { success: true };
  }

  async bulkUpdate(coachId, availabilityRules) {
    await this.delay();
    // Remove existing availability for coach
    this.data = this.data.filter(item => item.coachId !== parseInt(coachId));
    
    // Add new availability rules
    const newRules = availabilityRules.map((rule, index) => ({
      ...rule,
      Id: Math.max(...this.data.map(item => item.Id), 0) + index + 1,
      coachId: parseInt(coachId),
      createdAt: new Date().toISOString()
    }));
    
    this.data.push(...newRules);
    return newRules.map(rule => ({ ...rule }));
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
}

export const availabilityService = new AvailabilityService();