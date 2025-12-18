/**
 * Categories Logic
 */

const store = new Store();

document.addEventListener('DOMContentLoaded', () => {
    renderCategories();

    // Allow Enter key to add
    document.getElementById('new-category-name').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') addCategory();
    });
});

function renderCategories() {
    const categories = store.getCategories();
    const list = document.getElementById('categories-list');

    if (categories.length === 0) {
        list.innerHTML = '<li class="text-gray-400 text-center py-4">No hay categorías.</li>';
        return;
    }

    list.innerHTML = categories.map(c => `
        <li class="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition">
            <span class="font-medium text-gray-700">${c.name}</span>
            <button onclick="deleteCategory(${c.id})" class="text-gray-400 hover:text-red-500 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
        </li>
    `).join('');
}

function addCategory() {
    const input = document.getElementById('new-category-name');
    const name = input.value.trim();
    if (!name) return;

    store.addCategory(name);
    input.value = '';
    renderCategories();
}

function deleteCategory(id) {
    if (confirm('¿Eliminar esta categoría?')) {
        store.deleteCategory(id);
        renderCategories();
    }
}

window.addCategory = addCategory;
window.deleteCategory = deleteCategory;
