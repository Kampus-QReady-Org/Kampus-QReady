const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
// Import the appointment routes.
const appointmentRoutes = require('./src/routes/appointmentRoutes'); // Import the appointment routes (line added by Jacques).

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes); // All appointment endpoints will begin with /api/appointments (line added by Jacques).

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