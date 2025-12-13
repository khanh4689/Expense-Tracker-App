import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

/**
 * LogoutButton Component
 * Provides logout functionality with confirmation dialog
 */
const LogoutButton = ({ className = '' }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            try {
                await logout();
                // Navigation will be handled by authService.logout()
            } catch (error) {
                console.error('Logout error:', error);
                // Force navigation to login even if logout fails
                navigate('/login', { replace: true });
            }
        }
    };

    return (
        <button
            onClick={handleLogout}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium ${className}`}
            title="Logout"
        >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
        </button>
    );
};

export default LogoutButton;

