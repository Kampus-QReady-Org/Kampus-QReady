const { Pool } = require('pg');
require('dotenv').config();

// Ensure DATABASE_URL is provided
if (!process.env.DATABASE_URL) {
    console.error("FATAL ERROR: DATABASE_URL is not defined in environment variables.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;