const { Purchase, PurchaseItem, Provider, Product, sequelize } = require('../models');
const { Op } = require('sequelize');

// --- PROVIDERS ---
exports.getProviders = async (req, res) => {
    try {
        const providers = await Provider.findAll();
        res.json(providers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createProvider = async (req, res) => {
    try {
        const provider = await Provider.create(req.body);
        res.status(201).json(provider);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Provider.update(req.body, { where: { id } });
        if (updated) {
            const updatedProvider = await Provider.findByPk(id);
            res.json(updatedProvider);
        } else {
            res.status(404).json({ error: 'Provider not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteProvider = async (req, res) => {
    try {
        const { id } = req.params;
        await Provider.destroy({ where: { id } });
        res.json({ message: 'Provider deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- PURCHASES ---
exports.getPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.findAll({
            include: [
                { model: Provider },
                { model: PurchaseItem, include: [Product] }
            ],
            order: [['date', 'DESC']]
        });
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createPurchase = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { providerId, date, status, items, total } = req.body; // items: [{ productId, quantity, cost }]

        const purchase = await Purchase.create({
            providerId,
            date: date || new Date(),
            status: status || 'paid',
            total
        }, { transaction: t });

        for (const item of items) {
            await PurchaseItem.create({
                purchaseId: purchase.id,
                productId: item.productId,
                quantity: item.quantity,
                cost: item.cost
            }, { transaction: t });

            // Update Product Stock & Cost
            const product = await Product.findByPk(item.productId, { transaction: t });
            if (product) {
                await product.increment('stock', { by: item.quantity, transaction: t });
                // Update cost to latest cost
                await product.update({ cost: item.cost }, { transaction: t });
            }
        }

        await t.commit();
        res.status(201).json(purchase);

    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: error.message });
    }
};
