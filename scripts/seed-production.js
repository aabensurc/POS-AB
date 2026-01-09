const https = require('https');

// URL de tu backend en producción
const API_URL = 'https://pos-ab-production.up.railway.app/api';

// Datos de prueba
const DATA = {
    categories: [
        { name: 'Electrónica' },
        { name: 'Hogar' },
        { name: 'Ropa' },
        { name: 'Juguetes' }
    ],
    products: [
        { name: 'Laptop HP', price: 2500, stock: 10, categoryName: 'Electrónica', barcode: 'LP001' },
        { name: 'Smart TV Samsung', price: 1800, stock: 15, categoryName: 'Electrónica', barcode: 'TV002' },
        { name: 'Licuadora Oster', price: 300, stock: 20, categoryName: 'Hogar', barcode: 'LI003' },
        { name: 'Camiseta Polo', price: 50, stock: 100, categoryName: 'Ropa', barcode: 'CA004' },
        { name: 'Juego de Mesa', price: 80, stock: 30, categoryName: 'Juguetes', barcode: 'JM005' },
        { name: 'Mouse Logitech', price: 45, stock: 50, categoryName: 'Electrónica', barcode: 'MO006' }
    ],
    clients: [
        { name: 'Juan Pérez', document: '12345678', email: 'juan@example.com', phone: '999888777' },
        { name: 'María Gomez', document: '87654321', email: 'maria@example.com', phone: '999111222' },
        { name: 'Empresa ABC', document: '20555555551', email: 'contacto@abc.com', phone: '012345678' }
    ]
};

// Función helper para hacer requests
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
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
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

async function seed() {
    console.log('🚀 Iniciando poblado de datos...');

    // 1. Login
    console.log('🔑 Iniciando sesión...');
    const loginData = await request('/auth/login', 'POST', { username: 'admin', password: '123' });

    if (!loginData || !loginData.token) {
        console.error('❌ Error al iniciar sesión. Verifica las credenciales.');
        process.exit(1);
    }

    const token = loginData.token;
    console.log('✅ Login exitoso.');

    // 2. Obtener categorías existentes para mapear IDs
    console.log('📂 Obteniendo categorías...');
    let categories = await request('/categories', 'GET', null, token);
    const categoryMap = {}; // Nombre -> ID

    // Crear nuevas categorías
    for (const cat of DATA.categories) {
        const exists = categories.find(c => c.name === cat.name);
        if (!exists) {
            const newCat = await request('/categories', 'POST', cat, token);
            if (newCat) {
                console.log(`   + Categoría creada: ${cat.name}`);
                categoryMap[cat.name] = newCat.id;
            }
        } else {
            categoryMap[cat.name] = exists.id;
        }
    }

    // Refrescar lista final
    categories = await request('/categories', 'GET', null, token);
    categories.forEach(c => categoryMap[c.name] = c.id);

    // 3. Crear Productos
    console.log('📦 Creando productos...');
    for (const prod of DATA.products) {
        const catId = categoryMap[prod.categoryName];
        if (!catId) {
            console.log(`   ⚠️ Saltando producto ${prod.name}: Categoría ${prod.categoryName} no encontrada.`);
            continue;
        }

        const payload = { ...prod, categoryId: catId };
        delete payload.categoryName; // La API espera categoryId

        await request('/products', 'POST', payload, token);
        console.log(`   + Producto creado: ${prod.name}`);
    }

    // 4. Crear Clientes
    console.log('👥 Creando clientes...');
    for (const client of DATA.clients) {
        await request('/clients', 'POST', client, token);
        console.log(`   + Cliente creado: ${client.name}`);
    }

    console.log('✨ ¡Datos insertados correctamente en Producción!');
}

seed();
