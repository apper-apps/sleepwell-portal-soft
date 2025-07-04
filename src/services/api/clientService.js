import mockData from '@/services/mockData/clients.json';

class ClientService {
  constructor() {
    this.data = [...mockData];
  }

  async getAll() {
    await this.delay();
    return [...this.data];
  }

  async getById(id) {
    await this.delay();
    const client = this.data.find(item => item.Id === id);
    if (!client) {
      throw new Error('Client not found');
    }
    return { ...client };
  }

  async create(clientData) {
    await this.delay();
    const newClient = {
      ...clientData,
      Id: Math.max(...this.data.map(item => item.Id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    this.data.push(newClient);
    return { ...newClient };
  }

  async update(id, clientData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error('Client not found');
    }
    
    this.data[index] = {
      ...this.data[index],
      ...clientData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.data[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error('Client not found');
    }
    
    this.data.splice(index, 1);
    return { success: true };
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
}

export const clientService = new ClientService();