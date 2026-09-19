// Author: Jacques McDermid Heyns (12692131)

const express = require('express');

// Import the appointment controller.
// The controller will contain the functions that handle each request.
const appointmentController = require('../controllers/appointmentController');

// Import the authentication middleware.
// It will verify the JWT and place the logged-in user's
// information inside req.user.
const authenticateToken = require('../middleware/authenticateToken');

// Create a new Express router specifically for appointment routes.
const router = express.Router();

// Protect all appointment routes below this point.
// A user must therefore be logged in and provide a valid JWT
// before accessing any appointment functionality.
router.use(authenticateToken);

/*
 * GET /api/appointments/availability?date=YYYY-MM-DD
 *
 * Returns all standard appointment times for the selected date.
 * Each time will be marked as either available or unavailable.
 */
router.get(
    '/availability',
    appointmentController.getAppointmentAvailability
);

/*
 * GET /api/appointments/my
 *
 * Returns appointments belonging to the currently logged-in user.
 */
router.get(
    '/my',
    appointmentController.getMyAppointments
);

/*
 * POST /api/appointments
 *
 * Creates a new appointment for the currently logged-in user.
 *
 * The request body will contain the selected date and time.
 */
router.post(
    '/',
    appointmentController.bookAppointment
);

/*
 * PATCH /api/appointments/:visitId/cancel
 *
 * Cancels one scheduled appointment belonging to the
 * currently logged-in user.
 */
router.patch(
    '/:visitId/cancel',
    appointmentController.cancelAppointment
);

// Export the router so that it can later be connected to the Express app.
module.exports = router;