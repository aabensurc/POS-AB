const { Client } = require('../models');

// Obtener todos los clientes
exports.getClients = async (req, res) => {
    try {
        const clients = await Client.findAll({ order: [['name', 'ASC']] });
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener clientes", error: error.message });
    }
};

// Crear cliente
exports.createClient = async (req, res) => {
    try {
        const { name, docType, docNumber, address, email } = req.body;
        const newClient = await Client.create({ name, docType, docNumber, address, email });
        res.status(201).json(newClient);
    } catch (error) {
        res.status(400).json({ message: "Error al crear cliente", error: error.message });
    }
};

// Actualizar cliente
exports.updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, docType, docNumber, address, email } = req.body;
        const client = await Client.findByPk(id);

        if (!client) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        await client.update({ name, docType, docNumber, address, email });
        res.json(client);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar cliente", error: error.message });
    }
};

// Eliminar cliente
exports.deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await Client.findByPk(id);

        if (!client) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        await client.destroy();
        res.json({ message: "Cliente eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar cliente", error: error.message });
    }
};
