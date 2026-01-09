import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Save, Camera, AlertCircle, CheckCircle } from 'lucide-react';

const Profile = () => {
    const { user, refreshUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        photoUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                username: user.username || '',
                password: '',
                photoUrl: user.photoUrl || ''
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
             // We update the user ID from the context
             // Note: Users can only edit themselves here.
             const payload = { ...formData };
             if (!payload.password) delete payload.password;
             
             await api.put(`/users/${user.id}`, payload);
             
             // Critical: Refresh context
             await refreshUser();
             
             setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
        } catch (error) {
             setMessage({ type: 'error', text: 'Error al actualizar: ' + (error.response?.data?.error || error.message) });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 overflow-auto p-4 md:p-8">
            <div className="max-w-2xl mx-auto w-full">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Mi Perfil</h2>
                    <p className="text-gray-500">Administra tu información personal y cuenta</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative group">
                                <div className="w-32 h-32 bg-gray-100 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                    {formData.photoUrl ? (
                                        <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                            <User className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-cyan-600 text-white p-2 rounded-full cursor-pointer hover:bg-cyan-500 shadow-md transition-transform transform hover:scale-105">
                                    <Camera className="w-5 h-5" />
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => setFormData({...formData, photoUrl: reader.result});
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            <p className="mt-2 text-sm text-gray-400">Haz clic en la cámara para cambiar tu foto</p>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                                <input 
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none transition"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Usuario (Login)</label>
                                <input 
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none transition"
                                    required
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                                <input 
                                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed"
                                    disabled
                                    value={user?.role === 'admin' ? 'Administrador' : 'Vendedor'}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nueva Contraseña <span className="text-gray-400 font-normal">(Opcional)</span>
                                </label>
                                <input 
                                    type="password"
                                    placeholder="Dejar en blanco para mantener la actual"
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none transition"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className={`flex items-center px-6 py-3 rounded-xl text-white font-bold shadow-lg transition transform active:scale-95 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-200'}`}
                            >
                                {loading ? 'Guardando...' : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" />
                                        Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
