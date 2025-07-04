import mockData from '@/services/mockData/bookingRules.json';

class BookingRuleService {
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
    const rule = this.data.find(item => item.Id === parseInt(id));
    if (!rule) {
      throw new Error('Booking rule not found');
    }
    return { ...rule };
  }

  async create(ruleData) {
    await this.delay();
    const newRule = {
      ...ruleData,
      Id: Math.max(...this.data.map(item => item.Id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    this.data.push(newRule);
    return { ...newRule };
  }

  async update(id, ruleData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Booking rule not found');
    }
    
    this.data[index] = {
      ...this.data[index],
      ...ruleData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.data[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Booking rule not found');
    }
    
    this.data.splice(index, 1);
    return { success: true };
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
}

export const bookingRuleService = new BookingRuleService();