/**
 * POS Logic
 */

const store = new Store();
let cart = [];
let currentPaymentMethod = 'Efectivo';
let currentClient = null; // Store selected client object

document.addEventListener('DOMContentLoaded', () => {
    loadCart(); // Load saved cart
    renderProducts(store.getProducts());
    renderCategories();
    // Re-render cart if loaded
    if (cart.length > 0) {
        renderCart();
    }
    setupEventListeners();
});

// --- RENDER ---
function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = products.map(p => `
        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group" onclick="addToCart(${p.id})">
            <div class="h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
                <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                <div class="absolute top-2 right-2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-md">
                    S/ ${p.price.toFixed(2)}
                </div>
                ${p.stock <= 10 ? `<div class="absolute bottom-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">Stock: ${p.stock}</div>` : ''}
            </div>
            <h3 class="font-medium text-gray-800 leading-snug line-clamp-2 min-h-[40px]">${p.name}</h3>
            <p class="text-xs text-gray-500 mt-1">${p.code}</p>
        </div>
    `).join('');
}

const CATEGORY_BTN_BASE = 'px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition whitespace-nowrap category-btn';
const CATEGORY_BTN_ACTIVE = 'px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition whitespace-nowrap category-btn shadow-md';

function renderCategories() {
    const categories = [...new Set(store.getProducts().map(p => p.category))];
    const container = document.getElementById('categories-container');

    // Clear but rebuild 'Todos' or just clear and rebuild everything to be safe
    container.innerHTML = '';

    // "Todos" Button
    const allBtn = document.createElement('button');
    allBtn.className = CATEGORY_BTN_ACTIVE; // Default active
    allBtn.textContent = 'Todos';
    allBtn.dataset.cat = 'all';
    allBtn.onclick = (e) => filterByCategory('all', e.target);
    container.appendChild(allBtn);

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = CATEGORY_BTN_BASE;
        btn.textContent = cat;
        btn.dataset.cat = cat;
        btn.onclick = (e) => filterByCategory(cat, e.target);
        container.appendChild(btn);
    });
}

function filterByCategory(category, btnElement) {
    const all = store.getProducts();

    // Visual Update
    document.querySelectorAll('.category-btn').forEach(b => {
        b.className = CATEGORY_BTN_BASE;
    });
    if (btnElement) {
        btnElement.className = CATEGORY_BTN_ACTIVE;
    }

    if (category === 'all') {
        renderProducts(all);
    } else {
        renderProducts(all.filter(p => p.category === category));
    }
}

const CART_STORAGE_KEY = 'pos_cart_data';

function loadCart() {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
        try {
            cart = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading cart', e);
            cart = [];
        }
    }
}

function saveCartToStorage() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function renderCart() {
    const itemsContainer = document.getElementById('cart-items');
    const emptyState = document.getElementById('empty-cart');

    // Check stock live
    const products = store.getProducts();

    if (cart.length === 0) {
        itemsContainer.innerHTML = '';
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
    } else {
        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');

        itemsContainer.innerHTML = cart.map(item => {
            // Find current stock
            const product = products.find(p => p.id === item.id);
            const currentStock = product ? product.stock : 0;
            const maxReached = item.quantity >= currentStock;

            return `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
                <div class="flex-1 min-w-0 pr-2">
                    <h4 class="text-sm font-medium text-gray-800 line-clamp-1" title="${item.name}">${item.name}</h4>
                    <p class="text-xs text-cyan-600 font-bold">S/ ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                
                <div class="flex items-center space-x-2">
                    <div class="flex items-center space-x-3 bg-white rounded-lg p-1 border border-gray-200">
                        <button class="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition" onclick="updateQty(${item.id}, -1)">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                        </button>
                        <span class="text-sm font-bold text-gray-700 w-4 text-center select-none">${item.quantity}</span>
                        <button class="w-6 h-6 flex items-center justify-center ${maxReached ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-cyan-600 hover:bg-cyan-50'} rounded transition" 
                            onclick="updateQty(${item.id}, 1)" ${maxReached ? 'disabled' : ''}>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        </button>
                    </div>
                    
                    <button onclick="removeFromCart(${item.id})" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Eliminar del Carrito">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
        `;
        }).join('');
    }
    updateTotals();
    saveCartToStorage();
}

function updateTotals() {
    const settings = store.getSettings();
    const taxRate = settings.taxRate || 0.18;

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    // Price = Value + IGV
    const value = subtotal / (1 + taxRate);
    const igvCalc = subtotal - value;

    document.getElementById('summary-subtotal').textContent = store.formatCurrency(value);
    document.getElementById('summary-igv').textContent = store.formatCurrency(igvCalc);
    document.getElementById('summary-total').textContent = store.formatCurrency(subtotal);

    // Also update modal total if it exists
    const modalTotal = document.getElementById('modal-total');
    if (modalTotal) {
        modalTotal.textContent = store.formatCurrency(subtotal);
    }
}

// --- ACTIONS ---
function addToCart(productId) {
    const product = store.getProductById(productId);
    if (!product) return;

    // Check Stock
    const existing = cart.find(i => i.id === productId);
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty + 1 > product.stock) {
        alert('Stock insuficiente');
        return;
    }

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    renderCart();
}

function updateQty(productId, change) {
    const itemIndex = cart.findIndex(i => i.id === productId);
    if (itemIndex === -1) return;

    const item = cart[itemIndex];
    const newQty = item.quantity + change;

    // Stock check for additions
    if (change > 0) {
        const product = store.getProductById(productId);
        if (newQty > product.stock) {
            alert('Stock insuficiente');
            return;
        }
    }

    if (newQty <= 0) {
        // Confirm removal if qty goes to 0? Or just remove (standard POS behavior usually just removes)
        cart.splice(itemIndex, 1);
    } else {
        item.quantity = newQty;
    }
    renderCart();
}

function removeFromCart(productId) {
    const itemIndex = cart.findIndex(i => i.id === productId);
    if (itemIndex > -1) {
        cart.splice(itemIndex, 1);
        renderCart();
    }
}

function clearCart() {
    cart = [];
    renderCart();
}

// --- CLIENTS ---
function openClientModal() {
    const modal = document.getElementById('client-modal');
    renderClientList(store.getClients());
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Reset view to list
    if (typeof toggleClientView === 'function') {
        toggleClientView('list');
    }
}

function closeClientModal() {
    const modal = document.getElementById('client-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function toggleClientView(view) {
    const listDiv = document.getElementById('client-view-list');
    const createDiv = document.getElementById('client-view-create');
    const title = document.getElementById('client-modal-title');

    if (view === 'create') {
        listDiv.classList.add('hidden');
        createDiv.classList.remove('hidden');
        title.textContent = 'Nuevo Cliente Rápido';
        // Clear inputs
        document.getElementById('quick-client-name').value = '';
        document.getElementById('quick-client-number').value = '';
        setTimeout(() => document.getElementById('quick-client-name').focus(), 100);
    } else {
        listDiv.classList.remove('hidden');
        createDiv.classList.add('hidden');
        title.textContent = 'Seleccionar Cliente';
        document.getElementById('client-search').focus();
    }
}

function saveQuickClient() {
    const name = document.getElementById('quick-client-name').value.trim();
    const docType = document.getElementById('quick-client-type').value;
    const docNumber = document.getElementById('quick-client-number').value.trim();

    if (!name || !docNumber) {
        alert('Por favor ingrese Nombre y Número de Documento');
        return;
    }

    const newClient = {
        name,
        docType,
        docNumber,
        address: '',
        email: ''
    };

    const saved = store.saveClient(newClient);
    selectClient(saved.id);
}

function renderClientList(clients) {
    const list = document.getElementById('client-list');
    list.innerHTML = clients.map(c => `
        <div class="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-cyan-100 transition flex justify-between items-center group"
            onclick="selectClient(${c.id})">
            <div>
                <p class="font-bold text-gray-800">${c.name}</p>
                <p class="text-xs text-gray-500">${c.docType}: ${c.docNumber}</p>
            </div>
            <div class="text-cyan-600 opacity-0 group-hover:opacity-100 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
        </div>
    `).join('');
}

function selectClient(clientId) {
    const clients = store.getClients();
    const client = clients.find(c => c.id === clientId);
    if (client) {
        currentClient = client; // Set global current client
        document.getElementById('current-client').textContent = client.name;
    }
    closeClientModal();
}

// Global scope
window.addToCart = addToCart;
window.updateQty = updateQty;
window.clearCart = clearCart;
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.processSale = processSale;
window.filterByCategory = filterByCategory;
window.openClientModal = openClientModal;
window.closeClientModal = closeClientModal;
window.selectClient = selectClient;
window.toggleClientView = toggleClientView;
window.saveQuickClient = saveQuickClient;
window.removeFromCart = removeFromCart;

// --- CHECKOUT ---
function openCheckoutModal() {
    if (cart.length === 0) return;

    // Validate Cash Session
    if (!store.getCurrentCashSession()) {
        alert('CAJA CERRADA: Debe abrir una caja para realizar ventas.');
        return;
    }

    document.getElementById('checkout-modal').classList.remove('hidden');
    document.getElementById('checkout-modal').classList.add('flex');
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.add('hidden');
    document.getElementById('checkout-modal').classList.remove('flex');
}

function processSale() {
    // Validate Cash Session
    const session = store.getCurrentCashSession();
    if (!session) {
        alert('CAJA CERRADA: Debe abrir una caja para realizar ventas.');
        // Optional: Redirect to cash page?
        // window.location.href = 'cash.html';
        return;
    }

    const settings = store.getSettings();
    const taxRate = settings.taxRate || 0.18;
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Default client if none selected
    const finalClient = currentClient || { name: 'Cliente General' };

    const saleData = {
        // FIXED: Include name in items so it shows in history/receipt
        items: cart.map(i => ({
            id: i.id,
            quantity: i.quantity,
            price: i.price,
            name: i.name
        })),
        subtotal: total / (1 + taxRate),
        igv: total - (total / (1 + taxRate)),
        total: total,
        taxRate: taxRate,
        client: finalClient,
        clientName: finalClient.name,
        paymentMethod: currentPaymentMethod
    };

    const newSale = store.addSale(saleData); // Capture the new sale object

    // Print Receipt
    printReceipt(newSale);

    clearCart();
    closeCheckoutModal();

    // Reset customer to default
    currentClient = null;
    document.getElementById('current-client').textContent = 'Cliente General';

    renderProducts(store.getProducts());
    // alert('¡Venta realizada con éxito!'); // Optional: Print dialog is enough feedback usually
}

function printReceipt(sale) {
    const settings = store.getSettings();
    document.getElementById('receipt-company').textContent = settings.companyName || 'POS PERÚ';
    document.getElementById('receipt-address').textContent = settings.address || '';
    document.getElementById('receipt-ruc').textContent = `RUC: ${settings.ruc || ''}`;

    document.getElementById('receipt-date').textContent = new Date(sale.date).toLocaleString('es-PE');
    document.getElementById('receipt-ticket').textContent = `#${sale.id}`;
    document.getElementById('receipt-client').textContent = (sale.client && sale.client.name) || sale.clientName || 'General';

    const tbody = document.getElementById('receipt-items');
    tbody.innerHTML = sale.items.map(item => `
        <tr>
            <td class="align-top">${item.quantity}</td>
            <td class="align-top leading-tight">${item.name}</td>
            <td class="text-right align-top">S/ ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    document.getElementById('receipt-total').textContent = `S/ ${sale.total.toFixed(2)}`;
    document.getElementById('receipt-subtotal').textContent = `S/ ${sale.subtotal.toFixed(2)}`;
    document.getElementById('receipt-igv').textContent = `S/ ${sale.igv.toFixed(2)}`;

    // Trigger Print
    setTimeout(() => window.print(), 500);
}

function setupEventListeners() {
    // Search Products
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const all = store.getProducts();
            const filtered = all.filter(p =>
                p.name.toLowerCase().includes(term) ||
                p.code.toLowerCase().includes(term)
            );
            renderProducts(filtered);
        });
    }

    // Client Search
    const clientSearch = document.getElementById('client-search');
    if (clientSearch) {
        clientSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const clients = store.getClients();
            const filtered = clients.filter(c =>
                c.name.toLowerCase().includes(term) ||
                c.docNumber.includes(term)
            );
            renderClientList(filtered);
        });
    }

    // Payment Methods
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.payment-method-btn').forEach(b => b.classList.remove('selected', 'border-cyan-500', 'bg-cyan-50'));
            // Reset others

            // Set active
            btn.classList.add('selected', 'border-cyan-500', 'bg-cyan-50');
            currentPaymentMethod = btn.dataset.method;
        });
    });
}

// Global scope
window.addToCart = addToCart;
window.updateQty = updateQty;
window.clearCart = clearCart;
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.processSale = processSale;
window.filterByCategory = filterByCategory;
window.openClientModal = openClientModal;
window.closeClientModal = closeClientModal;
window.selectClient = selectClient;
