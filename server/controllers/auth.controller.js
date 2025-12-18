const { User } = require('../models');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        // Check password (simple comparison as per original, hash in prod!)
        if (user.password !== password) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Return user info (excluding password)
        const userData = {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
            photoUrl: user.photoUrl
        };

        // Sign JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret_dev_key',
            { expiresIn: '24h' }
        );

        res.json({
            user: userData,
            token
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMe = async (req, res) => {
    // Mock implementation returning the admin for dev if no real token logic yet
    // In real implementation, read invalid token
    try {
        // Assume req.user is set by middleware
        if (!req.user) {
            const user = await User.findOne({ where: { role: 'admin' } });
            return res.json(user);
        }
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
