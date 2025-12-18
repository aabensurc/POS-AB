/**
 * Inventory Logic
 */

const store = new Store();
let currentEditingId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initial Render
    renderInventory();

    // Form Listener
    const form = document.getElementById('product-form');
    if (form) {
        form.addEventListener('submit', handleProductSubmit);
    }

    // Image Upload Listeners
    const fileInput = document.getElementById('prod-image-file');
    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const base64 = await Store.processImage(file);
                document.getElementById('prod-image-url').value = base64; // Use URL field as fallback storage
                document.getElementById('prod-image-preview').src = base64;
                document.getElementById('prod-image-preview').classList.remove('hidden');
            } catch (err) {
                console.error(err);
                alert('Error al procesar imagen');
            }
        });
    }

    const urlInput = document.getElementById('prod-image-url');
    if (urlInput) {
        urlInput.addEventListener('input', (e) => {
            const url = e.target.value;
            if (url) {
                document.getElementById('prod-image-preview').src = url;
                document.getElementById('prod-image-preview').classList.remove('hidden');
            } else {
                document.getElementById('prod-image-preview').classList.add('hidden');
            }
        });
    }

    // Search Listener
    const searchInput = document.getElementById('inventory-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const allProducts = store.getProducts();
            const filtered = allProducts.filter(p =>
                p.name.toLowerCase().includes(term) ||
                p.code.toLowerCase().includes(term) ||
                p.category.toLowerCase().includes(term)
            );
            renderInventory(filtered);
        });
    }
});

function renderInventory(productsToRender = null) {
    const products = productsToRender || store.getProducts();
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-gray-400">No se encontraron productos</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(p => `
        <tr class="hover:bg-gray-50 transition-colors group">
            <td class="py-4 px-6">
                <div class="flex items-center">
                    <img class="h-10 w-10 rounded-lg object-cover mr-3 bg-gray-200" src="${p.image || 'https://via.placeholder.com/150'}" alt="">
                    <div>
                        <div class="font-medium text-gray-900">${p.name}</div>
                        <div class="text-xs text-gray-500">${p.code}</div>
                    </div>
                </div>
            </td>
            <td class="py-4 px-6 text-gray-500">${p.category}</td>
            <td class="py-4 px-6 text-gray-500">S/ ${p.cost.toFixed(2)}</td>
            <td class="py-4 px-6 font-medium text-gray-900">S/ ${p.price.toFixed(2)}</td>
            <td class="py-4 px-6 text-center">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${p.stock <= 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                    ${p.stock} Uds
                </span>
            </td>
            <td class="py-4 px-6 text-right space-x-2">
                <button class="text-gray-500 hover:text-cyan-600 font-medium text-sm p-1 rounded transition" title="Editar" onclick="openProductModal(${p.id})">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button>
                <button class="text-cyan-600 hover:text-cyan-900 font-medium text-sm hover:bg-cyan-50 px-3 py-1 rounded transition" onclick="openStockModal(${p.id})">
                    Ajustar Stock
                </button>
            </td>
        </tr>
    `).join('');
}

// --- PRODUCT MODAL ---
function openProductModal(id = null) {
    currentEditingId = id;
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('product-modal-title');

    // Populate Categories
    const catSelect = document.getElementById('prod-category');
    const categories = store.getCategories();
    catSelect.innerHTML = categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

    if (id) {
        const p = store.getProductById(id);
        if (!p) return;
        title.textContent = 'Editar Producto';
        document.getElementById('prod-name').value = p.name;
        document.getElementById('prod-code').value = p.code;
        document.getElementById('prod-category').value = p.category;
        document.getElementById('prod-stock').value = p.stock;
        document.getElementById('prod-cost').value = p.cost;
        document.getElementById('prod-price').value = p.price;
        document.getElementById('prod-image-url').value = p.image || '';

        if (p.image) {
            document.getElementById('prod-image-preview').src = p.image;
            document.getElementById('prod-image-preview').classList.remove('hidden');
        } else {
            document.getElementById('prod-image-preview').classList.add('hidden');
        }
    } else {
        title.textContent = 'Nuevo Producto';
        form.reset();
        document.getElementById('prod-image-preview').classList.add('hidden');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    currentEditingId = null;
}

function handleProductSubmit(e) {
    e.preventDefault();
    const productData = {
        name: document.getElementById('prod-name').value,
        code: document.getElementById('prod-code').value,
        category: document.getElementById('prod-category').value,
        stock: parseInt(document.getElementById('prod-stock').value) || 0,
        cost: parseFloat(document.getElementById('prod-cost').value) || 0,
        price: parseFloat(document.getElementById('prod-price').value) || 0,
        image: document.getElementById('prod-image-url').value
    };

    if (currentEditingId) {
        store.updateProduct(currentEditingId, productData);
    } else {
        store.addProduct(productData);
    }

    closeProductModal();
    renderInventory();
}

// --- STOCK MODAL (Simple) ---
function openStockModal(id) {
    const product = store.getProductById(id);
    if (!product) return;

    currentEditingId = id; // Reuse same var or use a different one if conflict? 
    // Actually currentEditingId is used by handleProductSubmit. If we use it here, we must clear it on close.
    // Ideally use a separate ID for stock modal to avoid confusion, but for now it's fine if we are careful.

    // Let's use a specific var for stock to be safe, or just reuse carefully.
    // The previous implementation used currentEditingId. Check saveStock.

    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-stock-input').value = product.stock;

    const modal = document.getElementById('stock-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeStockModal() {
    const modal = document.getElementById('stock-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    currentEditingId = null;
}

function updateModalStock(change) {
    const input = document.getElementById('modal-stock-input');
    let val = parseInt(input.value) || 0;
    val += change;
    if (val < 0) val = 0;
    input.value = val;
}

function saveStock() {
    // Note: currentEditingId is shared. Verify it points to the product we opened stock for.
    if (!currentEditingId) return;

    const newStock = parseInt(document.getElementById('modal-stock-input').value) || 0;
    const db = store.getDB();
    const pIndex = db.products.findIndex(p => p.id === currentEditingId);

    if (pIndex !== -1) {
        db.products[pIndex].stock = newStock;
        store.saveDB(db);
        renderInventory();
        closeStockModal();
    }
}

// Global exposure
window.openStockModal = openStockModal;
window.closeStockModal = closeStockModal;
window.updateModalStock = updateModalStock;
window.saveStock = saveStock;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
