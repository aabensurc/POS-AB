import React, { useState, useEffect } from 'react';
import { Save, Printer, Database, Trash2, AlertTriangle, Building, FileText, Download } from 'lucide-react';
import api from '../services/api';

const Settings = () => {
    const [settings, setSettings] = useState({
        companyName: '',
        ruc: '',
        address: '',
        taxRate: 18,
        currencySymbol: 'S/',
        ticketFooter: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/settings');
            setSettings(data);
        } catch (error) {
            console.error("Error fetching settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await api.put('/settings', settings);
            alert("Ajustes guardados correctamente");
        } catch (error) {
            alert("Error al guardar ajustes");
        }
    };

    const handleDownloadBackup = () => {
        // Trigger download directly via browser
        // Using window.open for simplicity with auth cookie if applicable or simple token url param
        // For now, assume simple GET works or use Blob approach
        api.get('/settings/backup', { responseType: 'blob' })
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'backup.json');
                document.body.appendChild(link);
                link.click();
            })
            .catch(console.error);
    };

    const handleReset = async () => {
        if (!confirm("⚠️ PELIGRO:\n\nEsto borrará TODAS las ventas, compras y movimientos de caja.\nLos productos y clientes se conservarán.\n\n¿Estás 100% seguro?")) return;
        
        const userInput = prompt("Para confirmar, escribe: BORRAR DATOS");
        if (userInput !== "BORRAR DATOS") return alert("Acción cancelada.");

        try {
            await api.post('/settings/reset');
            alert("Datos transaccionales reiniciados.");
        } catch (error) {
            alert("Error al reiniciar datos: " + error.message);
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="h-full flex flex-col bg-gray-50 overflow-auto">
            {/* Header */}
            <header className="bg-white shadow-sm px-8 py-6 flex justify-between items-center sticky top-0 z-10">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Ajustes & Configuración</h2>
                    <p className="text-gray-500 text-sm">Administra los datos de tu empresa y preferencias.</p>
                </div>
                <button 
                    onClick={handleSave}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition flex items-center"
                >
                    <Save className="w-5 h-5 mr-2" /> Guardar Cambios
                </button>
            </header>

            <div className="p-8 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Company Data */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <Building className="w-5 h-5 mr-2 text-indigo-500" />
                        Datos de la Empresa
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="col-span-1 md:col-span-2">
                             <div className="flex items-center space-x-6 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
                                <div className="relative w-24 h-24 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center overflow-hidden group">
                                    {settings.logoUrl ? (
                                        <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="text-gray-300 flex flex-col items-center">
                                            <Building className="w-8 h-8 opacity-50" />
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setSettings({...settings, logoUrl: reader.result});
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Logotipo</h4>
                                    <p className="text-sm text-gray-500 mb-2">Haz clic en la imagen para subir.</p>
                                </div>
                            </div>
                         </div>
                         <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Razón Social</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Mi Empresa S.A.C."
                                value={settings.companyName}
                                onChange={e => setSettings({...settings, companyName: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">RUC</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="20123456789"
                                value={settings.ruc}
                                onChange={e => setSettings({...settings, ruc: e.target.value})}
                            />
                        </div>
                         <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Dirección Fiscal</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Av. Principal 123"
                                value={settings.address}
                                onChange={e => setSettings({...settings, address: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Fiscal */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                            Ajustes Fiscales
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tasa IGV (%)</label>
                                <input 
                                    type="number" 
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={settings.taxRate}
                                    onChange={e => setSettings({...settings, taxRate: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Símbolo Moneda</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={settings.currencySymbol}
                                    onChange={e => setSettings({...settings, currencySymbol: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Printer */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                         <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                            <Printer className="w-5 h-5 mr-2 text-indigo-500" />
                            Impresión
                        </h3>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Mensaje Pie de Ticket</label>
                            <textarea 
                                rows="3"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                placeholder="¡Gracias por su compra!"
                                value={settings.ticketFooter}
                                onChange={e => setSettings({...settings, ticketFooter: e.target.value})}
                            ></textarea>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-50 rounded-2xl shadow-sm border border-red-100 p-6">
                        <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            Zona de Peligro
                        </h3>
                        <button 
                            onClick={handleReset}
                            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold shadow transition text-sm"
                        >
                            Reiniciar Datos de Venta
                        </button>
                        <button 
                            onClick={handleDownloadBackup}
                            className="w-full mt-3 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-gray-50 transition text-sm flex items-center justify-center"
                        >
                            <Download className="w-4 h-4 mr-2" /> Backup JSON
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Settings;
