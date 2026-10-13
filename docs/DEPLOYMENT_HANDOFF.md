# Deja Vu Studio OS Deployment Handoff

## What is included

- React/Vite frontend source in `src/`
- Production build output in `dist/`
- Local Node API in `local-dejavu-api.mjs`
- Persistent JSON database template in `.local-data/dejavu-db.json`
- Production environment template in `.env.production.example`
- Smoke/security check scripts in `scripts/`

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- PM2 for keeping the API online
- Nginx or Apache reverse proxy
- SMTP provider/app password for real email delivery

## Install

```bash
npm install
npm run build
```

## API environment

Copy `.env.production.example` to the server environment and update the values:

```bash
DEJAVU_API_PORT=3001
DEJAVU_AUTH_MODE=production
DEJAVU_DATA_FILE=/var/lib/dejavu-studio/dejavu-db.json
DEJAVU_ALLOWED_ORIGINS=https://your-domain.example
DEJAVU_ADMIN_EMAIL=admin@example.com
DEJAVU_ADMIN_PASSWORD=change-this-password
VITE_DEJAVU_API_URL=/api/v1

DEJAVU_SMTP_HOST=smtp.gmail.com
DEJAVU_SMTP_PORT=587
DEJAVU_SMTP_USER=your-smtp-user@example.com
DEJAVU_SMTP_PASS=your-provider-app-password
DEJAVU_FROM_EMAIL=your-smtp-user@example.com
DEJAVU_FROM_NAME=Deja Vu Studio OS
```

Do not commit real SMTP passwords or production secrets.

## Start API with PM2

```bash
pm2 start local-dejavu-api.mjs --name dejavu-studio-api --time
pm2 save
```

The API listens on `127.0.0.1:$DEJAVU_API_PORT`.

## Reverse proxy

Serve `dist/` as the web root and proxy `/api/` to the API:

```nginx
location ^~ /api/ {
  proxy_pass http://127.0.0.1:3001;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
  try_files $uri $uri/ /index.html;
}
```

## Verify after deployment

```bash
curl https://your-domain.example/api/v1/health
```

Expected response:

```json
{"status":"ok","service":"dejavu-studio-api"}
```

Then verify:

- Public website loads
- `/admin-login` opens
- Admin login works
- Admin dashboard modules open without redirecting to the wrong route
- Booking creation works
- Booking and contact emails are received after SMTP is configured

## Important notes

- This package is self-contained for the current local Node API implementation.
- The current database is file-based JSON persistence, not MySQL/PostgreSQL.
- For production hardening, restrict file permissions on `DEJAVU_DATA_FILE`, keep the API behind the reverse proxy, and use HTTPS.
