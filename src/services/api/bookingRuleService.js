import { toast } from 'react-toastify';

class BookingRuleService {
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
          { field: { Name: "rules" } },
          { field: { Name: "active" } },
          { field: { Name: "created_at" } },
          { field: { Name: "coach_id" } }
        ]
      };
      
      const response = await this.apperClient.fetchRecords('booking_rule', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching booking rules:', error);
      toast.error('Failed to fetch booking rules');
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
          { field: { Name: "description" } },
          { field: { Name: "rules" } },
          { field: { Name: "active" } },
          { field: { Name: "created_at" } },
          { field: { Name: "coach_id" } }
        ],
        where: [
          {
            FieldName: "coach_id",
            Operator: "EqualTo",
            Values: [parseInt(coachId)]
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords('booking_rule', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching booking rules by coach:', error);
      toast.error('Failed to fetch booking rules');
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
          { field: { Name: "rules" } },
          { field: { Name: "active" } },
          { field: { Name: "created_at" } },
          { field: { Name: "coach_id" } }
        ]
      };
      
      const response = await this.apperClient.getRecordById('booking_rule', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching booking rule with ID ${id}:`, error);
      toast.error('Failed to fetch booking rule');
      return null;
    }
  }

  async create(ruleData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Name: ruleData.Name,
          Tags: ruleData.Tags || '',
          description: ruleData.description || '',
          rules: typeof ruleData.rules === 'object' ? JSON.stringify(ruleData.rules) : ruleData.rules,
          active: ruleData.active || true,
          coach_id: parseInt(ruleData.coach_id),
          created_at: new Date().toISOString()
        }]
      };
      
      const response = await this.apperClient.createRecord('booking_rule', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} booking rules:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success('Booking rule created successfully');
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error creating booking rule:', error);
      toast.error('Failed to create booking rule');
      return null;
    }
  }

  async update(id, ruleData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Id: parseInt(id),
          Name: ruleData.Name,
          Tags: ruleData.Tags,
          description: ruleData.description,
          rules: typeof ruleData.rules === 'object' ? JSON.stringify(ruleData.rules) : ruleData.rules,
          active: ruleData.active,
          coach_id: parseInt(ruleData.coach_id)
        }]
      };
      
      const response = await this.apperClient.updateRecord('booking_rule', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} booking rules:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success('Booking rule updated successfully');
          return successfulUpdates[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error updating booking rule:', error);
      toast.error('Failed to update booking rule');
      return null;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord('booking_rule', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} booking rules:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          toast.success('Booking rule deleted successfully');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting booking rule:', error);
      toast.error('Failed to delete booking rule');
      return false;
    }
  }
}

export const bookingRuleService = new BookingRuleService();