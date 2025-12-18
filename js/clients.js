/**
 * Clients Management Logic
 */

const store = new Store();
let editingClientId = null;

document.addEventListener('DOMContentLoaded', () => {
    renderClients();
    document.getElementById('client-form').addEventListener('submit', handleClientSubmit);

    // Search Listener
    const searchInput = document.getElementById('client-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const allClients = store.getClients();
            const filtered = allClients.filter(c =>
                c.name.toLowerCase().includes(term) ||
                c.docNumber.includes(term)
            );
            renderClients(filtered);
        });
    }
});

function renderClients(clientsToRender = null) {
    const clients = clientsToRender || store.getClients();
    const tbody = document.getElementById('clients-table-body');

    if (clients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-gray-400">No se encontraron clientes</td></tr>';
        return;
    }

    tbody.innerHTML = clients.map(c => `
        <tr class="hover:bg-gray-50 transition-colors group">
            <td class="py-4 px-6 font-medium text-gray-900">${c.name}</td>
            <td class="py-4 px-6">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    ${c.docType}
                </span>
                <span class="ml-2 text-gray-600">${c.docNumber}</span>
            </td>
            <td class="py-4 px-6 text-gray-500 text-sm truncate max-w-[200px]" title="${c.address || ''}">
                ${c.address || '-'}
            </td>
            <td class="py-4 px-6 text-gray-500 text-sm">
                ${c.email || '-'}
            </td>
            <td class="py-4 px-6 text-right space-x-2">
                <button class="text-indigo-600 hover:text-indigo-900 font-medium text-sm hover:underline" onclick="openClientModal(${c.id})">Editar</button>
                <button class="text-red-500 hover:text-red-700 font-medium text-sm hover:underline" onclick="deleteClient(${c.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function openClientModal(id = null) {
    editingClientId = id;
    const modal = document.getElementById('client-modal');
    const title = document.getElementById('client-modal-title');
    const form = document.getElementById('client-form');

    if (id) {
        const clients = store.getClients();
        const client = clients.find(c => c.id === id);
        if (!client) return;

        title.textContent = 'Editar Cliente';
        document.getElementById('name').value = client.name;
        document.getElementById('docType').value = client.docType;
        document.getElementById('docNumber').value = client.docNumber;
        document.getElementById('address').value = client.address;
        document.getElementById('email').value = client.email;
    } else {
        title.textContent = 'Nuevo Cliente';
        form.reset();
        document.getElementById('docType').value = 'DNI';
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeClientModal() {
    const modal = document.getElementById('client-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    editingClientId = null;
}

function handleClientSubmit(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('name').value,
        docType: document.getElementById('docType').value,
        docNumber: document.getElementById('docNumber').value,
        address: document.getElementById('address').value,
        email: document.getElementById('email').value
    };

    if (editingClientId) {
        if (store.updateClient(editingClientId, data)) {
            // Success
        } else {
            alert('Error al actualizar cliente');
        }
    } else {
        store.saveClient(data);
    }

    closeClientModal();
    renderClients();
}

function deleteClient(id) {
    if (confirm('¿Seguro que desea eliminar este cliente?')) {
        if (store.deleteClient(id)) {
            renderClients();
        } else {
            alert('Error al eliminar cliente');
        }
    }
}

// Global exposure
window.openClientModal = openClientModal;
window.closeClientModal = closeClientModal;
window.deleteClient = deleteClient;
window.handleClientSubmit = handleClientSubmit;
