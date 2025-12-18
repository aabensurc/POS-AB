import React, { useState, useEffect } from 'react';
import { Tag, Trash2, Plus } from 'lucide-react';
import api from '../services/api';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error("Error loading categories", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        try {
            const { data } = await api.post('/categories', { name: newCategory });
            // Optimistic update or refetch
            setCategories([...categories, data]);
            setNewCategory('');
        } catch (error) {
            console.error("Error creating category", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro quieres eliminar esta categoría?')) return;
        
        try {
            await api.delete(`/categories/${id}`);
            setCategories(categories.filter(c => c.id !== id));
        } catch (error) {
            console.error("Error deleting category", error);
            alert("No se puede eliminar la categoría porque tiene productos asociados.");
        }
    };

    return (
        <div className="h-full flex flex-col">
            <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center z-10 sticky top-0">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Tag className="w-6 h-6 mr-2 text-cyan-600" />
                    Categorías
                </h2>
                <form onSubmit={handleAdd} className="flex space-x-2">
                    <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-cyan-500 transition">
                        <input 
                            type="text" 
                            placeholder="Nueva Categoría"
                            className="bg-transparent outline-none text-sm w-48"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                        />
                        <button 
                            type="submit"
                            className="text-cyan-600 hover:text-cyan-800 font-bold text-sm ml-2 flex items-center"
                            disabled={!newCategory.trim()}
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            AGREGAR
                        </button>
                    </div>
                </form>
            </header>

            <div className="flex-1 overflow-auto p-8 bg-gray-50">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 max-w-2xl mx-auto">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Listado de Categorías</h3>
                    
                    {loading ? (
                        <p className="text-center text-gray-500 py-4">Cargando...</p>
                    ) : (
                        <ul className="space-y-2">
                            {categories.map((category) => (
                                <li key={category.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg group transition">
                                    <span className="text-gray-700 font-medium">{category.name}</span>
                                    <button 
                                        onClick={() => handleDelete(category.id)}
                                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-2"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                            {categories.length === 0 && (
                                <p className="text-center text-gray-400 italic py-4">No hay categorías registradas.</p>
                            )}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Categories;
