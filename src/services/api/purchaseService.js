import { toast } from "react-toastify";

// Initialize ApperClient
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'purchase';

// Get all purchases
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
        { field: { Name: "packageId" } },
        { field: { Name: "clientId" } },
        { field: { Name: "purchaseDate" } },
        { field: { Name: "status" } }
      ],
      orderBy: [
        { fieldName: "purchaseDate", sorttype: "DESC" }
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
    console.error("Error fetching purchases:", error);
    toast.error("Failed to fetch purchases");
    return [];
  }
};

// Get purchase by ID
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
        { field: { Name: "packageId" } },
        { field: { Name: "clientId" } },
        { field: { Name: "purchaseDate" } },
        { field: { Name: "status" } }
      ]
    };

    const response = await apperClient.getRecordById(tableName, parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching purchase with ID ${id}:`, error);
    return null;
  }
};

// Create new purchase
export const create = async (purchaseData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Name: purchaseData.Name,
        Tags: purchaseData.Tags,
        Owner: purchaseData.Owner,
        packageId: parseInt(purchaseData.packageId),
        clientId: parseInt(purchaseData.clientId),
        purchaseDate: purchaseData.purchaseDate || new Date().toISOString(),
        status: purchaseData.status || 'pending'
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
        console.error(`Failed to create ${failedRecords.length} purchases:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulRecords.length > 0) {
        toast.success('Purchase created successfully');
        return successfulRecords[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating purchase:", error);
    toast.error("Failed to create purchase");
    return null;
  }
};

// Update purchase
export const update = async (id, purchaseData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Id: parseInt(id),
        Name: purchaseData.Name,
        Tags: purchaseData.Tags,
        Owner: purchaseData.Owner,
        packageId: parseInt(purchaseData.packageId),
        clientId: parseInt(purchaseData.clientId),
        purchaseDate: purchaseData.purchaseDate,
        status: purchaseData.status
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
        console.error(`Failed to update ${failedUpdates.length} purchases:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        toast.success('Purchase updated successfully');
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating purchase:", error);
    toast.error("Failed to update purchase");
    return null;
  }
};

// Delete purchase
export const deletePurchase = async (id) => {
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
        console.error(`Failed to delete ${failedDeletions.length} purchases:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulDeletions.length > 0) {
        toast.success('Purchase deleted successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting purchase:", error);
    toast.error("Failed to delete purchase");
    return false;
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  deletePurchase
};