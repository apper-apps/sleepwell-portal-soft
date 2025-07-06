import { toast } from "react-toastify";
import React from "react";

// Initialize ApperClient
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'note';

// Get all notes
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
        { field: { Name: "content" } },
        { field: { Name: "client_id" } },
        { field: { Name: "coach_id" } },
        { field: { Name: "is_shared" } },
        { field: { Name: "is_session_note" } },
        { field: { Name: "appointment_id" } }
      ],
      orderBy: [
        { fieldName: "CreatedOn", sorttype: "DESC" }
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
    console.error("Error fetching notes:", error);
    toast.error("Failed to fetch notes");
    return [];
  }
};

// Get note by ID
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
        { field: { Name: "content" } },
        { field: { Name: "client_id" } },
        { field: { Name: "coach_id" } },
        { field: { Name: "is_shared" } },
        { field: { Name: "is_session_note" } },
        { field: { Name: "appointment_id" } }
      ]
    };

    const response = await apperClient.getRecordById(tableName, parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching note with ID ${id}:`, error);
    return null;
  }
};

// Create new note
export const create = async (noteData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Name: noteData.Name,
        Tags: noteData.Tags,
        Owner: noteData.Owner,
        content: noteData.content,
        client_id: noteData.client_id ? parseInt(noteData.client_id) : null,
        coach_id: noteData.coach_id ? parseInt(noteData.coach_id) : null,
        is_shared: noteData.is_shared || false,
        is_session_note: noteData.is_session_note || false,
        appointment_id: noteData.appointment_id ? parseInt(noteData.appointment_id) : null
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
        console.error(`Failed to create ${failedRecords.length} notes:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulRecords.length > 0) {
        toast.success('Note created successfully');
        return successfulRecords[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating note:", error);
    toast.error("Failed to create note");
    return null;
  }
};

// Update note
export const update = async (id, noteData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Id: parseInt(id),
        Name: noteData.Name,
        Tags: noteData.Tags,
        Owner: noteData.Owner,
        content: noteData.content,
        client_id: noteData.client_id ? parseInt(noteData.client_id) : null,
        coach_id: noteData.coach_id ? parseInt(noteData.coach_id) : null,
        is_shared: noteData.is_shared,
        is_session_note: noteData.is_session_note,
        appointment_id: noteData.appointment_id ? parseInt(noteData.appointment_id) : null
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
        console.error(`Failed to update ${failedUpdates.length} notes:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        toast.success('Note updated successfully');
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating note:", error);
    toast.error("Failed to update note");
    return null;
  }
};

// Delete note
export const deleteNote = async (id) => {
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
        console.error(`Failed to delete ${failedDeletions.length} notes:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulDeletions.length > 0) {
        toast.success('Note deleted successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting note:", error);
    toast.error("Failed to delete note");
    return false;
  }
};

// Helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Note service object for alternative API usage
export const noteService = {
  async getAll() {
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
          { field: { Name: "content" } },
          { field: { Name: "client_id" } },
          { field: { Name: "coach_id" } },
          { field: { Name: "is_shared" } },
          { field: { Name: "is_session_note" } },
          { field: { Name: "appointment_id" } }
        ],
        orderBy: [
          { fieldName: "CreatedOn", sorttype: "DESC" }
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
      console.error("Error fetching notes:", error);
      toast.error("Failed to fetch notes");
      return [];
    }
  },

  async getById(id) {
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
          { field: { Name: "content" } },
          { field: { Name: "client_id" } },
          { field: { Name: "coach_id" } },
          { field: { Name: "is_shared" } },
          { field: { Name: "is_session_note" } },
          { field: { Name: "appointment_id" } }
        ]
      };

      const response = await apperClient.getRecordById(tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching note with ID ${id}:`, error);
      toast.error("Failed to load note");
      return null;
    }
  },

  async create(noteData) {
    try {
      await delay(300);
      
      const params = {
        records: [{
          Name: noteData.Name || "Session Note",
          Tags: noteData.Tags,
          Owner: noteData.Owner,
          content: noteData.content || "",
          client_id: noteData.client_id ? parseInt(noteData.client_id) : null,
          coach_id: noteData.coach_id ? parseInt(noteData.coach_id) : null,
          is_shared: noteData.is_shared || false,
          is_session_note: noteData.is_session_note || false,
          appointment_id: noteData.appointment_id ? parseInt(noteData.appointment_id) : null
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
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulRecords.length > 0) {
          toast.success("Note created successfully");
          return successfulRecords[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
      return null;
    }
  },

  async update(id, noteData) {
    try {
      await delay(300);
      
      const params = {
        records: [{
          Id: parseInt(id),
          Name: noteData.Name,
          Tags: noteData.Tags,
          Owner: noteData.Owner,
          content: noteData.content,
          client_id: noteData.client_id ? parseInt(noteData.client_id) : null,
          coach_id: noteData.coach_id ? parseInt(noteData.coach_id) : null,
          is_shared: noteData.is_shared,
          is_session_note: noteData.is_session_note,
          appointment_id: noteData.appointment_id ? parseInt(noteData.appointment_id) : null
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
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          toast.success("Note updated successfully");
          return successfulUpdates[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Failed to update note");
      return null;
    }
  },

  async delete(id) {
    try {
      await delay(200);
      
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
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulDeletions.length > 0) {
          toast.success("Note deleted successfully");
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
      return false;
    }
  },

  async getByClientId(clientId) {
    try {
      const allNotes = await this.getAll();
      return allNotes.filter(note => note.client_id === parseInt(clientId));
    } catch (error) {
      console.error("Error fetching client notes:", error);
      toast.error("Failed to load client notes");
      return [];
    }
  },

  async getSharedByClientId(clientId) {
    try {
      const allNotes = await this.getAll();
      return allNotes.filter(note => 
        note.client_id === parseInt(clientId) && note.is_shared === true
      );
    } catch (error) {
      console.error("Error fetching shared notes:", error);
      toast.error("Failed to load shared notes");
      return [];
    }
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteNote,
  noteService
};