// config/auth.js
const jwt = require('jsonwebtoken');
const { isValidUser, findUserByClientId } = require('../models/users');

// Function to generate JWT token after checking client credentials
const generateToken = (client_id, client_secret) => {
    if (!isValidUser(client_id, client_secret)) {
        throw new Error('Invalid client credentials');
    }

    const user = findUserByClientId(client_id);
    if (!user) {
        throw new Error('User not found');
    }

    return jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

module.exports = { generateToken };
