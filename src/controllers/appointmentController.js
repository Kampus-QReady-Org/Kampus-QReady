// Author: Jacques McDermid Heyns (12692131)

const appointmentService = require('../services/appointmentService');

/*
 * GET /api/appointments/availability?date=YYYY-MM-DD
 *
 * Returns all appointment time slots for the selected date.
 * Each slot will be marked as available or unavailable.
 */
async function getAppointmentAvailability(req, res) {
    const { date } = req.query;

    // A date must be supplied in the query string.
    if (!date) {
        return res.status(400).json({
            error: 'Appointment date is required.'
        });
    }

    // Keep the expected date format consistent with the frontend.
    // Example: 2026-09-18
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateFormat.test(date)) {
        return res.status(400).json({
            error: 'Appointment date must use the format YYYY-MM-DD.'
        });
    }

    try {
        const slots =
            await appointmentService.getAppointmentAvailability(date);

        return res.status(200).json({
            date,
            slots
        });
    } catch (error) {
        if (error.code === 'INVALID_DATE') {
            return res.status(400).json({
                error: 'The selected appointment date is invalid.'
            });
        }
        
        console.error(
            'Error retrieving appointment availability:',
            error
        );

        return res.status(500).json({
            error: 'Unable to retrieve appointment availability.'
        });
    }
}


/*
 * GET /api/appointments/my
 *
 * Returns appointments belonging to the
 * currently authenticated user.
 */
async function getMyAppointments(req, res) {
    // authenticateToken should place the decoded
    // JWT information inside req.user.
    const userId = req.user.userId;

    try {
        const appointments =
            await appointmentService.getAppointmentsForUser(userId);

        return res.status(200).json({
            appointments
        });
    } catch (error) {
        console.error('Error retrieving user appointments:', error);

        return res.status(500).json({
            error: 'Unable to retrieve appointments.'
        });
    }
}


/*
 * POST /api/appointments
 *
 * Books an appointment for the currently authenticated user.
 *
 * Expected request body:
 * {
 *     "date": "2026-09-18",
 *     "time": "09:30"
 * }
 */
async function bookAppointment(req, res) {
    const userId = req.user.userId;
    const { date, time } = req.body;

    // Both a date and time are required before a
    // booking can be attempted.
    if (!date || !time) {
        return res.status(400).json({
            error: 'Appointment date and time are required.'
        });
    }

    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateFormat.test(date)) {
        return res.status(400).json({
            error: 'Appointment date must use the format YYYY-MM-DD.'
        });
    }

    try {
        const appointment =
            await appointmentService.bookAppointment(
                userId,
                date,
                time
            );

        return res.status(201).json({
            message: 'Appointment booked successfully.',
            appointment
        });
    } catch (error) {
        /*
         * The service will use specific error codes for
         * expected booking problems.
         *
         * NOTE: These are business-rule errors, 
         * not server failures.
         */

        if (error.code === 'INVALID_DATE') {
            return res.status(400).json({
                error: 'The selected appointment date is invalid.'
        });
        }
        
        if (error.code === 'INVALID_SLOT') {
            return res.status(400).json({
                error: 'The selected appointment time is invalid.'
            });
        }

        if (error.code === 'SLOT_UNAVAILABLE') {
            return res.status(409).json({
                error: 'This appointment slot is no longer available.'
            });
        }

        if (error.code === 'PAST_APPOINTMENT') {
            return res.status(400).json({
                error: 'Appointments cannot be booked in the past.'
            });
        }

        console.error('Error booking appointment:', error);

        return res.status(500).json({
            error: 'Unable to book appointment.'
        });
    }
}


/*
 * PATCH /api/appointments/:visitId/cancel
 *
 * Cancels a scheduled appointment belonging to the
 * currently authenticated user.
 */
async function cancelAppointment(req, res) {
    const userId = req.user.userId;

    // Route parameters arrive as strings, so convert
    // the Visit_ID to a number before using it.
    const visitId = Number(req.params.visitId);

    // Visit_ID must be a positive whole number.
    if (!Number.isInteger(visitId) || visitId <= 0) {
        return res.status(400).json({
            error: 'Invalid appointment ID.'
        });
    }

    try {
        const appointment =
            await appointmentService.cancelAppointment(
                visitId,
                userId
            );

        /*
         * The service returns null when no scheduled appointment
         * with this Visit_ID belongs to the logged-in user.
         *
         * This also prevents one user from cancelling
         * another user's appointment.
         */
        if (!appointment) {
            return res.status(404).json({
                error: 'Scheduled appointment not found.'
            });
        }

        return res.status(200).json({
            message: 'Appointment cancelled successfully.',
            appointment
        });
    } catch (error) {
        console.error('Error cancelling appointment:', error);

        return res.status(500).json({
            error: 'Unable to cancel appointment.'
        });
    }
}


// Export the controller functions so that appointmentRoutes.js
// can connect each API route to the correct function.
module.exports = {
    getAppointmentAvailability,
    getMyAppointments,
    bookAppointment,
    cancelAppointment
};