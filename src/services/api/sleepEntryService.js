import { toast } from 'react-toastify';

const tableName = 'sleep_entry';

const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

// Get all sleep entries
async function getAll() {
  try {
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "date" } },
        { field: { Name: "bed_time" } },
        { field: { Name: "wake_time" } },
        { field: { Name: "quality" } },
        { field: { Name: "notes" } },
        { field: { Name: "created_at" } },
        { field: { Name: "user_id" } }
      ],
      orderBy: [
        {
          fieldName: "date",
          sorttype: "DESC"
        }
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
    console.error("Error fetching sleep entries:", error);
    toast.error("Failed to fetch sleep entries");
    return [];
  }
}

// Get sleep entry by ID
async function getById(id) {
  try {
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "date" } },
        { field: { Name: "bed_time" } },
        { field: { Name: "wake_time" } },
        { field: { Name: "quality" } },
        { field: { Name: "notes" } },
        { field: { Name: "created_at" } },
        { field: { Name: "user_id" } }
      ]
    };

    const response = await apperClient.getRecordById(tableName, id, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching sleep entry with ID ${id}:`, error);
    toast.error("Failed to fetch sleep entry");
    return null;
  }
}

// Create new sleep entry
async function create(entryData) {
  try {
    const params = {
      records: [
        {
          // Only include Updateable fields
          Name: entryData.Name || "",
          Tags: entryData.Tags || "",
          Owner: entryData.Owner || null,
          date: entryData.date,
          bed_time: entryData.bed_time,
          wake_time: entryData.wake_time,
          quality: entryData.quality,
          notes: entryData.notes || "",
          created_at: entryData.created_at || new Date().toISOString(),
          user_id: entryData.user_id
        }
      ]
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
        toast.success("Sleep entry created successfully");
        return successfulRecords[0].data;
      }
    }

    return null;
  } catch (error) {
    console.error("Error creating sleep entry:", error);
    toast.error("Failed to create sleep entry");
    return null;
  }
}

// Update sleep entry
async function update(id, entryData) {
  try {
    const params = {
      records: [
        {
          Id: id,
          // Only include Updateable fields
          Name: entryData.Name,
          Tags: entryData.Tags,
          Owner: entryData.Owner,
          date: entryData.date,
          bed_time: entryData.bed_time,
          wake_time: entryData.wake_time,
          quality: entryData.quality,
          notes: entryData.notes,
          created_at: entryData.created_at,
          user_id: entryData.user_id
        }
      ]
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
        toast.success("Sleep entry updated successfully");
        return successfulUpdates[0].data;
      }
    }

    return null;
  } catch (error) {
    console.error("Error updating sleep entry:", error);
    toast.error("Failed to update sleep entry");
    return null;
  }
}

// Delete sleep entry
async function deleteSleepEntry(id) {
  try {
    const params = {
      RecordIds: [id]
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
        toast.success("Sleep entry deleted successfully");
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error deleting sleep entry:", error);
    toast.error("Failed to delete sleep entry");
    return false;
  }
}

export default {
  getAll,
  getById,
  create,
  update,
  deleteSleepEntry
};
import { toast } from "react-toastify";

// Initialize ApperClient

const tableName = 'sleep_entry';

// Get all sleep entries
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
        { field: { Name: "date" } },
        { field: { Name: "bed_time" } },
        { field: { Name: "wake_time" } },
        { field: { Name: "quality" } },
        { field: { Name: "notes" } },
        { field: { Name: "created_at" } },
        { field: { Name: "user_id" } }
      ],
      orderBy: [
        { fieldName: "date", sorttype: "DESC" }
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
    console.error("Error fetching sleep entries:", error);
    toast.error("Failed to fetch sleep entries");
    return [];
  }
};

// Get sleep entry by ID
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
        { field: { Name: "date" } },
        { field: { Name: "bed_time" } },
        { field: { Name: "wake_time" } },
        { field: { Name: "quality" } },
        { field: { Name: "notes" } },
        { field: { Name: "created_at" } },
        { field: { Name: "user_id" } }
      ]
    };

    const response = await apperClient.getRecordById(tableName, parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching sleep entry with ID ${id}:`, error);
    return null;
  }
};

// Create new sleep entry
export const create = async (entryData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Name: entryData.Name,
        Tags: entryData.Tags,
        Owner: entryData.Owner,
        date: entryData.date,
        bed_time: entryData.bed_time,
        wake_time: entryData.wake_time,
        quality: parseInt(entryData.quality),
        notes: entryData.notes,
        created_at: entryData.created_at || new Date().toISOString(),
        user_id: parseInt(entryData.user_id)
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
        console.error(`Failed to create ${failedRecords.length} sleep entries:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulRecords.length > 0) {
        toast.success('Sleep entry created successfully');
        return successfulRecords[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating sleep entry:", error);
    toast.error("Failed to create sleep entry");
    return null;
  }
};

// Update sleep entry
export const update = async (id, entryData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Id: parseInt(id),
        Name: entryData.Name,
        Tags: entryData.Tags,
        Owner: entryData.Owner,
        date: entryData.date,
        bed_time: entryData.bed_time,
        wake_time: entryData.wake_time,
        quality: parseInt(entryData.quality),
        notes: entryData.notes,
        created_at: entryData.created_at,
        user_id: parseInt(entryData.user_id)
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
        console.error(`Failed to update ${failedUpdates.length} sleep entries:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        toast.success('Sleep entry updated successfully');
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating sleep entry:", error);
    toast.error("Failed to update sleep entry");
    return null;
  }
};

// Delete sleep entry
export const deleteSleepEntry = async (id) => {
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
        console.error(`Failed to delete ${failedDeletions.length} sleep entries:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulDeletions.length > 0) {
        toast.success('Sleep entry deleted successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting sleep entry:", error);
    toast.error("Failed to delete sleep entry");
    return false;
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteSleepEntry
};