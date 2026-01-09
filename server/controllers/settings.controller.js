const { Settings, Product, Client, Sale, SaleItem, CashSession, CashMovement, Purchase, PurchaseItem, sequelize } = require('../models');

exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne({ where: { companyId: req.companyId } });
        if (!settings) {
            settings = await Settings.create({ companyId: req.companyId });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne({ where: { companyId: req.companyId } });
        if (!settings) {
            settings = await Settings.create({ ...req.body, companyId: req.companyId });
        } else {
            await settings.update(req.body);
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- Utils ---
exports.downloadBackup = async (req, res) => {
    try {
        const fullDump = {
            products: await Product.findAll(),
            clients: await Client.findAll(),
            sales: await Sale.findAll({ include: [SaleItem] }),
            purchases: await Purchase.findAll({ include: [PurchaseItem] }),
            cashSessions: await CashSession.findAll({ include: [CashMovement] })
        };

        res.setHeader('Content-Disposition', 'attachment; filename=backup.json');
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(fullDump, null, 2));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.resetTransactionalData = async (req, res) => {
    // Dangerous Action
    const t = await sequelize.transaction();
    try {
        // Delete Sales, Purchases, Cash
        // Order matters for FK
        await SaleItem.destroy({ where: {}, transaction: t });
        await Sale.destroy({ where: {}, transaction: t });

        await PurchaseItem.destroy({ where: {}, transaction: t });
        await Purchase.destroy({ where: {}, transaction: t });

        await CashMovement.destroy({ where: {}, transaction: t });
        await CashSession.destroy({ where: {}, transaction: t });

        await t.commit();
        res.json({ message: "Datos transaccionales reiniciados correctamente." });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: error.message });
    }
};
