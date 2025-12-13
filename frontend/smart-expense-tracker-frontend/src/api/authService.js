import axiosClient from './axiosClient';
import { saveAuthData, clearAuthData, getUserData, isAuthenticated } from '../utils/auth';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 * Manages JWT tokens and user session data
 */
const authService = {
    /**
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Registration response
     */
    register: async (userData) => {
        const response = await axiosClient.post('/api/auth/register', userData);

        // Extract authentication data from response
        const { accessToken, token, username, email, enable } = response.data;

        // Support both 'accessToken' and 'token' field names
        const finalToken = accessToken || token;

        if (finalToken && username && email !== undefined && enable !== undefined) {
            // Check if user is enabled
            if (enable !== true) {
                throw new Error('Account is not enabled. Please verify your email.');
            }

            // Save authentication data
            saveAuthData({
                accessToken: finalToken,
                username,
                email,
                enable
            });
        }

        return response.data;
    },

    /**
     * Login user
     * @param {Object} credentials - Login credentials (username, password)
     * @returns {Promise<Object>} Login response with user data
     */
    login: async (credentials) => {
        const response = await axiosClient.post('/api/auth/login', credentials);

        console.log('Login response received:', response.data);

        // Extract authentication data from response
        const { accessToken, token, username, email, enable, enabled } = response.data;

        // Support both 'accessToken' and 'token' field names
        const finalToken = accessToken || token;

        // Support both 'enable' and 'enabled' field names
        const finalEnabled = enable !== undefined ? enable : enabled;

        // Log extracted values for debugging
        console.log('Extracted values:', {
            finalToken: finalToken ? 'present' : 'missing',
            username: username || 'missing',
            email: email || 'missing',
            enabled: finalEnabled
        });

        // Validate response data
        if (!finalToken) {
            throw new Error('Invalid response from server: missing token');
        }

        if (!username) {
            throw new Error('Invalid response from server: missing username');
        }

        if (!email) {
            throw new Error('Invalid response from server: missing email');
        }

        if (finalEnabled === undefined) {
            throw new Error('Invalid response from server: missing enabled status');
        }

        // Check if user is enabled
        if (finalEnabled !== true) {
            throw new Error('Your account is disabled. Please contact support or verify your email.');
        }

        // Save authentication data to localStorage
        saveAuthData({
            accessToken: finalToken,
            username,
            email,
            enable: finalEnabled
        });

        console.log('Authentication data saved successfully');

        return response.data;
    },

    /**
     * Logout user
     * Clears all authentication data and redirects to login
     */
    logout: async () => {
        try {
            // Optional: Call backend logout endpoint if available
            // This is useful for token blacklisting or session management
            try {
                await axiosClient.post('/api/auth/logout');
            } catch (error) {
                // Continue with logout even if backend call fails
                console.error('Backend logout failed:', error);
            }

            // Clear all authentication data
            clearAuthData();

            // Redirect to login page
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
            // Force clear and redirect even if there's an error
            clearAuthData();
            window.location.href = '/login';
        }
    },

    /**
     * Get current user from localStorage
     * @returns {Object|null} User data or null
     */
    getCurrentUser: () => {
        return getUserData();
    },

    /**
     * Check if user is authenticated
     * Validates token, username, email, and enable status
     * @returns {boolean} True if user is authenticated
     */
    isAuthenticated: () => {
        return isAuthenticated();
    },

    /**
     * Verify email with token
     * @param {string} token - Email verification token
     * @returns {Promise<Object>} Verification response
     */
    verifyEmail: async (token) => {
        const response = await axiosClient.get(`/api/auth/verify?token=${token}`);
        return response.data;
    },

    /**
     * Request password reset
     * @param {string} email - User's email address
     * @returns {Promise<Object>} Response message
     */
    forgotPassword: async (email) => {
        const response = await axiosClient.post('/api/auth/forgot-password', { email });
        return response.data;
    },

    /**
     * Reset password with token
     * @param {string} token - Password reset token
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Response message
     */
    resetPassword: async (token, newPassword) => {
        const response = await axiosClient.post(`/api/auth/reset-password?token=${token}`, { newPassword });
        return response.data;
    },

    /**
     * Validate token by making a test request to backend
     * @returns {Promise<boolean>} True if token is valid
     */
    validateToken: async () => {
        try {
            // Call a protected endpoint to validate token
            await axiosClient.get('/api/auth/validate');
            return true;
        } catch (error) {
            return false;
        }
    }
};

export default authService;
