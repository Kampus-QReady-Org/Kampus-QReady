# Staff Dashboard Queue Integration & Frontend Deployment Fixes

**Date:** October 20, 2026  
**Status:** Resolved & Pushed to `dev` Branch

---

## 1. Problem Overview
- The Staff Dashboard was not displaying active walk-in queue entries (persistently showing `0` students waiting), preventing full verification of the **"Call Next"** feature.
- Because the live queue was closed and students could not join normally during development, manual data verification was required without risking existing database state.

---

## 2. Root Cause Analysis
- **PostgreSQL Case-Sensitivity:** PostgreSQL requires strict double-quoted uppercase identifiers for tables (`"QUEUE"`, `"CLINIC_VISIT"`, `"USER"`, `"STUDENT"`).
- **Relational Joins:** The active queue query (`getActiveQueue`) relies on inner joins across all four tables. A single missing relational link returns empty query results.

---

## 3. Solution & Verification
1. **Controlled Temporary Seeding:** Temporarily implemented a transaction-safe test route (`/api/test/add-queue`) in `server.js` to populate a mock student record and active queue ticket matching the local timezone (`Africa/Johannesburg`).
2. **Dashboard Testing:** Verified end-to-end processing for **"Call Next"** and ticket status transitions upon queue item populating on the dashboard.
3. **Clean Cleanup:** Removed all temporary seed routes from `server.js` and confirmed production handling via `queueService.js` (utilizing advisory locks and database transactions).

---

## 4. Environment-Aware Frontend Configuration
- **Issue:** Frontend failed to fetch live database records when deployed or tested outside localhost due to static URL strings.
- **Fix:** Updated `API_BASE_URL` logic across frontend service files to inspect `window.location.hostname`:
  - **Local Development:** Defaults to `http://localhost:3000` when hosted on `localhost` or `127.0.0.1`.
  - **Production:** Defaults to live Render deployment string: `https://kampus-qready-api.onrender.com`.