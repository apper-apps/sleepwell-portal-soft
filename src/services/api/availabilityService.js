import { toast } from "react-toastify";
import React from "react";

// Initialize ApperClient
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'availability';

// Get all availability records
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
        { field: { Name: "coach_id" } },
        { field: { Name: "day_of_week" } },
        { field: { Name: "start_time" } },
        { field: { Name: "end_time" } },
        { field: { Name: "break_start" } },
        { field: { Name: "break_end" } },
        { field: { Name: "active" } },
        { field: { Name: "created_at" } }
      ],
      orderBy: [
        { fieldName: "day_of_week", sorttype: "ASC" },
        { fieldName: "start_time", sorttype: "ASC" }
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
    console.error("Error fetching availability:", error);
    toast.error("Failed to fetch availability");
    return [];
  }
};

// Get availability by ID
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

    const response = await apperClient.getRecordById(tableName, parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching availability with ID ${id}:`, error);
    return null;
  }
};

// Create new availability
export const create = async (availabilityData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Name: availabilityData.Name,
        Tags: availabilityData.Tags,
        Owner: availabilityData.Owner,
        coach_id: availabilityData.coach_id ? parseInt(availabilityData.coach_id) : null,
        day_of_week: parseInt(availabilityData.day_of_week),
        start_time: availabilityData.start_time,
        end_time: availabilityData.end_time,
        break_start: availabilityData.break_start,
        break_end: availabilityData.break_end,
        active: availabilityData.active || true,
        created_at: availabilityData.created_at || new Date().toISOString()
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
    console.error("Error creating availability:", error);
    toast.error("Failed to create availability");
    return null;
  }
};

// Update availability
export const update = async (id, availabilityData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Id: parseInt(id),
        Name: availabilityData.Name,
        Tags: availabilityData.Tags,
        Owner: availabilityData.Owner,
        coach_id: availabilityData.coach_id ? parseInt(availabilityData.coach_id) : null,
        day_of_week: parseInt(availabilityData.day_of_week),
        start_time: availabilityData.start_time,
        end_time: availabilityData.end_time,
        break_start: availabilityData.break_start,
        break_end: availabilityData.break_end,
        active: availabilityData.active,
        created_at: availabilityData.created_at
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
    console.error("Error updating availability:", error);
    toast.error("Failed to update availability");
    return null;
  }
};

// Delete availability
export const deleteAvailability = async (id) => {
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
    console.error("Error deleting availability:", error);
    toast.error("Failed to delete availability");
    return false;
  }
};

// Get availability by coach ID
export const getByCoachId = async (coachId) => {
  try {
    if (!coachId) {
      console.error('Coach ID is required');
      return [];
    }

    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "CreatedBy" } },
        { field: { Name: "ModifiedOn" } },
        { field: { Name: "ModifiedBy" } },
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
      ],
      orderBy: [
        { fieldName: "day_of_week", sorttype: "ASC" },
        { fieldName: "start_time", sorttype: "ASC" }
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
    console.error('Error fetching availability by coach:', error);
    toast.error('Failed to fetch availability');
    return [];
  }
};

// Bulk update availability for a coach
export const bulkUpdate = async (coachId, availabilityRules) => {
  try {
    if (!coachId || !Array.isArray(availabilityRules)) {
      console.error('Coach ID and availability rules are required');
      return [];
    }

    // First delete existing availability for coach
    const existingRecords = await getByCoachId(coachId);
    if (existingRecords.length > 0) {
      const deleteParams = {
        RecordIds: existingRecords.map(record => record.Id)
      };
      await apperClient.deleteRecord(tableName, deleteParams);
    }

    // Then create new availability rules
    if (availabilityRules.length > 0) {
      const createParams = {
        records: availabilityRules.map(rule => ({
          Name: rule.Name || '',
          Tags: rule.Tags || '',
          Owner: rule.Owner,
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

      const response = await apperClient.createRecord(tableName, createParams);

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
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteAvailability,
  getByCoachId,
  bulkUpdate
};