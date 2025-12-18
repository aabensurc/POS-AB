/**
 * Sales History Logic
 */

const store = new Store();
let currentFilteredSales = []; // Store filtered sales for CSV export

document.addEventListener('DOMContentLoaded', () => {
    // Set default date range (Today)
    const today = new Date().toISOString().split('T')[0];
    // Optional: Default input values if desired, for now let's show all or just today
    // document.getElementById('date-start').value = today;
    // document.getElementById('date-end').value = today;

    renderSalesHistory();

    // Live search
    document.getElementById('sales-search').addEventListener('input', renderSalesHistory);

    // Export button listener
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }
});

function renderSalesHistory() {
    const term = document.getElementById('sales-search').value.toLowerCase();
    const start = document.getElementById('date-start').value;
    const end = document.getElementById('date-end').value;

    let sales = store.getSales().reverse(); // Newest first

    // Filters
    if (term) {
        sales = sales.filter(s =>
            s.id.toString().includes(term) ||
            (s.client && s.client.name.toLowerCase().includes(term))
        );
    }

    if (start) {
        // Construct Local Start Date (00:00:00)
        const [y, m, d] = start.split('-');
        const startDate = new Date(y, m - 1, d, 0, 0, 0);
        sales = sales.filter(s => new Date(s.date) >= startDate);
    }

    if (end) {
        // Construct Local End Date (23:59:59)
        const [y, m, d] = end.split('-');
        const endDate = new Date(y, m - 1, d, 23, 59, 59, 999);
        sales = sales.filter(s => new Date(s.date) <= endDate);
    }

    currentFilteredSales = sales; // Save for export

    const tbody = document.getElementById('sales-table-body');

    if (sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-gray-400">No se encontraron ventas.</td></tr>';
        return;
    }

    tbody.innerHTML = sales.map(s => {
        const date = new Date(s.date).toLocaleString('es-PE');
        const clientName = (s.client && s.client.name) || s.clientName || 'Cliente General';
        const itemCount = s.items.reduce((sum, i) => sum + (i.quantity || i.qty || 0), 0);

        let statusBadge = '';
        let rowClass = '';
        let actionBtn = '';

        if (s.status === 'refunded') {
            statusBadge = '<span class="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs font-bold">ANULADO</span>';
            rowClass = 'bg-gray-50 opacity-75';
            // Show View button even if refunded, but no refund action
            actionBtn = `
                <div class="flex justify-end space-x-2">
                    <button onclick="showSaleDetail(${s.id})" class="text-cyan-600 hover:text-cyan-800 p-1 rounded hover:bg-cyan-50" title="Ver Detalle">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                    <span class="w-8"></span> 
                </div>`;
        } else {
            statusBadge = '<span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">COMPLETADO</span>';
            rowClass = 'hover:bg-gray-50 transition-colors';
            actionBtn = `
                <div class="flex justify-end space-x-2">
                    <button onclick="showSaleDetail(${s.id})" class="text-cyan-600 hover:text-cyan-800 p-1 rounded hover:bg-cyan-50" title="Ver Detalle">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                    <button onclick="handleRefund(${s.id})" class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50" title="Anular Venta">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            `;
        }

        return `
        <tr class="${rowClass}">
            <td class="px-6 py-4 text-gray-900">${date}</td>
            <td class="px-6 py-4 text-gray-500 font-mono text-xs">#${s.id}</td>
            <td class="px-6 py-4 text-gray-700 font-medium">${clientName}</td>
            <td class="px-6 py-4 text-gray-600 text-center">${itemCount}</td>
            <td class="px-6 py-4 text-right font-bold text-gray-900">S/ ${s.total.toFixed(2)}</td>
            <td class="px-6 py-4 text-center">${statusBadge}</td>
            <td class="px-6 py-4 text-right">${actionBtn}</td>
        </tr>
        `;
    }).join('');
}

function handleRefund(id) {
    if (!confirm(`¿Estás SEGURO de ANULAR la venta #${id}?\n\n- Se devolverá el stock al inventario.\n- Se registrará un EGRESO de dinero en caja.`)) {
        return;
    }

    try {
        store.refundSale(id);
        alert('Venta anulada correctamente.');
        renderSalesHistory();
    } catch (e) {
        alert(e.message);
    }
}

// --- Detail & Print Logic ---

function showSaleDetail(id) {
    const sale = store.getSales().find(s => s.id === id);
    if (!sale) return;

    // --- PRINT HEADER UPDATE ---
    const settings = store.getSettings();

    // SAFE UPDATE: Use IDs that match the updated HTML
    const nameEl = document.getElementById('receipt-company-name');
    const addrEl = document.getElementById('receipt-company-address');
    const rucEl = document.getElementById('receipt-company-ruc');

    if (nameEl) nameEl.textContent = settings.companyName || 'POS PERÚ';
    if (addrEl) addrEl.textContent = settings.address || '';
    if (rucEl) rucEl.textContent = `RUC: ${settings.ruc || ''}`;

    // Use logo if available
    const logoContainer = document.getElementById('receipt-logo');
    if (logoContainer) {
        if (settings.logo) {
            logoContainer.innerHTML = `<img src="${settings.logo}" class="h-16 mx-auto mb-2 opacity-90">`;
            logoContainer.classList.remove('hidden');
        } else {
            logoContainer.classList.add('hidden');
            logoContainer.innerHTML = '';
        }
    }

    // Populate Modal
    document.getElementById('detail-id').textContent = `#${sale.id}`;
    document.getElementById('detail-date').textContent = new Date(sale.date).toLocaleString('es-PE');
    document.getElementById('detail-client').textContent = (sale.client && sale.client.name) || sale.clientName || 'Cliente General';

    // Items
    const tbody = document.getElementById('detail-items');
    tbody.innerHTML = sale.items.map(item => {
        const qty = item.quantity || item.qty || 0;
        const productName = item.name || (store.getProductById(item.id) ? store.getProductById(item.id).name : 'Producto/Servicio');
        return `
        <tr class="border-b border-gray-100 last:border-0 border-dashed">
            <td class="py-2 pr-2 align-top">${qty}</td>
            <td class="py-2 pr-2 align-top">${productName}</td>
            <td class="py-2 text-right align-top whitespace-nowrap">S/ ${item.price.toFixed(2)}</td>
            <td class="py-2 text-right font-medium align-top whitespace-nowrap">S/ ${(item.price * qty).toFixed(2)}</td>
        </tr>
    `;
    }).join('');

    // Totals
    document.getElementById('detail-total').textContent = `S/ ${sale.total.toFixed(2)}`;

    // Calculate IGV based on total (Assuming included)
    const taxRate = sale.taxRate || 0.18;
    const subtotal = sale.total / (1 + taxRate);
    const igv = sale.total - subtotal;

    document.getElementById('detail-subtotal').textContent = `S/ ${subtotal.toFixed(2)}`;
    document.getElementById('detail-igv').textContent = `S/ ${igv.toFixed(2)}`;

    // Show Modal
    document.getElementById('sale-detail-modal').classList.remove('hidden');
}

function closeDetailModal() {
    document.getElementById('sale-detail-modal').classList.add('hidden');
}

function printReceipt() {
    window.print();
}

// --- Export Logic ---

function exportToCSV() {
    if (currentFilteredSales.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    // Headers
    const headers = ["ID", "Fecha", "Cliente", "Total", "Estado", "Items (Resumen)"];

    // Rows
    const rows = currentFilteredSales.map(s => {
        const date = new Date(s.date).toLocaleString('es-PE').replace(',', '');
        const client = (s.client && s.client.name) || s.clientName || 'Cliente General';
        const itemsSummary = s.items.map(i => {
            const pName = i.name || (store.getProductById(i.id) ? store.getProductById(i.id).name : 'Item');
            return `${i.quantity || i.qty || 0}x ${pName}`;
        }).join(' | ');

        // Escape content for CSV (handle commas)
        return [
            s.id,
            `"${date}"`,
            `"${client}"`,
            s.total.toFixed(2),
            s.status,
            `"${itemsSummary}"`
        ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    // Create Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ventas_pos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link); // Required for FF

    link.click();

    document.body.removeChild(link);
}
