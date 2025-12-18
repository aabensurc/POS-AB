/**
 * Purchases & Providers Logic
 */

const store = new Store();
let currentView = 'purchases';
let purchaseItems = []; // Array of { id, name, qty, cost, subtotal }

document.addEventListener('DOMContentLoaded', () => {
    switchTab('purchases');
    renderProvidersTable(); // Pre-load
});

function switchTab(tab) {
    currentView = tab;

    // UI Toggles
    ['purchases', 'new-purchase', 'providers', 'payable'].forEach(v => {
        document.getElementById(`view-${v}`).classList.add('hidden');
    });
    document.getElementById(`view-${tab}`).classList.remove('hidden');

    // Tab Styles
    ['purchases', 'providers', 'payable'].forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        if (el) {
            if (t === tab || (tab === 'new-purchase' && t === 'purchases')) {
                el.classList.add('border-cyan-600', 'text-cyan-600');
                el.classList.remove('border-transparent');
            } else {
                el.classList.remove('border-cyan-600', 'text-cyan-600');
                el.classList.add('border-transparent');
            }
        }
    });

    // Load Data
    if (tab === 'purchases') renderPurchasesTable();
    if (tab === 'providers') renderProvidersTable();
    if (tab === 'payable') renderPayableTable();
    if (tab === 'new-purchase') renderProviderOptions();
}

function showNewPurchase() {
    purchaseItems = [];
    renderPurchaseItems();
    switchTab('new-purchase');
}

// --- PROVIDERS ---

function renderProvidersTable() {
    const providers = store.getProviders();
    const tbody = document.getElementById('providers-table-body');
    if (!tbody) return;

    if (providers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-gray-400">No hay proveedores registrados.</td></tr>';
        return;
    }

    tbody.innerHTML = providers.map(p => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 font-medium text-gray-900">${p.name}</td>
            <td class="px-6 py-4 text-gray-500">${p.ruc}</td>
            <td class="px-6 py-4 text-gray-500">${p.phone || '-'}</td>
            <td class="px-6 py-4 text-gray-500">${p.contact || '-'}</td>
            <td class="px-6 py-4 text-right space-x-2">
                <button onclick="editProvider(${p.id})" class="text-indigo-600 hover:text-indigo-900">Editar</button>
                <button onclick="deleteProvider(${p.id})" class="text-red-500 hover:text-red-700">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function openProviderModal(id = null) {
    const modal = document.getElementById('provider-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    const form = document.getElementById('provider-id').parentNode; // hacky way to get form or just reset values manually

    if (id) {
        const p = store.getProviders().find(x => x.id === id);
        document.getElementById('provider-id').value = p.id;
        document.getElementById('prov-name').value = p.name;
        document.getElementById('prov-ruc').value = p.ruc;
        document.getElementById('prov-phone').value = p.phone;
        document.getElementById('prov-contact').value = p.contact;
        document.getElementById('provider-modal-title').textContent = 'Editar Proveedor';
    } else {
        document.getElementById('provider-id').value = '';
        document.getElementById('prov-name').value = '';
        document.getElementById('prov-ruc').value = '';
        document.getElementById('prov-phone').value = '';
        document.getElementById('prov-contact').value = '';
        document.getElementById('provider-modal-title').textContent = 'Nuevo Proveedor';
    }
}

function closeProviderModal() {
    const modal = document.getElementById('provider-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function handleProviderSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('provider-id').value;
    const data = {
        name: document.getElementById('prov-name').value,
        ruc: document.getElementById('prov-ruc').value,
        phone: document.getElementById('prov-phone').value,
        contact: document.getElementById('prov-contact').value
    };

    if (id) {
        store.updateProvider(parseInt(id), data);
    } else {
        store.addProvider(data);
    }
    closeProviderModal();
    renderProvidersTable();
    // If in new purchase view, refresh selector
    if (currentView === 'new-purchase') renderProviderOptions();
}

function editProvider(id) {
    openProviderModal(id);
}

function deleteProvider(id) {
    if (confirm('¿Seguro?')) {
        store.deleteProvider(id);
        renderProvidersTable();
    }
}

// --- PURCHASES ---

function renderPurchasesTable() {
    const purchases = store.getPurchases().reverse();
    const tbody = document.getElementById('purchases-table-body');
    const providers = store.getProviders();

    if (purchases.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-gray-400">No hay compras registradas.</td></tr>';
        return;
    }

    tbody.innerHTML = purchases.map(p => {
        const prov = providers.find(x => x.id == p.providerId)?.name || 'Desconocido';
        const date = new Date(p.date).toLocaleDateString('es-PE');
        const statusClass = p.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
        const statusText = p.status === 'paid' ? 'PAGADO' : 'PENDIENTE';

        return `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-gray-900">${date}</td>
            <td class="px-6 py-4 text-gray-500 font-medium">${prov}</td>
            <td class="px-6 py-4 text-gray-500">${p.docType} ${p.docNumber}</td>
            <td class="px-6 py-4 text-center">
                <span class="px-2 py-1 rounded text-xs font-bold ${statusClass}">${statusText}</span>
            </td>
            <td class="px-6 py-4 text-right font-medium text-gray-900">S/ ${p.total.toFixed(2)}</td>
            <td class="px-6 py-4 text-right">
                <button onclick="viewDetails(${p.id})" class="text-cyan-600 hover:text-cyan-800 text-sm">Ver Detalles</button>
            </td>
        </tr>
        `;
    }).join('');
}

function renderPayableTable() {
    const pending = store.getPendingPurchases();
    const tbody = document.getElementById('payable-table-body');
    const providers = store.getProviders();
    const emptyMsg = document.getElementById('no-payable-msg');

    if (pending.length === 0) {
        tbody.innerHTML = '';
        emptyMsg.classList.remove('hidden');
        return;
    }
    emptyMsg.classList.add('hidden');

    tbody.innerHTML = pending.map(p => {
        const prov = providers.find(x => x.id == p.providerId)?.name || 'Desconocido';
        // Mock due date = date + 30 days
        const dueDate = new Date(new Date(p.date).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-PE');

        return `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-red-600 font-bold">${dueDate}</td>
            <td class="px-6 py-4 text-gray-900 font-medium">${prov}</td>
            <td class="px-6 py-4 text-right font-bold text-gray-900">S/ ${p.total.toFixed(2)}</td>
            <td class="px-6 py-4 text-right">
                <button onclick="payDebt(${p.id})" class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-500 shadow">Pagar Deuda</button>
            </td>
        </tr>
        `;
    }).join('');
}

function payDebt(id) {
    if (confirm('¿Confirmar el pago de esta deuda? El estado cambiará a PAGADO.')) {
        store.updatePurchaseStatus(id, 'paid');
        renderPayableTable();
        alert('Deuda pagada correctamente.');
    }
}

function viewDetails(id) {
    const purchase = store.getPurchases().find(p => p.id === id);
    if (!purchase) return;

    const modal = document.getElementById('purchase-details-modal');
    const subtitle = document.getElementById('details-subtitle');
    const tbody = document.getElementById('details-table-body');
    const totalEl = document.getElementById('details-total');
    const providers = store.getProviders();

    const provName = providers.find(p => p.id == purchase.providerId)?.name || 'Desconocido';
    const date = new Date(purchase.date).toLocaleDateString('es-PE') + ' ' + new Date(purchase.date).toLocaleTimeString('es-PE');

    subtitle.textContent = `Proveedor: ${provName} | Fecha: ${date} | Doc: ${purchase.docType} ${purchase.docNumber}`;

    tbody.innerHTML = purchase.products.map(item => `
        <tr>
            <td class="px-6 py-3 font-medium text-gray-800">${item.name}</td>
            <td class="px-6 py-3 text-center text-gray-600">${item.qty}</td>
            <td class="px-6 py-3 text-right text-gray-600">S/ ${parseFloat(item.cost).toFixed(2)}</td>
            <td class="px-6 py-3 text-right font-medium text-cyan-700">S/ ${item.subtotal.toFixed(2)}</td>
        </tr>
    `).join('');

    totalEl.textContent = `S/ ${purchase.total.toFixed(2)}`;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeDetailsModal() {
    const modal = document.getElementById('purchase-details-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// --- NEW PURCHASE LOGIC ---

function renderProviderOptions() {
    const providers = store.getProviders();
    const select = document.getElementById('new-purchase-provider');
    select.innerHTML = providers.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

function handleProductSearchInPurchase(term) {
    const resultsDiv = document.getElementById('product-search-results');
    if (term.length < 2) {
        resultsDiv.classList.add('hidden');
        return;
    }

    const products = store.getProducts();
    const matches = products.filter(p => p.name.toLowerCase().includes(term.toLowerCase()) || p.code.includes(term));

    if (matches.length > 0) {
        resultsDiv.innerHTML = matches.map(p => `
            <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between" onclick="selectProductForPurchase(${p.id})">
                <div>
                    <span class="font-bold text-gray-800">${p.name}</span>
                    <span class="text-xs text-gray-500 ml-2">Stock: ${p.stock}</span>
                </div>
                <div class="text-sm text-gray-600">Costo Actual: S/ ${p.cost}</div>
            </div>
        `).join('');
        resultsDiv.classList.remove('hidden');
    } else {
        resultsDiv.classList.add('hidden');
    }
}

function selectProductForPurchase(id) {
    const product = store.getProductById(id);
    document.getElementById('product-search-results').classList.add('hidden');
    document.getElementById('product-search-input').value = '';

    // Check if added
    const existing = purchaseItems.find(i => i.id === id);
    if (!existing) {
        purchaseItems.push({
            id: product.id,
            name: product.name,
            qty: 1,
            cost: product.cost, // Default to current cost
            subtotal: product.cost
        });
        renderPurchaseItems();
    }
}

function updateItem(id, field, value) {
    const item = purchaseItems.find(i => i.id === id);
    if (item) {
        if (field === 'qty') item.qty = parseInt(value) || 0;
        if (field === 'cost') item.cost = parseFloat(value) || 0;
        item.subtotal = item.qty * item.cost;
        renderPurchaseItems();
    }
}

function removeItem(id) {
    purchaseItems = purchaseItems.filter(i => i.id !== id);
    renderPurchaseItems();
}

function renderPurchaseItems() {
    const tbody = document.getElementById('purchase-items-body');
    const noItems = document.getElementById('no-items-msg');
    const grandTotalEl = document.getElementById('new-purchase-grand-total');

    if (purchaseItems.length === 0) {
        tbody.innerHTML = '';
        noItems.classList.remove('hidden');
        grandTotalEl.textContent = 'S/ 0.00';
        return;
    }
    noItems.classList.add('hidden');

    let total = 0;

    tbody.innerHTML = purchaseItems.map(item => {
        total += item.subtotal;
        return `
        <tr>
            <td class="px-4 py-3 font-medium text-gray-700">${item.name}</td>
            <td class="px-4 py-3">
                <input type="number" value="${item.qty}" min="1" 
                    class="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    onchange="updateItem(${item.id}, 'qty', this.value)">
            </td>
            <td class="px-4 py-3">
                <input type="number" value="${item.cost}" step="0.01" 
                    class="w-full px-2 py-1 border border-gray-200 rounded text-center"
                    onchange="updateItem(${item.id}, 'cost', this.value)">
            </td>
            <td class="px-4 py-3 text-right font-medium">S/ ${item.subtotal.toFixed(2)}</td>
            <td class="px-4 py-3 text-center">
                <button onclick="removeItem(${item.id})" class="text-red-400 hover:text-red-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </td>
        </tr>
        `;
    }).join('');

    grandTotalEl.textContent = `S/ ${total.toFixed(2)}`;
}

function submitPurchase() {
    if (purchaseItems.length === 0) {
        alert('Agrega al menos un producto.');
        return;
    }

    const providerId = document.getElementById('new-purchase-provider').value;
    if (!providerId) {
        alert('Selecciona un proveedor. Si no tienes, crea uno primero.');
        return;
    }

    const data = {
        providerId: parseInt(providerId),
        docType: document.getElementById('new-purchase-doc-type').value,
        docNumber: document.getElementById('new-purchase-doc-num').value,
        status: document.getElementById('new-purchase-status').value,
        products: purchaseItems,
        total: purchaseItems.reduce((acc, i) => acc + i.subtotal, 0)
    };

    store.addPurchase(data);
    alert('Compra registrada correctamente. Inventario actualizado.');

    // Reset and Go to History
    purchaseItems = [];
    switchTab('purchases');
}

// Export specific functions to global scope so onclick works
window.switchTab = switchTab;
window.showNewPurchase = showNewPurchase;
window.handleProductSearchInPurchase = handleProductSearchInPurchase;
window.selectProductForPurchase = selectProductForPurchase;
window.updateItem = updateItem;
window.removeItem = removeItem;
window.submitPurchase = submitPurchase;
window.openProviderModal = openProviderModal;
window.closeProviderModal = closeProviderModal;
window.handleProviderSubmit = handleProviderSubmit;
window.editProvider = editProvider;
window.deleteProvider = deleteProvider;
window.payDebt = payDebt;
window.viewDetails = viewDetails;
window.closeDetailsModal = closeDetailsModal;
