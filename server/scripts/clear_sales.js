const { sequelize, Sale, SaleItem } = require('../models');

const clearSales = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB. Clearing Sales...');

        // Delete SaleItems first (foreign key constraint)
        await SaleItem.destroy({ where: {}, truncate: false }); // truncate: true might fail with FK depending on driver
        console.log('SaleItems deleted.');

        // Delete Sales
        await Sale.destroy({ where: {}, truncate: false });
        console.log('Sales deleted.');

        console.log('Sales history cleared successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing sales:', error);
        process.exit(1);
    }
};

clearSales();
