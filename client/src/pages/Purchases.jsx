import React, { useState, useEffect } from 'react';
import { Search, Package, Users, FileText, Plus, Trash2, X, AlertCircle } from 'lucide-react';
import api from '../services/api';

const Purchases = () => {
    const [activeTab, setActiveTab] = useState('purchases'); // purchases, providers, payable
    const [viewMode, setViewMode] = useState('list'); // list, new
    const [loading, setLoading] = useState(false);

    // Data
    const [purchases, setPurchases] = useState([]);
    const [providers, setProviders] = useState([]);
    const [searchPurchase, setSearchPurchase] = useState('');
    
    // New Purchase Form
    const [newPurchase, setNewPurchase] = useState({
        providerId: '',
        docType: 'Factura',
        docNumber: '',
        status: 'paid', // paid, pending
        items: []
    });
    const [productSearch, setProductSearch] = useState('');
    const [productResults, setProductResults] = useState([]);

    // Modals
    const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState(null);

    // Initial Fetch
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [purchasesRes, providersRes] = await Promise.all([
                api.get('/purchases'),
                api.get('/providers')
            ]);
            setPurchases(purchasesRes.data);
            setProviders(providersRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    // --- PROVIDER ACTIONS ---
    const handleSaveProvider = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            if (editingProvider) {
                await api.put(`/providers/${editingProvider.id}`, data);
            } else {
                await api.post('/providers', data);
            }
            fetchInitialData();
            setIsProviderModalOpen(false);
            setEditingProvider(null);
        } catch (error) {
            alert("Error al guardar proveedor");
        }
    };

    const handleDeleteProvider = async (id) => {
        if (!confirm("¿Eliminar proveedor?")) return;
        try {
            await api.delete(`/providers/${id}`);
            fetchInitialData();
        } catch (error) {
            alert("Error al eliminar");
        }
    };

    // --- NEW PURCHASE ACTIONS ---
    const searchProducts = async (term) => {
        setProductSearch(term);
        if (term.length < 2) {
            setProductResults([]);
            return;
        }
        try {
            const { data } = await api.get(`/products?search=${term}`);
            setProductResults(data);
        } catch (error) {
            console.error(error);
        }
    };

    const addToCart = (product) => {
        const existing = newPurchase.items.find(i => i.productId === product.id);
        if (existing) {
            alert("Producto ya está en la lista");
            return;
        }
        setNewPurchase({
            ...newPurchase,
            items: [...newPurchase.items, { 
                productId: product.id, 
                name: product.name, 
                quantity: 1, 
                cost: product.cost || 0 
            }]
        });
        setProductSearch('');
        setProductResults([]);
    };

    const updateItem = (productId, field, value) => {
        const newItems = newPurchase.items.map(item => {
            if (item.productId === productId) {
                return { ...item, [field]: parseFloat(value) || 0 };
            }
            return item;
        });
        setNewPurchase({ ...newPurchase, items: newItems });
    };

    const removeItem = (productId) => {
        setNewPurchase({
            ...newPurchase,
            items: newPurchase.items.filter(i => i.productId !== productId)
        });
    };

    const calculateTotal = () => {
        return newPurchase.items.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
    };

    const submitPurchase = async () => {
        if (!newPurchase.providerId) return alert("Seleccione un proveedor");
        if (newPurchase.items.length === 0) return alert("Agregue productos");

        try {
            await api.post('/purchases', {
                ...newPurchase,
                total: calculateTotal()
            });
            alert("Compra registrada exitosamente");
            fetchInitialData();
            setViewMode('list');
            setNewPurchase({ providerId: '', docType: 'Factura', docNumber: '', status: 'paid', items: [] });
        } catch (error) {
            alert("Error al registrar compra: " + error.response?.data?.error || error.message);
        }
    };

    // --- RENDER HELPERS ---
    const filteredPurchases = purchases.filter(p => 
        p.Provider?.name.toLowerCase().includes(searchPurchase.toLowerCase()) || 
        p.id.toString().includes(searchPurchase)
    );

    const payablePurchases = purchases.filter(p => p.status === 'pending');

    return (
        <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
            {/* Header */}
            <header className="bg-white shadow-sm flex flex-col z-10 sticky top-0">
                <div className="h-16 flex items-center justify-between px-8 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <Package className="w-6 h-6 mr-2 text-cyan-600" />
                        Gestión de Compras
                    </h2>
                    {viewMode === 'list' && (
                        <button 
                            onClick={() => setViewMode('new')}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center"
                        >
                            <Plus className="w-5 h-5 mr-2" /> Nueva Compra
                        </button>
                    )}
                </div>

                <div className="px-8 flex space-x-6 text-sm font-medium text-gray-500 overflow-x-auto">
                    {[
                        { id: 'purchases', label: 'Historial', icon: FileText },
                        { id: 'providers', label: 'Proveedores', icon: Users },
                        { id: 'payable', label: 'Cuentas por Pagar', icon: AlertCircle },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setViewMode('list'); }}
                            className={`py-3 flex items-center border-b-2 transition ${
                                activeTab === tab.id ? 'border-cyan-600 text-cyan-600' : 'border-transparent hover:text-cyan-600'
                            }`}
                        >
                            <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto p-8">
                
                {/* VIEW: NEW PURCHASE */}
                {viewMode === 'new' && (
                    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
                         <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-800">Registrar Ingreso de Mercadería</h3>
                            <button onClick={() => setViewMode('list')} className="text-gray-500 hover:text-gray-700">Cancelar</button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Form Header */}
                            <div className="lg:col-span-1 space-y-4">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                                        <div className="flex space-x-2">
                                            <select 
                                                className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none focus:border-cyan-500"
                                                value={newPurchase.providerId}
                                                onChange={e => setNewPurchase({...newPurchase, providerId: e.target.value})}
                                            >
                                                <option value="">Seleccione...</option>
                                                {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            <button onClick={() => setIsProviderModalOpen(true)} className="px-3 py-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200">+</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Documento</label>
                                        <select 
                                            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none focus:border-cyan-500"
                                            value={newPurchase.docType}
                                            onChange={e => setNewPurchase({...newPurchase, docType: e.target.value})}
                                        >
                                            <option value="Factura">Factura</option>
                                            <option value="Boleta">Boleta</option>
                                            <option value="Guia">Guía de Remisión</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado Pago</label>
                                        <select 
                                            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none focus:border-cyan-500"
                                            value={newPurchase.status}
                                            onChange={e => setNewPurchase({...newPurchase, status: e.target.value})}
                                        >
                                            <option value="paid">Pagado (Contado)</option>
                                            <option value="pending">Pendiente (Crédito)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="bg-cyan-600 text-white p-6 rounded-xl shadow-lg">
                                    <p className="text-sm opacity-80 mb-1">Total Compra</p>
                                    <p className="text-3xl font-bold">S/ {calculateTotal().toFixed(2)}</p>
                                    <button 
                                        onClick={submitPurchase}
                                        className="mt-6 w-full py-3 bg-white text-cyan-700 font-bold rounded-lg shadow hover:bg-gray-50 transition"
                                    >
                                        Registrar Ingreso
                                    </button>
                                </div>
                            </div>

                            {/* Products */}
                            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[600px]">
                                <div className="mb-4 relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Producto</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                        <input 
                                            type="text" 
                                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                                            placeholder="Buscar por nombre o código..." 
                                            value={productSearch}
                                            onChange={e => searchProducts(e.target.value)}
                                        />
                                    </div>
                                    {productResults.length > 0 && (
                                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                                            {productResults.map(p => (
                                                <div 
                                                    key={p.id} 
                                                    onClick={() => addToCart(p)}
                                                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 flex justify-between"
                                                >
                                                    <span className="font-medium">{p.name}</span>
                                                    <span className="text-gray-500">Stock: {p.stock}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 overflow-auto border rounded-xl border-gray-100">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2">Producto</th>
                                                <th className="px-4 py-2 w-24">Cant.</th>
                                                <th className="px-4 py-2 w-32">Costo U.</th>
                                                <th className="px-4 py-2 text-right">Subtotal</th>
                                                <th className="px-4 py-2 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm">
                                            {newPurchase.items.length === 0 ? (
                                                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Agrega productos buscando arriba</td></tr>
                                            ) : (
                                                newPurchase.items.map(item => (
                                                    <tr key={item.productId}>
                                                        <td className="px-4 py-2 font-medium">{item.name}</td>
                                                        <td className="px-4 py-2">
                                                            <input 
                                                                type="number" min="1" 
                                                                className="w-16 p-1 border rounded" 
                                                                value={item.quantity} 
                                                                onChange={(e) => updateItem(item.productId, 'quantity', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <input 
                                                                type="number" step="0.01" 
                                                                className="w-20 p-1 border rounded" 
                                                                value={item.cost} 
                                                                onChange={(e) => updateItem(item.productId, 'cost', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 text-right font-bold">
                                                            S/ {(item.quantity * item.cost).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* VIEW: PURCHASES LIST */}
                {viewMode === 'list' && activeTab === 'purchases' && (
                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
                            <Search className="w-5 h-5 text-gray-400 mr-2" />
                            <input 
                                type="text" 
                                placeholder="Buscar compras..." 
                                className="flex-1 outline-none text-sm"
                                value={searchPurchase}
                                onChange={e => setSearchPurchase(e.target.value)}
                            />
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-3">Fecha</th>
                                        <th className="px-6 py-3">Proveedor</th>
                                        <th className="px-6 py-3 text-center">Estado</th>
                                        <th className="px-6 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                    {filteredPurchases.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">{new Date(p.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-medium">{p.Provider?.name}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {p.status === 'paid' ? 'PAGADO' : 'PENDIENTE'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold">S/ {p.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* VIEW: PROVIDERS */}
                {viewMode === 'list' && activeTab === 'providers' && (
                     <div className="space-y-6">
                        <div className="flex justify-end">
                            <button onClick={() => { setEditingProvider(null); setIsProviderModalOpen(true); }} className="px-4 py-2 bg-cyan-600 text-white rounded-lg flex items-center hover:bg-cyan-500">
                                <Plus className="w-4 h-4 mr-2" /> Nuevo Proveedor
                            </button>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-3">Razón Social</th>
                                        <th className="px-6 py-3">RUC</th>
                                        <th className="px-6 py-3">Teléfono</th>
                                        <th className="px-6 py-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                    {providers.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-bold">{p.name}</td>
                                            <td className="px-6 py-4">{p.ruc}</td>
                                            <td className="px-6 py-4">{p.phone}</td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button onClick={() => { setEditingProvider(p); setIsProviderModalOpen(true); }} className="text-cyan-600 hover:text-cyan-800">Editar</button>
                                                <button onClick={() => handleDeleteProvider(p.id)} className="text-red-400 hover:text-red-600">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* VIEW: PAYABLE */}
                {viewMode === 'list' && activeTab === 'payable' && (
                    <div className="space-y-6">
                         <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-start text-yellow-800">
                            <AlertCircle className="w-5 h-5 mr-3 mt-0.5" />
                            <div>
                                <h4 className="font-bold">Cuentas Pendientes</h4>
                                <p className="text-sm">Estas facturas están registradas como crédito.</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-3">Fecha</th>
                                        <th className="px-6 py-3">Proveedor</th>
                                        <th className="px-6 py-3 text-right">Deuda</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                    {payablePurchases.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">{new Date(p.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-bold">{p.Provider?.name}</td>
                                            <td className="px-6 py-4 text-right font-bold text-red-500">S/ {p.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Provider Modal */}
            {isProviderModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">{editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
                        <form onSubmit={handleSaveProvider} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                                <input name="name" defaultValue={editingProvider?.name} required className="w-full px-4 py-2 rounded-xl bg-gray-50 border outline-none focus:ring-2 focus:ring-cyan-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">RUC</label>
                                <input name="ruc" defaultValue={editingProvider?.ruc} className="w-full px-4 py-2 rounded-xl bg-gray-50 border outline-none focus:ring-2 focus:ring-cyan-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                <input name="phone" defaultValue={editingProvider?.phone} className="w-full px-4 py-2 rounded-xl bg-gray-50 border outline-none focus:ring-2 focus:ring-cyan-500" />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setIsProviderModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 font-bold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Purchases;
