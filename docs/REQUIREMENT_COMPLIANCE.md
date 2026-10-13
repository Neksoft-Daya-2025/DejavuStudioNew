# Déjà Vu Studio OS - Requirement Compliance

Audit date: 4 September 2026

Source: `Déjà Vu Studio OS - Business Requirements / Scope Document` (25 requirements).

## Verified application scope

The implemented application now covers the document-defined studio operating flow:

1. Accounts, multiple roles, role-based access and separate artist programs.
2. Administrator, Artist, Engineer, Beat Maker and Film Director / Cameraman roles.
3. Goldlective and House Artist participation types.
4. Multiple studios with name, description, opening hours, active and bookable controls.
5. Recurring opening hours and date-specific closed, holiday, maintenance, event and special-hour exceptions.
6. Card-based booking wizard: service, artist for administrators, studio, calendar date, available duration/time, people and confirmation.
7. Backend checks for authentication, service/studio state, opening hours, available hours, staff role/availability and conflicts.
8. Manageable services with durations, studio requirement/default studio, staff rules and bookable status.
9. Goldlective monthly 12-hour ledger, usage, expiry and retained history.
10. House Artist hours derived from the active individual agreement.
11. Central agenda data including date, time, studio, artist, service and involved staff.
12. Recurring staff availability and date-specific exceptions.
13. Required and optional booking resources with role and conflict checks.
14. Pending, Confirmed, Cancelled, Completed and No Show statuses.
15. Artist self-cancellation policy and retained cancelled bookings.
16. Strict backend authorization and backend-owned validation.
17. One administrator environment for all core modules.
18. Goldlective additional hours only after regular hours are exhausted, linked directly to one booking and immediately recorded.
19. House Artist hourly/monthly agreements, history and immutable booking snapshots.
21. Booking created, confirmed, cancelled and changed notifications with read/unread state.
22. Booking and contact email transport with editable SMTP settings.
23. Public contact storage, administrator visibility, admin email and visitor acknowledgement.
24. Audit coverage for every action specifically named in the requirements document.

Automated strict-auth verification after production hardening: **39/39 checks passed**. The detailed machine-readable result is stored at `tmp/audit/api-audit-results-final.json`.

## Production hardening completed

- Frontend API requests now use `VITE_DEJAVU_API_URL`, defaulting to the same-origin `/api/v1` reverse-proxy path. No production UI request is hardcoded to localhost.
- Vite development mode proxies `/api` to the local backend, so localhost keeps working without production URLs in source.
- Production authentication disables test login even if a test flag is accidentally supplied.
- New production data stores require an administrator bootstrap password supplied through the server environment.
- Default user passwords and plaintext-password fallback authentication have been removed from source.
- Login rate limiting, request-body limits, malformed JSON handling, origin allowlisting and API security headers are enabled.
- Browser authentication is scoped to session storage and server logout invalidates the active session token.
- A public `/api/v1/health` endpoint is available for hosting monitoring.
- Production and development dependency audits report zero known vulnerabilities from the installed audit metadata.
- The frontend build is split into application and vendor chunks and no longer emits the previous oversized-chunk warning.

## External decisions and deployment inputs

These are not application defects and cannot be completed without client/infrastructure input:

- Requirement 20: Daya/Neksoft must confirm the CRM product, API documentation, credentials, quote/payment/invoice ownership and Mollie/payment workflow. The document explicitly says this must be aligned with Daya/Neksoft and must not duplicate existing CRM functionality.
- Requirement 25: the document does not define any additional administrator features; it only permits future post-launch development.
- Live email delivery: the SMTP transport passed against an isolated SMTP server. A real provider app password must be entered in Admin > Settings for public delivery.
- Deployment: production domain, HTTPS, persistent server storage/managed database, backups and process manager must be supplied by hosting.

## Verification boundaries

- Tests used an isolated database and did not pollute the current client data.
- All listed API, persistence, validation, notification, audit and SMTP transport checks passed.
- Production frontend build and API security checks passed.
- Every tested frontend deep link returned the SPA successfully, including admin login, dashboard and module routes.
- Final manual desktop/mobile acceptance should still be performed on the deployed domain after real SMTP and CRM details are supplied.
