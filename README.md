# IBM Z Summit 2026 — QR Code Attendance System

A lightweight web application that lets organizers register participants, generate a unique QR code for each of them, and let volunteers mark attendance instantly by scanning that code at any workshop, hackathon session, or talk.

Built for **Round 1 – Task 2 (Technical Project)**, IBM Z Student Club Technical Team Recruitment 2026.

---

## Project Overview

IBM Z Summit 2026 is expected to bring together 500+ participants across multiple parallel tracks — workshops, hands-on labs, hackathons, and guest talks. This project replaces manual, paper-based sign-in sheets with a simple digital flow:

1. A participant registers once and receives a unique QR code.
2. A volunteer scans that QR code at the entrance of any session.
3. The system instantly confirms whether the participant is valid, already checked in, or newly marked present.
4. Organizers watch attendance update live and can export a CSV for any session at any time.

The project deliberately solves **one problem well** — attendance tracking — rather than attempting to cover registration payments, scheduling, or certificates as well.

---

## Problem Statement

With registrations, attendance, and volunteer coordination currently handled manually, attendance tracking is one of the most repetitive, error-prone, and time-consuming tasks at an event of this scale. Manual sign-in sheets:

- Slow down entry lines at every session
- Are easy to forge or misread (illegible handwriting, duplicate entries)
- Give organizers no real-time visibility into who is actually in the room
- Require manual, error-prone data entry afterward to produce attendance records

A QR-based system solves all four issues with a few seconds of scanning per participant and zero manual data entry afterward.

---

## Features

- **One-time registration** — Name, email, and college are stored once; a unique QR code (encoding a unique participant ID) is generated immediately and can be downloaded.
- **Duplicate registration protection** — the same email cannot register twice.
- **Multiple sessions** — organizers can create any number of sessions (e.g. "Keynote", "Hackathon Day 1", "Cloud Workshop") and track attendance per session independently.
- **Live camera scanning** — the volunteer-facing scanner page uses the device camera to read QR codes in real time (with a manual ID-entry fallback if the camera isn't available or a code won't scan).
- **Instant feedback on scan** — the scanner clearly reports one of three outcomes: newly marked present, already marked present (with original time), or not a registered participant.
- **Duplicate check-in protection** — scanning the same participant twice for the same session does not create duplicate attendance records.
- **Live organizer dashboard** — shows present count, total registered, and attendance rate per session, auto-refreshing every 5 seconds.
- **CSV export** — one click exports the full attendance list (name, email, college, timestamp) for any session.

---

## Technology Stack

| Layer | Technology | Why |
|---|---|---|
| Backend | Node.js + Express | Minimal, fast to build a small REST API on |
| Frontend | Plain HTML, CSS, JavaScript | No build tooling needed; runs anywhere |
| QR generation | [`qrcode`](https://www.npmjs.com/package/qrcode) (npm) | Generates a QR PNG per participant ID server-side |
| QR scanning | [`html5-qrcode`](https://github.com/mebjas/html5-qrcode) (CDN) | Reads QR codes via the browser camera, no native app needed |
| Data storage | A single JSON file (`data/db.json`) | See *Design Decisions* below |

### Design decisions

- **Why a JSON file instead of a real database?** For a prototype at this scale, a full database (Postgres/MongoDB) adds setup friction without adding value yet. A flat JSON file keeps the project runnable with `npm install && npm start` and zero configuration, while still being straightforward to swap out later (see *Future Scope*).
- **Why encode only the participant ID in the QR code (not their full details)?** Keeping the QR payload small makes it scan faster and more reliably, and avoids exposing personal data (name/email) in a code that could be photographed by anyone.
- **Why a manual ID-entry fallback on the scanner page?** Camera access can fail (permissions, lighting, damaged QR codes) — a volunteer should never be blocked from checking someone in.

---

## Project Structure

```
ibm-z-qr-attendance/
├── server.js                  # Express app entry point
├── package.json
├── data/
│   └── db.json                # Auto-created on first run
├── src/
│   ├── db.js                  # JSON file data layer
│   └── routes/
│       ├── participants.js    # Register + fetch participants, generate QR codes
│       ├── sessions.js        # Create + list sessions
│       └── attendance.js      # Mark attendance, list/export per session
└── public/
    ├── index.html             # Landing page / overview
    ├── admin.html             # Register participants, create sessions
    ├── scanner.html           # Volunteer-facing QR scanner
    ├── dashboard.html         # Live attendance dashboard
    ├── css/style.css
    └── js/
        ├── admin.js
        ├── scanner.js
        └── dashboard.js
```

### Using the app

1. Go to **Admin** (`/admin.html`) and create at least one session (e.g. "Hackathon Day 1").
2. On the same page, register a few participants — each one gets a downloadable QR code.
3. Go to **Scan** (`/scanner.html`), pick the session, and scan a generated QR code (or paste its participant ID manually — visible under the QR image in Admin).
4. Go to **Dashboard** (`/dashboard.html`) to see the live count update, and click **Export CSV** to download the attendance sheet.

> Note: Camera access requires either `localhost` or HTTPS in most browsers. Running locally on `localhost:3000` works out of the box; if deployed elsewhere, serve it over HTTPS for the camera scanner to work (manual ID entry always works regardless).

---

## Future Scope

- Replace the JSON file store with a real database (PostgreSQL/MongoDB) to support concurrent writes at 500+ participant scale.
- Add an admin login so the Admin page isn't publicly editable.
- Bulk-import participants via CSV upload instead of one-by-one registration.
- Email each participant their QR code automatically at registration.
- Add role-based sessions (e.g. hackathon-only vs. all-access passes).
- Push live dashboard updates via WebSockets instead of 5-second polling.
- Generate a post-event attendance/participation certificate automatically from the attendance records already being collected here.

---

## Author's Note

This project was built as part of IBM Z Student Club Technical Team Recruitment 2026, Round 1 – Task 2. See `Task 3/Reflection` for a discussion of the development process, challenges faced, and tools used.
