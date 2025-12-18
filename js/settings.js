/**
 * Settings Logic
 */

const store = new Store();
let currentLogoBase64 = '';

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupLogoUpload();
});

function loadSettings() {
    const settings = store.getSettings();

    // Company Data
    document.getElementById('company-name').value = settings.companyName || '';
    document.getElementById('company-ruc').value = settings.ruc || '';
    document.getElementById('company-address').value = settings.address || '';
    document.getElementById('company-phone').value = settings.phone || '';
    document.getElementById('company-email').value = settings.email || '';

    // Fiscal
    document.getElementById('tax-rate').value = (settings.taxRate * 100).toFixed(0);
    document.getElementById('currency-symbol').value = settings.currencySymbol || 'S/';

    // Printer
    document.getElementById('ticket-footer').value = settings.ticketFooter || '';

    // Logo
    if (settings.logo) {
        currentLogoBase64 = settings.logo;
        const preview = document.getElementById('company-logo-preview');
        const placeholder = document.getElementById('logo-placeholder');
        preview.src = settings.logo;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
    }
}

function saveSettings() {
    const companyName = document.getElementById('company-name').value.trim();
    const ruc = document.getElementById('company-ruc').value.trim();
    const address = document.getElementById('company-address').value.trim();
    const phone = document.getElementById('company-phone').value.trim();
    const email = document.getElementById('company-email').value.trim();

    // Tax Rate (Convert from percentage to decimal, e.g., 18 -> 0.18)
    const taxRateInput = parseFloat(document.getElementById('tax-rate').value);
    const taxRate = isNaN(taxRateInput) ? 0.18 : taxRateInput / 100;

    const currencySymbol = document.getElementById('currency-symbol').value.trim();
    const ticketFooter = document.getElementById('ticket-footer').value.trim();

    if (!companyName || !ruc) {
        alert("Razón Social y RUC son obligatorios.");
        return;
    }

    const newSettings = {
        companyName,
        ruc,
        address,
        phone,
        email,
        logo: currentLogoBase64,
        taxRate,
        currencySymbol,
        ticketFooter
    };

    store.saveSettings(newSettings);
    alert("¡Configuración guardada exitosamente!");
}

function setupLogoUpload() {
    const input = document.getElementById('logo-input');
    const preview = document.getElementById('company-logo-preview');
    const placeholder = document.getElementById('logo-placeholder');

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        store.compressImage(file, 200, 0.8)
            .then(base64 => {
                currentLogoBase64 = base64;
                preview.src = base64;
                preview.classList.remove('hidden');
                placeholder.classList.add('hidden');
            })
            .catch(err => {
                alert("Error al procesar la imagen: " + err);
            });
    });
}

function resetTransactionalData() {
    if (!confirm('¿ESTÁS SEGURO? Esto borrará todas las Ventas, Clientes, Compras, Proveedores y Movimientos de Caja.\n\nSe mantendrán tus Productos, Categorías y Usuarios.\n\nEsta acción NO se puede deshacer.')) {
        return;
    }

    const currentDB = store.getDB();

    const cleanDB = {
        // Keep these
        products: currentDB.products || [],
        categories: currentDB.categories || [],
        users: currentDB.users || [],
        settings: currentDB.settings || {},

        // Reset these
        sales: [],
        clients: [],
        purchases: [],
        providers: [],
        cash_sessions: [],
        cash_movements: [],

        // Ensure structure exists
        config: currentDB.config || {}
    };

    store.saveDB(cleanDB);
    alert('Base de datos reiniciada con éxito (Conservando Catálogo). La página se recargará.');
    location.reload();
}

window.saveSettings = saveSettings;
window.resetTransactionalData = resetTransactionalData;

function downloadBackup() {
    const db = store.getDB();
    const json = JSON.stringify(db, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pos_kumbaya_backup_${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

window.downloadBackup = downloadBackup;
