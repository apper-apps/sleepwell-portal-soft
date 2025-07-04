import mockData from '@/services/mockData/sessionTypes.json';

class SessionTypeService {
  constructor() {
    this.data = [...mockData];
  }

  async getAll() {
    await this.delay();
    return [...this.data];
  }

  async getById(id) {
    await this.delay();
    const sessionType = this.data.find(item => item.Id === parseInt(id));
    if (!sessionType) {
      throw new Error('Session type not found');
    }
    return { ...sessionType };
  }

  async create(sessionTypeData) {
    await this.delay();
    const newSessionType = {
      ...sessionTypeData,
      Id: Math.max(...this.data.map(item => item.Id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    this.data.push(newSessionType);
    return { ...newSessionType };
  }

  async update(id, sessionTypeData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Session type not found');
    }
    
    this.data[index] = {
      ...this.data[index],
      ...sessionTypeData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.data[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Session type not found');
    }
    
    this.data.splice(index, 1);
    return { success: true };
  }

  async getActiveSessionTypes() {
    await this.delay();
    return this.data.filter(item => item.active).map(item => ({ ...item }));
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
}

export const sessionTypeService = new SessionTypeService();