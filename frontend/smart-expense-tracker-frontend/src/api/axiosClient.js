import axios from 'axios';
import { getAccessToken, clearAuthData } from '../utils/auth';

/**
 * Axios instance configured for the Expense Tracker API
 * Base URL: http://localhost:8080
 * Includes automatic JWT token injection and error handling
 */
const axiosClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 seconds timeout
});

/**
 * Request Interceptor
 * Automatically adds JWT token to all requests
 */
axiosClient.interceptors.request.use(
    (config) => {
        const token = getAccessToken();

        // Add token to Authorization header if it exists
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * Handles authentication errors and token expiration
 */
axiosClient.interceptors.response.use(
    (response) => {
        // Return successful response
        return response;
    },
    (error) => {
        // Handle different error scenarios
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    // Unauthorized - Invalid or expired token
                    console.error('Authentication failed: Invalid or expired token');
                    handleAuthenticationError();
                    break;

                case 403:
                    // Forbidden - User doesn't have permission or is disabled
                    console.error('Access forbidden: Insufficient permissions or account disabled');
                    handleAuthenticationError();
                    break;

                case 404:
                    console.error('Resource not found');
                    break;

                case 500:
                    console.error('Server error occurred');
                    break;

                default:
                    console.error(`Error ${status}: ${data?.message || 'Unknown error'}`);
            }

            // Extract error message for the caller
            if (data?.errors) {
                // Validation errors from backend
                error.validationErrors = data.errors;
            }
            error.message = data?.message || error.message || 'An error occurred';
        } else if (error.request) {
            // Request was made but no response received
            console.error('Network error: No response from server');
            error.message = 'Network error. Please check your internet connection.';
        } else {
            // Something else happened
            console.error('Error:', error.message);
        }

        return Promise.reject(error);
    }
);

/**
 * Handle authentication errors by clearing data and redirecting to login
 */
const handleAuthenticationError = () => {
    // Clear all authentication data
    clearAuthData();

    // Redirect to login page
    // Only redirect if not already on login page to avoid infinite loop
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
};

export default axiosClient;

