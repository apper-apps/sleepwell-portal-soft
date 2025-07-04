import { toast } from 'react-toastify';

class SessionTypeService {
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
          { field: { Name: "description" } },
          { field: { Name: "duration" } },
          { field: { Name: "price" } },
          { field: { Name: "color" } },
          { field: { Name: "active" } },
          { field: { Name: "buffer_time" } },
          { field: { Name: "max_advance_booking" } },
          { field: { Name: "min_advance_booking" } },
          { field: { Name: "created_at" } }
        ]
      };
      
      const response = await this.apperClient.fetchRecords('session_type', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching session types:', error);
      toast.error('Failed to fetch session types');
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
          { field: { Name: "description" } },
          { field: { Name: "duration" } },
          { field: { Name: "price" } },
          { field: { Name: "color" } },
          { field: { Name: "active" } },
          { field: { Name: "buffer_time" } },
          { field: { Name: "max_advance_booking" } },
          { field: { Name: "min_advance_booking" } },
          { field: { Name: "created_at" } }
        ]
      };
      
      const response = await this.apperClient.getRecordById('session_type', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching session type with ID ${id}:`, error);
      toast.error('Failed to fetch session type');
      return null;
    }
  }

  async create(sessionTypeData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Name: sessionTypeData.Name,
          Tags: sessionTypeData.Tags || '',
          description: sessionTypeData.description || '',
          duration: parseInt(sessionTypeData.duration),
          price: parseFloat(sessionTypeData.price),
          color: sessionTypeData.color || '',
          active: sessionTypeData.active || true,
          buffer_time: parseInt(sessionTypeData.buffer_time || 0),
          max_advance_booking: parseInt(sessionTypeData.max_advance_booking || 30),
          min_advance_booking: parseInt(sessionTypeData.min_advance_booking || 24),
          created_at: new Date().toISOString()
        }]
      };
      
      const response = await this.apperClient.createRecord('session_type', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} session types:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success('Session type created successfully');
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error creating session type:', error);
      toast.error('Failed to create session type');
      return null;
    }
  }

  async update(id, sessionTypeData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Id: parseInt(id),
          Name: sessionTypeData.Name,
          Tags: sessionTypeData.Tags,
          description: sessionTypeData.description,
          duration: parseInt(sessionTypeData.duration),
          price: parseFloat(sessionTypeData.price),
          color: sessionTypeData.color,
          active: sessionTypeData.active,
          buffer_time: parseInt(sessionTypeData.buffer_time),
          max_advance_booking: parseInt(sessionTypeData.max_advance_booking),
          min_advance_booking: parseInt(sessionTypeData.min_advance_booking)
        }]
      };
      
      const response = await this.apperClient.updateRecord('session_type', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} session types:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success('Session type updated successfully');
          return successfulUpdates[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error updating session type:', error);
      toast.error('Failed to update session type');
      return null;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord('session_type', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} session types:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          toast.success('Session type deleted successfully');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting session type:', error);
      toast.error('Failed to delete session type');
      return false;
    }
  }

  async getActiveSessionTypes() {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "description" } },
          { field: { Name: "duration" } },
          { field: { Name: "price" } },
          { field: { Name: "color" } },
          { field: { Name: "active" } },
          { field: { Name: "buffer_time" } },
          { field: { Name: "max_advance_booking" } },
          { field: { Name: "min_advance_booking" } },
          { field: { Name: "created_at" } }
        ],
        where: [
          {
            FieldName: "active",
            Operator: "EqualTo",
            Values: [true]
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords('session_type', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching active session types:', error);
      toast.error('Failed to fetch active session types');
      return [];
    }
  }
}

export const sessionTypeService = new SessionTypeService();