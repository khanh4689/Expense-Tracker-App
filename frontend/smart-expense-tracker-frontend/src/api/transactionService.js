import axiosClient from './axiosClient';

const transactionService = {
    // Create new transaction
    createTransaction: async (data) => {
        const response = await axiosClient.post('/api/transactions', data);
        return response.data;
    },

    // Get all transactions
    getAllTransactions: async () => {
        const response = await axiosClient.get('/api/transactions');
        return response.data;
    },

    // Get transaction by ID
    getTransactionById: async (id) => {
        const response = await axiosClient.get(`/api/transactions/${id}`);
        return response.data;
    },

    // Delete transaction
    deleteTransaction: async (id) => {
        await axiosClient.delete(`/api/transactions/${id}`);
    }
};

export default transactionService;

