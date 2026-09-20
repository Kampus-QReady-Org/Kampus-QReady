// Author: Jacques McDermid Heyns (12692131)

const express = require('express');

// Import the staff controller.
// The controller will handle the HTTP request/response logic.
const staffController = require('../controllers/staffController');

// Authentication middleware verifies the JWT
// and places the decoded payload in req.user.
const authenticateToken = require('../middleware/authenticateToken');

// Authorization middleware ensures the authenticated
// user is actually a staff member.
const authorizeStaff = require('../middleware/authorizeStaff');

// Create an Express router for staff-management endpoints.
const router = express.Router();

/*
 * All staff routes require:
 * 1. A valid authenticated user AND
 * 2. That user to have isStaff === true
 */
router.use(authenticateToken);
router.use(authorizeStaff);

/*
 * GET /api/staff/queue
 *
 * Returns the current day's (i.e., today's) active queue 
 * in queue-number order.
 */
router.get(
    '/queue',
    staffController.getActiveQueue
);

/*
 * PATCH /api/staff/queue/:visitId/complete
 *
 * Marks an active queue visit as completed by
 * setting its Visit_End_Time.
 */
router.patch(
    '/queue/:visitId/complete',
    staffController.completeQueueVisit
);

/*
 * GET /api/staff/appointments?date=YYYY-MM-DD
 *
 * Returns all appointments for the selected date.
 */
router.get(
    '/appointments',
    staffController.getAppointmentsByDate
);

/*
 * PATCH /api/staff/appointments/:visitId/status
 *
 * Updates a scheduled appointment to one of the
 * allowed final statuses:
 * completed, cancelled or no_show.
 */
router.patch(
    '/appointments/:visitId/status',
    staffController.updateAppointmentStatus
);

// Export the router so that it can later be mounted
// in the main Express application.
module.exports = router;