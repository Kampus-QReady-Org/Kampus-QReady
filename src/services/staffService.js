// Author: Jacques McDermid Heyns (12692131)

// Import the PostgreSQL connection pool.
const pool = require('../config/database');

/*
 * Convert a numeric queue number into the user-friendly
 * ticket format (same as Queue API).
 *
 * Examples:
 * 1  -> Q001
 * 24 -> Q024
 */
function formatQueueTicket(queueNumber) {
    return `Q${String(queueNumber).padStart(3, '0')}`;
}

/*
 * Check whether a supplied value is a real calendar
 * date in YYYY-MM-DD format.
 *
 * This rejects impossible dates such as 2026-02-31.
 */
function isValidDate(date) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

    if (!match) {
        return false;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const testDate = new Date(
        Date.UTC(year, month - 1, day)
    );

    return (
        testDate.getUTCFullYear() === year &&
        testDate.getUTCMonth() === month - 1 &&
        testDate.getUTCDate() === day
    );
}

/*
 * Return the current (i.e., today's) active clinic queue.
 *
 * Only queue visits that have not ended are returned.
 * Position is calculated dynamically from queue order.
 */
async function getActiveQueue() {
    const query = `
        SELECT
            cv."Visit_ID" AS "visitId",
            q."Queue_Num" AS "queueNumber",
            (
                ROW_NUMBER() OVER (
                    ORDER BY q."Queue_Num" ASC
                )
            )::int AS "position",
            u."U_FName" AS "firstName",
            u."U_LName" AS "lastName",
            s."Student_No" AS "studentNumber",
            TO_CHAR(
                q."Queue_Join_Time",
                'HH24:MI'
            ) AS "joinTime"
        FROM "QUEUE" q
        INNER JOIN "CLINIC_VISIT" cv
            ON cv."Visit_ID" = q."Visit_ID"
        INNER JOIN "USER" u
            ON u."User_ID" = cv."User_ID"
        LEFT JOIN "STUDENT" s
            ON s."User_ID" = u."User_ID"
        WHERE cv."Visit_Type" = 'Q'
          AND cv."Visit_End_Time" IS NULL
          AND q."Queue_Join_date" =
              (
                  CURRENT_TIMESTAMP AT TIME ZONE
                  'Africa/Johannesburg'
              )::date
        ORDER BY q."Queue_Num" ASC;
    `;

    const result = await pool.query(query);

    // Queue_Num remains numeric in the database, while
    // ticket provides the display-friendly Qxxx value.
    return result.rows.map((queueEntry) => ({
        ...queueEntry,
        ticket: formatQueueTicket(queueEntry.queueNumber)
    }));
}

/*
 * Complete an active queue visit.
 *
 * Queue records are not deleted. The associated
 * CLINIC_VISIT is ended by setting Visit_End_Time.
 */
async function completeQueueVisit(visitId) {
    const query = `
        UPDATE "CLINIC_VISIT" cv
        SET "Visit_End_Time" = CURRENT_TIMESTAMP
        FROM "QUEUE" q
        WHERE cv."Visit_ID" = $1
          AND q."Visit_ID" = cv."Visit_ID"
          AND cv."Visit_Type" = 'Q'
          AND cv."Visit_End_Time" IS NULL
          AND q."Queue_Join_date" =
              (
                  CURRENT_TIMESTAMP AT TIME ZONE
                  'Africa/Johannesburg'
              )::date
        RETURNING
            cv."Visit_ID" AS "visitId",
            q."Queue_Num" AS "queueNumber",
            TO_CHAR(
                q."Queue_Join_date",
                'YYYY-MM-DD'
            ) AS "joinDate",
            TO_CHAR(
                q."Queue_Join_Time",
                'HH24:MI'
            ) AS "joinTime";
    `;

    const result = await pool.query(
        query,
        [visitId]
    );

    // No active matching queue visit was found.
    if (result.rows.length === 0) {
        return null;
    }

    const queueVisit = result.rows[0];

    return {
        ...queueVisit,
        ticket: formatQueueTicket(queueVisit.queueNumber)
    };
}

/*
 * Return all appointments for a selected date.
 *
 * Staff can see appointments regardless of whether they
 * are scheduled, completed, cancelled or marked no-show.
 */
async function getAppointmentsByDate(date) {
    if (!isValidDate(date)) {
        const error = new Error('Invalid appointment date.');
        error.code = 'INVALID_DATE';
        throw error;
    }

    const query = `
        SELECT
            a."Visit_ID" AS "visitId",
            TO_CHAR(
                a."Appt_time",
                'HH24:MI'
            ) AS "time",
            a."Appt_Status" AS "status",
            u."U_FName" AS "firstName",
            u."U_LName" AS "lastName",
            s."Student_No" AS "studentNumber"
        FROM "APPOINTMENT" a
        INNER JOIN "CLINIC_VISIT" cv
            ON cv."Visit_ID" = a."Visit_ID"
        INNER JOIN "USER" u
            ON u."User_ID" = cv."User_ID"
        LEFT JOIN "STUDENT" s
            ON s."User_ID" = u."User_ID"
        WHERE a."Appt_Date" = $1
        ORDER BY a."Appt_time" ASC;
    `;

    const result = await pool.query(
        query,
        [date]
    );

    return result.rows;
}

/*
 * Update a scheduled appointment to a final status.
 *
 * Allowed transitions:
 *
 * scheduled -> completed
 * scheduled -> cancelled
 * scheduled -> no_show
 *
 * Appointments that already have a final status
 * cannot be changed again through this endpoint.
 */
async function updateAppointmentStatus(visitId, status) {
    const allowedStatuses = [
        'completed',
        'cancelled',
        'no_show'
    ];

    if (!allowedStatuses.includes(status)) {
        const error = new Error(
            'Invalid appointment status.'
        );

        error.code = 'INVALID_STATUS';

        throw error;
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        /*
         * Lock the appointment row while its current state
         * is checked.
         *
         * This prevents two staff requests from changing
         * the same scheduled appointment simultaneously.
         */
        const currentResult = await client.query(
            `
            SELECT
                "Visit_ID" AS "visitId",
                "Appt_Status" AS "status"
            FROM "APPOINTMENT"
            WHERE "Visit_ID" = $1
            FOR UPDATE;
            `,
            [visitId]
        );

        if (currentResult.rows.length === 0) {
            const error = new Error(
                'Appointment not found.'
            );

            error.code = 'APPOINTMENT_NOT_FOUND';

            throw error;
        }

        const currentAppointment =
            currentResult.rows[0];

        // Only scheduled appointments may transition
        // to a final status.
        if (currentAppointment.status !== 'scheduled') {
            const error = new Error(
                'Appointment is not scheduled.'
            );

            error.code = 'APPOINTMENT_NOT_SCHEDULED';

            throw error;
        }

        const updateResult = await client.query(
            `
            UPDATE "APPOINTMENT"
            SET "Appt_Status" = $2
            WHERE "Visit_ID" = $1
            RETURNING
                "Visit_ID" AS "visitId",
                TO_CHAR(
                    "Appt_Date",
                    'YYYY-MM-DD'
                ) AS "date",
                TO_CHAR(
                    "Appt_time",
                    'HH24:MI'
                ) AS "time",
                "Appt_Status" AS "status";
            `,
            [visitId, status]
        );

        await client.query('COMMIT');

        return updateResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');

        throw error;
    } finally {
        client.release();
    }
}

// Export the service functions used by staffController.js.
module.exports = {
    getActiveQueue,
    completeQueueVisit,
    getAppointmentsByDate,
    updateAppointmentStatus
};