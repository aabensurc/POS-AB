const { Sale, SaleItem, Product, Client, User, CashSession, CashMovement, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.createSale = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { items, clientId, total, paymentMethod } = req.body;

        const sale = await Sale.create({
            clientId,
            userId: req.user ? req.user.id : null,
            total,
            paymentMethod,
            date: new Date(),
            status: 'completed'
        }, { transaction: t });

        for (const item of items) {
            // Create Sale Item
            await SaleItem.create({
                saleId: sale.id,
                productId: item.productId, // CORRECTED
                quantity: item.qty || item.quantity,
                price: item.price,
                cost: item.cost || 0
            }, { transaction: t });

            // Decrement Stock
            const product = await Product.findByPk(item.productId, { transaction: t }); // CORRECTED
            if (product) {
                await product.decrement('stock', {
                    by: item.qty || item.quantity,
                    transaction: t
                });
            }
        }

        await t.commit();
        res.status(201).json(sale);

    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: error.message });
    }
};

exports.getSales = async (req, res) => {
    try {
        const { range, startDate: customStart, endDate: customEnd } = req.query; // 'today', 'week', 'month', 'custom'
        let whereClause = {};

        if (range) {
            const now = new Date();
            let startDate;
            let endDate;

            if (range === 'custom' && customStart && customEnd) {
                // Parse custom range as Peru Time (UTC-5)
                startDate = new Date(`${customStart}T00:00:00-05:00`);
                endDate = new Date(`${customEnd}T23:59:59.999-05:00`);

                // Add 5 hours to compensate for server being UTC if input assumes local
                // Or better yet, rely on the client sending correct dates. 
                // Let's stick to standard behavior: Input string -> Date object.
                // If client sends "2023-12-01", that is UTC 00:00. 
                // We will add timezone offset handling if needed, but for now simple range:
                whereClause.date = { [Op.between]: [startDate, endDate] };

            } else {
                // Existing Presets
                if (range === 'today') {
                    startDate = new Date();
                    startDate.setHours(0, 0, 0, 0);
                } else if (range === 'week') {
                    startDate = new Date();
                    const day = startDate.getDay() || 7;
                    if (day !== 1) startDate.setHours(-24 * (day - 1));
                    else startDate.setHours(0, 0, 0, 0); // Monday start
                    // Should we reset hours? Yes.
                    startDate.setHours(0, 0, 0, 0);
                } else if (range === 'month') {
                    startDate = new Date();
                    startDate.setDate(1);
                    startDate.setHours(0, 0, 0, 0);
                }

                if (startDate) {
                    whereClause.date = { [Op.gte]: startDate };
                }
            }
        }

        const sales = await Sale.findAll({
            where: whereClause,
            include: [
                { model: Client, attributes: ['name'] },
                { model: User, attributes: ['name'] },
                { model: SaleItem, include: [Product] }
            ],
            order: [['date', 'DESC']]
        });
        res.json(sales);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStats = async (req, res) => {
    // Simplified dashboard stats
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const salesToday = await Sale.sum('total', {
            where: {
                date: { [Op.gte]: todayStart },
                status: 'completed'
            }
        }) || 0;

        // Count logic, profit logic could go here
        res.json({ salesToday });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- REFUND (ANULAR VENTA) ---
exports.refundSale = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const sale = await Sale.findByPk(id, {
            include: [SaleItem],
            transaction: t
        });

        if (!sale) {
            await t.rollback();
            return res.status(404).json({ error: "Venta no encontrada" });
        }

        if (sale.status === 'refunded') {
            await t.rollback();
            return res.status(400).json({ error: "Venta ya está anulada" });
        }

        // 1. Restaurar Stock
        for (const item of sale.SaleItems) {
            const product = await Product.findByPk(item.productId, { transaction: t });
            if (product) {
                await product.increment('stock', { by: item.quantity, transaction: t });
            }
        }

        // 2. Registrar Salida de Dinero si fue Efectivo y hay caja abierta
        if (sale.paymentMethod === 'Efectivo') {
            // Buscar sesión "open"
            const session = await CashSession.findOne({ where: { status: 'open' }, transaction: t });
            if (session) {
                await CashMovement.create({
                    sessionId: session.id,
                    userId: req.user ? req.user.id : null, // Assuming middleware sets user
                    type: 'out',
                    amount: sale.total,
                    description: `Anulación Venta #${sale.id}`,
                    time: new Date()
                }, { transaction: t });
            }
        }

        // 3. Update Sale Status
        await sale.update({ status: 'refunded' }, { transaction: t });

        await t.commit();
        res.json(sale);

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
