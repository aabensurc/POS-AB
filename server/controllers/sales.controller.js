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
            status: 'completed',
            companyId: req.companyId // TENANT
        }, { transaction: t });

        for (const item of items) {
            await SaleItem.create({
                saleId: sale.id,
                productId: item.productId,
                quantity: item.qty || item.quantity,
                price: item.price,
                cost: item.cost || 0
            }, { transaction: t });

            // Decrement Stock (Scope to company just in case, though ID should be unique enough if we enforced it, but safer to check)
            const product = await Product.findOne({
                where: { id: item.productId, companyId: req.companyId },
                transaction: t
            });

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
        const { range, startDate: customStart, endDate: customEnd } = req.query;
        let whereClause = { companyId: req.companyId }; // TENANT SCOPE

        if (range) {
            // ... (Logic for dates remains same) ...
            if (range === 'custom' && customStart && customEnd) {
                const startDate = new Date(`${customStart}T00:00:00-05:00`);
                const endDate = new Date(`${customEnd}T23:59:59.999-05:00`);
                whereClause.date = { [Op.between]: [startDate, endDate] };
            } else {
                let startDate;
                if (range === 'today') {
                    startDate = new Date();
                    startDate.setHours(0, 0, 0, 0);
                } else if (range === 'week') {
                    startDate = new Date();
                    const day = startDate.getDay() || 7;
                    if (day !== 1) startDate.setHours(-24 * (day - 1));
                    else startDate.setHours(0, 0, 0, 0);
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
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const salesToday = await Sale.sum('total', {
            where: {
                date: { [Op.gte]: todayStart },
                status: 'completed',
                companyId: req.companyId // TENANT SCOPE
            }
        }) || 0;

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

        // Scope to Company
        const sale = await Sale.findOne({
            where: { id, companyId: req.companyId },
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
            const product = await Product.findOne({
                where: { id: item.productId, companyId: req.companyId }, // Scope
                transaction: t
            });
            if (product) {
                await product.increment('stock', { by: item.quantity, transaction: t });
            }
        }

        // 2. Registrar Salida de Dinero
        if (sale.paymentMethod === 'Efectivo') {
            const session = await CashSession.findOne({
                where: { status: 'open', companyId: req.companyId }, // Scope
                transaction: t
            });
            if (session) {
                await CashMovement.create({
                    sessionId: session.id,
                    userId: req.user ? req.user.id : null,
                    type: 'out',
                    amount: sale.total,
                    description: `Anulación Venta #${sale.id}`,
                    date: new Date(),
                    companyId: req.companyId // Tenant
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
