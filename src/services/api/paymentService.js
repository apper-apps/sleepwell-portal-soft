// Payment service for managing payment records
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const paymentService = {
  // Get all payments
  async getAll() {
    await delay(300);
    
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { 
            field: { name: "purchaseId" },
            referenceField: { field: { Name: "Name" } }
          },
          { field: { Name: "paymentDate" } },
          { field: { Name: "amount" } },
          { field: { Name: "paymentMethod" } },
          { field: { Name: "CreatedOn" } }
        ],
        orderBy: [
          { fieldName: "paymentDate", sorttype: "DESC" }
        ]
      };
      
      const response = await apperClient.fetchRecords('payment', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching payments:", error);
      return [];
    }
  },

  // Get payment by ID
  async getById(id) {
    await delay(200);
    
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { 
            field: { name: "purchaseId" },
            referenceField: { field: { Name: "Name" } }
          },
          { field: { Name: "paymentDate" } },
          { field: { Name: "amount" } },
          { field: { Name: "paymentMethod" } },
          { field: { Name: "CreatedOn" } }
        ]
      };
      
      const response = await apperClient.getRecordById('payment', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching payment with ID ${id}:`, error);
      return null;
    }
  },

  // Get payments by purchase ID
  async getByPurchaseId(purchaseId) {
    await delay(300);
    
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "paymentDate" } },
          { field: { Name: "amount" } },
          { field: { Name: "paymentMethod" } }
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
      
      const response = await apperClient.fetchRecords('payment', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching purchase payments:", error);
      return [];
    }
  },

  // Create new payment record
  async create(paymentData) {
    await delay(400);
    
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Only include Updateable fields
      const params = {
        records: [{
          Name: paymentData.Name,
          purchaseId: parseInt(paymentData.purchaseId),
          paymentDate: new Date().toISOString(),
          amount: parseFloat(paymentData.amount),
          paymentMethod: paymentData.paymentMethod
        }]
      };
      
      const response = await apperClient.createRecord('payment', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} payments:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create payment');
        }
        
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  },

  // Process payment (simulate payment processing)
  async processPayment(paymentData) {
    await delay(2000); // Simulate payment processing time
    
    try {
      // Simulate payment processing logic
      const isSuccessful = Math.random() > 0.1; // 90% success rate
      
      if (!isSuccessful) {
        throw new Error('Payment processing failed. Please try again.');
      }
      
      // Create payment record if processing is successful
      const paymentRecord = await this.create({
        Name: `Payment for Purchase ${paymentData.purchaseId}`,
        purchaseId: paymentData.purchaseId,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod
      });
      
      return {
        success: true,
        paymentId: paymentRecord.Id,
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
  },

  // Delete payment
  async delete(id) {
    await delay(300);
    
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('payment', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete payment:${JSON.stringify(failedDeletions)}`);
          throw new Error(failedDeletions[0].message || 'Failed to delete payment');
        }
        
        return true;
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      throw error;
    }
  }
};