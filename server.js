require('dotenv').config();
const app = require('./app');
const pool = require('./src/config/database');

// 1. Enforce strict JWT_SECRET check (fails safely if missing, as suggested by Jacques)
if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET environment variable is missing.");
    process.exit(1);
}

const PORT = process.env.PORT || 3000;

// 2. Test database connection on startup, then start server
pool.query('SELECT NOW()')
    .then(() => {
        console.log("Database connection verified successfully.");
        app.listen(PORT, () => {
            console.log(`Kampus-QReady server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to connect to the database on startup:", err.message);
        process.exit(1);
    });