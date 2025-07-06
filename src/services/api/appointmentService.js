import { toast } from "react-toastify";
import React from "react";

// Initialize ApperClient
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'appointment';

// Get all appointments
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
        { field: { Name: "date_time" } },
        { field: { Name: "type" } },
        { field: { Name: "status" } },
        { field: { Name: "notes" } },
        { field: { Name: "created_at" } },
        { field: { Name: "client_id" } },
        { field: { Name: "coach_id" } }
      ],
      orderBy: [
        { fieldName: "date_time", sorttype: "DESC" }
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
    console.error("Error fetching appointments:", error);
    toast.error("Failed to fetch appointments");
    return [];
  }
};

// Get appointment by ID
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
        { field: { Name: "date_time" } },
        { field: { Name: "type" } },
        { field: { Name: "status" } },
        { field: { Name: "notes" } },
        { field: { Name: "created_at" } },
        { field: { Name: "client_id" } },
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
    console.error(`Error fetching appointment with ID ${id}:`, error);
    return null;
  }
};

// Create new appointment
export const create = async (appointmentData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Name: appointmentData.Name,
        Tags: appointmentData.Tags,
        Owner: appointmentData.Owner,
        date_time: appointmentData.date_time,
        type: appointmentData.type,
        status: appointmentData.status,
        notes: appointmentData.notes,
        created_at: appointmentData.created_at || new Date().toISOString(),
        client_id: parseInt(appointmentData.client_id),
        coach_id: parseInt(appointmentData.coach_id)
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
        console.error(`Failed to create ${failedRecords.length} appointments:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulRecords.length > 0) {
        toast.success('Appointment created successfully');
        return successfulRecords[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating appointment:", error);
    toast.error("Failed to create appointment");
    return null;
  }
};

// Update appointment
export const update = async (id, appointmentData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Id: parseInt(id),
        Name: appointmentData.Name,
        Tags: appointmentData.Tags,
        Owner: appointmentData.Owner,
        date_time: appointmentData.date_time,
        type: appointmentData.type,
        status: appointmentData.status,
        notes: appointmentData.notes,
        created_at: appointmentData.created_at,
        client_id: parseInt(appointmentData.client_id),
        coach_id: parseInt(appointmentData.coach_id)
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
        console.error(`Failed to update ${failedUpdates.length} appointments:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        toast.success('Appointment updated successfully');
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating appointment:", error);
    toast.error("Failed to update appointment");
    return null;
  }
};

// Delete appointment
export const deleteAppointment = async (id) => {
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
        console.error(`Failed to delete ${failedDeletions.length} appointments:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulDeletions.length > 0) {
        toast.success('Appointment deleted successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting appointment:", error);
    toast.error("Failed to delete appointment");
    return false;
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteAppointment
};