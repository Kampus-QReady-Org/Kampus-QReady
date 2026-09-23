// Author: Mudau Khuthadzo (51978156)

const { Pool } = require('pg');
require('dotenv').config();

// Check if the DATABASE_URL environment variable is properly set before proceeding
// If missing, log a fatal error message and safely terminate the application process
if (!process.env.DATABASE_URL) {
    console.error("FATAL ERROR: DATABASE_URL is not defined in environment variables.");
    process.exit(1);
}

// Create a new PostgreSQL connection pool instance using the connection string from environment settings
// Configure SSL settings to permit connections without strict certificate verification
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Export the configured database pool object so it can be used across other modules
module.exports = pool;