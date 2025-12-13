/**
 * Authentication Utility Functions
 * Manages user authentication data in localStorage
 * 
 * Required authentication data:
 * - accessToken: JWT token for API requests
 * - username: User's username
 * - email: User's email address
 * - enable: User's enabled status (must be true)
 */

const AUTH_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    USERNAME: 'username',
    EMAIL: 'email',
    ENABLE: 'enable'
};

/**
 * Save user authentication data to localStorage
 * @param {Object} authData - Authentication data from login response
 * @param {string} authData.accessToken - JWT access token
 * @param {string} authData.username - User's username
 * @param {string} authData.email - User's email
 * @param {boolean} authData.enable - User's enabled status
 */
export const saveAuthData = (authData) => {
    try {
        if (!authData.accessToken || !authData.username || !authData.email || authData.enable === undefined) {
            throw new Error('Invalid authentication data: missing required fields');
        }

        localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, authData.accessToken);
        localStorage.setItem(AUTH_KEYS.USERNAME, authData.username);
        localStorage.setItem(AUTH_KEYS.EMAIL, authData.email);
        localStorage.setItem(AUTH_KEYS.ENABLE, authData.enable.toString());

        console.log('Authentication data saved successfully');
    } catch (error) {
        console.error('Error saving auth data:', error);
        throw new Error('Failed to save authentication data');
    }
};

/**
 * Get access token from localStorage
 * @returns {string|null} Access token or null if not found
 */
export const getAccessToken = () => {
    return localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
};

/**
 * Get username from localStorage
 * @returns {string|null} Username or null if not found
 */
export const getUsername = () => {
    return localStorage.getItem(AUTH_KEYS.USERNAME);
};

/**
 * Get email from localStorage
 * @returns {string|null} Email or null if not found
 */
export const getEmail = () => {
    return localStorage.getItem(AUTH_KEYS.EMAIL);
};

/**
 * Get user data from localStorage
 * @returns {Object|null} User data object or null if incomplete
 */
export const getUserData = () => {
    const username = localStorage.getItem(AUTH_KEYS.USERNAME);
    const email = localStorage.getItem(AUTH_KEYS.EMAIL);
    const enable = localStorage.getItem(AUTH_KEYS.ENABLE);

    if (!username || !email || enable === null) {
        return null;
    }

    return {
        username,
        email,
        enable: enable === 'true'
    };
};

/**
 * Check if user is enabled
 * @returns {boolean} True if user is enabled
 */
export const isUserEnabled = () => {
    const enable = localStorage.getItem(AUTH_KEYS.ENABLE);
    return enable === 'true';
};

/**
 * Check if user is authenticated and enabled
 * All requirements must be met:
 * 1. Access token exists
 * 2. Username exists
 * 3. Email exists
 * 4. Enable status is true
 * 
 * @returns {boolean} True if user has valid auth data
 */
export const isAuthenticated = () => {
    const token = getAccessToken();
    const userData = getUserData();

    // User must have token, user data, and be enabled
    const authenticated = !!(token && userData && userData.enable === true);

    if (!authenticated) {
        console.log('Authentication check failed:', {
            hasToken: !!token,
            hasUserData: !!userData,
            isEnabled: userData?.enable
        });
    }

    return authenticated;
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
    localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_KEYS.USERNAME);
    localStorage.removeItem(AUTH_KEYS.EMAIL);
    localStorage.removeItem(AUTH_KEYS.ENABLE);

    // Also clear legacy tokens if they exist
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    console.log('Authentication data cleared');
};

/**
 * Validate that all required auth data exists
 * @returns {Object} Validation result with status and missing fields
 */
export const validateAuthData = () => {
    const token = getAccessToken();
    const username = getUsername();
    const email = getEmail();
    const enable = localStorage.getItem(AUTH_KEYS.ENABLE);

    const missing = [];
    if (!token) missing.push('accessToken');
    if (!username) missing.push('username');
    if (!email) missing.push('email');
    if (enable === null) missing.push('enable');

    return {
        isValid: missing.length === 0 && enable === 'true',
        missing,
        isEnabled: enable === 'true'
    };
};

export default {
    saveAuthData,
    getAccessToken,
    getUsername,
    getEmail,
    getUserData,
    isUserEnabled,
    isAuthenticated,
    clearAuthData,
    validateAuthData
};
