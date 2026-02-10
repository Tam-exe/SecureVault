const { User } = require('../models');
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Bearer TOKEN
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) return res.sendStatus(403); // Forbidden

        try {
            const user = await User.findByPk(decoded.id);
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (user.status !== 'ACTIVE') {
                return res.status(403).json({ message: 'Account suspended or pending approval' });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('Auth Middleware Error:', error);
            res.sendStatus(500);
        }
    });
};

module.exports = authenticateToken;
