const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middlewares/authMiddleware');

// @route   POST /api/auth/register
router.post('/register', authController.register);

// @route   POST /api/auth/login
router.post('/login', authController.login);

// @route   GET /api/auth/me
router.get('/me', verifyToken, (req, res) => {
    // console.log("✅ /me route hit, user:", req.user);
    res.json({ user: req.user });
});

module.exports = router;