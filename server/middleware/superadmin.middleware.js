const isSuperAdmin = (req, res, next) => {
    // Check if user exists and has superadmin role
    if (req.user && req.user.role === 'superadmin') {
        next();
    } else {
        return res.status(403).json({ error: 'Access Denied: Super Admin Privileges Required' });
    }
};

module.exports = isSuperAdmin;
