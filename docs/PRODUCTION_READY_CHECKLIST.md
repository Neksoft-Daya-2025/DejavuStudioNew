# Déjà Vu Studio OS — Production Readiness Checklist

This checklist keeps the client document flow unchanged. The modules remain:
Users, roles, programs, studios, opening hours, staff availability, services,
bookings, agenda, studio hours, Goldlective extra hours, financial agreements,
notifications, contact messages, audit history and settings.

## Implemented and verified in this build

- Local backend and frontend are connected through `http://127.0.0.1:3001/api/v1`.
- Add, edit and delete flows exist for the admin modules, with complete studio,
  service, opening-hours and staff-availability forms.
- Strict role-based authorization includes all five document roles, multiple
  roles per user and artist programs stored separately.
- Studio booking flow validates:
  - active/bookable studio,
  - service duration,
  - required engineer,
  - optional beat maker,
  - studio opening hours and closed-day exceptions,
  - staff availability,
  - booking conflicts,
  - Goldlective monthly hour balance.
- Goldlective and House Artist ledgers update allocated, used, remaining and
  expired hours. Previous-month hours expire automatically on API startup and
  hourly maintenance checks.
- Extra Goldlective hours require exhausted regular hours, are linked to one
  real booking and are registered immediately.
- Financial agreement snapshot is stored on booking creation.
- Booking create, change and status actions create audit rows, notifications
  and email attempts. Artists can cancel their own eligible bookings.
- Contact form stores the message, creates admin notification/audit rows, sends
  a private administrator email and sends a separate visitor acknowledgement.
- SMTP settings are manageable from Admin Settings.
- Production strict-auth mode is available with `DEJAVU_AUTH_MODE=production`.
- Local data writes are atomic to reduce corruption risk during restart/crash.
- A strict-auth requirements audit passed 39/39 automated checks.
- Frontend API calls use configurable `VITE_DEJAVU_API_URL` and same-origin
  `/api/v1` by default; Vite proxies that path to the local API in development.
- Production mode has no built-in login passwords, no plaintext password
  fallback and no test-login bypass.
- Login rate limiting, request-size limits, strict JSON parsing, CORS allowlist,
  security headers, session-scoped browser storage and server logout are active.
- A public `/api/v1/health` endpoint is available for infrastructure monitoring.
- Installed dependency audit metadata reports zero known production or
  development vulnerabilities.
- Vendor code splitting removes the previous oversized single-bundle warning.

## Required before live client production

- Use a durable server path through `DEJAVU_DATA_FILE`, with hosting backups, or
  replace the local store with the client's managed database before scaling to
  multiple API instances.
- Put secrets only in server environment variables, never in source control.
- Configure a real SMTP provider/app password and send a live test email.
- Run the smoke test against the deployed backend.
- Put the frontend behind HTTPS and point it to the production API URL.
- Create real admin/artist/staff passwords and disable demo login with
  `DEJAVU_ALLOW_TEST_LOGIN=false`.
- Obtain the Daya/Neksoft CRM API, credentials and confirmed quote/payment/
  invoicing ownership before implementing requirement 20.
- Confirm the exact artist cancellation window with the client; the current
  implementation uses a 24-hour policy.
- Complete authenticated desktop/mobile UAT for the booking wizard, agenda and
  every administrator Add/Edit/Delete flow on the deployed domain.

## Commands

Start API:

```bash
npm run dejavu:api
```

Start frontend:

```bash
npm run dev
```

Smoke test:

```bash
DEJAVU_SMOKE_EMAIL=admin@example.com DEJAVU_SMOKE_PASSWORD=your-password npm run dejavu:smoke
```

Build frontend:

```bash
npm run build
```
