const { CashSession, CashMovement, Sale, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Obtener estado actual (Sesión activa o no)
exports.getStatus = async (req, res) => {
    try {
        // Buscar sesión "open"
        const session = await CashSession.findOne({
            where: { status: 'open' },
            include: [{ model: CashMovement }]
        });

        if (!session) {
            return res.json({ status: 'closed' });
        }

        // Calcular ventas en efectivo realizadas durante esta sesión
        const salesCash = await Sale.sum('total', {
            where: {
                date: { [Op.gte]: session.openTime },
                paymentMethod: 'Efectivo',
                status: 'completed'
            }
        }) || 0;

        // Calcular ingresos/egresos manuales
        let manualInput = 0;
        let manualOutput = 0;

        session.CashMovements.forEach(m => {
            if (m.type === 'in') manualInput += parseFloat(m.amount);
            if (m.type === 'out') manualOutput += parseFloat(m.amount);
        });

        const expected = parseFloat(session.initialAmount) + parseFloat(salesCash) + manualInput - manualOutput;

        res.json({
            status: 'open',
            session,
            salesCash,
            manualInput,
            manualOutput,
            expected
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Abrir Caja
exports.openSession = async (req, res) => {
    try {
        const active = await CashSession.findOne({ where: { status: 'open' } });
        if (active) return res.status(400).json({ message: "Ya hay una caja abierta" });

        const { initialAmount, userId } = req.body;

        const session = await CashSession.create({
            userId,
            initialAmount,
            openTime: new Date(),
            status: 'open'
        });

        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cerrar Caja
exports.closeSession = async (req, res) => {
    try {
        const { finalAmount, notes } = req.body;
        const session = await CashSession.findOne({
            where: { status: 'open' },
            include: [{ model: CashMovement }]
        });

        if (!session) return res.status(400).json({ message: "No hay caja abierta" });

        // Calculate Totals to save
        // Sales Cash
        const salesCash = await Sale.sum('total', {
            where: {
                date: { [Op.gte]: session.openTime },
                paymentMethod: 'Efectivo',
                status: 'completed'
            }
        }) || 0;

        let manualInput = 0;
        let manualOutput = 0;

        if (session.CashMovements) {
            session.CashMovements.forEach(m => {
                if (m.type === 'in') manualInput += parseFloat(m.amount);
                if (m.type === 'out') manualOutput += parseFloat(m.amount);
            });
        }

        const expected = parseFloat(session.initialAmount) + parseFloat(salesCash) + manualInput - manualOutput;
        const difference = parseFloat(finalAmount) - expected;

        await session.update({
            finalAmount,
            expectedAmount: expected,
            difference: difference,
            notes,
            closeTime: new Date(),
            status: 'closed'
        });

        res.json(session);
    } catch (error) {
        console.error("Close Session Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Registrar Movimiento (Ingreso/Salida)
exports.addMovement = async (req, res) => {
    try {
        const { type, amount, description, userId } = req.body;

        const session = await CashSession.findOne({ where: { status: 'open' } });
        if (!session) return res.status(400).json({ message: "No hay caja abierta para registrar movimientos" });

        const movement = await CashMovement.create({
            cashSessionId: session.id,
            userId,
            type, // 'in' or 'out'
            amount,
            description,
            time: new Date()
        });

        res.json(movement);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Historial de Cierres (Admin)
exports.getHistory = async (req, res) => {
    try {
        const history = await CashSession.findAll({
            where: { status: 'closed' },
            include: [{ model: User, attributes: ['name'] }],
            order: [['closeTime', 'DESC']],
            limit: 50
        });
        res.json(history);
    } catch (error) {
        console.error("Get History Error:", error);
        res.status(500).json({ error: error.message });
    }
};
