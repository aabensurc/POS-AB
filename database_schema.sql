-- 1. Crear la Base de Datos (Ejecutar esto primero solo si no existe)
-- CREATE DATABASE pos_peru_db;

-- 2. Conectarse a la base de datos pos_peru_db antes de ejecutar lo siguiente

-- Eliminación de tablas previas si existen (Orden por dependencias)
DROP TABLE IF EXISTS "PurchaseItems";
DROP TABLE IF EXISTS "Purchases";
DROP TABLE IF EXISTS "CashMovements";
DROP TABLE IF EXISTS "CashSessions";
DROP TABLE IF EXISTS "SaleItems";
DROP TABLE IF EXISTS "Sales";
DROP TABLE IF EXISTS "Products";
DROP TABLE IF EXISTS "Categories";
DROP TABLE IF EXISTS "Providers";
DROP TABLE IF EXISTS "Clients";
DROP TABLE IF EXISTS "Settings";
DROP TABLE IF EXISTS "Users";

-- Crear Tablas

CREATE TABLE "Users" (
    "id" SERIAL,
    "name" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(255) DEFAULT 'seller',
    "photoUrl" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "Settings" (
    "id" SERIAL,
    "companyName" VARCHAR(255) DEFAULT 'POS PERÚ',
    "ruc" VARCHAR(255),
    "address" VARCHAR(255),
    "taxRate" FLOAT DEFAULT 0.18,
    "currencySymbol" VARCHAR(255) DEFAULT 'S/',
    "ticketFooter" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "Categories" (
    "id" SERIAL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "Products" (
    "id" SERIAL,
    "code" VARCHAR(255) UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "price" FLOAT DEFAULT 0,
    "stock" INTEGER DEFAULT 0,
    "cost" FLOAT DEFAULT 0,
    "image" TEXT,
    "categoryId" INTEGER REFERENCES "Categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "Clients" (
    "id" SERIAL,
    "docType" VARCHAR(255) DEFAULT 'DNI',
    "docNumber" VARCHAR(255) UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255),
    "email" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "Providers" (
    "id" SERIAL,
    "name" VARCHAR(255) NOT NULL,
    "ruc" VARCHAR(255),
    "address" VARCHAR(255),
    "phone" VARCHAR(255),
    "email" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "Sales" (
    "id" SERIAL,
    "total" FLOAT DEFAULT 0,
    "date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(255) DEFAULT 'completed',
    "paymentMethod" VARCHAR(255) DEFAULT 'Efectivo',
    "userId" INTEGER REFERENCES "Users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "clientId" INTEGER REFERENCES "Clients" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "SaleItems" (
    "id" SERIAL,
    "quantity" INTEGER NOT NULL,
    "price" FLOAT NOT NULL,
    "cost" FLOAT DEFAULT 0,
    "saleId" INTEGER REFERENCES "Sales" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "productId" INTEGER REFERENCES "Products" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "CashSessions" (
    "id" SERIAL,
    "openTime" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "closeTime" TIMESTAMP WITH TIME ZONE,
    "initialAmount" FLOAT DEFAULT 0,
    "finalAmount" FLOAT DEFAULT 0,
    "expectedAmount" FLOAT DEFAULT 0,
    "difference" FLOAT DEFAULT 0,
    "status" VARCHAR(255) DEFAULT 'open',
    "notes" TEXT,
    "userId" INTEGER REFERENCES "Users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "CashMovements" (
    "id" SERIAL,
    "type" VARCHAR(255) NOT NULL,
    "amount" FLOAT NOT NULL,
    "description" VARCHAR(255),
    "date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "sessionId" INTEGER REFERENCES "CashSessions" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "Purchases" (
    "id" SERIAL,
    "date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(255) DEFAULT 'paid',
    "total" FLOAT DEFAULT 0,
    "providerId" INTEGER REFERENCES "Providers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "PurchaseItems" (
    "id" SERIAL,
    "quantity" INTEGER NOT NULL,
    "cost" FLOAT NOT NULL,
    "purchaseId" INTEGER REFERENCES "Purchases" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "productId" INTEGER REFERENCES "Products" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "createdAt" TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);


-- Datos Iniciales (Seeds)

INSERT INTO "Users" ("name", "username", "password", "role", "createdAt", "updatedAt") VALUES
('Administrador', 'admin', '123', 'admin', NOW(), NOW()),
('Vendedor 1', 'vendedor', '123', 'seller', NOW(), NOW());

INSERT INTO "Settings" ("companyName", "ruc", "address", "taxRate", "currencySymbol", "ticketFooter", "createdAt", "updatedAt") VALUES
('POS PERÚ', '20123456789', 'Av. Larco 123, Miraflores', 0.18, 'S/', '¡Gracias por su preferencia!', NOW(), NOW());

INSERT INTO "Categories" ("name", "createdAt", "updatedAt") VALUES
('Bebidas', NOW(), NOW()),
('Abarrotes', NOW(), NOW()),
('Snacks', NOW(), NOW()),
('Lácteos', NOW(), NOW()),
('Limpieza', NOW(), NOW()),
('Licores', NOW(), NOW());

-- Productos de ejemplo
INSERT INTO "Products" ("code", "name", "price", "cost", "stock", "categoryId", "createdAt", "updatedAt") VALUES
('001', 'Gaseosa Inka Kola 500ml', 3.50, 2.00, 50, 1, NOW(), NOW()),
('002', 'Arroz Costeño 1kg', 4.80, 3.50, 100, 2, NOW(), NOW()),
('003', 'Leche Gloria 400g', 4.20, 3.20, 80, 4, NOW(), NOW());
