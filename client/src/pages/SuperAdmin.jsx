import React, { useState, useEffect } from 'react';
import { Building, Users, Activity, Power, Plus, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import api from '../services/api';

const SuperAdmin = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', ruc: '', address: '', plan: 'free',
        adminName: '', adminUser: '', adminPass: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchCompanies = async () => {
        try {
            const { data } = await api.get('/companies');
            setCompanies(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            await api.post('/companies', formData);
            setMessage({ type: 'success', text: 'Empresa creada exitosamente!' });
            setShowModal(false);
            fetchCompanies();
            setFormData({ name: '', ruc: '', address: '', plan: 'free', adminName: '', adminUser: '', adminPass: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Error al crear empresa' });
        }
    };

    const toggleStatus = async (id) => {
        if (!confirm('¿Cambiar estado de la empresa?')) return;
        try {
            await api.put(`/companies/${id}/status`);
            fetchCompanies();
        } catch (error) {
            alert('Error al cambiar estado');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-slate-900 text-white px-8 py-4 shadow-lg flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <Shield className="w-8 h-8 text-cyan-400" />
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Super Admin Dashboard</h1>
                        <p className="text-xs text-slate-400">Plataforma SaaS Management</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={() => window.location.href='/login'} className="text-slate-300 hover:text-white text-sm font-medium">Salir</button>
                </div>
            </header>

            <main className="p-8 max-w-7xl mx-auto">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-lg mr-4"><Building className="w-8 h-8"/></div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Empresas Activas</p>
                            <h3 className="text-2xl font-bold text-slate-800">{companies.filter(c => c.isActive).length}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
                        <div className="p-4 bg-purple-50 text-purple-600 rounded-lg mr-4"><Users className="w-8 h-8"/></div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Usuarios</p>
                            <h3 className="text-2xl font-bold text-slate-800">{companies.reduce((acc, c) => acc + c.usersCount, 0)}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
                        <div className="p-4 bg-green-50 text-green-600 rounded-lg mr-4"><Activity className="w-8 h-8"/></div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Ingresos Totales (SaaS)</p>
                            <h3 className="text-2xl font-bold text-slate-800">S/. {companies.reduce((acc, c) => acc + parseFloat(c.totalRevenue || 0), 0).toFixed(2)}</h3>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Empresas Registradas</h2>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold shadow-md flex items-center transition"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Nueva Empresa
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Empresa</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Plan</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Usuarios</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {companies.map(company => (
                                <tr key={company.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{company.name}</div>
                                        <div className="text-xs text-slate-500">RUC: {company.ruc}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${company.plan === 'pro' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {company.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{company.usersCount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full flex w-fit items-center ${company.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {company.isActive ? <CheckCircle className="w-3 h-3 mr-1"/> : <AlertCircle className="w-3 h-3 mr-1"/>}
                                            {company.isActive ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => toggleStatus(company.id)}
                                            className="text-slate-400 hover:text-cyan-600 transition"
                                            title="Cambiar Estado"
                                        >
                                            <Power className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Nueva Empresa</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Comercial</label>
                                    <input required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" 
                                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">RUC</label>
                                    <input required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" 
                                        value={formData.ruc} onChange={e => setFormData({...formData, ruc: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Dirección</label>
                                <input required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" 
                                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Plan</label>
                                <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                                    value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}>
                                    <option value="free">Free Starter</option>
                                    <option value="pro">Professional</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>
                            
                            <hr className="my-4 border-slate-100" />
                            <p className="text-sm font-bold text-cyan-700 uppercase tracking-wider mb-2">Usuario Administrador Inicial</p>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Nombre Admin</label>
                                <input required className="w-full px-4 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500 outline-none" 
                                    value={formData.adminName} onChange={e => setFormData({...formData, adminName: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Usuario (Login)</label>
                                    <input required className="w-full px-4 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500 outline-none" 
                                        value={formData.adminUser} onChange={e => setFormData({...formData, adminUser: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Contraseña</label>
                                    <input required type="password" className="w-full px-4 py-2 border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-500 outline-none" 
                                        value={formData.adminPass} onChange={e => setFormData({...formData, adminPass: e.target.value})} />
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 bg-cyan-600 text-white rounded-xl font-bold shadow-lg hover:bg-cyan-500">Crear Empresa</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdmin;
