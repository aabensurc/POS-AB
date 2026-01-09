const https = require('https');

const API_URL = 'https://pos-ab-production.up.railway.app/api';

async function request(endpoint, method, body, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = https.request(`${API_URL}${endpoint}`, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, data: JSON.parse(data || '{}') });
            });
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function listProducts() {
    console.log('🔑 Login...');
    const login = await request('/auth/login', 'POST', { username: 'admin', password: '123' });
    const token = login.data.token;

    console.log('🔍 Listing Products...');
    const response = await request('/products', 'GET', null, token);
    const products = response.data;

    console.log('ID | NAME | CODE');
    console.log('---|------|-----');
    products.forEach(p => {
        console.log(`${p.id} | ${p.name} | '${p.code}'`);
    });
}

listProducts();
