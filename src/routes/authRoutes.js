const express = require('express');
const router = express.Router();
const { registerUser, authenticateUser } = require('../services/authService');
const jwt = require('jsonwebtoken');

// Middleware to protect routes and verify JWT
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}

// POST: Register route
router.post('/register', async (req, res) => {
    try {
        const result = await registerUser(req.body);
        res.status(201).json({ message: 'User registered successfully', data: result });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST: Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await authenticateUser(username, password);
        res.status(200).json({ message: 'Login successful', data: result });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

// POST: Guest route ("Continue as Guest")
router.post('/guest', async (req, res) => {
    try {
        const { name, surname, idNumber } = req.body;

        if (!name || !surname || !idNumber) {
            return res.status(400).json({ error: 'Name, surname, and ID number are required.' });
        }

        const guestPayload = {
            name,
            surname,
            idNumber,
            isGuest: true
        };

        const token = jwt.sign(guestPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ 
            message: 'Guest session started successfully', 
            token,
            user: guestPayload 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Protected Profile route
router.get('/profile', verifyToken, async (req, res) => {
    res.status(200).json({ 
        message: 'Access granted to protected route', 
        user: req.user 
    });
});

module.exports = router;