import React, { useState, useEffect } from 'react';
import { User, Edit, Trash2, Plus, X, Search, Shield, ShieldAlert } from 'lucide-react';
import api from '../services/api';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        role: 'seller',
        photoUrl: ''
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                username: user.username,
                password: '', // Don't show password
                role: user.role,
                photoUrl: user.photoUrl || ''
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                username: '',
                password: '',
                role: 'seller',
                photoUrl: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                // Update
                const payload = { ...formData };
                if (!payload.password) delete payload.password; // Don't update if empty
                await api.put(`/users/${editingUser.id}`, payload);
                alert("Usuario actualizado correctamente");
            } else {
                // Create
                await api.post('/users', formData);
                alert("Usuario creado correctamente");
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            alert("Error al guardar: " + (error.response?.data?.error || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (error) {
            alert("Error al eliminar: " + (error.response?.data?.error || error.message));
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center z-10 sticky top-0">
                <div className="flex items-center space-x-4">
                    <User className="w-6 h-6 text-cyan-600" />
                    <h2 className="text-xl font-bold text-gray-800">Gestión de Usuarios</h2>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition flex items-center"
                >
                    <Plus className="w-5 h-5 mr-2" /> Nuevo Usuario
                </button>
            </header>

            {/* List */}
            <div className="flex-1 overflow-auto p-8">
                {/* Search */}
                <div className="mb-6 relative max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="w-5 h-5 text-gray-400" />
                    </span>
                    <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none shadow-sm"
                        placeholder="Buscar usuario..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center py-10 text-gray-500">Cargando usuarios...</div>
                    ) : (
                        filteredUsers.map(user => (
                            <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start space-x-4 hover:shadow-md transition group">
                                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {user.photoUrl ? (
                                        <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-800 truncate pr-2">{user.name}</h3>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">@{user.username}</p>
                                    
                                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition duration-200">
                                        <button 
                                            onClick={() => openModal(user)}
                                            className="px-3 py-1.5 text-xs font-bold bg-gray-100 text-gray-600 rounded hover:bg-cyan-50 hover:text-cyan-700 transition"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(user.id)}
                                            className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                <input 
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario (Login)</label>
                                <input 
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                                    required
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {editingUser ? 'Contraseña (Dejar en blanco para no cambiar)' : 'Contraseña'}
                                </label>
                                <input 
                                    type="password"
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                                    {...(!editingUser ? { required: true } : {})}
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                <select 
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="seller">Vendedor</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Foto de Perfil</label>
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden border">
                                        {formData.photoUrl ? (
                                            <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-8 h-8 text-gray-400 m-4" />
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData({...formData, photoUrl: reader.result});
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            
                            {/* Hidden URL Input for manual override if needed, or remove it */}

                            <div className="pt-4 flex space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 font-medium">Cancelar</button>
                                <button type="submit" className="flex-1 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 font-bold shadow-lg">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
