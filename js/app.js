/**
 * Dashboard Logic
 */

let salesChart = null;
const store = new Store();

document.addEventListener('DOMContentLoaded', () => {
    // Initial Render: Today
    changeFilter('today');
    populateSalesTable(store);
});

function changeFilter(range) {
    // 1. Update Buttons State
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-white', 'text-gray-800', 'shadow-sm');
        btn.classList.add('text-gray-500', 'hover:bg-gray-200');
    });

    const activeBtn = document.getElementById(`btn-${range}`);
    if (activeBtn) {
        activeBtn.classList.remove('text-gray-500', 'hover:bg-gray-200');
        activeBtn.classList.add('bg-white', 'text-gray-800', 'shadow-sm');
    }

    // 2. Update Labels
    const labels = {
        'today': 'Del Día',
        'week': 'De la Semana',
        'month': 'Del Mes'
    };
    const labelPeriod = document.getElementById('label-period');
    if (labelPeriod) labelPeriod.textContent = labels[range];

    // 3. Update Date Display
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateDisplay = document.getElementById('date-display');
    if (dateDisplay) dateDisplay.textContent = new Date().toLocaleDateString('es-PE', dateOptions);

    // 4. Fetch Data
    const stats = store.getDashboardStats(range);
    const topProducts = store.getTopProducts(range);
    const alerts = store.getProducts().filter(p => p.stock <= 10).length;

    // 5. Update Cards
    const salesEl = document.getElementById('kpi-sales');
    const profitEl = document.getElementById('kpi-profit');
    const alertsEl = document.getElementById('kpi-alerts');

    if (salesEl) salesEl.textContent = store.formatCurrency(stats.sales);
    if (profitEl) profitEl.textContent = store.formatCurrency(stats.profit);
    if (alertsEl) alertsEl.textContent = alerts;

    // 6. Update Chart
    updateChart(range, stats.data);

    // 7. Update Top Products
    renderTopProducts(topProducts);
}

function updateChart(range, salesData) {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Group data by date
    const grouped = {};
    salesData.forEach(s => {
        const dateKey = new Date(s.date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
        grouped[dateKey] = (grouped[dateKey] || 0) + s.total;
    });

    const labels = Object.keys(grouped);
    const data = Object.values(grouped);

    if (salesChart) {
        salesChart.destroy();
    }

    // Default empty chart if no data
    if (labels.length === 0) {
        // Optional: Show placeholder
    }

    salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventas (S/)',
                data: data,
                backgroundColor: 'rgba(8, 145, 178, 0.6)', // Cyan-600 with opacity
                borderColor: 'rgb(8, 145, 178)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { borderDash: [2, 2] }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function renderTopProducts(products) {
    const container = document.getElementById('top-products-list');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-400 text-center py-4">No hay datos de ventas en este periodo.</p>';
        return;
    }

    // Find max for progress bar
    const maxQty = Math.max(...products.map(p => p.qty)) || 1;

    container.innerHTML = products.map(p => `
        <div class="flex items-center justify-between group">
            <div class="flex-1">
                <div class="flex justify-between text-sm mb-1">
                    <span class="font-medium text-gray-700 truncate w-40" title="${p.name}">${p.name}</span>
                    <span class="text-gray-500 text-xs">${p.qty} und.</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div class="bg-cyan-500 h-1.5 rounded-full" style="width: ${(p.qty / maxQty) * 100}%"></div>
                </div>
            </div>
            <div class="ml-4 text-sm font-bold text-gray-600">
                ${store.formatCurrency(p.total)}
            </div>
        </div>
    `).join('');
}

function populateSalesTable(store) {
    const sales = store.getSales().slice(-5).reverse(); // Last 5 sales
    const tbody = document.getElementById('sales-table-body');
    const emptyState = document.getElementById('empty-state');

    if (!tbody) return;

    if (sales.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    tbody.innerHTML = sales.map(sale => {
        const isRefunded = sale.status === 'refunded';
        const rowClass = isRefunded ? 'bg-red-50 opacity-75' : 'border-b border-gray-100 hover:bg-gray-50 transition-colors';
        const amountClass = isRefunded ? 'text-red-400 line-through' : 'font-bold text-gray-700';

        let badge = '';
        if (isRefunded) {
            badge = `<span class="px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-500">ANULADO</span>`;
        } else {
            const colorClass = (sale.paymentMethod === 'Yape' || sale.paymentMethod === 'Plin') ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600';
            badge = `<span class="px-2 py-1 rounded-full text-xs font-semibold ${colorClass}">${sale.paymentMethod}</span>`;
        }

        return `
        <tr class="${rowClass}">
            <td class="py-3 px-4 font-medium text-gray-900">#${sale.id.toString().padStart(4, '0')}</td>
            <td class="py-3 px-4">${sale.clientName || 'Cliente General'}</td>
            <td class="py-3 px-4 ${amountClass}">${store.formatCurrency(sale.total)}</td>
            <td class="py-3 px-4">${badge}</td>
            <td class="py-3 px-4 text-gray-500 text-xs">${new Date(sale.date).toLocaleTimeString('es-PE')}</td>
        </tr>
    `}).join('');
}
