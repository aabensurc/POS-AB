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

// Production Seed Route (Warning: Wipes DB)
app.get('/api/seed-production', async (req, res) => {
    try {
        const generateMockData = require('./scripts/seed_db');
        await generateMockData();
        res.json({ message: 'Production Database CLEARED and SEEDED with Mock Data + Super Admin' });
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
