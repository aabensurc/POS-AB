const { User, Company, Client, Product, Sale } = require('../models');
const sequelize = require('../models').sequelize;

async function checkData() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        // 1. List Users
        const users = await User.findAll({
            attributes: ['id', 'username', 'role', 'companyId'],
            order: [['companyId', 'ASC'], ['username', 'ASC']]
        });

        console.log('\n--- USERS ---');
        users.forEach(u => {
            console.log(`[${u.companyId}] ${u.username} (${u.role})`);
        });

        // 2. Check Companies and their data
        const companies = await Company.findAll();
        console.log('\n--- COMPANIES DATA ---');

        for (const comp of companies) {
            const clientCount = await Client.count({ where: { companyId: comp.id } });
            const productCount = await Product.count({ where: { companyId: comp.id } });
            const saleCount = await Sale.count({ where: { companyId: comp.id } });

            console.log(`Company: ${comp.name} (ID: ${comp.id})`);
            console.log(` - Clients: ${clientCount}`);
            console.log(` - Products: ${productCount}`);
            console.log(` - Sales: ${saleCount}`);
            console.log('-------------------------');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

checkData();
