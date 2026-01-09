/**
 * POS Data Store Simulation
 * Handles persistence using localStorage and provides methods for data access.
 */

class Store {
    constructor() {
        this.dbName = 'pos_peru_db';
        this.init();
    }

    init() {
        const db = localStorage.getItem(this.dbName);
        if (!db) {
            this.seed();
        } else {
            // Migration for existing DBs without users
            const parsedDB = JSON.parse(db);
            let flag = false;
            if (!parsedDB.users) {
                parsedDB.users = [
                    { id: 1, name: 'Administrador', username: 'admin', password: '123', role: 'admin' },
                    { id: 2, name: 'Vendedor 1', username: 'vendedor', password: '123', role: 'seller' }
                ];
                flag = true;
            }
            if (!parsedDB.settings) {
                parsedDB.settings = {
                    companyName: 'SMART POS',
                    ruc: '20123456789',
                    address: 'Av. Larco 123, Miraflores',
                    taxRate: 0.18,
                    currencySymbol: 'S/',
                    ticketFooter: '¡Gracias por su preferencia!'
                };
                flag = true;
            }
            if (!parsedDB.categories) {
                parsedDB.categories = [
                    { id: 1, name: 'Bebidas' },
                    { id: 2, name: 'Abarrotes' },
                    { id: 3, name: 'Snacks' },
                    { id: 4, name: 'Lácteos' },
                    { id: 5, name: 'Limpieza' },
                    { id: 6, name: 'Licores' }
                ];
                flag = true;
            }
            if (!parsedDB.cash_sessions) {
                parsedDB.cash_sessions = [];
                flag = true;
            }
            if (!parsedDB.cash_movements) {
                parsedDB.cash_movements = [];
                flag = true;
            }
            if (!parsedDB.providers) {
                parsedDB.providers = [];
                flag = true;
            }
            if (!parsedDB.purchases) {
                parsedDB.purchases = [];
                flag = true;
            }
            if (flag) {
                this.saveDB(parsedDB);
                console.log('Database migrated: Missing tables added.');
            }
        }
    }

    getDB() {
        return JSON.parse(localStorage.getItem(this.dbName)) || {};
    }

    saveDB(data) {
        localStorage.setItem(this.dbName, JSON.stringify(data));
    }

    // --- SEEDING ---
    // --- SEEDING ---
    seed() {
        const initialData = {
            config: {
                currency: 'PEN',
                igvRate: 0.18,
                companyName: 'Mi Bodega Peruana',
                address: 'Av. Larco 123, Miraflores, Lima'
            },
            categories: [
                { id: 1, name: 'Bebidas' },
                { id: 2, name: 'Abarrotes' },
                { id: 3, name: 'Snacks' },
                { id: 4, name: 'Lácteos' },
                { id: 5, name: 'Limpieza' },
                { id: 6, name: 'Licores' }
            ],
            products: [
                { id: 1, code: '001', name: 'Gaseosa Inka Kola 500ml', price: 3.50, stock: 50, cost: 2.00, category: 'Bebidas', image: 'https://via.placeholder.com/150?text=Inka+Kola' },
                { id: 2, code: '002', name: 'Arroz Costeño 1kg', price: 4.80, stock: 100, cost: 3.50, category: 'Abarrotes', image: 'https://via.placeholder.com/150?text=Arroz' },
                { id: 3, code: '003', name: 'Leche Gloria 400g', price: 4.20, stock: 80, cost: 3.20, category: 'Lácteos', image: 'https://via.placeholder.com/150?text=Leche' },
                { id: 4, code: '004', name: 'Galletas Casino Menta', price: 1.00, stock: 200, cost: 0.60, category: 'Snacks', image: 'https://via.placeholder.com/150?text=Casino' },
                { id: 5, code: '005', name: 'Detergente Bolivar 900g', price: 12.50, stock: 30, cost: 9.00, category: 'Limpieza', image: 'https://via.placeholder.com/150?text=Bolivar' },
                { id: 6, code: '006', name: 'Aceite Primor 1L', price: 11.00, stock: 40, cost: 8.50, category: 'Abarrotes', image: 'https://via.placeholder.com/150?text=Aceite' },
                { id: 7, code: '007', name: 'Chocolate Sublime', price: 2.00, stock: 150, cost: 1.20, category: 'Snacks', image: 'https://via.placeholder.com/150?text=Sublime' },
                { id: 8, code: '008', name: 'Cerveza Pilsen Callao 650ml', price: 7.00, stock: 60, cost: 5.00, category: 'Licores', image: 'https://via.placeholder.com/150?text=Pilsen' },
            ],
            clients: [
                { id: 1, docType: 'DNI', docNumber: '40506070', name: 'Juan Perez', address: 'Calle Las Flores 123', email: 'juan@example.com' },
                { id: 2, docType: 'RUC', docNumber: '20100000001', name: 'Empresa Demo SAC', address: 'Av. Principal 456', email: 'contacto@empresa.com' }
            ],
            sales: [],
            cash_sessions: [],
            cash_movements: [],
            providers: [],
            purchases: [],
            users: [
                { id: 1, name: 'Administrador', username: 'admin', password: '123', role: 'admin' },
                { id: 2, name: 'Vendedor 1', username: 'vendedor', password: '123', role: 'seller' }
            ]
        };
        this.saveDB(initialData);
        console.log('Database seeded successfully.');
    }

    // --- CATEGORIES ---
    getCategories() {
        return this.getDB().categories || [];
    }

    addCategory(name) {
        const db = this.getDB();
        if (!db.categories) db.categories = [];
        const newCat = { id: Date.now(), name };
        db.categories.push(newCat);
        this.saveDB(db);
    }

    deleteCategory(id) {
        const db = this.getDB();
        if (!db.categories) return;
        db.categories = db.categories.filter(c => c.id !== id);
        this.saveDB(db);
    }

    // --- PRODUCTS ---
    getProducts() {
        return this.getDB().products;
    }

    // --- HELPER: Image Resizer (Static-like) ---
    static processImage(file, maxWidth = 800, quality = 0.7) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const elem = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    elem.width = width;
                    elem.height = height;
                    const ctx = elem.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(elem.toDataURL(file.type, quality));
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    }

    // Instance wrapper for convenience
    compressImage(file, maxWidth, quality) {
        return Store.processImage(file, maxWidth, quality);
    }

    getProductById(id) {
        return this.getProducts().find(p => p.id === id);
    }

    updateProductStock(id, quantity) {
        const db = this.getDB();
        const productIndex = db.products.findIndex(p => p.id === id);
        if (productIndex !== -1) {
            db.products[productIndex].stock -= quantity;
            this.saveDB(db);
        }
    }

    addProduct(productData) {
        const db = this.getDB();
        const newProduct = {
            id: Date.now(),
            ...productData
        };
        db.products.push(newProduct);
        this.saveDB(db);
        return newProduct;
    }

    updateProduct(id, productData) {
        const db = this.getDB();
        const index = db.products.findIndex(p => p.id === id);
        if (index !== -1) {
            db.products[index] = { ...db.products[index], ...productData };
            this.saveDB(db);
            return true;
        }
        return false;
    }

    deleteProduct(id) {
        const db = this.getDB();
        const initialLen = db.products.length;
        db.products = db.products.filter(p => p.id !== id);
        if (db.products.length !== initialLen) {
            this.saveDB(db);
            return true;
        }
        return false;
    }

    // --- CLIENTS ---
    getClients() {
        return this.getDB().clients;
    }

    saveClient(client) {
        const db = this.getDB();
        client.id = db.clients.length + 1;
        db.clients.push(client);
        this.saveDB(db);
        return client;
    }

    searchClient(term) {
        const clients = this.getClients();
        term = term.toLowerCase();
        return clients.find(c => c.docNumber.includes(term) || c.name.toLowerCase().includes(term));
    }

    updateClient(id, clientData) {
        const db = this.getDB();
        if (!db.clients) return false;
        const index = db.clients.findIndex(c => c.id === id);
        if (index !== -1) {
            db.clients[index] = { ...db.clients[index], ...clientData };
            this.saveDB(db);
            return true;
        }
        return false;
    }

    deleteClient(id) {
        const db = this.getDB();
        if (!db.clients) return false;
        const initialLen = db.clients.length;
        db.clients = db.clients.filter(c => c.id !== id);
        if (db.clients.length !== initialLen) {
            this.saveDB(db);
            return true;
        }
        return false;
    }

    // --- USERS ---
    getUsers() {
        return this.getDB().users || [];
    }

    validateUser(username, password) {
        const users = this.getUsers();
        return users.find(u => u.username === username && u.password === password);
    }

    addUser(userData) {
        const db = this.getDB();
        if (!db.users) db.users = [];

        const newUser = {
            id: Date.now(),
            ...userData
        };
        db.users.push(newUser);
        this.saveDB(db);
        return newUser;
    }

    updateUser(id, userData) {
        const db = this.getDB();
        if (!db.users) return false;

        const index = db.users.findIndex(u => u.id === id);
        if (index !== -1) {
            db.users[index] = { ...db.users[index], ...userData };
            this.saveDB(db);
            return true;
        }
        return false;
    }

    deleteUser(id) {
        const db = this.getDB();
        if (!db.users) return false;

        const initialLen = db.users.length;
        db.users = db.users.filter(u => u.id !== id);

        if (db.users.length !== initialLen) {
            this.saveDB(db);
            return true;
        }
        return false;
    }

    // --- SALES ---
    getSales() {
        return this.getDB().sales;
    }

    addSale(saleData) {
        const db = this.getDB();
        const newSale = {
            id: db.sales.length + 1,
            date: new Date().toISOString(),
            ...saleData
        };

        // Update stock
        newSale.items.forEach(item => {
            this.updateProductStock(item.id, item.quantity);
        });

        db.sales.push(newSale);
        this.saveDB(db);
        return newSale;
    }

    // --- CASH REGISTER (CAJA) ---
    openCashSession(userId, amount) {
        const db = this.getDB();
        // Check if there is already an open session
        const openSession = db.cash_sessions.find(s => s.status === 'open');
        if (openSession) return null; // Already open

        const newSession = {
            id: Date.now(),
            userId: userId,
            openTime: new Date().toISOString(),
            closeTime: null,
            initialAmount: parseFloat(amount),
            finalAmount: 0,
            expectedAmount: 0,
            difference: 0,
            status: 'open',
            notes: ''
        };
        db.cash_sessions.push(newSession);
        this.saveDB(db);
        return newSession;
    }

    getCurrentCashSession() {
        const db = this.getDB();
        if (!db.cash_sessions) return null;
        return db.cash_sessions.find(s => s.status === 'open');
    }

    closeCashSession(id, finalAmount, notes = '') {
        const db = this.getDB();
        const index = db.cash_sessions.findIndex(s => s.id === id);
        if (index !== -1) {
            const session = db.cash_sessions[index];

            // Calculate totals
            const sales = db.sales.filter(s => s.date >= session.openTime && s.paymentMethod === 'Efectivo');
            const totalSales = sales.reduce((acc, s) => acc + s.total, 0);

            const movements = db.cash_movements.filter(m => m.sessionId === id);
            const totalIn = movements.filter(m => m.type === 'in').reduce((acc, m) => acc + m.amount, 0);
            const totalOut = movements.filter(m => m.type === 'out').reduce((acc, m) => acc + m.amount, 0);

            const expected = session.initialAmount + totalSales + totalIn - totalOut;
            const diff = finalAmount - expected;

            db.cash_sessions[index] = {
                ...session,
                closeTime: new Date().toISOString(),
                finalAmount: parseFloat(finalAmount),
                expectedAmount: expected,
                difference: diff,
                status: 'closed',
                notes: notes
            };
            this.saveDB(db);
            return db.cash_sessions[index];
        }
        return null;
    }

    addCashMovement(sessionId, type, amount, description) {
        const db = this.getDB();
        if (!db.cash_movements) db.cash_movements = [];

        const movement = {
            id: Date.now(),
            sessionId: sessionId,
            type: type, // 'in' or 'out'
            amount: parseFloat(amount),
            description: description,
            date: new Date().toISOString()
        };
        db.cash_movements.push(movement);
        this.saveDB(db);
        return movement;
    }

    getCashMovements(sessionId) {
        return this.getDB().cash_movements.filter(m => m.sessionId === sessionId);
    }

    getCashHistory() {
        return this.getDB().cash_sessions.sort((a, b) => new Date(b.openTime) - new Date(a.openTime));
    }

    // --- PROVIDERS ---
    getProviders() {
        return this.getDB().providers || [];
    }

    addProvider(providerData) {
        const db = this.getDB();
        const newProvider = {
            id: Date.now(),
            ...providerData
        };
        if (!db.providers) db.providers = [];
        db.providers.push(newProvider);
        this.saveDB(db);
        return newProvider;
    }

    updateProvider(id, providerData) {
        const db = this.getDB();
        const index = db.providers.findIndex(p => p.id === id);
        if (index !== -1) {
            db.providers[index] = { ...db.providers[index], ...providerData };
            this.saveDB(db);
            return true;
        }
        return false;
    }

    deleteProvider(id) {
        const db = this.getDB();
        db.providers = db.providers.filter(p => p.id !== id);
        this.saveDB(db);
        return true;
    }

    refundSale(id) {
        const db = this.getDB();
        const index = db.sales.findIndex(s => s.id === id);
        if (index === -1) throw new Error("Venta no encontrada");

        const sale = db.sales[index];
        if (sale.status === 'refunded') throw new Error("Esta venta ya fue anulada");

        // 1. Restore Stock
        sale.items.forEach(item => {
            const productIndex = db.products.findIndex(p => p.id === item.id);
            if (productIndex !== -1) {
                // FIXED: quantity vs qty
                const qty = item.quantity || item.qty || 0;
                db.products[productIndex].stock += qty;
            }
        });

        // 2. Register Cash OUT (Devolución)
        if (sale.paymentMethod === 'Efectivo') {
            // Check if there is an active session
            const currentSession = this.getCurrentCashSession();
            if (currentSession) {
                this.addCashMovement(currentSession.id, 'out', sale.total, `Devolución Venta #${sale.id}`);
            } else {
                // Optional: Warn user or just process stock refund?
                // For now just process
            }
        }

        // 3. Mark as refunded
        db.sales[index].status = 'refunded';
        this.saveDB(db);
        return true;
    }

    // --- PURCHASES ---
    getPurchases() {
        return this.getDB().purchases || [];
    }

    addPurchase(purchaseData) {
        const db = this.getDB();
        const newPurchase = {
            id: Date.now(),
            date: new Date().toISOString(),
            status: 'paid', // 'paid' or 'pending'
            ...purchaseData
            // Expected data: providerId, products: [{ id, qty, cost, subtotal }], total
        };

        if (!db.purchases) db.purchases = [];
        db.purchases.push(newPurchase);

        // Update Stock and Cost
        newPurchase.products.forEach(item => {
            const pIndex = db.products.findIndex(p => p.id === item.id);
            if (pIndex !== -1) {
                // Update Stock
                db.products[pIndex].stock += parseInt(item.qty);
                // Update Cost (using the new purchase cost as the new standard cost, or average? User said "specifying the Cost Price". Usually simpler to just update current cost)
                db.products[pIndex].cost = parseFloat(item.cost);
            }
        });

        this.saveDB(db);
        return newPurchase;
    }

    getPendingPurchases() {
        return this.getPurchases().filter(p => p.status === 'pending');
    }

    updatePurchaseStatus(id, status) {
        const db = this.getDB();
        const index = db.purchases.findIndex(p => p.id === id);
        if (index !== -1) {
            db.purchases[index].status = status;

            // If paying debt, register cash OUT? 
            // For now, simple status update as requested. 
            // Ideally should check for cash session, but that might be feature creep.

            this.saveDB(db);
            return true;
        }
        return false;
    }

    // --- REPORTS ---
    // --- REPORTS & DASHBOARD ---

    // Filter sales by range: 'today', 'week', 'month'
    getSalesByRange(range) {
        const sales = this.getSales().filter(s => s.status !== 'refunded');
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (range === 'today') {
            return sales.filter(s => new Date(s.date) >= startOfDay);
        } else if (range === 'week') {
            const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))); // Adjust for Mon start
            firstDayOfWeek.setHours(0, 0, 0, 0);
            return sales.filter(s => new Date(s.date) >= firstDayOfWeek);
        } else if (range === 'month') {
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return sales.filter(s => new Date(s.date) >= firstDayOfMonth);
        }
        return sales;
    }

    getDashboardStats(range = 'today') {
        const sales = this.getSalesByRange(range);

        let totalSales = 0;
        let totalProfit = 0;

        sales.forEach(sale => {
            totalSales += sale.total;

            // Calculate Profit
            const saleCost = sale.items.reduce((costAcc, item) => {
                const product = this.getProducts().find(p => p.id === item.id);
                // Use current cost if historical cost not saved (simplified)
                const cost = item.cost || (product ? product.cost : 0);
                return costAcc + (cost * (item.quantity || item.qty));
            }, 0);
            totalProfit += (sale.total - saleCost);
        });

        return {
            sales: totalSales,
            profit: totalProfit,
            count: sales.length,
            data: sales // Raw data for charts
        };
    }

    getTopProducts(range = 'today', limit = 5) {
        const sales = this.getSalesByRange(range);
        const productStats = {};

        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productStats[item.id]) {
                    productStats[item.id] = {
                        id: item.id,
                        name: item.name || 'Unknown',
                        qty: 0,
                        total: 0
                    };
                }
                const qty = item.quantity || item.qty || 0;
                productStats[item.id].qty += qty;
                productStats[item.id].total += (item.price * qty);
                // Fix name if missing
                if (productStats[item.id].name === 'Unknown') {
                    const p = this.getProductById(item.id);
                    if (p) productStats[item.id].name = p.name;
                }
            });
        });

        return Object.values(productStats)
            .sort((a, b) => b.qty - a.qty) // Sort by Quantity Sold
            .slice(0, limit);
    }

    // --- SETTINGS ---
    getSettings() {
        const db = this.getDB();
        // Return defaults if not present (for backward compatibility)
        return db.settings || {
            companyName: 'SMART POS',
            ruc: '20123456789',
            address: 'Av. Larco 123, Miraflores',
            taxRate: 0.18,
            currencySymbol: 'S/',
            ticketFooter: '¡Gracias por su preferencia!'
        };
    }

    saveSettings(newSettings) {
        const db = this.getDB();
        db.settings = { ...this.getSettings(), ...newSettings };
        this.saveDB(db);
        return db.settings;
    }

    // --- UTILS ---
    formatCurrency(amount) {
        return `S/ ${amount.toFixed(2)}`;
    }
}

// Export global instance
window.Store = Store;
