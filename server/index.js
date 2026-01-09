const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');

// Importar Modelos para asegurar que se registren
require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for Base64 images
app.use(morgan('dev'));

// Init DB Route (Dev only - for quick setup)
// Defined BEFORE /api router to bypass the global auth middleware in routes/api.js
// Init DB Route (Dev only - for quick setup)
// Defined BEFORE /api router to bypass the global auth middleware in routes/api.js
app.get('/api/setup-db', async (req, res) => {
    try {
        const generateMockData = require('./scripts/seed_db');
        await generateMockData();
        res.json({ message: 'Database initialized and seeded with MOCK DATA successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Setup Test Multi-tenancy Route
app.get('/api/setup-test-multitenancy', async (req, res) => {
    try {
        const createSecondCompany = require('./scripts/create_test_company');
        await createSecondCompany();
        res.json({ message: 'Second Company created! Login with user: admin2 / 123' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Routes
// Setup Super Admin Route (Dev/Setup only)
app.get('/api/setup-super-admin', async (req, res) => {
    try {
        const { Company, User, Settings } = require('./models');
        const bcrypt = require('bcryptjs');

        // Sync DB
        await sequelize.sync({ alter: true });

        // 1. Create SaaS Admin Company
        let adminCompany = await Company.findOne({ where: { name: 'SaaS Admin' } });
        if (!adminCompany) {
            adminCompany = await Company.create({
                name: 'SaaS Admin',
                plan: 'enterprise',
                isActive: true
            });
            await Settings.create({ companyId: adminCompany.id, companyName: 'SaaS Admin' });
        }

        // 2. Create Super Admin User
        let superAdmin = await User.findOne({ where: { username: 'master' } });
        if (!superAdmin) {
            const hashedPassword = await bcrypt.hash('master123', 10);
            superAdmin = await User.create({
                name: 'Master Admin',
                username: 'master',
                password: hashedPassword,
                role: 'superadmin',
                companyId: adminCompany.id
            });
        }

        res.json({
            message: 'Super Admin Setup Complete',
            company: adminCompany.name,
            user: superAdmin.username
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.use('/api', require('./routes/api'));

app.get('/', (req, res) => {
    res.send('POS Perú API is running...');
});

// Start Server
const PORT = process.env.PORT || 5000;

const start = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

start();
