import mockData from '@/services/mockData/messages.json';

class MessageService {
  constructor() {
    this.data = [...mockData];
  }

  async getAll() {
    await this.delay();
    return [...this.data];
  }

  async getById(id) {
    await this.delay();
    const message = this.data.find(item => item.Id === id);
    if (!message) {
      throw new Error('Message not found');
    }
    return { ...message };
  }

  async create(messageData) {
    await this.delay();
    const newMessage = {
      ...messageData,
      Id: Math.max(...this.data.map(item => item.Id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    this.data.push(newMessage);
    return { ...newMessage };
  }

  async update(id, messageData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error('Message not found');
    }
    
    this.data[index] = {
      ...this.data[index],
      ...messageData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.data[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error('Message not found');
    }
    
    this.data.splice(index, 1);
    return { success: true };
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
}

export const messageService = new MessageService();