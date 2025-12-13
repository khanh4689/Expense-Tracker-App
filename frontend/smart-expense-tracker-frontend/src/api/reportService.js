import axiosClient from './axiosClient';

const reportService = {
    // Get monthly report
    getMonthlyReport: async (month, year) => {
        const response = await axiosClient.get(`/api/reports/monthly?month=${month}&year=${year}`);
        return response.data;
    },

    // Get category report
    getCategoryReport: async () => {
        const response = await axiosClient.get('/api/reports/category');
        return response.data;
    },

    // Get daily summary
    getDailySummary: async (date) => {
        const response = await axiosClient.get(`/api/reports/daily?date=${date}`);
        return response.data;
    },

    // Get summary (total income, expenses, balance)
    getSummary: async () => {
        const response = await axiosClient.get('/api/reports/summary');
        return response.data;
    }
};

export default reportService;

