import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
    const [stats, setStats] = useState({ 
        salesToday: 0, 
        profitEstimate: 0, 
        lowStockCount: 0, 
        trend: { labels: [], data: [] },
        topProducts: [],
        recentTransactions: []
    });
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('today'); // New state
    const [date, setDate] = useState(new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/dashboard', { params: { range } });
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [range]); // Reload when range changes

    // Chart Config
    const chartData = {
        labels: stats.trend.labels,
        datasets: [
          {
            label: 'Ventas (S/)',
            data: stats.trend.data,
            borderColor: 'rgb(8, 145, 178)',
            backgroundColor: 'rgba(8, 145, 178, 0.5)',
            tension: 0.3,
            fill: true
          },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            y: { beginAtZero: true, grid: { borderDash: [2, 4] } },
            x: { grid: { display: false } }
        }
    };

    if (loading && !stats.salesToday) return <div className="p-8 text-center text-gray-500">Cargando Dashboard...</div>;

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Resumen General</h2>
                    <p className="text-sm text-gray-500 capitalize">{date}</p>
                </div>
                <div className="mt-4 md:mt-0 flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                    <button 
                        onClick={() => setRange('today')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${range === 'today' ? 'bg-cyan-50 text-cyan-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Hoy
                    </button>
                    <button 
                        onClick={() => setRange('week')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${range === 'week' ? 'bg-cyan-50 text-cyan-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Esta Semana
                    </button>
                    <button 
                        onClick={() => setRange('month')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${range === 'month' ? 'bg-cyan-50 text-cyan-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Este Mes
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                            {range === 'today' ? 'Ventas del Día' : range === 'week' ? 'Ventas de la Semana' : 'Ventas del Mes'}
                        </p>
                        <h3 className="text-3xl font-extrabold text-gray-800 mt-1">S/ {parseFloat(stats.salesToday).toFixed(2)}</h3>
                    </div>
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                        <DollarSign className="w-8 h-8" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Utilidad Estimada</p>
                        <h3 className="text-3xl font-extrabold text-gray-800 mt-1">S/ {parseFloat(stats.profitEstimate).toFixed(2)}</h3>
                    </div>
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Alertas de Stock</p>
                        <h3 className="text-3xl font-extrabold text-red-500 mt-1">{stats.lowStockCount}</h3>
                        <p className="text-xs text-red-400">Productos con bajo inventario</p>
                    </div>
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative z-0">
                     <h3 className="font-bold text-gray-800 mb-6">Tendencia de Ventas (Últimos 7 días)</h3>
                     <div className="h-80 w-full relative">
                        <Line options={chartOptions} data={chartData} />
                     </div>
                </div>

                {/* Top Products */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-gray-800 mb-6">Top Productos Vendidos (Mes)</h3>
                    <div className="space-y-6">
                        {stats.topProducts.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center italic">No hay datos suficientes</p>
                        ) : (
                            stats.topProducts.map((prod, i) => (
                                <div key={i} className="flex flex-col">
                                    <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                                        <span>{prod.name}</span>
                                        <span className="text-gray-900 font-bold">{prod.totalQty} und. <span className="text-gray-400 font-normal">| S/ {parseFloat(prod.currentPrice).toFixed(2)}</span></span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div 
                                            className="bg-cyan-500 h-2 rounded-full" 
                                            style={{ width: `${Math.min((prod.totalQty / stats.topProducts[0].totalQty) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-gray-800 mb-6">Transacciones Recientes</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-3 rounded-l-lg">ID</th>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Monto</th>
                                <th className="px-6 py-3">Pago</th>
                                <th className="px-6 py-3 rounded-r-lg text-right">Fecha/Hora</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                            {stats.recentTransactions.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Sin movimientos recientes</td></tr>
                            ) : (
                                stats.recentTransactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-bold text-cyan-600">#{tx.id.toString().padStart(6, '0')}</td>
                                        <td className="px-6 py-4">{tx.Client?.name || 'Cliente General'}</td>
                                        <td className={`px-6 py-4 font-bold ${tx.status === 'refunded' ? 'text-red-400 line-through' : 'text-gray-800'}`}>
                                            S/ {parseFloat(tx.total).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                tx.status === 'refunded' ? 'bg-red-50 text-red-500' :
                                                tx.paymentMethod === 'Yape' ? 'bg-purple-50 text-purple-600' :
                                                tx.paymentMethod === 'Efectivo' ? 'bg-emerald-50 text-emerald-600' :
                                                'bg-blue-50 text-blue-600'
                                            }`}>
                                                {tx.status === 'refunded' ? 'ANULADO' : tx.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-500">
                                            {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
