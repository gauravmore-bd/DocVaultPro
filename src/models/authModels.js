const db = require('../db/knex');

// Find user by email
exports.findUserByEmail = async (email) => {
    try {
        return await db('users').where({ email }).first();
    } catch (err) {
        console.error('Error finding user by email:', err);
        throw err;
    }
};

// Create a new user
exports.createUser = async (userData) => {
    try {
        const [id] = await db('users').insert(userData);
        return id;
    } catch (err) {
        console.error('Error creating user:', err);
        throw err;
    }
};

// Find user by ID
exports.findUserById = async (id) => {
    try {
        return await db('users').where({ id }).first();
    } catch (err) {
        console.error('Error finding user by ID:', err);
        throw err;
    }
};
