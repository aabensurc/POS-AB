import React from 'react';
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

// Rutas protegidas
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div>Cargando...</div>; // O un spinner bonito
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
};

function App() {
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
