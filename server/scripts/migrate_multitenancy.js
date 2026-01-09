const { sequelize, Company, User, Product, Client, Sale, CashSession, Settings, Category, Provider, Purchase, CashMovement } = require('../models');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB...');

        // 1. Create Company Table
        console.log('Syncing Company table...');
        await Company.sync();

        // 2. Create Default Company if none exists
        let defaultCompany = await Company.findOne({ where: { id: 1 } });
        if (!defaultCompany) {
            console.log('Creating Default Company...');
            defaultCompany = await Company.create({
                id: 1, // Enforce ID 1
                name: 'Empresa Principal (Migrated)',
                plan: 'pro',
                isActive: true
            });
        }

        // 3. Add companyId column and backfill data
        const models = [
            { model: User, table: 'Users' },
            { model: Product, table: 'Products' },
            { model: Client, table: 'Clients' },
            { model: Sale, table: 'Sales' },
            { model: CashSession, table: 'CashSessions' },
            { model: Settings, table: 'Settings' },
            { model: Category, table: 'Categories' },
            { model: Provider, table: 'Providers' },
            { model: Purchase, table: 'Purchases' },
            { model: CashMovement, table: 'CashMovements' }
        ];

        const queryInterface = sequelize.getQueryInterface();

        for (const m of models) {
            console.log(`Migrating ${m.table}...`);

            // Check if column exists
            const tableDesc = await queryInterface.describeTable(m.table);
            if (!tableDesc.companyId) {
                console.log(`Adding companyId to ${m.table}...`);
                await queryInterface.addColumn(m.table, 'companyId', {
                    type: require('sequelize').DataTypes.INTEGER,
                    references: {
                        model: 'Companies',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL'
                });
            }

            // Backfill Data
            console.log(`Backfilling ${m.table}...`);
            await sequelize.query(`UPDATE "${m.table}" SET "companyId" = 1 WHERE "companyId" IS NULL`);
        }

        // 4. Drop Global Unique Constraints (Critical for SaaS)
        // Products.code and Clients.docNumber were likely unique globally. 
        // We need to drop those constraints so two companies can have product code "001".
        // Note: Constraint names vary by Postgres version/sequelize generation. 
        // We attempt standard names or catch errors.

        try {
            console.log('Removing unique constraint on Products code...');
            await queryInterface.removeConstraint('Products', 'Products_code_key');
        } catch (e) { console.log('Constraint Products_code_key not found or already removed'); }

        try {
            console.log('Removing unique constraint on Clients docNumber...');
            await queryInterface.removeConstraint('Clients', 'Clients_docNumber_key');
        } catch (e) { console.log('Constraint Clients_docNumber_key not found or already removed'); }

        // 5. Add Compound Unique Constraints (Optional but good)
        // Ensure unique code PER COMPANY
        try {
            await queryInterface.addConstraint('Products', {
                fields: ['companyId', 'code'],
                type: 'unique',
                name: 'unique_product_code_per_company'
            });
        } catch (e) {
            // Ignore if exists
        }

        console.log('MIGRATION SUCCESSFUL! Database is now Multi-Tenant.');
        process.exit(0);

    } catch (error) {
        console.error('Migration Failed:', error);
        process.exit(1);
    }
}

migrate();
