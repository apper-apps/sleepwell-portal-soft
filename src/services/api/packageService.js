import { toast } from "react-toastify";

// Initialize ApperClient
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'package';

// Get all packages
export const getAll = async () => {
  try {
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "CreatedBy" } },
        { field: { Name: "ModifiedOn" } },
        { field: { Name: "ModifiedBy" } },
        { field: { Name: "description" } },
        { field: { Name: "price" } },
        { field: { Name: "includedSessions" } },
        { field: { Name: "resources" } }
      ],
      orderBy: [
        { fieldName: "Name", sorttype: "ASC" }
      ]
    };

    const response = await apperClient.fetchRecords(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    console.error("Error fetching packages:", error);
    toast.error("Failed to fetch packages");
    return [];
  }
};

// Get package by ID
export const getById = async (id) => {
  try {
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "CreatedBy" } },
        { field: { Name: "ModifiedOn" } },
        { field: { Name: "ModifiedBy" } },
        { field: { Name: "description" } },
        { field: { Name: "price" } },
        { field: { Name: "includedSessions" } },
        { field: { Name: "resources" } }
      ]
    };

    const response = await apperClient.getRecordById(tableName, parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching package with ID ${id}:`, error);
    return null;
  }
};

// Create new package
export const create = async (packageData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Name: packageData.Name,
        Tags: packageData.Tags,
        Owner: packageData.Owner,
        description: packageData.description,
        price: parseFloat(packageData.price),
        includedSessions: parseInt(packageData.includedSessions),
        resources: packageData.resources
      }]
    };

    const response = await apperClient.createRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create ${failedRecords.length} packages:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulRecords.length > 0) {
        toast.success('Package created successfully');
        return successfulRecords[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating package:", error);
    toast.error("Failed to create package");
    return null;
  }
};

// Update package
export const update = async (id, packageData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Id: parseInt(id),
        Name: packageData.Name,
        Tags: packageData.Tags,
        Owner: packageData.Owner,
        description: packageData.description,
        price: parseFloat(packageData.price),
        includedSessions: parseInt(packageData.includedSessions),
        resources: packageData.resources
      }]
    };

    const response = await apperClient.updateRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} packages:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        toast.success('Package updated successfully');
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating package:", error);
    toast.error("Failed to update package");
    return null;
  }
};

// Delete package
export const deletePackage = async (id) => {
  try {
    const params = {
      RecordIds: [parseInt(id)]
    };

    const response = await apperClient.deleteRecord(tableName, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return false;
    }

    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success);
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete ${failedDeletions.length} packages:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulDeletions.length > 0) {
        toast.success('Package deleted successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting package:", error);
    toast.error("Failed to delete package");
    return false;
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  deletePackage
};