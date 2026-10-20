Bug Fix & Testing Update: Staff Dashboard Queue & "Call Next" Integration
Date: October 20, 2026

Author: Khuthadzo Mudau

Target Branch: dev

Status: Completed & Pushed

1. What I Did & The Problem I Solved
The Staff Dashboard wasn't showing any active walk-in queue entries (it kept showing 0 students waiting), which prevented us from testing the "Call Next" button.

The student-facing queue was closed/inactive at the time, and I didn't want to mess up real production data or manually tinker with existing user records directly in the database.

2. How I Diagnosed & Solved It
Schema & Relation Checks: I discovered that our PostgreSQL database requires double quotes for uppercase table names (like "QUEUE", "CLINIC_VISIT", "USER", "STUDENT") and uses exact column names like U_Pword_Hash.

Missing Linked Data: The getActiveQueue query uses inner joins across all four tables (USER, STUDENT, CLINIC_VISIT, and QUEUE). If any link in that chain is missing, the dashboard query returns empty results.

Controlled Testing: To safely test without altering real data, I created a temporary test seed route in the server setup. This route executed a clean database transaction to safely create and link a test user, student record, active clinic visit, and queue entry matching today's date in the correct time zone.

Verified Dashboard Functionality: Once the test entry populated on the Staff Dashboard, I successfully tested and verified on the live system that the "Call Next" and visit completion endpoints update statuses and move queue tickets properly.

Live Testing After Queue Opened: Later on when the queue officially opened, live testing was conducted and everything worked fine with organic entries.

Verified End-to-End Flow:
Student joins queue -> Staff sees them -> Staff calls them -> Queue status updates -> Visit is completed.

3. Frontend API & Render Configuration Handling
I verified and configured our frontend API base URL string handling to automatically switch environments. It dynamically checks if the hostname is localhost or 127.0.0.1 to use the local port, and cleanly defaults to our live Render backend deployment string in production, preventing any connection string mismatches.

4. Current Status & Cleanup
Cleaned Up: I have completely removed the temporary test route from the server code so no test code remains exposed.
Ready: The system is back to using our production queue service logic with its built-in database transactions and advisory locks. Everything is synced, tested, and fully working!
