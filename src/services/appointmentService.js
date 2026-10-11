// Author: Jacques McDermid Heyns (12692131)

// Import the PostgreSQL connection pool supplied by the database team.
const pool = require("../config/database");

/*
 * Standard appointment times used by the NWU Healthcare Centre.
 *
 * Appointments are 30 minutes long.
 * Morning appointments run from 08:00 until 12:00.
 * Lunch is from 12:00 until 13:00.
 * Afternoon appointments run from 13:00 until 17:00.
 *
 * Therefore, the final appointment starts at 16:30
 * and finishes at 17:00.
 */
const APPOINTMENT_TIMES = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

/*
 * Check whether a supplied date is a real calendar date
 * in YYYY-MM-DD format.
 *
 * This prevents dates such as 2026-02-31 from being accepted.
 */
function isValidDate(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const testDate = new Date(Date.UTC(year, month - 1, day));

  return (
    testDate.getUTCFullYear() === year &&
    testDate.getUTCMonth() === month - 1 &&
    testDate.getUTCDate() === day
  );
}

/*
 * Check whether the selected time is one of the clinic's
 * standard appointment times.
 */
function isValidAppointmentTime(time) {
  return APPOINTMENT_TIMES.includes(time);
}

/*
 * Return the current date and time in South African time.
 *
 * The hosted server may run in a different timezone, so the
 * appointment comparisons should use the clinic's timezone
 * rather than relying on the server's local timezone.
 */
function getClinicDateTime() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(new Date());

  const values = {};

  for (const part of parts) {
    values[part.type] = part.value;
  }

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

/*
 * Check whether an appointment date/time has already passed.
 */
function isPastAppointment(date, time) {
  const now = getClinicDateTime();

  if (date < now.date) {
    return true;
  }

  if (date === now.date && time <= now.time) {
    return true;
  }

  return false;
}

/*
 * Return all standard appointment times for a selected
 * date and indicate whether each one is available.
 */
async function getAppointmentAvailability(date) {
  // Make sure the supplied date is a real calendar date.
  if (!isValidDate(date)) {
    const error = new Error("Invalid appointment date.");
    error.code = "INVALID_DATE";
    throw error;
  }

  /*
   * Find all scheduled appointments already booked
   * for the selected date.
   *
   * TO_CHAR converts PostgreSQL TIME values such as
   * 09:30:00 into the simpler 09:30 format used by
   * the frontend.
   */
  const query = `
        SELECT
            TO_CHAR("Appt_time", 'HH24:MI') AS "time"
        FROM "APPOINTMENT"
        WHERE "Appt_Date" = $1
          AND "Appt_Status" = 'scheduled';
    `;

  const result = await pool.query(query, [date]);

  /*
   * Put the booked times into a Set.
   *
   * A Set makes it easy to ask:
   * "Is 09:30 already booked?"
   */
  const bookedTimes = new Set(
    result.rows.map((appointment) => appointment.time),
  );

  /*
   * Build the complete list required by the frontend.
   *
   * A slot is unavailable when:
   * - the selected date/time has already passed; or
   * - it is already booked.
   */
  const slots = APPOINTMENT_TIMES.map((time) => {
    const booked = bookedTimes.has(time);
    const past = isPastAppointment(date, time);

    return {
      time,
      available: !booked && !past,
    };
  });

  return slots;
}

/*
 * Book an appointment for the currently authenticated user.
 *
 * Creating an appointment requires records in both:
 * CLINIC_VISIT
 * APPOINTMENT
 *
 * A transaction ensures that either both records are created
 * successfully or neither record is created.
 */
async function bookAppointment(userId, date, time) {
  // Validate the date before attempting any database work.
  if (!isValidDate(date)) {
    const error = new Error("Invalid appointment date.");
    error.code = "INVALID_DATE";
    throw error;
  }

  // Only the clinic's standard appointment times may be booked.
  if (!isValidAppointmentTime(time)) {
    const error = new Error("Invalid appointment time.");
    error.code = "INVALID_SLOT";
    throw error;
  }

  // Do not allow appointments to be created in the past.
  if (isPastAppointment(date, time)) {
    const error = new Error("Appointment is in the past.");
    error.code = "PAST_APPOINTMENT";
    throw error;
  }

  // Get a dedicated connection from the PostgreSQL pool.
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /*
     * Lock this specific date/time combination for the duration
     * of the transaction.
     *
     * If two users attempt to book the same slot at almost
     * exactly the same time, one transaction will wait until
     * the other finishes before checking availability.
     *
     * This allows us to prevent double booking without changing
     * the existing database schema.
     */
    await client.query(
      `
            SELECT pg_advisory_xact_lock(
                hashtext($1),
                hashtext($2)
            );
            `,
      [date, time],
    );

    /*
     * Re-check availability AFTER obtaining the lock.
     *
     * This is important because another user may have booked
     * the appointment between viewing the availability screen
     * and clicking the Book button.
     */
    const existingAppointment = await client.query(
      `
            SELECT "Visit_ID"
            FROM "APPOINTMENT"
            WHERE "Appt_Date" = $1
              AND "Appt_time" = $2::time
              AND "Appt_Status" = 'scheduled'
            LIMIT 1;
            `,
      [date, time],
    );

    if (existingAppointment.rows.length > 0) {
      const error = new Error("Appointment slot unavailable.");
      error.code = "SLOT_UNAVAILABLE";
      throw error;
    }

    /*
     * First create the main clinic visit.
     *
     * Visit_Type = 'A' identifies this as an appointment
     * rather than a walk-in queue visit.
     */
    const visitResult = await client.query(
      `
            INSERT INTO "CLINIC_VISIT"
                ("User_ID", "Visit_Type")
            VALUES ($1, 'A')
            RETURNING "Visit_ID";
            `,
      [userId],
    );

    const visitId = visitResult.rows[0].Visit_ID;

    /*
     * Now create the APPOINTMENT record linked to
     * the newly-created CLINIC_VISIT.
     */
    const appointmentResult = await client.query(
      `
            INSERT INTO "APPOINTMENT"
                (
                    "Visit_ID",
                    "Appt_Date",
                    "Appt_time",
                    "Appt_Status"
                )
            VALUES ($1, $2, $3::time, 'scheduled')
            RETURNING
                "Visit_ID" AS "visitId",
                "Appt_Date" AS "date",
                TO_CHAR("Appt_time", 'HH24:MI') AS "time",
                "Appt_Status" AS "status";
            `,
      [visitId, date, time],
    );

    await client.query("COMMIT");

    return appointmentResult.rows[0];
  } catch (error) {
    /*
     * If anything fails, undo all changes made during
     * this transaction.
     */
    await client.query("ROLLBACK");

    throw error;
  } finally {
    /*
     * Always return the database connection to the pool,
     * whether the operation succeeds or fails.
     */
    client.release();
  }
}

/*
 * Return appointments belonging to a specific user.
 *
 * CLINIC_VISIT tells us which user owns the visit,
 * while APPOINTMENT contains the appointment details.
 */
async function getAppointmentsForUser(userId) {
  const query = `
        SELECT
            cv."Visit_ID" AS "visitId",
            a."Appt_Date" AS "date",
            TO_CHAR(a."Appt_time", 'HH24:MI') AS "time",
            a."Appt_Status" AS "status"
        FROM "CLINIC_VISIT" cv
        INNER JOIN "APPOINTMENT" a
            ON a."Visit_ID" = cv."Visit_ID"
        WHERE cv."User_ID" = $1
          AND cv."Visit_Type" = 'A'
        ORDER BY
            a."Appt_Date" DESC,
            a."Appt_time" DESC;
    `;

  const result = await pool.query(query, [userId]);

  return result.rows;
}

/*
 * Cancel a scheduled appointment belonging to the
 * currently authenticated user.
 *
 * The appointment is not deleted from the database.
 * Its status is changed from scheduled to cancelled.
 */
async function cancelAppointment(visitId, userId) {
  const query = `
        UPDATE "APPOINTMENT" a
        SET "Appt_Status" = 'cancelled'
        FROM "CLINIC_VISIT" cv
        WHERE a."Visit_ID" = $1
          AND cv."Visit_ID" = a."Visit_ID"
          AND cv."User_ID" = $2
          AND cv."Visit_Type" = 'A'
          AND a."Appt_Status" = 'scheduled'
        RETURNING
            a."Visit_ID" AS "visitId",
            a."Appt_Date" AS "date",
            TO_CHAR(a."Appt_time", 'HH24:MI') AS "time",
            a."Appt_Status" AS "status";
    `;

  const result = await pool.query(query, [visitId, userId]);

  /*
   * If no row was updated, either:
   * - the appointment does not exist;
   * - it belongs to another user; or
   * - it is no longer scheduled.
   *
   * We simply return null in all of those cases.
   */
  return result.rows[0] || null;
}

// Export the appointment functions so that
// appointmentController.js can use them.
module.exports = {
  getAppointmentAvailability,
  bookAppointment,
  getAppointmentsForUser,
  cancelAppointment,
};
