// Author: Jacques McDermid Heyns (12692131)

// Import the PostgreSQL connection pool.
const pool = require('../config/database');

/*
 * Convert a numeric queue number into the format
 * displayed to the user.
 *
 * Examples:
 * 1  -> Q001
 * 24 -> Q024
 * 105 -> Q105
 */
function formatQueueTicket(queueNumber) {
    return `Q${String(queueNumber).padStart(3, '0')}`;
}

/*
 * Find the currently active queue entry for a user.
 *
 * An active queue entry:
 * - belongs to the user;
 * - is a queue visit (Visit_Type = 'Q');
 * - has not ended yet; and
 * - belongs to today's clinic queue.
 *
 * The database connection is supplied as "db" so this
 * function can work with either the normal pool or a
 * transaction client.
 */
async function findActiveQueueForUser(db, userId) {
    const query = `
        SELECT
            cv."Visit_ID" AS "visitId",
            q."Queue_Num" AS "queueNumber",
            TO_CHAR(q."Queue_Join_date", 'YYYY-MM-DD') AS "joinDate",
            TO_CHAR(q."Queue_Join_Time", 'HH24:MI') AS "joinTime"
        FROM "CLINIC_VISIT" cv
        INNER JOIN "QUEUE" q
            ON q."Visit_ID" = cv."Visit_ID"
        WHERE cv."User_ID" = $1
          AND cv."Visit_Type" = 'Q'
          AND cv."Visit_End_Time" IS NULL
          AND q."Queue_Join_date" =
              (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Johannesburg')::date
        ORDER BY q."Queue_Num" ASC
        LIMIT 1;
    `;

    const result = await db.query(query, [userId]);

    if (result.rows.length === 0) {
        return null;
    }

    const queue = result.rows[0];

    return {
        ...queue,
        ticket: formatQueueTicket(queue.queueNumber)
    };
}

/*
 * Return the authenticated user's active queue ticket.
 *
 * Returns null when the user is not currently
 * in today's queue.
 */
async function getActiveQueueForUser(userId) {
    return findActiveQueueForUser(pool, userId);
}

/*
 * Calculate the user's current queue status.
 *
 * Queue position is calculated dynamically rather than
 * stored in the database. Only active queue visits ahead
 * of the user are counted.
 */
async function calculateQueueStatus(db, userId) {
    const queue = await findActiveQueueForUser(db, userId);

    if (!queue) {
        return null;
    }

    /*
     * Count active queue members who have a lower queue
     * number than the current user.
     *
     * Completed/left queue visits are excluded because
     * their Visit_End_Time is no longer NULL.
     */
    const positionQuery = `
        SELECT COUNT(*)::int AS "peopleAhead"
        FROM "QUEUE" q
        INNER JOIN "CLINIC_VISIT" cv
            ON cv."Visit_ID" = q."Visit_ID"
        WHERE q."Queue_Join_date" =
              (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Johannesburg')::date
          AND cv."Visit_Type" = 'Q'
          AND cv."Visit_End_Time" IS NULL
          AND q."Queue_Num" < $1;
    `;

    const result = await db.query(
        positionQuery,
        [queue.queueNumber]
    );

    const peopleAhead = result.rows[0].peopleAhead;

    return {
        ...queue,
        position: peopleAhead + 1,
        peopleAhead
    };
}

// Return the authenticated user's current queue position.
async function getQueueStatus(userId) {
    return calculateQueueStatus(pool, userId);
}

/*
 * Add the authenticated user to today's queue.
 *
 * The operation uses a PostgreSQL transaction because
 * both CLINIC_VISIT and QUEUE records must be created.
 *
 * An advisory transaction lock also prevents two users
 * from receiving the same queue number when they join
 * at almost exactly the same time.
 */
async function joinQueue(userId) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        /*
         * Only one queue-join transaction at a time may
         * generate the next number for today's queue.
         *
         * The lock is automatically released when this
         * transaction commits or rolls back.
         */
        await client.query(`
            SELECT pg_advisory_xact_lock(
                hashtext(
                    'queue:' ||
                    (
                        (CURRENT_TIMESTAMP AT TIME ZONE
                        'Africa/Johannesburg')::date
                    )::text
                )
            );
        `);

        /*
         * Check for an existing active entry AFTER acquiring
         * the lock. This also protects against the same user
         * submitting two join requests simultaneously.
         */
        const existingQueue =
            await findActiveQueueForUser(client, userId);

        if (existingQueue) {
            const error = new Error(
                'User already has an active queue entry.'
            );

            error.code = 'ALREADY_IN_QUEUE';

            throw error;
        }

        /*
         * Find today's highest queue number and add one.
         *
         * If nobody has joined yet today, MAX returns NULL,
         * so COALESCE converts it to zero and Q001 is created.
         */
        const numberResult = await client.query(`
            SELECT
                COALESCE(MAX("Queue_Num"), 0) + 1
                    AS "nextQueueNumber"
            FROM "QUEUE"
            WHERE "Queue_Join_date" =
                (CURRENT_TIMESTAMP AT TIME ZONE
                'Africa/Johannesburg')::date;
        `);

        const queueNumber =
            numberResult.rows[0].nextQueueNumber;
/*
         * Create the clinic visit first.
         *
         * Visit_Type = 'Q' distinguishes a queue visit
         * from an appointment visit.
         * 
         * Visit_Start_Time is recorded using the clinic's
         * local South African time.
         */
        const visitResult = await client.query(
            `
            INSERT INTO "CLINIC_VISIT"
                (
                    "User_ID",
                    "Visit_Type",
                    "Visit_Start_Time"
                )
            VALUES (
                $1,
                'Q',
                (CURRENT_TIMESTAMP AT TIME ZONE
                    'Africa/Johannesburg')
            )
            RETURNING "Visit_ID";
            `,
            [userId]
        );

        const visitId = visitResult.rows[0].Visit_ID;

        // Create the queue entry using the clinic's
        // South African local date and time.
        await client.query(
            `
            INSERT INTO "QUEUE"
                (
                    "Visit_ID",
                    "Queue_Num",
                    "Queue_Join_date",
                    "Queue_Join_Time"
                )
            VALUES (
                $1,
                $2,
                (CURRENT_TIMESTAMP AT TIME ZONE
                    'Africa/Johannesburg')::date,
                (CURRENT_TIMESTAMP AT TIME ZONE
                    'Africa/Johannesburg')::time
            );
            `,
            [visitId, queueNumber]
        );

        // Calculate the newly joined user's initial
        // position before finishing the transaction.
        const queueStatus =
            await calculateQueueStatus(client, userId);

        await client.query('COMMIT');

        return queueStatus;
    } catch (error) {
        await client.query('ROLLBACK');

        throw error;
    } finally {
        // Always return the connection to the pool.
        client.release();
    }
}

/*
 * End the authenticated user's active queue visit.
 *
 * Queue history is preserved, so do not delete
 * the CLINIC_VISIT or QUEUE record.
 */
async function leaveQueue(userId) {
    const query = `
        UPDATE "CLINIC_VISIT" cv
        SET "Visit_End_Time" = CURRENT_TIMESTAMP
        FROM "QUEUE" q
        WHERE q."Visit_ID" = cv."Visit_ID"
          AND cv."User_ID" = $1
          AND cv."Visit_Type" = 'Q'
          AND cv."Visit_End_Time" IS NULL
          AND q."Queue_Join_date" =
              (CURRENT_TIMESTAMP AT TIME ZONE
                  'Africa/Johannesburg')::date
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

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
        return null;
    }

    const queue = result.rows[0];

    return {
        ...queue,
        ticket: formatQueueTicket(queue.queueNumber)
    };
}

// Export the service functions used by queueController.js.
module.exports = {
    joinQueue,
    getActiveQueueForUser,
    getQueueStatus,
    leaveQueue
};