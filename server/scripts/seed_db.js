const { sequelize, Company, User, Settings, Category, Product, Client, Sale, SaleItem, CashSession, CashMovement, Provider, Purchase, PurchaseItem } = require('../models');

// Helper to get random item
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

const COMPANIES_DATA = [
    {
        name: 'Bodega Don Pepe',
        type: 'bodega',
        users: [{ username: 'admin_bodega', role: 'admin' }, { username: 'cajero_bodega', role: 'seller' }],
        categories: ['Bebidas', 'Snacks', 'Limpieza', 'Abarrotes'],
        products: [
            { name: 'Coca Cola 1.5L', cat: 'Bebidas', price: 8.50 },
            { name: 'Inca Kola 500ml', cat: 'Bebidas', price: 3.50 },
            { name: 'Papas Lays', cat: 'Snacks', price: 2.00 },
            { name: 'Arroz Costeño 1kg', cat: 'Abarrotes', price: 4.80 },
            { name: 'Detergente Ariel', cat: 'Limpieza', price: 12.00 },
        ]
    },
    {
        name: 'Tech Solutions S.A.C.',
        type: 'tech',
        users: [{ username: 'admin_tech', role: 'admin' }, { username: 'vendedor_tech', role: 'seller' }],
        categories: ['Laptops', 'Periféricos', 'Monitores', 'Cables'],
        products: [
            { name: 'Laptop HP 15"', cat: 'Laptops', price: 2500.00 },
            { name: 'Mouse Logitech', cat: 'Periféricos', price: 45.00 },
            { name: 'Monitor LG 24"', cat: 'Monitores', price: 600.00 },
            { name: 'Cable HDMI 2m', cat: 'Cables', price: 25.00 },
        ]
    },
    {
        name: 'Moda Fashion',
        type: 'clothing',
        users: [{ username: 'admin_moda', role: 'admin' }, { username: 'vendedora_moda', role: 'seller' }],
        categories: ['Polos', 'Pantalones', 'Vestidos', 'Zapatos'],
        products: [
            { name: 'Polo Algodón Blanco', cat: 'Polos', price: 35.00 },
            { name: 'Jean Slim Fit', cat: 'Pantalones', price: 85.00 },
            { name: 'Vestido Verano', cat: 'Vestidos', price: 120.00 },
            { name: 'Zapatillas Urbanas', cat: 'Zapatos', price: 150.00 },
        ]
    }
];

const bcrypt = require('bcryptjs');

// ... (existing helper functions)

const generateMockData = async () => {
    console.log('🔄 Syncing Database (FORCE)...');
    await sequelize.sync({ force: true });

    // --- 0. Create SaaS Admin Company & Master User ---
    console.log('\n👑 Creating SaaS Admin & Master User...');

    // Create/Find SaaS Company
    const saasComp = await Company.create({
        name: 'SaaS Admin',
        ruc: '99999999999',
        address: 'Cloud',
        plan: 'enterprise',
        isActive: true
    });

    // Create Settings for SaaS
    await Settings.create({
        companyName: 'SaaS Admin',
        companyId: saasComp.id
    });

    // Create Super Admin User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('master123', salt);

    await User.create({
        name: 'Super Admin',
        username: 'master',
        password: hashedPassword,
        role: 'superadmin',
        companyId: saasComp.id
    });
    console.log('✅ Super Admin created: master / master123');

    for (const companyData of COMPANIES_DATA) {
        console.log(`\n🏢 Creating Company: ${companyData.name}...`);

        // 1. Create Company
        const company = await Company.create({
            name: companyData.name,
            ruc: `2060${randomInt(1000000, 9999999)}`,
            address: 'Av. Principal 123, Lima',
            plan: 'pro'
        });
        const companyId = company.id;

        // 2. Create Users
        const createdUsers = [];
        for (const u of companyData.users) {
            const user = await User.create({
                name: u.username.toUpperCase(),
                username: u.username,
                password: '123',
                role: u.role,
                companyId
            });
            createdUsers.push(user);
        }
        const adminUser = createdUsers.find(u => u.role === 'admin') || createdUsers[0];

        // 3. Settings
        await Settings.create({
            companyName: companyData.name,
            ruc: company.ruc,
            address: company.address,
            currencySymbol: 'S/',
            currentTax: 0.18,
            companyId
        });

        // 4. Categories & Products
        const catMap = {};
        for (const catName of companyData.categories) {
            const c = await Category.create({ name: catName, companyId });
            catMap[catName] = c.id;
        }

        const productIds = [];
        for (const p of companyData.products) {
            // Create multiple variations or just raw items
            const prod = await Product.create({
                name: p.name,
                code: `PROD-${companyId}-${randomInt(1000, 9999)}`,
                price: p.price,
                stock: randomInt(20, 100),
                cost: parseFloat((p.price * 0.6).toFixed(2)),
                categoryId: catMap[p.cat],
                companyId
            });
            productIds.push(prod.id);
        }

        // 5. Clients & Providers
        const clients = await Client.bulkCreate([
            { name: 'Cliente General', docNumber: '00000000', companyId },
            { name: 'Juan Perez', docNumber: '107456789', docType: 'DNI', companyId },
            { name: 'Maria Gomez', docNumber: '107654321', docType: 'DNI', companyId },
        ]);

        const provider = await Provider.create({
            name: 'Proveedor Principal S.A.C.',
            ruc: '20100000001',
            companyId
        });

        // 6. Cash Sessions (Past & Present)
        // Ensure at least one CLOSED session with movements and sales
        // And maybe one OPEN session
        console.log('   💰 Generating Cash Sessions & Sales...');

        // -- Closed Session (Yesterday) --
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(8, 0, 0); // Opened at 8 AM

        const closedSession = await CashSession.create({
            userId: adminUser.id,
            initialAmount: 100,
            openTime: yesterday,
            status: 'open', // Will close later
            companyId
        });

        // Simulate Sales for Yesterday
        for (let i = 0; i < 5; i++) {
            // Create Sale
            const total = randomInt(50, 200);
            const sale = await Sale.create({
                clientId: random(clients).id,
                userId: adminUser.id,
                total: total,
                status: 'completed',
                paymentMethod: 'Efectivo',
                date: new Date(yesterday.getTime() + randomInt(1, 8) * 3600000), // Random time during day
                companyId
            });

            // Sale Items
            const prodId = random(productIds);
            await SaleItem.create({
                saleId: sale.id,
                productId: prodId,
                quantity: 1,
                price: total,
                cost: total * 0.6
            });
        }

        // Close session
        await closedSession.update({
            status: 'closed',
            closeTime: new Date(yesterday.getTime() + 10 * 3600000), // Closed 10 hours later
            finalAmount: 100 // Simplified
        });

        // -- Open Session (Today) --
        await CashSession.create({
            userId: adminUser.id,
            initialAmount: 200,
            openTime: new Date(),
            status: 'open',
            companyId
        });

        // 7. Recent Purchase
        await Purchase.create({
            providerId: provider.id,
            date: new Date(),
            status: 'paid',
            total: 1000,
            companyId
        });
    }

    console.log('\n✅ SEED COMPLETE: 3 Companies Created.');
    console.log('1. Bodega -> User: admin_bodega / 123');
    console.log('2. Tech -> User: admin_tech / 123');
    console.log('3. Moda -> User: admin_moda / 123');
};

if (require.main === module) {
    generateMockData().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}

module.exports = generateMockData;
