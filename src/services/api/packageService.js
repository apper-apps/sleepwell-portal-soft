// Package service for managing coaching packages
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const packageService = {
  // Get all packages
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
          { field: { Name: "description" } },
          { field: { Name: "price" } },
          { field: { Name: "includedSessions" } },
          { field: { Name: "resources" } },
          { field: { Name: "Tags" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "ModifiedOn" } }
        ],
        orderBy: [
          { fieldName: "CreatedOn", sorttype: "DESC" }
        ]
      };
      
      const response = await apperClient.fetchRecords('package', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching packages:", error);
      return [];
    }
  },

  // Get package by ID
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
          { field: { Name: "description" } },
          { field: { Name: "price" } },
          { field: { Name: "includedSessions" } },
          { field: { Name: "resources" } },
          { field: { Name: "Tags" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "ModifiedOn" } }
        ]
      };
      
      const response = await apperClient.getRecordById('package', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching package with ID ${id}:`, error);
      return null;
    }
  },

  // Create new package
  async create(packageData) {
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
          Name: packageData.Name,
          description: packageData.description,
          price: parseFloat(packageData.price),
          includedSessions: parseInt(packageData.includedSessions),
          resources: packageData.resources,
          Tags: packageData.Tags || ""
        }]
      };
      
      const response = await apperClient.createRecord('package', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} packages:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create package');
        }
        
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      console.error("Error creating package:", error);
      throw error;
    }
  },

  // Update package
  async update(id, packageData) {
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
          Id: parseInt(id),
          Name: packageData.Name,
          description: packageData.description,
          price: parseFloat(packageData.price),
          includedSessions: parseInt(packageData.includedSessions),
          resources: packageData.resources,
          Tags: packageData.Tags || ""
        }]
      };
      
      const response = await apperClient.updateRecord('package', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} packages:${JSON.stringify(failedUpdates)}`);
          throw new Error(failedUpdates[0].message || 'Failed to update package');
        }
        
        return successfulUpdates[0]?.data;
      }
    } catch (error) {
      console.error("Error updating package:", error);
      throw error;
    }
  },

  // Delete package
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
      
      const response = await apperClient.deleteRecord('package', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete package:${JSON.stringify(failedDeletions)}`);
          throw new Error(failedDeletions[0].message || 'Failed to delete package');
        }
        
        return true;
      }
    } catch (error) {
      console.error("Error deleting package:", error);
      throw error;
    }
  }
};