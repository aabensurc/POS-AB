import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminRoute from './components/AdminRoute';

import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Categories from './pages/Categories';
import Clients from './pages/Clients';
import POS from './pages/POS';
import SalesHistory from './pages/SalesHistory';
import Cash from './pages/Cash';
import Purchases from './pages/Purchases';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import SuperAdmin from './pages/SuperAdmin';
import SuperAdminRoute from './components/SuperAdminRoute';
import api from './services/api'; // Import API for checks if needed, but localStorage is faster for unload

// Rutas protegidas
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div>Cargando...</div>; 
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
};

// Hook for browser close warning
const usePageUnloadWarning = () => {
    useEffect(() => {
        const handleBeforeUnload = (e) => {
             // We can use a flag in localStorage set by Cash page when opening/closing
             // For now, let's just warn if they are logged in, or better yet, verify via a flag.
             // Since making an API call here is async and often blocked, we rely on state.
             // Assuming we implement a 'cash_status' in localStorage later.
             // For now, simpler approach: Always prompt if we think they might lose data (common in POS).
             // But user specifically asked about Cash.
             
             // Best Practice: Check a persistent flag.
             const isCashOpen = localStorage.getItem('cash_status') === 'open';
             if (isCashOpen) {
                 e.preventDefault();
                 e.returnValue = 'Tienes una caja abierta. ¿Seguro que quieres salir?';
                 return 'Tienes una caja abierta. ¿Seguro que quieres salir?';
             }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);
};

function App() {
  usePageUnloadWarning();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="pos" element={<POS />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="clients" element={<Clients />} />
        <Route path="cash" element={<Cash />} />
        <Route path="profile" element={<Profile />} />
      
      {/* Super Admin Route */}
      <Route path="/superadmin" element={
        <SuperAdminRoute>
          <SuperAdmin />
        </SuperAdminRoute>
      } />

        
        {/* Admin Only Routes */}
        <Route path="users" element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="settings" element={<AdminRoute><Settings /></AdminRoute>} />
        <Route path="purchases" element={<AdminRoute><Purchases /></AdminRoute>} />
        <Route path="sales-history" element={<AdminRoute><SalesHistory /></AdminRoute>} />
        <Route path="categories" element={<AdminRoute><Categories /></AdminRoute>} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
