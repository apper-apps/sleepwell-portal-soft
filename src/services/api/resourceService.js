import { toast } from "react-toastify";

// Initialize ApperClient
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'resource';

// Get all resources
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
        { field: { Name: "title" } },
        { field: { Name: "type" } },
        { field: { Name: "url" } },
        { field: { Name: "description" } },
        { field: { Name: "client_access" } },
        { field: { Name: "created_at" } },
        { field: { Name: "coach_id" } }
      ],
      orderBy: [
        { fieldName: "title", sorttype: "ASC" }
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
    console.error("Error fetching resources:", error);
    toast.error("Failed to fetch resources");
    return [];
  }
};

// Get resource by ID
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
        { field: { Name: "title" } },
        { field: { Name: "type" } },
        { field: { Name: "url" } },
        { field: { Name: "description" } },
        { field: { Name: "client_access" } },
        { field: { Name: "created_at" } },
        { field: { Name: "coach_id" } }
      ]
    };

    const response = await apperClient.getRecordById(tableName, parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching resource with ID ${id}:`, error);
    return null;
  }
};

// Create new resource
export const create = async (resourceData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Name: resourceData.Name,
        Tags: resourceData.Tags,
        Owner: resourceData.Owner,
        title: resourceData.title,
        type: resourceData.type,
        url: resourceData.url,
        description: resourceData.description,
        client_access: resourceData.client_access,
        created_at: resourceData.created_at || new Date().toISOString(),
        coach_id: resourceData.coach_id ? parseInt(resourceData.coach_id) : null
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
        console.error(`Failed to create ${failedRecords.length} resources:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulRecords.length > 0) {
        toast.success('Resource created successfully');
        return successfulRecords[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating resource:", error);
    toast.error("Failed to create resource");
    return null;
  }
};

// Update resource
export const update = async (id, resourceData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Id: parseInt(id),
        Name: resourceData.Name,
        Tags: resourceData.Tags,
        Owner: resourceData.Owner,
        title: resourceData.title,
        type: resourceData.type,
        url: resourceData.url,
        description: resourceData.description,
        client_access: resourceData.client_access,
        created_at: resourceData.created_at,
        coach_id: resourceData.coach_id ? parseInt(resourceData.coach_id) : null
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
        console.error(`Failed to update ${failedUpdates.length} resources:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        toast.success('Resource updated successfully');
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating resource:", error);
    toast.error("Failed to update resource");
    return null;
  }
};

// Delete resource
export const deleteResource = async (id) => {
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
        console.error(`Failed to delete ${failedDeletions.length} resources:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulDeletions.length > 0) {
        toast.success('Resource deleted successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting resource:", error);
    toast.error("Failed to delete resource");
    return false;
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteResource
};