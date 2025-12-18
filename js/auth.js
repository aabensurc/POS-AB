/**
 * Auth Service
 * Handles login, logout, session persistence, and route protection.
 */

class Auth {
    constructor() {
        this.store = new Store();
        this.sessionKey = 'pos_session_user';
    }

    login(username, password) {
        const user = this.store.validateUser(username, password);
        if (user) {
            // Simple session storage (INSECURE for production, OK for demo)
            const sessionData = {
                id: user.id,
                name: user.name,
                role: user.role,
                photoUrl: user.photoUrl,
                loginTime: new Date().toISOString()
            };
            sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
            return true;
        }
        return false;
    }

    logout() {
        sessionStorage.removeItem(this.sessionKey);
        window.location.href = 'login.html';
    }

    getUser() {
        const data = sessionStorage.getItem(this.sessionKey);
        return data ? JSON.parse(data) : null;
    }

    isAuthenticated() {
        return !!this.getUser();
    }

    // Middleware-like check
    checkAuth() {
        const user = this.getUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Update UI with user info if element exists
        const userDisplay = document.querySelector('.user-display-name'); // Legacy selector?
        // Better selector based on IDs in sidebar
        const userNameEl = document.getElementById('user-name');
        const userEmailEl = document.getElementById('user-email');
        const userAvatarInitial = document.getElementById('user-avatar-initial');

        if (userNameEl) userNameEl.textContent = user.name;
        if (userEmailEl) userEmailEl.textContent = `${user.username}@posperu.com`; // Mock email

        if (userAvatarInitial) {
            if (user.photoUrl) {
                // Replace initial with Image
                userAvatarInitial.innerHTML = `<img src="${user.photoUrl}" class="w-full h-full object-cover" />`;
                userAvatarInitial.classList.add('overflow-hidden'); // Ensure img stays round
                userAvatarInitial.classList.remove('bg-cyan-500', 'text-white'); // Remove bg if transparent PNG (optional)
            } else {
                // Show Initial
                userAvatarInitial.textContent = user.name.charAt(0).toUpperCase();
            }
        }

        const roleDisplay = document.querySelector('.user-display-role');
        if (roleDisplay) {
            // Translate role
            const roles = { 'admin': 'Administrador', 'seller': 'Vendedor' };
            roleDisplay.textContent = roles[user.role] || user.role;
        }

        // Role based protection
        // If on users.html and not admin, kick out
        if (window.location.pathname.includes('users.html') && user.role !== 'admin') {
            alert('Acceso restringido: Solo Administradores');
            window.location.href = 'index.html';
        }

        // Show/Hide Admin links
        if (user.role !== 'admin') {
            document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
        } else {
            document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
        }
    }
}

// Global instance
window.auth = new Auth();
