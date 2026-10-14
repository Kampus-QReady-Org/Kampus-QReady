
// Author: Mudau Khuthadzo (51978156)
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes'); 
const queueRoutes = require('./src/routes/queueRoutes'); 
const staffRoutes = require('./src/routes/staffRoutes'); 

const app = express();

// ==========================================
// CORS CONFIGURATION
// ==========================================
// Whitelist allowed frontend origins
const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:5500'
  // TODO: Add Netlify URL here later 
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. Postman, curl, or mobile app requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS policy error: Origin not allowed by CORS'));
    }
  },
  credentials: true, // Enables JWT authorization headers and cookies across origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express JSON Middleware
app.use(express.json());

// ==========================================
// API ROUTES
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes); // All appointment endpoints will begin with /api/appointments (line added by Jacques).
app.use('/api/queue', queueRoutes); // Connect all queue-related API endpoints (line added by Jacques).
app.use('/api/staff', staffRoutes); // Connect all staff-management API endpoints (line added by Jacques).

// Root test route
app.get('/', (req, res) => {
    res.json({ message: 'Kampus-QReady API is running successfully!' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong on the server!' });
});

module.exports = app;