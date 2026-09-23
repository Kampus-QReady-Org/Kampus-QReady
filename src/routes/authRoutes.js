// Author: Mudau Khuthadzo (51978156)

const express = require('express');
const router = express.Router();
const { registerUser, authenticateUser } = require('../services/authService');
const jwt = require('jsonwebtoken');

// Middleware function to intercept incoming requests and verify the provided JWT authorization token for protected route access
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    // Check if the authorization token is missing from the request header; return a 401 unauthorized response if not found
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    // Verify the token using the secret key, handle any validation errors, and attach the decoded user data to the request object
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}

// POST: Register route handler to process new user registrations and return the newly created user data payload upon success
router.post('/register', async (req, res) => {
    try {
        const result = await registerUser(req.body);
        res.status(201).json({ message: 'User registered successfully', data: result });
    } catch (err) {
        // Catch any registration exceptions and respond with a 400 bad request error status containing the error message
        res.status(400).json({ error: err.message });
    }
});

// POST: Login route handler to authenticate user credentials and return authentication details on successful login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await authenticateUser(username, password);
        res.status(200).json({ message: 'Login successful', data: result });
    } catch (err) {
        // Catch any authentication failures and respond with a 401 unauthorized error status containing the details
        res.status(401).json({ error: err.message });
    }
});

// POST: Guest route ("Continue as Guest") to validate guest details, generate a temporary signed JWT session token, and return it
router.post('/guest', async (req, res) => {
    try {
        const { name, surname, idNumber } = req.body;

        // Ensure all required guest identity fields are provided; return a 400 error response if any field is missing
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
        // Catch any unexpected errors during guest session generation and respond with a 500 server error status
        res.status(500).json({ error: err.message });
    }
});

// GET: Protected Profile route handler that uses the verifyToken middleware to grant access and return authenticated user details
router.get('/profile', verifyToken, async (req, res) => {
    res.status(200).json({ 
        message: 'Access granted to protected route', 
        user: req.user 
    });
});

// Export the configured express router module for use in the main application server configuration
module.exports = router;