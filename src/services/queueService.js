// Author: Jacques McDermid Heyns (12692131)

// Import the PostgreSQL connection pool.
const pool = require('../config/database');

function formatQueueTicket(queueNumber) {
    return `Q${String(queueNumber).padStart(3, '0')}`;
}

/*
 * Find the currently active queue entry for a user.
 * Is_In_Queue = TRUE  -> student is still waiting
 * Is_In_Queue = FALSE -> staff have called the student
 */
async function findActiveQueueForUser(db, userId) {
    const query = `
        SELECT
            cv."Visit_ID" AS "visitId",
            q."Queue_Num" AS "queueNumber",
            q."Is_In_Queue" AS "isInQueue",
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
        ticket: formatQueueTicket(queue.queueNumber),
        status: queue.isInQueue ? 'Waiting' : 'Called'
    };
}

async function getActiveQueueForUser(userId) {
    return findActiveQueueForUser(pool, userId);
}

/*
 * Position is calculated dynamically. Only students who are
 * still waiting (Is_In_Queue = TRUE) and ahead of the user count.
 */
async function calculateQueueStatus(db, userId) {
    const queue = await findActiveQueueForUser(db, userId);

    if (!queue) {
        return null;
    }

    const positionQuery = `
        SELECT COUNT(*)::int AS "peopleAhead"
        FROM "QUEUE" q
        INNER JOIN "CLINIC_VISIT" cv
            ON cv."Visit_ID" = q."Visit_ID"
        WHERE q."Queue_Join_date" =
              (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Johannesburg')::date
          AND cv."Visit_Type" = 'Q'
          AND cv."Visit_End_Time" IS NULL
          AND q."Is_In_Queue" = TRUE
          AND q."Queue_Num" < $1;
    `;

    const result = await db.query(positionQuery, [queue.queueNumber]);

    const peopleAhead = result.rows[0].peopleAhead;

    return {
        ...queue,
        position: peopleAhead + 1,
        peopleAhead
    };
}

async function getQueueStatus(userId) {
    return calculateQueueStatus(pool, userId);
}

async function joinQueue(userId) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

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

        const existingQueue = await findActiveQueueForUser(client, userId);

        if (existingQueue) {
            const error = new Error('User already has an active queue entry.');
            error.code = 'ALREADY_IN_QUEUE';
            throw error;
        }

        const numberResult = await client.query(`
            SELECT
                COALESCE(MAX("Queue_Num"), 0) + 1 AS "nextQueueNumber"
            FROM "QUEUE"
            WHERE "Queue_Join_date" =
                (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Johannesburg')::date;
        `);

        const queueNumber = numberResult.rows[0].nextQueueNumber;

        const visitResult = await client.query(
            `
            INSERT INTO "CLINIC_VISIT"
                ("User_ID", "Visit_Type", "Visit_Start_Time")
            VALUES (
                $1,
                'Q',
                (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Johannesburg')
            )
            RETURNING "Visit_ID";
            `,
            [userId]
        );

        const visitId = visitResult.rows[0].Visit_ID;

        await client.query(
            `
            INSERT INTO "QUEUE"
                ("Visit_ID", "Queue_Num", "Queue_Join_date", "Queue_Join_Time")
            VALUES (
                $1,
                $2,
                (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Johannesburg')::date,
                (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Johannesburg')::time
            );
            `,
            [visitId, queueNumber]
        );

        const queueStatus = await calculateQueueStatus(client, userId);

        await client.query('COMMIT');

        return queueStatus;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Return the count of clinic visits completed today.
 */
async function getCompletedTodayCount() {
    const query = `
        SELECT COUNT(*)::int AS "completedCount"
        FROM "QUEUE" q
        INNER JOIN "CLINIC_VISIT" cv ON cv."Visit_ID" = q."Visit_ID"
        WHERE cv."Visit_Type" = 'Q'
          AND q."Status" = 'Completed'
          AND q."Queue_Join_date" = (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Johannesburg')::date;
    `;
    const result = await pool.query(query);
    return result.rows[0].completedCount;
}

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
              (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Johannesburg')::date
        RETURNING
            cv."Visit_ID" AS "visitId",
            q."Queue_Num" AS "queueNumber",
            TO_CHAR(q."Queue_Join_date", 'YYYY-MM-DD') AS "joinDate",
            TO_CHAR(q."Queue_Join_Time", 'HH24:MI') AS "joinTime";
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

module.exports = {
    joinQueue,
    getActiveQueueForUser,
    getQueueStatus,
    leaveQueue,
    getCompletedTodayCount
    
};