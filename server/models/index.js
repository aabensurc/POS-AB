const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// --- Company (Tenant) ---
const Company = sequelize.define('Company', {
    name: { type: DataTypes.STRING, allowNull: false },
    ruc: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    plan: { type: DataTypes.ENUM('free', 'pro', 'enterprise'), defaultValue: 'free' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// --- User ---
const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, unique: false, allowNull: false }, // unique false because multiple companies can have 'admin'
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('admin', 'seller', 'superadmin'), defaultValue: 'seller' },
    photoUrl: { type: DataTypes.TEXT },
    companyId: { type: DataTypes.INTEGER }
});

// --- Settings ---
const Settings = sequelize.define('Settings', {
    companyName: { type: DataTypes.STRING, defaultValue: 'POS PERÚ' },
    ruc: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    taxRate: { type: DataTypes.FLOAT, defaultValue: 0.18 },
    currencySymbol: { type: DataTypes.STRING, defaultValue: 'S/' },
    ticketFooter: { type: DataTypes.STRING },
    logoUrl: { type: DataTypes.TEXT },
    companyId: { type: DataTypes.INTEGER }
});

// --- Category ---
const Category = sequelize.define('Category', {
    name: { type: DataTypes.STRING, allowNull: false },
    companyId: { type: DataTypes.INTEGER }
});

// --- Product ---
const Product = sequelize.define('Product', {
    code: { type: DataTypes.STRING }, // removed global unique
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, defaultValue: 0 },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    cost: { type: DataTypes.FLOAT, defaultValue: 0 },
    image: { type: DataTypes.TEXT },
    categoryId: { type: DataTypes.INTEGER },
    companyId: { type: DataTypes.INTEGER }
});

// --- Client ---
const Client = sequelize.define('Client', {
    docType: { type: DataTypes.STRING, defaultValue: 'DNI' },
    docNumber: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    companyId: { type: DataTypes.INTEGER }
});

// --- Provider ---
const Provider = sequelize.define('Provider', {
    name: { type: DataTypes.STRING, allowNull: false },
    ruc: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    companyId: { type: DataTypes.INTEGER }
});

// --- Sale ---
const Sale = sequelize.define('Sale', {
    total: { type: DataTypes.FLOAT, defaultValue: 0 },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.STRING, defaultValue: 'completed' },
    paymentMethod: { type: DataTypes.STRING, defaultValue: 'Efectivo' },
    companyId: { type: DataTypes.INTEGER }
});

// --- SaleItem ---
const SaleItem = sequelize.define('SaleItem', {
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    cost: { type: DataTypes.FLOAT, defaultValue: 0 }
    // No companyId needed, linked via Sale
});

// --- CashSession ---
const CashSession = sequelize.define('CashSession', {
    openTime: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    closeTime: { type: DataTypes.DATE },
    initialAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
    finalAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
    expectedAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
    difference: { type: DataTypes.FLOAT, defaultValue: 0 },
    status: { type: DataTypes.ENUM('open', 'closed'), defaultValue: 'open' },
    notes: { type: DataTypes.TEXT },
    companyId: { type: DataTypes.INTEGER }
});

// --- CashMovement ---
const CashMovement = sequelize.define('CashMovement', {
    type: { type: DataTypes.ENUM('in', 'out'), allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    description: { type: DataTypes.STRING },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    companyId: { type: DataTypes.INTEGER }
});

// --- Purchase ---
const Purchase = sequelize.define('Purchase', {
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.ENUM('paid', 'pending'), defaultValue: 'paid' },
    total: { type: DataTypes.FLOAT, defaultValue: 0 },
    companyId: { type: DataTypes.INTEGER }
});

// --- PurchaseItem ---
const PurchaseItem = sequelize.define('PurchaseItem', {
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    cost: { type: DataTypes.FLOAT, allowNull: false }
});

// --- Relationships ---
// Tenant Scoping
User.belongsTo(Company, { foreignKey: 'companyId' });
Settings.belongsTo(Company, { foreignKey: 'companyId' });
Category.belongsTo(Company, { foreignKey: 'companyId' });
Product.belongsTo(Company, { foreignKey: 'companyId' });
Client.belongsTo(Company, { foreignKey: 'companyId' });
Provider.belongsTo(Company, { foreignKey: 'companyId' });
Sale.belongsTo(Company, { foreignKey: 'companyId' });
CashSession.belongsTo(Company, { foreignKey: 'companyId' });
CashMovement.belongsTo(Company, { foreignKey: 'companyId' });
Purchase.belongsTo(Company, { foreignKey: 'companyId' });

// Super Admin Associations
Company.hasMany(User, { foreignKey: 'companyId' });
Company.hasMany(Sale, { foreignKey: 'companyId' });
Company.hasOne(Settings, { foreignKey: 'companyId' });

// App Relationships
Product.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Product, { foreignKey: 'categoryId' });

Sale.belongsTo(Client, { foreignKey: 'clientId' });
Sale.belongsTo(User, { foreignKey: 'userId' });
Sale.hasMany(SaleItem, { foreignKey: 'saleId' });
SaleItem.belongsTo(Sale, { foreignKey: 'saleId' });
SaleItem.belongsTo(Product, { foreignKey: 'productId' });

CashSession.belongsTo(User, { foreignKey: 'userId' });
CashSession.hasMany(CashMovement, { foreignKey: 'sessionId' });
CashMovement.belongsTo(CashSession, { foreignKey: 'sessionId' });

Purchase.belongsTo(Provider, { foreignKey: 'providerId' });
Purchase.hasMany(PurchaseItem, { foreignKey: 'purchaseId' });
PurchaseItem.belongsTo(Purchase, { foreignKey: 'purchaseId' });
PurchaseItem.belongsTo(Product, { foreignKey: 'productId' });

module.exports = {
    sequelize,
    Company,
    User,
    Settings,
    Category,
    Product,
    Client,
    Provider,
    Sale,
    SaleItem,
    CashSession,
    CashMovement,
    Purchase,
    PurchaseItem
};
