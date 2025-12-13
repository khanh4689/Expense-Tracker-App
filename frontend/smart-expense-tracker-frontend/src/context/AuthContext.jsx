import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../api/authService';
import { getUserData, isAuthenticated } from '../utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on first render
    useEffect(() => {
        const currentUser = getUserData();

        // Validate that user is authenticated and enabled
        if (currentUser && isAuthenticated()) {
            setUser(currentUser);
        } else {
            setUser(null);
        }

        setLoading(false);
    }, []);

    /**
     * Login user
     * @param {Object} credentials - Login credentials
     * @returns {Promise<Object>} Login response
     */
    const login = async (credentials) => {
        const response = await authService.login(credentials);

        // Get updated user data from localStorage
        const userData = getUserData();
        setUser(userData);

        return response;
    };

    /**
     * Register new user
     * @param {Object} userData - Registration data
     * @returns {Promise<Object>} Registration response
     */
    const register = async (userData) => {
        const response = await authService.register(userData);

        // Get updated user data from localStorage
        const currentUser = getUserData();
        setUser(currentUser);

        return response;
    };

    /**
     * Logout user
     * Clears authentication data and redirects to login
     */
    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    /**
     * Request password reset
     * @param {string} email - User's email
     * @returns {Promise<Object>} Response
     */
    const forgotPassword = async (email) => {
        return await authService.forgotPassword(email);
    };

    /**
     * Reset password with token
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Response
     */
    const resetPassword = async (token, newPassword) => {
        return await authService.resetPassword(token, newPassword);
    };

    const value = {
        user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        isAuthenticated: isAuthenticated(),
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
