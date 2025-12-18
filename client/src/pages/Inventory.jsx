import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Package } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductModal from '../components/ProductModal';

const Inventory = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            console.error("Error loading products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSave = async (productData) => {
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, productData);
            } else {
                await api.post('/products', productData);
            }
            fetchProducts();
            setIsModalOpen(false);
            setEditingProduct(null);
        } catch (error) {
            console.error("Error saving product", error);
            alert("Error al guardar el producto");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                await api.delete(`/products/${id}`);
                setProducts(products.filter(p => p.id !== id));
            } catch (error) {
                console.error("Error deleting product", error);
            }
        }
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.code && p.code.includes(searchTerm))
    );

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center z-10 sticky top-0">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Package className="w-6 h-6 mr-2 text-cyan-600" />
                    Gestión de Inventario
                </h2>
                <div className="flex space-x-4">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="w-5 h-5 text-gray-400" />
                        </span>
                        <input 
                            type="text" 
                            className="pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none text-sm w-64 transition-all focus:w-80"
                            placeholder="Buscar producto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {user?.role === 'admin' && (
                        <button 
                            onClick={openCreateModal}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nuevo Producto
                        </button>
                    )}
                </div>
            </header>

            {/* Table */}
            <div className="flex-1 overflow-auto p-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                <th className="py-4 px-6 font-medium">Producto</th>
                                <th className="py-4 px-6 font-medium">Categoría</th>
                                <th className="py-4 px-6 font-medium">Costo</th>
                                <th className="py-4 px-6 font-medium">Precio</th>
                                <th className="py-4 px-6 font-medium text-center">Stock</th>
                                <th className="py-4 px-6 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-gray-500">Cargando productos...</td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-gray-500">No se encontraron productos.</td>
                                </tr>
                            ) : (
                                filteredProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden mr-3">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Package className="h-full w-full p-2 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{product.name}</p>
                                                    <p className="text-xs text-gray-500">Code: {product.code || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="bg-cyan-50 text-cyan-700 py-1 px-3 rounded-full text-xs font-medium">
                                                {product.Category?.name || 'Sin Categoría'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-gray-500">S/ {parseFloat(product.cost).toFixed(2)}</td>
                                        <td className="py-4 px-6 font-medium text-gray-800">S/ {parseFloat(product.price).toFixed(2)}</td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`py-1 px-3 rounded-full text-xs font-bold ${
                                                product.stock <= 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-2">
                                            {user?.role === 'admin' && (
                                                <>
                                                    <button 
                                                        onClick={() => openEditModal(product)}
                                                        className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(product.id)}
                                                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                product={editingProduct}
                onSave={handleSave}
            />
        </div>
    );
};

export default Inventory;
