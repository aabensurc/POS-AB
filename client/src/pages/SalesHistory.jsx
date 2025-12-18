import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, FileText, Eye, Printer, X, Trash2 } from 'lucide-react';
import api from '../services/api';

const SalesHistory = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRange, setFilterRange] = useState('all'); // today, week, month, all, custom
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSale, setSelectedSale] = useState(null);
    const [settings, setSettings] = useState(null);

    // Fetch Settings for Receipt
    useEffect(() => {
        const fetchSettings = async () => {
             try {
                 const { data } = await api.get('/settings');
                 setSettings(data);
             } catch (error) { console.error("Error fetching settings for receipt", error); }
        };
        fetchSettings();
    }, []);

    // Fetch Sales
    useEffect(() => {
        const fetchSales = async () => {
            setLoading(true);
            try {
                // Backend supports ?range=...
                const params = filterRange !== 'all' ? { range: filterRange } : {};
                if (filterRange === 'custom') {
                    if (!startDate || !endDate) {
                        setLoading(false); 
                        return; 
                    }
                    if (startDate > endDate) {
                        alert("La fecha de inicio no puede ser mayor a la fecha de fin.");
                        setEndDate(''); // Reset invalid field
                        setLoading(false);
                        return;
                    }
                    params.startDate = startDate;
                    params.endDate = endDate;
                }
                const { data } = await api.get('/sales', { params });
                setSales(data);
            } catch (error) {
                console.error("Error fetching sales", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, [filterRange, startDate, endDate]); // Reload when range or dates change

    const fetchSalesManual = async () => {
         // Re-fetch helper
         setLoading(true);
         try {
            const params = filterRange !== 'all' ? { range: filterRange } : {};
            if (filterRange === 'custom') {
                 if (!startDate || !endDate) return;
                 if (startDate > endDate) {
                    alert("La fecha de inicio no puede ser mayor a la fecha de fin.");
                    setEndDate(''); // Reset invalid field
                    return;
                }
                 params.startDate = startDate;
                 params.endDate = endDate;
            }
            const { data } = await api.get('/sales', { params });
            setSales(data);
         } finally { setLoading(false); }
    };

    const handleRefund = async (sale) => {
        if (!confirm(`¿Estás seguro de ANULAR la venta #${sale.id}?\n\n- Se devolverá el stock.\n- Si fue efectivo, se registrará salida de caja.`)) return;

        try {
            await api.post(`/sales/${sale.id}/refund`);
            alert('Venta anulada correctamente');
            fetchSalesManual();
        } catch (error) {
            alert('Error al anular: ' + (error.response?.data?.error || error.message));
        }
    };

    // Removed top-level ref and print hook from here

    const filteredSales = sales.filter(s => {
        const term = searchTerm.toLowerCase();
        return (
            s.id.toString().includes(term) ||
            s.Client?.name?.toLowerCase().includes(term) ||
            s.User?.name?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="h-full flex flex-col">
            <header className="bg-white shadow-sm px-8 py-4 flex flex-col z-10 sticky top-0">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <FileText className="w-6 h-6 mr-2 text-cyan-600" />
                        Historial de Ventas
                    </h2>
                </div>
                
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="w-5 h-5 text-gray-400" />
                        </span>
                        <input 
                            type="text" 
                            className="pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none w-full text-sm"
                            placeholder="Buscar por cliente o ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg border border-gray-200 px-3 py-2">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <select 
                                className="bg-transparent text-sm outline-none focus:ring-0 text-gray-700"
                                value={filterRange}
                                onChange={(e) => setFilterRange(e.target.value)}
                            >
                                <option value="all">Historico Completo</option>
                                <option value="today">Hoy</option>
                                <option value="week">Esta Semana</option>
                                <option value="month">Este Mes</option>
                                <option value="custom">Personalizado</option>
                            </select>
                        </div>

                        {filterRange === 'custom' && (
                            <div className="flex items-center space-x-2 animate-fade-in">
                                <input 
                                    type="date" 
                                    className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <span className="text-gray-400">-</span>
                                <input 
                                    type="date" 
                                    className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-8 bg-gray-50">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Ticket ID</th>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Vendedor</th>
                                <th className="px-6 py-3 text-right">Total</th>
                                <th className="px-6 py-3 text-center">Metodo</th>
                                <th className="px-6 py-3 text-center">Estado</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {loading ? (
                                <tr><td colSpan="8" className="p-8 text-center text-gray-500">Cargando...</td></tr>
                            ) : filteredSales.length === 0 ? (
                                <tr><td colSpan="8" className="p-8 text-center text-gray-500 italic">No se encontraron ventas.</td></tr>
                            ) : (filteredSales.map(sale => (
                                <tr key={sale.id} className="hover:bg-gray-50 transition font-medium">
                                    <td className="px-6 py-4">{new Date(sale.date).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-cyan-600 font-bold">#{sale.id.toString().padStart(6, '0')}</td>
                                    <td className="px-6 py-4">{sale.Client?.name || 'Cliente General'}</td>
                                    <td className="px-6 py-4 text-gray-500">{sale.User?.name || '-'}</td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-800">S/ {parseFloat(sale.total).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            sale.paymentMethod === 'Efectivo' ? 'bg-green-100 text-green-700' :
                                            sale.paymentMethod === 'Yape' ? 'bg-purple-100 text-purple-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {sale.paymentMethod}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            sale.status === 'refunded' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {sale.status === 'refunded' ? 'ANULADO' : 'COMPLETADO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button 
                                            onClick={() => setSelectedSale(sale)}
                                            className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
                                            title="Ver Detalle"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        {sale.status !== 'refunded' && (
                                            <button 
                                                onClick={() => handleRefund(sale)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                title="Anular Venta"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Detail & Print */}
            {selectedSale && (
                <ReceiptModal 
                    sale={selectedSale} 
                    settings={settings} 
                    onClose={() => setSelectedSale(null)} 
                />
            )}
        </div>
    );
};

// Extracted Component with Manual Print implementation
const ReceiptModal = ({ sale, settings, onClose }) => {
    const receiptId = `receipt-${sale.id}`;

    const handlePrint = () => {
        const content = document.getElementById(receiptId);
        if (!content) return;

        // Create invisible iframe
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;

        // Clone all styles from main document to ensure Tailwind works
        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(node => node.outerHTML)
            .join('');

        doc.open();
        doc.write(`
            <html>
            <head>
                <title>Ticket #${sale.id}</title>
                ${styles}
                <style>
                    @page { size: auto; margin: 0; }
                    body { 
                        background: white; 
                        margin: 0; 
                        padding: 0;
                        display: flex; 
                        justify-content: center; 
                    }
                    /* Ensure print visibility and 80mm width */
                    .printable-receipt { 
                        box-shadow: none !important; 
                        margin: 0 !important; 
                        width: 100% !important; 
                        max-width: 80mm !important; 
                        padding: 10px !important;
                    }
                </style>
            </head>
            <body>
                ${content.outerHTML}
                <script>
                    setTimeout(() => {
                        window.print();
                        // Auto-remove iframe after print dialog closes (approximate)
                        // Note: Browsers block JS during print dialog, so this runs after.
                        setTimeout(() => {
                            window.frameElement.remove();
                        }, 500);
                    }, 500); // Wait for styles to apply
                </script>
            </body>
            </html>
        `);
        doc.close();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg">Detalle de Venta #{sale.id.toString().padStart(6,'0')}</h3>
                    <button onClick={onClose}><X className="w-6 h-6 text-gray-400" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-0 bg-gray-100 flex justify-center">
                    {/* Receipt Preview Component - Using ID for retrieval */}
                    <div id={receiptId} className="bg-white p-6 w-[80mm] text-xs font-mono shadow-sm my-4 text-black printable-receipt">
                        <div className="text-center mb-4 flex flex-col items-center">
                            {settings?.logoUrl && (
                                <img src={settings.logoUrl} alt="Logo" className="w-[120px] h-auto object-contain mb-2 mix-blend-multiply" />
                            )}
                            <h2 className="font-bold text-sm uppercase">{settings?.companyName || 'POS PERÚ'}</h2>
                            <p>{settings?.address || 'Dirección de la empresa'}</p>
                            <p>RUC: {settings?.ruc || '20000000000'}</p>
                        </div>
                        <div className="mb-2 border-b border-dashed border-black pb-2">
                            <p>Fecha: {new Date(sale.date).toLocaleString()}</p>
                            <p>Ticket #: {sale.id.toString().padStart(6, '0')}</p>
                            <p>Cliente: {sale.Client?.name || 'General'}</p>
                            {sale.paymentMethod !== 'Efectivo' && <p>Pago: {sale.paymentMethod}</p>}
                        </div>
                        <table className="w-full mb-2">
                            <tbody>
                                {sale.SaleItems?.map((item, i) => (
                                    <React.Fragment key={i}>
                                        <tr className="font-semibold"><td colSpan="3">{item.Product?.name || 'Producto (Sin Nombre)'}</td></tr>
                                        <tr className="text-right">
                                            <td>{item.quantity} x {parseFloat(item.price).toFixed(2)}</td>
                                            <td>=</td>
                                            <td>{(item.quantity * item.price).toFixed(2)}</td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                        <div className="border-t border-dashed border-black pt-2 mt-2">
                            <div className="flex justify-between font-bold text-sm">
                                <span>TOTAL</span>
                                <span>{settings?.currencySymbol || 'S/'} {parseFloat(sale.total).toFixed(2)}</span>
                            </div>
                            <p className="text-center mt-4 text-[10px] whitespace-pre-line">{settings?.ticketFooter || '¡Gracias por su compra!'}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-white">Cerrar</button>
                    <button 
                        onClick={handlePrint} 
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center shadow-lg"
                    >
                        <Printer className="w-4 h-4 mr-2" /> Imprimir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalesHistory;
