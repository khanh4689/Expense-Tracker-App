import axiosClient from './axiosClient';

const budgetService = {
    // Create new budget
    createBudget: async (data) => {
        const response = await axiosClient.post('/api/budgets', data);
        return response.data;
    },

    // Get all budgets
    getAllBudgets: async () => {
        const response = await axiosClient.get('/api/budgets');
        return response.data;
    },

    // Get current/active budget
    getCurrentBudget: async () => {
        const response = await axiosClient.get('/api/budgets/current');
        return response.data;
    },

    // Update budget
    updateBudget: async (id, data) => {
        const response = await axiosClient.put(`/api/budgets/${id}`, data);
        return response.data;
    },

    // Delete budget
    deleteBudget: async (id) => {
        await axiosClient.delete(`/api/budgets/${id}`);
    }
};

export default budgetService;

