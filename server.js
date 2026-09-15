require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'kampus_qready_super_secret_key';

// PostgreSQL connection pool configured for Aiven
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Automatically fix and sync correct bcrypt hashes in the database on startup
async function syncDatabaseHashes() {
    const usersToFix = [
        { email: 'jamesSmith@nwu.ac.za', pass: 'Pass123!' },
        { email: 'emilyJohnson@nwu.ac.za', pass: 'Admin2026@' },
        { email: 'michaelWilliams@nwu.ac.za', pass: 'TestUser#9' },
        { email: 'jessicaBrown@nwu.ac.za', pass: 'SecurePass1' },
        { email: 'davidJones@nwu.ac.za', pass: 'Login2026!' },
        { email: 'robertTaylor@nwu.ac.za', pass: 'DevPassword@' },
        { email: 'sarahMiller@nwu.ac.za', pass: 'CampusPass#1' },
        { email: 'williamWilson@nwu.ac.za', pass: 'ReadyLogin2' },
        { email: 'lindaMoore@nwu.ac.za', pass: 'NodeJS2026!' },
        { email: 'richardAnderson@nwu.ac.za', pass: 'SecretKey99' }
    ];

    try {
        for (const item of usersToFix) {
            const freshHash = await bcrypt.hash(item.pass, 10);
            await pool.query(
                'UPDATE "USER" SET "U_Pword_Hash" = $1 WHERE "U_Email" = $2',
                [freshHash, item.email]
            );
        }
        console.log("--> All test user passwords have been automatically synchronized and fixed in the database!");
    } catch (err) {
        console.error("Error auto-syncing hashes:", err);
    }
}

// Test Route
app.get('/', (req, res) => {
    res.json({ message: "Kampus-QReady API is running successfully!" });
});

// Dynamic Login Route checking live database records
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userQuery = 'SELECT * FROM "USER" WHERE "U_Email" = $1';
        const result = await pool.query(userQuery, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Compare input password dynamically against the database row
        const isMatch = await bcrypt.compare(password, user.U_Pword_Hash);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create JWT Payload
        const payload = {
            userId: user.User_ID,
            email: user.U_Email,
            isStudent: user.User_Is_Student,
            isStaff: user.User_Is_Staff,
            isAdministrator: user.User_Is_Administrator
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            message: 'Authentication successful',
            token,
            user: {
                id: user.User_ID,
                firstName: user.U_Fname,
                lastName: user.U_Lname
            }
        });
    } catch (err) {
        console.error("Database error during login:", err);
        res.status(500).json({ error: 'Server error during authentication' });
    }
});

// JWT Authentication Middleware to protect routes
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid or expired token.' });
        }
        req.user = decodedUser;
        next();
    });
}

// Protected Route
app.get('/api/protected/profile', authenticateToken, (req, res) => {
    res.json({ message: 'Access granted to protected route', user: req.user });
});

app.listen(PORT, async () => {
    console.log(`Kampus-QReady server running on port ${PORT}`);
    // Sync hashes right on startup
    await syncDatabaseHashes();
});