# Healthcare Appointment Manager (Basic Version)

A minimal appointment booking system with three portals: **Patient**, **Doctor**, and **Admin**.

## What's included
- Patient: register/login (seed accounts), search doctors, book a slot, view own appointments
- Doctor: view own appointments, cancel an appointment
- Admin: view all users, add new doctors, view all appointments
- Double-booking prevention (same doctor + date + time is blocked)
- Data stored in a JSON file (`data/db.json`) instead of a real database

## Not included (out of scope for this version)
- LLM symptom summaries
- Email notifications
- Google Calendar integration
- Background jobs / medication reminders

## Setup
```bash
npm install
npm start
```
Then open `http://localhost:3000`.

## Demo accounts
| Role    | Email             | Password   |
|---------|-------------------|------------|
| Admin   | admin@clinic.com  | admin123   |
| Doctor  | asha@clinic.com   | doctor123  |
| Patient | ravi@example.com  | patient123 |

## Notes
This is a simplified implementation covering the core booking flow only (patient/doctor/admin roles + a JSON data store), without the LLM, email, or calendar integrations described in the full spec.
