import mockData from '@/services/mockData/sleepEntries.json';

class SleepEntryService {
  constructor() {
    this.data = [...mockData];
  }

  async getAll() {
    await this.delay();
    return [...this.data];
  }

  async getById(id) {
    await this.delay();
    const entry = this.data.find(item => item.Id === id);
    if (!entry) {
      throw new Error('Sleep entry not found');
    }
    return { ...entry };
  }

  async create(entryData) {
    await this.delay();
    const newEntry = {
      ...entryData,
      Id: Math.max(...this.data.map(item => item.Id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    this.data.push(newEntry);
    return { ...newEntry };
  }

  async update(id, entryData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error('Sleep entry not found');
    }
    
    this.data[index] = {
      ...this.data[index],
      ...entryData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.data[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error('Sleep entry not found');
    }
    
    this.data.splice(index, 1);
    return { success: true };
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
}

export const sleepEntryService = new SleepEntryService();