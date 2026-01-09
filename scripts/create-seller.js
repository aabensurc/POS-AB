const https = require('https');

// URL de tu backend en producción
const API_URL = 'https://pos-ab-production.up.railway.app/api';

// Función helper para hacer requests
function request(endpoint, method, body, token = null) {
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
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
                } else {
                    console.error(`Error ${res.statusCode} en ${endpoint}:`, data);
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function createSeller() {
    console.log('🚀 Iniciando creación de usuario Vendedor...');

    // 1. Login Admin
    console.log('🔑 Iniciando sesión como Admin...');
    const loginData = await request('/auth/login', 'POST', { username: 'admin', password: '123' });

    if (!loginData || !loginData.token) {
        console.error('❌ Error al iniciar sesión. Verifica las credenciales de Admin.');
        process.exit(1);
    }

    const token = loginData.token;
    console.log('✅ Login exitoso.');

    // 2. Crear Vendedor
    console.log('👤 Creando usuario Vendedor...');
    const sellerData = {
        name: 'Vendedor',
        username: 'vendedor',
        password: '123',
        role: 'seller'
    };

    const newSeller = await request('/users', 'POST', sellerData, token);

    if (newSeller) {
        console.log('✅ ¡Usuario Vendedor creado exitosamente!');
        console.log('   Usuario: vendedor');
        console.log('   Contraseña: 123');
    } else {
        console.log('⚠️ No se pudo crear el usuario (quizás ya existe).');
    }
}

createSeller();
