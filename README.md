# LABH PHARMA Cambodia — GPS Sales Team Tracker

A deployable, mobile-responsive employee check-in and sales-visit web application for a team of 11–30.

## Features
- Employee and administrator login; bcrypt password hashes, HttpOnly SameSite cookies, signed 12-hour JWT sessions.
- Explicit employee-controlled shift start/end and GPS consent.
- Browser GPS watch and location uploads every ~30 seconds while the page is active (plus updates on GPS changes).
- GPS-stamped pharmacy, hospital, doctor, and distributor visit forms; order amount in USD.
- Admin map of latest reported employee positions; 3-minute freshness indicator, employee enable/disable, visit summary and CSV export.
- PostgreSQL storage, input validation, role-gated API, rate limits, security headers.

## Deployment (Docker + HTTPS reverse proxy)
1. Provision a Linux VPS or managed Docker host and a DNS name such as `sales.yourdomain.com`.
2. Install Docker with Compose and an HTTPS reverse proxy (e.g., Caddy or Nginx with a valid TLS certificate).
3. Copy `.env.example` to `.env`. Set `DB_PASSWORD`, `JWT_SECRET` (64+ random characters), `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12+ characters). For Docker, `DATABASE_URL` in `.env` is only used for host-side `seed.js`; Docker Compose overrides it with its internal database URL. Do not commit `.env`.
4. Run `docker compose up -d --build`.
5. Initialize the database and first admin **once**:
   `docker compose exec -e ADMIN_EMAIL=admin@yourdomain.com -e ADMIN_PASSWORD='A-STRONG-UNIQUE-PASSWORD' app node seed.js`
   Prefer securely providing admin credentials via an environment file or secret manager instead of a command line in shared environments. The seed does not overwrite an existing admin password.
6. Configure your HTTPS reverse proxy to forward `https://sales.yourdomain.com` to `http://127.0.0.1:3000`. Set appropriate proxy forwarded headers. Do not expose port 3000 directly to the internet.
7. Sign in as admin and create representatives. Staff open the HTTPS URL on mobile, sign in, and explicitly start/end shifts.

## Local development
Start a PostgreSQL 16 database, configure `.env` with `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, then `npm install`, `npm run seed`, `npm start`. Open `http://localhost:3000` (geolocation is allowed on localhost). For mobile testing, deploy behind HTTPS.

## Important operational limits
**A browser cannot guarantee continuous background tracking on iOS/Android.** GPS may stop when the phone locks, browser backgrounds, battery-saving activates, connectivity drops, or permission is revoked. This solution is *best-effort tracking during an active shift with the webpage open*, not an always-on native tracker. For dependable locked-screen GPS, develop an Android/iOS app with OS background-location permissions, explicit user consent, visible indicators, and a clear workplace policy.

GPS coordinates are collected only after employees explicitly start a shift. Administrators can see last reported coordinates, including historical last-known positions. Create a written privacy notice covering tracking purpose, authorized access, retention period, employee rights, and local legal review in Cambodia. Add a scheduled deletion policy before production rollout. Location data is sensitive: use encrypted backups, least-privilege database credentials, TLS, secure credential management, and access audits.

## Before large-scale production use
- Implement server-side session revocation and enforce `active` account status on every authenticated endpoint (currently `/api/me` checks it; existing JWT sessions can otherwise remain valid until expiry).
- Add CSRF protection or strict Origin checking for state-changing requests, and use an identity provider for MFA/password reset.
- Add a location retention/deletion job and admin access audit logs; add backups and monitoring.
- Review Cambodia labor/privacy requirements and provide employee disclosure and consent processes.
- Verify deployment, load test, and conduct a security review before using live employee data.

## Technical note
Map tiles are loaded from OpenStreetMap's public tile service; for commercial use at scale, use an appropriate paid/hosted tile provider in accordance with usage policy.
