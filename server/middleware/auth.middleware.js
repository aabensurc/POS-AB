const jwt = require('jsonwebtoken');
const { User } = require('../models');

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers['authorization']; // Expected: "Bearer <token>"

        if (!token) {
            return res.status(403).json({ error: 'No token provided' });
        }

        const bearer = token.split(' ');
        const bearerToken = bearer[1];

        if (!bearerToken) {
            return res.status(403).json({ error: 'Malformed token' });
        }

        const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET || 'secret_dev_key');

        // Find user to ensure they still exist/aren't banned
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        req.user = user;
        req.companyId = user.companyId; // Convenience for controllers
        next();

    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = verifyToken;
