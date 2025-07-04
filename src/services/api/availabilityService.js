import { toast } from 'react-toastify';

class AvailabilityService {
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
          { field: { Name: "coach_id" } },
          { field: { Name: "day_of_week" } },
          { field: { Name: "start_time" } },
          { field: { Name: "end_time" } },
          { field: { Name: "break_start" } },
          { field: { Name: "break_end" } },
          { field: { Name: "active" } },
          { field: { Name: "created_at" } }
        ]
      };
      
      const response = await this.apperClient.fetchRecords('availability', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to fetch availability');
      return [];
    }
  }

  async getByCoachId(coachId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "coach_id" } },
          { field: { Name: "day_of_week" } },
          { field: { Name: "start_time" } },
          { field: { Name: "end_time" } },
          { field: { Name: "break_start" } },
          { field: { Name: "break_end" } },
          { field: { Name: "active" } },
          { field: { Name: "created_at" } }
        ],
        where: [
          {
            FieldName: "coach_id",
            Operator: "EqualTo",
            Values: [parseInt(coachId)]
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords('availability', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching availability by coach:', error);
      toast.error('Failed to fetch availability');
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
          { field: { Name: "coach_id" } },
          { field: { Name: "day_of_week" } },
          { field: { Name: "start_time" } },
          { field: { Name: "end_time" } },
          { field: { Name: "break_start" } },
          { field: { Name: "break_end" } },
          { field: { Name: "active" } },
          { field: { Name: "created_at" } }
        ]
      };
      
      const response = await this.apperClient.getRecordById('availability', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching availability with ID ${id}:`, error);
      toast.error('Failed to fetch availability');
      return null;
    }
  }

  async create(availabilityData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Name: availabilityData.Name || '',
          Tags: availabilityData.Tags || '',
          coach_id: parseInt(availabilityData.coach_id),
          day_of_week: parseInt(availabilityData.day_of_week),
          start_time: availabilityData.start_time,
          end_time: availabilityData.end_time,
          break_start: availabilityData.break_start || '',
          break_end: availabilityData.break_end || '',
          active: availabilityData.active || true,
          created_at: new Date().toISOString()
        }]
      };
      
      const response = await this.apperClient.createRecord('availability', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} availability records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success('Availability created successfully');
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error creating availability:', error);
      toast.error('Failed to create availability');
      return null;
    }
  }

  async update(id, availabilityData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Id: parseInt(id),
          Name: availabilityData.Name,
          Tags: availabilityData.Tags,
          coach_id: parseInt(availabilityData.coach_id),
          day_of_week: parseInt(availabilityData.day_of_week),
          start_time: availabilityData.start_time,
          end_time: availabilityData.end_time,
          break_start: availabilityData.break_start,
          break_end: availabilityData.break_end,
          active: availabilityData.active
        }]
      };
      
      const response = await this.apperClient.updateRecord('availability', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} availability records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success('Availability updated successfully');
          return successfulUpdates[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
      return null;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord('availability', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} availability records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          toast.success('Availability deleted successfully');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast.error('Failed to delete availability');
      return false;
    }
  }

  async bulkUpdate(coachId, availabilityRules) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // First delete existing availability for coach
      const existingRecords = await this.getByCoachId(coachId);
      if (existingRecords.length > 0) {
        const deleteParams = {
          RecordIds: existingRecords.map(record => record.Id)
        };
        await this.apperClient.deleteRecord('availability', deleteParams);
      }
      
      // Then create new availability rules
      if (availabilityRules.length > 0) {
        const createParams = {
          records: availabilityRules.map(rule => ({
            Name: rule.Name || '',
            Tags: rule.Tags || '',
            coach_id: parseInt(coachId),
            day_of_week: parseInt(rule.day_of_week),
            start_time: rule.start_time,
            end_time: rule.end_time,
            break_start: rule.break_start || '',
            break_end: rule.break_end || '',
            active: rule.active || true,
            created_at: new Date().toISOString()
          }))
        };
        
        const response = await this.apperClient.createRecord('availability', createParams);
        
        if (!response.success) {
          console.error(response.message);
          toast.error(response.message);
          return [];
        }
        
        if (response.results) {
          const successfulRecords = response.results.filter(result => result.success);
          const failedRecords = response.results.filter(result => !result.success);
          
          if (failedRecords.length > 0) {
            console.error(`Failed to create ${failedRecords.length} availability records:${JSON.stringify(failedRecords)}`);
            
            failedRecords.forEach(record => {
              record.errors?.forEach(error => {
                toast.error(`${error.fieldLabel}: ${error.message}`);
              });
              if (record.message) toast.error(record.message);
            });
          }
          
          if (successfulRecords.length > 0) {
            toast.success('Availability updated successfully');
            return successfulRecords.map(result => result.data);
          }
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error bulk updating availability:', error);
      toast.error('Failed to update availability');
      return [];
    }
  }
}

export const availabilityService = new AvailabilityService();