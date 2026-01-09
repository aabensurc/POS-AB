const { User } = require('../models');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            where: { companyId: req.companyId },
            attributes: { exclude: ['password'] } // Security best practice
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, username, password, role, photoUrl } = req.body;

        // Basic validation
        if (!username || !password || !name) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        const newUser = await User.create({
            name,
            username,
            password,
            role,
            photoUrl,
            companyId: req.companyId
        });

        // Don't return password
        const { password: _, ...userWithoutPass } = newUser.toJSON();
        res.status(201).json(userWithoutPass);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: "El nombre de usuario ya existe" });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, username, password, role, photoUrl } = req.body;

        // Scope to Company
        const user = await User.findOne({
            where: { id, companyId: req.companyId }
        });

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        user.name = name || user.name;
        user.username = username || user.username;
        if (password) user.password = password; // Only update if provided
        user.role = role || user.role;
        user.photoUrl = photoUrl || user.photoUrl;

        await user.save();

        const { password: _, ...userWithoutPass } = user.toJSON();
        res.json(userWithoutPass);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Scope to Company
        const user = await User.findOne({
            where: { id, companyId: req.companyId }
        });

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Prevent deleting the last admin or yourself if needed (skipped for simplicity/migration parity)
        await user.destroy();
        res.json({ message: "Usuario eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
