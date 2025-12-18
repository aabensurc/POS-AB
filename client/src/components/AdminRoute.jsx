import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Cargando...</div>;

    if (!user || user.role !== 'admin') {
        return <Navigate to="/" replace />; // Redirect to dashboard or appropriate page
    }

    return children;
};

export default AdminRoute;
