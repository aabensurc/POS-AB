import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, Trash2, User, CreditCard, Banknote, Smartphone, Printer, X, Plus } from 'lucide-react';
import api from '../services/api';

// --- Subcomponent: Client Modal (Simplified for POS) ---
const ClientSelector = ({ isOpen, onClose, onSelect }) => {
    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            api.get('/clients').then(res => setClients(res.data)).catch(console.error);
        }
    }, [isOpen]);

    const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.docNumber?.includes(search));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6 h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Seleccionar Cliente</h3>
                    <button onClick={onClose}><X className="w-6 h-6 text-gray-400" /></button>
                </div>
                <input 
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 border-none mb-4"
                    placeholder="Buscar cliente..."
                    value={search} onChange={e => setSearch(e.target.value)}
                />
                <div className="flex-1 overflow-y-auto space-y-2">
                    {filtered.map(c => (
                        <div key={c.id} onClick={() => onSelect(c)} className="p-3 bg-gray-50 hover:bg-cyan-50 cursor-pointer rounded-lg border border-gray-100 hover:border-cyan-200 transition">
                            <p className="font-bold text-gray-800">{c.name}</p>
                            <p className="text-xs text-gray-500">{c.docType}: {c.docNumber}</p>
                        </div>
                    ))}
                    <div onClick={() => onSelect({ id: null, name: 'Cliente General', docNumber: '00000000' })} className="p-3 bg-blue-50 text-blue-700 font-bold text-center rounded-lg cursor-pointer hover:bg-blue-100">
                        Cliente General
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Subcomponent: Checkout Modal ---
const CheckoutModal = ({ isOpen, onClose, total, onConfirm }) => {
    const [method, setMethod] = useState('Efectivo');
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Finalizar Venta</h3>
                <div className="text-center mb-8">
                    <p className="text-gray-500 text-sm">Total a Cobrar</p>
                    <div className="text-4xl font-bold text-cyan-600 bg-cyan-50 p-4 rounded-xl mt-2">S/ {total.toFixed(2)}</div>
                </div>
                
                <p className="font-medium text-gray-700 mb-2">Método de Pago</p>
                <div className="grid grid-cols-3 gap-3 mb-8">
                    <button onClick={() => setMethod('Efectivo')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${method === 'Efectivo' ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-gray-200 hover:border-gray-300'}`}>
                        <Banknote className="w-6 h-6" />
                        <span className="text-xs font-bold">Efectivo</span>
                    </button>
                    <button onClick={() => setMethod('Yape')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${method === 'Yape' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-gray-300'}`}>
                        <Smartphone className="w-6 h-6" />
                        <span className="text-xs font-bold">Yape</span>
                    </button>
                    <button onClick={() => setMethod('Tarjeta')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${method === 'Tarjeta' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                        <CreditCard className="w-6 h-6" />
                        <span className="text-xs font-bold">Tarjeta</span>
                    </button>
                </div>

                <div className="flex space-x-3">
                    <button onClick={onClose} className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                    <button onClick={() => onConfirm(method)} className="flex-1 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-500 shadow-lg shadow-cyan-200">Confirmar Pago</button>
                </div>
            </div>
        </div>
    );
};

// --- Header Component with Search and Categories ---
const ProductHeader = ({ onSearch, onCategorySelect, categories, selectedCategory }) => (
    <div className="p-6 bg-white shadow-sm z-10 sticky top-0">
        <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="w-6 h-6 text-gray-400" />
            </span>
            <input 
                type="text" 
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-cyan-500 text-lg transition-shadow outline-none"
                placeholder="Buscar producto (Código, Nombre)..."
                onChange={e => onSearch(e.target.value)}
                autoFocus
            />
        </div>
        <div className="flex space-x-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            <button 
                onClick={() => onCategorySelect(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!selectedCategory ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
                Todos
            </button>
            {categories.map(cat => (
                <button 
                    key={cat.id}
                    onClick={() => onCategorySelect(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedCategory === cat.id ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    </div>
);

// --- Receipt Printable Component (Hidden) ---
const Receipt = React.forwardRef(({ sale, items, client }, ref) => {
    if (!sale) return null;
    return (
        <div ref={ref} className="hidden print:block fixed top-0 left-0 bg-white w-[80mm] p-2 text-black font-mono text-xs leading-tight">
            <div className="text-center mb-2">
                <h2 className="font-bold text-sm">POS PERÚ</h2>
                <p>Av. Larco 123, Miraflores</p>
                <p>RUC: 20123456789</p>
            </div>
            <div className="mb-2 border-b border-black pb-1 border-dashed">
                <p>Fecha: {new Date().toLocaleString()}</p>
                <p>Ticket #: {sale.id.toString().padStart(6, '0')}</p>
                <p>Cliente: {client?.name || 'General'}</p>
            </div>
            <table className="w-full mb-2">
                <tbody>
                    {items.map((item, i) => (
                        <tr key={i}>
                            <td colSpan="3">{item.name}</td>
                            <tr className="text-right">
                                <td>{item.quantity} x {item.price.toFixed(2)}</td>
                                <td>=</td>
                                <td>{(item.quantity * item.price).toFixed(2)}</td>
                            </tr>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="border-t border-black pt-1 mb-2 border-dashed">
                <div className="flex justify-between font-bold text-sm">
                    <span>TOTAL</span>
                    <span>S/ {items.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}</span>
                </div>
            </div>
            <div className="text-center mt-4">
                <p>¡Gracias por su compra!</p>
            </div>
        </div>
    );
});


// --- MAIN COMPONENT ---
const POS = () => {
    // State
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [cart, setCart] = useState([]);
    const [client, setClient] = useState({ id: null, name: 'Cliente General', docNumber: '00000000' });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    
    // Modals
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    
    // Receipt
    const receiptRef = useRef();
    const [lastSale, setLastSale] = useState(null);

    // Initial Data Load
    useEffect(() => {
        const loadData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/categories')
                ]);
                setProducts(prodRes.data);
                setCategories(catRes.data);
            } catch (error) {
                console.error("Error loading POS data", error);
            }
        };
        loadData();
    }, []);

    // Filter Logic
    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.code && p.code.includes(searchTerm));
        const matchCategory = selectedCategory ? p.categoryId === selectedCategory : true;
        return matchSearch && matchCategory;
    });

    // Cart Logic
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQ = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQ };
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const igv = subtotal * 0.18; // Included in price theoretically, but for display logic:
    // Assuming Price Includes IGV for simple POS logic (common in Peru retail)
    // Base = Total / 1.18
    const total = subtotal;
    const baseVal = total / 1.18;
    const igvVal = total - baseVal;

    // Checkout Logic
    const handleCheckout = async (method) => {
        try {
            // 1. Validate Cash Session
            // We can check local status if we had it, or just risk the API call rejection if backend enforces it.
            // But user wants a check BEFORE paying.
            // Let's do a quick check status call.
            const { data: statusData } = await api.get('/cash/status');
            if (statusData.status !== 'open') {
                alert("CAJA CERRADA: Debe abrir una caja para realizar ventas.");
                return;
            }

            const saleData = {
                clientId: client.id,
                total: total,
                paymentMethod: method,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            const { data } = await api.post('/sales', saleData);
            
            // Print Receipt Mockup
            setLastSale(data);
            setTimeout(() => {
                // window.print(); // Uncomment to trigger real print
                alert("Venta registrada correctamente! (Impresión simulada)");
                setCart([]);
                setClient({ id: null, name: 'Cliente General', docNumber: '00000000' });
                setIsCheckoutModalOpen(false);
                // Refresh products to see stock updates
                api.get('/products').then(res => setProducts(res.data));
            }, 500);

        } catch (error) {
            console.error("Error processing sale", error);
            if (error.response && error.response.data && error.response.data.message) {
                 alert("Error: " + error.response.data.message);
            } else {
                 alert("Error al procesar la venta. Verifique que la caja esté abierta.");
            }
        }
    };

    return (
        <div className="h-full flex overflow-hidden">
            {/* Left: Product Catalog */}
            <div className="flex-1 flex flex-col bg-gray-50 border-r border-gray-200 h-full">
                <ProductHeader 
                    onSearch={setSearchTerm} 
                    onCategorySelect={setSelectedCategory} 
                    categories={categories}
                    selectedCategory={selectedCategory}
                />
                
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
                        {filteredProducts.map(product => (
                            <div 
                                key={product.id} 
                                onClick={() => addToCart(product)}
                                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer transition flex flex-col h-64 group border border-transparent hover:border-cyan-200"
                            >
                                <div className="flex-1 bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
                                    {product.image ? (
                                        <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <ShoppingCart className="w-8 h-8 opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                        <span className="bg-white/90 text-cyan-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">Agregar +</span>
                                    </div>
                                </div>
                                <h4 className="font-semibold text-gray-800 line-clamp-2 text-sm h-10">{product.name}</h4>
                                <div className="flex justify-between items-end mt-2">
                                    <span className="text-gray-400 text-xs">Stock: {product.stock}</span>
                                    <span className="text-lg font-bold text-cyan-700">S/ {parseFloat(product.price).toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Cart */}
            <div className="w-[400px] bg-white shadow-2xl flex flex-col z-20 h-full">
                {/* Client Bar */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-bold text-gray-800 truncate w-32">{client.name}</p>
                            <p className="text-xs text-gray-500">Boleta Electrónica</p>
                        </div>
                    </div>
                    <button onClick={() => setIsClientModalOpen(true)} className="text-cyan-600 text-sm font-medium hover:underline">Cambiar</button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
                    {cart.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 opacity-60">
                            <ShoppingCart className="w-16 h-16 mb-2" />
                            <p>Tu carrito está vacío</p>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={index + '-' + item.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</p>
                                    <p className="text-cyan-600 text-xs font-semibold">S/ {(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center bg-gray-50 rounded-lg">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-l-lg font-bold text-gray-500">-</button>
                                        <span className="w-8 text-center text-sm font-bold text-gray-700">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-r-lg font-bold text-gray-500">+</button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-300 hover:text-red-500 transition">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Totals */}
                <div className="p-6 bg-slate-50 border-t border-gray-200">
                    <div className="space-y-2 mb-6 text-sm text-gray-600">
                        <div className="flex justify-between">
                            <span>Subtotal (Sin IGV)</span>
                            <span>S/ {baseVal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>IGV (18%)</span>
                            <span>S/ {igvVal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200 mt-2">
                            <span>Total a Pagar</span>
                            <span className="text-cyan-600">S/ {total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <button onClick={() => setCart([])} className="py-3 rounded-xl border border-gray-300 font-medium text-gray-600 hover:bg-gray-100 transition">Cancelar</button>
                        <button 
                            disabled={cart.length === 0}
                            onClick={() => setIsCheckoutModalOpen(true)}
                            className="py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cobrar
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ClientSelector isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} onSelect={(c) => { setClient(c); setIsClientModalOpen(false); }} />
            <CheckoutModal isOpen={isCheckoutModalOpen} onClose={() => setIsCheckoutModalOpen(false)} total={total} onConfirm={handleCheckout} />
            
            {/* Hidden Receipt */}
            <Receipt ref={receiptRef} sale={lastSale} items={cart} client={client} />
        </div>
    );
};

export default POS;
