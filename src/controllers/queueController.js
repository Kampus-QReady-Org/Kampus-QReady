// Author: Jacques McDermid Heyns (12692131)

const queueService = require('../services/queueService');

/*
 * POST /api/queue/join
 *
 * Adds the currently authenticated user to current day's (i.e., today's) queue.
 */
async function joinQueue(req, res) {
    const userId = req.user.userId;

    try {
        const queue = await queueService.joinQueue(userId);

        return res.status(201).json({
            message: 'Successfully joined the queue.',
            queue
        });
    } catch (error) {
        // The service will return this error when the user
        // already has an active queue visit.
        if (error.code === 'ALREADY_IN_QUEUE') {
            return res.status(409).json({
                error: 'You are already in the queue.'
            });
        }

        console.error('Error joining queue:', error);

        return res.status(500).json({
            error: 'Unable to join the queue.'
        });
    }
}


/*
 * GET /api/queue/my
 *
 * Returns the currently authenticated user's active queue ticket.
 *
 * Not being in the queue is treated as a normal state,
 * so this endpoint still returns HTTP 200.
 */
async function getMyQueue(req, res) {
    const userId = req.user.userId;

    try {
        const queue = await queueService.getActiveQueueForUser(userId);

        if (!queue) {
            return res.status(200).json({
                inQueue: false,
                queue: null
            });
        }

        return res.status(200).json({
            inQueue: true,
            queue
        });
    } catch (error) {
        console.error('Error retrieving queue ticket:', error);

        return res.status(500).json({
            error: 'Unable to retrieve queue information.'
        });
    }
}


/*
 * GET /api/queue/status
 *
 * Returns the authenticated user's current position
 * and number of people ahead in today's queue.
 */
async function getQueueStatus(req, res) {
    const userId = req.user.userId;

    try {
        const queueStatus = await queueService.getQueueStatus(userId);

        // Unlike /my, this endpoint specifically requests
        // the status of an active queue entry.
        if (!queueStatus) {
            return res.status(404).json({
                error: 'You are not currently in the queue.'
            });
        }

        return res.status(200).json({
            queue: queueStatus
        });
    } catch (error) {
        console.error('Error retrieving queue status:', error);

        return res.status(500).json({
            error: 'Unable to retrieve queue status.'
        });
    }
}


/*
 * PATCH /api/queue/leave
 *
 * Ends the authenticated user's active queue visit.
 *
 * The queue record is not deleted. The associated
 * CLINIC_VISIT will instead receive a Visit_End_Time.
 */
async function leaveQueue(req, res) {
    const userId = req.user.userId;

    try {
        const queue = await queueService.leaveQueue(userId);

        if (!queue) {
            return res.status(404).json({
                error: 'You are not currently in the queue.'
            });
        }

        return res.status(200).json({
            message: 'You have left the queue.',
            queue
        });
    } catch (error) {
        console.error('Error leaving queue:', error);

        return res.status(500).json({
            error: 'Unable to leave the queue.'
        });
    }
}


// Export the controller functions so queueRoutes.js
// can connect each endpoint to the correct function.
module.exports = {
    joinQueue,
    getMyQueue,
    getQueueStatus,
    leaveQueue
};