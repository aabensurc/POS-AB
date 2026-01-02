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
app.get('/api/setup-db', async (req, res) => {
    try {
        await sequelize.sync({ force: true }); // WARNING: DROPS TABLES

        // Seed initial data
        const { User, Settings, Category } = require('./models');

        await User.create({
            name: 'Administrador',
            username: 'admin',
            password: '123', // In prod, hash this!
            role: 'admin'
        });

        await Settings.create({
            companyName: 'POS PERÚ',
            ruc: '20123456789',
            address: 'Av. Larco 123, Miraflores',
            taxRate: 0.18,
            currencySymbol: 'S/',
            ticketFooter: '¡Gracias por su preferencia!'
        });

        await Category.bulkCreate([
            { name: 'Bebidas' },
            { name: 'Abarrotes' },
            { name: 'Snacks' },
            { name: 'Lácteos' },
            { name: 'Limpieza' },
            { name: 'Licores' }
        ]);

        res.json({ message: 'Database initialized and seeded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Routes
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
