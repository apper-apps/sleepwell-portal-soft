import { toast } from "react-toastify";

// Initialize ApperClient
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'message';

// Get all messages
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
        { field: { Name: "thread_id" } },
        { field: { Name: "content" } },
        { field: { Name: "timestamp" } },
        { field: { Name: "read" } },
        { field: { Name: "created_at" } },
        { field: { Name: "sender_id" } }
      ],
      orderBy: [
        { fieldName: "timestamp", sorttype: "DESC" }
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
    console.error("Error fetching messages:", error);
    toast.error("Failed to fetch messages");
    return [];
  }
};

// Get message by ID
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
        { field: { Name: "thread_id" } },
        { field: { Name: "content" } },
        { field: { Name: "timestamp" } },
        { field: { Name: "read" } },
        { field: { Name: "created_at" } },
        { field: { Name: "sender_id" } }
      ]
    };

    const response = await apperClient.getRecordById(tableName, parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching message with ID ${id}:`, error);
    return null;
  }
};

// Create new message
export const create = async (messageData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Name: messageData.Name,
        Tags: messageData.Tags,
        Owner: messageData.Owner,
        thread_id: messageData.thread_id,
        content: messageData.content,
        timestamp: messageData.timestamp || new Date().toISOString(),
        read: messageData.read || false,
        created_at: messageData.created_at || new Date().toISOString(),
        sender_id: parseInt(messageData.sender_id)
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
        console.error(`Failed to create ${failedRecords.length} messages:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulRecords.length > 0) {
        toast.success('Message sent successfully');
        return successfulRecords[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating message:", error);
    toast.error("Failed to send message");
    return null;
  }
};

// Update message
export const update = async (id, messageData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Id: parseInt(id),
        Name: messageData.Name,
        Tags: messageData.Tags,
        Owner: messageData.Owner,
        thread_id: messageData.thread_id,
        content: messageData.content,
        timestamp: messageData.timestamp,
        read: messageData.read,
        created_at: messageData.created_at,
        sender_id: parseInt(messageData.sender_id)
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
        console.error(`Failed to update ${failedUpdates.length} messages:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        toast.success('Message updated successfully');
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating message:", error);
    toast.error("Failed to update message");
    return null;
  }
};

// Delete message
export const deleteMessage = async (id) => {
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
        console.error(`Failed to delete ${failedDeletions.length} messages:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulDeletions.length > 0) {
        toast.success('Message deleted successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting message:", error);
    toast.error("Failed to delete message");
    return false;
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteMessage
};