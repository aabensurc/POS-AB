const { sequelize } = require('../models');

const updateSchema = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB. Updating Schema...');

        // This will perform ALTER TABLE commands to match the models
        await sequelize.sync({ alter: true });

        console.log('Schema updated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
};

updateSchema();
