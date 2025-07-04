// Purchase service for managing package purchases
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const purchaseService = {
  // Get all purchases
  async getAll() {
    await delay(300);
    
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { 
            field: { name: "packageId" },
            referenceField: { field: { Name: "Name" } }
          },
          { 
            field: { name: "clientId" },
            referenceField: { field: { Name: "Name" } }
          },
          { field: { Name: "purchaseDate" } },
          { field: { Name: "status" } },
          { field: { Name: "CreatedOn" } }
        ],
        orderBy: [
          { fieldName: "CreatedOn", sorttype: "DESC" }
        ]
      };
      
      const response = await apperClient.fetchRecords('purchase', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching purchases:", error);
      return [];
    }
  },

  // Get purchase by ID
  async getById(id) {
    await delay(200);
    
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { 
            field: { name: "packageId" },
            referenceField: { field: { Name: "Name" } }
          },
          { 
            field: { name: "clientId" },
            referenceField: { field: { Name: "Name" } }
          },
          { field: { Name: "purchaseDate" } },
          { field: { Name: "status" } },
          { field: { Name: "CreatedOn" } }
        ]
      };
      
      const response = await apperClient.getRecordById('purchase', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching purchase with ID ${id}:`, error);
      return null;
    }
  },

  // Get purchases by client ID
  async getByClientId(clientId) {
    await delay(300);
    
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { 
            field: { name: "packageId" },
            referenceField: { field: { Name: "Name" } }
          },
          { field: { Name: "purchaseDate" } },
          { field: { Name: "status" } }
        ],
        where: [
          {
            FieldName: "clientId",
            Operator: "EqualTo",
            Values: [parseInt(clientId)]
          }
        ],
        orderBy: [
          { fieldName: "purchaseDate", sorttype: "DESC" }
        ]
      };
      
      const response = await apperClient.fetchRecords('purchase', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching client purchases:", error);
      return [];
    }
  },

  // Create new purchase
  async create(purchaseData) {
    await delay(400);
    
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Only include Updateable fields
      const params = {
        records: [{
          Name: purchaseData.Name,
          packageId: parseInt(purchaseData.packageId),
          clientId: parseInt(purchaseData.clientId),
          purchaseDate: new Date().toISOString(),
          status: purchaseData.status || 'pending'
        }]
      };
      
      const response = await apperClient.createRecord('purchase', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} purchases:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create purchase');
        }
        
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      console.error("Error creating purchase:", error);
      throw error;
    }
  },

  // Update purchase status
  async updateStatus(id, status) {
    await delay(300);
    
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [{
          Id: parseInt(id),
          status: status
        }]
      };
      
      const response = await apperClient.updateRecord('purchase', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} purchases:${JSON.stringify(failedUpdates)}`);
          throw new Error(failedUpdates[0].message || 'Failed to update purchase');
        }
        
        return successfulUpdates[0]?.data;
      }
    } catch (error) {
      console.error("Error updating purchase:", error);
      throw error;
    }
  },

  // Delete purchase
  async delete(id) {
    await delay(300);
    
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('purchase', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete purchase:${JSON.stringify(failedDeletions)}`);
          throw new Error(failedDeletions[0].message || 'Failed to delete purchase');
        }
        
        return true;
      }
    } catch (error) {
      console.error("Error deleting purchase:", error);
      throw error;
    }
  }
};