import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const success = await login(formData.username, formData.password);
        if (success) {
            navigate('/');
        } else {
            setError('Usuario o contraseña incorrectos');
        }
    };

    return (
        <div className="bg-gray-100 h-screen flex items-center justify-center font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-wider text-cyan-600 mb-2">POS <span className="text-slate-800">PERÚ</span></h1>
                    <p className="text-gray-500 text-sm">Ingresa tus credenciales para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none"
                            placeholder="Ej: admin"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none"
                            placeholder="••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg fade-in">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-200 transition-all transform active:scale-95"
                    >
                        Iniciar Sesión
                    </button>
                </form>

                <div className="mt-8 text-center bg-blue-50 p-4 rounded-xl text-xs text-blue-700">
                    <p className="font-bold mb-1">Cuentas Demo:</p>
                    <p>Admin: <span className="font-mono bg-white px-1 rounded">admin</span> / <span className="font-mono bg-white px-1 rounded">123</span></p>
                    <p className="mt-1">Vendedor: <span className="font-mono bg-white px-1 rounded">vendedor</span> / <span className="font-mono bg-white px-1 rounded">123</span></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
