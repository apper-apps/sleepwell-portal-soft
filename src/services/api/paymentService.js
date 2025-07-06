import { toast } from "react-toastify";
import React from "react";
import Error from "@/components/ui/Error";

// Initialize ApperClient
const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'payment';

// Get all payments
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
        { field: { Name: "paymentDate" } },
        { field: { Name: "amount" } },
        { field: { Name: "paymentMethod" } },
        { field: { Name: "purchaseId" } }
      ],
      orderBy: [
        { fieldName: "paymentDate", sorttype: "DESC" }
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
    console.error("Error fetching payments:", error);
    toast.error("Failed to fetch payments");
    return [];
  }
};

// Get payment by ID
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
        { field: { Name: "paymentDate" } },
        { field: { Name: "amount" } },
        { field: { Name: "paymentMethod" } },
        { field: { Name: "purchaseId" } }
      ]
    };

    const response = await apperClient.getRecordById(tableName, parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching payment with ID ${id}:`, error);
    return null;
  }
};

// Create new payment
export const create = async (paymentData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Name: paymentData.Name,
        Tags: paymentData.Tags,
        Owner: paymentData.Owner,
        paymentDate: paymentData.paymentDate || new Date().toISOString(),
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        purchaseId: parseInt(paymentData.purchaseId)
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
        console.error(`Failed to create ${failedRecords.length} payments:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulRecords.length > 0) {
        toast.success('Payment created successfully');
        return successfulRecords[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error creating payment:", error);
    toast.error("Failed to create payment");
    return null;
  }
};

// Update payment
export const update = async (id, paymentData) => {
  try {
    // Only include Updateable fields
    const params = {
      records: [{
        Id: parseInt(id),
        Name: paymentData.Name,
        Tags: paymentData.Tags,
        Owner: paymentData.Owner,
        paymentDate: paymentData.paymentDate,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        purchaseId: parseInt(paymentData.purchaseId)
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
        console.error(`Failed to update ${failedUpdates.length} payments:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        toast.success('Payment updated successfully');
        return successfulUpdates[0].data;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error updating payment:", error);
    toast.error("Failed to update payment");
    return null;
  }
};

// Delete payment
export const deletePayment = async (id) => {
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
        console.error(`Failed to delete ${failedDeletions.length} payments:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulDeletions.length > 0) {
        toast.success('Payment deleted successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting payment:", error);
    toast.error("Failed to delete payment");
    return false;
  }
};

// Helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get payments by purchase ID
export const getByPurchaseId = async (purchaseId) => {
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
        { field: { Name: "paymentDate" } },
        { field: { Name: "amount" } },
        { field: { Name: "paymentMethod" } },
        { field: { Name: "purchaseId" } }
      ],
      where: [
        {
          FieldName: "purchaseId",
          Operator: "EqualTo",
          Values: [parseInt(purchaseId)]
        }
      ],
      orderBy: [
        { fieldName: "paymentDate", sorttype: "DESC" }
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
    console.error("Error fetching purchase payments:", error);
    toast.error("Failed to fetch purchase payments");
    return [];
  }
};

// Process payment (simulate payment processing)
export const processPayment = async (paymentData) => {
  try {
    // Simulate payment processing logic
    const isSuccessful = Math.random() > 0.1; // 90% success rate
    
    if (!isSuccessful) {
      throw new Error('Payment processing failed. Please try again.');
    }
    
    // Create payment record if processing is successful
    const paymentRecord = await create({
      Name: `Payment for Purchase ${paymentData.purchaseId}`,
      purchaseId: paymentData.purchaseId,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod
    });
    
    return {
      success: true,
      paymentId: paymentRecord?.Id,
      transactionId: `TXN_${Date.now()}`,
      message: 'Payment processed successfully'
    };
  } catch (error) {
    console.error("Error processing payment:", error);
    return {
      success: false,
      message: error.message || 'Payment processing failed'
    };
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  deletePayment,
  getByPurchaseId,
  processPayment
};