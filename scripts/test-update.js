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

async function testUpdate() {
    console.log('🔑 Login...');
    const login = await request('/auth/login', 'POST', { username: 'admin', password: '123' });
    const token = login.data.token;

    // We assume Product 5 and 6 exist (from my seed script they are "Juego de Mesa" and "Mouse Logitech")

    console.log('📝 Updating Product 5 with code="" ...');
    const update1 = await request('/products/5', 'PUT', { code: "" }, token);
    console.log(`Product 5 Status: ${update1.status}`);

    console.log('📝 Updating Product 6 with code="" ...');
    const update2 = await request('/products/6', 'PUT', { code: "" }, token);
    console.log(`Product 6 Status: ${update2.status}`);

    if (update2.status === 500) {
        console.log("❌ REPRODUCED: Duplicate empty string causes 500 error!");
    } else {
        console.log("✅ Update passed (maybe DB allows it or code is handled differently)");
    }
}

testUpdate();
