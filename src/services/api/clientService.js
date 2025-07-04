import { toast } from 'react-toastify';

class ClientService {
  constructor() {
    this.apperClient = null;
    this.initializeClient();
  }

  initializeClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getAll() {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "email" } },
          { field: { Name: "phone" } },
          { field: { Name: "status" } },
          { field: { Name: "current_phase" } },
          { field: { Name: "sleep_goal" } },
          { field: { Name: "joined_date" } },
          { field: { Name: "created_at" } },
          { field: { Name: "coach_id" } }
        ]
      };
      
      const response = await this.apperClient.fetchRecords('client', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to fetch clients');
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "email" } },
          { field: { Name: "phone" } },
          { field: { Name: "status" } },
          { field: { Name: "current_phase" } },
          { field: { Name: "sleep_goal" } },
          { field: { Name: "joined_date" } },
          { field: { Name: "created_at" } },
          { field: { Name: "coach_id" } }
        ]
      };
      
      const response = await this.apperClient.getRecordById('client', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching client with ID ${id}:`, error);
      toast.error('Failed to fetch client');
      return null;
    }
  }

  async create(clientData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Name: clientData.Name,
          Tags: clientData.Tags || '',
          email: clientData.email,
          phone: clientData.phone || '',
          status: clientData.status || 'active',
          current_phase: clientData.current_phase || 'onboarding',
          sleep_goal: clientData.sleep_goal || '',
          joined_date: clientData.joined_date || new Date().toISOString().split('T')[0],
          coach_id: parseInt(clientData.coach_id),
          created_at: new Date().toISOString()
        }]
      };
      
      const response = await this.apperClient.createRecord('client', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} clients:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success('Client created successfully');
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Failed to create client');
      return null;
    }
  }

  async update(id, clientData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Id: parseInt(id),
          Name: clientData.Name,
          Tags: clientData.Tags,
          email: clientData.email,
          phone: clientData.phone,
          status: clientData.status,
          current_phase: clientData.current_phase,
          sleep_goal: clientData.sleep_goal,
          joined_date: clientData.joined_date,
          coach_id: parseInt(clientData.coach_id)
        }]
      };
      
      const response = await this.apperClient.updateRecord('client', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} clients:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success('Client updated successfully');
          return successfulUpdates[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
      return null;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord('client', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} clients:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          toast.success('Client deleted successfully');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
      return false;
    }
  }
}

export const clientService = new ClientService();