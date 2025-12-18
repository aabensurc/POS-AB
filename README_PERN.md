# Proyecto POS - Versión PERN (PostgreSQL, Express, React, Node)

Este proyecto ha sido migrado a una arquitectura Full-Stack.

## Requisitos previos
- Node.js instalado.
- PostgreSQL instalado y ejecutándose.
- Una base de datos llamada `pos_peru_db` (o el nombre configurado en `server/.env`).

## Estructura
- `/server`: API REST (Backend).
- `/client`: Interfaz de Usuario React (Frontend).

## Instrucciones de Ejecución

Debes abrir **dos terminales** separadas:

### Terminal 1: Servidor (Backend)
```bash
cd server
npm install  # (Solo la primera vez)
node index.js
```
*El servidor correrá en http://localhost:5000*

### Terminal 2: Cliente (Frontend)
```bash
cd client
npm install  # (Solo la primera vez)
npm run dev
```
*El cliente correrá en http://localhost:5173* (Ctrl + Click para abrir)

## Credenciales por Defecto
- **Admin**: admin / 123
- **Vendedor**: vendedor / 123
