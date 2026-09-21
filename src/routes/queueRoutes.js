// Author: Jacques McDermid Heyns (12692131)

const express = require('express');

// Import the queue controller.
// The controller will handle the HTTP request/response logic.
const queueController = require('../controllers/queueController');

// Import authentication middleware.
// All queue functionality should only be available
// to authenticated users.
const authenticateToken = require('../middleware/authenticateToken');

// Create an Express router for queue-related endpoints.
const router = express.Router();

/*
 * Protect all queue routes below this point.
 * authenticateToken verifies the JWT and places
 * the decoded user information in req.user.
 */
router.use(authenticateToken);

/*
 * POST /api/queue/join
 *
 * Adds the currently authenticated student
 * to the current day's (i.e., today's) queue.
 */
router.post(
    '/join',
    queueController.joinQueue
);

/*
 * GET /api/queue/my
 *
 * Returns the currently authenticated user's
 * active queue ticket, if one exists.
 */
router.get(
    '/my',
    queueController.getMyQueue
);

/*
 * GET /api/queue/status
 *
 * Returns the user's current queue position,
 * ticket number and number of people ahead.
 */
router.get(
    '/status',
    queueController.getQueueStatus
);

/*
 * PATCH /api/queue/leave
 *
 * Removes the currently authenticated user
 * from the active queue by ending the queue visit.
 */
router.patch(
    '/leave',
    queueController.leaveQueue
);

// Export the router so that it can later
// be mounted in the main Express application.
module.exports = router;