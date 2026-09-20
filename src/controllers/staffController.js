// Author: Jacques McDermid Heyns (12692131)

const staffService = require('../services/staffService');

/*
 * GET /api/staff/queue
 *
 * Returns the current day's (i.e., today's) active queue for staff members.
 */
async function getActiveQueue(req, res) {
    try {
        const queue = await staffService.getActiveQueue();

        return res.status(200).json({
            queue
        });
    } catch (error) {
        console.error('Error retrieving active queue:', error);

        return res.status(500).json({
            error: 'Unable to retrieve the active queue.'
        });
    }
}

/*
 * PATCH /api/staff/queue/:visitId/complete
 *
 * Completes an active queue visit by setting
 * its Visit_End_Time.
 */
async function completeQueueVisit(req, res) {
    const visitId = Number(req.params.visitId);

    // Visit_ID must be a positive whole number.
    if (!Number.isInteger(visitId) || visitId <= 0) {
        return res.status(400).json({
            error: 'Invalid queue visit ID.'
        });
    }

    try {
        const queueVisit =
            await staffService.completeQueueVisit(visitId);

        /*
         * A null result means:
         * - the visit does not exist;
         * - it is not a queue visit; or
         * - it has already ended.
         */
        if (!queueVisit) {
            return res.status(404).json({
                error: 'Active queue visit not found.'
            });
        }

        return res.status(200).json({
            message: 'Queue visit completed successfully.',
            queue: queueVisit
        });
    } catch (error) {
        console.error('Error completing queue visit:', error);

        return res.status(500).json({
            error: 'Unable to complete the queue visit.'
        });
    }
}

/*
 * GET /api/staff/appointments?date=YYYY-MM-DD
 *
 * Returns all appointments for a selected date.
 */
async function getAppointmentsByDate(req, res) {
    const { date } = req.query;

    // A date must be supplied.
    if (!date) {
        return res.status(400).json({
            error: 'Appointment date is required.'
        });
    }

    // Basic format validation.
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateFormat.test(date)) {
        return res.status(400).json({
            error: 'Appointment date must use the format YYYY-MM-DD.'
        });
    }

    try {
        const appointments =
            await staffService.getAppointmentsByDate(date);

        return res.status(200).json({
            date,
            appointments
        });
    } catch (error) {
        /*
         * The service will perform full calendar-date validation.
         * For example, 2026-02-31 matches the format but is not
         * a real date.
         */
        if (error.code === 'INVALID_DATE') {
            return res.status(400).json({
                error: 'The selected appointment date is invalid.'
            });
        }

        console.error(
            'Error retrieving staff appointments:',
            error
        );

        return res.status(500).json({
            error: 'Unable to retrieve appointments.'
        });
    }
}

/*
 * PATCH /api/staff/appointments/:visitId/status
 *
 * Updates a scheduled appointment to one of:
 * completed, cancelled or no_show.
 *
 * Expected request body:
 * {
 *     "status": "completed"
 * }
 */
async function updateAppointmentStatus(req, res) {
    const visitId = Number(req.params.visitId);
    const { status } = req.body;

    // Visit_ID must be a positive whole number.
    if (!Number.isInteger(visitId) || visitId <= 0) {
        return res.status(400).json({
            error: 'Invalid appointment ID.'
        });
    }

    // A new status must be supplied.
    if (!status) {
        return res.status(400).json({
            error: 'Appointment status is required.'
        });
    }

    try {
        const appointment =
            await staffService.updateAppointmentStatus(
                visitId,
                status
            );

        return res.status(200).json({
            message: 'Appointment status updated successfully.',
            appointment
        });
    } catch (error) {
        // The service will reject any status other than:
        // completed, cancelled or no_show.
        if (error.code === 'INVALID_STATUS') {
            return res.status(400).json({
                error:
                    'Appointment status must be completed, cancelled or no_show.'
            });
        }

        if (error.code === 'APPOINTMENT_NOT_FOUND') {
            return res.status(404).json({
                error: 'Appointment not found.'
            });
        }

        // Only currently scheduled appointments may have
        // their status changed through this endpoint.
        if (error.code === 'APPOINTMENT_NOT_SCHEDULED') {
            return res.status(409).json({
                error:
                    'Only scheduled appointments can have their status updated.'
            });
        }

        console.error(
            'Error updating appointment status:',
            error
        );

        return res.status(500).json({
            error: 'Unable to update appointment status.'
        });
    }
}

// Export the controller functions so staffRoutes.js
// can connect each endpoint to the correct function.
module.exports = {
    getActiveQueue,
    completeQueueVisit,
    getAppointmentsByDate,
    updateAppointmentStatus
};