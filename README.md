# Sistema POS - PERN Stack (PostgreSQL, Express, React, Node)

Este es un sistema de Punto de Venta (POS) completo desarrollado con una arquitectura moderna Full-Stack. Permite la gestión eficiente de ventas, inventario, caja, compras y reportes para un negocio minorista.

![Dashboard Preview](client/public/vite.svg) *Considera agregar capturas de pantalla aquí*

## 🚀 Características Principales

### 🛒 Gestión de Ventas
- Interfaz de punto de venta (POS) optimizada.
- Búsqueda rápida de productos por código o nombre.
- Carrito de compras dinámico.
- Generación de tickets de venta.
- Historial de ventas con filtros por fecha y cliente.

### 📦 Inventario y Productos
- Gestión completa de productos (CRUD).
- Control de stock y alertas de bajo stock.
- Categorización de productos.
- Gestión de proveedores y compras para reabastecimiento.

### 💰 Gestión de Caja
- Apertura y cierre de caja.
- Registro de movimientos de efectivo (ingresos/egresos).
- Arqueo de caja con cálculo de diferencias.

### 👥 Usuarios y Clientes
- Gestión de usuarios con roles (Administrador, Vendedor).
- Base de datos de clientes para asociar a ventas.
- Autenticación segura.

### 📊 Reportes y Dashboard
- Dashboard interactivo con métricas clave (Ventas del día, productos más vendidos, etc.).
- Gráficos estadísticos para análisis de desempeño.

## 🛠️ Tecnologías Utilizadas

### Frontend (Cliente)
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Gráficos**: Chart.js
- **HTTP Client**: Axios

### Backend (Servidor)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **ORM**: [Sequelize](https://sequelize.org/)
- **Base de Datos**: [PostgreSQL](https://www.postgresql.org/)
- **Autenticación**: JSON Web Tokens (JWT)

## 📋 Requisitos Previos

- [Node.js](https://nodejs.org/) (v16 o superior)
- [PostgreSQL](https://www.postgresql.org/) instalado y ejecutándose.

## ⚙️ Instalación y Configuración

### 1. Configuración de Base de Datos
Crea una base de datos en PostgreSQL llamada `pos_peru_db` (o el nombre que prefieras, asegúrate de actualizar el `.env`).

El sistema incluye un archivo `database_schema.sql` que puedes usar como referencia, pero Sequelize sincronizará los modelos automáticamente al iniciar.

### 2. Configuración del Servidor (Backend)

Navega a la carpeta del servidor e instala las dependencias:
```bash
cd server
npm install
```

Crea un archivo `.env` en la carpeta `server/` basándote en la siguiente configuración (ajusta tus credenciales):
```env
PORT=5000
DB_NAME=pos_peru_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
JWT_SECRET=tu_secreto_super_seguro
```

Para poblar la base de datos con datos de prueba iniciales (usuarios, categorías, etc.), revisa el archivo `database_schema.sql` o espera a la inicialización automática (si está configurada).

### 3. Configuración del Cliente (Frontend)

Navega a la carpeta del cliente e instala las dependencias:
```bash
cd client
npm install
```

## ▶️ Ejecución

Para correr el proyecto, necesitas dos terminales:

**Terminal 1: Backend**
```bash
cd server
node index.js
# O modo desarrollo: npm run dev
```

**Terminal 2: Frontend**
```bash
cd client
npm run dev
```
El cliente estará disponible generalmente en `http://localhost:5173`.

## 🔐 Credenciales por Defecto (Seed)
*Si has ejecutado los scripts de seed:*
- **Admin**: `admin` / `123`
- **Vendedor**: `vendedor` / `123`

## 🤝 Contribución
¡Las contribuciones son bienvenidas! Por favor, abre un issue o envía un pull request para mejoras.
