import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingCart, Archive, Users, DollarSign, BookOpen, Clock, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    
    const menuItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/pos', label: 'Punto de Venta', icon: ShoppingCart },
        { path: '/inventory', label: 'Inventario', icon: Archive },
        { path: '/clients', label: 'Clientes', icon: Users },
        { path: '/cash', label: 'Caja', icon: DollarSign },
    ];


    const adminItems = [
        { path: '/categories', label: 'Categorías', icon: LayoutDashboard },
        { path: '/sales-history', label: 'Historial Ventas', icon: Clock },
        { path: '/purchases', label: 'Compras', icon: BookOpen },
        { path: '/users', label: 'Usuarios', icon: Users },
        { path: '/settings', label: 'Configuración', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-lg z-10 h-full fixed left-0 top-0">
            <div className="p-6 flex flex-col justify-center items-center border-b border-slate-800">
                <div className="flex items-center mb-2">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg mr-2 object-cover" />
                    <h1 className="text-2xl font-bold tracking-wider text-cyan-400">SMART <span className="text-white">POS</span></h1>
                </div>
                <p className="text-xs text-slate-400">Sistema de Punto de Venta</p>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors group ${
                            isActive ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.label}
                    </NavLink>
                ))}

                {user?.role === 'admin' && adminItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors group ${
                            isActive ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                         <item.icon className="w-5 h-5 mr-3" />
                         {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                        {user?.photoUrl ? (
                            <img src={user.photoUrl} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            user?.name?.charAt(0).toUpperCase() || 'U'
                        )}
                    </div>
                    <div className="ml-3 truncate">
                        <p className="text-sm font-medium text-white">{user?.name}</p>
                        <p className="text-xs text-slate-400">{user?.role === 'admin' ? 'Administrador' : 'Vendedor'}</p>
                    </div>
                    <button onClick={async () => {
                        try {
                            const { data } = await import('../services/api').then(m => m.default.get('/cash/status'));
                            if (data.status === 'open') {
                                if (window.confirm("Tienes una caja abierta. Se recomienda cerrarla antes de salir.\n\n¿Deseas ir a la sección de Caja ahora?")) {
                                    // User wants to go to cash
                                    window.location.href = '/cash'; // Or use navigate if we had hook, but Sidebar doesn't have it imported top level usually inside loop
                                    return;
                                }
                                // If they say Cancel (No), they want to logout anyway
                            }
                        } catch (e) {
                            console.error("Error verifying cash on logout", e);
                        }
                        logout();
                    }} className="ml-auto text-slate-500 hover:text-red-400" title="Cerrar Sesión">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
