// Author: Mudau Khuthadzo (51978156)

// Load environment variables from the local .env configuration file into process.env
// Import the configured Express application instance from the app module and the database connection pool from the config directory
require('dotenv').config();
const app = require('./app.js');
const pool = require('./src/config/database');

// 1. Enforce strict JWT_SECRET check (fails safely if missing, as suggested by Jacques)
// Check if the JWT_SECRET environment variable is defined; log a fatal error and terminate if missing for security
if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET environment variable is missing.");
    process.exit(1);
}

const PORT = process.env.PORT || 3000;

// 2. Test database connection on startup, then start server
// Execute a quick timestamp query to verify database connectivity before launching the Express server application
pool.query('SELECT NOW()')
    .then(() => {
        console.log("Database connection verified successfully.");
        app.listen(PORT, () => {
            console.log(`Kampus-QReady server running on port ${PORT}`);
        });
    })
    .catch(err => {
        // Catch database startup connection failures, log the error message, and safely exit the process
        console.error("Failed to connect to the database on startup:", err.message);
        process.exit(1);
    });