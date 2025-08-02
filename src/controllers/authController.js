const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/knex');
require('dotenv').config();

// Register User
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await db('users').where({ email }).first();
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [insertedId] = await db('users').insert({
            name,
            email,
            password: hashedPassword,
        });

        const newUser = await db('users')
            .select('id', 'name', 'email')
            .where({ id: insertedId })
            .first();

        return res.status(201).json({ message: 'User registered', user: newUser });

    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ message: 'Registration failed' });
    }
};

// Login User
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await db('users').where({ email }).first();
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role || 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return res.json({ message: 'Login successful', token });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Login failed' });
    }
};
