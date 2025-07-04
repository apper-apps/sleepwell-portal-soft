import { toast } from 'react-toastify';

class AppointmentService {
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
          { field: { Name: "date_time" } },
          { field: { Name: "type" } },
          { field: { Name: "status" } },
          { field: { Name: "notes" } },
          { field: { Name: "created_at" } },
          { field: { Name: "client_id" } },
          { field: { Name: "coach_id" } }
        ]
      };
      
      const response = await this.apperClient.fetchRecords('appointment', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
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
          { field: { Name: "date_time" } },
          { field: { Name: "type" } },
          { field: { Name: "status" } },
          { field: { Name: "notes" } },
          { field: { Name: "created_at" } },
          { field: { Name: "client_id" } },
          { field: { Name: "coach_id" } }
        ]
      };
      
      const response = await this.apperClient.getRecordById('appointment', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointment with ID ${id}:`, error);
      toast.error('Failed to fetch appointment');
      return null;
    }
  }

  async create(appointmentData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Name: appointmentData.Name || '',
          Tags: appointmentData.Tags || '',
          date_time: appointmentData.date_time,
          type: appointmentData.type,
          status: appointmentData.status,
          notes: appointmentData.notes || '',
          client_id: parseInt(appointmentData.client_id),
          coach_id: parseInt(appointmentData.coach_id),
          created_at: new Date().toISOString()
        }]
      };
      
      const response = await this.apperClient.createRecord('appointment', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} appointments:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success('Appointment created successfully');
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
      return null;
    }
  }

  async update(id, appointmentData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Id: parseInt(id),
          Name: appointmentData.Name,
          Tags: appointmentData.Tags,
          date_time: appointmentData.date_time,
          type: appointmentData.type,
          status: appointmentData.status,
          notes: appointmentData.notes,
          client_id: parseInt(appointmentData.client_id),
          coach_id: parseInt(appointmentData.coach_id)
        }]
      };
      
      const response = await this.apperClient.updateRecord('appointment', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} appointments:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success('Appointment updated successfully');
          return successfulUpdates[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
      return null;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord('appointment', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} appointments:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          toast.success('Appointment deleted successfully');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment');
      return false;
    }
  }
}

const appointmentService = new AppointmentService();

export { appointmentService };