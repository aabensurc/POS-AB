import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, ChevronDown, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Header = () => {
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = async () => {
        try {
            // Check Cash Status with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout

            const { data } = await api.get('/cash/status', { signal: controller.signal });
            clearTimeout(timeoutId);

            if (data && data.status === 'open') {
                if (window.confirm("Tienes una caja abierta. Se recomienda cerrarla antes de salir.\n\n¿Deseas ir a la sección de Caja ahora?")) {
                    window.location.href = '/cash';
                    return; // Stop logout
                }
            }
        } catch (e) {
            console.error("Logout check warning:", e);
            // Proceed to logout even if check fails (timeout or network error)
        }
        
        logout();
    };

    return (
        <header className="bg-white shadow-sm h-16 flex items-center justify-end px-8 z-20 relative">
            
            {/* User Profile Dropdown */}
            <div className="relative">
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-3 focus:outline-none hover:bg-slate-50 p-2 rounded-lg transition-colors"
                >
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{user?.role === 'admin' ? 'Administrador' : 'Vendedor'}</p>
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold overflow-hidden border-2 border-slate-100">
                         {user?.photoUrl ? (
                            <img src={user.photoUrl} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            user?.name?.charAt(0).toUpperCase() || 'U'
                        )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-2 border-b border-slate-100 md:hidden">
                            <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
                            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                        </div>
                        
                        <Link 
                            to="/profile" 
                            className="flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-cyan-600"
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            <UserIcon className="w-4 h-4 mr-2" />
                            Mi Perfil
                        </Link>
                        
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>

            {/* Click outside closer */}
            {isDropdownOpen && (
                <div 
                    className="fixed inset-0 z-[-1]" 
                    onClick={() => setIsDropdownOpen(false)}
                ></div>
            )}
        </header>
    );
};

export default Header;
