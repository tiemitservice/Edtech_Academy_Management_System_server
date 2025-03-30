const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Function to verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET); // Decode the token
    } catch (err) {
        console.error('Token verification failed:', err.message);
        return null; // Return null if token verification fails
    }
};

// Function to hash a password
const hashPassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10); // Hash the password with bcrypt
    } catch (err) {
        console.error('Password hashing failed:', err.message);
        throw new Error('Password hashing failed.');
    }
};

module.exports = { verifyToken, hashPassword };
