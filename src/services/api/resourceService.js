import mockData from '@/services/mockData/resources.json';

class ResourceService {
  constructor() {
    this.data = [...mockData];
  }

  async getAll() {
    await this.delay();
    return [...this.data];
  }

  async getById(id) {
    await this.delay();
    const resource = this.data.find(item => item.Id === id);
    if (!resource) {
      throw new Error('Resource not found');
    }
    return { ...resource };
  }

  async create(resourceData) {
    await this.delay();
    const newResource = {
      ...resourceData,
      Id: Math.max(...this.data.map(item => item.Id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    this.data.push(newResource);
    return { ...newResource };
  }

  async update(id, resourceData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error('Resource not found');
    }
    
    this.data[index] = {
      ...this.data[index],
      ...resourceData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.data[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error('Resource not found');
    }
    
    this.data.splice(index, 1);
    return { success: true };
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
}

export const resourceService = new ResourceService();