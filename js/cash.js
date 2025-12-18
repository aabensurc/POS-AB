/**
 * Cash Logic
 */

const store = new Store();
let currentSession = null;

document.addEventListener('DOMContentLoaded', () => {
    initCashView();
});

function initCashView() {
    currentSession = store.getCurrentCashSession();
    const openView = document.getElementById('view-open-session');
    const activeView = document.getElementById('view-active session');
    const badge = document.getElementById('status-badge');

    if (currentSession) {
        // Show Active Session UI
        openView.classList.add('hidden');
        activeView.classList.remove('hidden');

        badge.classList.remove('hidden', 'bg-red-100', 'text-red-700');
        badge.classList.add('bg-green-100', 'text-green-700');
        badge.textContent = 'CAJA ABIERTA';

        updateDashboard();
        renderMovements();
    } else {
        // Show Open Session UI
        activeView.classList.add('hidden');
        openView.classList.remove('hidden');

        badge.classList.remove('hidden', 'bg-green-100', 'text-green-700');
        badge.classList.add('bg-red-100', 'text-red-700');
        badge.textContent = 'CAJA CERRADA';
    }
}

function handleOpenSession(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('initial-amount').value);

    // Validate if user exists (mock auth check context)
    const user = { id: 1, name: 'Admin' }; // In real app use session data

    if (store.openCashSession(user.id, amount)) {
        initCashView();
    } else {
        alert('Error al abrir caja. Quizás ya hay una sesión activa.');
    }
}

function updateDashboard() {
    if (!currentSession) return;

    // Recalculate everything fresh
    // Note: To be super accurate we should probably fetch the session again or have a 'getDetails' method
    // But we'll do it manually here for now using store data
    const db = store.getDB();
    const sessionId = currentSession.id;

    // Sales (Cash only) since open
    const sales = db.sales.filter(s => s.date >= currentSession.openTime && s.paymentMethod === 'Efectivo');
    const totalSales = sales.reduce((acc, s) => acc + s.total, 0);

    // Movements
    const movements = store.getCashMovements(sessionId);
    const totalIn = movements.filter(m => m.type === 'in').reduce((acc, m) => acc + m.amount, 0);
    const totalOut = movements.filter(m => m.type === 'out').reduce((acc, m) => acc + m.amount, 0);

    const expected = currentSession.initialAmount + totalSales + totalIn - totalOut;

    // Update DOM
    document.getElementById('val-initial').textContent = store.formatCurrency(currentSession.initialAmount);
    document.getElementById('val-sales').textContent = store.formatCurrency(totalSales);
    document.getElementById('val-in').textContent = `+ ${store.formatCurrency(totalIn)}`;
    document.getElementById('val-out').textContent = `- ${store.formatCurrency(totalOut)}`;
    document.getElementById('val-expected').textContent = store.formatCurrency(expected);
}

function renderMovements() {
    if (!currentSession) return;
    const movements = store.getCashMovements(currentSession.id).reverse(); // Newest first
    const tbody = document.getElementById('movements-table-body');

    tbody.innerHTML = movements.map(m => {
        const isIn = m.type === 'in';
        const color = isIn ? 'text-green-600' : 'text-red-600';
        const sign = isIn ? '+' : '-';
        const time = new Date(m.date).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-gray-500">${time}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded text-xs font-bold ${isIn ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                        ${isIn ? 'INGRESO' : 'SALIDA'}
                    </span>
                </td>
                <td class="px-6 py-4 text-gray-800">${m.description}</td>
                <td class="px-6 py-4 text-right font-medium ${color}">
                    ${sign} ${store.formatCurrency(m.amount)}
                </td>
            </tr>
        `;
    }).join('');

    if (movements.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-gray-400">Sin movimientos registrados</td></tr>';
    }
}

// --- MODALS ---

function openMovementModal(type) {
    const modal = document.getElementById('movement-modal');
    document.getElementById('movement-type').value = type;
    document.getElementById('movement-title').textContent = type === 'in' ? 'Registrar Ingreso de Dinero' : 'Registrar Salida / Gasto';
    document.getElementById('movement-amount').value = '';
    document.getElementById('movement-desc').value = '';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeMovementModal() {
    const modal = document.getElementById('movement-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function handleMovementSubmit(e) {
    e.preventDefault();
    const type = document.getElementById('movement-type').value;
    const amount = parseFloat(document.getElementById('movement-amount').value);
    const desc = document.getElementById('movement-desc').value;

    if (store.addCashMovement(currentSession.id, type, amount, desc)) {
        closeMovementModal();
        updateDashboard();
        renderMovements();
    }
}

function openCloseModal() {
    const modal = document.getElementById('close-modal');
    // Calculate expected to show in modal
    // Reuse logic from updateDashboard or just grab text content (lazy way but unsafe)
    // Better recalculate:
    const db = store.getDB();
    const sales = db.sales.filter(s => s.date >= currentSession.openTime && s.paymentMethod === 'Efectivo');
    const totalSales = sales.reduce((acc, s) => acc + s.total, 0);
    const movements = store.getCashMovements(currentSession.id);
    const totalIn = movements.filter(m => m.type === 'in').reduce((acc, m) => acc + m.amount, 0);
    const totalOut = movements.filter(m => m.type === 'out').reduce((acc, m) => acc + m.amount, 0);
    const expected = currentSession.initialAmount + totalSales + totalIn - totalOut;

    document.getElementById('close-expected').textContent = store.formatCurrency(expected);
    document.getElementById('close-final-amount').value = '';
    document.getElementById('close-notes').value = '';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeCloseModal() {
    const modal = document.getElementById('close-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function handleCloseSubmit(e) {
    e.preventDefault();
    const finalAmount = parseFloat(document.getElementById('close-final-amount').value);
    const notes = document.getElementById('close-notes').value;

    if (store.closeCashSession(currentSession.id, finalAmount, notes)) {
        alert('Caja cerrada correctamente.');
        closeCloseModal();
        location.reload(); // Refresh to show closed state
    }
}

// Global exposure
window.handleOpenSession = handleOpenSession;
window.handleMovementSubmit = handleMovementSubmit;
window.handleCloseSubmit = handleCloseSubmit;
window.openMovementModal = openMovementModal;
window.closeMovementModal = closeMovementModal;
window.openCloseModal = openCloseModal;
window.closeCloseModal = closeCloseModal;
