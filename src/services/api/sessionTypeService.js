import { toast } from "react-toastify";

// Initialize ApperClient
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'session_type';

// Get all session types
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
        { field: { Name: "duration" } },
        { field: { Name: "price" } },
        { field: { Name: "color" } },
        { field: { Name: "active" } },
        { field: { Name: "buffer_time" } },
        { field: { Name: "max_advance_booking" } },
        { field: { Name: "min_advance_booking" } },
        { field: { Name: "created_at" } }
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
    console.error("Error fetching session types:", error);
    toast.error("Failed to fetch session types");
    return [];
  }
};

// Get session type by ID
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

    const response = await apperClient.getRecordById(tableName, parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching session type with ID ${id}:`, error);
    return null;
  }
};

// Create new session type
export const create = async (sessionTypeData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Name: sessionTypeData.Name,
        Tags: sessionTypeData.Tags,
        Owner: sessionTypeData.Owner,
        description: sessionTypeData.description,
        duration: parseInt(sessionTypeData.duration),
        price: parseFloat(sessionTypeData.price),
        color: sessionTypeData.color,
        active: sessionTypeData.active || true,
        buffer_time: parseInt(sessionTypeData.buffer_time) || 0,
        max_advance_booking: parseInt(sessionTypeData.max_advance_booking) || 30,
        min_advance_booking: parseInt(sessionTypeData.min_advance_booking) || 1,
        created_at: sessionTypeData.created_at || new Date().toISOString()
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
    console.error("Error creating session type:", error);
    toast.error("Failed to create session type");
    return null;
  }
};

// Update session type
export const update = async (id, sessionTypeData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Id: parseInt(id),
        Name: sessionTypeData.Name,
        Tags: sessionTypeData.Tags,
        Owner: sessionTypeData.Owner,
        description: sessionTypeData.description,
        duration: parseInt(sessionTypeData.duration),
        price: parseFloat(sessionTypeData.price),
        color: sessionTypeData.color,
        active: sessionTypeData.active,
        buffer_time: parseInt(sessionTypeData.buffer_time),
        max_advance_booking: parseInt(sessionTypeData.max_advance_booking),
        min_advance_booking: parseInt(sessionTypeData.min_advance_booking),
        created_at: sessionTypeData.created_at
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
    console.error("Error updating session type:", error);
    toast.error("Failed to update session type");
    return null;
  }
};

// Delete session type
export const deleteSessionType = async (id) => {
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
    console.error("Error deleting session type:", error);
    toast.error("Failed to delete session type");
    return false;
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteSessionType
};