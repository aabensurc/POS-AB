import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

const ProductModal = ({ isOpen, onClose, product, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        categoryId: '',
        stock: 0,
        cost: 0,
        price: 0,
        image: ''
    });
    const [categories, setCategories] = useState([]);
    const [preview, setPreview] = useState('');

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories", error);
            }
        };
        fetchCategories();
    }, []);

    // Set initial data for edit or reset for new
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                code: product.code || '',
                categoryId: product.categoryId || '',
                stock: product.stock,
                cost: product.cost,
                price: product.price,
                image: product.image || ''
            });
            setPreview(product.image || '');
        } else {
            setFormData({
                name: '',
                code: '',
                categoryId: '',
                stock: 0,
                cost: 0,
                price: 0,
                image: ''
            });
            setPreview('');
        }
    }, [product, isOpen]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Convert numbers
        const dataToSend = {
            ...formData,
            stock: parseInt(formData.stock),
            cost: parseFloat(formData.cost),
            price: parseFloat(formData.price),
            categoryId: parseInt(formData.categoryId)
        };
        onSave(dataToSend);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                >
                    <X className="w-6 h-6" />
                </button>
                
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                    {product ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input 
                                type="text"
                                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                            <input 
                                type="text"
                                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                                value={formData.code}
                                onChange={e => setFormData({...formData, code: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <select 
                                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                                value={formData.categoryId}
                                onChange={e => setFormData({...formData, categoryId: e.target.value})}
                                required
                            >
                                <option value="">Seleccionar</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
                            <input 
                                type="number"
                                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                                value={formData.stock}
                                onChange={e => setFormData({...formData, stock: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Costo (S/)</label>
                            <input 
                                type="number" step="0.01"
                                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                                value={formData.cost}
                                onChange={e => setFormData({...formData, cost: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio (S/)</label>
                            <input 
                                type="number" step="0.01"
                                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                        <div className="flex items-start space-x-4">
                            <div className="flex-1">
                                <label className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 bg-white text-gray-600 transition">
                                    <Upload className="w-4 h-4 mr-2" />
                                    <span>Subir Imagen</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="O pegar URL..." 
                                    className="mt-2 w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 text-xs focus:ring-1 focus:ring-cyan-500 outline-none"
                                    value={formData.image.startsWith('data:') ? '' : formData.image}
                                    onChange={e => {
                                        setFormData({...formData, image: e.target.value});
                                        setPreview(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="h-24 w-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="text-gray-400 w-8 h-8" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 py-2 px-4 rounded-lg border border-gray-300 font-medium hover:bg-gray-50 transition"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 py-2 px-4 rounded-lg bg-cyan-600 text-white font-bold hover:bg-cyan-500 transition shadow-lg shadow-cyan-200"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
