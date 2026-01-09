const { sequelize, Company, User, Settings } = require('../models');

const createSecondCompany = async () => {
    try {
        console.log('🏢 Creating Company B...');
        const company = await Company.create({
            name: 'Bodega La Competencia (Empresa B)',
            ruc: '20600000002',
            address: 'Calle Falsa 123',
            plan: 'free'
        });

        console.log('👤 Creating User for Company B...');
        await User.create({
            name: 'Administrador B',
            username: 'admin2',
            password: '123',
            role: 'admin',
            companyId: company.id
        });

        console.log('⚙️ Creating Settings for Company B...');
        await Settings.create({
            companyName: 'Bodega La Competencia',
            ruc: '20600000002',
            address: 'Calle Falsa 123',
            currencySymbol: 'S/',
            companyId: company.id
        });

        console.log('✅ Company B Created. User: admin2 / 123');
    } catch (error) {
        console.error('Error creating second company:', error);
        throw error;
    }
};

module.exports = createSecondCompany;
