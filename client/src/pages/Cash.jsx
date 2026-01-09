import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Lock, Unlock, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Cash = () => {
    const { user } = useAuth();
    const [status, setStatus] = useState('loading'); // loading, open, closed
    const [sessionData, setSessionData] = useState(null);
    const [historyData, setHistoryData] = useState([]); // [History]
    const [activeTab, setActiveTab] = useState('current'); // current, history
    const [loading, setLoading] = useState(true);

    // Form States
    const [initialAmount, setInitialAmount] = useState('');
    const [movement, setMovement] = useState({ type: 'in', amount: '', description: '' });
    const [closeData, setCloseData] = useState({ finalAmount: '', notes: '' });
    
    // Modals
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/cash/status');
            setStatus(data.status);
            setSessionData(data);
        } catch (error) {
            console.error("Error fetching cash status", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const { data } = await api.get('/cash/history');
            setHistoryData(data);
        } catch (error) {
            console.error("Error fetching history", error);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    useEffect(() => {
        if (activeTab === 'history' && user?.role === 'admin') {
            fetchHistory();
        }
    }, [activeTab, user]);

    const handleOpenSession = async (e) => {
        e.preventDefault();
        try {
            await api.post('/cash/open', { initialAmount, userId: user.id });
            localStorage.setItem('cash_status', 'open'); // FLAG FOR BROWSER WARNING
            fetchStatus();
        } catch (error) {
            alert("Error al abrir caja");
        }
    };

    const handleMovement = async (e) => {
        e.preventDefault();
        try {
            await api.post('/cash/movement', { ...movement, userId: user.id });
            setIsMovementModalOpen(false);
            setMovement({ type: 'in', amount: '', description: '' });
            fetchStatus(); // Refresh totals
        } catch (error) {
            alert("Error al registrar movimiento");
        }
    };

    const handleCloseSession = async (e) => {
        e.preventDefault();
        try {
            await api.post('/cash/close', closeData);
            setIsCloseModalOpen(false);
            setCloseData({ finalAmount: '', notes: '' });
            localStorage.setItem('cash_status', 'closed'); // FLAG FOR BROWSER WARNING
            fetchStatus();
        } catch (error) {
            alert("Error al cerrar caja");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando estado de caja...</div>;

    return (
        <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
            {/* Header Tabs (Admin Only) */}
            {user?.role === 'admin' && (
                <div className="bg-white px-8 pt-4 border-b border-gray-200 flex space-x-6 z-10 sticky top-0">
                    <button 
                        onClick={() => setActiveTab('current')}
                        className={`pb-4 px-2 font-medium text-sm transition ${activeTab === 'current' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Caja Actual
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`pb-4 px-2 font-medium text-sm transition ${activeTab === 'history' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Historial de Cierres
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-8 relative">
                
                {activeTab === 'history' ? (
                    /* HISTORY VIEW */
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                         <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase sticky top-0">
                                <tr>
                                    <th className="px-6 py-3">Fecha Cierre</th>
                                    <th className="px-6 py-3">Usuario</th>
                                    <th className="px-6 py-3 text-right">Monto Inicial</th>
                                    <th className="px-6 py-3 text-right">Monto Final</th>
                                    <th className="px-6 py-3 text-right">Diferencia</th>
                                    <th className="px-6 py-3">Notas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                {historyData.map(h => {
                                    const closeDate = h.closeTime ? new Date(h.closeTime) : (h.updatedAt ? new Date(h.updatedAt) : null);
                                    
                                    return (
                                    <tr key={h.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{closeDate ? closeDate.toLocaleDateString() : '-'}</div>
                                            <div className="text-xs text-gray-400">{closeDate ? closeDate.toLocaleTimeString() : ''}</div>
                                        </td>
                                        <td className="px-6 py-4">{h.User?.name || 'Usuario'}</td>
                                        <td className="px-6 py-4 text-right">S/ {parseFloat(h.initialAmount || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right font-bold">S/ {parseFloat(h.finalAmount || 0).toFixed(2)}</td>
                                        {/* Difference: Now backend calculates it! */}
                                        <td className="px-6 py-4 text-right">
                                            {h.difference !== null && h.difference !== undefined ? (
                                                <span className={h.difference < 0 ? 'text-red-500 font-bold' : (h.difference > 0 ? 'text-green-600 font-bold' : 'text-gray-500 font-bold')}>
                                                    S/ {parseFloat(h.difference).toFixed(2)}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 italic text-gray-500">{h.notes || '-'}</td>
                                    </tr>
                                    );
                                })}
                                {historyData.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-400">No hay historial disponible.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* CURRENT SESSION VIEW */
                    status === 'closed' ? (
                        <div className="h-full flex flex-col items-center justify-center">
                            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                                <div className="w-20 h-20 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Lock className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Apertura de Caja</h2>
                                <p className="text-gray-500 mb-8">Ingresa el monto inicial para comenzar las operaciones.</p>
                                
                                <form onSubmit={handleOpenSession}>
                                    <div className="mb-6 text-left">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Monto Inicial (S/)</label>
                                        <input 
                                            type="number" step="0.01" required
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none text-lg font-bold"
                                            value={initialAmount}
                                            onChange={e => setInitialAmount(e.target.value)}
                                        />
                                    </div>
                                    <button type="submit" className="w-full py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-500 shadow-lg transition">
                                        Abrir Caja
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        status === 'open' && sessionData ? (
                            <div className="flex flex-col h-full">
                                <header className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">Caja Abierta</h2>
                                        <p className="text-sm text-gray-500">Sesión iniciada: {new Date(sessionData.session.openTime).toLocaleString()}</p>
                                    </div>
                                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center">
                                        <Unlock className="w-4 h-4 mr-2" /> ACTIVA
                                    </div>
                                </header>

                                {/* KPI Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Monto Inicial</p>
                                        <p className="text-2xl font-bold text-gray-800">S/ {parseFloat(sessionData.session.initialAmount).toFixed(2)}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Ventas Efectivo</p>
                                        <p className="text-2xl font-bold text-green-600">+ S/ {sessionData.salesCash.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Ingresos / Egresos (Manual)</p>
                                        <div className="flex space-x-2 items-baseline">
                                            <span className="text-green-600 font-bold text-lg">+ {sessionData.manualInput.toFixed(2)}</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-red-500 font-bold text-lg">- {sessionData.manualOutput.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 bg-cyan-50 border-cyan-100">
                                        <p className="text-sm font-medium text-cyan-700 mb-1">Efectivo Esperado en Caja</p>
                                        <p className="text-3xl font-bold text-cyan-800">S/ {sessionData.expected.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Actions */}
                                    <div className="lg:col-span-1 space-y-4">
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                            <h4 className="font-bold text-gray-800 mb-4">Acciones Rápidas</h4>
                                            <div className="space-y-3">
                                                <button 
                                                    onClick={() => { setMovement({ ...movement, type: 'in' }); setIsMovementModalOpen(true); }}
                                                    className="w-full py-3 px-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium text-left flex items-center transition"
                                                >
                                                    <ArrowUpCircle className="w-5 h-5 mr-3" /> Registrar Ingreso
                                                </button>
                                                <button 
                                                    onClick={() => { setMovement({ ...movement, type: 'out' }); setIsMovementModalOpen(true); }}
                                                    className="w-full py-3 px-4 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium text-left flex items-center transition"
                                                >
                                                    <ArrowDownCircle className="w-5 h-5 mr-3" /> Registrar Salida / Gasto
                                                </button>
                                                <hr className="border-gray-100 my-4" />
                                                <button 
                                                    onClick={() => setIsCloseModalOpen(true)}
                                                    className="w-full py-3 px-4 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-medium text-center shadow-lg transition flex justify-center items-center"
                                                >
                                                    <Lock className="w-4 h-4 mr-2" /> Cerrar Caja (Cuadre)
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Movements List */}
                                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col max-h-[500px]">
                                        <div className="p-6 border-b border-gray-100">
                                            <h4 className="font-bold text-gray-800">Movimientos Recientes</h4>
                                        </div>
                                        <div className="flex-1 overflow-auto p-0">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase sticky top-0">
                                                    <tr>
                                                        <th className="px-6 py-3">Hora</th>
                                                        <th className="px-6 py-3">Tipo</th>
                                                        <th className="px-6 py-3">Descripción</th>
                                                        <th className="px-6 py-3 text-right">Monto</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                                    {sessionData.session.CashMovements?.length === 0 ? (
                                                        <tr><td colSpan="4" className="p-6 text-center text-gray-400">No hay movimientos manuales registrados.</td></tr>
                                                    ) : (
                                                        sessionData.session.CashMovements?.map(m => (
                                                            <tr key={m.id}>
                                                                <td className="px-6 py-3">{new Date(m.date).toLocaleTimeString()}</td>
                                                                <td className="px-6 py-3">
                                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${m.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                        {m.type === 'in' ? 'INGRESO' : 'SALIDA'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-3">{m.description}</td>
                                                                <td className={`px-6 py-3 text-right font-bold ${m.type === 'in' ? 'text-green-600' : 'text-red-500'}`}>
                                                                    {m.type === 'in' ? '+' : '-'} S/ {parseFloat(m.amount).toFixed(2)}
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
                        ) : (
                            <div>Error cargando datos.</div>
                        )
                    )
                )}
            </div>

            {/* Modal Movement */}
            {isMovementModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">{movement.type === 'in' ? 'Registrar Ingreso' : 'Registrar Salida'}</h3>
                        <form onSubmit={handleMovement}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto (S/)</label>
                                    <input 
                                        type="number" step="0.01" required autoFocus
                                        className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                                        value={movement.amount}
                                        onChange={e => setMovement({ ...movement, amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                                    <input 
                                        type="text" required
                                        className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                                        value={movement.description}
                                        onChange={e => setMovement({ ...movement, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setIsMovementModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 font-bold">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Close */}
            {isCloseModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Cerrar Caja</h3>
                        <p className="text-sm text-gray-500 mb-6">Realiza el conteo físico del dinero.</p>
                        
                        <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                            <p className="text-sm text-gray-500">Monto Esperado (Sistema)</p>
                            <p className="text-2xl font-bold text-gray-800">S/ {sessionData?.expected?.toFixed(2)}</p>
                        </div>

                        <form onSubmit={handleCloseSession}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dinero en Efectivo (Real)</label>
                                    <input 
                                        type="number" step="0.01" required autoFocus
                                        className="w-full px-4 py-2 rounded-xl bg-white border border-gray-300 focus:ring-2 focus:ring-cyan-500 outline-none font-bold text-lg"
                                        value={closeData.finalAmount}
                                        onChange={e => setCloseData({ ...closeData, finalAmount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notas (Opcional)</label>
                                    <textarea 
                                        rows="3"
                                        className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
                                        value={closeData.notes}
                                        onChange={e => setCloseData({ ...closeData, notes: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setIsCloseModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-bold">Cerrar Turno</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cash;
