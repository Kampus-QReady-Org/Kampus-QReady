# Kampus-QReady

A virtual queue and booking system for the NWU Healthcare Centre.

## The Problem

The NWU Healthcare Centre already uses physical queue tickets, and the logic works — but the ticket only exists on a paper slip in your hand. Students arrive before sunrise just to grab a number and wait in person.

- **The Gap:** Zero remote visibility, no way to check your queue position from a dorm, lecture hall, or phone.
- **The Cost:** Hours lost waiting physically, even when the clinic isn't ready to see you yet.

## The Solution

Kampus-QReady digitises what already works instead of reinventing it. The physical ticket becomes a digital ticket on the student's phone — same logic, just visible from anywhere.

- **One Student Login** — Sign up once with name, surname, student email, and password. Same account for tickets and bookings.
- **Color-Coded Slots** — Green means open, red means taken. See real availability at a glance and book in two taps.
- **Live Queue Board** — Track your ticket position from your phone, no need to stand and stare at a screen.
- **Minimal Data, Restricted Access** — Just login details and an optional reason-for-visit note. Passwords hashed, staff-only access.

## How It Works

1. **Log In** — Sign in with student email and choose ticket or slot.
2. **Track Live** — Monitor queue position or appointment updates in real time.
3. **Arrive On Time** — Come only when you're close to being seen, avoid early queuing.

## Who This Serves

- **Students** — Reclaim hours lost to physical queuing: attend class, then walk over when it's nearly your turn.
- **Clinic Staff** — See real demand coming, reduce crowd management and walk-in chaos at opening time.
- **Campus Health Services** — Better data on peak demand times, with only the minimal data needed to triage, not a full patient record.

## Project Scope

This project is an **expansion** of an existing smart appointment system, not a replacement. The existing appointment functionality already lets students book clinic visits online. The new focus is digitising the walk-in/physical ticket process so a student can receive a digital queue ticket on their phone and monitor the queue remotely.

### Two ways to use the system

**Appointment Booking**

- Student logs in
- Views available appointment slots (clearly distinguishable from booked slots)
- Books an available slot
- Can view and cancel the appointment afterwards

**Live Walk-In Queue**

- Student logs in from a phone without a prior appointment
- Chooses the queue/ticket option
- System generates a digital ticket number
- Student sees their position and how many people are ahead, updating in real time
- Student travels to the clinic only when their ticket is approaching

### Functional Scope

| Area                   | Core Requirement                   |
| ---------------------- | ---------------------------------- |
| Authentication         | Student account/login              |
| Appointments           | View and book available slots      |
| Appointment management | View and cancel bookings           |
| Walk-in queue          | Generate a digital ticket          |
| Live queue             | Display current ticket/position    |
| Queue updates          | Reflect changes as the queue moves |
| Staff-side management  | Manage appointments/queue activity |
| Access control         | Restrict sensitive functionality   |

### Possible Additions

- Notifications when a ticket is approaching
- Additional queue/status indicators
- Improved appointment filtering or calendar views
- Staff dashboards or analytics
- Additional UX improvements

## Tech Stack

Nothing here is locked in — these are proven, well-documented options, and whoever joins as a developer picks what they're strongest in.

| Component           | Options                               |
| ------------------- | ------------------------------------- |
| Frontend            | React.js or plain HTML/CSS/JavaScript |
| Backend             | Django (Python) or Node.js + Express  |
| Authentication      | JWT                                   |
| Database            | PostgreSQL or MongoDB                 |
| Cloud               | Google Cloud                          |
| Notifications       | SendGrid (email)                      |
| Real-time mechanism | Real-time polling                     |

## Team Roles

- **Project Manager** — Tumie
- **Group Leader** — Dante LeRoux
- **Frontend** — Palesane, Manyati, Khubjane
- **Backend + Database** — LeRoux, Heyns, Seleka, Mudau, Brink
- **Business Case & Feasibility Study** — Everyone

## Branching Strategy

- **`main`** — stable, production-ready code only. Nothing merges here directly.
- **`dev`** — integration branch. `frontend` and `backend` merge into `dev`; `dev` merges into `main` once it's stable.
- **`frontend`** — all frontend work (React/HTML-CSS-JS UI, queue board, booking screens).
- **`backend`** — all backend work (API, auth, database, queue logic).

```
frontend  ─┐
           ├─> dev ─> main
backend   ─┘
```

Workflow: branch off `frontend` or `backend` for individual feature work → PR into `frontend`/`backend` → PR into `dev` → once tested, PR `dev` into `main`.

## Join the Team

Every student on this campus has felt this problem. Let's be the ones who fix it. Developers — register your interest and let's build the system every student on campus will actually use.
