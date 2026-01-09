const { sequelize, Company, User, Settings, Category, Product, Client, Sale, SaleItem, CashSession, CashMovement } = require('../models');

const generateMockData = async () => {
    console.log('🔄 Syncing Database (FORCE)...');
    await sequelize.sync({ force: true });

    console.log('🏢 Creating Default Company...');
    const company = await Company.create({
        name: 'Smart POS Demo',
        ruc: '20600000001',
        address: 'Av. Tecnológica 123, Lima',
        plan: 'pro'
    });
    const companyId = company.id;

    console.log('👤 Creating Users...');
    await User.create({
        name: 'Administrador',
        username: 'admin',
        password: '123',
        role: 'admin',
        companyId
    });

    await User.create({
        name: 'Vendedor Juan',
        username: 'vendedor',
        password: '123',
        role: 'seller',
        companyId
    });

    console.log('⚙️ Creating Settings...');
    await Settings.create({
        companyName: 'Smart POS Demo',
        ruc: '20600000001',
        address: 'Av. Tecnológica 123, Lima',
        currencySymbol: 'S/',
        companyId
    });

    console.log('📦 Creating Categories & Products...');
    const categoriesData = ['Bebidas', 'Snacks', 'Lácteos', 'Limpieza', 'Frutas', 'Verduras', 'Panadería'];
    const productsList = [];

    for (const catName of categoriesData) {
        const cat = await Category.create({ name: catName, companyId });

        // Generate 3-5 products per category
        for (let i = 1; i <= Math.floor(Math.random() * 3) + 3; i++) {
            productsList.push({
                name: `${catName} Producto ${i} - Marca X`,
                code: `PROD-${cat.id}-${i}`,
                price: parseFloat((Math.random() * 50 + 5).toFixed(2)),
                stock: Math.floor(Math.random() * 50) + 10,
                cost: parseFloat((Math.random() * 4).toFixed(2)),
                categoryId: cat.id,
                companyId
            });
        }
    }
    const products = await Product.bulkCreate(productsList);

    console.log('👥 Creating Clients...');
    const clients = await Client.bulkCreate([
        { name: 'Cliente General', docNumber: '00000000', companyId },
        { name: 'Juan Perez', docNumber: '1012345678', docType: 'RUC', companyId },
        { name: 'Maria Lopez', docNumber: '40123456', docType: 'DNI', companyId },
        { name: 'Empresa ABC', docNumber: '20123456789', docType: 'RUC', companyId }
    ]);

    console.log('💰 Opening Past Cash Session (Mock)...');
    // We need a session to attach movements, though sales don't strictly require it in current model logic unless enforced
    // Let's create a sales history for the last 7 days

    console.log('🛒 Generating Sales History (Last 7 Days)...');
    const paymentMethods = ['Efectivo', 'Tarjeta', 'Yape'];

    for (let d = 7; d >= 0; d--) {
        const date = new Date();
        date.setDate(date.getDate() - d);

        // 3-8 sales per day
        const dailySalesCount = Math.floor(Math.random() * 6) + 3;

        for (let s = 0; s < dailySalesCount; s++) {
            // Random Items
            const itemsCount = Math.floor(Math.random() * 4) + 1;
            let total = 0;
            const saleItems = [];

            for (let it = 0; it < itemsCount; it++) {
                const p = products[Math.floor(Math.random() * products.length)];
                const qty = Math.floor(Math.random() * 3) + 1;
                total += p.price * qty;
                saleItems.push({
                    productId: p.id,
                    quantity: qty,
                    price: p.price,
                    cost: p.cost
                });
            }

            // Create Sale
            const sale = await Sale.create({
                total: parseFloat(total.toFixed(2)),
                date: date,
                status: 'completed',
                paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                companyId,
                clientId: clients[Math.floor(Math.random() * clients.length)].id,
                userId: 1 // Admin
            });

            // Create Items
            for (const item of saleItems) {
                await SaleItem.create({
                    ...item,
                    saleId: sale.id
                });
            }
        }
    }

    console.log('✅ Mock Data Generation Complete!');
};

// If run directly
if (require.main === module) {
    generateMockData().then(() => {
        process.exit(0);
    }).catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = generateMockData;
