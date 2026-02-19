# SH Homepage Renewal

Public homepage + admin page + backend API with PostgreSQL/Flyway and Docker Compose support.

## 1. Environment
Copy `.env.example` to `.env` and adjust values.

```bash
cp .env.example .env
```

Key variables:
- `PORT`
- `CORS_ORIGIN`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_TOKEN_SECRET`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DATABASE_URL` (optional override)

## 2. Local Development (without Docker)
1. Start PostgreSQL and run Flyway migrations from `db/migrations`.
2. Start backend:

```bash
npm run dev:server
```

3. Start frontend:

```bash
npm run dev
```

4. Open:
- Public: `http://localhost:5173`
- Admin: `http://localhost:5173/admin`

## 3. Docker Compose
Build and run all services:

```bash
npm run docker:up
```

Stop services:

```bash
npm run docker:down
```

Services:
- `db` (PostgreSQL 16)
- `flyway` (schema migration)
- `backend` (Express API)
- `frontend` (Nginx static + `/api` reverse proxy)

Public URL after compose up:
- `http://localhost:8080`

## 4. Production Nginx (80 -> 443 redirect)
This project includes production override files for HTTPS termination in Nginx.

### 4.1 Prepare certificates
Domain target: `sdsaasddf1.com`

Prerequisites:
1. DNS `A` record for `sdsaasddf1.com` points to your server public IP.
2. Inbound ports `80` and `443` are open in server firewall/security group.
3. Docker is installed and running.
4. Ubuntu server has `certbot` installed.

Install certbot on Ubuntu:

```bash
sudo apt update
sudo apt install -y certbot
```

Issue certificate with Let's Encrypt (host command example):

```bash
sudo certbot certonly --standalone \
  -d sdsaasddf1.com \
  --agree-tos -m you@example.com --non-interactive
```

Copy cert files to project path:

```bash
sudo mkdir -p docker/certs
sudo cp /etc/letsencrypt/live/sdsaasddf1.com/fullchain.pem docker/certs/fullchain.pem
sudo cp /etc/letsencrypt/live/sdsaasddf1.com/privkey.pem docker/certs/privkey.pem
sudo chmod 600 docker/certs/privkey.pem
```

Renewal note (Ubuntu):
- `sudo systemctl status certbot.timer` should be `active`.
- After renewal, copy refreshed cert files again to `docker/certs` and redeploy:
```bash
npm run deploy:prod:linux -- --no-build
```

### 4.2 Configure env
Set these values in `.env`:
- `NGINX_SERVER_NAME=sdsaasddf1.com`
- `FRONTEND_HTTP_PORT=80`
- `FRONTEND_HTTPS_PORT=443`
- `CORS_ORIGIN=https://sdsaasddf1.com`

### 4.3 Start production stack
```bash
npm run docker:up:prod
```

Behavior:
- Port 80 returns `301` redirect to HTTPS.
- Port 443 serves frontend and proxies `/api` to backend.

### 4.4 One-command deployment script
Ubuntu/Linux:
```bash
chmod +x scripts/deploy-prod.sh
npm run deploy:prod:linux
```

Windows (PowerShell):
```powershell
npm run deploy:prod
```

What this script does:
- validates `.env` required keys
- verifies certificate files exist
- checks Docker daemon
- validates merged compose config
- runs production compose up
- checks backend health and HTTP->HTTPS redirect

## 5. Verification
```bash
npm run typecheck
npm run test
npm run build
```
