const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const usersController = require('../controllers/users.controller');
const invController = require('../controllers/inventory.controller');
const salesController = require('../controllers/sales.controller');
const clientsController = require('../controllers/clients.controller');
const cashController = require('../controllers/cash.controller');
const purchasesController = require('../controllers/purchases.controller');
const settingsController = require('../controllers/settings.controller');
const dashboardController = require('../controllers/dashboard.controller');

const verifyToken = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/role.middleware');

// --- Auth (Public) ---
router.post('/auth/login', authController.login);
router.get('/auth/me', verifyToken, authController.getMe); // Now protected

// --- Protected Routes (All Require Login) ---
router.use(verifyToken);

// --- Dashboard ---
router.get('/dashboard', dashboardController.getDashboardStats);

// --- Settings (Admin Only) ---
router.get('/settings', isAdmin, settingsController.getSettings); // Read Config - Maybe allowed for all? Let's restrict edits mostly
router.put('/settings', isAdmin, settingsController.updateSettings);
router.get('/settings/backup', isAdmin, settingsController.downloadBackup);
router.post('/settings/reset', isAdmin, settingsController.resetTransactionalData);

// --- Users (Admin Only) ---
router.get('/users', isAdmin, usersController.getUsers);
router.post('/users', isAdmin, usersController.createUser);
router.put('/users/:id', isAdmin, usersController.updateUser);
router.delete('/users/:id', isAdmin, usersController.deleteUser);

// --- Inventory (Products) ---
// Everyone can READ products (for POS)
router.get('/products', invController.getProducts);
router.get('/products/:id', invController.getProduct);
// Only Admin can EDIT products
router.post('/products', isAdmin, invController.createProduct);
router.put('/products/:id', isAdmin, invController.updateProduct);
router.delete('/products/:id', isAdmin, invController.deleteProduct);

// --- Inventory (Categories) (Admin Only for Management, Read Public?) ---
router.get('/categories', invController.getCategories); // Read allowed for filters
router.post('/categories', isAdmin, invController.createCategory);
router.delete('/categories/:id', isAdmin, invController.deleteCategory);

// --- Clients (Mixed) ---
router.get('/clients', clientsController.getClients);
router.post('/clients', clientsController.createClient);
router.put('/clients/:id', clientsController.updateClient); // Sellers can update clients? Usually yes.
router.delete('/clients/:id', isAdmin, clientsController.deleteClient); // Only admin deletes

// --- Cash (Sellers need this) ---
router.get('/cash/status', cashController.getStatus);
router.post('/cash/open', cashController.openSession);
router.post('/cash/close', cashController.closeSession);
router.post('/cash/movement', cashController.addMovement);
router.get('/cash/history', isAdmin, cashController.getHistory);

// --- Providers (Admin/Inventory Manager) ---
router.get('/providers', purchasesController.getProviders);
router.post('/providers', isAdmin, purchasesController.createProvider);
router.put('/providers/:id', isAdmin, purchasesController.updateProvider);
router.delete('/providers/:id', isAdmin, purchasesController.deleteProvider);

// --- Purchases (Admin Only - Usually Stock Entry is sensitive) ---
router.get('/purchases', isAdmin, purchasesController.getPurchases);
router.post('/purchases', isAdmin, purchasesController.createPurchase);

// --- Sales (Sellers Core) ---
router.post('/sales', salesController.createSale);
router.get('/sales', salesController.getSales); // History - Sellers see their own? Or all? Let's allow all for now
router.get('/sales/stats', salesController.getStats);
router.post('/sales/:id/refund', isAdmin, salesController.refundSale); // Only Admin refunds? Or authorized seller? Let's restrict Refund to Admin for security.

module.exports = router;
