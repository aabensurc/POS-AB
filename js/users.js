/**
 * User Management Logic
 */

const store = new Store();
let editingUserId = null;

document.addEventListener('DOMContentLoaded', () => {
    renderUsers();

    document.getElementById('user-form').addEventListener('submit', handleUserSubmit);
});

// Helper to refresh session if we edited the current user
function refreshSessionIfCurrent(userId, userData) {
    const currentUser = window.auth.getUser();
    if (currentUser && currentUser.id === userId) {
        // Update session data
        const newSession = {
            ...currentUser,
            name: userData.name,
            role: userData.role,
            photoUrl: userData.photoUrl
        };
        sessionStorage.setItem(window.auth.sessionKey, JSON.stringify(newSession));
        // Force UI update immediately
        window.auth.checkAuth();
    }
}

function renderUsers() {
    const users = store.getUsers();
    const tbody = document.getElementById('users-table-body');
    const roles = { 'admin': 'Administrador', 'seller': 'Vendedor' };
    const roleColors = { 'admin': 'bg-purple-100 text-purple-800', 'seller': 'bg-blue-100 text-blue-800' };

    tbody.innerHTML = users.map(u => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="py-4 px-6 font-medium text-gray-900">${u.username}</td>
            <td class="py-4 px-6 text-gray-600">${u.name}</td>
            <td class="py-4 px-6 text-gray-400 font-mono">••••••</td>
            <td class="py-4 px-6">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[u.role] || 'bg-gray-100'}">
                    ${roles[u.role] || u.role}
                </span>
            </td>
            <td class="py-4 px-6 text-right space-x-2">
                <button class="text-blue-600 hover:text-blue-900 font-medium text-sm hover:bg-blue-50 px-3 py-1 rounded transition" onclick="editUser(${u.id})">
                    Editar
                </button>
                ${u.username !== 'admin' ? `
                <button class="text-red-600 hover:text-red-900 font-medium text-sm hover:bg-red-50 px-3 py-1 rounded transition" onclick="deleteUser(${u.id})">
                    Eliminar
                </button>` : ''}
            </td>
        </tr>
    `).join('');
}

// --- MODAL ACTIONS ---
function openUserModal() {
    editingUserId = null;
    document.getElementById('modal-title').textContent = 'Nuevo Usuario';
    document.getElementById('user-form').reset();
    document.getElementById('user-image-preview').classList.add('hidden');
    document.getElementById('user-image-preview').src = '';

    document.getElementById('user-modal').classList.remove('hidden');
    document.getElementById('user-modal').classList.add('flex');
}

function closeUserModal() {
    document.getElementById('user-modal').classList.add('hidden');
    document.getElementById('user-modal').classList.remove('flex');
}

function editUser(id) {
    const user = store.getUsers().find(u => u.id === id);
    if (!user) return;

    editingUserId = id;
    document.getElementById('modal-title').textContent = 'Editar Usuario';
    document.getElementById('name').value = user.name;
    document.getElementById('username').value = user.username;
    document.getElementById('password').value = user.password;
    document.getElementById('role').value = user.role;
    document.getElementById('photoUrl').value = user.photoUrl || '';

    if (user.photoUrl) {
        document.getElementById('user-image-preview').src = user.photoUrl;
        document.getElementById('user-image-preview').classList.remove('hidden');
    } else {
        document.getElementById('user-image-preview').classList.add('hidden');
    }

    document.getElementById('user-modal').classList.remove('hidden');
    document.getElementById('user-modal').classList.add('flex');
}

function deleteUser(id) {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
        store.deleteUser(id);
        renderUsers();
    }
}

function handleUserSubmit(e) {
    e.preventDefault();

    const userData = {
        name: document.getElementById('name').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value,
        photoUrl: document.getElementById('photoUrl').value
    };

    if (editingUserId) {
        store.updateUser(editingUserId, userData);
        refreshSessionIfCurrent(editingUserId, userData);
    } else {
        const existing = store.getUsers().find(u => u.username === userData.username);
        if (existing) {
            alert('El nombre de usuario ya existe');
            return;
        }
        store.addUser(userData);
    }

    closeUserModal();
    renderUsers();
    closeUserModal();
}

// Handle File Input Change
document.getElementById('user-image-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const base64 = await Store.processImage(file);
        document.getElementById('photoUrl').value = base64;
        document.getElementById('user-image-preview').src = base64;
        document.getElementById('user-image-preview').classList.remove('hidden');
    } catch (err) {
        console.error('Error processing image:', err);
        alert('Error al procesar la imagen.');
    }
});

// Sync Image URL input to Preview
document.getElementById('photoUrl').addEventListener('input', (e) => {
    const url = e.target.value;
    if (url) {
        document.getElementById('user-image-preview').src = url;
        document.getElementById('user-image-preview').classList.remove('hidden');
    } else {
        document.getElementById('user-image-preview').classList.add('hidden');
    }
});

// Global exposure
window.openUserModal = openUserModal;
window.closeUserModal = closeUserModal;
window.editUser = editUser;
window.deleteUser = deleteUser;
