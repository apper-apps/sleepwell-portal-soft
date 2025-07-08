import { toast } from "react-toastify";
import React from "react";

// Initialize ApperClient
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'client';

// Get all clients
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
        { field: { Name: "email" } },
        { field: { Name: "phone" } },
        { field: { Name: "status" } },
        { field: { Name: "current_phase" } },
        { field: { Name: "sleep_goal" } },
        { field: { Name: "joined_date" } },
        { field: { Name: "created_at" } },
        { field: { Name: "coach_id" } },
        { field: { Name: "bypass_login" } },
        { field: { Name: "auto_save" } }
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
    console.error("Error fetching clients:", error);
    toast.error("Failed to fetch clients");
    return [];
  }
};

// Get client by ID
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
        { field: { Name: "email" } },
        { field: { Name: "phone" } },
        { field: { Name: "status" } },
        { field: { Name: "current_phase" } },
        { field: { Name: "sleep_goal" } },
        { field: { Name: "joined_date" } },
        { field: { Name: "created_at" } },
        { field: { Name: "coach_id" } },
        { field: { Name: "bypass_login" } },
        { field: { Name: "auto_save" } }
      ]
    };

    const response = await apperClient.getRecordById(tableName, parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching client with ID ${id}:`, error);
    return null;
  }
};

// Create new client
export const create = async (clientData) => {
  try {
    // Only include Updateable fields
    const params = {
records: [{
        Name: clientData.Name,
        Tags: clientData.Tags,
        Owner: clientData.Owner,
        email: clientData.email,
        phone: clientData.phone,
        status: clientData.status || 'active',
        current_phase: clientData.current_phase,
        sleep_goal: clientData.sleep_goal,
        joined_date: clientData.joined_date,
        created_at: clientData.created_at || new Date().toISOString(),
        coach_id: clientData.coach_id ? parseInt(clientData.coach_id) : null,
        bypass_login: clientData.bypass_login || false,
        auto_save: clientData.auto_save || true
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
        console.error(`Failed to create ${failedRecords.length} clients:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulRecords.length > 0) {
        toast.success('Client created successfully');
        return successfulRecords[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating client:", error);
    toast.error("Failed to create client");
    return null;
  }
};

// Update client
export const update = async (id, clientData) => {
  try {
    // Only include Updateable fields
    const params = {
records: [{
        Id: parseInt(id),
        Name: clientData.Name,
        Tags: clientData.Tags,
        Owner: clientData.Owner,
        email: clientData.email,
        phone: clientData.phone,
        status: clientData.status,
        current_phase: clientData.current_phase,
        sleep_goal: clientData.sleep_goal,
        joined_date: clientData.joined_date,
        created_at: clientData.created_at,
        coach_id: clientData.coach_id ? parseInt(clientData.coach_id) : null,
        bypass_login: clientData.bypass_login,
        auto_save: clientData.auto_save
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
        console.error(`Failed to update ${failedUpdates.length} clients:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        toast.success('Client updated successfully');
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating client:", error);
    toast.error("Failed to update client");
    return null;
  }
};

// Delete client
export const deleteClient = async (id) => {
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
        console.error(`Failed to delete ${failedDeletions.length} clients:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulDeletions.length > 0) {
        toast.success('Client deleted successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting client:", error);
    toast.error("Failed to delete client");
    return false;
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteClient
};