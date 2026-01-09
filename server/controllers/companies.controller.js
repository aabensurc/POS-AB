const { Company, User, Settings, Sale, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

// Get All Companies with stats
exports.getCompanies = async (req, res) => {
    try {
        const companies = await Company.findAll({
            include: [
                { model: User, attributes: ['id'] },
                { model: Sale, attributes: ['total'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        const data = companies.map(c => {
            const totalSales = c.Sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
            return {
                id: c.id,
                name: c.name,
                ruc: c.ruc,
                address: c.address,
                plan: c.plan,
                isActive: c.isActive,
                createdAt: c.createdAt,
                usersCount: c.Users.length,
                totalRevenue: totalSales.toFixed(2)
            };
        });

        res.json(data);
    } catch (error) {
        console.error("Error fetching companies:", error);
        res.status(500).json({ error: "Error al obtener empresas" });
    }
};

// Create New Company
exports.createCompany = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { name, ruc, address, plan, adminName, adminUser, adminPass } = req.body;

        // 1. Create Company
        const company = await Company.create({
            name,
            ruc,
            address,
            plan: plan || 'free',
            isActive: true
        }, { transaction: t });

        // 2. Create Admin User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPass, salt);

        await User.create({
            name: adminName,
            username: adminUser,
            password: hashedPassword,
            role: 'admin', // Tenant Admin
            companyId: company.id
        }, { transaction: t });

        // 3. Create Settings
        await Settings.create({
            companyName: name,
            ruc: ruc,
            address: address,
            companyId: company.id
        }, { transaction: t });

        await t.commit();
        res.status(201).json({ message: "Empresa creada exitosamente", company });

    } catch (error) {
        await t.rollback();
        console.error("Error creating company:", error);
        res.status(500).json({ error: error.message || "Error al crear empresa" });
    }
};

// Toggle Status (Activate/Deactivate)
exports.toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findByPk(id);

        if (!company) return res.status(404).json({ error: "Empresa no encontrada" });

        company.isActive = !company.isActive;
        await company.save();

        res.json({ message: `Empresa ${company.isActive ? 'activada' : 'desactivada'}`, isActive: company.isActive });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
