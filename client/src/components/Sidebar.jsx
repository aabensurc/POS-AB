import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingCart, Archive, Users, DollarSign, BookOpen, Clock, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const [branding, setBranding] = React.useState({ name: 'SMART POS', logo: '/logo.png' });
    
    React.useEffect(() => {
        const fetchBranding = async () => {
             try {
                 const { data } = await import('../services/api').then(m => m.default.get('/settings'));
                 if (data) {
                     setBranding({
                         name: data.companyName || 'SMART POS',
                         logo: data.logoUrl || '/logo.png'
                     });
                 }
             } catch (e) { console.error("Error fetching branding", e); }
        };
        fetchBranding();
    }, []);
    
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
                    <img src={branding.logo} alt="Logo" className="w-8 h-8 rounded-lg mr-2 object-cover" />
                    <h1 className="text-xl font-bold tracking-wider text-cyan-400 text-center leading-tight">
                        {branding.name.length > 15 ? (
                            <>
                             {branding.name.substring(0, 15)}...
                            </>
                        ) : branding.name}
                    </h1>
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

            {/* User section removed - moved to Header */}
        </aside>
    );
};

export default Sidebar;
