import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAuthenticated, getUserData, getAccessToken } from '../utils/auth';

/**
 * ProtectedRoute Component
 * Validates authentication before allowing access to protected pages
 * 
 * Requirements checked:
 * 1. Access token exists
 * 2. Username and email exist in localStorage
 * 3. User is enabled (enable === true)
 */
const ProtectedRoute = () => {
    const { loading } = useAuth();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Check if user is authenticated with all required data
    const authenticated = isAuthenticated();
    const token = getAccessToken();
    const userData = getUserData();

    // Debug logging (can be removed in production)
    if (!authenticated) {
        console.log('ProtectedRoute: Authentication check failed');
        console.log('- Token exists:', !!token);
        console.log('- User data exists:', !!userData);
        console.log('- User enabled:', userData?.enable);
    }

    // Additional check: ensure user is enabled
    if (userData && userData.enable !== true) {
        console.error('ProtectedRoute: User account is disabled');
        return <Navigate to="/login" replace />;
    }

    // Redirect to login if not authenticated
    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    // User is authenticated and enabled, render protected content
    return <Outlet />;
};

export default ProtectedRoute;
