// Author: Mudau Khuthadzo (51978156)

// Load environment variables from the local .env file into process.env
require('dotenv').config();

// Import the configured Express application instance from app.js
const app = require('./app.js');

// Import the PostgreSQL connection pool for efficient database querying
const pool = require('./src/config/database');

// Terminate startup if the required JWT_SECRET environment variable is missing
if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET environment variable is missing.");
    process.exit(1);
}

// Set the server port from environment variables or default to port 3000
const PORT = process.env.PORT || 3000;

// Verify the database connection before starting the HTTP server
pool.query('SELECT NOW()')
    .then(() => {
        console.log("Database connection verified successfully.");
        // Start listening for incoming HTTP requests on the designated port
        app.listen(PORT, () => {
            console.log(`Kampus-QReady server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to connect to the database on startup:", err.message);
        process.exit(1);
    });