import { toast } from "react-toastify";
import React from "react";

// Initialize ApperClient
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'booking_rule';

// Get all booking rules
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
        { field: { Name: "rules" } },
        { field: { Name: "active" } },
        { field: { Name: "created_at" } },
        { field: { Name: "coach_id" } }
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
    console.error("Error fetching booking rules:", error);
    toast.error("Failed to fetch booking rules");
    return [];
  }
};

// Get booking rule by ID
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
        { field: { Name: "rules" } },
        { field: { Name: "active" } },
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
    console.error(`Error fetching booking rule with ID ${id}:`, error);
    return null;
  }
};

// Create new booking rule
export const create = async (ruleData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Name: ruleData.Name,
        Tags: ruleData.Tags,
        Owner: ruleData.Owner,
        description: ruleData.description,
        rules: ruleData.rules,
        active: ruleData.active || true,
        created_at: ruleData.created_at || new Date().toISOString(),
        coach_id: ruleData.coach_id ? parseInt(ruleData.coach_id) : null
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
    console.error("Error creating booking rule:", error);
    toast.error("Failed to create booking rule");
    return null;
  }
};

// Update booking rule
export const update = async (id, ruleData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Id: parseInt(id),
        Name: ruleData.Name,
        Tags: ruleData.Tags,
        Owner: ruleData.Owner,
        description: ruleData.description,
        rules: ruleData.rules,
        active: ruleData.active,
        created_at: ruleData.created_at,
        coach_id: ruleData.coach_id ? parseInt(ruleData.coach_id) : null
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
    console.error("Error updating booking rule:", error);
    toast.error("Failed to update booking rule");
    return null;
  }
};

// Delete booking rule
export const deleteBookingRule = async (id) => {
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
    console.error("Error deleting booking rule:", error);
    toast.error("Failed to delete booking rule");
    return false;
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteBookingRule
};