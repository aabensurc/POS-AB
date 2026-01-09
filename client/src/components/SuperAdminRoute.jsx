import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SuperAdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Cargando...</div>;
    
    // Check if user is authenticated AND is Super Admin
    if (!user || user.role !== 'superadmin') {
        return <Navigate to="/" replace />;
    }
    
    return children;
};

export default SuperAdminRoute;
