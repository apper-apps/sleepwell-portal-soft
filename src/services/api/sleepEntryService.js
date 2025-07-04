import { toast } from 'react-toastify';

class SleepEntryService {
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
          { field: { Name: "date" } },
          { field: { Name: "bed_time" } },
          { field: { Name: "wake_time" } },
          { field: { Name: "quality" } },
          { field: { Name: "notes" } },
          { field: { Name: "created_at" } },
          { field: { Name: "user_id" } }
        ]
      };
      
      const response = await this.apperClient.fetchRecords('sleep_entry', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching sleep entries:', error);
      toast.error('Failed to fetch sleep entries');
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
          { field: { Name: "date" } },
          { field: { Name: "bed_time" } },
          { field: { Name: "wake_time" } },
          { field: { Name: "quality" } },
          { field: { Name: "notes" } },
          { field: { Name: "created_at" } },
          { field: { Name: "user_id" } }
        ]
      };
      
      const response = await this.apperClient.getRecordById('sleep_entry', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching sleep entry with ID ${id}:`, error);
      toast.error('Failed to fetch sleep entry');
      return null;
    }
  }

  async create(entryData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Name: entryData.Name || '',
          Tags: entryData.Tags || '',
          date: entryData.date,
          bed_time: entryData.bed_time,
          wake_time: entryData.wake_time,
          quality: parseInt(entryData.quality),
          notes: entryData.notes || '',
          user_id: parseInt(entryData.user_id),
          created_at: new Date().toISOString()
        }]
      };
      
      const response = await this.apperClient.createRecord('sleep_entry', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} sleep entries:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success('Sleep entry created successfully');
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error creating sleep entry:', error);
      toast.error('Failed to create sleep entry');
      return null;
    }
  }

  async update(id, entryData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Id: parseInt(id),
          Name: entryData.Name,
          Tags: entryData.Tags,
          date: entryData.date,
          bed_time: entryData.bed_time,
          wake_time: entryData.wake_time,
          quality: parseInt(entryData.quality),
          notes: entryData.notes,
          user_id: parseInt(entryData.user_id)
        }]
      };
      
      const response = await this.apperClient.updateRecord('sleep_entry', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} sleep entries:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success('Sleep entry updated successfully');
          return successfulUpdates[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error updating sleep entry:', error);
      toast.error('Failed to update sleep entry');
      return null;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord('sleep_entry', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} sleep entries:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          toast.success('Sleep entry deleted successfully');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting sleep entry:', error);
      toast.error('Failed to delete sleep entry');
      return false;
    }
  }
}

export const sleepEntryService = new SleepEntryService();