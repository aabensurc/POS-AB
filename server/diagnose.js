const https = require('https');
const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); // Explicitly load server/.env

const PROD_API_URL = 'https://pos-ab-production.up.railway.app/api';

// Request helper
function request(url, endpoint, method, body, token = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url + endpoint);
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = https.request(urlObj, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
                } else {
                    resolve(null);
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    console.log('--- DIAGNOSTIC REPORT ---');
    console.log('Time:', new Date().toISOString());

    // 1. Env Var Check
    console.log('\n[Environment Variables]');
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PASS Set:', !!process.env.DB_PASS);
    console.log('DB_PASSWORD Set:', !!process.env.DB_PASSWORD);
    console.log('DATABASE_URL Set:', !!process.env.DATABASE_URL);

    // 2. Local DB Check
    console.log('\n[Local Database]');
    try {
        const pass = process.env.DB_PASS || process.env.DB_PASSWORD;
        const sequelize = new Sequelize(
            process.env.DB_NAME,
            process.env.DB_USER,
            pass,
            {
                host: process.env.DB_HOST,
                dialect: 'postgres',
                logging: false,
                port: process.env.DB_PORT || 5432
            }
        );
        await sequelize.authenticate();
        console.log('✅ Connection Successful');

        const [users] = await sequelize.query('SELECT count(*) FROM "Users"'); // Quotes for case sensitivity if needed
        console.log('Consumers/Users:', users[0].count);

        try {
            const [products] = await sequelize.query('SELECT count(*) FROM "Products"');
            console.log('Products:', products[0].count);
        } catch (e) {
            console.log('Products table check failed (might be case sensitive or empty schema)');
        }

    } catch (e) {
        console.log('❌ Connection Failed:', e.message);
    }

    // 3. Production DB Check (via API)
    console.log('\n[Production API]');
    console.log('URL:', PROD_API_URL);
    try {
        const login = await request(PROD_API_URL, '/auth/login', 'POST', { username: 'admin', password: '123' });
        if (login && login.token) {
            console.log('✅ Login Successful');
            const products = await request(PROD_API_URL, '/products', 'GET', null, login.token);
            if (Array.isArray(products)) {
                console.log('Products Count:', products.length);
            } else {
                console.log('Could not fetch products');
            }
        } else {
            console.log('❌ Login Failed (Check credentials or if DB was reset)');
        }
    } catch (e) {
        console.log('❌ API Unreachable:', e.message);
    }
}

run();
