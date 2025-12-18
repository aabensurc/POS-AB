import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../services/api';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        docType: 'DNI',
        docNumber: '',
        address: '',
        email: ''
    });

    const fetchClients = async () => {
        try {
            const { data } = await api.get('/clients');
            setClients(data);
        } catch (error) {
            console.error("Error loading clients", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const openCreateModal = () => {
        setEditingClient(null);
        setFormData({ name: '', docType: 'DNI', docNumber: '', address: '', email: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (client) => {
        setEditingClient(client);
        setFormData({
            name: client.name,
            docType: client.docType || 'DNI',
            docNumber: client.docNumber || '',
            address: client.address || '',
            email: client.email || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingClient) {
                await api.put(`/clients/${editingClient.id}`, formData);
            } else {
                await api.post('/clients', formData);
            }
            fetchClients();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving client", error);
            alert("Error al guardar cliente");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar cliente?')) return;
        try {
            await api.delete(`/clients/${id}`);
            fetchClients();
        } catch (error) {
            console.error("Error deleting client", error);
        }
    };

    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.docNumber && c.docNumber.includes(searchTerm))
    );

    return (
        <div className="h-full flex flex-col">
            <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center z-10 sticky top-0">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Users className="w-6 h-6 mr-2 text-cyan-600" />
                    Gestión de Clientes
                </h2>
                <div className="flex space-x-4">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="w-5 h-5 text-gray-400" />
                        </span>
                        <input 
                            type="text" 
                            className="pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none text-sm w-64 transition-all focus:w-80"
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={openCreateModal}
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-lg transition flex items-center"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Nuevo Cliente
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                            <tr>
                                <th className="p-5">Nombre / Razón Social</th>
                                <th className="p-5">Documento</th>
                                <th className="p-5">Dirección</th>
                                <th className="p-5">Email</th>
                                <th className="p-5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {loading ? (
                                <tr><td colSpan="5" className="p-5 text-center">Cargando...</td></tr>
                            ) : filteredClients.map(client => (
                                <tr key={client.id} className="hover:bg-gray-50 transition">
                                    <td className="p-5 font-semibold text-gray-800">{client.name}</td>
                                    <td className="p-5">
                                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold mr-2">{client.docType}</span>
                                        {client.docNumber}
                                    </td>
                                    <td className="p-5 text-gray-500">{client.address || '-'}</td>
                                    <td className="p-5 text-gray-500">{client.email || '-'}</td>
                                    <td className="p-5 text-right space-x-2">
                                        <button onClick={() => openEditModal(client)} className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(client.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                        <h3 className="text-xl font-bold text-gray-800 mb-6">{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo / Razón Social</label>
                                <input 
                                    type="text" required
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Doc.</label>
                                    <select 
                                        className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                                        value={formData.docType}
                                        onChange={e => setFormData({...formData, docType: e.target.value})}
                                    >
                                        <option value="DNI">DNI</option>
                                        <option value="RUC">RUC</option>
                                        <option value="CE">C. Extranjería</option>
                                        <option value="PASSPORT">Pasaporte</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                                    <input 
                                        type="text" required
                                        className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                                        value={formData.docNumber}
                                        onChange={e => setFormData({...formData, docNumber: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                                    value={formData.address}
                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input 
                                    type="email" 
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">Cancelar</button>
                                <button type="submit" className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-bold hover:bg-cyan-500">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;
