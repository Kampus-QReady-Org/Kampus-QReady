// Author: Mudau Khuthadzo (51978156)

const express = require('express');
const router = express.Router();
const { registerUser, authenticateUser } = require('../services/authService');
const pool = require('../config/database'); // Import database connection pool for guest user provisioning
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

// POST: Guest route ("Continue as Guest")
// 
// Purpose: 
// 1. Validates that the guest has provided their Name, Surname, and ID Number.
// 2. Automatically checks or provisions a temporary record inside the database 'USER' table 
//    using a unique email placeholder derived from their ID number. This satisfies the 
//    foreign key constraint on the 'CLINIC_VISIT' table ('User_ID') without requiring 
//    guests to go through full manual account registration.
// 3. Generates and signs a temporary JWT session token containing the real database 'User_ID' 
//    alongside guest flag properties for downstream queue tracking.
router.post('/guest', async (req, res) => {
    try {
        // Extract required guest identity fields from the incoming request body
        const { name, surname, idNumber } = req.body;

        // Validation Check: Ensure all mandatory fields are present before proceeding
        if (!name || !surname || !idNumber) {
            return res.status(400).json({ 
                error: 'Name, surname, and ID number are required to continue as a guest.' 
            });
        }

        // Construct a unique placeholder email using the guest's ID number.
        // This ensures the database can store a unique record in the 'USER' table 
        // without clashing with actual registered student or staff email addresses.
        const guestEmail = `guest_${idNumber}@kampusqready.local`;

        // Database Query: Check if this guest has already been provisioned in the 'USER' table today or previously
        let userResult = await pool.query(
            'SELECT * FROM "USER" WHERE "U_Email" = $1',
            [guestEmail]
        );

        let userId;

        // Conditional Provisioning: If the guest record does not exist yet, create it dynamically
        if (userResult.rows.length === 0) {
            const insertGuestQuery = `
                INSERT INTO "USER" (
                    "U_Email", 
                    "U_Pword_Hash", 
                    "U_FName", 
                    "U_LName", 
                    "User_Is_Student", 
                    "User_Is_Staff"
                )
                VALUES ($1, $2, $3, $4, FALSE, FALSE)
                RETURNING "User_ID";
            `;

            const newGuest = await pool.query(insertGuestQuery, [
                guestEmail,
                'GUEST_PLACEHOLDER_HASH', // Dummy hash value since guests authenticate via ID payload, not passwords
                name,
                surname
            ]);

            // Capture the auto-generated database primary key 'User_ID' for the newly created temporary record
            userId = newGuest.rows[0].User_ID;
        } else {
            // If the guest record already exists in the database, reuse their existing 'User_ID'
            userId = userResult.rows[0].User_ID;
        }

        // Build the JWT payload containing the database User_ID 
        // so that queue service lookups ('findActiveQueueForUser') can match visits successfully.
        const guestPayload = {
            userId: userId, // Essential database foreign key link for clinic queue visits
            name,
            surname,
            idNumber,
            isGuest: true
        };

        // Sign the JWT token with a 1-hour expiration limit using the environment secret key
        const token = jwt.sign(guestPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Respond with success, returning both the token and the guest metadata payload
        return res.status(200).json({ 
            message: 'Guest session started successfully', 
            token,
            user: guestPayload 
        });

    } catch (err) {
        // Log unexpected database or server errors to the terminal for debugging
        console.error('Guest login error:', err);

        // Return a standard 500 server error response to prevent client hanging
        return res.status(500).json({ 
            error: 'An internal error occurred while processing guest login.' 
        });
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