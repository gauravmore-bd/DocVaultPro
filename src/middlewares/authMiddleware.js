const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log('✅ Decoded Token:', decoded);

        // Ensure both id and userId exist for compatibility
        req.user = {
            ...decoded,
            id: decoded.userId ?? decoded.id
        };

        next();
    } catch (err) {
        console.error('❌ JWT verification error:', err);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = verifyToken;
